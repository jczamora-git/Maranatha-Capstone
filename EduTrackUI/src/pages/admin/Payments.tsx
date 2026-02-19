import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  DollarSign,
  Search,
  Filter,
  Download,
  Plus,
  Receipt,
  Calendar,
  User,
  CreditCard,
  CheckCircle,
  Clock,
  XCircle,
  Eye,
  Edit,
  TrendingUp,
  Wallet,
  FileText,
  Settings,
  X,
  Trash2,
  Save,
  CalendarClock,
  Tag,
  ChevronDown,
  Package,
  Shirt,
  GraduationCap,
  HandCoins,
  CalendarDays,
  BookOpen,
  Layers,
  MoreHorizontal
} from "lucide-react";
import { API_ENDPOINTS, apiGet, apiPost, apiPut, apiDelete } from "@/lib/api";
import { AlertMessage } from "@/components/AlertMessage";
import { useConfirm } from "@/components/Confirm";
import DiscountDialog from "@/components/admin/payments/DiscountDialog";

type Payment = {
  id: string;
  student_id: string;
  student_name: string;
  student_number: string;
  enrollment_id?: string;
  academic_period: string;
  academic_period_id: string;
  receipt_number: string;
  payment_type: string;
  payment_for: string;
  amount: number;
  net_amount?: number;
  payment_method: string;
  payment_date: string;
  reference_number?: string;
  status: string;
  proof_of_payment_url?: string;
  is_refund: boolean;
  remarks?: string;
  received_by_name?: string;
  verified_by_name?: string;
  verified_at?: string;
};

type Student = {
  id: string;
  student_id: string;
  first_name: string;
  last_name: string;
  year_level: string;
  enrollment_id?: string; // For filtering enrolled students
};

type AcademicPeriod = {
  id: string;
  school_year: string;
  quarter: string;
  status: 'active' | 'past' | 'upcoming';
  description?: string;
};

type SchoolFee = {
  id: string;
  academic_period_id: string;
  academic_period?: string;
  year_level: string | null; // null means all grades, otherwise specific grade
  year_levels?: string[]; // array of applicable grades
  fee_type: string;
  fee_name: string;
  amount: number;
  is_required: boolean;
  due_date?: string;
  is_active: boolean;
  description?: string;
  grouped_ids?: string[]; // IDs of all fees grouped together
};

type Discount = {
  id: string;
  student_id: string;
  student_name?: string;
  academic_period_id: string;
  academic_period?: string;
  discount_type: string;
  discount_name: string;
  discount_amount: number | null;
  discount_percentage: number | null;
  applies_to: string;
  status: string;
  approved_by?: string;
  approved_at?: string;
  valid_from?: string;
  valid_until?: string;
  remarks?: string;
};

type DiscountTemplate = {
  id: string;
  name: string;
  type: 'Scholarship' | 'Sibling' | 'Staff' | 'Early Bird' | 'Other';
  value: number;
  value_type: 'Percentage' | 'Fixed Amount';
  description?: string;
  is_active: boolean;
};

// Payment types for creating NEW payments (Tuition Installment removed - created via Payment Plans)
const PAYMENT_TYPES = [
  "Tuition Full Payment",
  "Miscellaneous",
  "Contribution",
  "Event Fee",
  "Book",
  "Uniform",
  "Other"
];

const PAYMENT_TYPE_PICKER_OPTIONS = [
  {
    value: "Tuition Full Payment",
    label: "Tuition",
    icon: GraduationCap,
    className: "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
  },
  {
    value: "Miscellaneous",
    label: "Miscellaneous",
    icon: Layers,
    className: "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
  },
  {
    value: "Contribution",
    label: "Contribution",
    icon: HandCoins,
    className: "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
  },
  {
    value: "Event Fee",
    label: "Event Fee",
    icon: CalendarDays,
    className: "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100"
  },
  {
    value: "Book",
    label: "Book",
    icon: BookOpen,
    className: "bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100"
  },
  {
    value: "Uniform",
    label: "Uniform",
    icon: Shirt,
    className: "bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100"
  },
  {
    value: "Other",
    label: "Other",
    icon: MoreHorizontal,
    className: "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
  }
];

const FEE_TYPES = [
  "Tuition",
  "Miscellaneous",
  "Contribution",
  "Event Fee",
  "Book",
  "Uniform",
  "Other"
];

const YEAR_LEVELS = [
  "All Grades",
  "Nursery 1",
  "Nursery 2",
  "Kinder",
  "Grade 1",
  "Grade 2",
  "Grade 3",
  "Grade 4",
  "Grade 5",
  "Grade 6"
];

const PAYMENT_METHODS = [
  "Cash",
  "Check",
  "Bank Transfer",
  "GCash",
  "PayMaya",
  "Others"
];

const PAYMENT_STATUS = [
  "Pending",
  "Verified",
  "Approved",
  "Rejected"
];

const DISCOUNT_TYPES = [
  "Scholarship",
  "Sibling",
  "Early Bird",
  "Staff",
  "Other"
];

const DISCOUNT_APPLIES_TO = [
  "Tuition",
  "All Fees",
  "Miscellaneous",
  "Specific Fee"
];

const DISCOUNT_STATUS = [
  "Active",
  "Expired",
  "Revoked"
];

// Mock Discounts Data
const MOCK_DISCOUNTS: Discount[] = [
  {
    id: "1",
    student_id: "31",
    student_name: "John Michael Doe",
    academic_period_id: "30",
    academic_period: "2026-2027 - 1st Quarter",
    discount_type: "Scholarship",
    discount_name: "Academic Excellence Scholarship",
    discount_amount: null,
    discount_percentage: 50.00,
    applies_to: "Tuition",
    status: "Active",
    approved_by: "Admin User",
    approved_at: "2026-01-15T10:00:00",
    valid_from: "2026-08-01",
    valid_until: "2027-05-30",
    remarks: "Maintained honor roll status"
  },
  {
    id: "2",
    student_id: "32",
    student_name: "Maria Garcia",
    academic_period_id: "30",
    academic_period: "2026-2027 - 1st Quarter",
    discount_type: "Sibling Discount",
    discount_name: "10% Sibling Discount",
    discount_amount: null,
    discount_percentage: 10.00,
    applies_to: "Tuition",
    status: "Active",
    approved_by: "Admin User",
    approved_at: "2026-01-10T14:30:00",
    valid_from: "2026-08-01",
    valid_until: "2027-05-30",
    remarks: "2nd child enrolled"
  },
  {
    id: "3",
    student_id: "33",
    student_name: "Carlos Rodriguez",
    academic_period_id: "30",
    academic_period: "2026-2027 - 1st Quarter",
    discount_type: "Early Bird",
    discount_name: "Early Enrollment Discount",
    discount_amount: 500.00,
    discount_percentage: null,
    applies_to: "Enrollment Fee",
    status: "Active",
    approved_by: "Admin User",
    approved_at: "2026-01-05T09:00:00",
    valid_from: "2026-01-01",
    valid_until: "2026-07-31",
    remarks: "Enrolled before July 2026"
  },
  {
    id: "4",
    student_id: "34",
    student_name: "Sofia Chen",
    academic_period_id: "30",
    academic_period: "2026-2027 - 1st Quarter",
    discount_type: "Financial Assistance",
    discount_name: "Need-Based Grant",
    discount_amount: null,
    discount_percentage: 75.00,
    applies_to: "All Fees",
    status: "Active",
    approved_by: "Principal Smith",
    approved_at: "2026-01-20T11:00:00",
    valid_from: "2026-08-01",
    valid_until: "2027-05-30",
    remarks: "Family experiencing financial hardship"
  },
  {
    id: "5",
    student_id: "30",
    student_name: "Ahmed Hassan",
    academic_period_id: "30",
    academic_period: "2026-2027 - 1st Quarter",
    discount_type: "Staff Discount",
    discount_name: "Employee Child Discount",
    discount_amount: null,
    discount_percentage: 20.00,
    applies_to: "Tuition",
    status: "Active",
    approved_by: "HR Director",
    approved_at: "2026-01-08T08:00:00",
    valid_from: "2026-08-01",
    valid_until: "2027-05-30",
    remarks: "Child of teaching staff"
  },
  {
    id: "6",
    student_id: "31",
    student_name: "John Michael Doe",
    academic_period_id: "29",
    academic_period: "2025-2026 - 4th Quarter",
    discount_type: "Scholarship",
    discount_name: "Academic Excellence Scholarship",
    discount_amount: null,
    discount_percentage: 50.00,
    applies_to: "Tuition",
    status: "Expired",
    approved_by: "Admin User",
    approved_at: "2025-08-15T10:00:00",
    valid_from: "2025-08-01",
    valid_until: "2026-05-30",
    remarks: "Previous year scholarship"
  }
];

