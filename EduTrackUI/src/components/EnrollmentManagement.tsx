import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Eye, Search, Clock, AlertCircle, CheckCircle2, XCircle, Plus, ArrowUpDown, LayoutGrid, List, FileText, Settings, ArrowRight, Users, UserPlus } from 'lucide-react';
import { toast } from 'sonner';
import { apiGet, API_ENDPOINTS } from '@/lib/api';
import { useRoleBasedAuth } from '@/hooks/useRoleBasedAuth';
import { Pagination } from './Pagination';

interface EnrollmentData {
  id: number;
  student_name: string;
  grade_level: string;
  status: 'Pending' | 'Incomplete' | 'Under Review' | 'Verified' | 'Approved' | 'Rejected';
  submitted_date: string;
  
  // Enrollment Type
  enrollment_type?: 'New Student' | 'Continuing Student' | 'Returning Student' | 'Transferee';
  
  // Academic period info (from JOIN)
  school_year: string;
  quarter: '1st Quarter' | '2nd Quarter' | '3rd Quarter' | '4th Quarter';
  academic_period_id: number;
  
  // Document counts
  documents_count: number;
  documents_verified: number;
  documents_rejected?: number;
  formatted_student_id?: string | null;
  
  // Database tracking fields
  enrollment_period_id?: number | null;
  created_user_id?: number | null;
  created_student_id?: number | null;
  
  // Audit fields
  approved_date?: string | null;
  rejected_date?: string | null;
  rejection_reason?: string | null;
}

const statusConfig: Record<string, { bg: string; text: string; icon: React.ReactNode; bgLight: string }> = {
  'Pending': {
    bg: 'bg-yellow-500',
    bgLight: 'bg-yellow-100',
    text: 'text-yellow-800',
    icon: <Clock className="w-4 h-4" />,
  },
  'Incomplete': {
    bg: 'bg-orange-500',
    bgLight: 'bg-orange-100',
    text: 'text-orange-800',
    icon: <AlertCircle className="w-4 h-4" />,
  },
  'Under Review': {
    bg: 'bg-blue-500',
    bgLight: 'bg-blue-100',
    text: 'text-blue-800',
    icon: <Clock className="w-4 h-4" />,
  },
  'Verified': {
    bg: 'bg-indigo-500',
    bgLight: 'bg-indigo-100',
    text: 'text-indigo-800',
    icon: <CheckCircle2 className="w-4 h-4" />,
  },
  'Approved': {
    bg: 'bg-green-500',
    bgLight: 'bg-green-100',
    text: 'text-green-800',
    icon: <CheckCircle2 className="w-4 h-4" />,
  },
  'Rejected': {
    bg: 'bg-red-500',
    bgLight: 'bg-red-100',
    text: 'text-red-800',
    icon: <XCircle className="w-4 h-4" />,
  },
};

// Status priority for sorting (lower number = higher priority/listed first)
const statusPriority: Record<string, number> = {
  'Pending': 1,
  'Incomplete': 2,
  'Under Review': 3,
  'Verified': 4,
  'Approved': 5,
  'Rejected': 6,
};

