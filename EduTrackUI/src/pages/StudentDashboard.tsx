import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Bell, Award, ClipboardList, Calendar, Settings, ChevronRight, FileText, CreditCard, Eye, Target } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { DashboardLayout } from "@/components/DashboardLayout";
import { API_ENDPOINTS, apiGet } from "@/lib/api";
import { useNotificationContext } from "@/context/NotificationContext";

import { useEffect, useState } from "react";

type EnrollmentStatus = 'Pending' | 'Under Review' | 'Incomplete' | 'Verified' | 'Approved' | 'Rejected' | 'Unknown';

const normalizeEnrollmentStatus = (status: unknown): EnrollmentStatus => {
  const value = String(status ?? '').trim().toLowerCase();

  switch (value) {
    case 'pending':
      return 'Pending';
    case 'under review':
      return 'Under Review';
    case 'incomplete':
      return 'Incomplete';
    case 'verified':
      return 'Verified';
    case 'approved':
      return 'Approved';
    case 'rejected':
      return 'Rejected';
    default:
      return 'Unknown';
  }
};

const getEnrollmentStatusUi = (status: EnrollmentStatus) => {
  if (status === 'Approved') {
    return {
      card: 'border-blue-300 bg-gradient-to-r from-blue-50 to-cyan-50',
      iconBg: 'bg-blue-100',
      iconText: 'text-blue-600',
      title: 'text-blue-900',
      description: 'text-blue-700',
      body: 'text-blue-800',
      mobile: 'Approved for this school year.',
      desktopShort: 'Your enrollment has been approved for the upcoming academic year.',
      desktopBody: 'Your enrollment has been approved. You are all set for the upcoming academic year. You can now view your class schedule.',
      summaryBorder: 'border-indigo-100/70',
      summaryBar: 'from-indigo-500 to-blue-500',
      summaryIconBg: 'bg-blue-100',
      summaryIconText: 'text-blue-600',
      summaryValueText: 'text-blue-700',
    };
  }

  if (status === 'Verified') {
    return {
      card: 'border-emerald-300 bg-gradient-to-r from-emerald-50 to-green-50',
      iconBg: 'bg-emerald-100',
      iconText: 'text-emerald-600',
      title: 'text-emerald-900',
      description: 'text-emerald-700',
      body: 'text-emerald-800',
      mobile: 'Verified and ready for final approval.',
      desktopShort: 'Your enrollment documents have been verified and are ready for final approval.',
      desktopBody: 'Your enrollment is verified. Please wait for final confirmation from the registrar.',
      summaryBorder: 'border-emerald-100/70',
      summaryBar: 'from-emerald-500 to-green-500',
      summaryIconBg: 'bg-emerald-100',
      summaryIconText: 'text-emerald-600',
      summaryValueText: 'text-emerald-700',
    };
  }

  if (status === 'Pending') {
    return {
      card: 'border-violet-300 bg-gradient-to-r from-violet-50 to-indigo-50',
      iconBg: 'bg-violet-100',
      iconText: 'text-violet-600',
      title: 'text-violet-900',
      description: 'text-violet-700',
      body: 'text-violet-800',
      mobile: 'Your request is queued for processing.',
      desktopShort: 'Your enrollment request has been submitted and is waiting in the queue for initial processing.',
      desktopBody: 'Your submission is in line for processing. Please check your enrollment page for updates and any additional requirements.',
      summaryBorder: 'border-violet-100/70',
      summaryBar: 'from-violet-500 to-indigo-500',
      summaryIconBg: 'bg-violet-100',
      summaryIconText: 'text-violet-600',
      summaryValueText: 'text-violet-700',
    };
  }

  if (status === 'Under Review') {
    return {
      card: 'border-yellow-300 bg-gradient-to-r from-yellow-50 to-amber-50',
      iconBg: 'bg-yellow-100',
      iconText: 'text-yellow-600',
      title: 'text-yellow-900',
      description: 'text-yellow-700',
      body: 'text-yellow-800',
      mobile: 'Your enrollment is under review.',
      desktopShort: 'Your enrollment is currently being reviewed. Please wait for approval.',
      desktopBody: 'Your enrollment documents are being reviewed. This may take a few days. Please check back soon.',
      summaryBorder: 'border-amber-100/70',
      summaryBar: 'from-yellow-500 to-amber-500',
      summaryIconBg: 'bg-yellow-100',
      summaryIconText: 'text-yellow-600',
      summaryValueText: 'text-yellow-700',
    };
  }

  if (status === 'Incomplete') {
    return {
      card: 'border-orange-300 bg-gradient-to-r from-orange-50 to-red-50',
      iconBg: 'bg-orange-100',
      iconText: 'text-orange-600',
      title: 'text-orange-900',
      description: 'text-orange-700',
      body: 'text-orange-800',
      mobile: 'Please complete your enrollment requirements.',
      desktopShort: 'Please complete your enrollment application to proceed.',
      desktopBody: 'Complete your enrollment by providing all required documents and information.',
      summaryBorder: 'border-orange-100/70',
      summaryBar: 'from-orange-500 to-red-500',
      summaryIconBg: 'bg-orange-100',
      summaryIconText: 'text-orange-600',
      summaryValueText: 'text-orange-700',
    };
  }

  if (status === 'Rejected') {
    return {
      card: 'border-rose-300 bg-gradient-to-r from-rose-50 to-red-50',
      iconBg: 'bg-rose-100',
      iconText: 'text-rose-600',
      title: 'text-rose-900',
      description: 'text-rose-700',
      body: 'text-rose-800',
      mobile: 'Your enrollment was rejected. Please review and re-apply.',
      desktopShort: 'Your enrollment request was rejected after review.',
      desktopBody: 'Please review feedback, update your requirements, and submit a new enrollment request.',
      summaryBorder: 'border-rose-100/70',
      summaryBar: 'from-rose-500 to-red-500',
      summaryIconBg: 'bg-rose-100',
      summaryIconText: 'text-rose-600',
      summaryValueText: 'text-rose-700',
    };
  }

  return {
    card: 'border-gray-300 bg-gradient-to-r from-gray-50 to-slate-50',
    iconBg: 'bg-gray-200',
    iconText: 'text-gray-600',
    title: 'text-gray-800',
    description: 'text-gray-600',
    body: 'text-gray-700',
    mobile: 'Enrollment recorded.',
    desktopShort: 'Your enrollment has been recorded.',
    desktopBody: 'Your enrollment has been recorded in our system.',
    summaryBorder: 'border-indigo-100/70',
    summaryBar: 'from-indigo-500 to-blue-500',
    summaryIconBg: 'bg-blue-100',
    summaryIconText: 'text-blue-600',
    summaryValueText: 'text-gray-700',
  };
};

