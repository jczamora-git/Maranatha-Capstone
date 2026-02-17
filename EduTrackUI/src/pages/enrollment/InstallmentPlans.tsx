import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Joyride, { CallBackProps, STATUS, Step } from 'react-joyride';
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { usePaymentPageLock } from "@/hooks/usePaymentPageLock";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Calendar, AlertCircle, PhilippinePeso, CheckCircle2, Play } from "lucide-react";
import TourHelpButton from "@/components/TourHelpButton";
import { toast } from "sonner";
import { API_ENDPOINTS, apiGet, apiPost } from "@/lib/api";

interface InstallmentPlanState {
  enrollment: {
    id: number;
    student_id: number;
    academic_period_id: number;
    school_year: string;
    quarter: string;
    grade_level: string;
  };
  tuitionFee: {
    id: number;
    amount: number;
    fee_name: string;
  };
}

interface DiscountTemplate {
  id: number;
  name: string;
  type: string;
  value: number;
  value_type: 'Percentage' | 'Fixed Amount';
  description: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const InstallmentPlans = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  usePaymentPageLock(); // Protect this page - redirects to setup-pin if payment section not unlocked
  const [selectedPaymentType, setSelectedPaymentType] = useState<"Monthly" | "Quarterly" | "Semi-Annual" | "Custom">("Quarterly");
  const [numberOfInstallments, setNumberOfInstallments] = useState<number>(5);
  const [discountTemplates, setDiscountTemplates] = useState<DiscountTemplate[]>([]);
  const [isCreatingPlan, setIsCreatingPlan] = useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [pendingPlanData, setPendingPlanData] = useState<any>(null);
  // Demo tour state
  const [runDemoInstallmentTour, setRunDemoInstallmentTour] = useState(false);
  const [currentTourIndex, setCurrentTourIndex] = useState(0);

  // Mock data for demo tour
  const demoData = {
    studentName: 'Juan Dela Cruz',
    email: 'juandelacruz@gmail.com',
    schoolYear: '2026-2027',
    gradeLevel: 'Grade 1',
  };

  const displayStudentName = runDemoInstallmentTour ? demoData.studentName : `${user?.first_name} ${user?.last_name}`;
  const displayEmail = runDemoInstallmentTour ? demoData.email : user?.email;

  const demoInstallmentTourSteps: Step[] = [
    {
      target: '.installment-header',
      content: 'Welcome to the Installment Plan demo. This tour will guide you through setting up a payment plan.',
      placement: 'bottom',
      disableBeacon: true,
    },
    {
      target: '.enrollment-info',
      content: 'Here\'s your enrollment information for the current school year and grade level.',
      placement: 'bottom',
    },
    {
      target: '.monthly-plan',
      content: 'Monthly Plan: Pay in 10 monthly installments over the school year.',
      placement: 'right',
    },
    {
      target: '.quarterly-plan',
      content: 'Quarterly Plan (Recommended): Pay in 4 quarterly installments. Most popular option.',
      placement: 'right',
    },
    {
      target: '.semiannual-plan',
      content: 'Semi-Annual Plan: Pay in 2 semi-annual installments (every 6 months).',
      placement: 'right',
    },
    {
      target: '.custom-plan',
      content: 'Custom Plan: Choose from 3, 5, 6, 7, 8, or 9 installments. This gives you flexibility without overlapping standard payment schedules.',
      placement: 'right',
    },
    {
      target: '.custom-installments-setting',
      content: 'Use the dropdown or +/- buttons to select from available custom installment options: 3, 5, 6, 7, 8, or 9 payments. These options avoid overlapping with standard plans (Monthly=10, Quarterly=4, Semi-Annual=2).',
      placement: 'top',
    },
    {
      target: '.payment-summary',
      content: 'The Payment Summary shows your enrollment details and calculated payment amounts.',
      placement: 'left',
    },
    {
      target: '.proceed-to-pay-btn',
      content: 'Click "Proceed to Pay First Installment" to review and confirm your payment plan.',
      placement: 'top',
    },
    {
      target: 'body',
      content: 'When you click Proceed, a confirmation modal will appear showing: Plan Type, Number of Installments, Total Tuition, Per Installment amount, and the complete Installment Schedule with all due dates and amounts for each payment.',
      placement: 'center',
      disableBeacon: true,
    },
  ];