export const EnrollmentManagement = () => {
  const navigate = useNavigate();
  const { user } = useRoleBasedAuth(['admin', 'teacher']);
  const isTeacher = user?.role === 'teacher';
  const [enrollments, setEnrollments] = useState<EnrollmentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [adviserLevels, setAdviserLevels] = useState<string[]>([]);
  const [activeAdviserLevel, setActiveAdviserLevel] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [gradeFilter, setGradeFilter] = useState<string>('all');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Modal for enrollment type selection
  const [enrollmentTypeModalOpen, setEnrollmentTypeModalOpen] = useState(false);
  const [selectedEnrollmentType, setSelectedEnrollmentType] = useState<string>('');

  // Pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 10;

  const grades = ['Nursery 1', 'Nursery 2', 'Kinder', 'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6'];
  const enrollmentTypes = ['New Student', 'Transferee', 'Returning Student', 'Continuing Student'];
  const adviserEnrollmentTypes = ['New Student', 'Transferee', 'Continuing Student'];
  const manualEntryOptions = isTeacher && activeAdviserLevel === 'Nursery 1'
    ? adviserEnrollmentTypes.filter(type => type !== 'Continuing Student')
    : (isTeacher ? adviserEnrollmentTypes : enrollmentTypes);

  const handleStartManualEntry = () => {
    if (!selectedEnrollmentType) {
      toast.error('Please select an enrollment type');
      return;
    }
    setEnrollmentTypeModalOpen(false);
    if (isTeacher) {
      navigate('/adviser/enrollments/new', { state: { enrollmentType: selectedEnrollmentType } });
      return;
    }
    navigate('/admin/enrollments/new', { state: { enrollmentType: selectedEnrollmentType } });
  };

  useEffect(() => {
    if (!user) return;
    fetchEnrollments();
  }, [user]);

  const fetchEnrollments = async () => {
    try {
      setLoading(true);
      if (user?.role === 'teacher') {
        let levels: string[] = [];
        try {
          const cached = localStorage.getItem('adviserLevels');
          if (cached) {
            const parsed = JSON.parse(cached);
            if (Array.isArray(parsed)) levels = parsed;
          }
        } catch (err) {
          levels = [];
        }

        if (levels.length === 0) {
          const levelsRes = await apiGet(API_ENDPOINTS.TEACHER_ADVISER_LEVELS);
          if (levelsRes && levelsRes.success && Array.isArray(levelsRes.levels)) {
            levels = levelsRes.levels;
            try {
              localStorage.setItem('adviserLevels', JSON.stringify(levels));
            } catch (err) {
              // ignore storage errors
            }
          }
        }

        if (levels.length === 0) {
          setEnrollments([]);
          return;
        }

        setAdviserLevels(levels);
        setActiveAdviserLevel(levels[0]);

        const response = await apiGet(API_ENDPOINTS.ADVISER_ENROLLMENTS(levels[0]));
        if (response.success && Array.isArray(response.data)) {
          setEnrollments(response.data);
        } else if (Array.isArray(response.data)) {
          setEnrollments(response.data);
        } else {
          toast.error('Failed to load enrollments');
        }
        return;
      }

      const response = await apiGet(API_ENDPOINTS.ADMIN_ENROLLMENTS);
      if (response.success && Array.isArray(response.data)) {
        setEnrollments(response.data);
      } else if (Array.isArray(response.data)) {
        setEnrollments(response.data);
      } else {
        toast.error('Failed to load enrollments');
      }
    } catch (error) {
      console.error('Error fetching enrollments:', error);
      toast.error('Error loading enrollments');
    } finally {
      setLoading(false);
    }
  };

  const filteredEnrollments = enrollments.filter((enrollment) => {
    const matchesSearch =
      String(enrollment.id).includes(searchQuery) ||
      (enrollment.student_name?.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (enrollment.school_year?.toLowerCase().includes(searchQuery.toLowerCase())) ||
      enrollment.grade_level.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || enrollment.status === statusFilter;
    const matchesGrade = gradeFilter === 'all' || enrollment.grade_level === gradeFilter;

    return matchesSearch && matchesStatus && matchesGrade;
  });

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, gradeFilter]);

  // Clamp currentPage to valid pages
  const totalItems = filteredEnrollments.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

  const pagedEnrollments = filteredEnrollments.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const stats = {
    total: enrollments.length,
    pending: enrollments.filter(e => e.status === 'Pending').length,
    approved: enrollments.filter(e => e.status === 'Approved').length,
    rejected: enrollments.filter(e => e.status === 'Rejected').length,
  };

  if (!user) {
    return <div>Access Denied</div>;
  }

  const headerTitle = isTeacher && activeAdviserLevel
    ? `Enrollment Management for ${activeAdviserLevel}`
    : 'Enrollment Management';

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            {headerTitle}
          </h1>
          <p className="text-muted-foreground text-lg">Review and approve student enrollments</p>
        </div>
        <div className="flex items-center gap-3">
          {user?.role === 'admin' && (
            <>
              <Button
                onClick={() => navigate('/admin/enrollment-settings')}
                variant="outline"
                className="shadow-md hover:shadow-lg"
              >
                <Settings className="h-4 w-4 mr-2" />
                Enrollment Settings
              </Button>
              <Button
                onClick={() => setEnrollmentTypeModalOpen(true)}
                className="bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg hover:shadow-xl"
              >
                <Plus className="h-4 w-4 mr-2" />
                Manual Entry
              </Button>
            </>
          )}
          {user?.role === 'teacher' && (
            <Button
              onClick={() => {
                setSelectedEnrollmentType('');
                setEnrollmentTypeModalOpen(true);
              }}
              className="bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg hover:shadow-xl"
            >
              <Plus className="h-4 w-4 mr-2" />
              Manual Entry
            </Button>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
        <div className="p-4 rounded-lg border-2 border-slate-200 bg-gradient-to-br from-slate-50 to-slate-100">
          <div className="text-center">
            <div className="text-3xl font-bold text-slate-900">{stats.total}</div>
            <div className="text-sm text-slate-600 mt-1 font-medium">Total Enrollments</div>
          </div>
        </div>
        <div className="p-4 rounded-lg border-2 border-yellow-200 bg-gradient-to-br from-yellow-50 to-yellow-100">
          <div className="text-center">
            <div className="text-3xl font-bold text-yellow-700">{stats.pending}</div>
            <div className="text-sm text-yellow-600 mt-1 font-medium">Pending Review</div>
          </div>
        </div>
        <div className="p-4 rounded-lg border-2 border-green-200 bg-gradient-to-br from-green-50 to-green-100">
          <div className="text-center">
            <div className="text-3xl font-bold text-green-700">{stats.approved}</div>
            <div className="text-sm text-green-600 mt-1 font-medium">Approved</div>
          </div>
        </div>
        <div className="p-4 rounded-lg border-2 border-red-200 bg-gradient-to-br from-red-50 to-red-100">
          <div className="text-center">
            <div className="text-3xl font-bold text-red-700">{stats.rejected}</div>
            <div className="text-sm text-red-600 mt-1 font-medium">Rejected</div>
          </div>
        </div>
      </div>

      {/* Main Card */}
      <Card className="shadow-lg border-0">
        <CardHeader className="bg-gradient-to-r from-muted/50 to-muted border-b pb-6">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold">All Enrollments ({filteredEnrollments.length})</CardTitle>
              <CardDescription className="text-base">Student enrollment records and documents</CardDescription>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <div className="relative w-72">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="Search by name, ID or grade..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 py-2 text-base border-2 focus:border-accent-500 rounded-lg"
                />
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSortOrder((s) => (s === 'asc' ? 'desc' : 'asc'))}
                  className="flex items-center gap-2 font-medium"
                  title={`Sort ${sortOrder === 'asc' ? 'A → Z' : 'Z → A'}`}
                  aria-pressed={sortOrder === 'desc'}
                >
                  <ArrowUpDown className="h-4 w-4" />
                  <span className="hidden sm:inline">{sortOrder === 'asc' ? 'A → Z' : 'Z → A'}</span>
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setViewMode((v) => (v === 'grid' ? 'list' : 'grid'))}
                  className="flex items-center gap-2"
                  title="Toggle view"
                  aria-pressed={viewMode === 'list'}
                >
                  {viewMode === 'grid' ? <LayoutGrid className="h-4 w-4" /> : <List className="h-4 w-4" />}
                  <span className="hidden sm:inline">{viewMode === 'grid' ? 'Grid' : 'List'}</span>
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>

        {/* Filters */}
        <CardContent className="p-6 border-b">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="status-filter" className="text-sm font-semibold">Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger id="status-filter" className="mt-2 border-2 focus:border-accent-500">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Incomplete">Incomplete</SelectItem>
                  <SelectItem value="Under Review">Under Review</SelectItem>
                  <SelectItem value="Approved">Approved</SelectItem>
                  <SelectItem value="Rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="grade-filter" className="text-sm font-semibold">Grade Level</Label>
              <Select value={gradeFilter} onValueChange={setGradeFilter}>
                <SelectTrigger id="grade-filter" className="mt-2 border-2 focus:border-accent-500">
                  <SelectValue placeholder="All Grades" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Grades</SelectItem>
                  {grades.map((grade) => (
                    <SelectItem key={grade} value={grade}>
                      {grade}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>

        {/* Content */}
        <CardContent className="p-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="h-8 w-8 rounded-full border-4 border-primary border-t-transparent animate-spin mx-auto mb-4"></div>
              <p className="text-muted-foreground font-medium">Loading enrollments...</p>
            </div>
          ) : filteredEnrollments.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-lg text-muted-foreground font-medium">No enrollments found matching your filters</p>
            </div>
          ) : (
            <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
              {(() => {
                const list = [...pagedEnrollments];
                list.sort((a, b) => {
                  // First, sort by status priority (Pending → Under Review → Verified → Approved)
                  const statusPriorityA = statusPriority[a.status] || 999;
                  const statusPriorityB = statusPriority[b.status] || 999;
                  
                  if (statusPriorityA !== statusPriorityB) {
                    return statusPriorityA - statusPriorityB;
                  }
                  
                  // If same status, sort by ID
                  return sortOrder === 'asc'
                    ? String(a.id).localeCompare(String(b.id))
                    : String(b.id).localeCompare(String(a.id));
                });
                return list.map((enrollment) => {
                  const status = statusConfig[enrollment.status] || {
                    bg: 'bg-gray-500', 
                    bgLight: 'bg-gray-100', 
                    text: 'text-gray-800', 
                    icon: <AlertCircle className="w-4 h-4" />
                  };
                  if (viewMode === 'grid') {
                    return (
                      <div
                        key={enrollment.id}
                        className="rounded-2xl border-2 border-accent-200 bg-gradient-to-br from-card to-muted/30 hover:border-accent-400 hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden"
                      >
                        {/* Header */}
                        <div className={`${status.bg} px-5 py-4 text-white`}>
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="font-bold text-xl">{enrollment.student_name}</p>
                              <div className="flex items-center gap-2 mt-2">
                                <Badge className="bg-white text-gray-900 font-semibold">
                                  {enrollment.enrollment_type || 'New Student'}
                                </Badge>
                              </div>
                            </div>
                            <Badge className={`${status.bgLight} ${status.text} font-semibold`}>
                              {status.icon}
                              <span className="ml-1">{enrollment.status}</span>
                            </Badge>
                          </div>
                        </div>

                        {/* Content */}
                        <div className="p-5 flex-1">
                          <div className="space-y-3 mb-4">
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-muted-foreground">Grade Level</span>
                              <Badge variant="outline" className="capitalize">
                                {enrollment.grade_level}
                              </Badge>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-muted-foreground">Academic Period</span>
                              <span className="font-medium text-sm">
                                {enrollment.school_year} - {enrollment.quarter}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-muted-foreground">Submitted</span>
                              <span className="font-medium text-sm">
                                {new Date(enrollment.submitted_date).toLocaleDateString()}
                              </span>
                            </div>
                            <div className="flex items-center justify-between pt-2 border-t">
                              <span className="text-sm text-muted-foreground">Documents</span>
                              <div className="text-right">
                                <div className="font-bold">
                                  {enrollment.documents_verified}/{enrollment.documents_count} verified
                                </div>
                                {enrollment.documents_rejected > 0 && (
                                  <div className="text-xs text-red-600 font-semibold mt-0.5">
                                    {enrollment.documents_rejected} rejected
                                  </div>
                                )}
                              </div>
                            </div>
                            {enrollment.formatted_student_id && (
                              <div className="flex items-center justify-between pt-2 border-t">
                                <span className="text-sm text-muted-foreground">Student Created</span>
                                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                  ID: {enrollment.formatted_student_id}
                                </Badge>
                              </div>
                            )}
                            {enrollment.created_student_id && !enrollment.formatted_student_id && (
                              <div className="flex items-center justify-between pt-2 border-t">
                                <span className="text-sm text-muted-foreground">Student Created</span>
                                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                  ID: {enrollment.created_student_id}
                                </Badge>
                              </div>
                            )}
                            {enrollment.status === 'Rejected' && enrollment.rejection_reason && (
                              <div className="pt-2 border-t">
                                <p className="text-xs text-muted-foreground mb-1">Rejection Reason:</p>
                                <p className="text-sm text-red-700 font-medium">{enrollment.rejection_reason}</p>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="p-5 border-t border-accent-100 bg-card/50">
                          <Button
                            onClick={() => navigate(`/admin/enrollments/${enrollment.id}`)}
                            className="w-full gap-2 font-medium bg-gradient-to-r from-primary to-accent text-white hover:shadow-md transition-all"
                          >
                            <Eye className="h-4 w-4" />
                            Review Details
                          </Button>
                        </div>
                      </div>
                    );
                  } else {
                    // List view
                    return (
                      <div
                        key={enrollment.id}
                        className="rounded-2xl border-2 border-accent-100 bg-card hover:border-accent-300 hover:shadow-md transition-all duration-300 flex items-center justify-between p-4"
                      >
                        <div className="flex items-center gap-4 flex-1">
                          <div className={`${status.bg} w-14 h-14 rounded-xl flex items-center justify-center shadow-md flex-shrink-0 text-white`}>
                            {status.icon}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <p className="font-semibold text-lg">{enrollment.student_name}</p>
                              <Badge variant="outline" className="text-xs">
                                {enrollment.grade_level}
                              </Badge>
                              <Badge className="text-xs font-semibold bg-blue-100 text-blue-800 border-blue-200">
                                {enrollment.enrollment_type || 'New Student'}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              ID: {enrollment.id}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {enrollment.documents_verified}/{enrollment.documents_count} verified
                              {enrollment.documents_rejected > 0 && (
                                <span className="text-red-600 font-semibold ml-2">
                                  • {enrollment.documents_rejected} rejected
                                </span>
                              )}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge className={`${status.bgLight} ${status.text} font-semibold`}>
                            {enrollment.status}
                          </Badge>
                          <Button
                            onClick={() => navigate(`/admin/enrollments/${enrollment.id}`)}
                            size="sm"
                            className="gap-2 font-medium"
                          >
                            <Eye className="h-4 w-4" />
                            Review
                          </Button>
                        </div>
                      </div>
                    );
                  }
                });
              })()}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {!loading && totalItems > 0 && (
        <div className="mt-6 px-2">
          <Pagination
            currentPage={currentPage}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            onPageChange={(p) => setCurrentPage(p)}
          />
        </div>
      )}

      {/* Enrollment Type Selection Modal */}
      <Dialog open={enrollmentTypeModalOpen} onOpenChange={setEnrollmentTypeModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Select Enrollment Type</DialogTitle>
            <DialogDescription>
              Choose the type of enrollment for this manual entry
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <RadioGroup
              value={selectedEnrollmentType}
              onValueChange={setSelectedEnrollmentType}
              className="space-y-3"
            >
              {manualEntryOptions.includes('New Student') && (
                <div className="flex items-start space-x-3 p-4 bg-blue-50 rounded-lg border-2 border-blue-200 hover:border-blue-400 transition-colors cursor-pointer">
                  <RadioGroupItem value="New Student" id="new-student" className="mt-1" />
                  <div className="flex-1">
                    <Label htmlFor="new-student" className="text-base font-semibold text-gray-900 cursor-pointer flex items-center gap-2">
                      <UserPlus className="w-5 h-5 text-blue-600" />
                      New Student
                    </Label>
                    <p className="text-sm text-gray-600 mt-1">Brand new student enrolling for the first time</p>
                  </div>
                </div>
              )}

              {manualEntryOptions.includes('Transferee') && (
                <div className="flex items-start space-x-3 p-4 bg-purple-50 rounded-lg border-2 border-purple-200 hover:border-purple-400 transition-colors cursor-pointer">
                  <RadioGroupItem value="Transferee" id="transferee" className="mt-1" />
                  <div className="flex-1">
                    <Label htmlFor="transferee" className="text-base font-semibold text-gray-900 cursor-pointer flex items-center gap-2">
                      <Users className="w-5 h-5 text-purple-600" />
                      Transferee
                    </Label>
                    <p className="text-sm text-gray-600 mt-1">Student transferring from another school</p>
                  </div>
                </div>
              )}

              {manualEntryOptions.includes('Returning Student') && (
                <div className="flex items-start space-x-3 p-4 bg-indigo-50 rounded-lg border-2 border-indigo-200 hover:border-indigo-400 transition-colors cursor-pointer">
                  <RadioGroupItem value="Returning Student" id="returning-student" className="mt-1" />
                  <div className="flex-1">
                    <Label htmlFor="returning-student" className="text-base font-semibold text-gray-900 cursor-pointer flex items-center gap-2">
                      <Users className="w-5 h-5 text-indigo-600" />
                      Returning Student
                    </Label>
                    <p className="text-sm text-gray-600 mt-1">Student re-enrolling with previous enrollment history</p>
                  </div>
                </div>
              )}

              {manualEntryOptions.includes('Continuing Student') && (
                <div className="flex items-start space-x-3 p-4 bg-green-50 rounded-lg border-2 border-green-200 hover:border-green-400 transition-colors cursor-pointer">
                  <RadioGroupItem value="Continuing Student" id="continuing-student" className="mt-1" />
                  <div className="flex-1">
                    <Label htmlFor="continuing-student" className="text-base font-semibold text-gray-900 cursor-pointer flex items-center gap-2">
                      <Users className="w-5 h-5 text-green-600" />
                      Continuing Student
                    </Label>
                    <p className="text-sm text-gray-600 mt-1">Legacy student with existing enrollment record</p>
                  </div>
                </div>
              )}
            </RadioGroup>
          </div>
          <div className="flex gap-3 justify-end">
            <Button
              variant="outline"
              onClick={() => {
                setEnrollmentTypeModalOpen(false);
                setSelectedEnrollmentType('');
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleStartManualEntry}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
              disabled={!selectedEnrollmentType}
            >
              Continue
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EnrollmentManagement;