// Mock data for testing
/* TEMPORARILY REMOVED
const MOCK_PAYMENTS: Payment[] = [
  {
    id: "1",
    student_id: "1",
    student_name: "John Michael Doe",
    student_number: "2024-001",
    academic_period: "2024-2025 - 1st Semester",
    receipt_number: "RCP-202401-0001",
    payment_type: "Tuition Installment",
    payment_for: "1st Quarter Tuition Fee",
    amount: 5000.00,
    payment_method: "Cash",
    payment_date: "2024-01-15",
    status: "Approved",
    is_refund: false,
    received_by_name: "Admin User",
    verified_by_name: "Principal Smith",
    verified_at: "2024-01-15T10:30:00"
  },
  {
    id: "2",
    student_id: "2",
    student_name: "Jane Marie Smith",
    student_number: "2024-002",
    academic_period: "2024-2025 - 1st Semester",
    receipt_number: "RCP-202401-0002",
    payment_type: "Tuition Installment",
    payment_for: "2nd Quarter Tuition Fee",
    amount: 5000.00,
    payment_method: "GCash",
    payment_date: "2024-02-01",
    reference_number: "GC-20240201-123456",
    status: "Verified",
    is_refund: false,
    received_by_name: "Admin User",
    verified_by_name: "Principal Smith",
    verified_at: "2024-02-01T14:20:00",
    remarks: "Paid via GCash mobile app"
  },
  {
    id: "3",
    student_id: "3",
    student_name: "Carlos Rodriguez",
    student_number: "2024-003",
    academic_period: "2024-2025 - 1st Semester",
    receipt_number: "RCP-202401-0003",
    payment_type: "Miscellaneous",
    payment_for: "School Supplies and Materials",
    amount: 1500.00,
    payment_method: "Bank Transfer",
    payment_date: "2024-01-20",
    reference_number: "BT-20240120-789012",
    status: "Approved",
    is_refund: false,
    received_by_name: "Admin User"
  },
  {
    id: "4",
    student_id: "4",
    student_name: "Maria Garcia",
    student_number: "2024-004",
    academic_period: "2024-2025 - 1st Semester",
    receipt_number: "RCP-202401-0004",
    payment_type: "Tuition Installment",
    payment_for: "3rd Quarter Tuition Fee (Partial)",
    amount: 2500.00,
    payment_method: "Cash",
    payment_date: "2024-01-25",
    status: "Approved",
    is_refund: false,
    received_by_name: "Admin User",
    remarks: "Partial payment - remaining balance: ₱2,500.00"
  },
  {
    id: "5",
    student_id: "5",
    student_name: "Ahmed Hassan",
    student_number: "2024-005",
    academic_period: "2024-2025 - 1st Semester",
    receipt_number: "RCP-202401-0005",
    payment_type: "Event Fee",
    payment_for: "Christmas Party Contribution",
    amount: 500.00,
    payment_method: "Cash",
    payment_date: "2024-01-30",
    status: "Pending",
    is_refund: false,
    received_by_name: "Admin User"
  },
  {
    id: "6",
    student_id: "1",
    student_name: "John Michael Doe",
    student_number: "2024-001",
    academic_period: "2024-2025 - 1st Semester",
    receipt_number: "RCP-202402-0001",
    payment_type: "Tuition Installment",
    payment_for: "2nd Quarter Tuition Fee (Full Payment)",
    amount: 5000.00,
    payment_method: "Check",
    payment_date: "2024-02-02",
    reference_number: "CHK-123456",
    status: "Verified",
    is_refund: false,
    received_by_name: "Admin User",
    verified_by_name: "Principal Smith",
    verified_at: "2024-02-02T09:15:00"
  },
  {
    id: "7",
    student_id: "2",
    student_name: "Jane Marie Smith",
    student_number: "2024-002",
    academic_period: "2024-2025 - 1st Semester",
    receipt_number: "RCP-202402-0002",
    payment_type: "Book",
    payment_for: "Mathematics Textbook Grade 6",
    amount: 850.00,
    payment_method: "PayMaya",
    payment_date: "2024-02-02",
    reference_number: "PM-20240202-456789",
    status: "Approved",
    is_refund: false,
    received_by_name: "Admin User"
  },
  {
    id: "8",
    student_id: "6",
    student_name: "Sofia Chen",
    student_number: "2024-006",
    academic_period: "2024-2025 - 1st Semester",
    receipt_number: "RCP-202402-0003",
    payment_type: "Uniform",
    payment_for: "PE Uniform Set",
    amount: 1200.00,
    payment_method: "Cash",
    payment_date: "2024-02-02",
    status: "Approved",
    is_refund: false,
    received_by_name: "Admin User"
  },
  {
    id: "9",
    student_id: "7",
    student_name: "David Lee",
    student_number: "2024-007",
    academic_period: "2024-2025 - 1st Semester",
    receipt_number: "RCP-202402-0004",
    payment_type: "Tuition Installment",
    payment_for: "1st Quarter Tuition - Installment 1 of 2",
    amount: 2500.00,
    payment_method: "GCash",
    payment_date: "2024-02-02",
    reference_number: "GC-20240202-987654",
    status: "Pending",
    is_refund: false,
    received_by_name: "Admin User",
    remarks: "First installment - second payment due March 1, 2024"
  },
  {
    id: "10",
    student_id: "3",
    student_name: "Carlos Rodriguez",
    student_number: "2024-003",
    academic_period: "2024-2025 - 1st Semester",
    receipt_number: "RCP-202402-0005",
    payment_type: "Contribution",
    payment_for: "Field Trip - Science Center Visit",
    amount: 750.00,
    payment_method: "Bank Transfer",
    payment_date: "2024-02-02",
    reference_number: "BT-20240202-321654",
    status: "Verified",
    is_refund: false,
    received_by_name: "Admin User",
    verified_by_name: "Principal Smith",
    verified_at: "2024-02-02T11:45:00"
  }
];
*/

// Mock School Fees Data
/* TEMPORARILY REMOVED
const MOCK_SCHOOL_FEES: SchoolFee[] = [
  {
    id: "1",
    academic_period_id: "1",
    academic_period: "2024-2025 - 1st Semester",
    year_level: null,
    year_levels: [],
    fee_type: "Enrollment Fee",
    fee_name: "Enrollment Fee",
    amount: 1500.00,
    is_required: true,
    is_active: true,
    description: "One-time enrollment fee for all grade levels"
  },
  {
    id: "2",
    academic_period_id: "1",
    academic_period: "2024-2025 - 1st Semester",
    year_level: "Grade 1",
    year_levels: ["Grade 1"],
    fee_type: "Tuition",
    fee_name: "Quarterly Tuition Fee",
    amount: 5000.00,
    is_required: true,
    is_active: true,
    description: "Per quarter tuition fee for Grade 1"
  },
  {
    id: "3",
    academic_period_id: "1",
    academic_period: "2024-2025 - 1st Semester",
    year_level: "Grade 2",
    year_levels: ["Grade 2"],
    fee_type: "Tuition",
    fee_name: "Quarterly Tuition Fee",
    amount: 5200.00,
    is_required: true,
    is_active: true,
    description: "Per quarter tuition fee for Grade 2"
  },
  {
    id: "4",
    academic_period_id: "1",
    academic_period: "2024-2025 - 1st Semester",
    year_level: "Grade 3",
    year_levels: ["Grade 3"],
    fee_type: "Tuition",
    fee_name: "Quarterly Tuition Fee",
    amount: 5500.00,
    is_required: true,
    is_active: true,
    description: "Per quarter tuition fee for Grade 3"
  },
  {
    id: "5",
    academic_period_id: "1",
    academic_period: "2024-2025 - 1st Semester",
    year_level: null,
    year_levels: [],
    fee_type: "Uniform",
    fee_name: "School Uniform Set",
    amount: 2000.00,
    is_required: true,
    is_active: true,
    description: "Complete school uniform set (polo, pants/skirt)"
  },
  {
    id: "6",
    academic_period_id: "1",
    academic_period: "2024-2025 - 1st Semester",
    year_level: null,
    year_levels: [],
    fee_type: "Uniform",
    fee_name: "PE Uniform Set",
    amount: 1200.00,
    is_required: true,
    is_active: true,
    description: "Physical Education uniform set"
  },
  {
    id: "7",
    academic_period_id: "1",
    academic_period: "2024-2025 - 1st Semester",
    year_level: "Kinder",
    year_levels: ["Kinder"],
    fee_type: "Book",
    fee_name: "Kinder Learning Materials",
    amount: 800.00,
    is_required: true,
    is_active: true,
    description: "Complete set of learning materials for Kinder"
  },
  {
    id: "8",
    academic_period_id: "1",
    academic_period: "2024-2025 - 1st Semester",
    year_level: "Grade 1",
    year_levels: ["Grade 1"],
    fee_type: "Book",
    fee_name: "Grade 1 Textbooks",
    amount: 1500.00,
    is_required: true,
    is_active: true,
    description: "Complete set of textbooks for Grade 1"
  },
  {
    id: "9",
    academic_period_id: "1",
    academic_period: "2024-2025 - 1st Semester",
    year_level: null,
    year_levels: [],
    fee_type: "Miscellaneous",
    fee_name: "ID Card",
    amount: 150.00,
    is_required: true,
    is_active: true,
    description: "Student identification card"
  },
  {
    id: "10",
    academic_period_id: "1",
    academic_period: "2024-2025 - 1st Semester",
    year_level: null,
    year_levels: [],
    fee_type: "Miscellaneous",
    fee_name: "School Supplies Kit",
    amount: 500.00,
    is_required: false,
    is_active: true,
    description: "Optional basic school supplies kit"
  },
  {
    id: "11",
    academic_period_id: "1",
    academic_period: "2024-2025 - 1st Semester",
    year_level: null,
    year_levels: [],
    fee_type: "Event Fee",
    fee_name: "Annual Field Trip",
    amount: 750.00,
    is_required: false,
    is_active: true,
    due_date: "2024-03-15",
    description: "Annual educational field trip"
  },
  {
    id: "12",
    academic_period_id: "1",
    academic_period: "2024-2025 - 1st Semester",
    year_level: null,
    year_levels: [],
    fee_type: "Event Fee",
    fee_name: "Christmas Party",
    amount: 500.00,
    is_required: false,
    is_active: true,
    due_date: "2024-12-01",
    description: "Annual Christmas party contribution"
  },
  {
    id: "13",
    academic_period_id: "1",
    academic_period: "2024-2025 - 1st Semester",
    year_level: "Nursery 1",
    year_levels: ["Nursery 1"],
    fee_type: "Tuition",
    fee_name: "Quarterly Tuition Fee",
    amount: 4000.00,
    is_required: true,
    is_active: true,
    description: "Per quarter tuition fee for Nursery 1"
  },
  {
    id: "14",
    academic_period_id: "1",
    academic_period: "2024-2025 - 1st Semester",
    year_level: "Nursery 2",
    year_levels: ["Nursery 2"],
    fee_type: "Tuition",
    fee_name: "Quarterly Tuition Fee",
    amount: 4200.00,
    is_required: true,
    is_active: true,
    description: "Per quarter tuition fee for Nursery 2"
  },
  {
    id: "15",
    academic_period_id: "1",
    academic_period: "2024-2025 - 1st Semester",
    year_level: null,
    year_levels: [],
    fee_type: "Contribution",
    fee_name: "Building Fund",
    amount: 1000.00,
    is_required: false,
    is_active: true,
    description: "School building improvement fund"
  }
];
*/

