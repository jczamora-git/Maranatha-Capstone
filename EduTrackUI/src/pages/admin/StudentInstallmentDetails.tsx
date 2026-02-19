import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  ArrowLeft,
  DollarSign,
  Edit,
  CheckCircle,
  User,
  FileText,
  AlertCircle,
  XCircle
} from "lucide-react";
import { API_ENDPOINTS, apiGet, apiPost, apiPut } from "@/lib/api";
import { AlertMessage } from "@/components/AlertMessage";
import { useConfirm } from "@/components/Confirm";

type PaymentPlan = {
  id: string;
  student_id: string;
  student_name: string;
  student_number: string;
  enrollment_id?: string;
  academic_period_id: string;
  academic_period: string;
  total_tuition: number;
  total_paid: number;
  balance: number;
  schedule_type: "Monthly" | "Quarterly" | "Semestral" | "Tri Semestral";
  number_of_installments: number;
  status: "Active" | "Completed" | "Overdue" | "Cancelled";
  start_date?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
};

type Installment = {
  id: string;
  payment_plan_id: string;
  installment_number: number;
  amount_due: number;
  amount_paid: number;
  balance: number;
  due_date: string;
  paid_date?: string;
  status: "Pending" | "Paid" | "Partial" | "Overdue";
  late_fee: number;
  days_overdue: number;
};

