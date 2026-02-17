import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Bell, Award, TrendingUp, ClipboardList, Calendar, QrCode, Settings, MessageSquare, ChevronRight, FileText, CreditCard } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { DashboardLayout } from "@/components/DashboardLayout";
import { API_ENDPOINTS, apiGet } from "@/lib/api";
import { useNotificationContext } from "@/context/NotificationContext";
import { NotificationBell } from "@/components/NotificationBell";
import { useEffect, useState } from "react";

const StudentDashboard = () => {
  const { user } = useAuth();
  const { notifications, addNotification } = useNotificationContext();
  const [courses, setCourses] = useState<any[]>([]);
  const [recentGrades, setRecentGrades] = useState<any[]>([]);
  const [courseStats, setCourseStats] = useState<{ averageGrade: number; overallProgress: number }>({ averageGrade: 0, overallProgress: 0 });
  const [hasOpenEnrollmentPeriod, setHasOpenEnrollmentPeriod] = useState<boolean | null>(null);
  const [activePeriodInfo, setActivePeriodInfo] = useState<any>(null);
  const [studentEnrollment, setStudentEnrollment] = useState<any>(null);
  const [studentRecord, setStudentRecord] = useState<any>(null);

  const sidebarNotifications = [
    { id: 1, message: "New assignment posted in Mathematics 101", time: "2 hours ago" },
    { id: 2, message: "Grade updated for Physics Lab Report", time: "1 day ago" },
  ];

  // Fetch announcements and add to global notifications (once)
  useEffect(() => {
    let mounted = true;
    const loadAnnouncements = async () => {
      try {
        const res = await apiGet(API_ENDPOINTS.ANNOUNCEMENTS);
        const list = res.data ?? res.announcements ?? res ?? [];

        const existingMsg = new Set(sidebarNotifications.map((n: any) => n.message));
        const existingIds = new Set<string | number>();
        // Include already-added global notification sourceIds and messages
        notifications.forEach((n: any) => {
          if (n.sourceId) existingIds.add(String(n.sourceId));
          if (n.message) existingMsg.add(n.message);
        });

        const matchesAudience = (aud: string | null | undefined) => {
          const role = user?.role ?? '';
          if (!aud) return true;
          const a = String(aud).toLowerCase();
          if (a === 'all') return true;
          if (role === 'student' && (a === 'students' || a === 'student')) return true;
          if (role === 'teacher' && (a === 'teachers' || a === 'teacher')) return true;
          if (role === 'admin') return true;
          return false;
        };

        (Array.isArray(list) ? list : []).forEach((a: any) => {
          if (!mounted) return;
          if (!matchesAudience(a.audience)) return;
          const msg = a.title ? `${a.title}: ${a.message ?? ''}` : (a.message ?? '');
          const sid = a.id ?? a._id ?? null;
          if (sid && existingIds.has(String(sid))) return; // already added
          if (!sid && existingMsg.has(msg)) return; // dedupe by message if no id

          // attach full announcement as meta and keep it persistent
          addNotification({ type: 'info', message: msg, duration: 0, meta: a, sourceId: sid, displayToast: false });
          if (sid) existingIds.add(String(sid));
          existingMsg.add(msg);
        });
      } catch (e) {
        // ignore fetch errors on dashboard
      }
    };

    loadAnnouncements();
    return () => { mounted = false; };
  }, []);

  /**
   * Check if there's an open enrollment period
   */
  useEffect(() => {
    const checkEnrollmentPeriod = async () => {
      try {
        // Fetch the active enrollment period
        const response = await apiGet('/api/enrollment-periods/active');
        
        if (response.success && response.data) {
          // Check if the enrollment period status is "Open"
          const isOpen = response.data.status === 'Open' || response.data.enrollment_open === true;
          setHasOpenEnrollmentPeriod(isOpen);
          if (isOpen) {
            setActivePeriodInfo(response.data);
          }
        } else if (response.data && response.data.status === 'Open') {
          setHasOpenEnrollmentPeriod(true);
          setActivePeriodInfo(response.data);
        } else {
          setHasOpenEnrollmentPeriod(false);
        }
      } catch (error) {
        console.error('Error checking enrollment period:', error);
        setHasOpenEnrollmentPeriod(false);
      }
    };
    
    checkEnrollmentPeriod();
  }, []);

  /**
   * Check if student has already enrolled in the current period
   */
  useEffect(() => {
    const checkStudentEnrollment = async () => {
      try {
        const enrollmentResponse = await apiGet(API_ENDPOINTS.ENROLLMENTS);
        
        // Get enrollment data from response
        let enrollmentsArray: any[] = [];
        if (Array.isArray(enrollmentResponse.data)) {
          enrollmentsArray = enrollmentResponse.data;
        } else if (enrollmentResponse.data && Array.isArray(enrollmentResponse.data.data)) {
          enrollmentsArray = enrollmentResponse.data.data;
        } else if (enrollmentResponse.data && enrollmentResponse.data.data && enrollmentResponse.data.data.id) {
          enrollmentsArray = [enrollmentResponse.data.data];
        } else if (enrollmentResponse.data && enrollmentResponse.data.id) {
          enrollmentsArray = [enrollmentResponse.data];
        }

        let currentActiveEnrollment = null;

        // If there's an open enrollment period, we prioritize showing status for THAT specific period
        if (activePeriodInfo?.id) {
          currentActiveEnrollment = enrollmentsArray.find((e: any) => 
            String(e.enrollment_period_id) === String(activePeriodInfo.id) &&
            e.status !== "Rejected"
          );
          console.log('Enrollment found for the open re-enrollment period:', currentActiveEnrollment);
          
          // Note: If currentActiveEnrollment is null here, it means the student has NOT yet 
          // applied for the open period, so the dashboard will show the "Enrollment is Open" card.
        } else {
          // If no enrollment period is currently open (regular school days), 
          // show the record for the student's current active enrollment.
          currentActiveEnrollment = enrollmentsArray.find((e: any) => 
            e.status !== "Rejected" && e.status !== "Pending"
          );
          console.log('No open enrollment period. Showing last active record:', currentActiveEnrollment);
        }
        
        setStudentEnrollment(currentActiveEnrollment || null);
      } catch (error) {
        console.error('Error checking student enrollment:', error);
        setStudentEnrollment(null);
      }
    };
    
    checkStudentEnrollment();
  }, [activePeriodInfo]);

  // Load dashboard data: student -> subjects -> activities/grades
  useEffect(() => {
    let mounted = true;

    const loadDashboard = async () => {
      try {
        const userId = (user as any)?.id ?? (user as any)?.user_id ?? (user as any)?.userId;
        if (!userId) return;

        // Get student record for this user
        const studentRes = await apiGet(API_ENDPOINTS.STUDENT_BY_USER(userId));
        const student = (studentRes && (studentRes.data ?? studentRes.student)) || studentRes || null;
        if (mounted) setStudentRecord(student);
        const studentId = student?.id ?? student?.student_id ?? student?.studentId;

        // Fetch active academic period to get current semester (reuse logic from MyCourses)
        let activePeriod = null;
        try {
          const ap = await apiGet(API_ENDPOINTS.ACADEMIC_PERIODS_ACTIVE);
          activePeriod = ap.data || ap.period || ap || null;
        } catch (err) {
          // ignore
        }

        const studentYearLevelRaw = student.year_level ?? student.yearLevel ?? null;
        let studentYearLevelNum: number | null = null;
        if (typeof studentYearLevelRaw === 'number') studentYearLevelNum = studentYearLevelRaw;
        else if (typeof studentYearLevelRaw === 'string') {
          const m = String(studentYearLevelRaw).match(/(\d+)/);
          studentYearLevelNum = m ? Number(m[1]) : null;
        }

        const semesterMatch = (activePeriod?.semester || '').match(/^(\d+)(st|nd|rd|th)/i);
        const currentSemesterShort = semesterMatch ? (String(semesterMatch[1]) === '1' ? '1st' : '2nd') : null;

        // Try filtered subject fetches similar to MyCourses
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

        let fetchedSubjects = false;
        for (const sem of semesterCandidates) {
          try {
            const params = new URLSearchParams(subjectsQueryBase.toString());
            if (sem) params.set('semester', sem);
            const subjectsRes = await apiGet(`${API_ENDPOINTS.SUBJECTS_FOR_STUDENT}?${params.toString()}`);
            const rows = subjectsRes.data || subjectsRes.subjects || subjectsRes || [];
            console.debug('StudentDashboard: subjects fetch', params.toString(), rows?.length ?? 0);
            if (Array.isArray(rows) && rows.length > 0) {
              subjects = rows;
              fetchedSubjects = true;
              break;
            }
          } catch (err) {
            // try next candidate
          }
        }

        if (!fetchedSubjects) {
          try {
            const params = new URLSearchParams();
            if (studentYearLevelNum) params.set('year_level', String(studentYearLevelNum));
            const subjectsRes = await apiGet(`${API_ENDPOINTS.SUBJECTS_FOR_STUDENT}?${params.toString()}`);
            const rows = subjectsRes.data || subjectsRes.subjects || subjectsRes || [];
            subjects = Array.isArray(rows) ? rows : [];
            console.debug('StudentDashboard: fallback subjects fetch', rows?.length ?? 0);
          } catch (err) {
            subjects = [];
          }
        }

        // Map subjects into the UI shape (prefer course_name)
        const mappedCourses = (Array.isArray(subjects) ? subjects : []).map((s: any) => ({
          id: s.id ?? s.subject_id,
          name: s.course_name ?? s.title ?? s.name ?? '',
          code: s.course_code ?? s.code ?? '',
          teacher: s.teacher_name ?? (s.teacher && s.teacher.name) ?? '',
          grade: s.average_grade ?? s.avg_grade ?? null,
          progress: s.progress ?? 0,
          status: 'active',
        }));

        if (mounted) setCourses(mappedCourses);

        // Fetch activities + grades for student (recent)
        const activitiesRes = await apiGet(`${API_ENDPOINTS.ACTIVITIES_STUDENT_ALL}?student_id=${studentId}`);
        const activities = (activitiesRes && (activitiesRes.data ?? activitiesRes.activities)) || activitiesRes || [];

        const recent = (Array.isArray(activities) ? activities : [])
          .slice(0, 10)
          .map((a: any) => ({
            activity: a.title ?? a.name ?? a.activity ?? a.activity_title,
            course: a.subject_name ?? (a.subject && a.subject.name) ?? a.course_name ?? '',
            grade: a.grade ?? a.student_grade ?? a.score ?? 0,
            date: a.date ?? a.created_at ?? a.submitted_at ?? a.timestamp,
          }));

        if (mounted) setRecentGrades(recent);

        // Aggregate activities per course to compute per-course grade and progress
        const courseAgg: Record<string, {
          course_id?: number;
          course_name?: string;
          totalActivities: number;
          completedCount: number;
          totalScoreObtained: number;
          totalMaxScore: number;
        }> = {};

        (Array.isArray(activities) ? activities : []).forEach((a: any) => {
          const cid = a.course_id ?? a.subject_id ?? a.courseId ?? a.id ?? null;
          const cname = a.course_name ?? a.subject_name ?? a.course ?? '';
          const key = String(cid || cname || 'unknown');
          if (!courseAgg[key]) courseAgg[key] = { course_id: cid, course_name: cname, totalActivities: 0, completedCount: 0, totalScoreObtained: 0, totalMaxScore: 0 };
          courseAgg[key].totalActivities += 1;
          const hasGrade = a.student_grade !== null && a.student_grade !== undefined;
          if (hasGrade) {
            courseAgg[key].completedCount += 1;
            // If activity provides max_score and student_grade, accumulate percent-equivalent
            const got = Number(a.student_grade) || 0;
            const max = Number(a.max_score) || 0;
            if (max > 0) {
              courseAgg[key].totalScoreObtained += got;
              courseAgg[key].totalMaxScore += max;
            } else {
              // fallback: treat grade as percent already
              courseAgg[key].totalScoreObtained += got;
              courseAgg[key].totalMaxScore += 100;
            }
          }
        });

        // Enrich mappedCourses with computed grade and progress from activities
        const mappedWithStats = mappedCourses.map((mc: any) => {
          const keyById = String(mc.id ?? mc.code ?? mc.name);
          const agg = courseAgg[keyById] || courseAgg[String(mc.name)] || null;
          let gradeVal: number | null = null;
          let progressVal = 0;
          if (agg) {
            if (agg.totalMaxScore > 0) {
              gradeVal = Math.round((agg.totalScoreObtained / agg.totalMaxScore) * 100 * 10) / 10;
            }
            progressVal = agg.totalActivities > 0 ? Math.round((agg.completedCount / agg.totalActivities) * 100) : 0;
          }
          return { ...mc, grade: gradeVal, progress: progressVal };
        });

        if (mounted) setCourses(mappedWithStats);

        // Compute simple overall stats using enriched courses (ignore null grades)
        if (mounted) {
          const graded = mappedWithStats.filter((c: any) => c.grade !== null && c.grade !== undefined);
          const avg = (graded.length > 0) ? graded.reduce((s: number, c: any) => s + Number(c.grade || 0), 0) / graded.length : 0;
          const prog = (mappedWithStats.length > 0) ? Math.round(mappedWithStats.reduce((s: number, c: any) => s + (Number(c.progress) || 0), 0) / mappedWithStats.length) : 0;
          setCourseStats({ averageGrade: Math.round((avg + Number.EPSILON) * 10) / 10, overallProgress: prog });
        }
      } catch (e) {
        // ignore errors silently for now
      }
    };

    loadDashboard();
    return () => { mounted = false; };
  }, [user]);

  // Quick access links for student
  const quickLinks = [
    { name: "My Enrollments", href: "/enrollment/my-enrollments", icon: FileText, description: "View your enrollments", color: "bg-primary/10 text-primary" },
    { name: "Payments", href: "/enrollment/payment", icon: CreditCard, description: "View payments", color: "bg-accent/10 text-accent" },
    { name: "Settings", href: "/student/settings", icon: Settings, description: "Account settings", color: "bg-warning/10 text-warning" },
    { name: "Notifications", href: "/student/notifications", icon: Bell, description: "View announcements", color: "bg-purple-100 text-purple-600" },
  ];
  const quickActions = [
    { name: "My Courses", href: "/student/courses", icon: BookOpen },
    { name: "My Grades", href: "/student/grades", icon: Award },
    { name: "My Activities", href: "/student/activities", icon: ClipboardList },
    { name: "My Enrollments", href: "/enrollment/my-enrollments", icon: FileText },
    { name: "Payments", href: "/enrollment/payment", icon: CreditCard },
  ];
  const isProd = import.meta.env.MODE === 'production';
  const quickActionsToShow = isProd
    ? quickActions.filter((action) => action.name === "My Enrollments" || action.name === "Payments")
    : quickActions;

  return (
    <DashboardLayout>
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Maranatha Christian Academy</Link>
            <Badge className="bg-accent text-accent-foreground">Student {studentRecord?.student_id ?? studentRecord?.id ?? 'MCAF2026-0001'}</Badge>
          </div>
          <div className="flex items-center gap-4">
            <NotificationBell />
            <Link to="/student/settings" className="text-muted-foreground hover:text-primary">
              <Settings className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </header>
      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Welcome back, {user?.name}!</h1>
          <p className="text-muted-foreground">Track your courses and academic progress</p>
        </div>

        {/* Stats Cards */}
        {!isProd && (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <BookOpen className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Active Courses</p>
                  <p className="text-2xl font-bold">{courses.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-success/10 flex items-center justify-center">
                  <Award className="h-6 w-6 text-success" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Average Grade</p>
                  <p className="text-2xl font-bold">{courseStats.averageGrade}%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Overall Progress</p>
                  <p className="text-2xl font-bold">{courseStats.overallProgress}%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center">
                  <ClipboardList className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Activities</p>
                  <p className="text-2xl font-bold">{recentGrades.length}</p>
                  <p className="text-xs text-muted-foreground">recent</p>
                </div>
              </div>
            </CardContent>
          </Card>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Enrollment Status or Open Notice */}
            {hasOpenEnrollmentPeriod !== null && (hasOpenEnrollmentPeriod || studentEnrollment) && (
              <>
                {studentEnrollment ? (
                  <Card className={`border-2 ${
                    studentEnrollment.status === 'Approved'
                      ? 'border-blue-300 bg-gradient-to-r from-blue-50 to-cyan-50'
                      : studentEnrollment.status === 'Under Review'
                      ? 'border-yellow-300 bg-gradient-to-r from-yellow-50 to-amber-50'
                      : studentEnrollment.status === 'Incomplete'
                      ? 'border-orange-300 bg-gradient-to-r from-orange-50 to-red-50'
                      : 'border-gray-300 bg-gradient-to-r from-gray-50 to-slate-50'
                  }`}>
                    <CardHeader className="pb-3">
                      <div className="flex items-start gap-4">
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${
                          studentEnrollment.status === 'Approved'
                            ? 'bg-blue-100'
                            : studentEnrollment.status === 'Under Review'
                            ? 'bg-yellow-100'
                            : studentEnrollment.status === 'Incomplete'
                            ? 'bg-orange-100'
                            : 'bg-gray-200'
                        }`}>
                          <Calendar className={`h-6 w-6 ${
                            studentEnrollment.status === 'Approved'
                              ? 'text-blue-600'
                              : studentEnrollment.status === 'Under Review'
                              ? 'text-yellow-600'
                              : studentEnrollment.status === 'Incomplete'
                              ? 'text-orange-600'
                              : 'text-gray-600'
                          }`} />
                        </div>
                        <div className="flex-1">
                          <CardTitle className={
                            studentEnrollment.status === 'Approved'
                              ? 'text-blue-900'
                              : studentEnrollment.status === 'Under Review'
                              ? 'text-yellow-900'
                              : studentEnrollment.status === 'Incomplete'
                              ? 'text-orange-900'
                              : 'text-gray-800'
                          }>
                            Enrollment Status: {studentEnrollment.status}
                          </CardTitle>
                          <CardDescription className={
                            studentEnrollment.status === 'Approved'
                              ? 'text-blue-700'
                              : studentEnrollment.status === 'Under Review'
                              ? 'text-yellow-700'
                              : studentEnrollment.status === 'Incomplete'
                              ? 'text-orange-700'
                              : 'text-gray-600'
                          }>
                            {studentEnrollment.status === 'Approved'
                              ? 'Your enrollment has been approved for the upcoming academic year.'
                              : studentEnrollment.status === 'Under Review'
                              ? 'Your enrollment is currently being reviewed. Please wait for approval.'
                              : studentEnrollment.status === 'Incomplete'
                              ? 'Please complete your enrollment application to proceed.'
                              : 'Your enrollment has been recorded.'}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4 pt-2">
                      <p className={`text-sm ${
                        studentEnrollment.status === 'Approved'
                          ? 'text-blue-800'
                          : studentEnrollment.status === 'Under Review'
                          ? 'text-yellow-800'
                          : studentEnrollment.status === 'Incomplete'
                          ? 'text-orange-800'
                          : 'text-gray-700'
                      }`}>
                        {studentEnrollment.status === 'Approved'
                          ? 'Your enrollment has been approved. You are all set for the upcoming academic year. You can now view your class schedule.'
                          : studentEnrollment.status === 'Under Review'
                          ? 'Your enrollment documents are being reviewed. This may take a few days. Please check back soon.'
                          : studentEnrollment.status === 'Incomplete'
                          ? 'Complete your enrollment by providing all required documents and information.'
                          : 'Your enrollment has been recorded in our system.'}
                      </p>
                      {studentEnrollment.status === 'Incomplete' && (
                        <Link to="/enrollment/my-enrollments">
                          <Button className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-semibold">
                            <FileText className="h-4 w-4 mr-2" />
                            Complete Enrollment
                          </Button>
                        </Link>
                      )}
                      {studentEnrollment.status === 'Approved' && (
                        <Link to="/enrollment/my-enrollments">
                          <Button className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold">
                            <ClipboardList className="h-4 w-4 mr-2" />
                            View Enrollment Details
                          </Button>
                        </Link>
                      )}
                    </CardContent>
                  </Card>
                ) : (
                  <Card className={`border-2 ${hasOpenEnrollmentPeriod ? 'border-green-300 bg-gradient-to-r from-green-50 to-emerald-50' : 'border-gray-300 bg-gradient-to-r from-gray-50 to-slate-50'}`}>
                    <CardHeader className="pb-3">
                      <div className="flex items-start gap-4">
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${hasOpenEnrollmentPeriod ? 'bg-green-100' : 'bg-gray-200'}`}>
                          <Calendar className={`h-6 w-6 ${hasOpenEnrollmentPeriod ? 'text-green-600' : 'text-gray-600'}`} />
                        </div>
                        <div className="flex-1">
                          <CardTitle className={hasOpenEnrollmentPeriod ? 'text-green-900' : 'text-gray-800'}>
                            {hasOpenEnrollmentPeriod 
                              ? `Enrollment for SY. ${activePeriodInfo?.school_year || '2026-2027'} is now Open!` 
                              : 'Enrollment Closed'}
                          </CardTitle>
                          <CardDescription className={hasOpenEnrollmentPeriod ? 'text-green-700' : 'text-gray-600'}>
                            {hasOpenEnrollmentPeriod 
                              ? `You can now proceed with your re-enrollment for the SY. ${activePeriodInfo?.school_year || '2026-2027'} academic year.`
                              : 'The enrollment period is currently closed. Check back later.'}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4 pt-2">
                      <p className={`text-sm ${hasOpenEnrollmentPeriod ? 'text-green-800' : 'text-gray-700'}`}>
                        {hasOpenEnrollmentPeriod
                          ? `The enrollment period for SY. ${activePeriodInfo?.school_year || '2026-2027'} is currently active. Click the button below to start your re-enrollment process and secure your spot for the next school year.`
                          : 'Please wait for the enrollment period to open. You will be notified when enrollment becomes available.'}
                      </p>
                      {hasOpenEnrollmentPeriod && (
                        <Link to="/enrollment/my-enrollments">
                          <Button className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold">
                            <Calendar className="h-4 w-4 mr-2" />
                            Start Re-Enrollment Now
                          </Button>
                        </Link>
                      )}
                    </CardContent>
                  </Card>
                )}
              </>
            )}

            {/* Quick Access Cards */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Access</CardTitle>
                <CardDescription>Navigate to your pages</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  {quickLinks.map((link, index) => {
                    const Icon = link.icon;
                    return (
                      <Link key={index} to={link.href}>
                        <div className="p-4 border border-border rounded-lg hover:bg-muted/50 hover:border-primary/30 transition-all cursor-pointer group">
                          <div className="flex items-start gap-3">
                            <div className={`w-10 h-10 rounded-lg ${link.color} flex items-center justify-center`}>
                              <Icon className="h-5 w-5" />
                            </div>
                            <div className="flex-1">
                              <p className="font-semibold group-hover:text-primary transition-colors">{link.name}</p>
                              <p className="text-sm text-muted-foreground">{link.description}</p>
                            </div>
                            <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* My Courses */}
            {!isProd && (
              <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>My Courses</CardTitle>
                    <CardDescription>Your enrolled courses and progress</CardDescription>
                  </div>
                  <Link to="/student/courses">
                    <Button variant="outline" size="sm">View All</Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {courses.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No courses found</p>
                  </div>
                ) : (
                  courses.slice(0, 4).map((course) => (
                    <Link key={course.id} to={`/student/courses/${course.id}`}>
                      <div className="p-4 border border-border rounded-lg hover:bg-muted/50 hover:border-primary/30 transition-all cursor-pointer">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="font-semibold">{course.name}</h3>
                            <p className="text-sm text-muted-foreground">{course.teacher || 'TBA'}</p>
                          </div>
                          <Badge variant="secondary" className="bg-success/10 text-success">
                            {course.grade !== null ? `${course.grade}%` : 'N/A'}
                          </Badge>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Progress</span>
                            <span className="font-medium">{course.progress}%</span>
                          </div>
                          <Progress value={course.progress} className="h-2" />
                        </div>
                      </div>
                    </Link>
                  ))
                )}
              </CardContent>
              </Card>
            )}

            {/* Recent Grades */}
            {!isProd && (
              <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Recent Grades</CardTitle>
                    <CardDescription>Your latest assessment results</CardDescription>
                  </div>
                  <Link to="/student/grades">
                    <Button variant="outline" size="sm">View All</Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentGrades.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Award className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p>No grades yet</p>
                    </div>
                  ) : (
                    recentGrades.slice(0, 5).map((grade, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors">
                        <div>
                          <p className="font-medium">{grade.activity}</p>
                          <p className="text-sm text-muted-foreground">{grade.course}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-success">{grade.grade}%</p>
                          <p className="text-xs text-muted-foreground">{grade.date}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {quickActionsToShow.map((action) => {
                  const Icon = action.icon;
                  return (
                    <Link key={action.name} to={action.href}>
                      <Button variant="ghost" className="w-full justify-start text-sm">
                        <Icon className="h-4 w-4 mr-2" />
                        {action.name}
                      </Button>
                    </Link>
                  );
                })}
              </CardContent>
            </Card>

            {/* Academic Progress Summary */}
            {!isProd && (
              <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Progress Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Course Completion</span>
                    <span className="font-semibold">{courseStats.overallProgress}%</span>
                  </div>
                  <Progress value={courseStats.overallProgress} className="h-2" />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Average Grade</span>
                    <span className="font-semibold">{courseStats.averageGrade}%</span>
                  </div>
                  <Progress value={courseStats.averageGrade} className="h-2" />
                </div>

                <div className="pt-2 border-t border-border">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Enrolled Courses</span>
                    <span className="font-semibold">{courses.length}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm mt-2">
                    <span className="text-muted-foreground">Recent Activities</span>
                    <span className="font-semibold">{recentGrades.length}</span>
                  </div>
                </div>

                <Link to="/student/progress" className="block">
                  <Button variant="outline" size="sm" className="w-full">
                    View Full Progress
                  </Button>
                </Link>
              </CardContent>
            </Card>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default StudentDashboard;