const Payments = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const confirm = useConfirm();

  const [payments, setPayments] = useState<Payment[]>([]);
  const [paymentPlans, setPaymentPlans] = useState<any[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [academicPeriods, setAcademicPeriods] = useState<AcademicPeriod[]>([]);
  const [schoolFees, setSchoolFees] = useState<SchoolFee[]>([]);
  const [discounts, setDiscounts] = useState<Discount[]>(MOCK_DISCOUNTS);
  const [discountTemplates, setDiscountTemplates] = useState<DiscountTemplate[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [paymentTypeFilter, setPaymentTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFromFilter, setDateFromFilter] = useState("");
  const [dateToFilter, setDateToFilter] = useState("");

  // Dialogs
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isTypePickerOpen, setIsTypePickerOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [isDiscountDialogOpen, setIsDiscountDialogOpen] = useState(false);
  const [discountDialogPayment, setDiscountDialogPayment] = useState<Payment | null>(null);

  // School Fees Panel
  const [isFeesPanelOpen, setIsFeesPanelOpen] = useState(false);
  const [feesSearchQuery, setFeesSearchQuery] = useState("");
  const [feeTypeFilter, setFeeTypeFilter] = useState("all");
  const [yearLevelFilter, setYearLevelFilter] = useState("all");
  const [isEditingFee, setIsEditingFee] = useState(false);
  const [selectedFee, setSelectedFee] = useState<SchoolFee | null>(null);
  const [feeForm, setFeeForm] = useState({
    fee_type: "Tuition",
    fee_name: "",
    year_levels: [] as string[],
    amount: "",
    is_required: true,
    is_active: true,
    due_date: "",
    description: ""
  });

  // Discounts Panel
  const [isDiscountsPanelOpen, setIsDiscountsPanelOpen] = useState(false);
  const [discountsSearchQuery, setDiscountsSearchQuery] = useState("");
  const [discountTypeFilter, setDiscountTypeFilter] = useState("all");
  const [discountStatusFilter, setDiscountStatusFilter] = useState("all");
  const [isEditingDiscount, setIsEditingDiscount] = useState(false);
  const [selectedDiscount, setSelectedDiscount] = useState<DiscountTemplate | null>(null);
  const [studentSearchQuery, setStudentSearchQuery] = useState("");
  const [showStudentSuggestions, setShowStudentSuggestions] = useState(false);
  const [paymentStudentSearchQuery, setPaymentStudentSearchQuery] = useState("");
  const [showPaymentStudentSuggestions, setShowPaymentStudentSuggestions] = useState(false);
  const [discountForm, setDiscountForm] = useState({
    name: "",
    discount_type: "Scholarship",
    value_type: "Percentage" as "Percentage" | "Fixed Amount",
    value: "",
    description: "",
    is_active: true
  });

  // Form
  const [form, setForm] = useState({
    student_id: "",
    enrollment_id: "",
    academic_period_id: "",
    payment_type: "",
    payment_for: "",
    amount: "",
    payment_method: "Cash",
    payment_date: new Date().toISOString().split('T')[0],
    reference_number: "",
    status: "Approved",
    remarks: ""
  });

  const [alert, setAlert] = useState<{ type: "success" | "error" | "info"; message: string } | null>(null);

  const showAlert = (type: "success" | "error" | "info", message: string) => {
    setAlert({ type, message });
  };

  const getNetAmount = (payment: Payment) =>
    Number(payment.net_amount ?? payment.amount ?? 0);

  // Group fees that have the same properties but different year levels
  const groupFeesByProperties = (fees: SchoolFee[]): SchoolFee[] => {
    const grouped = new Map<string, SchoolFee>();

    fees.forEach(fee => {
      // Create a key based on fee properties (excluding id and year_level)
      const key = `${fee.academic_period_id}-${fee.fee_type}-${fee.fee_name}-${fee.amount}-${fee.is_required}-${fee.description || ''}`;
      
      if (grouped.has(key)) {
        // Merge year levels
        const existing = grouped.get(key)!;
        const existingLevels = existing.year_levels || (existing.year_level ? [existing.year_level] : []);
        const newLevels = fee.year_levels || (fee.year_level ? [fee.year_level] : []);
        
        // Combine and deduplicate year levels
        const combinedLevels = [...new Set([...existingLevels, ...newLevels])];
        
        // Store all IDs for later reference (we'll use the first one as primary, but keep track of all)
        if (!existing.grouped_ids) {
          existing.grouped_ids = [existing.id];
        }
        existing.grouped_ids.push(fee.id);
        
        existing.year_levels = combinedLevels;
        // If all levels covered, set year_level to null
        if (combinedLevels.length === 0) {
          existing.year_level = null;
        }
      } else {
        // First occurrence of this fee
        const yearLevels = fee.year_levels || (fee.year_level ? [fee.year_level] : []);
        grouped.set(key, {
          ...fee,
          year_levels: yearLevels,
          grouped_ids: [fee.id] // Track all IDs that were grouped
        });
      }
    });

    return Array.from(grouped.values());
  };

  useEffect(() => {
    if (!isAuthenticated || user?.role !== "admin") {
      navigate("/auth");
    } else {
      fetchData();
    }
  }, [isAuthenticated, user, navigate]);

  // Auto-populate payment_for and amount when payment_type changes to Tuition Full Payment
  useEffect(() => {
    if (form.payment_type === "Tuition Full Payment") {
      // Find tuition fee from school_fees (no academic_period_id needed - reusable)
      const tuitionFee = schoolFees.find(
        f => f.fee_type === 'Tuition' && f.is_active
      );
      
      if (tuitionFee) {
        setForm(prev => ({
          ...prev,
          payment_for: tuitionFee.fee_name,
          amount: tuitionFee.amount.toString()
        }));
      }
    } else if (form.payment_type && form.payment_type !== "Tuition Full Payment") {
      // Reset payment_for and amount when payment type changes
      setForm(prev => ({
        ...prev,
        payment_for: "",
        amount: ""
      }));
    }
  }, [form.payment_type, schoolFees]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch payments - use mock data if API fails
      try {
        const paymentsRes = await apiGet('/api/payments');
        if (paymentsRes && paymentsRes.success && paymentsRes.data?.length > 0) {
          const normalizedPayments = (paymentsRes.data || []).map((payment: Payment) => ({
            ...payment,
            net_amount: Number(payment.net_amount ?? payment.amount ?? 0)
          }));
          setPayments(normalizedPayments);
        }
      } catch (err) {
        console.log('Using mock payment data');
        // Keep mock data already set in state
      }

      // Fetch payment plans to filter out students who already have plans
      try {
        const plansRes = await apiGet(API_ENDPOINTS.PAYMENT_PLANS);
        if (plansRes && plansRes.success) {
          setPaymentPlans(plansRes.data || []);
        }
      } catch (err) {
        console.error('Error fetching payment plans:', err);
        setPaymentPlans([]);
      }

      // Fetch students and enrollees (for discount assignment)
      try {
        const studentsRes = await apiGet(`${API_ENDPOINTS.STUDENTS_ENROLLEES}`);
        console.log('Students & Enrollees API Response:', studentsRes);
        const studentRows = studentsRes?.data || studentsRes?.students || [];
        console.log('Student Rows:', studentRows, 'Length:', studentRows.length);
        setStudents(studentRows);
      } catch (err) {
        console.error('Error fetching students and enrollees:', err);
        // Use empty array as fallback
        setStudents([]);
      }

      // Fetch enrollments (for tuition payments)
      try {
        const enrollmentsRes = await apiGet(API_ENDPOINTS.ADMIN_ENROLLMENTS);
        console.log('Enrollments API Response:', enrollmentsRes);
        const enrollmentRows = enrollmentsRes?.data || enrollmentsRes?.enrollments || [];
        console.log('Enrollment Rows:', enrollmentRows, 'Length:', enrollmentRows.length);
        setEnrollments(enrollmentRows);
      } catch (err) {
        console.error('Error fetching enrollments:', err);
        setEnrollments([]);
      }

      // Fetch academic periods
      const periodsRes = await apiGet(API_ENDPOINTS.ACADEMIC_PERIODS);
      const periods = periodsRes?.data || periodsRes?.periods || [];
      setAcademicPeriods(periods);

      // Fetch school fees
      try {
        const feesRes = await apiGet(API_ENDPOINTS.SCHOOL_FEES);
        if (feesRes && feesRes.success && feesRes.data) {
          // Filter out inactive fees - DO NOT group for payment form to work correctly
          const activeFees = feesRes.data.filter((fee: SchoolFee) => fee.is_active);
          setSchoolFees(activeFees);
          console.log('School fees fetched:', activeFees.length, 'records');
        }
      } catch (err) {
        console.log('Error fetching school fees:', err);
        setSchoolFees([]);
      }

    } catch (error) {
      console.error('Error fetching data:', error);
      showAlert('info', 'Using sample payment data for demonstration');
    } finally {
      setLoading(false);
    }
  };

  const checkReferenceNumberExists = async (referenceNumber: string): Promise<boolean> => {
    try {
      const response = await apiGet(`/api/payments/check-reference?reference=${encodeURIComponent(referenceNumber)}`);
      return response?.exists || false;
    } catch (error) {
      console.error('Error checking reference number:', error);
      return false; // Assume doesn't exist on error to allow creation
    }
  };

  const generateReceiptNumber = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `RCP-${year}${month}-${random}`;
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
      
      // Format: MCAFINV-YYYYMMDDHHMMSSRRR
      const invoiceNumber = `MCAFINV-${year}${month}${day}${hours}${minutes}${seconds}${random}`;
      
      // Check if this number already exists
      const exists = await checkReferenceNumberExists(invoiceNumber);
      
      if (!exists) {
        return invoiceNumber;
      }
      
      // If duplicate found, wait a bit and retry
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    // Fallback: use timestamp in milliseconds if all attempts failed
    const timestamp = Date.now();
    return `MCAFINV-${timestamp}`;
  };

  const handleOpenCreate = async (paymentType?: string) => {
    const activePeriod = academicPeriods.find(p => p.status === 'active');
    const invoiceNumber = await generateInvoiceNumber(); // Auto-generate unique invoice for cash
    
    setForm({
      student_id: "",
      enrollment_id: "",
      academic_period_id: activePeriod?.id || "",
      payment_type: paymentType || "",
      payment_for: "",
      amount: "",
      payment_method: "Cash",
      payment_date: new Date().toISOString().split('T')[0],
      reference_number: invoiceNumber,
      status: "Pending",
      remarks: ""
    });
    setPaymentStudentSearchQuery("");
    setShowPaymentStudentSuggestions(false);
    setIsCreateOpen(true);
  };

  const handleOpenTypePicker = () => {
    setIsTypePickerOpen(true);
  };

  const handleCreate = async () => {
    if (!form.student_id || !form.amount || !form.payment_for) {
      showAlert("error", "Please fill in all required fields");
      return;
    }

    try {
      const payload = {
        ...form,
        amount: parseFloat(form.amount),
        receipt_number: generateReceiptNumber(),
        received_by: user?.id
      };

      const res = await apiPost('/api/payments', payload);
      if (res && res.success) {
        showAlert("success", "Payment recorded successfully");
        setIsCreateOpen(false);
        fetchData();
      } else {
        showAlert("error", res.message || "Failed to create payment");
      }
    } catch (error: any) {
      showAlert("error", error.message || "Error creating payment");
    }
  };

  const handleOpenEdit = (payment: Payment) => {
    setSelectedPayment(payment);
    setForm({
      student_id: payment.student_id,
      enrollment_id: payment.enrollment_id || "",
      academic_period_id: payment.academic_period_id || payment.academic_period || "",
      payment_type: payment.payment_type,
      payment_for: payment.payment_for,
      amount: payment.amount.toString(),
      payment_method: payment.payment_method,
      payment_date: payment.payment_date,
      reference_number: payment.reference_number || "",
      status: payment.status,
      remarks: payment.remarks || ""
    });
    setIsEditOpen(true);
  };

  const handleEdit = async () => {
    if (!selectedPayment) return;

    try {
      const payload = {
        ...form,
        amount: parseFloat(form.amount)
      };

      const res = await apiPut(`/api/payments/${selectedPayment.id}`, payload);
      if (res && res.success) {
        showAlert("success", "Payment updated successfully");
        setIsEditOpen(false);
        fetchData();
      } else {
        showAlert("error", res.message || "Failed to update payment");
      }
    } catch (error: any) {
      showAlert("error", error.message || "Error updating payment");
    }
  };

  const handleViewPayment = (payment: Payment) => {
    setSelectedPayment(payment);
    setIsViewOpen(true);
  };

  const handleVerifyPayment = async (paymentId: string) => {
    const ok = await confirm({
      title: 'Verify Payment',
      description: 'Mark this payment as verified?',
      confirmText: 'Verify',
      cancelText: 'Cancel',
      variant: 'default'
    });

    if (!ok) return;

    try {
      const res = await apiPut(`/api/payments/${paymentId}`, {
        status: 'Verified',
        verified_by: user?.id,
        verified_at: new Date().toISOString()
      });

      if (res && res.success) {
        showAlert("success", "Payment verified successfully");
        fetchData();
      }
    } catch (error: any) {
      showAlert("error", error.message || "Error verifying payment");
    }
  };

  const handleApprovePayment = async (paymentId: string) => {
    const ok = await confirm({
      title: 'Approve Payment',
      description: 'Approve this payment now?',
      confirmText: 'Approve',
      cancelText: 'Cancel',
      variant: 'default'
    });

    if (!ok) return;

    try {
      const res = await apiPut(`/api/payments/${paymentId}`, {
        status: 'Approved'
      });

      if (res && res.success) {
        showAlert("success", "Payment approved successfully");
        fetchData();
      }
    } catch (error: any) {
      showAlert("error", error.message || "Error approving payment");
    }
  };

  // School Fees Handlers
  const handleOpenFeesPanel = () => {
    setIsFeesPanelOpen(true);
    setIsDiscountsPanelOpen(false); // Close discounts panel
    resetFeeForm();
  };

  const resetFeeForm = () => {
    setFeeForm({
      fee_type: "Tuition",
      fee_name: "",
      year_levels: [],
      amount: "",
      is_required: true,
      is_active: true,
      due_date: "",
      description: ""
    });
    setIsEditingFee(false);
    setSelectedFee(null);
  };

  const handleEditFee = (fee: SchoolFee) => {
    setSelectedFee(fee);
    
    // Build year_levels array from the fee
    let yearLevels: string[] = [];
    if (fee.year_levels && fee.year_levels.length > 0) {
      // Use the year_levels array if available
      yearLevels = fee.year_levels;
    } else if (fee.year_level) {
      // Single year level
      yearLevels = [fee.year_level];
    } else {
      // All grades (null year_level)
      yearLevels = ["All Grades"];
    }
    
    setFeeForm({
      fee_type: fee.fee_type,
      fee_name: fee.fee_name,
      year_levels: yearLevels,
      amount: fee.amount.toString(),
      is_required: fee.is_required,
      is_active: fee.is_active,
      due_date: fee.due_date || "",
      description: fee.description || ""
    });
    setIsEditingFee(true);
  };

  const handleSaveFee = async () => {
    if (!feeForm.fee_name || !feeForm.amount) {
      showAlert("error", "Please fill in fee name and amount");
      return;
    }

    if (feeForm.year_levels.length === 0) {
      showAlert("error", "Please select at least one year level");
      return;
    }

    try {
      // Simplified payload - no academic_period_id needed (fees are reusable)
      const payload = {
        fee_type: feeForm.fee_type,
        fee_name: feeForm.fee_name,
        year_levels: feeForm.year_levels,
        amount: parseFloat(feeForm.amount),
        is_required: feeForm.is_required ? 1 : 0,
        is_active: feeForm.is_active ? 1 : 0,
        due_date: feeForm.due_date || null,
        description: feeForm.description || null
      };

      if (isEditingFee && selectedFee) {
        // EDIT MODE: Update fee records
        const originalYearLevels = selectedFee.year_levels || (selectedFee.year_level ? [selectedFee.year_level] : []);
        const newYearLevels = feeForm.year_levels;
        
        // Fetch all individual fee records for this grouped fee
        let individualFees: any[] = [];
        if (selectedFee.grouped_ids && selectedFee.grouped_ids.length > 0) {
          for (const groupedId of selectedFee.grouped_ids) {
            try {
              const feeRes = await apiGet(API_ENDPOINTS.SCHOOL_FEE_BY_ID(groupedId));
              if (feeRes && feeRes.success && feeRes.data) {
                individualFees.push(feeRes.data);
              }
            } catch (err) {
              console.error('Error fetching individual fee:', err);
            }
          }
        } else {
          individualFees = [selectedFee];
        }

        // Find all fees with same properties to handle deactivations
        const allFeesRes = await apiGet(`${API_ENDPOINTS.SCHOOL_FEES}`);
        if (allFeesRes && allFeesRes.success && allFeesRes.data) {
          const matchingFees = allFeesRes.data.filter((f: any) => 
            f.fee_type === feeForm.fee_type &&
            f.fee_name === feeForm.fee_name &&
            f.amount === parseFloat(feeForm.amount) &&
            (f.description || '') === (feeForm.description || '')
          );
          
          matchingFees.forEach((mf: any) => {
            if (!individualFees.some(inf => inf.id === mf.id)) {
              individualFees.push(mf);
            }
          });
        }

        // Determine which year levels were unchecked (deactivate)
        const uncheckedLevels = originalYearLevels.filter(level => !newYearLevels.includes(level));
        
        // Determine which year levels were newly checked
        const checkedLevels = newYearLevels.filter(level => level !== 'All Grades');
        
        // Deactivate unchecked levels
        for (const level of uncheckedLevels) {
          const matchingFee = individualFees.find(f => f.year_level === level);
          if (matchingFee) {
            await apiPut(API_ENDPOINTS.SCHOOL_FEE_BY_ID(matchingFee.id), {
              is_active: 0
            });
          }
        }

        // Process checked levels
        for (const level of checkedLevels) {
          const matchingFee = individualFees.find(f => f.year_level === level);
          
          if (matchingFee) {
            // Fee exists - update with new values
            const updatePayload = {
              fee_type: payload.fee_type,
              fee_name: payload.fee_name,
              year_level: level,
              amount: payload.amount,
              is_required: payload.is_required,
              is_active: 1,
              due_date: payload.due_date,
              description: payload.description
            };
            await apiPut(API_ENDPOINTS.SCHOOL_FEE_BY_ID(matchingFee.id), updatePayload);
          } else {
            // Fee doesn't exist - insert new
            const insertPayload = {
              fee_type: payload.fee_type,
              fee_name: payload.fee_name,
              year_levels: [level],
              amount: payload.amount,
              is_required: payload.is_required,
              is_active: 1,
              due_date: payload.due_date,
              description: payload.description
            };
            await apiPost(API_ENDPOINTS.SCHOOL_FEES, insertPayload);
          }
        }

        showAlert("success", "Fee updated successfully");
        fetchData();
        resetFeeForm();
      } else {
        // CREATE MODE
        const res = await apiPost(API_ENDPOINTS.SCHOOL_FEES, payload);

        if (res && res.success) {
          showAlert("success", "Fee added successfully");
          fetchData();
          resetFeeForm();
        } else {
          showAlert("error", res?.message || "Failed to save fee");
        }
      }
    } catch (error: any) {
      console.error('Error saving fee:', error);
      showAlert("error", error?.message || "Error saving fee");
    }
  };

  const handleDeleteFee = async (feeId: string) => {
    const fee = schoolFees.find(f => f.id === feeId);
    const ok = await confirm({
      title: 'Delete School Fee',
      description: `Are you sure you want to delete "${fee?.fee_name}"?${fee?.grouped_ids && fee.grouped_ids.length > 1 ? ` This will delete ${fee.grouped_ids.length} fee record(s).` : ''}`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'destructive'
    });

    if (!ok) return;

    try {
      // If this is a grouped fee, delete all grouped records
      if (fee?.grouped_ids && fee.grouped_ids.length > 0) {
        for (const groupedId of fee.grouped_ids) {
          await apiDelete(API_ENDPOINTS.SCHOOL_FEE_BY_ID(groupedId));
        }
      } else {
        await apiDelete(API_ENDPOINTS.SCHOOL_FEE_BY_ID(feeId));
      }
      
      showAlert("success", "Fee deleted successfully");
      fetchData(); // Refresh the list
    } catch (error: any) {
      console.error('Error deleting fee:', error);
      showAlert("error", error?.message || "Error deleting fee");
    }
  };

  const handleToggleFeeStatus = async (feeId: string) => {
    try {
      const fee = schoolFees.find(f => f.id === feeId);
      
      // If this is a grouped fee, toggle all grouped records
      if (fee?.grouped_ids && fee.grouped_ids.length > 0) {
        for (const groupedId of fee.grouped_ids) {
          await apiPut(API_ENDPOINTS.SCHOOL_FEES_TOGGLE_STATUS(groupedId), {});
        }
      } else {
        await apiPut(API_ENDPOINTS.SCHOOL_FEES_TOGGLE_STATUS(feeId), {});
      }
      
      showAlert("success", `Fee ${fee?.is_active ? 'deactivated' : 'activated'} successfully`);
      fetchData(); // Refresh the list
    } catch (error: any) {
      console.error('Error toggling fee status:', error);
      showAlert("error", error?.message || "Error updating fee status");
    }
  };

  const fetchDiscountTemplates = async () => {
    try {
      const res = await apiGet(API_ENDPOINTS.DISCOUNT_TEMPLATES);
      if (res.success) {
        setDiscountTemplates(res.data || []);
      }
    } catch (error) {
      console.error("Error fetching discounts:", error);
    }
  };

  // Discount Handlers
  const handleOpenDiscountsPanel = () => {
    setIsDiscountsPanelOpen(true);
    setIsFeesPanelOpen(false); // Close fees panel
    resetDiscountForm();
    fetchDiscountTemplates();
  };

  const resetDiscountForm = () => {
    setDiscountForm({
      name: "",
      discount_type: "Scholarship",
      value_type: "Percentage",
      value: "",
      description: "",
      is_active: true
    });
    setStudentSearchQuery("");
    setShowStudentSuggestions(false);
    setIsEditingDiscount(false);
    setSelectedDiscount(null);
  };

  const handleEditDiscount = (discount: DiscountTemplate) => {
    setSelectedDiscount(discount);
    setDiscountForm({
      name: discount.name,
        discount_type: discount.type,
        value_type: discount.value_type,
        value: discount.value.toString(),
        description: discount.description || "",
        is_active: discount.is_active
      });
      setIsEditingDiscount(true);
    };

    const handleSaveDiscount = async () => {
      if (!discountForm.name || !discountForm.value) {
        showAlert("error", "Please enter a discount name and value");
        return;
      }

      const payload = {
        name: discountForm.name,
        discount_type: discountForm.discount_type,
        value: parseFloat(discountForm.value),
        value_type: discountForm.value_type,
        description: discountForm.description,
        is_active: discountForm.is_active ? 1 : 0
      };

    try {
      if (isEditingDiscount && selectedDiscount) {
        const res = await apiPut(API_ENDPOINTS.DISCOUNT_TEMPLATE_BY_ID(selectedDiscount.id), payload);
        if (res.success) {
           showAlert("success", "Discount updated successfully");
        } else {
           showAlert("error", res.message || "Failed to update");
        }
      } else {
        const res = await apiPost(API_ENDPOINTS.DISCOUNT_TEMPLATES, payload);
        if (res.success) {
           showAlert("success", "Discount added successfully");
        } else {
           showAlert("error", res.message || "Failed to add");
        }
      }
      fetchDiscountTemplates();
      resetDiscountForm();
    } catch (error: any) {
      showAlert("error", error.message || "Error saving discount");
    }
  };

  const handleDeleteDiscount = async (discountId: string) => {
    const discount = discountTemplates.find(d => d.id === discountId);
    const ok = await confirm({
      title: 'Delete Discount Template',
      description: `Are you sure you want to delete "${discount?.name}"?`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'destructive'
    });

    if (!ok) return;

    try {
      await apiDelete(API_ENDPOINTS.DISCOUNT_TEMPLATE_BY_ID(discountId));
      showAlert("success", "Discount template deleted successfully");
      fetchDiscountTemplates();
    } catch (error: any) {
      console.error('Error deleting discount:', error);
      showAlert("error", error?.message || "Error deleting discount");
    }
  };

  const handleToggleDiscountStatus = async (discountId: string) => {
    try {
      await apiPut(API_ENDPOINTS.DISCOUNT_TEMPLATE_TOGGLE(discountId), {});
      fetchDiscountTemplates();
    } catch (error: any) {
      console.error('Error toggling discount status:', error);
      showAlert("error", error?.message || "Error updating status");
    }
  };

  const filteredPayments = payments.filter((p) => {
    const matchesSearch = searchQuery === "" ||
      p.student_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.student_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.receipt_number.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = paymentTypeFilter === "all" || p.payment_type === paymentTypeFilter;
    const matchesStatus = statusFilter === "all" || p.status === statusFilter;

    const matchesDate = (!dateFromFilter || p.payment_date >= dateFromFilter) &&
                       (!dateToFilter || p.payment_date <= dateToFilter);

    return matchesSearch && matchesType && matchesStatus && matchesDate;
  });

  // Filtered School Fees - with grouping for display only
  const filteredSchoolFees = (() => {
    const filtered = schoolFees.filter((f) => {
      const matchesSearch = feesSearchQuery === "" ||
        f.fee_name.toLowerCase().includes(feesSearchQuery.toLowerCase()) ||
        (f.description || "").toLowerCase().includes(feesSearchQuery.toLowerCase());

      const matchesType = feeTypeFilter === "all" || f.fee_type === feeTypeFilter;
      const matchesYearLevel = yearLevelFilter === "all" || 
        (yearLevelFilter === "All Grades" && !f.year_level) ||
        f.year_level === yearLevelFilter;

      return matchesSearch && matchesType && matchesYearLevel;
    });
    
    // Group fees for display purposes only
    return groupFeesByProperties(filtered);
  })();

  // Filtered Discounts
