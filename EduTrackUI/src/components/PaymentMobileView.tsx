import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Joyride, { CallBackProps, STATUS, EVENTS } from 'react-joyride';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Clock, AlertCircle, CheckCircle2, BookOpen, Gift, Users, Calendar, Shirt, Zap, HelpCircle, Download, ClipboardList, Eye, ChevronRight } from 'lucide-react';
import { PaymentItem, SchoolFee, Enrollment } from '@/types';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search } from 'lucide-react';

// Helper function to get greeting based on time
const getGreeting = (): string => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 18) return 'Good Afternoon';
  return 'Good Evening';
};

interface PaymentMobileProps {
  user: any;
  enrollment: any | null;
  payments: any[];
  allSchoolFees: any[];
  availableSchoolFees: any[];
  loading: boolean;
  error: string | null;
  handleSchoolFeeClick: (fee: any) => void;
  totalAmount: number;
  paidAmount: number;
  navigate: any;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  statusFilter: string;
  setStatusFilter: (status: string) => void;
  filteredPayments: any[];
  handleDownloadInvoice: (paymentId: number) => void;
  selectedFeeTypeMobile: string | null;
  setSelectedFeeTypeMobile: (type: string | null) => void;
  hasTuitionPayment?: boolean;
  paymentPlans?: any[];
  installments?: { [key: string]: any[] };
  handleViewInstallments?: (plan: any) => void;
  // Desktop modal props for mobile use
  showSchoolFeeModal?: boolean;
  setShowSchoolFeeModal?: (show: boolean) => void;
  selectedSchoolFee?: SchoolFee | null;
  showPaymentPlanModal?: boolean;
  setShowPaymentPlanModal?: (show: boolean) => void;
  runTour?: boolean;
  setRunTour?: (run: boolean) => void;
  setTourStepIndex?: (index: number) => void;
  tourOptions?: any[];
  tourSteps?: any[];
  tourStepIndex?: number;
  handleTourCallback?: (data: any) => void;
}

// Fee type icons
const feeTypeIcons: Record<string, { icon: React.ReactNode; color: string; label: string }> = {
  'Tuition': { icon: <BookOpen className="w-5 h-5" />, color: 'bg-blue-100 text-blue-600', label: 'Tuition' },
  'Miscellaneous': { icon: <Zap className="w-5 h-5" />, color: 'bg-purple-100 text-purple-600', label: 'Miscellaneous' },
  'Contribution': { icon: <Gift className="w-5 h-5" />, color: 'bg-green-100 text-green-600', label: 'Contribution' },
  'Event Fee': { icon: <Calendar className="w-5 h-5" />, color: 'bg-orange-100 text-orange-600', label: 'Event Fee' },
  'Book': { icon: <ClipboardList className="w-5 h-5" />, color: 'bg-indigo-100 text-indigo-600', label: 'Book' },
  'Uniform': { icon: <Shirt className="w-5 h-5" />, color: 'bg-pink-100 text-pink-600', label: 'Uniform' },
  'Other': { icon: <Users className="w-5 h-5" />, color: 'bg-gray-100 text-gray-600', label: 'Other' },
};

const statusConfig: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
  Pending: {
    bg: "bg-yellow-100",
    text: "text-yellow-800",
    icon: <Clock className="w-4 h-4" />,
  },
  Verified: {
    bg: "bg-blue-100",
    text: "text-blue-800",
    icon: <AlertCircle className="w-4 h-4" />,
  },
  Approved: {
    bg: "bg-green-100",
    text: "text-green-800",
    icon: <CheckCircle2 className="w-4 h-4" />,
  },
  Rejected: {
    bg: "bg-red-100",
    text: "text-red-800",
    icon: <AlertCircle className="w-4 h-4" />,
  },
};

