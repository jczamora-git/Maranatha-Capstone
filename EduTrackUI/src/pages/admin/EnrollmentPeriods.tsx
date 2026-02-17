import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { API_ENDPOINTS, apiGet, apiPost, apiPut, apiDelete } from "@/lib/api";
import { CalendarClock, Plus, Edit, Trash2, CheckCircle, Clock, Users, ChevronDown, ChevronUp, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useConfirm } from "@/components/Confirm";
import { Checkbox } from "@/components/ui/checkbox";

interface AcademicPeriod {
  id: number;
  school_year: string;
  quarter: string;
}

interface EnrollmentPeriod {
  id: number;
  academic_period_id: number;
  enrollment_name: string;
  enrollment_type: 'Regular' | 'Mid-Year' | 'Transferee';
  description?: string;
  start_date: string;
  end_date: string;
  status: 'Upcoming' | 'Open' | 'Closed' | 'Cancelled';
  max_slots?: number;
  current_enrollees: number;
  allowed_grade_levels?: string[];
  school_year: string;
  quarter: string;
  academic_period_status: string;
  created_at: string;
  updated_at: string;
}

const GRADE_LEVELS = [
  'Nursery 1', 'Nursery 2', 'Kinder',
  'Grade 1', 'Grade 2', 'Grade 3', 
  'Grade 4', 'Grade 5', 'Grade 6'
];

const ENROLLMENT_TYPES = ['Regular', 'Mid-Year', 'Transferee'] as const;

interface EnrollmentPeriodsProps {
  embedded?: boolean;
}

