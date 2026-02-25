import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookOpen, Loader2, GraduationCap } from "lucide-react";
import { API_ENDPOINTS, apiGet } from "@/lib/api";

const MyGrades = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSY, setActiveSY] = useState<string>("");

  useEffect(() => {
    if (!isAuthenticated || user?.role !== "student") {
      navigate("/auth");
    }
  }, [isAuthenticated, user, navigate]);

  // Fetch student's courses with midterm/finalterm grades
  useEffect(() => {
    const fetchGrades = async () => {
      if (!user?.id) return;
      setLoading(true);

      try {
        // 1) Fetch student info to get year_level and section_id
        const studentRes = await apiGet(API_ENDPOINTS.STUDENT_BY_USER(user.id));
        const student = studentRes.data || studentRes.student || studentRes || null;
        
        if (!student) {
          console.error('Student record not found for user:', user.id);
          setCourses([]);
          setLoading(false);
          return;
        }

        // Normalize year_level to numeric value (supports '2nd Year', '2', or 2)
        let studentYearLevelNum: number | null = null;
        const studentYearLevelRaw = student.year_level ?? student.yearLevel;
        if (typeof studentYearLevelRaw === 'number') studentYearLevelNum = studentYearLevelRaw;
        else if (typeof studentYearLevelRaw === 'string') {
          const m = String(studentYearLevelRaw).match(/(\d+)/);
          studentYearLevelNum = m ? Number(m[1]) : null;
        }

        const studentSectionId = student.section_id || student.sectionId;

        // 2) Fetch active academic period to determine current semester
        let activePeriod: any = null;
        try {
          const activePeriodRes = await apiGet(`${API_ENDPOINTS.ACADEMIC_PERIODS_ACTIVE}-public`);
          activePeriod = activePeriodRes.data || activePeriodRes.period || activePeriodRes || null;
        } catch (err) {
          console.warn('Failed to fetch active period from public endpoint, trying authenticated endpoint', err);
          try {
            const activePeriodRes = await apiGet(API_ENDPOINTS.ACADEMIC_PERIODS_ACTIVE);
            activePeriod = activePeriodRes.data || activePeriodRes.period || activePeriodRes || null;
          } catch (err2) {
            console.error('Failed to fetch active period', err2);
          }
        }
        
        if (!activePeriod) {
          console.warn('No active academic period found');
          setCourses([]);
          setLoading(false);
          return;
        }

        // Store active school year for display
        if (activePeriod.school_year) {
          setActiveSY(activePeriod.school_year);
        }

        // Extract semester from active period (e.g., "1st Semester" -> "1st")
        const semesterMatch = (activePeriod.semester || '').match(/^(\d+)(st|nd|rd|th)/i);
        const currentSemesterShort = semesterMatch ? (String(semesterMatch[1]) === '1' ? '1st' : '2nd') : null;

        // 3) Fetch all academic periods (to find midterm/finalterm for current year/semester)
        let allPeriods: any[] = [];
        try {
          const periodsRes = await apiGet(API_ENDPOINTS.ACADEMIC_PERIODS);
          allPeriods = periodsRes.data || periodsRes || [];
        } catch (err) {
          console.warn('Failed to fetch academic periods', err);
        }

        // 4) Fetch subjects using student-accessible endpoint with year_level and semester filtering
        const subjectsQueryBase = new URLSearchParams();
        if (studentYearLevelNum) subjectsQueryBase.set('year_level', String(studentYearLevelNum));

        let subjects: any[] = [];
        const semesterCandidates: (string | null)[] = [];
        if (currentSemesterShort) {
          semesterCandidates.push(currentSemesterShort);
          semesterCandidates.push(currentSemesterShort.startsWith('1') ? '1' : '2');
        } else {
          semesterCandidates.push(null);
        }

        // Try server-side filtered fetches with different semester representations
        let fetched = false;
        for (const sem of semesterCandidates) {
          try {
            const params = new URLSearchParams(subjectsQueryBase.toString());
            if (sem) params.set('semester', sem);
            console.debug('Trying subjects fetch with params:', params.toString());
            const subjectsRes = await apiGet(`${API_ENDPOINTS.SUBJECTS_FOR_STUDENT}?${params.toString()}`);
            const rows = subjectsRes.data || subjectsRes.subjects || subjectsRes || [];
            if (Array.isArray(rows) && rows.length > 0) {
              subjects = rows;
              fetched = true;
              break;
            }
          } catch (err) {
            console.warn('Subjects fetch failed for semester', sem, err);
          }
        }

        // Fallback: try without semester
        if (!fetched) {
          try {
            const params = new URLSearchParams();
            if (studentYearLevelNum) params.set('year_level', String(studentYearLevelNum));
            console.debug('Trying subjects fetch without semester:', params.toString());
            const subjectsRes = await apiGet(`${API_ENDPOINTS.SUBJECTS_FOR_STUDENT}?${params.toString()}`);
            const rows = subjectsRes.data || subjectsRes.subjects || subjectsRes || [];
            if (Array.isArray(rows)) subjects = rows;
          } catch (err) {
            console.error('Failed to fetch subjects fallback', err);
            subjects = [];
          }
        }

        // 5) Fetch teacher assignments to get teacher info for each subject
        let teacherAssignments: any[] = [];
        if (studentSectionId) {
          try {
            const taRes = await apiGet(`${API_ENDPOINTS.TEACHER_ASSIGNMENTS_FOR_STUDENT}?section_id=${encodeURIComponent(studentSectionId)}`);
            teacherAssignments = taRes.data || taRes.assignments || taRes || [];
          } catch (err) {
            console.warn('Failed to fetch teacher assignments for student endpoint, trying fallback', err);
            try {
              const taRes = await apiGet(API_ENDPOINTS.TEACHER_ASSIGNMENTS);
              teacherAssignments = taRes.data || taRes.assignments || taRes || [];
            } catch (err2) {
              console.warn('Fallback teacher assignments fetch also failed', err2);
            }
          }
        }

        // Build a lookup map from subjectId+sectionId => teacher info
        const teacherMap = new Map<string, any>();
        if (Array.isArray(teacherAssignments)) {
          teacherAssignments.forEach((ta: any) => {
            const subjId = ta?.subject?.id ?? ta?.subject_id ?? ta?.subjectId ?? null;
            const teacherObj = {
              id: ta?.teacher_id ?? ta?.teacher?.id ?? null,
              first_name: ta?.teacher?.first_name ?? ta?.teacher?.firstName ?? null,
              last_name: ta?.teacher?.last_name ?? ta?.teacher?.lastName ?? null,
              name: ta?.teacher_name ?? (ta?.teacher?.first_name && ta?.teacher?.last_name ? `${ta.teacher.first_name} ${ta.teacher.last_name}` : null)
            };

            const sections = ta?.sections ?? [];
            if (Array.isArray(sections) && sections.length > 0) {
              sections.forEach((s: any) => {
                const sid = s?.id ?? s?.section_id ?? s ?? null;
                if (subjId != null && sid != null) {
                  teacherMap.set(`${subjId}_${sid}`, teacherObj);
                }
              });
            } else if (subjId != null) {
              teacherMap.set(`${subjId}_*`, teacherObj);
            }
          });
        }

        // 6) Build course objects from subjects with teacher info
        const coursesList = (Array.isArray(subjects) ? subjects : []).map((subject: any) => {
          const subjId = subject?.id ?? subject?.subject_id ?? null;
          let teacherObj = null;

          if (subjId != null) {
            if (studentSectionId) {
              teacherObj = teacherMap.get(`${subjId}_${studentSectionId}`) || teacherMap.get(`${subjId}_*`);
            }

            if (!teacherObj) {
              for (const [key, val] of teacherMap.entries()) {
                if (key.startsWith(`${subjId}_`)) { teacherObj = val; break; }
              }
            }
          }

          const teacherName = teacherObj?.name ?? (teacherObj?.first_name && teacherObj?.last_name ? `${teacherObj.first_name} ${teacherObj.last_name}` : 'TBA');
          const teacherId = teacherObj?.id ?? null;

          return {
            id: subject.id,
            title: subject.course_name || subject.title || subject.name || 'Untitled Course',
            code: subject.course_code || subject.code || 'N/A',
            teacher: teacherName,
            teacherId: teacherId,
            section: student.section_name || studentSectionId || 'N/A',
            credits: subject.units || subject.credits || 3,
            semester: subject.semester || currentSemesterShort || 'N/A',
            yearLevel: subject.year_level ?? subject.yearLevel ?? studentYearLevelRaw ?? 'N/A',
            subjectId: subjId
          };
        });

        // 7) Fetch academic periods and build grade-period mappings per course
        // Find midterm/finalterm for current school year and semester
        const courseSchoolYear = activePeriod?.school_year || '2025-2026';
        const courseSemester = activePeriod?.semester || '1st Semester';

        const midtermPeriod = allPeriods.find(
          (p: any) => p.school_year === courseSchoolYear && p.semester === courseSemester && p.period_type === 'Midterm'
        );
        const finaltermPeriod = allPeriods.find(
          (p: any) => p.school_year === courseSchoolYear && p.semester === courseSemester && p.period_type === 'Final Term'
        );

        // 8) Bulk-fetch activities for the relevant academic periods
        const periodIdSet = new Set<number>();
        if (midtermPeriod?.id) periodIdSet.add(midtermPeriod.id);
        if (finaltermPeriod?.id) periodIdSet.add(finaltermPeriod.id);

        const activitiesByPeriod: Record<number, any[]> = {};
        for (const pid of Array.from(periodIdSet)) {
          try {
            const res = await apiGet(`${API_ENDPOINTS.ACTIVITIES_STUDENT_ALL}?student_id=${student.id}&academic_period_id=${pid}`);
            activitiesByPeriod[pid] = res.data || [];
          } catch (err) {
            console.warn(`Failed to fetch activities for period ${pid}`, err);
            activitiesByPeriod[pid] = [];
          }
        }

        // 9) Compute grades per course using bulk-fetched activities
        const coursesWithGrades = coursesList.map((course: any) => {
          const computeGradeFromActivities = (acts: any[] | undefined) => {
            if (!acts || acts.length === 0) return null;
            let totalScore = 0;
            let totalMaxScore = 0;

            // match activities to course by checking multiple possible id fields
            const courseIdsToMatch = [course.subjectId, course.id].filter((v) => v !== undefined && v !== null).map(String);

            for (const a of acts) {
              const actIdCandidates = [
                a.course_id,
                a.subject_id,
                a.teacher_subject_id,
                a.subject?.id,
                a.course?.id
              ].filter((v) => v !== undefined && v !== null).map(String);

              const matched = actIdCandidates.some((id) => courseIdsToMatch.includes(id));
              if (!matched) continue;

              const g = a.student_grade ?? a.grade ?? a.score ?? null;
              if (g !== null && g !== undefined) {
                totalScore += Number(g);
                totalMaxScore += Number(a.max_score ?? a.maxScore ?? 100);
              }
            }

            if (totalMaxScore > 0) {
              const percentage = Math.round((totalScore / totalMaxScore) * 100);
              return { score: totalScore, maxScore: totalMaxScore, percentage };
            }
            return null;
          };

          const midTermActs = midtermPeriod?.id ? activitiesByPeriod[midtermPeriod.id] : [];
          const finalTermActs = finaltermPeriod?.id ? activitiesByPeriod[finaltermPeriod.id] : [];

          const midtermGrade = computeGradeFromActivities(midTermActs);
          const finaltermGrade = computeGradeFromActivities(finalTermActs);

          return {
            id: course.id,
            code: course.code,
            title: course.title,
            teacher: course.teacher,
            midtermGrade,
            finaltermGrade,
            overallGrade: midtermGrade && finaltermGrade ? Math.round(((midtermGrade.percentage + finaltermGrade.percentage) / 2)) : midtermGrade?.percentage || finaltermGrade?.percentage || 0
          };
        });

        setCourses(coursesWithGrades);
      } catch (e) {
        console.error('Failed to load grades', e);
        setCourses([]);
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated && user?.role === 'student') {
      fetchGrades();
    }
  }, [user, isAuthenticated]);

  if (!isAuthenticated) return null;

  const QUARTERS = [
    { label: "Q1", full: "1st Quarter" },
    { label: "Q2", full: "2nd Quarter" },
    { label: "Q3", full: "3rd Quarter" },
    { label: "Q4", full: "4th Quarter" },
  ] as const;

  // TODO: replace with real API data once grade school grading backend is ready
  const MOCK_QUARTER_GRADES: Record<number, [number, number, number, number]> = {
    0: [96, 94, 97, 95],
    1: [92, 90, 93, 91],
    2: [88, 91, 89, 90],
    3: [95, 97, 96, 98],
    4: [85, 87, 86, 88],
    5: [93, 91, 94, 92],
    6: [78, 82, 80, 83],
    7: [97, 95, 96, 98],
  };

  const getGradeColor = (g: number) =>
    g >= 90
      ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-400/30"
      : g >= 75
      ? "bg-sky-500/15 text-sky-700 dark:text-sky-400 border border-sky-400/30"
      : "bg-red-500/15 text-red-600 dark:text-red-400 border border-red-400/30";

  const getAvg = (grades: [number, number, number, number]) =>
    Math.round(grades.reduce((s, g) => s + g, 0) / 4);

  return (
    <DashboardLayout>
      <div className="p-4 sm:p-6 lg:p-8 bg-gradient-to-b from-background to-muted/30 min-h-screen">
        <div className="max-w-2xl mx-auto">

        {/* Page Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-sm">
              <GraduationCap className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold leading-tight">My Grades</h1>
              <p className="text-sm text-muted-foreground">Academic Report Card</p>
            </div>
          </div>
        </div>

        {/* Report Card */}
        <Card className="border shadow-sm">
          {/* Report Card Header */}
          <CardHeader className="pb-3 border-b bg-muted/30">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <CardTitle className="text-base sm:text-lg">Report Card</CardTitle>
                <CardDescription className="text-xs sm:text-sm mt-0.5">
                  Final grades per quarter
                </CardDescription>
              </div>
              <Badge variant="outline" className="self-start sm:self-center text-xs px-2 py-1">
                {activeSY ? `School Year ${activeSY}` : "Loading..."}
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                <span className="ml-2 text-muted-foreground text-sm">Loading grades...</span>
              </div>
            ) : courses.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center px-4">
                <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mb-3">
                  <BookOpen className="h-7 w-7 text-muted-foreground/50" />
                </div>
                <p className="font-medium text-muted-foreground">No subjects found</p>
                <p className="text-xs text-muted-foreground/70 mt-1">Grades will appear here once subjects are enrolled</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full table-fixed text-sm">
                  <colgroup>
                    {/* Subject column takes remaining space */}
                    <col className="w-[45%]" />
                    {/* Q1–Q4 each 11% */}
                    <col className="w-[11%]" />
                    <col className="w-[11%]" />
                    <col className="w-[11%]" />
                    <col className="w-[11%]" />
                    {/* Final 11% */}
                    <col className="w-[11%]" />
                  </colgroup>
                  <thead>
                    <tr className="border-b bg-muted/20">
                      <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide">
                        Subject
                      </th>
                      {QUARTERS.map((q) => (
                        <th
                          key={q.full}
                          className="text-center py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide"
                          title={q.full}
                        >
                          {q.label}
                        </th>
                      ))}
                      <th className="text-center py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide">
                        Avg
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {courses.map((course, index) => {
                      const qGrades = MOCK_QUARTER_GRADES[index] ?? null;
                      const avg = qGrades ? getAvg(qGrades) : null;
                      return (
                      <tr
                        key={index}
                        className="hover:bg-muted/10 transition-colors"
                      >
                        <td className="px-4 py-3">
                          <p className="font-medium text-foreground text-sm leading-tight truncate">{course.title}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{course.code}</p>
                        </td>

                        {/* Q1–Q4 grades */}
                        {QUARTERS.map((q, qi) => (
                          <td key={q.full} className="text-center py-3">
                            {qGrades ? (
                              <span className={`inline-flex items-center justify-center w-9 h-7 rounded-md text-xs font-semibold ${getGradeColor(qGrades[qi])}`}>
                                {qGrades[qi]}
                              </span>
                            ) : (
                              <span className="inline-flex items-center justify-center w-9 h-7 rounded-md text-xs font-medium text-muted-foreground/40 bg-muted/30">
                                —
                              </span>
                            )}
                          </td>
                        ))}

                        {/* Average */}
                        <td className="text-center py-3">
                          {avg !== null ? (
                            <span className={`inline-flex items-center justify-center w-9 h-7 rounded-md text-xs font-bold ${getGradeColor(avg)}`}>
                              {avg}
                            </span>
                          ) : (
                            <span className="inline-flex items-center justify-center w-9 h-7 rounded-md text-xs font-semibold text-muted-foreground/40 bg-muted/40">
                              —
                            </span>
                          )}
                        </td>
                      </tr>
                      );
                    })}
                  </tbody>
                </table>

                {/* Legend */}
                <div className="flex flex-wrap gap-x-4 gap-y-1.5 px-4 py-3 border-t bg-muted/10 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5 whitespace-nowrap">
                    <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500/20 border border-emerald-500/40 inline-block flex-shrink-0" />
                    Passing (75+)
                  </span>
                  <span className="flex items-center gap-1.5 whitespace-nowrap">
                    <span className="w-2.5 h-2.5 rounded-sm bg-red-500/20 border border-red-500/40 inline-block flex-shrink-0" />
                    Failing (&lt;75)
                  </span>
                  <span className="flex items-center gap-1.5 whitespace-nowrap">
                    <span className="w-2.5 h-2.5 rounded-sm bg-muted border border-border inline-block flex-shrink-0" />
                    Not yet graded
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default MyGrades;