const filteredDiscounts = discountTemplates.filter((d) => {
      const matchesSearch = discountsSearchQuery === "" ||
        d.name.toLowerCase().includes(discountsSearchQuery.toLowerCase());

      const matchesStatus = discountStatusFilter === "all" || 
         (discountStatusFilter === "Active" && d.is_active) ||
         (discountStatusFilter !== "Active" && !d.is_active);

      return matchesSearch && matchesStatus;
  });

  // Filtered Students for autocomplete (limit 10)
  const filteredStudentSuggestions = students.filter((s) => {
    if (!studentSearchQuery || studentSearchQuery.trim() === "") return true; // Show all if empty
    const query = studentSearchQuery.toLowerCase();
    return (
      s.student_id?.toLowerCase().includes(query) ||
      s.first_name?.toLowerCase().includes(query) ||
      s.last_name?.toLowerCase().includes(query) ||
      `${s.first_name} ${s.last_name}`.toLowerCase().includes(query)
    );
  }).slice(0, 10);

  // Map payment type to fee type
  const getPaymentTypeToFeeType = (paymentType: string): string => {
    if (paymentType === "Tuition Full Payment" || paymentType === "Tuition Installment") {
      return "Tuition";
    }
    // For other types, they match directly
    return paymentType;
  };

  // Filter school fees for payment form based on selected payment type (no academic_period filtering needed)
  const paymentFormSchoolFees = (() => {
    if (!form.payment_type) {
      console.log('Missing payment_type');
      return [];
    }

    const feeType = getPaymentTypeToFeeType(form.payment_type);
    const selectedEnrollment = form.enrollment_id
      ? enrollments.find((enrollment: any) => String(enrollment.id) === String(form.enrollment_id))
      : null;
    const selectedYearLevel = selectedEnrollment?.grade_level || selectedEnrollment?.year_level || null;

    console.log('Filtering school fees:', {
      payment_type: form.payment_type,
      feeType: feeType,
      selectedYearLevel: selectedYearLevel,
      schoolFees_count: schoolFees.length,
      schoolFees_sample: schoolFees.slice(0, 3)
    });

    const filtered = schoolFees.filter(fee => {
      const typeMatch = fee.fee_type === feeType;
      const activeMatch = fee.is_active;

      if (!typeMatch || !activeMatch) {
        return false;
      }

      if (feeType === "Tuition") {
        if (!selectedYearLevel) {
          return false;
        }

        if (fee.year_levels && fee.year_levels.length > 0) {
          return fee.year_levels.includes(selectedYearLevel);
        }

        return fee.year_level === selectedYearLevel;
      }

      return true;
    });

    console.log('Filtered result count:', filtered.length, 'fees');
    return filtered;
  })();

  // Filtered Students for payment form autocomplete
  const filteredPaymentStudentSuggestions = (() => {
    // For Tuition Full Payment, use enrollments instead of students
    if (form.payment_type === "Tuition Full Payment") {
      return enrollments.filter((enrollment: any) => {
        // Exclude if enrollment already has a payment plan (ALWAYS check this first)
        const hasPaymentPlan = paymentPlans.some(
          (plan: any) => String(plan.enrollment_id) === String(enrollment.id)
        );
        
        if (hasPaymentPlan) return false;

        // Exclude if enrollment already has a payment record (checks enrollment_id)
        const hasPaymentRecord = payments.some(
          (payment: any) => String(payment.enrollment_id) === String(enrollment.id)
        );
        
        if (hasPaymentRecord) return false;

        // Then filter by search query
        if (!paymentStudentSearchQuery || paymentStudentSearchQuery.trim() === "") return true;
        
        const query = paymentStudentSearchQuery.toLowerCase();
        return enrollment.student_name?.toLowerCase().includes(query);
      }).slice(0, 10);
    }
    
    // For other payment types, use students
    return students.filter((s) => {
      if (!paymentStudentSearchQuery || paymentStudentSearchQuery.trim() === "") return true;
      const query = paymentStudentSearchQuery.toLowerCase();
      return (
        s.student_id?.toLowerCase().includes(query) ||
        s.first_name?.toLowerCase().includes(query) ||
        s.last_name?.toLowerCase().includes(query) ||
        `${s.first_name} ${s.last_name}`.toLowerCase().includes(query)
      );
    }).slice(0, 10);
  })();

  // Statistics
  // Only sum payments that are already paid (exclude pending)
  const paidPayments = filteredPayments.filter(p => p.status === 'Approved' || p.status === 'Verified');
  const totalPayments = paidPayments.reduce((sum, p) => sum + getNetAmount(p), 0);
  const pendingCount = filteredPayments.filter(p => p.status === 'Pending').length;
  const verifiedCount = filteredPayments.filter(p => p.status === 'Verified').length;
  const approvedCount = filteredPayments.filter(p => p.status === 'Approved').length;

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      'Pending': 'bg-yellow-100 text-yellow-800 border-yellow-300',
      'Verified': 'bg-blue-100 text-blue-800 border-blue-300',
      'Approved': 'bg-green-100 text-green-800 border-green-300',
      'Rejected': 'bg-red-100 text-red-800 border-red-300'
    };
    return variants[status] || 'bg-gray-100 text-gray-800 border-gray-300';
  };

  const getPaymentMethodIcon = (method: string) => {
    if (method === 'Cash') return <Wallet className="h-4 w-4" />;
    if (method.includes('Bank') || method.includes('GCash') || method.includes('PayMaya')) return <CreditCard className="h-4 w-4" />;
    return <FileText className="h-4 w-4" />;
  };

  if (!isAuthenticated) return null;

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading payments...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Payment Management
            </h1>
            <p className="text-muted-foreground">Track and manage student payments</p>
          </div>
          <div className="flex items-center gap-3">
            {/* Settings Dropdown - School Fees & Discounts */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="bg-gradient-to-r from-slate-50 to-gray-50 border-slate-200 hover:bg-slate-100"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Management
                  <ChevronDown className="h-4 w-4 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem 
                  onClick={handleOpenFeesPanel}
                  className="!bg-white hover:!bg-purple-100 cursor-pointer"
                >
                  <Settings className="h-4 w-4 mr-2 text-purple-600" />
                  <span className="text-purple-700 font-medium">School Fees</span>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={handleOpenDiscountsPanel}
                  className="!bg-white hover:!bg-amber-100 cursor-pointer"
                >
                  <Tag className="h-4 w-4 mr-2 text-amber-600" />
                  <span className="text-amber-700 font-medium">Discounts</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => navigate("/admin/tuition-packages")}
                  className="!bg-white hover:!bg-blue-100 cursor-pointer"
                >
                  <Package className="h-4 w-4 mr-2 text-blue-600" />
                  <span className="text-blue-700 font-medium">Tuition Packages</span>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => navigate("/admin/uniform-management")}
                  className="!bg-white hover:!bg-green-100 cursor-pointer"
                >
                  <Shirt className="h-4 w-4 mr-2 text-green-600" />
                  <span className="text-green-700 font-medium">Uniform Management</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button onClick={handleOpenTypePicker} className="bg-gradient-to-r from-blue-600 to-cyan-500">
              <Plus className="h-4 w-4 mr-2" />
              New Payment
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600 font-semibold">Total Collected</p>
                  <p className="text-2xl font-bold text-blue-700">₱{Number(totalPayments).toLocaleString('en-PH', { minimumFractionDigits: 2 })}</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-blue-200 flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-600 font-semibold">Approved</p>
                  <p className="text-2xl font-bold text-green-700">{approvedCount}</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-green-200 flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-indigo-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600 font-semibold">Verified</p>
                  <p className="text-2xl font-bold text-blue-700">{verifiedCount}</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-blue-200 flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-yellow-50 to-yellow-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-yellow-600 font-semibold">Pending</p>
                  <p className="text-2xl font-bold text-yellow-700">{pendingCount}</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-yellow-200 flex items-center justify-center">
                  <Clock className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6 border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by student, receipt..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={paymentTypeFilter} onValueChange={setPaymentTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Payment Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {PAYMENT_TYPES.map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  {PAYMENT_STATUS.map(status => (
                    <SelectItem key={status} value={status}>{status}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Input
                type="date"
                value={dateFromFilter}
                onChange={(e) => setDateFromFilter(e.target.value)}
                placeholder="From Date"
              />

              <Input
                type="date"
                value={dateToFilter}
                onChange={(e) => setDateToFilter(e.target.value)}
                placeholder="To Date"
              />
            </div>
          </CardContent>
        </Card>

        {/* Payments Table */}
        <Card className="shadow-lg border-0">
          <CardHeader className="bg-gradient-to-r from-muted/50 to-muted border-b">
            <CardTitle className="text-xl font-bold flex items-center gap-2">
              <Receipt className="h-5 w-5" />
              Payment Records ({filteredPayments.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Receipt #</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Student</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Payment For</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Net Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Method</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredPayments.map((payment) => (
                    <tr key={payment.id} className="hover:bg-muted/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Receipt className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium">{payment.receipt_number}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">{payment.student_name}</p>
                            <p className="text-xs text-gray-500">{payment.student_number}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <Badge variant="outline" className="text-xs">{payment.payment_type}</Badge>
                          <p className="text-sm text-gray-600 mt-1">{payment.payment_for}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-semibold text-gray-900">
                          ₱{getNetAmount(payment).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {getPaymentMethodIcon(payment.payment_method)}
                          <span className="text-sm">{payment.payment_method}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{new Date(payment.payment_date).toLocaleDateString()}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge className={getStatusBadge(payment.status)}>
                          {payment.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewPayment(payment)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenEdit(payment)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          {payment.payment_method === 'Cash' && payment.status === 'Pending' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleApprovePayment(payment.id)}
                            >
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            </Button>
                          )}
                          {payment.payment_method !== 'Cash' && payment.status === 'Pending' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleVerifyPayment(payment.id)}
                            >
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            </Button>
                          )}
                          {payment.payment_method !== 'Cash' && payment.status === 'Verified' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleApprovePayment(payment.id)}
                            >
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            </Button>
                          )}
                          {(payment.payment_type === 'Tuition Full Payment' || payment.payment_type === 'Tuition Installment') && payment.status !== 'Approved' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setDiscountDialogPayment(payment);
                                setIsDiscountDialogOpen(true);
                              }}
                              title="Manage Discounts"
                            >
                              <Tag className="h-4 w-4 text-purple-600" />
                            </Button>
                          )}
                          {payment.payment_type === 'Tuition Installment' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => navigate(`/admin/payment-plans?student_id=${payment.student_id}`)}
                              title="View Payment Plan"
                            >
                              <CalendarClock className="h-4 w-4 text-blue-600" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredPayments.length === 0 && (
                <div className="text-center py-16">
                  <Receipt className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No payments found</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Payment Type Picker */}
        <Dialog open={isTypePickerOpen} onOpenChange={setIsTypePickerOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Select Payment Type</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              {PAYMENT_TYPE_PICKER_OPTIONS.map((option) => {
                const Icon = option.icon;
                return (
                  <Button
                    key={option.value}
                    type="button"
                    variant="outline"
                    className={`h-20 flex-col gap-2 border ${option.className}`}
                    onClick={() => {
                      setIsTypePickerOpen(false);
                      handleOpenCreate(option.value);
                    }}
                  >
                    <Icon className="h-6 w-6" />
                    <span className="text-xs font-semibold text-center leading-tight">
                      {option.label}
                    </span>
                  </Button>
                );
              })}
            </div>
          </DialogContent>
        </Dialog>

        {/* Create Payment Dialog */}
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogContent onOpenAutoFocus={(e: any) => e.preventDefault()} className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Record New Payment</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {/* Info Banner for Tuition Full Payment */}
              {form.payment_type === "Tuition Full Payment" && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
                  <div className="flex-shrink-0 mt-0.5">
                    <svg className="h-5 w-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-blue-900 mb-1">Tuition Full Payment</h4>
                    <p className="text-sm text-blue-800">
                      Only <strong>enrolled students</strong> can pay full tuition. Student list is filtered to show students with active enrollment records for the selected academic period.
                    </p>
                    <p className="text-xs text-blue-700 mt-2">
                      💡 <em>For installment payments, create a Payment Plan first, then record payments through that plan.</em>
                    </p>
                  </div>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4">
                <div className="relative">
                  <Label>
                    Student *
                    {form.payment_type === "Tuition Full Payment" && (
                      <span className="text-xs text-muted-foreground ml-2">(Enrolled students only)</span>
                    )}
                  </Label>
                  <Input
                    placeholder={form.payment_type === "Tuition Full Payment" ? "Search enrolled student..." : "Search student by ID or name..."}
                    value={paymentStudentSearchQuery}
                    onChange={(e) => {
                      setPaymentStudentSearchQuery(e.target.value);
                      setShowPaymentStudentSuggestions(true);
                      if (!e.target.value) {
                        setForm({ ...form, student_id: "" });
                      }
                    }}
                    onFocus={() => setShowPaymentStudentSuggestions(true)}
                    onBlur={() => {
                      setTimeout(() => setShowPaymentStudentSuggestions(false), 200);
                    }}
                  />
                  {showPaymentStudentSuggestions && filteredPaymentStudentSuggestions.length > 0 && (
                    <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
                      {filteredPaymentStudentSuggestions.map((item: any) => {
                        // For Tuition Full Payment, item is enrollment object
                        if (form.payment_type === "Tuition Full Payment") {
                          return (
                            <button
                              key={item.id}
                              type="button"
                              className="w-full px-4 py-2 text-left hover:bg-gray-100 border-b border-gray-100 last:border-b-0"
                              onMouseDown={(e) => {
                                e.preventDefault();
                                if (!item.created_user_id) {
                                  showAlert(
                                    "error",
                                    "This enrollee has no user account yet. Create the user account first before recording tuition payments."
                                  );
                                  return;
                                }
                                // Use created_user_id as student_id for payments
                                setForm({ 
                                  ...form, 
                                  student_id: item.created_user_id.toString(),
                                  enrollment_id: item.id.toString()
                                });
                                setPaymentStudentSearchQuery(item.student_name);
                                setShowPaymentStudentSuggestions(false);
                              }}
                            >
                              <div className="font-medium">
                                {item.student_name}
                                <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                                  {item.status}
                                </span>
                              </div>
                              <div className="text-sm text-gray-500">
                                {item.grade_level} • {item.school_year} - {item.quarter}
                              </div>
                            </button>
                          );
                        }
                        
                        // For other payment types, item is student object
                        return (
                          <button
                            key={item.user_id}
                            type="button"
                            className="w-full px-4 py-2 text-left hover:bg-gray-100 border-b border-gray-100 last:border-b-0"
                            onMouseDown={(e) => {
                              e.preventDefault();
                              setForm({ ...form, student_id: item.user_id });
                              setPaymentStudentSearchQuery(
                                `${item.first_name} ${item.last_name} (${item.student_id || 'Enrollee'})`
                              );
                              setShowPaymentStudentSuggestions(false);
                            }}
                          >
                            <div className="font-medium">
                              {item.first_name} {item.last_name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {item.student_id || "Enrollee"} • {item.year_level || "N/A"}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div>
                  <Label>Academic Period *</Label>
                  <Select value={form.academic_period_id} onValueChange={(v) => setForm({ ...form, academic_period_id: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select period" />
                    </SelectTrigger>
                    <SelectContent>
                      {academicPeriods.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.school_year} - {p.quarter}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Payment Type *</Label>
                  <Select value={form.payment_type} onValueChange={(v) => setForm({ ...form, payment_type: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select payment type" />
                    </SelectTrigger>
                    <SelectContent>
                      {PAYMENT_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Payment Method *</Label>
                  <Select 
                    value={form.payment_method} 
                    onValueChange={async (v) => {
                      const invoiceNumber = v === "Cash" ? await generateInvoiceNumber() : "";
                      setForm({ 
                        ...form, 
                        payment_method: v,
                        reference_number: invoiceNumber
                      });
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
              </div>

              <div>
                <Label>Payment For *</Label>
                <Select 
                  value={form.payment_for} 
                  onValueChange={(value) => {
                    setForm({ ...form, payment_for: value });
                    // Auto-populate amount based on selected fee
                    const selectedFee = schoolFees.find(f => f.fee_name === value);
                    if (selectedFee) {
                      setForm(prev => ({ ...prev, amount: selectedFee.amount.toString() }));
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a fee" />
                  </SelectTrigger>
                  <SelectContent>
                    {form.payment_type ? (
                      // Show filtered fees based on payment type
                      paymentFormSchoolFees.length > 0 ? (
                        paymentFormSchoolFees.map((fee) => (
                          <SelectItem key={fee.id} value={fee.fee_name}>
                            {fee.fee_name} - ₱{Number(fee.amount).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="no-fees-available" disabled>
                          No fees available for {form.payment_type}
                        </SelectItem>
                      )
                    ) : (
                      <SelectItem value="select-payment-type" disabled>
                        Select payment type first
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Amount *</Label>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={form.amount}
                    onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  />
                </div>

                <div>
                  <Label>Payment Date *</Label>
                  <Input
                    type="date"
                    value={form.payment_date}
                    onChange={(e) => setForm({ ...form, payment_date: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label>
                  {form.payment_method === "Cash" ? "Invoice Number" : "Reference Number"}
                  {form.payment_method !== "Cash" && " (Check #, Transaction ID, etc.)"}
                </Label>
                <Input
                  placeholder={form.payment_method === "Cash" ? "Auto-generated invoice number" : "Enter reference number"}
                  value={form.reference_number}
                  onChange={(e) => setForm({ ...form, reference_number: e.target.value })}
                />
              </div>

              <div>
                <Label>Payment Status *</Label>
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PAYMENT_STATUS.map((status) => (
                      <SelectItem key={status} value={status}>{status}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Remarks</Label>
                <Textarea
                  placeholder="Additional notes..."
                  value={form.remarks}
                  onChange={(e) => setForm({ ...form, remarks: e.target.value })}
                  rows={3}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreate}>
                <Plus className="h-4 w-4 mr-2" />
                Record Payment
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Payment Dialog */}
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Payment</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Payment Type</Label>
                  <Select value={form.payment_type} onValueChange={(v) => setForm({ ...form, payment_type: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PAYMENT_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Status</Label>
                  <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PAYMENT_STATUS.map((status) => (
                        <SelectItem key={status} value={status}>{status}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>Amount</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                />
              </div>

              <div>
                <Label>Remarks</Label>
                <Textarea
                  value={form.remarks}
                  onChange={(e) => setForm({ ...form, remarks: e.target.value })}
                  rows={3}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setIsEditOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleEdit}>
                Save Changes
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* View Payment Dialog */}
        <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Payment Details</DialogTitle>
            </DialogHeader>
            {selectedPayment && (
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">Receipt Number</Label>
                    <p className="font-semibold">{selectedPayment.receipt_number}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Status</Label>
                    <Badge className={getStatusBadge(selectedPayment.status)}>
                      {selectedPayment.status}
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">Student</Label>
                    <p className="font-semibold">{selectedPayment.student_name}</p>
                    <p className="text-sm text-muted-foreground">{selectedPayment.student_number}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Amount</Label>
                    <p className="text-2xl font-bold text-green-600">
                      ₱{getNetAmount(selectedPayment).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">Payment Type</Label>
                    <p className="font-semibold">{selectedPayment.payment_type}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Payment Method</Label>
                    <p className="font-semibold">{selectedPayment.payment_method}</p>
                  </div>
                </div>

                <div>
                  <Label className="text-muted-foreground">Payment For</Label>
                  <p className="font-semibold">{selectedPayment.payment_for}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">Payment Date</Label>
                    <p className="font-semibold">{new Date(selectedPayment.payment_date).toLocaleDateString()}</p>
                  </div>
                  {selectedPayment.reference_number && (
                    <div>
                      <Label className="text-muted-foreground">Reference Number</Label>
                      <p className="font-semibold">{selectedPayment.reference_number}</p>
                    </div>
                  )}
                </div>

                {selectedPayment.remarks && (
                  <div>
                    <Label className="text-muted-foreground">Remarks</Label>
                    <p className="text-sm">{selectedPayment.remarks}</p>
                  </div>
                )}

                {selectedPayment.received_by_name && (
                  <div>
                    <Label className="text-muted-foreground">Received By</Label>
                    <p className="font-semibold">{selectedPayment.received_by_name}</p>
                  </div>
                )}

                {selectedPayment.verified_by_name && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-muted-foreground">Verified By</Label>
                      <p className="font-semibold">{selectedPayment.verified_by_name}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Verified At</Label>
                      <p className="font-semibold">
                        {selectedPayment.verified_at ? new Date(selectedPayment.verified_at).toLocaleString() : '-'}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* School Fees Side Panel */}
        {isFeesPanelOpen && (
          <div className="fixed inset-0 z-50 flex">
            {/* Overlay */}
            <div 
              className="absolute inset-0 bg-black/40 transition-opacity"
              onClick={() => setIsFeesPanelOpen(false)}
            />
            
            {/* Panel */}
            <div className="relative ml-auto w-full max-w-4xl bg-background shadow-2xl flex flex-col border-l border-border">
              {/* Header */}
              <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-6 text-white flex items-center justify-between border-b border-purple-500">
                <div>
                  <h2 className="text-2xl font-bold flex items-center gap-2">
                    <Settings className="h-6 w-6" />
                    School Fees Management
                  </h2>
                  <p className="text-purple-100 text-sm mt-1">Manage fee catalog and pricing</p>
                </div>
                <button
                  onClick={() => setIsFeesPanelOpen(false)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-all"
                  title="Close panel"
                  aria-label="Close"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* Content - Two column layout */}
              <div className="flex-1 overflow-hidden flex">
                {/* Left: Fee List */}
                <div className="w-3/5 border-r border-border flex flex-col">
                  <div className="p-4 border-b border-border bg-muted/30">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-bold text-lg">Current Fees ({filteredSchoolFees.length})</h3>
                      <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                        {academicPeriods.find(p => p.status === 'active')?.school_year || "2026-2027"}
                      </Badge>
                    </div>
                    
                    {/* Filters */}
                    <div className="space-y-2">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Search fees..."
                          value={feesSearchQuery}
                          onChange={(e) => setFeesSearchQuery(e.target.value)}
                          className="pl-10 py-2 text-sm"
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2">
                        <Select value={feeTypeFilter} onValueChange={setFeeTypeFilter}>
                          <SelectTrigger className="text-sm">
                            <SelectValue placeholder="Fee Type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Types</SelectItem>
                            {FEE_TYPES.map(type => (
                              <SelectItem key={type} value={type}>{type}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        <Select value={yearLevelFilter} onValueChange={setYearLevelFilter}>
                          <SelectTrigger className="text-sm">
                            <SelectValue placeholder="Year Level" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Levels</SelectItem>
                            {YEAR_LEVELS.map(level => (
                              <SelectItem key={level} value={level}>{level}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  {/* Fee List */}
                  <div className="flex-1 overflow-y-auto p-4">
                    {filteredSchoolFees.length > 0 ? (
                      <div className="space-y-2">
                        {filteredSchoolFees.map((fee) => (
                          <div
                            key={fee.id}
                            className={`p-4 rounded-lg border-2 transition-all hover:shadow-md ${
                              selectedFee?.id === fee.id
                                ? 'border-purple-500 bg-purple-50'
                                : fee.is_active
                                ? 'border-border/50 bg-card hover:border-purple-300'
                                : 'border-border/30 bg-muted/30 opacity-60'
                            }`}
                          >
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <h4 className="font-semibold text-sm">{fee.fee_name}</h4>
                                  {!fee.is_active && (
                                    <Badge variant="outline" className="text-xs bg-gray-100 text-gray-600">
                                      Inactive
                                    </Badge>
                                  )}
                                  {fee.is_required && (
                                    <Badge variant="outline" className="text-xs bg-red-50 text-red-600 border-red-200">
                                      Required
                                    </Badge>
                                  )}
                                </div>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                  <Badge variant="secondary" className="text-xs">
                                    {fee.fee_type}
                                  </Badge>
                                  <span>•</span>
                                  <span>
                                    {fee.year_level === null && (!fee.year_levels || fee.year_levels.length === 0)
                                      ? "All Grades"
                                      : fee.year_levels && fee.year_levels.length > 0
                                      ? fee.year_levels.join(", ")
                                      : fee.year_level}
                                  </span>
                                </div>
                                {fee.description && (
                                  <p className="text-xs text-muted-foreground mt-1">{fee.description}</p>
                                )}
                              </div>
                              <div className="text-right ml-3">
                                <p className="font-bold text-lg text-purple-700">
                                  ₱{Number(fee.amount).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                                </p>
                                {fee.due_date && (
                                  <p className="text-xs text-muted-foreground">
                                    Due: {new Date(fee.due_date).toLocaleDateString()}
                                  </p>
                                )}
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border/50">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditFee(fee)}
                                className="text-xs h-7"
                              >
                                <Edit className="h-3 w-3 mr-1" />
                                Edit
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleToggleFeeStatus(fee.id)}
                                className="text-xs h-7"
                              >
                                {fee.is_active ? 'Deactivate' : 'Activate'}
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteFee(fee.id)}
                                className="text-xs h-7 text-destructive hover:text-destructive hover:bg-destructive/10"
                              >
                                <Trash2 className="h-3 w-3 mr-1" />
                                Delete
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                        <FileText className="h-16 w-16 mb-3 opacity-30" />
                        <p className="text-sm">
                          {feesSearchQuery || feeTypeFilter !== "all" || yearLevelFilter !== "all"
                            ? "No fees match your filters"
                            : "No fees configured yet"}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right: Add/Edit Form */}
                <div className="w-2/5 flex flex-col bg-muted/20">
                  <div className="p-4 border-b border-border bg-muted/50">
                    <h3 className="font-bold text-lg">
                      {isEditingFee ? 'Edit Fee' : 'Add New Fee'}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      {isEditingFee ? 'Update fee details below' : 'Configure a new school fee'}
                    </p>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto p-4">
                    <div className="space-y-4">
                      <div>
                        <Label className="text-sm font-semibold">Fee Type *</Label>
                        <Select 
                          value={feeForm.fee_type} 
                          onValueChange={(v) => setFeeForm({ ...feeForm, fee_type: v })}
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {FEE_TYPES.map(type => (
                              <SelectItem key={type} value={type}>{type}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label className="text-sm font-semibold">Fee Name *</Label>
                        <Input
                          placeholder="e.g., Quarterly Tuition Fee"
                          value={feeForm.fee_name}
                          onChange={(e) => setFeeForm({ ...feeForm, fee_name: e.target.value })}
                          className="mt-1"
                        />
                      </div>

                      <div>
                        <Label className="text-sm font-semibold">Year Level *</Label>
                        <div className="mt-2 grid grid-cols-2 gap-2">
                          {YEAR_LEVELS.map(level => (
                            <div key={level} className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                id={`year_level_${level}`}
                                checked={feeForm.year_levels.includes(level)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    // If "All Grades" is selected, clear other selections
                                    if (level === "All Grades") {
                                      setFeeForm({ ...feeForm, year_levels: ["All Grades"] });
                                    } else {
                                      // Remove "All Grades" if selecting specific grade
                                      const filtered = feeForm.year_levels.filter(l => l !== "All Grades");
                                      setFeeForm({ ...feeForm, year_levels: [...filtered, level] });
                                    }
                                  } else {
                                    setFeeForm({ 
                                      ...feeForm, 
                                      year_levels: feeForm.year_levels.filter(l => l !== level) 
                                    });
                                  }
                                }}
                                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                              />
                              <Label 
                                htmlFor={`year_level_${level}`} 
                                className="text-sm font-normal cursor-pointer select-none"
                              >
                                {level}
                              </Label>
                            </div>
                          ))}
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                          Select "All Grades" for fees applicable to all year levels, or choose specific grades
                        </p>
                      </div>

                      <div>
                        <Label className="text-sm font-semibold">Amount (₱) *</Label>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          value={feeForm.amount}
                          onChange={(e) => setFeeForm({ ...feeForm, amount: e.target.value })}
                          className="mt-1"
                        />
                      </div>

                      <div>
                        <Label className="text-sm font-semibold">Due Date (Optional)</Label>
                        <Input
                          type="date"
                          value={feeForm.due_date}
                          onChange={(e) => setFeeForm({ ...feeForm, due_date: e.target.value })}
                          className="mt-1"
                        />
                      </div>

                      <div>
                        <Label className="text-sm font-semibold">Description</Label>
                        <Textarea
                          placeholder="Brief description of this fee..."
                          value={feeForm.description}
                          onChange={(e) => setFeeForm({ ...feeForm, description: e.target.value })}
                          rows={3}
                          className="mt-1"
                        />
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id="is_required"
                            checked={feeForm.is_required}
                            onChange={(e) => setFeeForm({ ...feeForm, is_required: e.target.checked })}
                            className="rounded"
                          />
                          <Label htmlFor="is_required" className="text-sm font-normal cursor-pointer">
                            Required Fee
                          </Label>
                        </div>

                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id="is_active"
                            checked={feeForm.is_active}
                            onChange={(e) => setFeeForm({ ...feeForm, is_active: e.target.checked })}
                            className="rounded"
                          />
                          <Label htmlFor="is_active" className="text-sm font-normal cursor-pointer">
                            Active
                          </Label>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Form Actions */}
                  <div className="p-4 border-t border-border bg-background flex gap-2">
                    {isEditingFee && (
                      <Button
                        variant="outline"
                        onClick={resetFeeForm}
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                    )}
                    <Button
                      onClick={handleSaveFee}
                      className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {isEditingFee ? 'Update Fee' : 'Add Fee'}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Discounts Panel - Slide-in from right */}
        {isDiscountsPanelOpen && (
          <div className="fixed inset-0 z-50 flex items-stretch">
            {/* Overlay */}
            <div 
              className="absolute inset-0 bg-black/40 transition-opacity"
              onClick={() => setIsDiscountsPanelOpen(false)}
            />
            
            {/* Panel */}
            <div className="relative ml-auto w-full max-w-4xl bg-background shadow-2xl flex flex-col border-l border-border">
              {/* Header */}
              <div className="bg-gradient-to-r from-amber-600 to-orange-600 p-6 text-white flex items-center justify-between border-b border-amber-500">
                <div>
                  <h2 className="text-2xl font-bold flex items-center gap-2">
                    <Settings className="h-6 w-6" />
                    Discount Management
                  </h2>
                  <p className="text-amber-100 text-sm mt-1">Manage student discounts and scholarships</p>
                </div>
                <button
                  onClick={() => setIsDiscountsPanelOpen(false)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-all"
                  title="Close panel"
                  aria-label="Close"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* Content - Two column layout */}
              <div className="flex-1 overflow-hidden flex">
                {/* Left: Discount List */}
                <div className="w-3/5 border-r border-border flex flex-col">
                  <div className="p-4 border-b border-border bg-muted/30">
                    <div className="text-sm font-semibold text-muted-foreground mb-3 flex items-center justify-between">
                      <span>Current Discounts ({filteredDiscounts.length})</span>
                      <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                        {academicPeriods.find(p => p.status === 'active')?.school_year || '2026-2027'}
                      </Badge>
                    </div>

                    {/* Search */}
                    <div className="relative mb-3">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search discounts..."
                        value={discountsSearchQuery}
                        onChange={(e) => setDiscountsSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>

                    {/* Filters */}
                    <div className="grid grid-cols-2 gap-2">
                      <Select value={discountTypeFilter} onValueChange={setDiscountTypeFilter}>
                        <SelectTrigger className="text-sm">
                          <SelectValue placeholder="All Types" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Types</SelectItem>
                          {DISCOUNT_TYPES.map((type) => (
                            <SelectItem key={type} value={type}>{type}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <Select value={discountStatusFilter} onValueChange={setDiscountStatusFilter}>
                        <SelectTrigger className="text-sm">
                          <SelectValue placeholder="All Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Status</SelectItem>
                          {DISCOUNT_STATUS.map((status) => (
                            <SelectItem key={status} value={status}>{status}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Discount List */}
                  <div className="flex-1 overflow-y-auto p-4">
                    {filteredDiscounts.length > 0 ? (
                      <div className="space-y-2">
                        {filteredDiscounts.map((discount) => (
                          <div
                            key={discount.id}
                            className={`p-4 rounded-lg border-2 transition-all hover:shadow-md ${
                              selectedDiscount?.id === discount.id
                                ? 'border-amber-500 bg-amber-50'
                                : discount.is_active
                                ? 'border-border/50 bg-card hover:border-amber-300'
                                : 'border-border/30 bg-muted/30 opacity-60'
                            }`}
                          >
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <h4 className="font-semibold text-sm">{discount.name}</h4>
                                  {!discount.is_active && (
                                    <Badge variant="outline" className="text-xs bg-gray-100 text-gray-600">
                                      Inactive
                                    </Badge>
                                  )}
                                </div>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                  <Badge variant="secondary" className="text-xs capitalize">
                                    {discount.type}
                                  </Badge>
                                  <span>•</span>
                                  <span>{discount.value_type}</span>
                                </div>
                                {discount.description && (
                                  <p className="text-xs text-muted-foreground mt-1">{discount.description}</p>
                                )}
                              </div>
                              <div className="text-right ml-3">
                                <p className="font-bold text-lg text-amber-700">
                                  {discount.value_type === 'Percentage' 
                                    ? `${discount.value}%`
                                    : `₱${Number(discount.value).toLocaleString('en-PH', { minimumFractionDigits: 2 })}`
                                  }
                                </p>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border/50">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditDiscount(discount)}
                                className="text-xs h-7"
                              >
                                <Edit className="h-3 w-3 mr-1" />
                                Edit
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleToggleDiscountStatus(discount.id)}
                                className="text-xs h-7"
                              >
                                {discount.is_active ? 'Deactivate' : 'Activate'}
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteDiscount(discount.id)}
                                className="text-xs h-7 text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="h-3 w-3 mr-1" />
                                Delete
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12 text-muted-foreground">
                        <Settings className="h-12 w-12 mx-auto mb-3 opacity-20" />
                        <p className="text-sm">No discounts found</p>
                        <p className="text-xs">Add a new discount to get started</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right: Add/Edit Form */}
                <div className="w-2/5 flex flex-col">
                  <div className="p-6 border-b border-border bg-muted/20">
                    <h3 className="font-semibold text-lg mb-1">
                      {isEditingDiscount ? 'Edit Discount' : 'Add New Discount'}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {isEditingDiscount ? 'Update discount details below' : 'Create a new discount for a student'}
                    </p>
                  </div>

                  <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    <div>
                      <Label>Discount Name *</Label>
                      <Input
                        placeholder="e.g., Academic Excellence Scholarship"
                        value={discountForm.name}
                        onChange={(e) => setDiscountForm({ ...discountForm, name: e.target.value })}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label>Category</Label>
                        <Select 
                          value={discountForm.discount_type} 
                          onValueChange={(v) => setDiscountForm({ ...discountForm, discount_type: v })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {DISCOUNT_TYPES.map(type => (
                              <SelectItem key={type} value={type}>{type}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label>Value Type *</Label>
                        <Select 
                          value={discountForm.value_type} 
                          onValueChange={(v) => setDiscountForm({ ...discountForm, value_type: v as any })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Percentage">Percentage (%)</SelectItem>
                            <SelectItem value="Fixed Amount">Fixed Amount (₱)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label>{discountForm.value_type === 'Percentage' ? 'Percentage Value (%)' : 'Amount Value (₱)'} *</Label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="e.g., 10.00"
                        value={discountForm.value}
                        onChange={(e) => setDiscountForm({ ...discountForm, value: e.target.value })}
                      />
                    </div>

                    <div>
                      <Label>Description</Label>
                      <Textarea
                        placeholder="Additional notes..."
                        value={discountForm.description || ''}
                        onChange={(e) => setDiscountForm({ ...discountForm, description: e.target.value })}
                        rows={3}
                      />
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <input
                          type="checkbox"
                          checked={discountForm.is_active}
                          onChange={(e) => setDiscountForm({ ...discountForm, is_active: e.target.checked })}
                          id="is_active_chk"
                          className="rounded"
                      />
                      <Label htmlFor="is_active_chk" className="font-normal cursor-pointer">Active</Label>
                    </div>
                  </div>

                  <div className="p-6 border-t border-border bg-muted/20">
                    <div className="flex gap-3">
                      {isEditingDiscount && (
                        <Button
                          variant="outline"
                          onClick={resetDiscountForm}
                          className="flex-1"
                        >
                          Cancel
                        </Button>
                      )}
                      <Button
                        onClick={handleSaveDiscount}
                        className="flex-1 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700"
                      >
                        <Save className="h-4 w-4 mr-2" />
                        {isEditingDiscount ? 'Update Discount' : 'Add Discount'}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {alert && <AlertMessage type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}
        
        {/* Discount Dialog */}
        {discountDialogPayment && (
          <DiscountDialog
            open={isDiscountDialogOpen}
            onOpenChange={setIsDiscountDialogOpen}
            payment={{
              ...discountDialogPayment,
              id: parseInt(discountDialogPayment.id),
              student_id: parseInt(discountDialogPayment.student_id),
              enrollment_id: discountDialogPayment.enrollment_id ? parseInt(discountDialogPayment.enrollment_id) : undefined,
            }}
            onDiscountsUpdated={() => {
              fetchData();
              setIsDiscountDialogOpen(false);
            }}
          />
        )}
      </div>
    </DashboardLayout>
  );
};

export default Payments;