const EnrollmentPeriods = ({ embedded = false }: EnrollmentPeriodsProps) => {
  const { toast } = useToast();
  const confirm = useConfirm();
  const queryClient = useQueryClient();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingPeriod, setEditingPeriod] = useState<EnrollmentPeriod | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

  // Form state
  const [formData, setFormData] = useState({
    academic_period_id: "",
    enrollment_name: "",
    enrollment_type: "Regular" as typeof ENROLLMENT_TYPES[number],
    description: "",
    start_date: "",
    end_date: "",
    status: "Upcoming" as const,
    max_slots: "",
    allowed_grade_levels: [] as string[],
  });

  // Fetch all enrollment periods
  const { data: periodsData, isLoading } = useQuery({
    queryKey: ['enrollment-periods'],
    queryFn: () => apiGet(API_ENDPOINTS.ENROLLMENT_PERIODS),
  });

  const periods = (periodsData?.data || []) as EnrollmentPeriod[];

  // Fetch academic periods for dropdown
  const { data: academicPeriodsData } = useQuery({
    queryKey: ['academic-periods'],
    queryFn: () => apiGet(API_ENDPOINTS.ACADEMIC_PERIODS),
  });

  const academicPeriods = (academicPeriodsData?.data || []) as AcademicPeriod[];

  // Find open period
  const openPeriod = periods.find(p => p.status === 'Open');

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: any) => apiPost(API_ENDPOINTS.ENROLLMENT_PERIODS, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enrollment-periods'] });
      queryClient.invalidateQueries({ queryKey: ['enrollment-period', 'active'] });
      setIsCreateDialogOpen(false);
      resetForm();
      toast({
        title: "Success",
        description: "Enrollment period created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to create enrollment period",
        variant: "destructive",
      });
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      apiPut(API_ENDPOINTS.ENROLLMENT_PERIOD_BY_ID(id), data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enrollment-periods'] });
      queryClient.invalidateQueries({ queryKey: ['enrollment-period', 'active'] });
      setIsEditDialogOpen(false);
      setEditingPeriod(null);
      resetForm();
      toast({
        title: "Success",
        description: "Enrollment period updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update enrollment period",
        variant: "destructive",
      });
    },
  });

  // Set active mutation
  const setActiveMutation = useMutation({
    mutationFn: ({ id, is_active }: { id: number; is_active: boolean }) =>
      apiPost(API_ENDPOINTS.ENROLLMENT_PERIOD_SET_ACTIVE(id), { is_active }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enrollment-periods'] });
      queryClient.invalidateQueries({ queryKey: ['enrollment-period', 'active'] });
      toast({
        title: "Success",
        description: "Enrollment period status updated",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update period status",
        variant: "destructive",
      });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiDelete(API_ENDPOINTS.ENROLLMENT_PERIOD_BY_ID(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enrollment-periods'] });
      toast({
        title: "Success",
        description: "Enrollment period deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to delete enrollment period",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setFormData({
      academic_period_id: "",
      enrollment_name: "",
      enrollment_type: "Regular",
      description: "",
      start_date: "",
      end_date: "",
      status: "Upcoming",
      max_slots: "",
      allowed_grade_levels: [],
    });
  };

  const handleCreate = () => {
    if (!formData.academic_period_id || !formData.enrollment_name || !formData.start_date || !formData.end_date) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const payload = {
      ...formData,
      academic_period_id: parseInt(formData.academic_period_id),
      max_slots: formData.max_slots ? parseInt(formData.max_slots) : null,
    };

    createMutation.mutate(payload);
  };

  const handleEdit = (period: EnrollmentPeriod) => {
    setEditingPeriod(period);
    setFormData({
      academic_period_id: period.academic_period_id.toString(),
      enrollment_name: period.enrollment_name,
      enrollment_type: period.enrollment_type,
      description: period.description || "",
      start_date: period.start_date,
      end_date: period.end_date,
      status: period.status,
      max_slots: period.max_slots?.toString() || "",
      allowed_grade_levels: period.allowed_grade_levels || [],
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdate = () => {
    if (!editingPeriod) return;

    if (!formData.academic_period_id || !formData.enrollment_name || !formData.start_date || !formData.end_date) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const payload = {
      ...formData,
      academic_period_id: parseInt(formData.academic_period_id),
      max_slots: formData.max_slots ? parseInt(formData.max_slots) : null,
    };

    updateMutation.mutate({ id: editingPeriod.id, data: payload });
  };

  const handleSetActive = async (period: EnrollmentPeriod) => {
    const isOpen = period.status === 'Open';
    const newStatus = isOpen ? 'Closed' : 'Open';
    
    const confirmed = await confirm({
      title: isOpen ? 'Close Period?' : 'Open Period?',
      description: `Are you sure you want to set this period to ${newStatus}?`,
      confirmText: isOpen ? 'Close' : 'Open',
      cancelText: 'Cancel',
    });

    if (confirmed) {
      setActiveMutation.mutate({ id: period.id, is_active: !isOpen });
    }
  };

  const handleDelete = async (period: EnrollmentPeriod) => {
    if (period.status === 'Open') {
      toast({
        title: "Cannot Delete",
        description: "Cannot delete an open enrollment period. Please close it first.",
        variant: "destructive",
      });
      return;
    }

    if (period.current_enrollees > 0) {
      toast({
        title: "Cannot Delete",
        description: `This period has ${period.current_enrollees} enrollments. Cannot delete.`,
        variant: "destructive",
      });
      return;
    }

    const confirmed = await confirm({
      title: 'Delete Period?',
      description: `Are you sure you want to delete "${period.enrollment_name}"?`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
    });

    if (confirmed) {
      deleteMutation.mutate(period.id);
    }
  };

  const toggleGradeLevel = (grade: string) => {
    setFormData(prev => ({
      ...prev,
      allowed_grade_levels: prev.allowed_grade_levels.includes(grade)
        ? prev.allowed_grade_levels.filter(g => g !== grade)
        : [...prev.allowed_grade_levels, grade]
    }));
  };

  const toggleSection = (academicPeriod: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(academicPeriod)) {
        newSet.delete(academicPeriod);
      } else {
        newSet.add(academicPeriod);
      }
      return newSet;
    });
  };

  const filteredPeriods = periods.filter(period => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      period.enrollment_name.toLowerCase().includes(query) ||
      period.school_year.toLowerCase().includes(query) ||
      period.enrollment_type.toLowerCase().includes(query)
    );
  });

  // Group periods by academic period
  const groupedPeriods = filteredPeriods.reduce((acc, period) => {
    const key = `${period.school_year} - ${period.quarter}`;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(period);
    return acc;
  }, {} as Record<string, EnrollmentPeriod[]>);

  const totalPeriods = filteredPeriods.length;

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      'Open': { variant: 'default', className: 'bg-green-600' },
      'Upcoming': { variant: 'secondary', className: 'bg-blue-600' },
      'Closed': { variant: 'outline', className: 'bg-gray-600' },
      'Cancelled': { variant: 'destructive', className: 'bg-red-600' },
    };

    const config = variants[status] || { variant: 'outline' };

    return (
      <Badge variant={config.variant} className={config.className}>
        {status}
      </Badge>
    );
  };

  const content = (
    <div className="space-y-6">
      {/* Header */}
      {!embedded && (
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              Enrollment Periods
            </h1>
            <p className="text-muted-foreground text-lg mt-2">
              Manage enrollment windows and capacity for each academic period
            </p>
          </div>
          <Button 
            onClick={() => {
              resetForm();
              setIsCreateDialogOpen(true);
            }}
            className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg hover:shadow-xl"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Enrollment Period
          </Button>
        </div>
      )}

      {/* Create Period Button (for embedded mode) */}
      {embedded && (
        <div className="flex justify-end">
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <Button 
              onClick={() => {
                resetForm();
                setIsCreateDialogOpen(true);
              }}
              className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg hover:shadow-xl"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Period
            </Button>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create Enrollment Period</DialogTitle>
                <DialogDescription>
                  Set up a new enrollment window for students
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="academic_period">Academic Period *</Label>
                  <Select
                    value={formData.academic_period_id}
                    onValueChange={(value) => setFormData({ ...formData, academic_period_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select academic period" />
                    </SelectTrigger>
                    <SelectContent>
                      {academicPeriods.map((period) => (
                        <SelectItem key={period.id} value={period.id.toString()}>
                          {period.school_year} - {period.quarter}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="enrollment_name">Period Name *</Label>
                  <Input
                    id="enrollment_name"
                    value={formData.enrollment_name}
                    onChange={(e) => setFormData({ ...formData, enrollment_name: e.target.value })}
                    placeholder="e.g., S.Y. 2025-2026 Enrollment"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="enrollment_type">Enrollment Type</Label>
                  <Select
                    value={formData.enrollment_type}
                    onValueChange={(value: any) => setFormData({ ...formData, enrollment_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ENROLLMENT_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="start_date">Start Date *</Label>
                    <Input
                      id="start_date"
                      type="date"
                      value={formData.start_date}
                      onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="end_date">End Date *</Label>
                    <Input
                      id="end_date"
                      type="date"
                      value={formData.end_date}
                      onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value: any) => setFormData({ ...formData, status: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Upcoming">Upcoming</SelectItem>
                        <SelectItem value="Open">Open</SelectItem>
                        <SelectItem value="Closed">Closed</SelectItem>
                        <SelectItem value="Cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="max_slots">Max Slots (Optional)</Label>
                    <Input
                      id="max_slots"
                      type="number"
                      value={formData.max_slots}
                      onChange={(e) => setFormData({ ...formData, max_slots: e.target.value })}
                      placeholder="Leave empty for unlimited"
                    />
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Additional information about this enrollment period"
                    rows={3}
                  />
                </div>

                <div className="grid gap-2">
                  <Label>Allowed Grade Levels (Optional - all if none selected)</Label>
                  <div className="grid grid-cols-3 gap-2 p-4 border rounded-md">
                    {GRADE_LEVELS.map((grade) => (
                      <div key={grade} className="flex items-center space-x-2">
                        <Checkbox
                          id={`grade-${grade}`}
                          checked={formData.allowed_grade_levels.includes(grade)}
                          onCheckedChange={() => toggleGradeLevel(grade)}
                        />
                        <label
                          htmlFor={`grade-${grade}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {grade}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreate} disabled={createMutation.isPending}>
                  {createMutation.isPending ? "Creating..." : "Create Period"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      )}

      {/* Periods Count and Search */}
      <Card className="shadow-lg border-0">
        <CardHeader className="bg-gradient-to-r from-muted/50 to-muted border-b">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold">Enrollment Periods ({totalPeriods})</CardTitle>
              <CardDescription className="text-base mt-1">Create and manage enrollment windows for each academic year</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search enrollment periods..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 border-2 focus:border-blue-500 rounded-lg"
            />
          </div>
        </CardContent>
      </Card>

      {/* Open Period Highlight */}
        {openPeriod && (
          <Card className="shadow-lg border-2 border-green-300 bg-gradient-to-r from-green-50 to-emerald-50">
            <CardHeader className="border-b border-green-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <CardTitle className="text-green-900 text-xl">Currently Open Period</CardTitle>
                    <CardDescription className="text-green-700">Active enrollment window</CardDescription>
                  </div>
                </div>
                {getStatusBadge(openPeriod.status)}
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Period Name</p>
                  <p className="font-semibold">{openPeriod.enrollment_name}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {openPeriod.school_year} - {openPeriod.quarter}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Type</p>
                  <Badge variant="outline">{openPeriod.enrollment_type}</Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Period</p>
                  <p className="text-sm font-medium">
                    {new Date(openPeriod.start_date).toLocaleDateString()} - {new Date(openPeriod.end_date).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Enrollments</p>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span className="font-semibold">
                      {openPeriod.current_enrollees}
                      {openPeriod.max_slots && ` / ${openPeriod.max_slots}`}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Periods List */}
        {isLoading ? (
          <Card className="shadow-lg border-0">
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">Loading enrollment periods...</p>
            </CardContent>
          </Card>
        ) : filteredPeriods.length === 0 ? (
          <Card className="shadow-lg border-0">
            <CardContent className="py-12 text-center">
              <CalendarClock className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground font-medium">No enrollment periods found</p>
              <p className="text-sm text-muted-foreground mt-2">
                {searchQuery ? "Try a different search term" : "Create your first enrollment period to get started"}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {Object.entries(groupedPeriods).map(([academicPeriod, periodsList]) => {
              const isExpanded = expandedSections.has(academicPeriod);
              return (
                <Collapsible key={academicPeriod} open={isExpanded} onOpenChange={() => toggleSection(academicPeriod)}>
                  <Card className="shadow-lg border-0 overflow-hidden">
                    <CollapsibleTrigger className="w-full">
                      <CardHeader className="bg-gradient-to-r from-blue-500 to-cyan-600 border-b hover:from-blue-600 hover:to-cyan-700 transition-all cursor-pointer">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-white/20 rounded-lg">
                              <CalendarClock className="h-5 w-5 text-white" />
                            </div>
                            <div className="text-left">
                              <CardTitle className="text-white text-xl">{academicPeriod}</CardTitle>
                              <CardDescription className="text-blue-100 mt-1">
                                {periodsList.length} period{periodsList.length !== 1 ? 's' : ''}
                              </CardDescription>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {isExpanded ? (
                              <ChevronUp className="h-5 w-5 text-white" />
                            ) : (
                              <ChevronDown className="h-5 w-5 text-white" />
                            )}
                          </div>
                        </div>
                      </CardHeader>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <CardContent className="p-6 bg-gradient-to-b from-gray-50/50 to-white">
                        <div className="space-y-3">
                          {periodsList.map((period) => (
                            <Card 
                              key={period.id} 
                              className={`border-2 transition-all shadow-sm hover:shadow-md ${
                                period.status === 'Open' 
                                  ? 'border-green-300 bg-green-50/30 hover:border-green-400' 
                                  : 'border-gray-200 bg-white hover:border-blue-300'
                              }`}
                            >
                              <CardHeader className="pb-3">
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <CardTitle className="text-lg font-semibold">{period.enrollment_name}</CardTitle>
                                      {getStatusBadge(period.status)}
                                      <Badge variant="outline" className="font-medium">{period.enrollment_type}</Badge>
                                    </div>
                                    {period.description && (
                                      <CardDescription className="mt-2 text-sm">{period.description}</CardDescription>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleEdit(period);
                                      }}
                                      className="h-8 w-8 hover:bg-blue-100"
                                    >
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleDelete(period);
                                      }}
                                      disabled={period.status === 'Open' || deleteMutation.isPending}
                                      className="h-8 w-8 hover:bg-red-100"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                              </CardHeader>
                              <CardContent className="pt-4">
                                <div className="grid md:grid-cols-2 gap-4 mb-4">
                                  <div className="flex items-center gap-2">
                                    <Button
                                      variant={period.status === 'Open' ? 'destructive' : 'default'}
                                      size="sm"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleSetActive(period);
                                      }}
                                      disabled={setActiveMutation.isPending}
                                      className="w-full"
                                    >
                                      {period.status === 'Open' ? (
                                        <>
                                          <Clock className="h-4 w-4 mr-2" />
                                          Close Period
                                        </>
                                      ) : (
                                        <>
                                          <CheckCircle className="h-4 w-4 mr-2" />
                                          Open Period
                                        </>
                                      )}
                                    </Button>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Users className="h-4 w-4 text-muted-foreground" />
                                    <span className="font-semibold text-lg">
                                      {period.current_enrollees}
                                      {period.max_slots && <span className="text-muted-foreground"> / {period.max_slots}</span>}
                                    </span>
                                    <span className="text-sm text-muted-foreground">enrollees</span>
                                  </div>
                                </div>
                                <div className="grid md:grid-cols-3 gap-4 pt-4 border-t">
                                  <div>
                                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Start Date</p>
                                    <p className="font-semibold">{new Date(period.start_date).toLocaleDateString()}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">End Date</p>
                                    <p className="font-semibold">{new Date(period.end_date).toLocaleDateString()}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Allowed Grades</p>
                                    {period.allowed_grade_levels && period.allowed_grade_levels.length > 0 ? (
                                      <div className="flex flex-wrap gap-1 mt-1">
                                        {period.allowed_grade_levels.slice(0, 3).map((grade) => (
                                          <Badge key={grade} variant="secondary" className="text-xs">
                                            {grade}
                                          </Badge>
                                        ))}
                                        {period.allowed_grade_levels.length > 3 && (
                                          <Badge variant="secondary" className="text-xs">
                                            +{period.allowed_grade_levels.length - 3}
                                          </Badge>
                                        )}
                                      </div>
                                    ) : (
                                      <Badge variant="outline" className="text-xs">All Grades</Badge>
                                    )}
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </CardContent>
                    </CollapsibleContent>
                  </Card>
                </Collapsible>
              );
            })}
          </div>
        )}

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Enrollment Period</DialogTitle>
              <DialogDescription>
                Update enrollment period details
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit_academic_period">Academic Period *</Label>
                <Select
                  value={formData.academic_period_id}
                  onValueChange={(value) => setFormData({ ...formData, academic_period_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select academic period" />
                  </SelectTrigger>
                  <SelectContent>
                    {academicPeriods.map((period) => (
                      <SelectItem key={period.id} value={period.id.toString()}>
                        {period.school_year} - {period.quarter}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="edit_enrollment_name">Period Name *</Label>
                <Input
                  id="edit_enrollment_name"
                  value={formData.enrollment_name}
                  onChange={(e) => setFormData({ ...formData, enrollment_name: e.target.value })}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="edit_enrollment_type">Enrollment Type</Label>
                <Select
                  value={formData.enrollment_type}
                  onValueChange={(value: any) => setFormData({ ...formData, enrollment_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ENROLLMENT_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit_start_date">Start Date *</Label>
                  <Input
                    id="edit_start_date"
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit_end_date">End Date *</Label>
                  <Input
                    id="edit_end_date"
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit_status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value: any) => setFormData({ ...formData, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Upcoming">Upcoming</SelectItem>
                      <SelectItem value="Open">Open</SelectItem>
                      <SelectItem value="Closed">Closed</SelectItem>
                      <SelectItem value="Cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit_max_slots">Max Slots (Optional)</Label>
                  <Input
                    id="edit_max_slots"
                    type="number"
                    value={formData.max_slots}
                    onChange={(e) => setFormData({ ...formData, max_slots: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="edit_description">Description</Label>
                <Textarea
                  id="edit_description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="grid gap-2">
                <Label>Allowed Grade Levels</Label>
                <div className="grid grid-cols-3 gap-2 p-4 border rounded-md">
                  {GRADE_LEVELS.map((grade) => (
                    <div key={grade} className="flex items-center space-x-2">
                      <Checkbox
                        id={`edit-grade-${grade}`}
                        checked={formData.allowed_grade_levels.includes(grade)}
                        onCheckedChange={() => toggleGradeLevel(grade)}
                      />
                      <label
                        htmlFor={`edit-grade-${grade}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {grade}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdate} disabled={updateMutation.isPending}>
                {updateMutation.isPending ? "Updating..." : "Update Period"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
  );

  return embedded ? content : <DashboardLayout>{content}</DashboardLayout>;
};

export default EnrollmentPeriods;
