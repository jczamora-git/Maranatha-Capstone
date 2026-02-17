import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { AlertCircle, Plus, CheckCircle2, Clock, XCircle, Eye, ArrowRight, ClipboardList, Calendar, Search, LayoutGrid, List, UserPlus, Users, FileText } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { apiGet, API_ENDPOINTS } from "@/lib/api";
import AccessLockedCard from "@/components/AccessLockedCard";
import Joyride, { CallBackProps, STATUS, EVENTS } from "react-joyride";
import TourHelpButton from "@/components/TourHelpButton";

interface EnrollmentItem {
  id: number;
  confirmation_number?: string;
  status: "Pending" | "Incomplete" | "Under Review" | "Approved" | "Rejected";
  submitted_date: string;
  student_name?: string;
  grade_level?: string;
  school_year?: string;
  enrollment_period_id?: number;
}

const statusConfig: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
  "Pending": {
    bg: "bg-yellow-100",
    text: "text-yellow-800",
    icon: <Clock className="w-4 h-4" />,
  },
  "Incomplete": {
    bg: "bg-yellow-100",
    text: "text-yellow-800",
    icon: <AlertCircle className="w-4 h-4" />,
  },
  "Under Review": {
    bg: "bg-purple-100",
    text: "text-purple-800",
    icon: <Clock className="w-4 h-4" />,
  },
  "Approved": {
    bg: "bg-green-100",
    text: "text-green-800",
    icon: <CheckCircle2 className="w-4 h-4" />,
  },
  "Rejected": {
    bg: "bg-red-100",
    text: "text-red-800",
    icon: <XCircle className="w-4 h-4" />,
  },
};