export default function StudentInstallmentDetails() {
  const navigate = useNavigate();
  const { planId } = useParams<{ planId: string }>();
  const { user } = useAuth();
  const confirmFn = useConfirm();

  const [plan, setPlan] = useState<PaymentPlan | null>(null);
  const [installments, setInstallments] = useState<Installment[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [isEditingInstallments, setIsEditingInstallments] = useState(false);
  const [editedInstallments, setEditedInstallments] = useState<Installment[]>([]);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [selectedInstallment, setSelectedInstallment] = useState<Installment | null>(null);
  const [isSubmittingPayment, setIsSubmittingPayment] = useState(false);

  const [paymentForm, setPaymentForm] = useState({
    amount: "",
    payment_method: "Cash",
    payment_date: new Date().toISOString().split('T')[0],
    reference_number: "",
    remarks: ""
  });

  const PAYMENT_METHODS = ["Cash", "Check", "Bank Transfer", "GCash", "PayMaya", "Others"];

  const generateReceiptNumber = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `RCP-${year}${month}-${random}`;
  };

  const checkReferenceNumberExists = async (referenceNumber: string): Promise<boolean> => {
    try {
      const response = await apiGet(`/api/payments/check-reference?reference=${encodeURIComponent(referenceNumber)}`);
      return response?.exists || false;
    } catch (error) {
      console.error('Error checking reference number:', error);
      return false;
    }
  };

  const generateInvoiceNumber = async (): Promise<string> => {
    const maxAttempts = 5;
    
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const date = new Date();
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      const seconds = String(date.getSeconds()).padStart(2, '0');
      const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
      
      const invoiceNumber = `MCAFINV-${year}${month}${day}${hours}${minutes}${seconds}${random}`;
      
      const exists = await checkReferenceNumberExists(invoiceNumber);
      
      if (!exists) {
        return invoiceNumber;
      }
      
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    const timestamp = Date.now();
    return `MCAFINV-${timestamp}`;
  };

  useEffect(() => {
    if (user?.role !== "admin") {
      navigate("/unauthorized");
      return;
    }
    if (planId) {
      fetchData();
    }
  }, [user, planId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [planRes, installmentsRes, paymentsRes] = await Promise.all([
        apiGet(`${API_ENDPOINTS.PAYMENT_PLANS}/${planId}`),
        apiGet(`${API_ENDPOINTS.PAYMENT_PLANS}/${planId}/installments`),
        apiGet(API_ENDPOINTS.PAYMENTS)
      ]);

      if (planRes.success) {
        setPlan(planRes.data);
      }
      if (installmentsRes.success) {
        const installmentData = installmentsRes.data || [];
        setInstallments(installmentData);
        setEditedInstallments(installmentData);
      }
      if (paymentsRes.success) {
        setPayments(paymentsRes.data || []);
      }
    } catch (err) {
      setError("Failed to load payment plan details");
    } finally {
      setLoading(false);
    }
  };

  const handleEditInstallments = () => {
    setIsEditingInstallments(true);
    setEditedInstallments([...installments]);
  };

  const handleCancelEdit = () => {
    setIsEditingInstallments(false);
    setEditedInstallments([...installments]);
  };

  const handleSaveInstallments = async () => {
    const confirmed = await confirmFn({
      title: "Confirm Installment Changes",
      description: "Are you sure you want to save these changes? This will update the due dates and amounts for all installments.",
      confirmText: "Save Changes",
      cancelText: "Cancel"
    });

    if (!confirmed) return;

    try {
      const updates = editedInstallments.map(inst => 
        apiPut(`${API_ENDPOINTS.PAYMENT_PLANS}/installments/${inst.id}`, {
          due_date: inst.due_date,
          amount_due: inst.amount_due
        })
      );
      
      await Promise.all(updates);
      
      setSuccess("Installments updated successfully");
      setIsEditingInstallments(false);
      setInstallments([...editedInstallments]);
    } catch (err) {
      setError("Failed to update installments");
    }
  };

  const handleInstallmentChange = (index: number, field: string, value: any) => {
    const updated = [...editedInstallments];
    updated[index] = { ...updated[index], [field]: value };
    setEditedInstallments(updated);
  };

  const handlePayInstallment = async (installment: Installment) => {
    setSelectedInstallment(installment);
    const invoiceNumber = await generateInvoiceNumber();
    setPaymentForm({
      amount: installment.balance.toString(),
      payment_method: "Cash",
      payment_date: new Date().toISOString().split('T')[0],
      reference_number: invoiceNumber,
      remarks: ""
    });
    setIsPaymentOpen(true);
  };

  const handleSubmitPayment = async () => {
    if (!selectedInstallment || !plan) {
      setError("Missing installment or plan information");
      return;
    }

    if (!paymentForm.amount || parseFloat(paymentForm.amount) <= 0) {
      setError("Please enter a valid payment amount");
      return;
    }

    const paymentAmount = parseFloat(paymentForm.amount);
    const installmentBalance = selectedInstallment.balance;

    if (paymentAmount > installmentBalance) {
      setError(`Payment amount cannot exceed remaining balance (₱${installmentBalance.toFixed(2)})`);
      return;
    }

    const recentPayment = payments.find(
      (p) => p.installment_id === selectedInstallment.id && p.status !== 'Rejected'
    );

    if (recentPayment) {
      setError(
        `This installment already has a ${recentPayment.status} payment recorded on ${new Date(recentPayment.payment_date).toLocaleDateString()}. Recording another payment may create a duplicate.`
      );
      return;
    }

    if (isSubmittingPayment) {
      return;
    }

    setIsSubmittingPayment(true);

    try {
      const res = await apiPost(API_ENDPOINTS.PAYMENTS, {
        student_id: plan.student_id,
        enrollment_id: plan.enrollment_id,
        academic_period_id: plan.academic_period_id,
        payment_type: "Tuition Installment",
        payment_for: `Installment #${selectedInstallment.installment_number} - ${plan.academic_period}`,
        amount: paymentAmount,
        payment_method: paymentForm.payment_method,
        payment_date: paymentForm.payment_date,
        reference_number: paymentForm.reference_number,
        installment_id: selectedInstallment.id,
        remarks: paymentForm.remarks,
        status: "Approved",
        receipt_number: generateReceiptNumber(),
        received_by: user?.id
      });

      if (res.success) {
        setSuccess("Payment recorded successfully");
        setIsPaymentOpen(false);
        setPaymentForm({
          amount: "",
          payment_method: "Cash",
          payment_date: new Date().toISOString().split('T')[0],
          reference_number: "",
          remarks: ""
        });
        fetchData();
      } else {
        setError(res.message || "Failed to record payment");
      }
    } catch (err) {
      console.error("Error recording payment:", err);
      setError("Error recording payment. Please try again.");
    } finally {
      setIsSubmittingPayment(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      Active: "bg-blue-100 text-blue-800",
      Completed: "bg-green-100 text-green-800",
      Overdue: "bg-red-100 text-red-800",
      Cancelled: "bg-gray-100 text-gray-800",
    };
    return variants[status] || "";
  };

  const getInstallmentStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      Pending: "bg-yellow-100 text-yellow-800",
      Paid: "bg-green-100 text-green-800",
      Partial: "bg-orange-100 text-orange-800",
      Overdue: "bg-red-100 text-red-800",
    };
    return variants[status] || "";
  };

  const getStatusIcon = (status: string) => {
    const icons: Record<string, JSX.Element> = {
      Active: <AlertCircle className="h-5 w-5 text-blue-600" />,
      Completed: <CheckCircle className="h-5 w-5 text-green-600" />,
      Overdue: <XCircle className="h-5 w-5 text-red-600" />,
      Cancelled: <XCircle className="h-5 w-5 text-gray-600" />,
    };
    return icons[status] || null;
  };

  if (!user || user.role !== "admin") {
    return null;
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading payment plan...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!plan) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-muted-foreground">Payment plan not found</p>
            <Button onClick={() => navigate("/admin/payment-plans")} className="mt-4">
              Back to Payment Plans
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="outline"
            onClick={() => navigate("/admin/payment-plans")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
              Payment Plan: {plan.student_name}
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage installments and payment records
            </p>
          </div>
        </div>

        {/* Alert Messages */}
        {error && <AlertMessage type="error" message={error} onClose={() => setError("")} />}
        {success && <AlertMessage type="success" message={success} onClose={() => setSuccess("")} />}

        {/* Plan Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <User className="h-5 w-5 text-blue-600" />
                <p className="text-sm text-blue-600 font-semibold">Student Details</p>
              </div>
              <p className="text-xl font-bold text-blue-900">{plan.student_name}</p>
              <p className="text-sm text-blue-700">{plan.student_number}</p>
              <p className="text-xs text-blue-600 mt-2">{plan.academic_period}</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <DollarSign className="h-5 w-5 text-green-600" />
                <p className="text-sm text-green-600 font-semibold">Payment Progress</p>
              </div>
              <p className="text-2xl font-bold text-green-900">
                ₱{Number(plan.total_paid).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
              </p>
              <p className="text-sm text-green-700">
                of ₱{Number(plan.total_tuition).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
              </p>
              <div className="w-full bg-green-200 rounded-full h-2 mt-3">
                <div
                  className="bg-green-600 h-2 rounded-full"
                  style={{ width: `${((Number(plan.total_paid) / Number(plan.total_tuition)) * 100)}%` }}
                ></div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-orange-100">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-3">
                {getStatusIcon(plan.status)}
                <p className="text-sm text-orange-600 font-semibold">Plan Status</p>
              </div>
              <div className="flex items-center gap-2 mb-2">
                <Badge className={getStatusBadge(plan.status)}>{plan.status}</Badge>
                <Badge variant="outline">{plan.schedule_type}</Badge>
              </div>
              <p className="text-xl font-bold text-orange-900">
                ₱{Number(plan.balance).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
              </p>
              <p className="text-sm text-orange-700">Remaining Balance</p>
            </CardContent>
          </Card>
        </div>

        {/* Payment Progress Summary */}
        <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <CardContent className="p-6">
            <h4 className="font-semibold text-sm mb-3 text-blue-900">Overall Progress</h4>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Paid</span>
                <span className="font-bold text-green-600">
                  ₱{Number(plan.total_paid).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-green-500 to-emerald-600 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${((Number(plan.total_paid) / Number(plan.total_tuition)) * 100).toFixed(1)}%` }}
                >
                </div>
              </div>
              <div className="flex justify-between text-xs text-gray-500">
                <span>{((Number(plan.total_paid) / Number(plan.total_tuition)) * 100).toFixed(1)}% Complete</span>
                <span>{installments.filter(i => i.status === 'Paid').length} of {installments.length} installments paid</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Installments Schedule */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="border-b bg-gradient-to-r from-gray-50 to-gray-100">
            <div className="flex justify-between items-center">
              <CardTitle className="text-xl">Installment Schedule</CardTitle>
              {!isEditingInstallments && installments.length > 0 && (
                <Button variant="outline" size="sm" onClick={handleEditInstallments}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Schedule
                </Button>
              )}
              {isEditingInstallments && (
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleCancelEdit}>
                    Cancel
                  </Button>
                  <Button size="sm" onClick={handleSaveInstallments}>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Save Changes
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {(isEditingInstallments ? editedInstallments : installments).map((installment, index) => (
                <div
                  key={installment.id}
                  className="flex items-center justify-between p-6 border-2 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="flex flex-col items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 border-2 border-primary/30">
                      <span className="text-xs text-muted-foreground font-medium">No.</span>
                      <span className="font-bold text-primary text-lg">{installment.installment_number}</span>
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-lg">
                        Installment #{installment.installment_number}
                      </p>
                      {!isEditingInstallments ? (
                        <>
                          <p className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                            <Calendar className="h-3 w-3" />
                            Due: {new Date(installment.due_date).toLocaleDateString()}
                            {installment.paid_date && (
                              <span className="text-green-600 font-medium">
                                • Paid: {new Date(installment.paid_date).toLocaleDateString()}
                              </span>
                            )}
                          </p>
                          {installment.days_overdue > 0 && (
                            <p className="text-xs text-red-600 font-medium mt-1">
                              {installment.days_overdue} days overdue
                              {installment.late_fee > 0 && ` • Late fee: ₱${installment.late_fee.toFixed(2)}`}
                            </p>
                          )}
                        </>
                      ) : (
                        <div className="flex gap-3 mt-2">
                          <div>
                            <Label className="text-xs">Due Date</Label>
                            <Input
                              type="date"
                              value={installment.due_date}
                              onChange={(e) => handleInstallmentChange(index, 'due_date', e.target.value)}
                              className="h-9 text-sm"
                            />
                          </div>
                          <div>
                            <Label className="text-xs">Amount</Label>
                            <Input
                              type="number"
                              step="0.01"
                              value={installment.amount_due}
                              onChange={(e) => handleInstallmentChange(index, 'amount_due', parseFloat(e.target.value))}
                              className="h-9 text-sm w-32"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  {!isEditingInstallments && (
                    <div className="text-right">
                      <p className="font-bold text-lg">
                        ₱{Number(installment.amount_due).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                      </p>
                      {installment.amount_paid > 0 && (
                        <p className="text-sm text-green-600 font-medium">
                          Paid: ₱{Number(installment.amount_paid).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                        </p>
                      )}
                      {installment.balance > 0 && (
                        <p className="text-sm text-orange-600 font-semibold">
                          Balance: ₱{Number(installment.balance).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-3 justify-end">
                        <Badge className={getInstallmentStatusBadge(installment.status)}>
                          {installment.status}
                        </Badge>
                        {(installment.status === 'Pending' || installment.status === 'Partial' || installment.status === 'Overdue') && (
                          <Button
                            size="sm"
                            onClick={() => handlePayInstallment(installment)}
                            className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                          >
                            <DollarSign className="h-3 w-3 mr-1" />
                            Pay Now
                          </Button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
            {installments.length === 0 && (
              <div className="text-center py-16">
                <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <p className="text-muted-foreground">No installments found for this plan</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Payment Dialog */}
        <Dialog open={isPaymentOpen} onOpenChange={setIsPaymentOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader className="border-b pb-4">
              <DialogTitle className="text-xl font-semibold">Record Installment Payment</DialogTitle>
            </DialogHeader>
            {selectedInstallment && plan && (
              <div className="space-y-4 py-4">
                {/* Installment Info */}
                <div className="p-4 bg-muted/50 rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="text-sm text-muted-foreground">Student</p>
                      <p className="font-semibold">{plan.student_name}</p>
                    </div>
                    <Badge className={getInstallmentStatusBadge(selectedInstallment.status)}>
                      {selectedInstallment.status}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-3">
                    <div>
                      <p className="text-xs text-muted-foreground">Installment</p>
                      <p className="font-medium">#{selectedInstallment.installment_number}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Due Date</p>
                      <p className="font-medium">{new Date(selectedInstallment.due_date).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Amount Due</p>
                      <p className="font-medium">₱{Number(selectedInstallment.amount_due).toLocaleString('en-PH', { minimumFractionDigits: 2 })}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Balance</p>
                      <p className="font-medium text-orange-600">₱{Number(selectedInstallment.balance).toLocaleString('en-PH', { minimumFractionDigits: 2 })}</p>
                    </div>
                  </div>
                </div>

                {/* Payment Form */}
                <div>
                  <Label>Payment Amount *</Label>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={paymentForm.amount}
                    onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                    max={selectedInstallment.balance}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Maximum: ₱{Number(selectedInstallment.balance).toFixed(2)}
                  </p>
                </div>

                <div>
                  <Label>Payment Method *</Label>
                  <Select 
                    value={paymentForm.payment_method} 
                    onValueChange={async (v) => {
                      const newForm = { ...paymentForm, payment_method: v };
                      if (v === "Cash") {
                        newForm.reference_number = await generateInvoiceNumber();
                      } else if (paymentForm.payment_method === "Cash") {
                        newForm.reference_number = "";
                      }
                      setPaymentForm(newForm);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PAYMENT_METHODS.map((method) => (
                        <SelectItem key={method} value={method}>{method}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Payment Date *</Label>
                  <Input
                    type="date"
                    value={paymentForm.payment_date}
                    onChange={(e) => setPaymentForm({ ...paymentForm, payment_date: e.target.value })}
                  />
                </div>

                <div>
                  <Label>Reference Number</Label>
                  <Input
                    placeholder="Check number, Transaction ID, etc."
                    value={paymentForm.reference_number}
                    onChange={(e) => setPaymentForm({ ...paymentForm, reference_number: e.target.value })}
                  />
                </div>

                <div>
                  <Label>Remarks</Label>
                  <Input
                    placeholder="Additional notes (optional)"
                    value={paymentForm.remarks}
                    onChange={(e) => setPaymentForm({ ...paymentForm, remarks: e.target.value })}
                  />
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setIsPaymentOpen(false)} disabled={isSubmittingPayment}>
                Cancel
              </Button>
              <Button onClick={handleSubmitPayment} disabled={isSubmittingPayment}>
                <DollarSign className="h-4 w-4 mr-2" />
                {isSubmittingPayment ? "Recording..." : "Record Payment"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