  const handleDemoInstallmentTourCallback = (data: CallBackProps) => {
    const { status, index, action } = data;

    console.log('=== Tour Callback ===', { 
      index, 
      action, 
      status,
      timestamp: new Date().toLocaleTimeString()
    });

    // Track current tour step
    setCurrentTourIndex(index);

    // Step 5: Auto-select custom plan
    if (index === 5) {
      console.log('Step 5: Auto-selecting Custom plan');
      setSelectedPaymentType('Custom');
      setNumberOfInstallments(5); // Use 5 as demo value (available in custom range)
    }

    // Smooth scroll to center the target element in viewport
    if (status === 'running' || status === 'waiting') {
      setTimeout(() => {
        const step = demoInstallmentTourSteps[index];
        if (step && step.target) {
          const element = document.querySelector(step.target);
          if (element) {
            console.log('Scrolling to target:', step.target);
            const elementRect = element.getBoundingClientRect();
            const elementTop = window.scrollY + elementRect.top;
            const viewportHeight = window.innerHeight;
            const scrollTarget = elementTop - (viewportHeight / 2) + (elementRect.height / 2);
            
            window.scrollTo({
              top: Math.max(0, scrollTarget),
              behavior: 'smooth'
            });
          }
        }
      }, 100);
    }

    if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
      console.log('Tour finished/skipped. Cleaning up...');
      setRunDemoInstallmentTour(false);
      setCurrentTourIndex(0);
      setShowConfirmationModal(false);
      localStorage.setItem('demoInstallmentTourCompleted', 'true');
    }
  };

  const state = location.state as InstallmentPlanState;

  useEffect(() => {
    if (!state || !state.enrollment || !state.tuitionFee) {
      toast.error("Invalid installment plan data. Redirecting...");
      navigate("/enrollment/payment");
    }
  }, [state, navigate]);

  // Fetch discount templates
  useEffect(() => {
    const fetchDiscountTemplates = async () => {
      try {
        const data = await apiGet(API_ENDPOINTS.DISCOUNT_TEMPLATES);
        if (data.success) {
          setDiscountTemplates(data.data || []);
        }
      } catch (err) {
        console.error('Error fetching discount templates:', err);
      }
    };

    fetchDiscountTemplates();
  }, []);

  // Set correct installments on mount based on default selection
  useEffect(() => {
    if (selectedPaymentType === "Quarterly") {
      setNumberOfInstallments(4);
    }
  }, []); // Run only on mount
  useEffect(() => {
    const demoTourCompleted = localStorage.getItem('demoInstallmentTourCompleted');
    if (!demoTourCompleted) {
      // Small delay to ensure DOM is ready
      const timer = setTimeout(() => {
        setRunDemoInstallmentTour(true);
      }, 2000); // Slightly longer delay than PaymentProcess
      return () => clearTimeout(timer);
    }
  }, []);
  useEffect(() => {
    console.log('Tour state changed:', {
      runDemoInstallmentTour,
      showConfirmationModal,
    });
  }, [runDemoInstallmentTour, showConfirmationModal]);

  if (!state || !state.enrollment || !state.tuitionFee) {
    return null;
  }

  const { enrollment, tuitionFee } = state;

  // Display variables for demo tour
  const displaySchoolYear = runDemoInstallmentTour ? demoData.schoolYear : enrollment.school_year;
  const displayGradeLevel = runDemoInstallmentTour ? demoData.gradeLevel : enrollment.grade_level;

  const handlePaymentTypeChange = (value: "Monthly" | "Quarterly" | "Semi-Annual" | "Custom") => {
    setSelectedPaymentType(value);
    // Auto-set installments based on type
    if (value === "Quarterly") setNumberOfInstallments(4);
    else if (value === "Semi-Annual") setNumberOfInstallments(2);
    else if (value === "Monthly") setNumberOfInstallments(10);
    else if (value === "Custom") setNumberOfInstallments(5); // Default to 5 for custom
  };

  const perInstallmentAmount = Number(tuitionFee.amount) / numberOfInstallments;

  // Calculate due dates for each installment
  const calculateDueDates = (startDate: Date, numInstallments: number, type: "Monthly" | "Quarterly" | "Semi-Annual" | "Custom") => {
    const dates: string[] = [];
    const currentDate = new Date(startDate);

    for (let i = 1; i <= numInstallments; i++) {
      if (type === "Monthly") {
        currentDate.setMonth(currentDate.getMonth() + 1);
      } else if (type === "Quarterly") {
        currentDate.setMonth(currentDate.getMonth() + 3);
      } else if (type === "Semi-Annual") {
        currentDate.setMonth(currentDate.getMonth() + 6);
      } else if (type === "Custom") {
        // For custom, spread evenly across the year
        const monthsInterval = Math.floor(10 / numInstallments); // 10 months spread
        currentDate.setMonth(currentDate.getMonth() + monthsInterval);
      }
      dates.push(currentDate.toISOString().split('T')[0]);
    }
    return dates;
  };

  // Get period label for each installment
  const getPeriodLabel = (installmentNumber: number, type: "Monthly" | "Quarterly" | "Semi-Annual" | "Custom") => {
    if (type === "Monthly") {
      return `Month ${installmentNumber}`;
    } else if (type === "Quarterly") {
      const quarters = ["1st Quarter", "2nd Quarter", "3rd Quarter", "4th Quarter"];
      return quarters[installmentNumber - 1] || `Quarter ${installmentNumber}`;
    } else if (type === "Semi-Annual") {
      const semesters = ["1st Semester", "2nd Semester"];
      return semesters[installmentNumber - 1] || `Period ${installmentNumber}`;
    } else if (type === "Custom") {
      return `Installment ${installmentNumber} of ${numberOfInstallments}`;
    }
    return `Installment ${installmentNumber}`;
  };

  const handleProceedToPayment = async () => {
    try {
      // Calculate due dates
      const startDate = new Date();
      const dueDates = calculateDueDates(startDate, numberOfInstallments, selectedPaymentType);

      // Create payment plan data (don't submit yet, just prepare)
      const paymentPlanData = {
        student_id: user?.id,
        enrollment_id: enrollment.id,
        academic_period_id: enrollment.academic_period_id,
        total_tuition: Number(tuitionFee.amount),
        schedule_type: selectedPaymentType,
        number_of_installments: numberOfInstallments,
        start_date: new Date().toISOString().split('T')[0],
        installments: Array.from({ length: numberOfInstallments }, (_, index) => ({
          installment_number: index + 1,
          amount_due: perInstallmentAmount,
          due_date: dueDates[index],
          status: "Pending",
          period_label: getPeriodLabel(index + 1, selectedPaymentType)
        }))
      };

      // Store the pending data and show confirmation modal
      setPendingPlanData(paymentPlanData);
      setShowConfirmationModal(true);
    } catch (error) {
      console.error("Error preparing payment plan:", error);
      toast.error("Failed to prepare payment plan. Please try again.");
    }
  };

  const handleConfirmPaymentPlan = async () => {
    if (!pendingPlanData) return;

    setIsCreatingPlan(true);
    try {
      // Scroll to top on mobile to show payment form clearly
      window.scrollTo(0, 0);

      const res = await apiPost(API_ENDPOINTS.PAYMENT_PLANS, pendingPlanData);

      if (res.success) {
        toast.success("Payment plan created successfully");
        setShowConfirmationModal(false);
        
        // Use plan_id from backend response (not id)
        const paymentPlanId = res.data?.plan_id;
        
        // Fetch the installments for this newly created plan
        let firstInstallment = null;
        try {
          const installmentsRes = await apiGet(API_ENDPOINTS.PAYMENT_PLAN_INSTALLMENTS(paymentPlanId.toString()));
          
          if (installmentsRes.success && installmentsRes.data && installmentsRes.data.length > 0) {
            // Get the first installment to pay
            firstInstallment = installmentsRes.data.find((inst: any) => inst.installment_number === 1);
          }
        } catch (err) {
          console.error('Error fetching installments:', err);
          // Continue even if fetch fails - PaymentProcess will try to fetch again
        }
        
        // Navigate to payment process with plan details and the first installment
        navigate('/enrollment/payment-process', {
          state: {
            enrollment,
            tuitionFee,
            paymentType: 'Installment Payment',
            installmentPlan: selectedPaymentType,
            numberOfInstallments,
            amountPerInstallment: perInstallmentAmount,
            paymentPlanId: paymentPlanId,
            installmentNumber: 1,
            periodLabel: getPeriodLabel(1, selectedPaymentType),
            paymentPlan: res.data,
            installment: firstInstallment // Pass the first installment data
          }
        });
      } else {
        toast.error(res.message || "Failed to create payment plan");
      }
    } catch (error) {
      console.error("Error creating payment plan:", error);
      toast.error("Failed to create payment plan. Please try again.");
    } finally {
      setIsCreatingPlan(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="p-4 sm:p-8 max-w-4xl mx-auto font-sans antialiased">
        {/* Back Button */}
          <div className="mb-6 sm:mb-8 installment-header">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/enrollment/payment')}
            className="mb-4 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Payment
          </Button>

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
            <div className="flex items-start gap-3 sm:gap-4">
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-r from-green-600 to-green-700 flex items-center justify-center shadow-lg flex-shrink-0">
                <Calendar className="h-6 sm:h-8 w-6 sm:w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-4xl font-bold bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent mb-1 sm:mb-2">
                  Installment Payment Plan
                </h1>
                <p className="text-muted-foreground text-xs sm:text-base">Flexible payment options for your tuition</p>
              </div>
            </div>
            <Badge variant="default" className="bg-gradient-to-r from-green-600 to-green-700 text-white text-xs sm:text-sm">
              Installment
            </Badge>
          </div>
        </div>

        {/* Enrollment Info */}
        <Card className="shadow-lg border-0 mb-6 enrollment-info">
          <CardHeader>
            <CardTitle className="text-lg">Enrollment Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground font-medium mb-1">School Year</p>
                <p className="text-base font-semibold text-foreground">{displaySchoolYear}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium mb-1">Grade Level</p>
                <p className="text-base font-semibold text-foreground">{displayGradeLevel}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium mb-1">Student Name</p>
                <p className="text-base font-semibold text-foreground">{displayStudentName}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium mb-1">Email</p>
                <p className="text-base font-semibold text-foreground">{displayEmail}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Plan Selection */}
          <div className="lg:col-span-2 space-y-6">
            {/* Plan Selection Card */}
            <Card className="shadow-lg border-0">
              <CardHeader>
                <CardTitle className="text-xl">Select Payment Schedule</CardTitle>
                <CardDescription>Choose how you would like to distribute your tuition payments</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Payment Schedule Selection */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-sm text-muted-foreground">Payment Frequency:</h4>
                  
                  <div className="grid gap-3">
                    {/* Monthly Plan */}
                    <button
                      onClick={() => handlePaymentTypeChange("Monthly")}
                      className={`p-4 border-2 rounded-lg transition-all text-left ${
                        selectedPaymentType === "Monthly"
                          ? "border-green-500 bg-green-50 dark:bg-green-950/20"
                          : "border-border hover:border-green-300"
                      } monthly-plan`}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h5 className="font-semibold text-foreground mb-1">Monthly Plan</h5>
                          <p className="text-xs text-muted-foreground">10 monthly payments</p>
                          <p className="text-sm font-bold text-green-600 mt-2">
                            ₱{(Number(tuitionFee.amount) / 10).toLocaleString()} per month
                          </p>
                        </div>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-1 ${
                          selectedPaymentType === "Monthly"
                            ? "border-green-500 bg-green-500"
                            : "border-muted-foreground"
                        }`}>
                          {selectedPaymentType === "Monthly" && (
                            <div className="w-2 h-2 bg-white rounded-full" />
                          )}
                        </div>
                      </div>
                    </button>

                    {/* Quarterly Plan */}
                    <button
                      onClick={() => handlePaymentTypeChange("Quarterly")}
                      className={`p-4 border-2 rounded-lg transition-all text-left ${
                        selectedPaymentType === "Quarterly"
                          ? "border-green-500 bg-green-50 dark:bg-green-950/20"
                          : "border-border hover:border-green-300"
                      } quarterly-plan`}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h5 className="font-semibold text-foreground mb-1">Quarterly Plan (Recommended)</h5>
                          <p className="text-xs text-muted-foreground">4 quarterly payments</p>
                          <p className="text-sm font-bold text-green-600 mt-2">
                            ₱{(Number(tuitionFee.amount) / 4).toLocaleString()} per quarter
                          </p>
                        </div>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-1 ${
                          selectedPaymentType === "Quarterly"
                            ? "border-green-500 bg-green-500"
                            : "border-muted-foreground"
                        }`}>
                          {selectedPaymentType === "Quarterly" && (
                            <div className="w-2 h-2 bg-white rounded-full" />
                          )}
                        </div>
                      </div>
                    </button>

                    {/* Semi-Annual Plan */}
                    <button
                      onClick={() => handlePaymentTypeChange("Semi-Annual")}
                      className={`p-4 border-2 rounded-lg transition-all text-left ${
                        selectedPaymentType === "Semi-Annual"
                          ? "border-green-500 bg-green-50 dark:bg-green-950/20"
                          : "border-border hover:border-green-300"
                      } semiannual-plan`}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h5 className="font-semibold text-foreground mb-1">Semi-Annual Plan</h5>
                          <p className="text-xs text-muted-foreground">2 semi-annual payments</p>
                          <p className="text-sm font-bold text-green-600 mt-2">
                            ₱{(Number(tuitionFee.amount) / 2).toLocaleString()} per period
                          </p>
                        </div>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-1 ${
                          selectedPaymentType === "Semi-Annual"
                            ? "border-green-500 bg-green-500"
                            : "border-muted-foreground"
                        }`}>
                          {selectedPaymentType === "Semi-Annual" && (
                            <div className="w-2 h-2 bg-white rounded-full" />
                          )}
                        </div>
                      </div>
                    </button>

                    {/* Custom Plan */}
                    <button
                      onClick={() => handlePaymentTypeChange("Custom")}
                      className={`p-4 border-2 rounded-lg transition-all text-left ${
                        selectedPaymentType === "Custom"
                          ? "border-green-500 bg-green-50 dark:bg-green-950/20"
                          : "border-border hover:border-green-300"
                      } custom-plan`}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h5 className="font-semibold text-foreground mb-1">Custom Plan</h5>
                          <p className="text-xs text-muted-foreground">Choose your own payment schedule</p>
                          <p className="text-sm font-bold text-green-600 mt-2">
                            Flexible installments (3-9 payments)
                          </p>
                        </div>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-1 ${
                          selectedPaymentType === "Custom"
                            ? "border-green-500 bg-green-500"
                            : "border-muted-foreground"
                        }`}>
                          {selectedPaymentType === "Custom" && (
                            <div className="w-2 h-2 bg-white rounded-full" />
                          )}
                        </div>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Custom Installments Settings */}
                {selectedPaymentType === "Custom" && (
                  <div className="border-t pt-6 space-y-4 custom-installments-setting">
                    <h4 className="font-semibold text-sm text-muted-foreground">Customize Number of Installments:</h4>
                    <div className="flex items-center gap-4">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const currentIndex = [3, 5, 6, 7, 8, 9].indexOf(numberOfInstallments);
                          if (currentIndex > 0) {
                            setNumberOfInstallments([3, 5, 6, 7, 8, 9][currentIndex - 1]);
                          }
                        }}
                        disabled={numberOfInstallments === 3}
                        className="h-10 w-10 p-0"
                      >
                        -
                      </Button>
                      <div className="flex-1">
                        <Select
                          value={selectedPaymentType === "Custom" ? numberOfInstallments.toString() : ""}
                          onValueChange={(value) => setNumberOfInstallments(parseInt(value))}
                          disabled={selectedPaymentType !== "Custom"}
                        >
                          <SelectTrigger className="text-center text-lg font-bold">
                            <SelectValue placeholder="Select installments" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="3">3 installments</SelectItem>
                            <SelectItem value="5">5 installments</SelectItem>
                            <SelectItem value="6">6 installments</SelectItem>
                            <SelectItem value="7">7 installments</SelectItem>
                            <SelectItem value="8">8 installments</SelectItem>
                            <SelectItem value="9">9 installments</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const currentIndex = [3, 5, 6, 7, 8, 9].indexOf(numberOfInstallments);
                          if (currentIndex < [3, 5, 6, 7, 8, 9].length - 1) {
                            setNumberOfInstallments([3, 5, 6, 7, 8, 9][currentIndex + 1]);
                          }
                        }}
                        disabled={numberOfInstallments === 9}
                        className="h-10 w-10 p-0"
                      >
                        +
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">Custom plans: 3, 5, 6, 7, 8, or 9 installments</p>
                  </div>
                )}

                {/* Important Notice */}
                <div className="border-t pt-6">
                  <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                      <div className="space-y-2">
                        <h5 className="font-semibold text-sm text-blue-900 dark:text-blue-100">Payment Information</h5>
                        <ul className="text-xs text-blue-800 dark:text-blue-200 space-y-1">
                          <li>• Each installment payment must be submitted on schedule</li>
                          <li>• Proof of payment is required for each transaction</li>
                          <li>• Late payments may affect your enrollment status</li>
                          <li>• Contact the admin office for special arrangements</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Payment Summary */}
          <div className="space-y-6">
            {/* Plan Summary Card */}
            <Card className="shadow-lg border-0 sticky top-8 payment-summary">
              <CardHeader>
                <CardTitle className="text-lg">Payment Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                {/* Student Section */}
                <div className="space-y-1 pb-4 border-b border-border">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Student</p>
                  <p className="text-sm font-semibold text-foreground">{displayStudentName}</p>
                  <p className="text-xs text-muted-foreground">{displayEmail}</p>
                </div>

                {/* Enrollment Details */}
                <div className="space-y-2 pb-4 border-b border-border">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Enrollment Details</p>
                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-muted-foreground">School Year:</span>
                    <span className="text-sm font-medium text-foreground">{displaySchoolYear}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">Grade Level:</span>
                    <span className="text-sm font-medium text-foreground">{displayGradeLevel}</span>
                    </div>
                  </div>
                </div>

                {/* Payment Type */}
                <div className="space-y-1 pb-4 border-b border-border">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Payment Type</p>
                  <p className="text-sm font-semibold text-blue-600">{selectedPaymentType} ({numberOfInstallments} installments)</p>
                </div>

                {/* Tuition Information */}
                <div className="space-y-2 pb-4 border-b border-border">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">Tuition Fee:</span>
                    <span className="text-sm font-medium text-foreground">₱{Number(tuitionFee.amount).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground font-semibold">Per Installment:</span>
                    <span className="text-lg font-bold text-blue-600">₱{perInstallmentAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">Total for {numberOfInstallments} installment(s):</span>
                    <span className="text-sm font-medium text-foreground">₱{Number(tuitionFee.amount).toLocaleString()}</span>
                  </div>
                </div>

                {/* Proceed Button */}
                <Button
                  onClick={handleProceedToPayment}
                  disabled={isCreatingPlan}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-4 text-sm rounded-lg proceed-to-pay-btn"
                >
                  {isCreatingPlan ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Creating Plan...
                    </>
                  ) : (
                    <>
                      <Calendar className="w-4 h-4 mr-2" />
                      Proceed to Pay First Installment
                    </>
                  )}
                </Button>

                {/* Info Box */}
                <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-blue-900 dark:text-blue-100">Your payment will be verified by the admin. You will receive a notification once approved.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      <Dialog open={showConfirmationModal} onOpenChange={setShowConfirmationModal}>
        <DialogContent className="sm:max-w-md confirm-payment-modal">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-blue-600" />
              Confirm Payment Plan
            </DialogTitle>
            <DialogDescription>
              Please review your payment plan details before proceeding
            </DialogDescription>
          </DialogHeader>

          {pendingPlanData && (
            <div className="space-y-4 py-4">
              {/* Plan Summary */}
              <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg space-y-3 border border-blue-200 dark:border-blue-800">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Plan Type:</span>
                    <span className="font-semibold text-foreground">{selectedPaymentType}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Number of Installments:</span>
                    <span className="font-semibold text-foreground">{numberOfInstallments}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Total Tuition:</span>
                    <span className="font-semibold text-foreground">₱{Number(tuitionFee.amount).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-blue-200 dark:border-blue-700">
                    <span className="text-sm font-semibold text-foreground">Per Installment:</span>
                    <span className="text-lg font-bold text-blue-600">₱{perInstallmentAmount.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Installment Schedule */}
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-foreground">Installment Schedule:</h4>
                <div className="max-h-48 overflow-y-auto space-y-2 installment-schedule">
                  {pendingPlanData.installments.slice(0, 4).map((inst: any, index: number) => (
                    <div key={index} className="flex justify-between items-center text-sm p-2 bg-muted/30 rounded">
                      <span className="text-muted-foreground">
                        #{inst.installment_number} - {new Date(inst.due_date).toLocaleDateString()}
                      </span>
                      <span className="font-medium">₱{inst.amount_due.toLocaleString()}</span>
                    </div>
                  ))}
                  {pendingPlanData.installments.length > 4 && (
                    <div className="text-xs text-muted-foreground text-center py-2">
                      ... and {pendingPlanData.installments.length - 4} more installments
                    </div>
                  )}
                </div>
              </div>

              {/* Warning */}
              <div className="bg-amber-50 dark:bg-amber-950/20 p-3 rounded-lg border border-amber-200 dark:border-amber-800">
                <p className="text-xs text-amber-900 dark:text-amber-100">
                  ⚠️ Once confirmed, you will be directed to pay the first installment. This plan cannot be modified after creation.
                </p>
              </div>
            </div>
          )}

            <DialogFooter className="flex gap-2 justify-end">
            <Button
              variant="outline"
              onClick={() => setShowConfirmationModal(false)}
              disabled={isCreatingPlan}
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmPaymentPlan}
              disabled={isCreatingPlan}
              className="bg-blue-600 hover:bg-blue-700 confirm-payment-btn"
            >
              {isCreatingPlan ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Confirm & Proceed
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Demo Installment Plan Tour - Render as portal for full coverage */}
      {createPortal(
        <Joyride
          steps={demoInstallmentTourSteps}
          run={runDemoInstallmentTour}
          callback={handleDemoInstallmentTourCallback}
          continuous={true}
          showProgress={true}
          showSkipButton={true}
          disableScrolling={true}
          scrollToFirstStep={false}
          styles={{
            options: {
              primaryColor: '#16a34a',
              textColor: '#1f2937',
              backgroundColor: '#ffffff',
              overlayColor: 'rgba(0, 0, 0, 0.6)',
              spotlightShadow: '0 0 20px rgba(0, 0, 0, 0.7)',
              zIndex: 999999,
            },
            tooltip: { 
              borderRadius: 8, 
              fontSize: 14, 
              maxWidth: 300,
              zIndex: 999999,
            },
            buttonNext: { backgroundColor: '#16a34a' },
            buttonSkip: { color: '#6b7280' },
          }}
          spotlightPadding={8}
        />,
        document.body
      )}

      <TourHelpButton
        tourOptions={[
          {
            id: 'demo-installment',
            title: 'Installment Demo',
            description: 'Guided demo for creating an installment payment plan.',
            icon: <Play className="h-5 w-5 text-green-600" />,
            onStart: () => setRunDemoInstallmentTour(true),
          },
        ]}
      />
    </DashboardLayout>
  );
};

export default InstallmentPlans;