const MyEnrollments = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [enrollments, setEnrollments] = useState<EnrollmentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [showEnrollmentTypeModal, setShowEnrollmentTypeModal] = useState(false);
  const [selectedEnrollmentType, setSelectedEnrollmentType] = useState<"New Student" | "Returning Student" | "Transferee" | "Continuing Student" | "">("");
  const [hasOpenEnrollmentPeriod, setHasOpenEnrollmentPeriod] = useState<boolean | null>(null);
  const [activeEnrollmentPeriodId, setActiveEnrollmentPeriodId] = useState<number | null>(null);
  
  // States for continuing student auto-enrollment
  const [showContinuingPreview, setShowContinuingPreview] = useState(false);
  const [continuingPreviewData, setContinuingPreviewData] = useState<any>(null);
  const [pastEnrollmentId, setPastEnrollmentId] = useState<number | null>(null);
  const [isAutoCreating, setIsAutoCreating] = useState(false);

  // Tour states
  const [runTour, setRunTour] = useState(false);
  const [tourStepIndex, setTourStepIndex] = useState(0);

  const isEmailVerified = user?.status !== 'pending';

  // Tour steps - conditional based on whether user has enrollments
  const tourSteps = useMemo(() => {
    const baseSteps = [
      {
        target: '#my-enrollments-header',
        content: (
          <div>
            <h3 className="text-lg font-semibold mb-2">Welcome to My Enrollments!</h3>
            <p className="text-sm">This is your central hub for managing all your enrollment applications. Here you can view your current enrollments, start new applications, and track their progress.</p>
          </div>
        ),
        placement: 'bottom' as const,
        disableBeacon: true,
      },
      {
        target: '#new-enrollment-button',
        content: (
          <div>
            <h3 className="text-lg font-semibold mb-2">Start New Enrollment</h3>
            <p className="text-sm">Click here to begin a new enrollment application. You'll be guided through selecting the appropriate enrollment type for your situation.</p>
          </div>
        ),
        placement: 'bottom' as const,
      },
    ];

    // If user has enrollments, add additional steps
    if (enrollments.length > 0) {
      return [
        ...baseSteps,
        {
          target: '#summary-stats-section',
          content: (
            <div>
              <h3 className="text-lg font-semibold mb-2">Enrollment Summary</h3>
              <p className="text-sm">Get a quick overview of your enrollment status with these summary cards showing total applications, items under review, approvals, and your latest activity.</p>
            </div>
          ),
          placement: 'top' as const,
        },
        {
          target: '#filters-section',
          content: (
            <div>
              <h3 className="text-lg font-semibold mb-2">Search & Filter</h3>
              <p className="text-sm">Use these tools to find specific enrollments. Search by application ID or grade level, filter by status, and switch between list and grid views.</p>
            </div>
          ),
          placement: 'top' as const,
        },
        {
          target: '#enrollments-list-section',
          content: (
            <div>
              <h3 className="text-lg font-semibold mb-2">Your Enrollments</h3>
              <p className="text-sm">This section displays all your enrollment applications. Each entry shows the application ID, school year, grade level, status, and submission date.</p>
            </div>
          ),
          placement: 'top' as const,
        },
        {
          target: '#view-enrollment-button',
          content: (
            <div>
              <h3 className="text-lg font-semibold mb-2">View Details</h3>
              <p className="text-sm">Click the "View" button on any enrollment to see detailed information, status timeline, and any required actions or document uploads.</p>
            </div>
          ),
          placement: 'left' as const,
        },
        {
          target: '#enrollment-info-section',
          content: (
            <div>
              <h3 className="text-lg font-semibold mb-2">Important Information</h3>
              <p className="text-sm">Review these key points about the enrollment process. You'll receive email notifications for updates, and additional documents may be requested.</p>
            </div>
          ),
          placement: 'top' as const,
        },
      ];
    }

    // Return only base steps for users with no enrollments
    return baseSteps;
  }, [enrollments.length]);

  // Tour callback
  const handleTourCallback = (data: CallBackProps) => {
    const { status, type, index } = data;

    if (type === EVENTS.STEP_AFTER || type === EVENTS.TARGET_NOT_FOUND) {
      setTourStepIndex(index + 1);
    } else if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
      setRunTour(false);
      setTourStepIndex(0);
      localStorage.setItem('myEnrollmentsTourCompleted', 'true');
    }
  };

  // Start tour function
  const tourOptions = [
    {
      id: 'my-enrollments',
      title: 'My Enrollments Guide',
      description: 'Learn how to view and manage your enrollment records.',
      icon: <FileText className="h-5 w-5 text-blue-600" />,
      onStart: () => {
        setTourStepIndex(0);
        setRunTour(true);
      },
    },
  ];

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }

    /**
     * Check if enrollment period is open
     */
    if (!user) {
      navigate("/auth");
      return;
    }

    /**
     * Check if enrollment period is open
     */
    const checkEnrollmentPeriod = async () => {
      try {
        const response = await apiGet('/api/enrollment-periods/active');
        
        if (response.success && response.data) {
          const isOpen = response.data.status === 'Open' || response.data.enrollment_open === true;
          setHasOpenEnrollmentPeriod(isOpen);
          setActiveEnrollmentPeriodId(response.data.id); // Store the active period ID
        } else if (response.data && response.data.status === 'Open') {
          setHasOpenEnrollmentPeriod(true);
          setActiveEnrollmentPeriodId(response.data.id);
        } else {
          setHasOpenEnrollmentPeriod(false);
          setActiveEnrollmentPeriodId(null);
        }
      } catch (error) {
        console.error('Error checking enrollment period:', error);
        setHasOpenEnrollmentPeriod(false);
        setActiveEnrollmentPeriodId(null);
      }
    };

    const fetchEnrollments = async () => {
      try {
        setLoading(true);
        const response = await apiGet(API_ENDPOINTS.ENROLLMENTS);
        
        console.log('Enrollments API Response:', response);
        console.log('response.data type:', typeof response.data, 'is array?', Array.isArray(response.data));
        console.log('response.data keys:', response.data ? Object.keys(response.data) : 'null');
        
        // Handle different response structures
        let enrollmentsArray: EnrollmentItem[] = [];
        
        if (response.success && response.data) {
          // Check if response.data is an array (direct array response)
          if (Array.isArray(response.data)) {
            enrollmentsArray = response.data;
            console.log('Using response.data as array');
          }
          // Check if response.data.data exists and is an array (nested array from pagination)
          else if (response.data.data && Array.isArray(response.data.data)) {
            enrollmentsArray = response.data.data;
            console.log('Using response.data.data as array');
          }
          // Check if response.data.data exists and is a single object with id
          else if (response.data.data && response.data.data.id) {
            enrollmentsArray = [response.data.data];
            console.log('Using response.data.data as single enrollment');
          }
          // Check if response.data is a single object with id (single enrollment response)
          else if (response.data.id) {
            enrollmentsArray = [response.data];
            console.log('Using response.data as single enrollment');
          }
          // Check if response.data has enrollments property
          else if (response.data.enrollments && Array.isArray(response.data.enrollments)) {
            enrollmentsArray = response.data.enrollments;
            console.log('Using response.data.enrollments as array');
          }
        }
        
        // Normalize status for all enrollments (convert "Pending" → "Pending", "Under Review" → "Under Review", etc.)
        enrollmentsArray = enrollmentsArray.map(enrollment => ({
          ...enrollment,
          status: (enrollment.status || "Pending") as any
        }));
        
        console.log('Parsed enrollments:', enrollmentsArray, 'total:', enrollmentsArray.length);
        setEnrollments(enrollmentsArray);
      } catch (error) {
        console.error("Error fetching enrollments:", error);
        toast.error(error instanceof Error ? error.message : "Failed to load enrollments");
      } finally {
        setLoading(false);
      }
    };

    checkEnrollmentPeriod();
    
    if (isEmailVerified) {
      fetchEnrollments();
    } else {
      setLoading(false);
    }

    // Auto-start tour for new users
    const tourCompleted = localStorage.getItem('myEnrollmentsTourCompleted');
    if (!tourCompleted && isEmailVerified && !loading) {
      // Delay tour start to ensure DOM is ready
      setTimeout(() => {
        setRunTour(true);
      }, 1000);
    }
  }, [user, navigate, isEmailVerified]);

  const handleStartNewEnrollment = () => {
    if (!isEmailVerified) {
      toast.error("Please verify your email before creating an enrollment");
      return;
    }

    if (!hasOpenEnrollmentPeriod) {
      toast.error("Enrollment period is currently closed. Please wait for the next enrollment period to open.");
      return;
    }

    // Check if there's an active enrollment in the CURRENT enrollment period only
    // Compare enrollment_period_id with the active enrollment period ID
    const hasActiveEnrollmentInCurrentPeriod = enrollments.some(e => 
      e.enrollment_period_id === activeEnrollmentPeriodId && e.status !== "Rejected"
    );
    
    if (hasActiveEnrollmentInCurrentPeriod) {
      toast.error("You already have an active enrollment in the current period. Complete or cancel the existing enrollment before creating a new one.");
      return;
    }
    
    // Show modal for both students and enrollees to select type
    setSelectedEnrollmentType("");
    setShowEnrollmentTypeModal(true);
  };

  const handleEnrollmentTypeConfirm = async () => {
    if (!selectedEnrollmentType) {
      toast.error("Please select an enrollment type");
      return;
    }

    if (!user?.id) {
      toast.error("User information not available");
      return;
    }

    try {
      setShowEnrollmentTypeModal(false);
      setIsAutoCreating(true);

      // Call the classification API to determine student type and action
      const classificationResponse = await fetch(API_ENDPOINTS.ENROLLMENT_CLASSIFY_STUDENT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          enrollment_type: selectedEnrollmentType,
          student_id: user.id
        })
      });

      if (!classificationResponse.ok) {
        const errorText = await classificationResponse.text();
        console.error('Classification API Error:', classificationResponse.status, errorText);
        throw new Error(`Failed to classify student (${classificationResponse.status})`);
      }

      let classificationData;
      try {
        classificationData = await classificationResponse.json();
      } catch (parseError) {
        const responseText = await classificationResponse.text();
        console.error('Failed to parse response as JSON:', responseText);
        throw new Error('Invalid response from server - not JSON');
      }

      console.log("Classification response:", classificationData);

      if (!classificationData.success) {
        throw new Error(classificationData.message || 'Classification failed');
      }

      // Check the action from classification
      if (classificationData.action === 'auto_generate') {
        // Continuing student with approved enrollment - show preview modal
        if (classificationData.preview_data) {
          setContinuingPreviewData(classificationData.preview_data);
          setPastEnrollmentId(classificationData.latest_enrollment?.id || null);
          setShowContinuingPreview(true);
          setIsAutoCreating(false);
          return;
        } else {
          throw new Error('No preview data available for auto-enrollment');
        }
      } else if (classificationData.action === 'go_to_form') {
        // All other students - go to enrollment form
        setIsAutoCreating(false);
        navigate("/enrollment/new", { state: { enrollmentType: selectedEnrollmentType } });
      } else {
        throw new Error('Unknown action from classification');
      }
    } catch (error) {
      console.error("Error in enrollment type confirmation:", error);
      setIsAutoCreating(false);
      
      // Fallback: if classification API fails, use direct enrollment form routing
      // This ensures users aren't stuck if the API is unavailable
      if (selectedEnrollmentType) {
        navigate("/enrollment/new", { state: { enrollmentType: selectedEnrollmentType } });
      } else {
        toast.error(error instanceof Error ? error.message : "Error processing enrollment. Please try again.");
        setSelectedEnrollmentType("");
        setShowEnrollmentTypeModal(true);
      }
    }
  };

  const handleAutoCreateContinuingEnrollment = async () => {
    if (!pastEnrollmentId || !continuingPreviewData || !activeEnrollmentPeriodId) {
      toast.error("Missing required data for auto-enrollment");
      return;
    }

    try {
      setIsAutoCreating(true);

      const response = await fetch(API_ENDPOINTS.ENROLLMENT_AUTO_CREATE_CONTINUING, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          past_enrollment_id: pastEnrollmentId,
          enrollment_period_id: activeEnrollmentPeriodId,
          new_grade_level: continuingPreviewData.next_grade
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create enrollment');
      }

      const data = await response.json();

      if (data.success) {
        setShowContinuingPreview(false);
        setContinuingPreviewData(null);
        setPastEnrollmentId(null);
        
        // Refresh enrollments
        const enrollResponse = await apiGet(API_ENDPOINTS.ENROLLMENTS);
        let enrollmentsList: EnrollmentItem[] = [];
        if (enrollResponse.success && enrollResponse.data) {
          if (Array.isArray(enrollResponse.data)) {
            enrollmentsList = enrollResponse.data;
          } else if (enrollResponse.data.data && Array.isArray(enrollResponse.data.data)) {
            enrollmentsList = enrollResponse.data.data;
          }
        }
        setEnrollments(enrollmentsList);

        // Show success message
        toast.success(`Enrollment submitted successfully! Grade: ${continuingPreviewData.next_grade}. Please wait for approval.`);
      } else {
        throw new Error(data.message || 'Failed to create enrollment');
      }
    } catch (error) {
      console.error("Error creating continuing enrollment:", error);
      toast.error(error instanceof Error ? error.message : "Failed to create enrollment");
    } finally {
      setIsAutoCreating(false);
    }
  };

  const handleCancelContinuingPreview = () => {
    setShowContinuingPreview(false);
    setContinuingPreviewData(null);
    setPastEnrollmentId(null);
    // Show type modal again so they can select different type
    setSelectedEnrollmentType("");
    setShowEnrollmentTypeModal(true);
  };

  const handleViewEnrollment = (enrollmentId: number) => {
    if (!isEmailVerified) {
      toast.error("Please verify your email before viewing enrollments");
      return;
    }
    navigate(`/enrollment/status/${enrollmentId}`);
  };

  // Filter enrollments based on search and status
  const filteredEnrollments = enrollments.filter((enrollment) => {
    const startYear = enrollment.school_year ? enrollment.school_year.replace(/\D/g, '').substring(0, 4) : '0000';
    const formattedId = `APP-${startYear}${String(enrollment.id).padStart(3, '0')}`;
    const matchesSearch = 
      enrollment.id.toString().includes(searchQuery) ||
      formattedId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      enrollment.grade_level?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || enrollment.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Check if student has an active enrollment in the CURRENT period (prevents duplicate creation)
  // Only allow new enrollment if there's no active enrollment in this specific period
  const hasActiveEnrollmentInCurrentPeriod = enrollments.some(e => 
    e.enrollment_period_id === activeEnrollmentPeriodId && e.status !== "Rejected"
  );
  const canCreateNewEnrollment = !hasActiveEnrollmentInCurrentPeriod;

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your enrollments...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Show email verification lock screen if not verified
  if (!isEmailVerified) {
    return (
      <DashboardLayout>
        <AccessLockedCard 
          title="Enrollment Access Locked"
          description="You need to verify your email address before you can access the enrollment system."
          benefits={[
            "Secure your account and prevent unauthorized access",
            "Receive important enrollment updates and notifications",
            "Start your enrollment application and submission process"
          ]}
        />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {/* Tour Component */}
      <Joyride
        steps={tourSteps}
        run={runTour}
        stepIndex={tourStepIndex}
        callback={handleTourCallback}
        continuous={true}
        showProgress={true}
        showSkipButton={true}
        styles={{
          options: {
            primaryColor: '#2563eb',
            textColor: '#1f2937',
            backgroundColor: '#ffffff',
            overlayColor: 'rgba(0, 0, 0, 0.5)',
            spotlightShadow: '0 0 15px rgba(0, 0, 0, 0.5)',
          },
          tooltip: {
            borderRadius: 8,
            fontSize: 14,
          },
          buttonNext: {
            backgroundColor: '#2563eb',
            fontSize: 14,
            borderRadius: 6,
            padding: '8px 16px',
          },
          buttonBack: {
            color: '#6b7280',
            fontSize: 14,
            marginRight: 8,
          },
          buttonSkip: {
            color: '#6b7280',
            fontSize: 14,
          },
        }}
        locale={{
          back: 'Previous',
          close: 'Close',
          last: 'Finish',
          next: 'Next',
          open: 'Open the dialog',
          skip: 'Skip tour',
        }}
      />

      <div className="p-4 sm:p-8">
        {/* Header */}
        <div id="my-enrollments-header" className="mb-6 sm:mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold mb-1 sm:mb-2 bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">My Enrollments</h1>
            <p className="text-xs sm:text-sm md:text-base text-muted-foreground">Track and manage your enrollment applications</p>
          </div>
          <div className="flex flex-col gap-2 w-full sm:w-auto">
            <Button 
              id="new-enrollment-button"
              onClick={handleStartNewEnrollment}
              disabled={!canCreateNewEnrollment || !hasOpenEnrollmentPeriod}
              className={`text-white shadow-lg hover:shadow-xl transition-all w-full sm:w-auto text-sm sm:text-base h-9 sm:h-10 ${
                canCreateNewEnrollment && hasOpenEnrollmentPeriod
                  ? "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                  : "bg-gray-400 cursor-not-allowed opacity-60"
              }`}
              title={hasActiveEnrollmentInCurrentPeriod ? "You already have an active enrollment in the current period" : !hasOpenEnrollmentPeriod ? "Enrollment period is closed" : ""}
            >
              <Plus className="h-4 sm:h-5 w-4 sm:w-5 mr-1 sm:mr-2" />
              New Enrollment
            </Button>
            {hasActiveEnrollmentInCurrentPeriod && (
              <p className="text-xs sm:text-sm text-amber-600 font-medium">
                You have an active enrollment. Complete it before creating a new one.
              </p>
            )}
            {!hasOpenEnrollmentPeriod && (
              <p className="text-xs sm:text-sm text-red-600 font-medium">
                Enrollment period is closed. Check back later.
              </p>
            )}
          </div>
        </div>

        {enrollments.length === 0 ? (
          // Empty State
          <Card className="border-0 shadow-md">
            <CardContent className="p-6 sm:p-12 text-center">
              <div className="mb-4">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ClipboardList className="w-6 sm:w-8 h-6 sm:h-8 text-gray-400" />
                </div>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">No Enrollments Yet</h2>
              <p className="text-xs sm:text-sm text-gray-600 mb-6 sm:mb-8 max-w-md mx-auto">
                You haven't submitted any enrollment applications yet. Start your enrollment process now to get access to courses and classes.
              </p>
              <Button
                onClick={handleStartNewEnrollment}
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white w-full sm:w-auto text-sm sm:text-base h-9 sm:h-10"
              >
                Start Your First Enrollment
                <ArrowRight className="w-3 sm:w-4 h-3 sm:h-4 ml-1 sm:ml-2" />
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4 sm:space-y-6">
            {/* Summary Stats */}
            <div id="summary-stats-section" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <Card className="bg-white border-0 shadow-sm">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs sm:text-sm font-medium text-gray-600">Total Applications</p>
                      <p className="text-xl sm:text-2xl font-bold text-gray-900 mt-1">{enrollments.length}</p>
                    </div>
                    <div className="w-9 h-9 sm:w-10 sm:h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <ClipboardList className="w-4 sm:w-5 h-4 sm:h-5 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-white border-0 shadow-sm">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs sm:text-sm font-medium text-gray-600">Under Review</p>
                      <p className="text-xl sm:text-2xl font-bold text-purple-600 mt-1">
                        {enrollments.filter(e => e.status === "Under Review").length}
                      </p>
                    </div>
                    <div className="w-9 h-9 sm:w-10 sm:h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Clock className="w-4 sm:w-5 h-4 sm:h-5 text-purple-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white border-0 shadow-sm">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs sm:text-sm font-medium text-gray-600">Approved</p>
                      <p className="text-xl sm:text-2xl font-bold text-green-600 mt-1">
                        {enrollments.filter(e => e.status === "Approved").length}
                      </p>
                    </div>
                    <div className="w-9 h-9 sm:w-10 sm:h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <CheckCircle2 className="w-4 sm:w-5 h-4 sm:h-5 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white border-0 shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Latest Update</p>
                      <p className="text-lg font-bold text-gray-900 mt-1">
                        {enrollments.length > 0 
                          ? new Date(enrollments[0].submitted_date).toLocaleDateString()
                          : "N/A"
                        }
                      </p>
                    </div>
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-gray-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Filters and View Mode */}
            <Card id="filters-section" className="bg-white border-0 shadow-sm">
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex-1">
                    <Label htmlFor="search" className="block text-sm font-medium mb-2">Search</Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      <Input
                        id="search"
                        placeholder="Search by ID or grade level..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="status-filter" className="block text-sm font-medium mb-2">Status</Label>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger id="status-filter">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="Pending">Pending</SelectItem>
                        <SelectItem value="Incomplete">Incomplete</SelectItem>
                        <SelectItem value="Under Review">Under Review</SelectItem>
                        <SelectItem value="Approved">Approved</SelectItem>
                        <SelectItem value="Rejected">Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-end gap-2">
                    <Label className="block text-sm font-medium mb-2 w-full">View Mode</Label>
                    <div className="flex gap-2 w-full">
                      <Button
                        variant={viewMode === "list" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setViewMode("list")}
                        className="flex-1"
                      >
                        <List className="h-4 w-4 mr-2" />
                        List
                      </Button>
                      <Button
                        variant={viewMode === "grid" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setViewMode("grid")}
                        className="flex-1"
                      >
                        <LayoutGrid className="h-4 w-4 mr-2" />
                        Grid
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Enrollments List/Grid */}
            {viewMode === "list" ? (
              // Table View
              <Card id="enrollments-list-section" className="bg-white border-0 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-full text-xs sm:text-sm">
                    <thead>
                      <tr className="border-b bg-gray-50">
                        <th className="px-3 sm:px-6 py-3 text-left text-xs sm:text-sm font-semibold text-gray-900">Application ID</th>
                        <th className="px-3 sm:px-6 py-3 text-left text-xs sm:text-sm font-semibold text-gray-900 hidden sm:table-cell">School Year</th>
                        <th className="px-3 sm:px-6 py-3 text-left text-xs sm:text-sm font-semibold text-gray-900 hidden sm:table-cell">Grade Level</th>
                        <th className="px-3 sm:px-6 py-3 text-left text-xs sm:text-sm font-semibold text-gray-900">Status</th>
                        <th className="px-3 sm:px-6 py-3 text-left text-xs sm:text-sm font-semibold text-gray-900 hidden md:table-cell">Submitted Date</th>
                        <th className="px-3 sm:px-6 py-3 text-left text-xs sm:text-sm font-semibold text-gray-900">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredEnrollments.map((enrollment) => {
                        const config = statusConfig[enrollment.status] || statusConfig.Pending;
                        return (
                          <tr key={enrollment.id} className="border-b hover:bg-gray-50 transition">
                            <td className="px-3 sm:px-6 py-4">
                              <span className="font-semibold text-gray-900 text-xs sm:text-sm">
                                APP-{enrollment.school_year ? enrollment.school_year.replace(/\D/g, '').substring(0, 4) : '0000'}{String(enrollment.id).padStart(3, '0')}
                              </span>
                            </td>
                            <td className="px-3 sm:px-6 py-4 text-gray-600 hidden sm:table-cell text-xs sm:text-sm">{enrollment.school_year || "N/A"}</td>
                            <td className="px-3 sm:px-6 py-4 text-gray-600 hidden sm:table-cell text-xs sm:text-sm">{enrollment.grade_level || "N/A"}</td>
                            <td className="px-3 sm:px-6 py-4">
                              <Badge className={`${config.bg} text-xs sm:text-sm`}>
                                <span className={config.text}>{enrollment.status}</span>
                              </Badge>
                            </td>
                            <td className="px-3 sm:px-6 py-4 text-gray-600 hidden md:table-cell text-xs sm:text-sm">
                              {new Date(enrollment.submitted_date).toLocaleDateString()}
                            </td>
                            <td className="px-3 sm:px-6 py-4">
                              <Button
                                id={enrollment.id === filteredEnrollments[0]?.id ? "view-enrollment-button" : undefined}
                                variant="ghost"
                                size="sm"
                                onClick={() => handleViewEnrollment(enrollment.id)}
                                className="text-primary hover:bg-primary/10 text-xs sm:text-sm h-8 sm:h-auto px-2 sm:px-3"
                              >
                                <Eye className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                                <span className="hidden sm:inline">View</span>
                              </Button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </Card>
            ) : (
              // Grid View
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredEnrollments.map((enrollment) => {
                  const config = statusConfig[enrollment.status] || statusConfig.Pending;
                  return (
                    <Card
                      key={enrollment.id}
                      className="bg-white border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => handleViewEnrollment(enrollment.id)}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className={`w-12 h-12 ${config.bg} rounded-lg flex items-center justify-center`}>
                            {config.icon}
                          </div>
                          <Badge className={config.bg}>
                            <span className={config.text}>{enrollment.status}</span>
                          </Badge>
                        </div>
                        <h3 className="font-semibold text-gray-900 mb-2">
                          APP-{enrollment.school_year ? enrollment.school_year.replace(/\D/g, '').substring(0, 4) : '0000'}{String(enrollment.id).padStart(3, '0')}
                        </h3>
                        <p className="text-sm text-gray-600 mb-1">SY: {enrollment.school_year || "N/A"}</p>
                        <p className="text-sm text-gray-600 mb-3">Grade: {enrollment.grade_level}</p>
                        <p className="text-sm text-gray-600 mb-4">
                          Submitted: {new Date(enrollment.submitted_date).toLocaleDateString()}
                        </p>
                        <Button
                          id={enrollment.id === filteredEnrollments[0]?.id ? "view-enrollment-button" : undefined}
                          variant="ghost"
                          size="sm"
                          className="w-full text-primary hover:bg-primary/10"
                          onClick={() => handleViewEnrollment(enrollment.id)}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          View Details
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}

            {/* Info Section */}
            <Card id="enrollment-info-section" className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-900">
                  <AlertCircle className="w-5 h-5" />
                  Enrollment Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-blue-800">
                  <li className="flex items-start gap-3">
                    <span className="font-bold">•</span>
                    <span>Click on any enrollment to view detailed status and timeline</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="font-bold">•</span>
                    <span>You will be notified via email when your application is reviewed</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="font-bold">•</span>
                    <span>Document uploads may be requested at any time</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="font-bold">•</span>
                    <span>Contact us at enrollment@maranatha-school.edu for support</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Enrollment Type Selection Modal */}
      <Dialog open={showEnrollmentTypeModal} onOpenChange={setShowEnrollmentTypeModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">
              {user?.role === 'student' ? 'Select Re-Enrollment Type' : 'Select Enrollment Type'}
            </DialogTitle>
            <DialogDescription>
              {user?.role === 'student' 
                ? 'Please select the type of re-enrollment for this school year.'
                : 'Please select the type of enrollment for this student.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {user?.role === 'student' ? (
              // Student enrollment type options
              <RadioGroup
                value={selectedEnrollmentType}
                onValueChange={(value) => setSelectedEnrollmentType(value as "New Student" | "Continuing Student" | "Returning Student" | "Transferee")}
                className="space-y-3"
              >
                {/* Show Continuing Student option for all students (including legacy/first-timers) */}
                <div className="flex items-start space-x-3 p-4 bg-green-50 rounded-lg border-2 border-green-200 hover:border-green-400 transition-colors cursor-pointer">
                  <RadioGroupItem value="Continuing Student" id="continuing-student" className="mt-1" />
                  <div className="flex-1">
                    <Label htmlFor="continuing-student" className="text-base font-semibold text-gray-900 cursor-pointer flex items-center gap-2">
                      <Users className="w-5 h-5 text-green-600" />
                      Continuing Student
                    </Label>
                    <p className="text-sm text-gray-600 mt-1">Currently enrolled, progressing to next grade level</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-4 bg-blue-50 rounded-lg border-2 border-blue-200 hover:border-blue-400 transition-colors cursor-pointer">
                  <RadioGroupItem value="Returning Student" id="returning-student" className="mt-1" />
                  <div className="flex-1">
                    <Label htmlFor="returning-student" className="text-base font-semibold text-gray-900 cursor-pointer flex items-center gap-2">
                      <Users className="w-5 h-5 text-blue-600" />
                      Returning Student
                    </Label>
                    <p className="text-sm text-gray-600 mt-1">Previously enrolled, returning after a gap</p>
                  </div>
                </div>
              </RadioGroup>
            ) : (
              // Enrollee enrollment type options
              <RadioGroup
                value={selectedEnrollmentType}
                onValueChange={(value) => setSelectedEnrollmentType(value as "New Student" | "Continuing Student" | "Returning Student" | "Transferee")}
                className="space-y-3"
              >
                <div className="flex items-start space-x-3 p-4 bg-blue-50 rounded-lg border-2 border-blue-200 hover:border-blue-400 transition-colors cursor-pointer">
                  <RadioGroupItem value="New Student" id="new-student" className="mt-1" />
                  <div className="flex-1">
                    <Label htmlFor="new-student" className="text-base font-semibold text-gray-900 cursor-pointer flex items-center gap-2">
                      <UserPlus className="w-5 h-5 text-blue-600" />
                      New Student
                    </Label>
                    <p className="text-sm text-gray-600 mt-1">First time enrolling at Maranatha Christian Academy</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-4 bg-purple-50 rounded-lg border-2 border-purple-200 hover:border-purple-400 transition-colors cursor-pointer">
                  <RadioGroupItem value="Transferee" id="transferee" className="mt-1" />
                  <div className="flex-1">
                    <Label htmlFor="transferee" className="text-base font-semibold text-gray-900 cursor-pointer flex items-center gap-2">
                      <Users className="w-5 h-5 text-purple-600" />
                      Transferee
                    </Label>
                    <p className="text-sm text-gray-600 mt-1">Transferring from another school</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-4 bg-blue-50 rounded-lg border-2 border-blue-200 hover:border-blue-400 transition-colors cursor-pointer">
                  <RadioGroupItem value="Returning Student" id="returning-student" className="mt-1" />
                  <div className="flex-1">
                    <Label htmlFor="returning-student" className="text-base font-semibold text-gray-900 cursor-pointer flex items-center gap-2">
                      <Users className="w-5 h-5 text-blue-600" />
                      Returning Student
                    </Label>
                    <p className="text-sm text-gray-600 mt-1">Previously enrolled, returning after a gap</p>
                  </div>
                </div>
              </RadioGroup>
            )}
          </div>
          <div className="flex gap-3 justify-end">
            <Button
              variant="outline"
              onClick={() => setShowEnrollmentTypeModal(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleEnrollmentTypeConfirm}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
              disabled={!selectedEnrollmentType}
            >
              Continue
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Continuing Student Auto-Enrollment Preview Dialog */}
      <Dialog open={showContinuingPreview} onOpenChange={setShowContinuingPreview}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center py-2">
              Enrollment Confirmation
            </DialogTitle>
          </DialogHeader>

          {continuingPreviewData && (
            <div className="space-y-6 py-4">
              {/* Main Confirmation Message */}
              <div className="bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-200 rounded-lg p-6 text-center">
                <p className="text-sm text-gray-600 mb-2">You are now enrolling for</p>
                <p className="text-3xl font-bold text-green-600 mb-1">{continuingPreviewData.next_grade}</p>
                <p className="text-lg font-semibold text-gray-800">
                  School Year {continuingPreviewData.enrolling_school_year || '2026-2027'}
                </p>
              </div>

              {/* Student Info */}
              <div className="border rounded-lg p-4 bg-gray-50">
                <h3 className="font-semibold text-gray-900 mb-3">Student Information</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Name:</span>
                    <span className="font-medium">
                      {continuingPreviewData.learner?.first_name} {continuingPreviewData.learner?.last_name}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Current Grade:</span>
                    <span className="font-medium text-blue-600">{continuingPreviewData.current_grade}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Enrolled Grade:</span>
                    <span className="font-medium text-green-600">{continuingPreviewData.next_grade}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Gender:</span>
                    <span className="font-medium">{continuingPreviewData.learner?.gender}</span>
                  </div>
                </div>
              </div>

              {/* Parent/Guardian Contact */}
              {continuingPreviewData.contacts && continuingPreviewData.contacts.length > 0 && (
                <div className="border rounded-lg p-4 bg-gray-50">
                  <h3 className="font-semibold text-gray-900 mb-3">Parent/Guardian</h3>
                  <div className="space-y-2 text-sm">
                    {continuingPreviewData.contacts.slice(0, 2).map((contact: any, idx: number) => (
                      <div key={idx} className="p-2 bg-white rounded border border-gray-200">
                        <p className="font-medium text-gray-900">{contact.name}</p>
                        <p className="text-xs text-gray-600">{contact.contact_type || contact.type}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Address Info */}
              {continuingPreviewData.addresses && continuingPreviewData.addresses.length > 0 && (
                <div className="border rounded-lg p-4 bg-gray-50">
                  <h3 className="font-semibold text-gray-900 mb-3">Residential Address</h3>
                  <div className="text-sm">
                    {continuingPreviewData.addresses.find((a: any) => a.address_type === 'Current') && (
                      <div className="p-2 bg-white rounded border border-gray-200">
                        <p className="font-medium text-gray-900">Current Address</p>
                        <p className="text-gray-600 text-xs">
                          {continuingPreviewData.addresses.find((a: any) => a.address_type === 'Current')?.address},
                          {' '}{continuingPreviewData.addresses.find((a: any) => a.address_type === 'Current')?.municipality}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Confirmation Notice */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-900 font-medium mb-2">ℹ️ Important Information</p>
                <ul className="text-xs text-blue-800 space-y-1">
                  <li>• All information is from your previous enrollment</li>
                  <li>• Your enrollment will be automatically submitted</li>
                  <li>• You will be notified once admin approves your enrollment</li>
                  <li>• Typical approval takes 2-3 business days</li>
                </ul>
              </div>
            </div>
          )}

          <div className="flex gap-3 justify-end pt-4 border-t">
            <Button
              variant="outline"
              onClick={handleCancelContinuingPreview}
              disabled={isAutoCreating}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAutoCreateContinuingEnrollment}
              disabled={isAutoCreating}
              className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white"
            >
              {isAutoCreating ? 'Submitting...' : 'Submit Enrollment'}
              <CheckCircle2 className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Tour Help Button */}
      <TourHelpButton tourOptions={tourOptions} />
    </DashboardLayout>
  );
};

export default MyEnrollments;