const getEnrollmentAction = (status: EnrollmentStatus) => {
  if (status === 'Incomplete') {
    return {
      label: 'Complete Enrollment',
      className: 'bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700',
      icon: FileText,
    };
  }

  if (status === 'Pending') {
    return {
      label: 'Track Enrollment Status',
      className: 'bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700',
      icon: ClipboardList,
    };
  }

  if (status === 'Under Review') {
    return {
      label: 'Track Enrollment Status',
      className: 'bg-gradient-to-r from-yellow-600 to-amber-600 hover:from-yellow-700 hover:to-amber-700',
      icon: ClipboardList,
    };
  }

  if (status === 'Verified') {
    return {
      label: 'View Verification Details',
      className: 'bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700',
      icon: ClipboardList,
    };
  }

  if (status === 'Approved') {
    return {
      label: 'View Enrollment Details',
      className: 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700',
      icon: ClipboardList,
    };
  }

  if (status === 'Rejected') {
    return {
      label: 'Review & Re-Apply',
      className: 'bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700',
      icon: FileText,
    };
  }

  return null;
};

const StudentDashboard = () => {
  const { user } = useAuth();
  const { notifications, addNotification } = useNotificationContext();
  const [courses, setCourses] = useState<any[]>([]);
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
            String(e.enrollment_period_id) === String(activePeriodInfo.id)
          );
          console.log('Enrollment found for the open re-enrollment period:', currentActiveEnrollment);
          
          // Note: If currentActiveEnrollment is null here, it means the student has NOT yet 
          // applied for the open period, so the dashboard will show the "Enrollment is Open" card.
        } else {
          // If no enrollment period is currently open (regular school days), 
          // show the latest enrollment record with any status.
          currentActiveEnrollment = enrollmentsArray.find((e: any) => 
            Boolean(e?.status)
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

  // Load dashboard data: student -> subjects
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
          status: 'active',
        }));

        if (mounted) setCourses(mappedCourses);
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
    { name: "My Activities", href: "/student/activities", icon: ClipboardList },
    { name: "My Enrollments", href: "/enrollment/my-enrollments", icon: FileText },
    { name: "Payments", href: "/enrollment/payment", icon: CreditCard },
  ];
  const isProd = import.meta.env.MODE === 'production';
  const quickActionsToShow = isProd
    ? quickActions.filter((action) => action.name === "My Enrollments" || action.name === "Payments")
    : quickActions;
  const normalizedEnrollmentStatus = normalizeEnrollmentStatus(studentEnrollment?.status);
  const enrollmentStatusUi = getEnrollmentStatusUi(normalizedEnrollmentStatus);
  const enrollmentAction = getEnrollmentAction(normalizedEnrollmentStatus);

  return (
    <DashboardLayout>
      <header className="hidden sm:block border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Maranatha Christian Academy</Link>
            <Badge className="bg-accent text-accent-foreground">Student {studentRecord?.student_id ?? studentRecord?.id ?? 'MCAF2026-0001'}</Badge>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/student/settings" className="text-muted-foreground hover:text-primary">
              <Settings className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </header>
      <div className="container mx-auto px-2 sm:px-4 py-6 sm:py-8">
        {/* Welcome Section */}
        <div className="mb-8 rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-50 via-white to-cyan-50 p-5 sm:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Welcome back, {user?.name}!</h1>
              <p className="text-sm sm:text-base text-muted-foreground">Stay updated with your courses, enrollment, and school announcements.</p>
            </div>
            <Badge className="w-fit bg-gradient-to-r from-blue-600 to-cyan-500 text-white border-transparent px-3 py-1">
              Student Portal
            </Badge>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4 md:gap-6 mb-6 sm:mb-8">
          <Card className="relative overflow-hidden border-blue-100/70 hover:shadow-lg transition-all hover:-translate-y-0.5">
            <div className="h-1 w-full bg-gradient-to-r from-blue-500 to-cyan-500" />
            <CardContent className="p-3 sm:p-5">
              <div className="flex flex-col gap-2 sm:gap-3">
                <div className="grid grid-cols-[1fr_auto] items-start gap-2">
                  <p className="min-w-0 text-[11px] sm:text-sm font-medium text-muted-foreground leading-tight">Active Courses</p>
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
                    <BookOpen className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                  </div>
                </div>
                <p className="text-xl sm:text-3xl font-bold leading-none tracking-tight">{courses.length}</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground">Subjects enrolled</p>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-emerald-100/70 hover:shadow-lg transition-all hover:-translate-y-0.5">
            <div className="h-1 w-full bg-gradient-to-r from-emerald-500 to-green-500" />
            <CardContent className="p-3 sm:p-5">
              <div className="flex flex-col gap-2 sm:gap-3">
                <div className="grid grid-cols-[1fr_auto] items-start gap-2">
                  <p className="min-w-0 text-[11px] sm:text-sm font-medium text-muted-foreground leading-tight">Notifications</p>
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0">
                    <Bell className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-600" />
                  </div>
                </div>
                <p className="text-xl sm:text-3xl font-bold leading-none tracking-tight">{notifications.length}</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground">Unread updates</p>
              </div>
            </CardContent>
          </Card>

          <Card className={`relative overflow-hidden ${studentEnrollment ? enrollmentStatusUi.summaryBorder : hasOpenEnrollmentPeriod ? 'border-emerald-100/70' : 'border-indigo-100/70'} hover:shadow-lg transition-all hover:-translate-y-0.5`}>
            <div className={`h-1 w-full bg-gradient-to-r ${studentEnrollment ? enrollmentStatusUi.summaryBar : hasOpenEnrollmentPeriod ? 'from-emerald-500 to-green-500' : 'from-indigo-500 to-blue-500'}`} />
            <CardContent className="p-3 sm:p-5">
              <div className="flex flex-col gap-2 sm:gap-3">
                <div className="grid grid-cols-[1fr_auto] items-start gap-2">
                  <p className="min-w-0 text-[11px] sm:text-sm font-medium text-muted-foreground leading-tight">Enrollment</p>
                  <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center shrink-0 ${studentEnrollment ? enrollmentStatusUi.summaryIconBg : hasOpenEnrollmentPeriod ? 'bg-emerald-100' : 'bg-blue-100'}`}>
                    <Calendar className={`h-4 w-4 sm:h-5 sm:w-5 ${studentEnrollment ? enrollmentStatusUi.summaryIconText : hasOpenEnrollmentPeriod ? 'text-emerald-600' : 'text-blue-600'}`} />
                  </div>
                </div>
                <p className={`text-base sm:text-2xl font-bold leading-tight tracking-tight ${studentEnrollment ? enrollmentStatusUi.summaryValueText : hasOpenEnrollmentPeriod ? 'text-emerald-700' : 'text-gray-700'}`}>{studentEnrollment?.status || (hasOpenEnrollmentPeriod ? 'Open' : 'None')}</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground">Current period</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Enrollment Status or Open Notice */}
            {hasOpenEnrollmentPeriod !== null && (hasOpenEnrollmentPeriod || studentEnrollment) && (
              <>
                {studentEnrollment ? (
                  <Card className={`border-2 ${enrollmentStatusUi.card}`}>
                    <CardHeader className="pb-2 sm:pb-3">
                      <div className="flex items-start gap-3 sm:gap-4">
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${enrollmentStatusUi.iconBg}`}>
                          <Calendar className={`h-6 w-6 ${enrollmentStatusUi.iconText}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <CardTitle className={`${enrollmentStatusUi.title} text-2xl sm:text-3xl leading-tight`}>
                            Enrollment Status: {studentEnrollment.status}
                          </CardTitle>
                          <CardDescription className={`hidden sm:block ${enrollmentStatusUi.description}`}>
                            {enrollmentStatusUi.desktopShort}
                          </CardDescription>
                          <p className={`sm:hidden mt-1 text-sm font-medium ${enrollmentStatusUi.body}`}>
                            {enrollmentStatusUi.mobile}
                          </p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3 sm:space-y-4 pt-1 sm:pt-2">
                      <p className={`hidden sm:block text-sm ${enrollmentStatusUi.body}`}>
                        {enrollmentStatusUi.desktopBody}
                      </p>
                      {enrollmentAction && (
                        <Link to="/enrollment/my-enrollments">
                          <Button className={`w-full h-10 sm:h-11 text-white font-semibold ${enrollmentAction.className}`}>
                            <enrollmentAction.icon className="h-4 w-4 mr-2" />
                            {enrollmentAction.label}
                          </Button>
                        </Link>
                      )}
                    </CardContent>
                  </Card>
                ) : (
                  <Card className={`border-2 ${hasOpenEnrollmentPeriod ? 'border-green-300 bg-gradient-to-r from-green-50 to-emerald-50' : 'border-gray-300 bg-gradient-to-r from-gray-50 to-slate-50'}`}>
                    <CardHeader className="pb-2 sm:pb-3">
                      <div className="flex items-start gap-3 sm:gap-4">
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${hasOpenEnrollmentPeriod ? 'bg-green-100' : 'bg-gray-200'}`}>
                          <Calendar className={`h-6 w-6 ${hasOpenEnrollmentPeriod ? 'text-green-600' : 'text-gray-600'}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <CardTitle className={`${hasOpenEnrollmentPeriod ? 'text-green-900' : 'text-gray-800'} text-2xl sm:text-3xl leading-tight`}>
                            {hasOpenEnrollmentPeriod 
                              ? `Enrollment for SY. ${activePeriodInfo?.school_year || '2026-2027'} is now Open!` 
                              : 'Enrollment Closed'}
                          </CardTitle>
                          <CardDescription className={`hidden sm:block ${hasOpenEnrollmentPeriod ? 'text-green-700' : 'text-gray-600'}`}>
                            {hasOpenEnrollmentPeriod 
                              ? `You can now proceed with your re-enrollment for the SY. ${activePeriodInfo?.school_year || '2026-2027'} academic year.`
                              : 'The enrollment period is currently closed. Check back later.'}
                          </CardDescription>
                          <p className={`sm:hidden mt-1 text-sm font-medium ${hasOpenEnrollmentPeriod ? 'text-green-800' : 'text-gray-700'}`}>
                            {hasOpenEnrollmentPeriod
                              ? 'Re-enrollment is open. Submit now to reserve your slot.'
                              : 'Enrollment is currently closed.'}
                          </p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3 sm:space-y-4 pt-1 sm:pt-2">
                      <p className={`hidden sm:block text-sm ${hasOpenEnrollmentPeriod ? 'text-green-800' : 'text-gray-700'}`}>
                        {hasOpenEnrollmentPeriod
                          ? `The enrollment period for SY. ${activePeriodInfo?.school_year || '2026-2027'} is currently active. Click the button below to start your re-enrollment process and secure your spot for the next school year.`
                          : 'Please wait for the enrollment period to open. You will be notified when enrollment becomes available.'}
                      </p>
                      {hasOpenEnrollmentPeriod && (
                        <Link to="/enrollment/my-enrollments">
                          <Button className="w-full h-10 sm:h-11 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold">
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
            <Card className="hidden sm:block">
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

            {/* MCA Vision, Mission & Philosophy */}
            <Card className="border-blue-100">
              <CardHeader>
                <CardTitle className="text-blue-900">MCA Vision, Mission & Philosophy</CardTitle>
                <CardDescription>Core direction and commitment of Maranatha Christian Academy</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-xl border border-cyan-100 bg-cyan-50/50 p-4">
                  <div className="mb-2 inline-flex items-center gap-2 text-cyan-800 font-semibold">
                    <Eye className="h-4 w-4" />
                    MCA Vision
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    A school system that upholds Christian tradition of excellence in service to God and humanity,
                    through liberating educations towards a God-fearing society.
                  </p>
                </div>

                <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-4">
                  <div className="mb-2 inline-flex items-center gap-2 text-blue-800 font-semibold">
                    <Target className="h-4 w-4" />
                    MCA Mission
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    Providing students with greater access to quality education that instills Christian values,
                    ideals and competencies essential to successfully meet the demands and challenges of the 21st century.
                  </p>
                </div>

                <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 p-4">
                  <div className="mb-2 inline-flex items-center gap-2 text-emerald-800 font-semibold">
                    <BookOpen className="h-4 w-4" />
                    MCA Philosophy
                  </div>
                  <p className="text-sm font-semibold text-emerald-900">Proverbs 22:6</p>
                  <p className="text-sm text-gray-700 leading-relaxed mt-1">
                    "Train up a child in the way he should go, and when he is old, he will not depart from it."
                  </p>
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
                    <CardDescription>Your enrolled courses</CardDescription>
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
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h3 className="font-semibold">{course.name}</h3>
                            <p className="text-sm text-muted-foreground mt-1">{course.teacher || 'TBA'}</p>
                          </div>
                          <Badge variant="secondary" className="bg-blue-50 text-blue-700 border border-blue-100">
                            {course.code || 'No Code'}
                          </Badge>
                        </div>
                      </div>
                    </Link>
                  ))
                )}
              </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card className="hidden sm:block">
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
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default StudentDashboard;
