import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Edit, Trash2, Users, ArrowLeft, CheckSquare, Square, X, LayoutGrid, List, ArrowUpDown, BookOpen } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertMessage } from "@/components/AlertMessage";
import { useConfirm } from "@/components/Confirm";
import { API_ENDPOINTS, apiGet, apiPut } from "@/lib/api";

type YearLevel = {
  id: number;
  name: string;
  order: number;
};

type Student = {
  id: string;
  name: string;
  email: string;
  studentId: string;
  yearLevel: string;
  section: string;
  phone?: string;
  status: "active" | "inactive" | "graduated";
};

const StudentGradeLevelManagement = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  const [students, setStudents] = useState<Student[]>([]);
  const [yearLevels, setYearLevels] = useState<YearLevel[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterGrade, setFilterGrade] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  
  const [selectedStudents, setSelectedStudents] = useState<Set<string>>(new Set());
  const [showBulkPanel, setShowBulkPanel] = useState(false);
  const [bulkGradeLevel, setBulkGradeLevel] = useState<string>("");
  
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editGradeLevel, setEditGradeLevel] = useState<string>("");
  
  const [alert, setAlert] = useState<{ type: "success" | "error" | "info"; message: string } | null>(null);
  const [loading, setLoading] = useState(true);

  const showAlert = (type: "success" | "error" | "info", message: string) => {
    setAlert({ type, message });
  };

  const confirm = useConfirm();

  useEffect(() => {
    if (!isAuthenticated || user?.role !== "admin") {
      navigate("/auth");
    }
  }, [isAuthenticated, user, navigate]);

  // Fetch year levels
  useEffect(() => {
    const fetchYearLevels = async () => {
      try {
        const res = await apiGet('/api/year-levels');
        if (res && res.success && res.year_levels) {
          const sorted = res.year_levels.sort((a: YearLevel, b: YearLevel) => a.order - b.order);
          setYearLevels(sorted);
        }
      } catch (err) {
        console.error('Failed to fetch year levels:', err);
      }
    };
    
    if (isAuthenticated && user?.role === 'admin') {
      fetchYearLevels();
    }
  }, [isAuthenticated, user]);

  // Fetch students
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true);
        const res = await apiGet(`${API_ENDPOINTS.USERS}/../students`);
        const rows = res && (res.data || res.students) ? (res.data || res.students) : Array.isArray(res) ? res : [];
        
        if (Array.isArray(rows)) {
          const mapped: Student[] = rows.map((r: any) => ({
            id: String(r.id ?? r.user_id ?? Date.now()),
            name: `${r.last_name || r.lastName || ''}, ${r.first_name || r.firstName || ''}`.trim() || (r.email || ''),
            email: r.email || r.user_email || '',
            studentId: r.student_id || r.studentId || '',
            yearLevel: r.year_level || '',
            section: r.section_name ?? r.section ?? '',
            phone: r.phone || '',
            status: r.status || r.user_status || 'active',
          }));
          setStudents(mapped);
        }
      } catch (err) {
        console.error('Failed to fetch students:', err);
        showAlert('error', 'Failed to load students');
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated && user?.role === 'admin') {
      fetchStudents();
    }
  }, [isAuthenticated, user]);

  const filteredStudents = students.filter((s) => {
    const q = searchQuery.trim().toLowerCase();
    const matchesQuery = q === "" || s.name.toLowerCase().includes(q) || s.email.toLowerCase().includes(q) || s.studentId.toLowerCase().includes(q);
    const matchesGrade = filterGrade === "all" 
      ? true 
      : filterGrade === "unassigned" 
        ? !s.yearLevel || s.yearLevel.trim() === ""
        : s.yearLevel === filterGrade;
    const matchesStatus = filterStatus === "all" || s.status === filterStatus;
    return matchesQuery && matchesGrade && matchesStatus;
  });

  const sortedStudents = [...filteredStudents].sort((a, b) => {
    if (sortOrder === "asc") return a.name.localeCompare(b.name);
    return b.name.localeCompare(a.name);
  });

  const toggleSelectStudent = (studentId: string) => {
    const newSelected = new Set(selectedStudents);
    if (newSelected.has(studentId)) {
      newSelected.delete(studentId);
    } else {
      newSelected.add(studentId);
    }
    setSelectedStudents(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedStudents.size === sortedStudents.length) {
      setSelectedStudents(new Set());
    } else {
      setSelectedStudents(new Set(sortedStudents.map(s => s.id)));
    }
  };

  const handleBulkUpdate = async () => {
    if (!bulkGradeLevel) {
      showAlert("error", "Please select a grade level");
      return;
    }

    const ok = await confirm({
      title: 'Bulk Update Grade Level',
      description: `Are you sure you want to assign ${selectedStudents.size} student(s) to the selected grade level?`,
      confirmText: 'Update',
      cancelText: 'Cancel',
      variant: 'default'
    });

    if (!ok) return;

    try {
      const selectedStudentList = sortedStudents.filter(s => selectedStudents.has(s.id));
      const gradeLevel = yearLevels.find(y => String(y.id) === bulkGradeLevel);
      
      if (!gradeLevel) {
        showAlert("error", "Selected grade level not found");
        return;
      }

      let successCount = 0;
      let failureCount = 0;

      for (const student of selectedStudentList) {
        try {
          await apiPut(`/api/students/${student.id}`, { yearLevel: gradeLevel.name });
          successCount++;
        } catch (err) {
          console.error(`Failed to update ${student.name}:`, err);
          failureCount++;
        }
      }

      // Refresh students
      await new Promise(resolve => setTimeout(resolve, 500));
      const res = await apiGet(`${API_ENDPOINTS.USERS}/../students`);
      const rows = res && (res.data || res.students) ? (res.data || res.students) : Array.isArray(res) ? res : [];
      
      if (Array.isArray(rows)) {
        const mapped: Student[] = rows.map((r: any) => ({
          id: String(r.id ?? r.user_id ?? Date.now()),
          name: `${r.last_name || r.lastName || ''}, ${r.first_name || r.firstName || ''}`.trim() || (r.email || ''),
          email: r.email || r.user_email || '',
          studentId: r.student_id || r.studentId || '',
          yearLevel: r.year_level || '',
          section: r.section_name ?? r.section ?? '',
          phone: r.phone || '',
          status: r.status || r.user_status || 'active',
        }));
        setStudents(mapped);
      }

      setSelectedStudents(new Set());
      setShowBulkPanel(false);
      setBulkGradeLevel("");
      
      showAlert("success", `Updated ${successCount} student(s)${failureCount > 0 ? `, ${failureCount} failed` : ''}`);
    } catch (err: any) {
      console.error('Bulk update error:', err);
      showAlert("error", err.message || "Failed to update students");
    }
  };

  const handleEditStudent = (student: Student) => {
    setEditingStudent(student);
    setEditGradeLevel(student.yearLevel ? yearLevels.find(y => y.name === student.yearLevel)?.id.toString() || "" : "");
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    if (!editingStudent || !editGradeLevel) {
      showAlert("error", "Please select a grade level");
      return;
    }

    try {
      const gradeLevel = yearLevels.find(y => String(y.id) === editGradeLevel);
      if (!gradeLevel) {
        showAlert("error", "Selected grade level not found");
        return;
      }

      await apiPut(`/api/students/${editingStudent.id}`, { yearLevel: gradeLevel.name });

      // Update local state
      setStudents(prev => prev.map(s => 
        s.id === editingStudent.id 
          ? { ...s, yearLevel: gradeLevel.name }
          : s
      ));

      setShowEditModal(false);
      setEditingStudent(null);
      showAlert("success", `${editingStudent.name} grade level updated to ${gradeLevel.name}`);
    } catch (err: any) {
      console.error('Edit error:', err);
      showAlert("error", err.message || "Failed to update student");
    }
  };

  if (!isAuthenticated) return null;

  return (
    <DashboardLayout>
      <div className="p-8">
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate("/admin/users/students")}
            className="mb-6 gap-2 text-base font-medium hover:bg-muted"
          >
            <ArrowLeft className="h-5 w-5" />
            Back to Students
          </Button>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Grade Level Management
              </h1>
              <p className="text-muted-foreground text-lg">Manage and assign students to grade levels</p>
            </div>
          </div>
        </div>

        <Card className="shadow-lg border-0 mb-6">
          <CardHeader className="bg-gradient-to-r from-muted/50 to-muted border-b pb-6">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl font-bold">All Students ({filteredStudents.length})</CardTitle>
                <CardDescription className="text-base">Select students to bulk update their grade level</CardDescription>
              </div>
            </div>

            <div className="flex items-center gap-3 mt-4 flex-wrap">
              <div className="relative flex-1 min-w-64">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="Search by name, email, or student ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 py-2.5 text-base border-2 focus:border-accent-500 rounded-xl"
                />
              </div>

              <Select value={filterGrade} onValueChange={setFilterGrade}>
                <SelectTrigger className="border-2 rounded-xl px-3 py-2 bg-background font-medium w-40">
                  {filterGrade === "all" 
                    ? "All Grades" 
                    : filterGrade === "unassigned"
                      ? "Unassigned"
                      : yearLevels.find(y => y.name === filterGrade)?.name || filterGrade}
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Grades</SelectItem>
                  <SelectItem value="unassigned">Unassigned</SelectItem>
                  {yearLevels.map((yl) => (
                    <SelectItem key={yl.id} value={yl.name}>{yl.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="border-2 rounded-xl px-3 py-2 bg-background font-medium w-40">
                  {filterStatus === "all" ? "All Status" : filterStatus}
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="graduated">Graduated</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setSortOrder((s) => (s === "asc" ? "desc" : "asc"))}
                className="flex items-center gap-2 font-medium"
                title={`Sort ${sortOrder === "asc" ? "A → Z" : "Z → A"}`}
              >
                <ArrowUpDown className="h-4 w-4" />
                {sortOrder === "asc" ? "A → Z" : "Z → A"}
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setViewMode((v) => (v === "list" ? "grid" : "list"))}
                className="flex items-center gap-2"
                title="Toggle view"
              >
                {viewMode === "list" ? <List className="h-4 w-4" /> : <LayoutGrid className="h-4 w-4" />}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {selectedStudents.size > 0 && (
              <div className="mb-6 p-4 bg-accent/10 border-2 border-accent/30 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CheckSquare className="h-5 w-5 text-accent" />
                  <span className="font-semibold text-base">{selectedStudents.size} student(s) selected</span>
                </div>
                <Button
                  onClick={() => setShowBulkPanel(true)}
                  className="bg-gradient-to-r from-primary to-accent text-white font-semibold gap-2"
                >
                  <BookOpen className="h-4 w-4" />
                  Bulk Update Grade Level
                </Button>
              </div>
            )}

            {loading ? (
              <div className="flex items-center justify-center h-96">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Loading students...</p>
                </div>
              </div>
            ) : sortedStudents.length > 0 ? (
              viewMode === "list" ? (
                <div className="space-y-3">
                  {/* Select All Header */}
                  <div className="flex items-center gap-3 p-4 bg-muted/30 rounded-lg font-semibold">
                    <button
                      onClick={toggleSelectAll}
                      className="flex items-center justify-center h-6 w-6 rounded border-2 border-border hover:border-primary transition-colors"
                    >
                      {selectedStudents.size === sortedStudents.length && sortedStudents.length > 0 ? (
                        <CheckSquare className="h-5 w-5 text-primary" />
                      ) : (
                        <Square className="h-5 w-5" />
                      )}
                    </button>
                    <span>{selectedStudents.size === sortedStudents.length && sortedStudents.length > 0 ? "Deselect All" : "Select All"}</span>
                  </div>

                  {sortedStudents.map((student) => (
                    <div
                      key={student.id}
                      className="flex items-center justify-between p-4 bg-gradient-to-r from-card to-muted/20 border-2 border-border/30 rounded-xl hover:border-accent-300 hover:shadow-md transition-all group"
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <button
                          onClick={() => toggleSelectStudent(student.id)}
                          className="flex items-center justify-center h-6 w-6 rounded border-2 border-border group-hover:border-primary transition-colors"
                        >
                          {selectedStudents.has(student.id) ? (
                            <CheckSquare className="h-5 w-5 text-primary" />
                          ) : (
                            <Square className="h-5 w-5" />
                          )}
                        </button>
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-semibold text-base shadow-md">
                          {student.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <p className="font-semibold text-base">{student.name}</p>
                            <Badge variant="secondary" className="capitalize font-semibold px-3 py-1 bg-gradient-to-r from-primary/10 to-accent/10 text-primary border border-primary/20">
                              {student.studentId}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                            <span>{student.email}</span>
                            {student.yearLevel && (
                              <Badge variant="outline" className="text-xs">{student.yearLevel}</Badge>
                            )}
                            {student.section && (
                              <span>• {student.section}</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={student.status === "active" ? "default" : "outline"} className="text-xs font-semibold capitalize">
                          {student.status}
                        </Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditStudent(student)}
                          className="gap-2 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Edit className="h-4 w-4" />
                          Edit
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {sortedStudents.map((student) => (
                    <div key={student.id} className="p-4 border-2 border-border/30 rounded-xl bg-card hover:border-accent-300 hover:shadow-md transition-all group">
                      <div className="flex items-start gap-3 mb-3">
                        <button
                          onClick={() => toggleSelectStudent(student.id)}
                          className="flex items-center justify-center h-6 w-6 rounded border-2 border-border group-hover:border-primary transition-colors flex-shrink-0 mt-1"
                        >
                          {selectedStudents.has(student.id) ? (
                            <CheckSquare className="h-5 w-5 text-primary" />
                          ) : (
                            <Square className="h-5 w-5" />
                          )}
                        </button>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-semibold text-sm truncate">{student.name}</p>
                            <Badge variant="secondary" className="text-xs flex-shrink-0">{student.studentId}</Badge>
                          </div>
                          <p className="text-xs text-muted-foreground truncate">{student.email}</p>
                          {student.yearLevel && (
                            <Badge variant="outline" className="text-xs mt-2">{student.yearLevel}</Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <Badge variant={student.status === "active" ? "default" : "outline"} className="text-xs font-semibold capitalize">
                          {student.status}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditStudent(student)}
                          className="gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )
            ) : (
              <div className="text-center py-12">
                <Users className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
                <p className="text-lg text-muted-foreground font-medium">
                  {searchQuery ? "No students matching your search" : "No students found"}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Bulk Update Panel */}
        {showBulkPanel && (
          <div className="fixed inset-0 z-50 flex">
            <div 
              className="absolute inset-0 bg-black/40"
              onClick={() => setShowBulkPanel(false)}
            />
            <div className="relative ml-auto w-full max-w-lg bg-background shadow-2xl flex flex-col border-l border-border">
              <div className="bg-gradient-to-r from-primary to-accent p-6 text-white flex items-center justify-between border-b">
                <h2 className="text-2xl font-bold">Bulk Update Grade Level</h2>
                <button
                  onClick={() => setShowBulkPanel(false)}
                  className="p-1 hover:bg-white/20 rounded-lg"
                  title="Close panel"
                  aria-label="Close bulk update panel"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="flex-1 p-6 space-y-6">
                <div>
                  <p className="text-sm text-muted-foreground mb-3">
                    Selected: <span className="font-semibold text-foreground">{selectedStudents.size} student(s)</span>
                  </p>
                  <div className="max-h-48 overflow-y-auto space-y-2 p-3 bg-muted/30 rounded-lg">
                    {sortedStudents.filter(s => selectedStudents.has(s.id)).map(s => (
                      <div key={s.id} className="text-sm p-2 bg-card rounded border border-border/50">
                        <p className="font-semibold">{s.name}</p>
                        <p className="text-xs text-muted-foreground">{s.studentId}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <Label htmlFor="bulk-grade" className="text-base font-semibold mb-3 block">
                    Assign to Grade Level
                  </Label>
                  <Select value={bulkGradeLevel} onValueChange={setBulkGradeLevel}>
                    <SelectTrigger id="bulk-grade" className="border-2">
                      <SelectValue placeholder="Select a grade level" />
                    </SelectTrigger>
                    <SelectContent>
                      {yearLevels.map((yl) => (
                        <SelectItem key={yl.id} value={String(yl.id)}>{yl.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex gap-3 pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={() => setShowBulkPanel(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleBulkUpdate}
                    className="flex-1 bg-gradient-to-r from-primary to-accent text-white font-semibold"
                  >
                    Update {selectedStudents.size} Student(s)
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit Student Modal */}
        <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
          <DialogContent className="max-w-md border-0 shadow-2xl">
            <DialogHeader className="bg-gradient-to-r from-primary to-accent px-6 py-6 -mx-6 -mt-6 mb-6 rounded-t-lg">
              <DialogTitle className="text-2xl font-bold text-white">Edit Student Grade Level</DialogTitle>
            </DialogHeader>
            
            {editingStudent && (
              <div className="space-y-6 px-2">
                <div className="p-4 bg-muted/30 rounded-lg border border-border/50">
                  <p className="text-sm text-muted-foreground mb-1">Student</p>
                  <p className="font-semibold text-base">{editingStudent.name}</p>
                  <p className="text-sm text-muted-foreground mt-2">{editingStudent.studentId}</p>
                </div>

                <div>
                  <Label htmlFor="edit-grade" className="text-base font-semibold mb-3 block">
                    Grade Level
                  </Label>
                  <Select value={editGradeLevel} onValueChange={setEditGradeLevel}>
                    <SelectTrigger id="edit-grade" className="border-2">
                      <SelectValue placeholder="Select a grade level" />
                    </SelectTrigger>
                    <SelectContent>
                      {yearLevels.map((yl) => (
                        <SelectItem key={yl.id} value={String(yl.id)}>{yl.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex gap-3 pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={() => setShowEditModal(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSaveEdit}
                    className="flex-1 bg-gradient-to-r from-primary to-accent text-white font-semibold"
                  >
                    Save Changes
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {alert && <AlertMessage type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}
      </div>
    </DashboardLayout>
  );
};

export default StudentGradeLevelManagement;