export const PaymentMobileView = ({
  user,
  enrollment,
  payments,
  allSchoolFees,
  availableSchoolFees,
  loading,
  error,
  handleSchoolFeeClick,
  totalAmount,
  paidAmount,
  navigate,
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
  filteredPayments,
  handleDownloadInvoice,
  selectedFeeTypeMobile,
  setSelectedFeeTypeMobile,
  hasTuitionPayment = false,
  paymentPlans = [],
  installments = {},
  handleViewInstallments,
  showSchoolFeeModal,
  setShowSchoolFeeModal,
  selectedSchoolFee,
  showPaymentPlanModal,
  setShowPaymentPlanModal,
  runTour,
  setRunTour,
  setTourStepIndex,
  tourOptions,
  tourSteps = [],
  tourStepIndex = 0,
  handleTourCallback,
}: PaymentMobileProps) => {
  const getFeesForType = (feeType: string) => {
    return allSchoolFees.filter(fee => fee.fee_type === feeType);
  };

  const handleFeeIconClick = (feeType: string) => {
    const feesOfType = getFeesForType(feeType);
    if (feesOfType.length > 0) {
      // Show fee type modal to let user select specific fee
      setSelectedFeeTypeMobile(feeType);
    }
  };

  const greeting = getGreeting();

  // Define all fee types in order
  const allFeeTypes = ['Tuition', 'Miscellaneous', 'Contribution', 'Event Fee', 'Book', 'Uniform', 'Other'] as const;

  // Joyride styling configuration
  const joyrideStyling = {
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
      marginRight: 10,
      marginLeft: 'auto',
    },
    buttonSkip: {
      color: '#6b7280',
      fontSize: 14,
    },
    buttonClose: {
      height: 14,
      width: 14,
      right: 15,
      top: 15,
    },
  };

  return (
    <>
      <Joyride
        steps={tourSteps}
        run={runTour || false}
        stepIndex={tourStepIndex || 0}
        callback={handleTourCallback}
        continuous
        showProgress
        showSkipButton
        disableOverlayClose
        spotlightClicks
        styles={joyrideStyling}
        locale={{
          back: 'Previous',
          close: 'Close',
          last: 'Finish',
          next: 'Next',
          open: 'Open the dialog',
          skip: 'Skip tour',
        }}
      />
      <div className="p-3 space-y-3 pb-24">
      {/* Greeting Header */}
      <div id="payment-header" className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg p-3 space-y-1">
        <p className="text-xs opacity-90">{greeting}</p>
        <h1 className="text-lg font-bold">
          {user?.first_name} {user?.last_name}!
        </h1>
      </div>

      {/* Total Charges */}
      <Card id="summary-stats-section" className="shadow-lg border-0 bg-gradient-to-br from-blue-50 to-indigo-50">
        <CardContent className="pt-4">
          <p className="text-xs text-gray-600 mb-1">Amount Due</p>
          <p className="text-3xl font-bold text-blue-600">
            ₱{totalAmount.toLocaleString()}
          </p>
        </CardContent>
      </Card>

      {/* Amount Paid */}
      <div className="grid grid-cols-2 gap-2">
        <Card className="shadow-lg border-0 bg-green-50">
          <CardContent className="pt-3">
            <p className="text-xs text-green-600 mb-1">Amount Paid</p>
            <p className="text-lg font-bold text-green-700">
              ▲ ₱{paidAmount.toLocaleString()}
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-lg border-0 bg-gray-50">
          <CardContent className="pt-3">
            <p className="text-xs text-gray-600 mb-1">Total Discounts</p>
            <p className="text-lg font-bold text-gray-700">
              ▲ ₱{payments.reduce((sum, p) => sum + Number(p.total_discount), 0).toLocaleString()}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Fee Type Icons Grid */}
      <div className="space-y-2" id="school-fees-section">
        <h3 className="text-sm font-semibold text-gray-700">School Fees</h3>
        <div className="grid grid-cols-7 gap-2">
          {allFeeTypes.map((feeType) => {
            const feeConfig = feeTypeIcons[feeType];
            const feesOfType = getFeesForType(feeType);
            const hasFees = feesOfType.length > 0;
            const hasApprovedPayment = payments.some(p =>
              (p.payment_for.toLowerCase().includes(feeType.toLowerCase()) ||
                (feeType === 'Tuition' && p.payment_type.includes('Tuition'))) &&
              p.status === 'Approved'
            );
            // Disable if: no fees available, already approved payment, or non-tuition without tuition payment
            const isDisabled = !hasFees || hasApprovedPayment || (!hasTuitionPayment && feeType !== 'Tuition');

            return (
              <button
                key={feeType}
                onClick={() => handleFeeIconClick(feeType)}
                disabled={isDisabled}
                title={feeType}
                className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-all relative group ${
                  isDisabled
                    ? 'opacity-35 cursor-not-allowed'
                    : 'cursor-pointer hover:scale-110'
                } ${hasApprovedPayment ? 'opacity-60' : ''}`}
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${hasFees && !isDisabled ? feeConfig.color : 'bg-gray-100 text-gray-400'}`}>
                  <div className="w-5 h-5">
                    {feeConfig.icon}
                  </div>
                </div>
                {/* Tooltip (display below icon on mobile) */}
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                  {feeType}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Payment Details Section */}
      <div className="space-y-2" id="payment-details-section">
        <h3 className="text-sm font-semibold text-gray-700">Payment Details</h3>

        {/* Search and Filter */}
        <div id="search-filter-section" className="flex flex-col gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search by description or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-muted/50 border-muted text-sm py-2"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="bg-muted/50 border-muted text-sm h-9">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="Verified">Verified</SelectItem>
              <SelectItem value="Approved">Approved</SelectItem>
              <SelectItem value="Rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Payment Items List - Minimal */}
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {loading ? (
            <div className="text-center py-6">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-2"></div>
              <p className="text-xs text-muted-foreground">Loading...</p>
            </div>
          ) : error ? (
            <div className="text-center py-4 text-red-600">
              <AlertCircle className="w-5 h-5 mx-auto mb-1" />
              <p className="text-xs">{error}</p>
            </div>
          ) : filteredPayments.length > 0 ? (
            filteredPayments.map((payment) => {
              const config = statusConfig[payment.status];
              return (
                <div
                  key={payment.id}
                  className="p-2 border border-border rounded-lg bg-card text-sm space-y-1"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-foreground line-clamp-1 text-xs">
                        {payment.payment_for}
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        Receipt: {payment.receipt_number} {payment.payment_date && `• ${new Date(payment.payment_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`}
                      </p>
                    </div>
                    <Badge className={`${config.bg} flex-shrink-0`}>
                      <span className={`${config.text}`}>{payment.status}</span>
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-xs">
                      <p className="font-bold text-foreground">
                        ₱{Number(payment.net_amount).toLocaleString()}
                      </p>
                      {Number(payment.total_discount) > 0 && (
                        <p className="text-muted-foreground">
                          Disc: ₱{Number(payment.total_discount).toLocaleString()}
                        </p>
                      )}
                    </div>

                    <div className="flex gap-1">
                      {payment.proof_of_payment_url && (
                        <button
                          onClick={() => window.open(payment.proof_of_payment_url, '_blank')}
                          className="p-1.5 rounded text-blue-600 hover:bg-blue-50 transition-colors border border-blue-200"
                          title="View Proof of Payment"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {(() => {
                        // Check if this is an installment payment
                        const isTuitionInstallment = payment.payment_type === 'Tuition Installment' && payment.installment_id;
                        
                        // Find the related payment plan
                        let relatedPlan = null;
                        if (isTuitionInstallment && paymentPlans.length > 0) {
                          for (const plan of paymentPlans) {
                            const planInstallments = installments[plan.id] || [];
                            if (planInstallments.some((inst: any) => inst.id === payment.installment_id)) {
                              relatedPlan = plan;
                              break;
                            }
                          }
                        }

                        return (
                          <>
                            {relatedPlan && handleViewInstallments ? (
                              <button
                                onClick={() => handleViewInstallments(relatedPlan)}
                                className="p-1.5 rounded text-orange-600 hover:bg-orange-50 transition-colors border border-orange-200"
                                title="View Installment Details"
                              >
                                <Calendar className="w-3.5 h-3.5" />
                              </button>
                            ) : payment.status === 'Approved' ? (
                              <button
                                onClick={() => handleDownloadInvoice(payment.id)}
                                className="p-1.5 rounded text-green-600 hover:bg-green-50 transition-colors border border-green-200"
                                title="Download Invoice"
                              >
                                <Download className="w-3.5 h-3.5" />
                              </button>
                            ) : null}
                          </>
                        );
                      })()}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-4 text-muted-foreground">
              <p className="text-xs">No payments found</p>
            </div>
          )}
        </div>
      </div>

      {/* Important Notice */}
      <Card className="shadow-lg border border-blue-200 bg-blue-50 dark:bg-blue-950/20" id="important-notice-section">
        <CardHeader className="pb-2">
          <CardTitle className="text-xs flex items-center gap-2 text-blue-900 dark:text-blue-100">
            <AlertCircle className="w-4 h-4" />
            Important
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-1 text-xs text-blue-800 dark:text-blue-200">
            <li>• Payment must be made by due date</li>
            <li>• Confirmation sent via email</li>
            <li>• All payments are non-refundable</li>
          </ul>
        </CardContent>
      </Card>

      {/* Tour Selection Popover */}
      {tourOptions && tourOptions.length > 0 && (
        <Popover>
          <PopoverTrigger asChild>
            <button
              className="fixed bottom-6 right-6 flex items-center justify-center w-12 h-12 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-lg z-40"
              title="Payment Guide"
            >
              <HelpCircle className="w-6 h-6" />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-0 border-0 shadow-lg" side="top" align="end" sideOffset={16}>
            <div className="p-4 space-y-4">
              {/* Header */}
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-5 h-5 rounded bg-blue-100 flex items-center justify-center">
                    <HelpCircle className="w-4 h-4 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-foreground">Choose a Tour</h3>
                </div>
                <p className="text-xs text-muted-foreground">
                  Select which guided tour you'd like to take to learn about different features.
                </p>
              </div>

              {/* Tour Options */}
              <div className="space-y-2">
                {tourOptions.map((option: any) => (
                  <button
                    key={option.id}
                  onClick={() => {
                    // Execute the tour's onStart callback
                    if (option.onStart) {
                      option.onStart();
                    }
                  }}
                  className="w-full p-3 rounded-lg border border-border hover:border-blue-400 hover:bg-blue-50/50 transition-all text-left group flex items-center justify-between gap-3"
                >
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="text-blue-600 flex-shrink-0 mt-0.5">
                      {option.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-sm text-foreground group-hover:text-blue-700 transition-colors">
                        {option.title}
                      </h4>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {option.description}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-blue-600 flex-shrink-0 transition-colors" />
                </button>
              ))}
            </div>
          </div>
        </PopoverContent>
        </Popover>
      )}
      </div>
    </>
  );
};

// Modal for showing fees of a specific type
export const FeeTypeModal = ({
  isOpen,
  onClose,
  feeType,
  fees,
  onFeeSelect,
}: {
  isOpen: boolean;
  onClose: () => void;
  feeType: string | null;
  fees: SchoolFee[];
  onFeeSelect: (fee: SchoolFee) => void;
}) => {
  const feeConfig = feeType ? feeTypeIcons[feeType] : null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            {feeConfig && (
              <div className={`w-8 h-8 rounded flex items-center justify-center ${feeConfig.color}`}>
                {feeConfig.icon}
              </div>
            )}
            <DialogTitle className="text-lg">{feeType} Fees</DialogTitle>
          </div>
          <DialogDescription>
            Select a fee to proceed with payment
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          {fees.map((fee) => (
            <button
              key={fee.id}
              onClick={() => {
                onFeeSelect(fee);
                onClose();
              }}
              className="w-full p-3 border border-border rounded-lg hover:bg-blue-50 hover:border-blue-500 transition-all text-left"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <p className="font-semibold text-sm text-foreground mb-1">
                    {fee.fee_name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Type: {fee.fee_type}
                  </p>
                  {fee.description && (
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                      {fee.description}
                    </p>
                  )}
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-bold text-blue-600">
                    ₱{Number(fee.amount).toLocaleString()}
                  </p>
                  {fee.is_required && (
                    <Badge className="bg-red-100 text-red-800 text-xs mt-1">
                      Required
                    </Badge>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};
