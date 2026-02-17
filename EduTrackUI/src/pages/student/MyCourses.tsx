import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { BookOpen, User, Loader2, Phone, Mail, IdCard, GraduationCap, Calendar, Award, Search, Grid3x3, List } from "lucide-react";
import { API_ENDPOINTS, apiGet } from "@/lib/api";

const MyCourses = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [studentInfo, setStudentInfo] = useState<any>(null);
  const [selectedTeacher, setSelectedTeacher] = useState<any>(null);
  const [teacherDialogOpen, setTeacherDialogOpen] = useState(false);
  const [loadingTeacher, setLoadingTeacher] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"list" | "grid">("grid");
  const [sortOption, setSortOption] = useState<string>("code_asc");

  useEffect(() => {
    if (!isAuthenticated || user?.role !== "student") {
      navigate("/auth");
    }
  }, [isAuthenticated, user, navigate]);

  useEffect(() => {
    const fetchCourses = async () => {
      if (!user?.id) return;
      
      try {
        setLoading(true);
        // declarations for values used across this function
        let studentYearLevelNum: number | null = null;
        let studentSectionId: any = null;

        // Fetch student info to get year_level and section_id (use by-user endpoint)
        const studentRes = await apiGet(API_ENDPOINTS.STUDENT_BY_USER(user.id));
        const student = studentRes.data || studentRes.student || studentRes || null;
        
        if (!student) {
          console.error('Student record not found for user:', user.id);
          setCourses([]);
          setLoading(false);
          return;
        }

        // Compute a display-friendly year label for the student (e.g. '2nd Year')
        const ordinal = (n: number) => {
          if (!Number.isFinite(n)) return String(n);
          if (n % 10 === 1 && n % 100 !== 11) return `${n}st Year`;
          if (n % 10 === 2 && n % 100 !== 12) return `${n}nd Year`;
          if (n % 10 === 3 && n % 100 !== 13) return `${n}rd Year`;
          return `${n}th Year`;
        };

        const studentYearLevelRawVal = student.year_level ?? student.yearLevel ?? null;
        let displayYearLabel = 'N/A';
        if (studentYearLevelRawVal != null) {
          if (typeof studentYearLevelRawVal === 'number') displayYearLabel = ordinal(studentYearLevelRawVal);
          else if (typeof studentYearLevelRawVal === 'string') {
            const raw = studentYearLevelRawVal.trim();
            if (/year/i.test(raw)) {
              displayYearLabel = raw; // already contains 'Year'
            } else {
              const m = raw.match(/(\d+)/);
              if (m) displayYearLabel = ordinal(Number(m[1]));
              else if (/^\d+(st|nd|rd|th)$/i.test(raw)) displayYearLabel = `${raw} Year`;
              else displayYearLabel = raw;
            }
          } else {
            displayYearLabel = String(studentYearLevelRawVal);
          }
        }

        // Normalize year level to a numeric value (supports '2nd Year', '2', or 2)
        const studentYearLevelRaw = student.year_level ?? student.yearLevel;
        if (typeof studentYearLevelRaw === 'number') studentYearLevelNum = studentYearLevelRaw;
        else if (typeof studentYearLevelRaw === 'string') {
          const m = String(studentYearLevelRaw).match(/(\d+)/);
          studentYearLevelNum = m ? Number(m[1]) : null;
        }
        studentSectionId = student.section_id || student.sectionId;

        // store student info along with a computed display label and numeric year
        const studentInfoObj: any = { ...student, displayYearLabel, yearLevelNum: studentYearLevelNum };

        // Resolve section details (name, description) for nicer header display
        if (studentSectionId) {
          try {
            const secRes = await apiGet(`${API_ENDPOINTS.SECTIONS}/${encodeURIComponent(studentSectionId)}`);
            const sec = secRes.data || secRes.section || secRes || null;
            if (sec) {
              studentInfoObj.section_name = sec.name || student.section_name || student.sectionName || sec.title || studentInfoObj.section_name;
              studentInfoObj.section_description = sec.description || studentInfoObj.section_description || student.description || sec.desc || '';
            }
          } catch (err) {
            console.warn('Failed to fetch section details for header display', err);
          }
        }

        setStudentInfo(studentInfoObj);

        // Fetch active academic period to get current semester (try public endpoint first)
        let activePeriod = null;
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

        // Extract semester from active period (e.g., "1st Semester" -> "1st")
        const semesterMatch = (activePeriod.semester || '').match(/^(\d+)(st|nd|rd|th)/i);
        const currentSemesterShort = semesterMatch ? (String(semesterMatch[1]) === '1' ? '1st' : '2nd') : null;

        // Build candidate semester params (try short form '1st' then numeric '1')
        const subjectsQueryBase = new URLSearchParams();
        if (studentYearLevelNum) subjectsQueryBase.set('year_level', String(studentYearLevelNum));

        let subjects: any[] = [];

        const semesterCandidates: (string | null)[] = [];
        if (currentSemesterShort) {
          semesterCandidates.push(currentSemesterShort);
          // also try numeric form '1' or '2'
          semesterCandidates.push(currentSemesterShort.startsWith('1') ? '1' : '2');
        } else {
          semesterCandidates.push(null);
        }

        // Try server-side filtered fetches with different semester representations using student-accessible endpoint
        let fetched = false;
        for (const sem of semesterCandidates) {
          try {
            const params = new URLSearchParams(subjectsQueryBase.toString());
            if (sem) params.set('semester', sem);
            console.debug('Trying subjects fetch (student endpoint) with params:', params.toString());
            const subjectsRes = await apiGet(`${API_ENDPOINTS.SUBJECTS_FOR_STUDENT}?${params.toString()}`);
            const rows = subjectsRes.data || subjectsRes.subjects || subjectsRes || [];
            if (Array.isArray(rows) && rows.length > 0) {
              subjects = rows;
              fetched = true;
              break;
            }
            // if returned empty, continue to next candidate
          } catch (err) {
            console.warn('Subjects fetch failed for semester', sem, err);
            // try next candidate
          }
        }

        // If server-side attempts failed or returned empty, try student endpoint without semester
        if (!fetched) {
          try {
            const params = new URLSearchParams();
            if (studentYearLevelNum) params.set('year_level', String(studentYearLevelNum));
            console.debug('Trying subjects fetch (student endpoint) without semester:', params.toString());
            const subjectsRes = await apiGet(`${API_ENDPOINTS.SUBJECTS_FOR_STUDENT}?${params.toString()}`);
            const rows = subjectsRes.data || subjectsRes.subjects || subjectsRes || [];
            console.debug('MyCourses: subjects fetch fallback rows:', rows?.length ?? 0, rows);
            if (Array.isArray(rows)) subjects = rows;
          } catch (err) {
            console.error('Failed to fetch subjects from student endpoint fallback', err);
            subjects = [];
          }
        }

        // Fetch teacher assignments to get teacher info for each subject (use student-accessible endpoint if section_id available)
        let teacherAssignments: any[] = [];
        if (studentSectionId) {
          try {
            const taRes = await apiGet(`${API_ENDPOINTS.TEACHER_ASSIGNMENTS_FOR_STUDENT}?section_id=${encodeURIComponent(studentSectionId)}`);
            teacherAssignments = taRes.data || taRes.assignments || taRes || [];
          } catch (err) {
            console.warn('Failed to fetch teacher assignments for student endpoint, trying fallback', err);
            // Fallback: fetch all and filter locally
            try {
              const taRes = await apiGet(API_ENDPOINTS.TEACHER_ASSIGNMENTS);
              teacherAssignments = taRes.data || taRes.assignments || taRes || [];
            } catch (err2) {
              console.warn('Fallback teacher assignments fetch also failed', err2);
            }
          }
        }

        // Build a fast lookup map from subjectId+sectionId => teacher info
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
              // fallback: map subject alone
              teacherMap.set(`${subjId}_*`, teacherObj);
            }
          });
        }

        // Map subjects to course cards with teacher info using the teacherMap
        const mappedCourses = (Array.isArray(subjects) ? subjects : []).map((subject: any) => {
          const subjId = subject?.id ?? subject?.subject_id ?? null;
          let teacherObj = null;

          if (subjId != null) {
            if (studentSectionId) {
              teacherObj = teacherMap.get(`${subjId}_${studentSectionId}`) || teacherMap.get(`${subjId}_*`);
            }

            if (!teacherObj) {
              // as a last resort, find any teacher for the subject
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
            grade: null // Will be calculated from activities later
          };
        });

        setCourses(mappedCourses);
      } catch (error) {
        console.error('Error fetching courses:', error);
        setCourses([]);
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated && user?.role === 'student') {
      fetchCourses();
    }
  }, [user, isAuthenticated]);

  // Filter courses based on search
  const filteredCourses = courses.filter((course) =>
    course.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.teacher?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Sort courses
  const sortedCourses = [...filteredCourses].sort((a, b) => {
    switch (sortOption) {
      case "code_asc":
        return (a.code || "").localeCompare(b.code || "");
      case "code_desc":
        return (b.code || "").localeCompare(a.code || "");
      case "title_asc":
        return (a.title || "").localeCompare(b.title || "");
      case "title_desc":
        return (b.title || "").localeCompare(a.title || "");
      default:
        return 0;
    }
  });

  const handleViewTeacher = async (teacherId: number | string) => {
    if (!teacherId) {
      // Show a message that teacher info is not available
      setSelectedTeacher({ 
        first_name: 'Not', 
        last_name: 'Assigned',
        email: 'N/A',
        phone: 'N/A',
        employee_id: 'N/A',
        assigned_courses: []
      });
      setTeacherDialogOpen(true);
      return;
    }

    try {
      setLoadingTeacher(true);
      setTeacherDialogOpen(true);
      
      const response = await apiGet(API_ENDPOINTS.TEACHER_BY_ID_PUBLIC(teacherId));
      const teacherData = response.data || response.teacher || response || null;
      
      if (teacherData) {
        setSelectedTeacher(teacherData);
      } else {
        setSelectedTeacher({
          first_name: 'Teacher',
          last_name: 'Information',
          email: 'Not available',
          phone: 'N/A',
          employee_id: 'N/A',
          assigned_courses: []
        });
      }
    } catch (error) {
      console.error('Error fetching teacher details:', error);
      setSelectedTeacher({
        first_name: 'Error',
        last_name: 'Loading',
        email: 'Unable to load teacher information',
        phone: 'N/A',
        employee_id: 'N/A',
        assigned_courses: []
      });
    } finally {
      setLoadingTeacher(false);
    }
  };

  if (!isAuthenticated) return null;

  return (
    <DashboardLayout>
      <div className="p-8 bg-gradient-to-b from-background to-muted/30 min-h-screen">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div>
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              My Subjects
            </h1>
            <p className="text-muted-foreground text-lg">
              {studentInfo ? (
                  studentInfo.yearLevelNum && studentInfo.section_name
                    ? `Maranatha Christian Academy | ${studentInfo.yearLevelNum}-${studentInfo.section_name}`
                    : `${studentInfo.displayYearLabel || (studentInfo.year_level || studentInfo.yearLevel || 'N/A')} - ${studentInfo.section_name || 'Section'}`
                ) : (
                  'View all your enrolled courses'
                )}
            </p>
          </div>
            
          </div>
          
          {/* Quick Stats */}
          {!loading && courses.length > 0 && (
            <div className="grid grid-cols-3 gap-4 mt-6">
              <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50 to-blue-100/50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-blue-500 flex items-center justify-center">
                      <BookOpen className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-blue-700">{courses.length}</p>
                      <p className="text-xs text-blue-600">Enrolled Courses</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-0 shadow-sm bg-gradient-to-br from-purple-50 to-purple-100/50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-purple-500 flex items-center justify-center">
                      <Calendar className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-purple-700">{studentInfo?.displayYearLabel?.match(/\d+/)?.[0] || 'N/A'}</p>
                      <p className="text-xs text-purple-600">Year Level</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-0 shadow-sm bg-gradient-to-br from-emerald-50 to-emerald-100/50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-emerald-500 flex items-center justify-center">
                      <Award className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-emerald-700">{courses.reduce((sum, c) => sum + (c.credits || 0), 0)}</p>
                      <p className="text-xs text-emerald-600">Total Credits</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* Main Card */}
        <Card className="shadow-lg border-0">
          <CardHeader className="bg-gradient-to-r from-muted/50 to-muted border-b pb-6">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl font-bold">
                  {loading ? (
                    <span className="flex items-center gap-2">
                      All Courses ({courses.length})
                      <Loader2 className="h-5 w-5 animate-spin" />
                    </span>
                  ) : (
                    `All Courses (${sortedCourses.length})`
                  )}
                </CardTitle>
                <CardDescription className="text-base">
                  Your enrolled courses for this semester
                </CardDescription>
              </div>
            </div>

            {/* Filters and Controls */}
            <div className="flex items-center gap-3 mt-4 flex-wrap">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="Search courses by name, code, or instructor..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 py-2.5 text-base border-2 focus:border-accent-500 rounded-xl bg-background shadow-sm"
                />
              </div>

              <div className="w-48">
                <Select value={sortOption} onValueChange={setSortOption}>
                  <SelectTrigger className="border-2 rounded-xl px-4 py-2.5 bg-background font-medium shadow-sm">
                    {sortOption === "code_asc" && "Code A → Z"}
                    {sortOption === "code_desc" && "Code Z → A"}
                    {sortOption === "title_asc" && "Title A → Z"}
                    {sortOption === "title_desc" && "Title Z → A"}
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="code_asc">Code A → Z</SelectItem>
                    <SelectItem value="code_desc">Code Z → A</SelectItem>
                    <SelectItem value="title_asc">Title A → Z</SelectItem>
                    <SelectItem value="title_desc">Title Z → A</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setViewMode((v) => (v === "list" ? "grid" : "list"))}
                className="px-4 py-2.5 rounded-xl font-medium border-2 gap-2 shadow-sm hover:bg-accent-50 hover:border-accent-300 transition-all"
                title="Toggle view"
              >
                {viewMode === "grid" ? <Grid3x3 className="h-5 w-5" /> : <List className="h-5 w-5" />}
                <span>{viewMode === "grid" ? "Grid" : "List"}</span>
              </Button>
            </div>
          </CardHeader>

          <CardContent className="p-6">
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <span className="ml-4 text-lg text-muted-foreground">Loading your courses...</span>
              </div>
            ) : sortedCourses.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <BookOpen className="h-16 w-16 text-muted-foreground/30 mb-4" />
                <h3 className="text-xl font-semibold text-muted-foreground mb-2">
                  {searchQuery ? "No Matching Courses" : "No Courses Found"}
                </h3>
                <p className="text-muted-foreground max-w-md">
                  {searchQuery
                    ? "No courses match your search. Try adjusting your filters."
                    : "No courses are available for your year level and the current semester."}
                </p>
              </div>
            ) : viewMode === "grid" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sortedCourses.map((course) => (
                  <div
                    key={course.id}
                    className="rounded-2xl border-2 transition-all duration-300 flex flex-col overflow-hidden bg-white border-gray-200 hover:shadow-lg hover:border-accent-200"
                  >
                    {/* Card Header - Course Info */}
                    <div className="p-5 flex items-start gap-3">
                      <div className="w-14 h-14 rounded-xl flex items-center justify-center shadow-md flex-shrink-0 bg-gradient-to-br from-primary to-accent">
                        <BookOpen className="h-7 w-7 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-base text-gray-900">{course.code}</p>
                        <p className="text-sm text-muted-foreground line-clamp-2">{course.title}</p>
                        {course.semester && (
                          <Badge variant="secondary" className="text-xs mt-2">
                            {course.semester}
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Instructor & Details Section */}
                    <div className="px-5 py-4 bg-blue-50 border-t border-gray-200">
                      <button
                        onClick={() => handleViewTeacher(course.teacherId)}
                        className="w-full flex items-center gap-2 text-sm hover:text-primary transition-colors mb-3 group"
                        disabled={!course.teacherId}
                      >
                        <div className="h-8 w-8 rounded-full bg-primary/10 group-hover:bg-primary/20 flex items-center justify-center flex-shrink-0 transition-colors">
                          <User className="h-4 w-4 text-primary" />
                        </div>
                        <div className="text-left flex-1 min-w-0">
                          <p className="text-xs text-muted-foreground">Instructor</p>
                          <p className="font-medium truncate text-gray-900">{course.teacher}</p>
                        </div>
                      </button>

                      <div className="grid grid-cols-2 gap-2">
                        <div className="text-center p-2 rounded-lg bg-white border border-gray-200">
                          <p className="text-xs text-muted-foreground">Section</p>
                          <p className="font-semibold text-sm text-gray-900">{course.section}</p>
                        </div>
                        <div className="text-center p-2 rounded-lg bg-white border border-gray-200">
                          <p className="text-xs text-muted-foreground">Credits</p>
                          <p className="font-semibold text-sm text-gray-900">{course.credits}</p>
                        </div>
                      </div>
                    </div>

                    {/* Card Actions */}
                    <div className="px-5 py-4 border-t border-gray-200 mt-auto">
                      <Button
                        onClick={() => navigate(`/student/courses/${course.id}`)}
                        className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white shadow-md font-medium"
                      >
                        <BookOpen className="h-4 w-4 mr-2" />
                        View Course
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {sortedCourses.map((course) => (
                  <div
                    key={course.id}
                    className="rounded-2xl border-2 transition-all duration-300 flex items-center justify-between p-4 bg-card border-accent-100 hover:border-accent-300 hover:shadow-md"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-md flex-shrink-0 bg-gradient-to-br from-primary to-accent">
                        <BookOpen className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-semibold text-lg">{course.title}</p>
                          <Badge variant="outline" className="text-xs flex-shrink-0">
                            {course.code}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {course.teacher} • {course.section} • {course.credits} Credits
                          {course.semester && ` • ${course.semester}`}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/student/courses/${course.id}`)}
                        className="gap-1 font-medium hover:bg-accent-50 hover:border-accent-300 transition-all"
                      >
                        <BookOpen className="h-4 w-4" />
                        View Course
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Teacher Details Dialog */}
      <Dialog open={teacherDialogOpen} onOpenChange={setTeacherDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Teacher Information</DialogTitle>
            <DialogDescription>
              Contact details and assigned courses
            </DialogDescription>
          </DialogHeader>
          {loadingTeacher ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : selectedTeacher ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3 pb-4 border-b">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">
                    {selectedTeacher.first_name} {selectedTeacher.last_name}
                  </h3>
                  <p className="text-sm text-muted-foreground">Instructor</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <IdCard className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Employee ID:</span>
                  <span className="font-medium">{selectedTeacher.employee_id || 'N/A'}</span>
                </div>
                
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Email:</span>
                  <a 
                    href={`mailto:${selectedTeacher.email}`}
                    className="font-medium text-primary hover:underline"
                  >
                    {selectedTeacher.email || 'N/A'}
                  </a>
                </div>

                {selectedTeacher.phone && selectedTeacher.phone !== 'N/A' && (
                  <div className="flex items-center gap-3 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Phone:</span>
                    <a 
                      href={`tel:${selectedTeacher.phone}`}
                      className="font-medium text-primary hover:underline"
                    >
                      {selectedTeacher.phone}
                    </a>
                  </div>
                )}
              </div>

              {selectedTeacher.assigned_courses && selectedTeacher.assigned_courses.length > 0 && (
                <div className="pt-4 border-t">
                  <h4 className="font-medium mb-2 text-sm">Assigned Courses</h4>
                  <div className="space-y-1">
                    {selectedTeacher.assigned_courses.map((course: any, index: number) => (
                      <div key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                        <span className="text-primary">•</span>
                        <span>{course.course || course.code} - {course.title || course.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No teacher information available
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default MyCourses;
