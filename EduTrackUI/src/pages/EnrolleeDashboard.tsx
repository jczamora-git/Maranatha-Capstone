import { useEffect, useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import Joyride, { CallBackProps, STATUS, Step } from 'react-joyride';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { CheckCircle2, ClipboardList, FileText, Calendar, User, ArrowRight, AlertCircle, Mail, CalendarClock, Users, CreditCard, UserCheck, FileCheck } from "lucide-react";
import { API_ENDPOINTS, apiGet, apiPost } from "@/lib/api";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import TourHelpButton from "@/components/TourHelpButton";

interface EnrollmentData {
  id: number;
  status: "pending" | "incomplete" | "under_review" | "approved" | "rejected";
  created_at: string;
  updated_at: string;
  grade_level?: string;
  school_year?: string;
}

const EnrolleeDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [enrollmentData, setEnrollmentData] = useState<EnrollmentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isResending, setIsResending] = useState(false);
  const [payments, setPayments] = useState<any[]>([]);

  // Tour State
  const [runUnverifiedTour, setRunUnverifiedTour] = useState(false);
  const [runVerifiedTour, setRunVerifiedTour] = useState(false);
  const [runEnrollmentSubmittedTour, setRunEnrollmentSubmittedTour] = useState(false);
  const [runVerifiedEnrollmentTour, setRunVerifiedEnrollmentTour] = useState(false);
  const [runEnrollmentRecordsTour, setRunEnrollmentRecordsTour] = useState(false);

  const isEmailVerified = user?.status !== 'pending';

  const unverifiedTourSteps: Step[] = [
    {
      target: 'body',
      content: (
        <div className="text-left">
          <h3 className="font-bold text-lg mb-2">🏠 Welcome to Your Dashboard</h3>
          <p>Your gateway to enrollment and account management.</p>
        </div>
      ),
      placement: 'center',
      disableBeacon: true,
    },
    {
      target: '.bg-gradient-to-r.from-amber-50',
      content: (
        <div className="text-left">
          <h3 className="font-bold text-lg mb-2">📧 Email Verification Required</h3>
          <p>You need to verify your email address to access enrollment and payment features.</p>
        </div>
      ),
    },
    {
      target: 'button:has(.lucide-mail)',
      content: 'Click this button to send a verification email to your inbox. Check your spam folder if you don\'t see it.',
    },
    {
      target: 'button:has(.lucide-file-text)',
      content: 'Once verified, this button will become active and you can start your enrollment application.',
    },
  ];

  // Fetch active enrollment period
  const { data: activePeriodData, isLoading: isPeriodLoading } = useQuery({
    queryKey: ['enrollment-period', 'active'],
    queryFn: () => apiGet(API_ENDPOINTS.ENROLLMENT_PERIODS_ACTIVE),
    enabled: !!user?.id,
  });

  const activeEnrollmentPeriod = activePeriodData?.data;

  // Combined loading state - wait for both fetches
  const isInitialLoading = loading || isPeriodLoading;

  const verifiedTourSteps = useMemo((): Step[] => [
    {
      target: 'body',
      content: (
        <div className="text-left">
          <h3 className="font-bold text-lg mb-2">🏠 Welcome to Your Dashboard</h3>
          <p>Your gateway to enrollment and account management.</p>
        </div>
      ),
      placement: 'center',
      disableBeacon: true,
    },
    {
      target: '.bg-gradient-to-r.from-blue-50',
      content: 'Great! Your email is verified. You can now access all enrollment features.',
    },
    ...(activeEnrollmentPeriod ? [
      {
        target: '#enrollment-period-card',
        content: (
          <div className="text-left">
            <h3 className="font-bold text-lg mb-2">📅 Active Enrollment Period</h3>
            <p>
              {activeEnrollmentPeriod.status === 'Open' 
                ? 'Enrollment is currently open! You can start your application right away.'
                : activeEnrollmentPeriod.status === 'Upcoming'
                ? 'Enrollment period is upcoming. You can prepare your information now.'
                : 'Check the enrollment period status and deadlines.'
              }
            </p>
          </div>
        ),
      },
    ] : []),
    {
      target: 'button:has(.lucide-file-text)',
      content: activeEnrollmentPeriod?.status === 'Open' 
        ? 'Click here to start your enrollment application now that the period is open!'
        : 'Click here to start or continue your enrollment application.',
    },
    {
      target: '#quick-actions-card',
      content: 'Quick access to your most important enrollment and payment features.',
    },
    {
      target: 'button:has(.lucide-credit-card)',
      content: 'Check your payment status and outstanding balances here.',
    },
    {
      target: '.grid.grid-cols-1.md\\:grid-cols-2',
      content: 'Monitor your enrollment status and account information here.',
    },
    {
      target: '[class*="Enrollment Workflow"]',
      content: 'Track your progress through each step of the enrollment process.',
    },
  ], [activeEnrollmentPeriod]);

  const enrollmentSubmittedTourSteps: Step[] = [
    {
      target: 'body',
      content: (
        <div className="text-left">
          <h3 className="font-bold text-lg mb-2">🎉 Congratulations! Enrollment Submitted</h3>
          <p>Your enrollment application has been successfully submitted. The next step is to set up your tuition payment plan.</p>
        </div>
      ),
      placement: 'center',
      disableBeacon: true,
    },
    {
      target: '.bg-gradient-to-r.from-blue-50',
      content: (
        <div className="text-left">
          <h3 className="font-bold text-lg mb-2">✅ Enrollment Complete</h3>
          <p>Great job! Your enrollment application is now under review. While waiting for approval, you can prepare your payment plan.</p>
        </div>
      ),
    },
    {
      target: '#quick-actions-card',
      content: (
        <div className="text-left">
          <h3 className="font-bold text-lg mb-2">💳 Next Step: Payment Planning</h3>
          <p>Click the "Payment Status" button below to choose your tuition payment plan. This will help you manage your tuition fees effectively.</p>
        </div>
      ),
    },
    {
      target: 'button:has(.lucide-credit-card)',
      content: (
        <div className="text-left">
          <h3 className="font-bold text-lg mb-2">📋 Choose Your Payment Plan</h3>
          <p>Select from flexible payment options including full payment (with discount) or installment plans. Early payment may qualify for additional discounts!</p>
        </div>
      ),
    },
    {
      target: '[class*="Enrollment Workflow"]',
      content: (
        <div className="text-left">
          <h3 className="font-bold text-lg mb-2">📈 Your Progress</h3>
          <p>You're on step 2 of 5! Once your enrollment is approved, you'll move to the payment phase. Keep an eye on your email for approval notifications.</p>
        </div>
      ),
    },
  ];

  const enrollmentRecordsTourSteps: Step[] = [
    {
      target: 'body',
      content: (
        <div className="text-left">
          <h3 className="font-bold text-lg mb-2">📋 Enrollment Records Navigation</h3>
          <p>Let me show you how to access and manage your enrollment records. This is where you can view all your enrollment applications and their current status.</p>
        </div>
      ),
      placement: 'center',
      disableBeacon: true,
    },
    {
      target: '#quick-actions-card',
      content: (
        <div className="text-left">
          <h3 className="font-bold text-lg mb-2">🔍 Quick Actions Panel</h3>
          <p>This panel provides quick access to your most important enrollment and payment features. The "View Enrollment" button will take you to your enrollment records.</p>
        </div>
      ),
    },
    {
      target: 'button:has(.lucide-arrow-right)',
      content: (
        <div className="text-left">
          <h3 className="font-bold text-lg mb-2">👆 View Enrollment Button</h3>
          <p>Click this button to navigate to your enrollment records page. There you'll find:</p>
          <ul className="list-disc list-inside mt-2 text-sm">
            <li>All your enrollment applications</li>
            <li>Current status of each application</li>
            <li>Application details and timelines</li>
            <li>Options to start new enrollments</li>
          </ul>
        </div>
      ),
    },
    {
      target: 'button:has(.lucide-arrow-right)',
      content: (
        <div className="text-left">
          <h3 className="font-bold text-lg mb-2">🚀 Ready to Explore?</h3>
          <p>Go ahead and click the "View Enrollment" button now to see your enrollment records. You'll be guided through the features on that page as well!</p>
        </div>
      ),
    },
  ];

  const verifiedEnrollmentTourSteps: Step[] = [
    {
      target: 'body',
      content: (
        <div className="text-left">
          <h3 className="font-bold text-lg mb-2">🎉 Enrollment Verified!</h3>
          <p>Congratulations! Your enrollment status has been verified. You are now ready to proceed with your tuition payment to complete your enrollment.</p>
        </div>
      ),
      placement: 'center',
      disableBeacon: true,
    },
    {
      target: '#quick-actions-card',
      content: (
        <div className="text-left">
          <h3 className="font-bold text-lg mb-2">💳 Navigate to Payments</h3>
          <p>You can easily access the payment section from the Quick Actions card below. Click the "Payment Status" button to go to your payment dashboard where you can set up your tuition payment plan.</p>
        </div>
      ),
    },
    {
      target: 'button:has(.lucide-credit-card)',
      content: (
        <div className="text-left">
          <h3 className="font-bold text-lg mb-2">📋 Payment Status Button</h3>
          <p>This button will take you directly to the payments section. Here you can:</p>
          <ul className="list-disc list-inside mt-2 text-sm">
            <li>View your outstanding tuition balance</li>
            <li>Choose between full payment or installment plans</li>
            <li>Apply any available discounts</li>
            <li>Complete your tuition payment</li>
          </ul>
        </div>
      ),
    },
    {
      target: 'body',
      content: (
        <div className="text-left">
          <h3 className="font-bold text-lg mb-2">🚀 Complete Your Enrollment</h3>
          <p>Click the "Payment Status" button in the Quick Actions section to proceed to the payments page and settle your tuition fee. This will complete your enrollment!</p>
        </div>
      ),
      placement: 'center',
    },
  ];

  useEffect(() => {
    const fetchEnrollmentStatus = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch enrollment data from API
        const response = await apiGet(API_ENDPOINTS.ENROLLMENTS);
        
        console.log('Enrollment API Response:', response);
        
        // Handle different response structures
        let enrollmentArray = [];
        
        if (response.success && response.data) {
          console.log('response.data type:', typeof response.data, 'is array?', Array.isArray(response.data));
          console.log('response.data keys:', response.data ? Object.keys(response.data) : 'null');
          
          // Check if response.data is an array
          if (Array.isArray(response.data)) {
            enrollmentArray = response.data;
            console.log('Using response.data as array:', enrollmentArray);
          }
          // Check if response.data.data exists and is an array (pagination wrapped response)
          else if (response.data.data && Array.isArray(response.data.data)) {
            enrollmentArray = response.data.data;
            console.log('Using response.data.data as array:', enrollmentArray);
          }
          // Check if response.data.data exists and is a single object with id
          else if (response.data.data && response.data.data.id) {
            enrollmentArray = [response.data.data];
            console.log('Using response.data.data as single enrollment:', enrollmentArray);
          }
          // Check if response.data is a single object with id (single enrollment response)
          else if (response.data.id) {
            enrollmentArray = [response.data];
            console.log('Using response.data as single enrollment:', enrollmentArray);
          }
          // Check if response.data has enrollments property
          else if (response.data.enrollments && Array.isArray(response.data.enrollments)) {
            enrollmentArray = response.data.enrollments;
            console.log('Using response.data.enrollments as array:', enrollmentArray);
          }
        }
        
        console.log('Final enrollmentArray:', enrollmentArray, 'length:', enrollmentArray.length);
        
        if (enrollmentArray.length > 0) {
          // Get the latest enrollment (first one)
          const latestEnrollment = enrollmentArray[0];
          // Normalize status to lowercase and replace spaces with underscores for consistent comparison
          if (latestEnrollment.status) {
            latestEnrollment.status = latestEnrollment.status
              .toLowerCase()
              .replace(/\s+/g, '_') as any;
          }
          setEnrollmentData(latestEnrollment);
          console.log('Set enrollment data:', latestEnrollment);
        } else {
          // No enrollment found
          setEnrollmentData(null);
          console.log('No enrollment found');
        }
      } catch (error) {
        console.error('Error fetching enrollment status:', error);
        setError('Failed to load enrollment status');
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) {
      fetchEnrollmentStatus();
    }
  }, [user?.id]);

  // Fetch payments to check for tuition payment
  useEffect(() => {
    const fetchPayments = async () => {
      if (!user?.id) return;

      try {
        const response = await fetch(`/api/payments/student/${user.id}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          setPayments(data.payments || []);
        }
      } catch (err) {
        console.error('Error fetching payments:', err);
      }
    };

    if (isEmailVerified) {
      fetchPayments();
    }
  }, [user?.id, isEmailVerified]);

  useEffect(() => {
    // Clear any other tours to prevent multiple tours running
    setRunUnverifiedTour(false);
    setRunVerifiedTour(false);
    setRunEnrollmentSubmittedTour(false);
    setRunVerifiedEnrollmentTour(false);

    // Wait for all backend fetches to complete before starting tours
    if (isInitialLoading) {
      return; // Don't trigger any tours while loading
    }

    // Priority-based tour logic: Only ONE tour can run
    // 1. If unverified → show unverified tour
    if (!isEmailVerified) {
      const hasSeenUnverifiedTour = localStorage.getItem('unverifiedDashboardTourCompleted');
      if (!hasSeenUnverifiedTour) {
        setRunUnverifiedTour(true);
      }
      return; // Exit - don't check other conditions
    }

    // 2. If verified AND has submitted enrollment AND status is "verified" → show verified enrollment tour (payment prompt)
    // BUT only if they don't have a tuition payment already
    if (isEmailVerified && enrollmentData && enrollmentData.status === "verified") {
      // Check if there's a tuition payment in their records
      const hasTuitionPayment = payments.some((payment) =>
        payment.enrollment_id === enrollmentData.id &&
        (payment.payment_type === 'Tuition Full Payment' || payment.payment_type === 'Tuition Installment')
      );

      // Only show the tour if they haven't made a tuition payment yet
      if (!hasTuitionPayment) {
        setRunVerifiedEnrollmentTour(true);
      }
      return; // Exit - don't check other conditions
    }

    // 3. If verified AND has submitted enrollment AND has active period → show enrollment submitted tour
    if (isEmailVerified && enrollmentData && activeEnrollmentPeriod) {
      const hasSeenEnrollmentSubmittedTour = localStorage.getItem('enrollmentSubmittedDashboardTourCompleted');
      if (!hasSeenEnrollmentSubmittedTour) {
        setRunEnrollmentSubmittedTour(true);
      }
      return; // Exit - don't check other conditions
    }

    // 4. If verified but NO enrollment submitted yet → show verified tour
    if (isEmailVerified && !enrollmentData) {
      const hasSeenVerifiedTour = localStorage.getItem('verifiedDashboardTourCompleted');
      if (!hasSeenVerifiedTour) {
        setRunVerifiedTour(true);
      }
      return; // Exit
    }

  }, [isEmailVerified, enrollmentData, activeEnrollmentPeriod, isInitialLoading, payments]);

  const handleUnverifiedTourCallback = (data: CallBackProps) => {
    const { status } = data;

    if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
      setRunUnverifiedTour(false);
      localStorage.setItem('unverifiedDashboardTourCompleted', 'true');
    }
  };

  const handleVerifiedTourCallback = (data: CallBackProps) => {
    const { status } = data;

    if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
      setRunVerifiedTour(false);
      localStorage.setItem('verifiedDashboardTourCompleted', 'true');
    }
  };

  const handleEnrollmentSubmittedTourCallback = (data: CallBackProps) => {
    const { status } = data;

    if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
      setRunEnrollmentSubmittedTour(false);
      localStorage.setItem('enrollmentSubmittedDashboardTourCompleted', 'true');
    }
  };

  const handleEnrollmentRecordsTourCallback = (data: CallBackProps) => {
    const { status } = data;

    if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
      setRunEnrollmentRecordsTour(false);
      localStorage.setItem('enrollmentRecordsDashboardTourCompleted', 'true');
    }
  };

  const handleVerifiedEnrollmentTourCallback = (data: CallBackProps) => {
    const { status } = data;

    // Auto-navigate to payment page when tour completes
    if (status === STATUS.FINISHED) {
      setRunVerifiedEnrollmentTour(false);
      navigate('/enrollee/payment');
    }
    
    // Handle tour skip
    if (status === STATUS.SKIPPED) {
      setRunVerifiedEnrollmentTour(false);
      // Don't auto-navigate on skip, let user continue with dashboard
    }
  };

  const tourOptions = [
    {
      id: 'verified',
      title: 'Dashboard Overview',
      description: 'Learn about the main features and navigation of your dashboard.',
      icon: <UserCheck className="h-5 w-5 text-blue-600" />,
      onStart: () => setRunVerifiedTour(true),
    },
    {
      id: 'enrollment-submitted',
      title: 'Payment Planning Guide',
      description: 'Discover how to set up your tuition payment plan after enrollment submission.',
      icon: <FileCheck className="h-5 w-5 text-green-600" />,
      onStart: () => setRunEnrollmentSubmittedTour(true),
    },
    {
      id: 'enrollment-records',
      title: 'Enrollment Records Navigation',
      description: 'Learn how to access and manage your enrollment records.',
      icon: <ClipboardList className="h-5 w-5 text-purple-600" />,
      onStart: () => setRunEnrollmentRecordsTour(true),
    },
  ];

  const handleResendVerification = async () => {
    try {
      setIsResending(true);
      // Call resend verification email endpoint
      const response = await apiPost(API_ENDPOINTS.RESEND_VERIFICATION, {
        email: user?.email
      });
      
      if (response.success) {
        toast.success("Verification email sent! Please check your inbox.");
      } else {
        toast.error(response.message || "Failed to resend verification email");
      }
    } catch (error) {
      console.error('Error resending verification:', error);
      toast.error("Failed to resend verification email");
    } finally {
      setIsResending(false);
    }
  };

  // Define workflow steps based on enrollment status
  const getWorkflowSteps = () => {
    const baseSteps = [
      {
        id: 1,
        title: "Create Account & Verify Email",
        description: "Register and verify your email address.",
        status: "completed",
        icon: "✓",
        locked: false
      },
      {
        id: 2,
        title: "Submit Enrollment Application",
        description: "Fill out and submit your enrollment form with required documents.",
        status: enrollmentData ? "completed" : "waiting",
        icon: enrollmentData ? "✓" : "2",
        locked: false
      },
      {
        id: 3,
        title: "Application Under Review",
        description: "Our admissions team is reviewing your application. This typically takes 2-3 business days.",
        status: enrollmentData?.status === "under_review" ? "in-progress" : (enrollmentData?.status === "verified" || enrollmentData?.status === "approved" ? "completed" : (enrollmentData ? "pending" : "pending")),
        icon: enrollmentData?.status === "under_review" ? "⏳" : (enrollmentData?.status === "verified" || enrollmentData?.status === "approved" ? "✓" : "3"),
        locked: !enrollmentData
      },
      {
        id: 4,
        title: "Approval & Payment",
        description: "Once approved, proceed with tuition payment to complete enrollment.",
        status: enrollmentData?.status === "verified" || enrollmentData?.status === "approved" ? "in-progress" : (enrollmentData?.status === "rejected" ? "rejected" : "pending"),
        icon: enrollmentData?.status === "verified" || enrollmentData?.status === "approved" ? "💳" : "4",
        locked: !enrollmentData || (enrollmentData?.status !== "verified" && enrollmentData?.status !== "approved")
      },
      {
        id: 5,
        title: "Access Your Classes",
        description: "Gain full access to your courses and student resources.",
        status: enrollmentData?.status === "approved" ? "pending" : "pending",
        icon: "5",
        locked: !enrollmentData || enrollmentData?.status !== "approved"
      }
    ];

    return baseSteps;
  };

  const steps = getWorkflowSteps();
  const statusColors: Record<string, { badge: string; text: string }> = {
    pending: { badge: "bg-yellow-100 text-yellow-800", text: "Pending Review" },
    incomplete: { badge: "bg-red-100 text-red-800", text: "Incomplete" },
    under_review: { badge: "bg-blue-100 text-blue-800", text: "Under Review" },
    verified: { badge: "bg-blue-100 text-blue-800", text: "Verified" },
    approved: { badge: "bg-green-100 text-green-800", text: "Approved" },
    rejected: { badge: "bg-red-100 text-red-800", text: "Rejected" },
    "no-admission": { badge: "bg-gray-100 text-gray-800", text: "No Admission" }
  };

  // Determine current status for the card
  const currentStatus = !enrollmentData ? "no-admission" : (enrollmentData?.status || "pending");

  return (
    <DashboardLayout>
      {/* Loading Screen - Show while fetching all data */}
      {isInitialLoading ? (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-foreground mb-2">Loading your dashboard</h2>
              <p className="text-sm text-muted-foreground">Fetching your enrollment and account information...</p>
            </div>
          </div>
        </div>
      ) : (
        <>
      <div className="p-4 sm:p-8">
        {/* Back Button & Header */}
        <div className="mt-4 sm:mt-0 mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0 mb-4 sm:mb-6">
            <div className="w-full">
              <h1 className="text-2xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent mb-1 sm:mb-2">
                Welcome, {user?.first_name || user?.name}!
              </h1>
              <p className="text-xs sm:text-base text-muted-foreground">Enrollee Account Dashboard</p>
            </div>
            <Button
              onClick={() => navigate(isEmailVerified ? "/enrollee/enrollment" : "#")}
              disabled={!isEmailVerified}
              className="bg-gradient-to-r from-blue-600 to-blue-700 text-white w-full sm:w-auto text-sm sm:text-base h-9 sm:h-10"
            >
              <FileText className="h-4 sm:h-5 w-4 sm:w-5 mr-1 sm:mr-2" />
              Go to Enrollment
            </Button>
          </div>
        </div>

        {/* Email Verification Card - Show if not verified */}
        {!isEmailVerified && (
          <Card className="mb-8 bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200 shadow-lg border-0">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2 text-amber-900">
                <AlertCircle className="h-5 w-5" />
                Email Verification Required
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-amber-900">
                  Verify your email address <span className="font-semibold">{user?.email}</span> to unlock enrollment and payment features. 
                  Click the button below to send a verification link to your email.
                </p>
                <Button
                  onClick={handleResendVerification}
                  disabled={isResending}
                  variant="outline"
                  className="gap-2"
                >
                  <Mail className="h-4 w-4" />
                  {isResending ? "Sending..." : "Send Verification Email"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Enrollment Period Card */}
        {isEmailVerified && activeEnrollmentPeriod && !enrollmentData && (
          <Card id="enrollment-period-card" className={`mb-8 border-0 shadow-lg ${
            activeEnrollmentPeriod.status === 'Open' 
              ? 'bg-gradient-to-r from-green-50 to-emerald-50' 
              : activeEnrollmentPeriod.status === 'Upcoming'
              ? 'bg-gradient-to-r from-blue-50 to-sky-50'
              : 'bg-gradient-to-r from-gray-50 to-slate-50'
          }`}>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <CalendarClock className="h-5 w-5" />
                Enrollment Period
                <Badge 
                  variant={
                    activeEnrollmentPeriod.status === 'Open' ? 'default' :
                    activeEnrollmentPeriod.status === 'Upcoming' ? 'secondary' :
                    'outline'
                  }
                  className={
                    activeEnrollmentPeriod.status === 'Open' ? 'bg-green-600' :
                    activeEnrollmentPeriod.status === 'Upcoming' ? 'bg-blue-600' :
                    'bg-gray-600'
                  }
                >
                  {activeEnrollmentPeriod.status}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <h3 className="font-semibold text-lg">{activeEnrollmentPeriod.enrollment_name}</h3>
                <p className="text-sm text-muted-foreground">
                  {activeEnrollmentPeriod.school_year} - {activeEnrollmentPeriod.quarter}
                </p>
                {activeEnrollmentPeriod.enrollment_type && (
                  <Badge variant="outline" className="mt-1">{activeEnrollmentPeriod.enrollment_type}</Badge>
                )}
              </div>
              
              {activeEnrollmentPeriod.description && (
                <p className="text-sm">{activeEnrollmentPeriod.description}</p>
              )}

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div>
                  <p className="text-xs text-muted-foreground">Start Date</p>
                  <p className="font-medium">{new Date(activeEnrollmentPeriod.start_date).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">End Date</p>
                  <p className="font-medium">{new Date(activeEnrollmentPeriod.end_date).toLocaleDateString()}</p>
                </div>
              </div>

              {activeEnrollmentPeriod.max_slots && (
                <div className="flex items-center gap-2 pt-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    <span className="font-semibold">{activeEnrollmentPeriod.current_enrollees || 0}</span>
                    <span className="text-muted-foreground"> / </span>
                    <span className="font-semibold">{activeEnrollmentPeriod.max_slots}</span>
                    <span className="text-muted-foreground"> slots filled</span>
                  </span>
                </div>
              )}

              {activeEnrollmentPeriod.allowed_grade_levels && activeEnrollmentPeriod.allowed_grade_levels.length > 0 && (
                <div className="pt-2">
                  <p className="text-xs text-muted-foreground mb-2">Allowed Grade Levels</p>
                  <div className="flex flex-wrap gap-1">
                    {(typeof activeEnrollmentPeriod.allowed_grade_levels === 'string' 
                      ? JSON.parse(activeEnrollmentPeriod.allowed_grade_levels) 
                      : activeEnrollmentPeriod.allowed_grade_levels
                    ).map((level: string) => (
                      <Badge key={level} variant="outline" className="text-xs">
                        {level}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {activeEnrollmentPeriod.status === 'Open' && (
                <Button
                  onClick={() => navigate("/enrollee/enrollment")}
                  className="w-full mt-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Start Enrollment Application
                </Button>
              )}

              {activeEnrollmentPeriod.status === 'Upcoming' && (
                <div className="mt-4 p-3 bg-blue-100 rounded-lg">
                  <p className="text-sm text-blue-900 text-center">
                    Enrollment will open on {new Date(activeEnrollmentPeriod.start_date).toLocaleDateString()}
                  </p>
                </div>
              )}

              {activeEnrollmentPeriod.status === 'Closed' && (
                <div className="mt-4 p-3 bg-gray-100 rounded-lg">
                  <p className="text-sm text-gray-900 text-center">
                    This enrollment period has closed
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Welcome Card */}
        {/* Welcome Card - Only show if email verified */}
        {isEmailVerified && (
        <Card className="mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 shadow-lg border-0">
          <CardHeader>
            <CardTitle className="text-2xl text-blue-900">
              Welcome to Maranatha Christian Academy Foundation Enrollee Dashboard!
            </CardTitle>
            <CardDescription className="text-blue-700">
              {enrollmentData 
                ? `Your enrollment application status: ${statusColors[currentStatus].text}`
                : "Start your enrollment journey by filling out the application form."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <span className="text-sm font-medium">Email verified</span>
              </div>
              {enrollmentData && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-blue-600" />
                  <span className="text-sm">Application submitted on {new Date(enrollmentData.created_at).toLocaleDateString()}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        )}

        {/* Status Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {/* Enrollment Status */}
          <Card className="shadow-lg border-0">
            <CardHeader>
              <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                <FileText className="h-4 sm:h-5 w-4 sm:w-5 text-blue-600" />
                Enrollment Status
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <div className="space-y-4">
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground mb-2">Application Status</p>
                  <Badge className={`${statusColors[currentStatus].badge} text-xs sm:text-sm px-2 sm:px-3 py-1`}>
                    {!enrollmentData ? "No Admission" : statusColors[currentStatus].text}
                  </Badge>
                </div>
                {enrollmentData && (
                  <div className="space-y-2">
                    <div>
                      <p className="text-xs sm:text-sm font-medium text-foreground">Enrollment Submitted</p>
                      <p className="text-xs text-muted-foreground mt-1">Last updated: {new Date(enrollmentData.updated_at).toLocaleDateString()}</p>
                    </div>
                    {enrollmentData.grade_level && (
                      <p className="text-xs text-muted-foreground">Grade Level: {enrollmentData.grade_level}</p>
                    )}
                    {enrollmentData.school_year && (
                      <p>School Year: {enrollmentData.school_year}</p>
                    )}
                  </div>
                )}
                {!enrollmentData && (
                  <p className="text-xs text-muted-foreground">No active enrollment found</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Account Information */}
          <Card className="shadow-lg border-0">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="h-5 w-5 text-green-600" />
                Account Information
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="font-medium text-sm break-all text-foreground">{user?.email}</p>
                    <Badge variant={isEmailVerified ? "default" : "secondary"} className="flex-shrink-0">
                      {isEmailVerified ? "✓ Verified" : "⚠ Unverified"}
                    </Badge>
                  </div>
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground">Role</p>
                  <p className="font-medium text-xs sm:text-sm text-foreground capitalize mt-1">{user?.role}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card id="quick-actions-card" className="shadow-lg border-0">
            <CardHeader>
              <CardTitle className="text-base sm:text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <div className="space-y-2">
                <Button 
                  onClick={() => navigate(isEmailVerified ? "/enrollee/enrollment" : "#")}
                  disabled={!isEmailVerified}
                  variant="outline"
                  className="w-full justify-between text-xs sm:text-sm h-8 sm:h-9"
                  title={!isEmailVerified ? "Please verify your email first" : ""}
                >
                  <span>View Enrollment</span>
                  <ArrowRight className="h-3 sm:h-4 w-3 sm:w-4" />
                </Button>
                <Button 
                  onClick={() => navigate(isEmailVerified ? "/enrollee/payment" : "#")}
                  disabled={!isEmailVerified}
                  variant="outline"
                  className="w-full justify-between text-xs sm:text-sm h-8 sm:h-9"
                  title={!isEmailVerified ? "Please verify your email first" : ""}
                >
                  <span>Payment Status</span>
                  <CreditCard className="h-3 sm:h-4 w-3 sm:w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Enrollment Workflow Steps */}
        <Card className="shadow-lg border-0">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-purple-600" />
              Enrollment Workflow
            </CardTitle>
            <CardDescription>
              Track your progress through the enrollment process
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <div className="space-y-3 sm:space-y-4">
              {steps.map((step, index) => {
                const statusColor = {
                  completed: "bg-green-100 text-green-800",
                  "in-progress": "bg-blue-100 text-blue-800",
                  pending: "bg-gray-100 text-gray-800",
                  waiting: "bg-gray-100 text-gray-800",
                  rejected: "bg-red-100 text-red-800"
                }[step.status] || "bg-gray-100 text-gray-800";

                const statusBorderColor = {
                  completed: "border-l-green-500",
                  "in-progress": "border-l-blue-500",
                  pending: "border-l-gray-300",
                  waiting: "border-l-gray-300",
                  rejected: "border-l-red-500"
                }[step.status] || "border-l-gray-300";

                return (
                  <div key={step.id} className={`flex gap-3 pb-3 sm:pb-4 border-l-4 pl-3 sm:pl-4 ${statusBorderColor} ${step.locked ? "opacity-50 pointer-events-none" : ""}`}>
                    <div className="flex-shrink-0">
                      <div className={`flex items-center justify-center h-8 sm:h-10 w-8 sm:w-10 rounded-full font-semibold text-xs sm:text-base ${step.locked ? "bg-gray-200 text-gray-500" : statusColor}`}>
                        {step.locked ? "🔒" : step.icon}
                      </div>
                    </div>
                    <div className="flex-1">
                      <h4 className={`font-semibold text-xs sm:text-base ${step.locked ? "text-gray-500" : "text-foreground"}`}>{step.title}</h4>
                      <p className={`text-xs sm:text-sm mt-1 ${step.locked ? "text-gray-400" : "text-muted-foreground"}`}>{step.description}</p>
                      <Badge className="mt-2 text-xs sm:text-sm" variant={step.status === "completed" ? "default" : step.status === "in-progress" ? "secondary" : "outline"}>
                        {step.status === "completed" ? "Completed" : step.status === "in-progress" ? "In Progress" : step.status === "rejected" ? "Rejected" : step.status === "waiting" ? "Waiting for Submission" : "Pending"}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Help Section */}
        <Card className="mt-8 shadow-lg border-0">
          <CardHeader>
            <CardTitle className="text-lg">Need Help?</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              If you have any questions about your enrollment status or need assistance, 
              please don't hesitate to contact our admissions team.
            </p>
            <Button variant="outline" className="w-full sm:w-auto">
              Contact Support
            </Button>
          </CardContent>
        </Card>
      </div>
        </>
      )}

      {/* Tour Help Button */}
      <TourHelpButton tourOptions={tourOptions} />

      <Joyride
        steps={unverifiedTourSteps}
        run={runUnverifiedTour}
        continuous
        showProgress
        showSkipButton
        callback={handleUnverifiedTourCallback}
        styles={{
          options: {
            primaryColor: '#f59e0b',
            zIndex: 1000,
          },
        }}
        locale={{
          last: 'Finish',
          skip: 'Skip',
        }}
      />

      <Joyride
        steps={verifiedTourSteps}
        run={runVerifiedTour}
        continuous
        showProgress
        showSkipButton
        callback={handleVerifiedTourCallback}
        styles={{
          options: {
            primaryColor: '#2563eb',
            zIndex: 1000,
          },
        }}
        locale={{
          last: 'Finish',
          skip: 'Skip',
        }}
      />

      <Joyride
        steps={enrollmentSubmittedTourSteps}
        run={runEnrollmentSubmittedTour}
        continuous
        showProgress
        showSkipButton
        callback={handleEnrollmentSubmittedTourCallback}
        styles={{
          options: {
            primaryColor: '#10b981',
            zIndex: 1000,
          },
        }}
        locale={{
          last: 'Finish',
          skip: 'Skip',
        }}
      />

      <Joyride
        steps={enrollmentRecordsTourSteps}
        run={runEnrollmentRecordsTour}
        continuous
        showProgress
        showSkipButton
        callback={handleEnrollmentRecordsTourCallback}
        styles={{
          options: {
            primaryColor: '#8b5cf6',
            zIndex: 1000,
          },
        }}
        locale={{
          last: 'Finish',
          skip: 'Skip',
        }}
      />

      <Joyride
        steps={verifiedEnrollmentTourSteps}
        run={runVerifiedEnrollmentTour}
        continuous
        showProgress
        showSkipButton
        callback={handleVerifiedEnrollmentTourCallback}
        styles={{
          options: {
            primaryColor: '#10b981',
            zIndex: 1000,
          },
        }}
        locale={{
          last: 'Go to Payments',
          skip: 'Skip',
        }}
      />
    </DashboardLayout>
  );
};

export default EnrolleeDashboard;
