import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Edit, Trash2, User, BookOpen, LayoutGrid, List, Upload, DownloadCloud } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertMessage } from "@/components/AlertMessage";
import EmailLoadingModal from "@/components/EmailLoadingModal";
import { useConfirm } from "@/components/Confirm";
import { API_ENDPOINTS, apiPost, apiGet, apiPut, apiDelete, apiUploadFile } from "@/lib/api";
import { Pagination } from "@/components/Pagination";

type AssignedCourse = { course: string; title?: string; units?: number };

type YearLevel = {
  id: number;
  name: string;
  order: number;
};

type Section = {
  id: number;
  name: string;
  year_level_id?: number;
};

type Student = {
  id: string;
  name: string;
  email: string;
  studentId: string;
  yearLevel: string;
  section: string;
  phone?: string;
  parentContact?: {
    name: string;
    phone: string;
  };
  status: "active" | "inactive" | "graduated";
  assignedCourses: AssignedCourse[];
};

const Students = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [yearLevelFilter, setYearLevelFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sectionFilter, setSectionFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"list" | "grid">("grid");
  const [sortOption, setSortOption] = useState<string>("id_desc");

  const [students, setStudents] = useState<Student[]>([]);
  const [yearLevels, setYearLevels] = useState<YearLevel[]>([]);
  const [sections, setSections] = useState<Section[]>([]);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [form, setForm] = useState<any>({
    firstName: "",
    lastName: "",
    middleName: "",
    email: "",
    studentId: "",
    yearLevel: "",
    // section removed from add modal; keep empty by default
    section: "",
    phone: "",
    parentContact: undefined,
    status: "active",
    assignedCourses: [] as AssignedCourse[],
  });

  const [subjects, setSubjects] = useState<{ code: string; title: string; units: number }[]>([]);
  const [focusedCourseIdx, setFocusedCourseIdx] = useState<number | null>(null);

  const [alert, setAlert] = useState<{ type: "success" | "error" | "info"; message: string } | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 12;

  const [isImportResultOpen, setIsImportResultOpen] = useState(false);
  const [importResult, setImportResult] = useState<{ inserted: number; skipped: number; total_rows: number; errors: string[] } | null>(null);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailSuccess, setEmailSuccess] = useState(false);

  const showAlert = (type: "success" | "error" | "info", message: string) => {
    setAlert({ type, message });
  };

  const toTitleCase = (s: string) => {
    if (!s) return s;
    return s.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
  };

  const confirm = useConfirm();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Helper function to get section name by section_id
  const getSectionName = (sectionId: string | undefined): string => {
    if (!sectionId || sectionId === '') return '';
    // If sectionId is already a section name (not numeric), return it
    if (isNaN(Number(sectionId))) return sectionId;
    // Otherwise look it up in sections
    const section = sections.find(s => String(s.id) === String(sectionId));
    if (section) {
      return section.name;
    }
    // If not found, log for debugging
    console.debug(`[getSectionName] Section ID ${sectionId} not found in ${sections.length} sections:`, sections.map(s => ({ id: s.id, name: s.name })));
    return '';
  };

  const handleImportClick = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };

  const handleExport = async () => {
    try {
      showAlert('info', 'Preparing export...');
      const resp = await fetch(API_ENDPOINTS.STUDENTS_EXPORT, { method: 'GET', credentials: 'include' });
      if (!resp.ok) {
        // try to parse json error
        const txt = await resp.text();
        try { const parsed = txt ? JSON.parse(txt) : {}; throw new Error(parsed.message || 'Export failed'); } catch (e: any) { throw new Error(e.message || 'Export failed'); }
      }

      const blob = await resp.blob();
      const disposition = resp.headers.get('Content-Disposition') || '';
      let filename = 'students_export.csv';
      const match = disposition.match(/filename\*=UTF-8''(.+)|filename="?([^";]+)"?/);
      if (match) {
        filename = decodeURIComponent((match[1] || match[2] || '').replace(/"/g, '')) || filename;
      }

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      showAlert('success', 'Export ready — download started');
    } catch (err: any) {
      console.error('Export error', err);
      showAlert('error', err?.message || 'Failed to export students');
    }
  };

  const handleFileChange = async (e: any) => {
    const file = e?.target?.files?.[0];
    if (!file) return;

    // Show loading state
    showAlert("info", `Uploading ${file.name}...`);

    try {
      // Upload file to backend
      const result = await apiUploadFile(API_ENDPOINTS.STUDENTS_IMPORT, file);

      if (result && result.success) {
        // Store import results and show dialog
        setImportResult({
          inserted: result.inserted || 0,
          skipped: result.skipped || 0,
          total_rows: result.total_rows || 0,
          errors: result.errors || [],
        });
        setIsImportResultOpen(true);

        // Refresh student list
        await fetchStudents();

        // Show success alert
        showAlert("success", result.message || `Import completed: ${result.inserted} students added`);
      } else {
        throw new Error(result?.message || "Import failed");
      }
    } catch (err: any) {
      console.error("Import error:", err);
      showAlert("error", err.message || "Failed to import students");
    } finally {
      // Reset file input so the same file can be selected again
      if (e.currentTarget) e.currentTarget.value = "";
    }
  };

  const yearLevelToEnum = (v: string | undefined) => {
    if (!v) return undefined;
    // Try to find the year level by ID in the fetched data
    const yearLevel = yearLevels.find(yl => String(yl.id) === String(v));
    if (yearLevel) return yearLevel.name;
    // Fallback to old mapping for backwards compatibility
    const map: Record<string, string> = { '1': '1st Year', '2': '2nd Year', '3': '3rd Year', '4': '4th Year', '1st Year': '1st Year', '2nd Year': '2nd Year', '3rd Year': '3rd Year', '4th Year': '4th Year' };
    return map[String(v)] ?? undefined;
  };

  useEffect(() => {
    if (!isAuthenticated || user?.role !== "admin") {
      navigate("/auth");
    }
  }, [isAuthenticated, user, navigate]);

  // Fetch year levels and sections from database
  useEffect(() => {
    const fetchYearLevelsAndSections = async () => {
      try {
        const yearRes = await apiGet('/api/year-levels');
        
        if (yearRes && yearRes.success && yearRes.year_levels) {
          const sorted = yearRes.year_levels.sort((a: YearLevel, b: YearLevel) => a.order - b.order);
          setYearLevels(sorted);
          console.debug('[Students] Year levels fetched:', sorted.length, sorted);
          // Set default year level to first one
          if (sorted.length > 0 && !form.yearLevel) {
            setForm((f: any) => ({ ...f, yearLevel: String(sorted[0].id) }));
          }
          
          // Fetch sections for each year level
          try {
            const allSections: Section[] = [];
            console.debug('[Students] Fetching sections for', sorted.length, 'year levels...');
            for (const yl of sorted) {
              try {
                const sectionRes = await apiGet(`/api/year-levels/${yl.id}/sections`);
                if (sectionRes && (sectionRes.success || sectionRes.data || sectionRes.sections)) {
                  const sectionList = sectionRes.data || sectionRes.sections || [];
                  if (Array.isArray(sectionList)) {
                    console.debug(`[Students] Year level ${yl.name} has ${sectionList.length} sections:`, sectionList);
                    allSections.push(...sectionList);
                  }
                }
              } catch (err) {
                console.warn(`[Students] Failed to fetch sections for year level ${yl.id} (${yl.name}):`, err);
              }
            }
            console.debug('[Students] Total sections fetched:', allSections.length, allSections);
            setSections(allSections);
          } catch (err) {
            console.error('[Students] Failed to fetch sections:', err);
            // Fallback: try to fetch all sections at once
            try {
              console.debug('[Students] Trying fallback: fetching all sections...');
              const sectionRes = await apiGet(API_ENDPOINTS.SECTIONS);
              if (sectionRes && (sectionRes.success || sectionRes.data || sectionRes.sections)) {
                const sectionList = sectionRes.data || sectionRes.sections || [];
                console.debug('[Students] Fallback sections fetch succeeded:', sectionList);
                setSections(Array.isArray(sectionList) ? sectionList : []);
              }
            } catch (fallbackErr) {
              console.error('[Students] Fallback sections fetch also failed:', fallbackErr);
            }
          }
        }
      } catch (err) {
        console.error('[Students] Failed to fetch year levels:', err);
      }
    };
    
    if (isAuthenticated && user?.role === 'admin') {
      fetchYearLevelsAndSections();
    }
  }, [isAuthenticated, user]);

  // Fetch students from API (uses the USERS endpoint + ../students similar to other pages)
  const fetchStudents = async () => {
    try {
      const res = await apiGet(`${API_ENDPOINTS.USERS}/../students`);
      // Accept shapes: { success: true, data: [...] } or { students: [...] } or array directly
      const rows = res && (res.data || res.students) ? (res.data || res.students) : Array.isArray(res) ? res : [];
      if (Array.isArray(rows)) {
        const mapped: Student[] = rows.map((r: any) => {
          // Store section_id (numeric) or section_name if available
          // The section field will be looked up in getSectionName() using the sections array
          const section = r.section_name ?? r.section ?? (r.section_id ? String(r.section_id) : "");
          return {
          id: String(r.id ?? r.user_id ?? Date.now()),
          // Display as "Lastname, Firstname"
          name: (() => {
            const first = r.first_name || r.firstName || '';
            const last = r.last_name || r.lastName || '';
            return (last || first) ? (last + (first ? ', ' + first : '')) : (r.email || '');
          })(),
          email: r.email || r.user_email || '',
          studentId: r.student_id || r.studentId || '',
          yearLevel: r.year_level || '',
          section: section,
          phone: r.phone || '',
          parentContact: undefined,
          status: r.status || r.user_status || 'active',
          // prefer any assigned courses already returned by the API
          assignedCourses: (r.assigned_courses || r.assignedCourses || r.courses || []).map((c: any) => ({ course: c.course_code || c.code || c.course || String(c), title: c.course_name || c.title || undefined, units: c.credits ?? c.units ?? undefined })) as AssignedCourse[],
          };
        });
        console.debug('[Students] Students loaded:', mapped.length, 'students', mapped.slice(0, 3));
        // Ensure list shows latest by student ID (e.g. MCAF2026-0004)
        mapped.sort((a, b) => (b.studentId || '').localeCompare(a.studentId || ''));
        setStudents(mapped);

        // Populate assignedCourses based on subjects for the student's year level.
        // Collect unique year levels present in the fetched students.
        const years = Array.from(new Set(mapped.map((m) => String(m.yearLevel || '1'))));
        if (years.length > 0) {
          try {
            // Fetch subjects for each year once
            const yearFetches = years.map(async (y) => {
              try {
                const subRes = await apiGet(`${API_ENDPOINTS.SUBJECTS}?level=${encodeURIComponent(String(y))}`);
                const arr = subRes && (subRes.subjects || subRes.data) ? (subRes.subjects || subRes.data) : Array.isArray(subRes) ? subRes : [];
                const normalized = Array.isArray(arr)
                  ? arr.map((c: any) => ({ course: c.course_code || c.code || c.course || String(c), title: c.course_name || c.title || undefined, units: c.credits ?? c.units ?? undefined }))
                  : [];
                return { year: String(y), subjects: normalized };
              } catch (err) {
                return { year: String(y), subjects: [] };
              }
            });

            const yearResults = await Promise.all(yearFetches);
            const subjectsByYear: Record<string, AssignedCourse[]> = {};
            yearResults.forEach((yr) => {
              subjectsByYear[yr.year] = yr.subjects as AssignedCourse[];
            });

            // Update students: set assignedCourses to the subjects for their year
            setStudents((prev) => prev.map((s) => ({ ...s, assignedCourses: subjectsByYear[String(s.yearLevel)] || [] })));
          } catch (err) {
            console.warn('Failed to fetch subjects by year to populate assignedCourses', err);
          }
        }
      }
    } catch (err: any) {
      console.error('Failed to load students', err);
      showAlert('error', err.message || 'Failed to load students');
    }
  };

  useEffect(() => {
    if (isAuthenticated && user?.role === 'admin') {
      fetchStudents();
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    // initial fetch: load subjects (unfiltered) so suggestions are available
    // Specific year-level fetches are performed when opening Create/Edit and when year changes
    const load = async () => {
      try {
        const res = await apiGet(API_ENDPOINTS.SUBJECTS);
        if (res && res.success) {
          const mapped = (res.subjects || []).map((s: any) => ({ code: s.course_code, title: s.course_name, units: s.credits ?? 3 }));
          setSubjects(mapped);
        }
      } catch (err) {
        // silently fail — suggestions are optional
        console.error('Failed to load subjects for suggestions', err);
      }
    };
    load();
  }, []);

  // Helper: fetch subjects optionally filtered by year level.
  // Many subject records include year-level metadata, so the API supports a query param like ?year_level=1
  const fetchSubjects = async (yearLevel?: string) => {
    try {
      let url = API_ENDPOINTS.SUBJECTS;
      if (yearLevel && String(yearLevel).trim() !== '') {
        // prefer sending numeric year value (1/2/3/4)
        url = `${API_ENDPOINTS.SUBJECTS}?year_level=${encodeURIComponent(String(yearLevel))}`;
      }
      const res = await apiGet(url);
      if (res && res.success) {
        const mapped = (res.subjects || []).map((s: any) => ({ code: s.course_code, title: s.course_name, units: s.credits ?? 3 }));
        setSubjects(mapped);
      }
    } catch (err) {
      console.error('Failed to fetch subjects by year level', err);
    }
  };


  const getDefaultYearLevelId = () => (yearLevels[0] ? String(yearLevels[0].id) : "");

  const filteredStudents = students.filter((s) => {
    const q = searchQuery.trim().toLowerCase();
    const matchesQuery =
      q === "" ||
      s.name.toLowerCase().includes(q) ||
      s.email.toLowerCase().includes(q) ||
      s.studentId.toLowerCase().includes(q);
    const matchesYearLevel = yearLevelFilter === "all" || s.yearLevel === yearLevelFilter;
    const matchesStatus = statusFilter === "all" || s.status === statusFilter;
    // sectionFilter stored as `${yearLevel}-${sectionName}` (e.g. "Nursery 1-Makabansa")
    const matchesSection =
      sectionFilter === "all" || `${s.yearLevel}-${s.section}` === sectionFilter;
    return matchesQuery && matchesYearLevel && matchesStatus && matchesSection;
  });

  // available sections for the Section filter dropdown (filter out empty strings to avoid SelectItem error)
  // Build unique year-section keys for the section filter dropdown with resolved names
  const availableSections = Array.from(
    new Set(
      students
        .map((s) => {
          const sec = s.section?.toString().trim();
          if (!sec) return null;
          return `${s.yearLevel}-${sec}`;
        })
        .filter((x) => x)
    )
  ).map((key) => {
    // For each key, resolve the section name
    const parts = String(key).split('-');
    if (parts.length === 2) {
      const yearLevel = parts[0];
      const sectionId = parts[1];
      const sectionName = getSectionName(sectionId);
      return {
        key: key,
        display: `${yearLevel} - ${sectionName}`,
      };
    }
    return { key, display: key };
  }).sort((a, b) => a.display.localeCompare(b.display));

  const getCourseSuggestions = (query: string) => {
    const q = (query || "").replace(/\s+/g, "").toUpperCase();
    if (!q) return [] as { code: string; title: string; units: number }[];
    return subjects.filter((c) => c.code.includes(q) || c.title.toUpperCase().includes(query.trim().toUpperCase())).slice(0, 8);
  };

  const setCourseFromSuggestion = (idx: number, courseObj: { code: string; title: string; units: number }) => {
    setForm((f: any) => ({
      ...f,
      assignedCourses: f.assignedCourses.map((ac: AssignedCourse, i: number) => (i === idx ? { ...ac, course: courseObj.code, title: courseObj.title, units: courseObj.units } : ac)),
    }));
  };

  const addCourseRow = () => {
    setForm((f: any) => ({ ...f, assignedCourses: [...(f.assignedCourses || []), { course: "", title: undefined, units: undefined }] }));
  };

  const removeCourseRow = (idx: number) => {
    setForm((f: any) => ({ ...f, assignedCourses: f.assignedCourses.filter((_: any, i: number) => i !== idx) }));
  };

  const updateCourseCode = (idx: number, value: string) => {
    setForm((f: any) => ({ ...f, assignedCourses: f.assignedCourses.map((ac: AssignedCourse, i: number) => (i === idx ? { ...ac, course: value, title: undefined, units: undefined } : ac)) }));
  };

  // apply sorting on a copy
  const sortedStudents = (() => {
    const list = [...filteredStudents];
    switch (sortOption) {
      case "name_asc":
        return list.sort((a, b) => a.name.localeCompare(b.name));
      case "name_desc":
        return list.sort((a, b) => b.name.localeCompare(a.name));
      case "id_asc":
        return list.sort((a, b) => a.studentId.localeCompare(b.studentId));
      case "id_desc":
        return list.sort((a, b) => b.studentId.localeCompare(a.studentId));
      case "year_asc":
        return list.sort((a, b) => parseInt(a.yearLevel) - parseInt(b.yearLevel));
      case "year_desc":
        return list.sort((a, b) => parseInt(b.yearLevel) - parseInt(a.yearLevel));
      default:
        return list;
    }
  })();

  // Pagination: slice the sorted list
  const totalItems = sortedStudents.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  // clamp current page
  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

  // Reset page when filters/search change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, yearLevelFilter, statusFilter, sectionFilter, sortOption]);

  const pagedStudents = sortedStudents.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleOpenCreate = () => {
    const defaultYearLevelId = getDefaultYearLevelId();
    setForm({
      firstName: "",
      lastName: "",
      middleName: "",
      email: "",
      studentId: "",
      yearLevel: defaultYearLevelId,
      // section removed from add modal; keep empty by default
      section: "",
      phone: "",
      parentContact: undefined,
      status: "active",
      assignedCourses: [],
    });
    if (defaultYearLevelId) {
      // fetch suggestions for default year level
      fetchSubjects(defaultYearLevelId);
    }
    setIsCreateOpen(true);
  };

  const handleCreate = async () => {
    // First/Last name and email required; studentId optional (backend will generate if empty)
    if (!form.firstName?.trim() || !form.lastName?.trim() || !form.email?.trim()) {
      showAlert("error", "First name, last name and email are required");
      return;
    }
    // We'll create a user first, then create the student profile linked to that user.
    let createdUserId: number | string | null = null;
    setEmailSuccess(false);
    setShowEmailModal(true);
    try {
      const firstName = toTitleCase(form.firstName.trim());
      const lastName = toTitleCase(form.lastName.trim());
      const middleName = toTitleCase((form.middleName || '').trim());

      // 1) create user
      const userResp = await apiPost(API_ENDPOINTS.USERS, {
        firstName,
        lastName,
        middleName,
        email: form.email.trim(),
        role: 'student',
        phone: form.phone?.trim() || '',
        password: 'demo123'
      });

      if (!userResp || !userResp.success || !userResp.user) {
        const msg = (userResp && userResp.message) || 'Failed to create user';
        showAlert('error', msg);
        setShowEmailModal(false);
        return;
      }

      createdUserId = userResp.user.id;
      const defaultPassword = userResp.default_password || 'demo123';

      // 2) create student profile
      const studentIdInput = form.studentId?.trim();
      const yearLevelName = yearLevelToEnum(form.yearLevel) || form.yearLevel || 'Nursery 1';
      const payload: any = {
        user_id: createdUserId,
        year_level: yearLevelName,
        status: form.status,
        first_name: firstName,
        // include middle name if provided
        ...(middleName ? { middle_name: middleName } : {}),
        last_name: lastName,
        email: form.email.trim(),
        phone: form.phone?.trim() || null,
      };

      if (studentIdInput) {
        payload.student_id = studentIdInput;
      }

      const res = await apiPost(API_ENDPOINTS.STUDENTS, payload);
      if (!res || !res.success) {
        // cleanup created user to avoid dangling account
        try {
          if (createdUserId) await apiDelete(API_ENDPOINTS.USER_BY_ID(String(createdUserId)));
        } catch (cleanupErr) {
          console.warn('Failed to cleanup created user after student profile failure', cleanupErr);
        }
        const msg = (res && res.message) || 'Failed to create student profile';
        showAlert('error', msg);
        setShowEmailModal(false);
        return;
      }

      // 3) Send welcome email
      const emailResponse = await fetch('/api/students/send-welcome-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: form.email.trim(),
          firstName,
          lastName,
          password: defaultPassword,
          studentId: res?.student?.student_id || studentIdInput || "",
          yearLevel: yearLevelName
        }),
        credentials: 'include'
      });

      // read text first in case server returns HTML (login page, error, etc.)
      const emailText = await emailResponse.text();
      let emailData: any = null;
      try {
        emailData = emailText ? JSON.parse(emailText) : { success: emailResponse.ok };
      } catch (err) {
        console.error('Non-JSON response from email endpoint:', emailResponse.status, emailText);
        emailData = { success: emailResponse.ok, message: emailText };
      }

      if (emailData && emailData.success) {
        setEmailSuccess(true);
      } else {
        setEmailSuccess(false);
      }

      // success: use returned student if present
      if (res && res.student) {
        const created = res.student;
        const displayName = `${lastName}${firstName ? ', ' + firstName : ''}`;
        const newStudent: Student = {
          id: created.id?.toString() || String(createdUserId),
          name: displayName,
          email: created.email ?? form.email,
          studentId: created.student_id ?? studentIdInput ?? "",
          yearLevel: created.year_level ?? yearLevelName,
          section: created.section_id ? String(created.section_id) : '',
          phone: created.phone ?? form.phone,
          parentContact: form.parentContact,
          status: created.status ?? form.status,
          assignedCourses: created.assigned_courses ?? (form.assignedCourses || []),
        };
        setStudents((s) => [newStudent, ...s]);
        
        // Auto close modal and cleanup after 3 seconds
        setTimeout(() => {
          const resetYearLevelId = getDefaultYearLevelId();
          setShowEmailModal(false);
          setIsCreateOpen(false);
          setForm({ firstName: "", lastName: "", middleName: "", email: "", studentId: "", yearLevel: resetYearLevelId, section: "", phone: "", parentContact: undefined, status: "active", assignedCourses: [] });
        }, 3000);
        
        showAlert('success', `Student ${newStudent.name} created. Welcome email ${emailData.success ? 'sent' : 'send attempted'}!`);
        return;
      }

      // fallback: local add
      const displayName = `${lastName}${firstName ? ', ' + firstName : ''}`;
      const newStudent: Student = { id: String(createdUserId ?? Date.now()), name: displayName, email: form.email, studentId: studentIdInput || "", yearLevel: yearLevelName, section: '', phone: form.phone, parentContact: form.parentContact, status: form.status, assignedCourses: form.assignedCourses };
      setStudents((s) => [newStudent, ...s]);
      
      setTimeout(() => {
        const resetYearLevelId = getDefaultYearLevelId();
        setShowEmailModal(false);
        setIsCreateOpen(false);
        setForm({ firstName: "", lastName: "", middleName: "", email: "", studentId: "", yearLevel: resetYearLevelId, section: "", phone: "", parentContact: undefined, status: "active", assignedCourses: [] });
      }, 3000);
      
      showAlert('success', `Student ${displayName} created. Welcome email ${emailData.success ? 'sent' : 'send attempted'}!`);
    } catch (err: any) {
      console.error('Error creating student:', err);
      // cleanup if user was created
      if (createdUserId) {
        try {
          await apiDelete(API_ENDPOINTS.USER_BY_ID(String(createdUserId)));
        } catch (cleanupErr) {
          console.warn('Cleanup failed', cleanupErr);
        }
      }
      setShowEmailModal(false);
      showAlert('error', err.message || 'Failed to create student');
    }
  };

  const handleOpenEdit = (s: Student) => {
    setSelectedStudentId(s.id);
    
    // Find the year level ID that matches the student's year level name
    const matchingYearLevel = yearLevels.find(yl => yl.name === s.yearLevel);
    const yearLevelId = matchingYearLevel ? String(matchingYearLevel.id) : "";
    
    setForm({
      name: s.name,
      email: s.email,
      studentId: s.studentId,
      yearLevel: yearLevelId,
      section: s.section,
      phone: s.phone,
      parentContact: s.parentContact,
      status: s.status,
      assignedCourses: s.assignedCourses,
    });
    setIsEditOpen(true);
    // fetch subjects that match this student's year level so suggestions match
    if (yearLevelId) fetchSubjects(yearLevelId);
  };

  const handleEdit = async () => {
    if (!selectedStudentId) return;

    // Build payload expected by StudentController::api_update_student
  const payload: any = {};
  if (form.studentId !== undefined) payload.studentId = form.studentId;
  if (form.yearLevel !== undefined) payload.yearLevel = yearLevelToEnum(form.yearLevel) ?? form.yearLevel;
    if (form.section !== undefined && form.section !== '') {
      // try to send numeric id for section when possible
      const n = Number(form.section);
      payload.sectionId = Number.isFinite(n) && n > 0 ? n : form.section;
    }
    if (form.status !== undefined) payload.status = form.status;

    try {
      const res = await apiPut(`/api/students/${selectedStudentId}`, payload);
      if (res && res.success) {
        const updated = res.data || res.student || null;
        if (updated) {
          // map server response to local Student shape
          const mapped: Student = {
            id: String(updated.id ?? updated.user_id ?? selectedStudentId),
            name: (() => {
              const first = updated.first_name || updated.firstName || '';
              const last = updated.last_name || updated.lastName || '';
              return (last || first) ? (last + (first ? ', ' + first : '')) : (form.name || '');
            })(),
            email: updated.email ?? form.email ?? '',
            studentId: updated.student_id ?? form.studentId ?? '',
            yearLevel: updated.year_level || yearLevelToEnum(form.yearLevel) || form.yearLevel || '',
            section: updated.section_id ? String(updated.section_id) : (updated.section_name || form.section || ''),
            phone: updated.phone ?? form.phone ?? '',
            parentContact: form.parentContact,
            status: updated.status ?? form.status ?? 'active',
            assignedCourses: updated.assigned_courses ?? form.assignedCourses ?? [],
          };
          setStudents((prev) => prev.map((s) => (s.id === selectedStudentId ? mapped : s)));
        } else {
          // fallback: update local copy with form values
          setStudents((prev) => prev.map((s) => (s.id === selectedStudentId ? { ...s, ...form } : s)));
        }

        setIsEditOpen(false);
        setSelectedStudentId(null);
        showAlert('success', res.message || 'Student updated');
        return;
      }

      throw new Error(res && res.message ? res.message : 'Update failed');
    } catch (err: any) {
      console.error('Failed to update student', err);
      showAlert('error', err?.message || String(err) || 'Failed to update student');
    }
  };

  const handleDelete = async (id: string) => {
    const s = students.find((x) => x.id === id);
    if (!s) return;
    const ok = await confirm({
      title: 'Inactivate student',
      description: `Inactivate student ${s.name}? This will set the student to INACTIVE status.`,
      emphasis: s.name,
      confirmText: 'Inactivate',
      cancelText: 'Cancel',
      variant: 'destructive'
    });
    if (!ok) return;
    setStudents((prev) => prev.map((x) => (x.id === id ? { ...x, status: "inactive" } : x)));
    showAlert("info", `Student ${s.name} has been set to inactive`);
  };

  if (!isAuthenticated) return null;

  return (
    <DashboardLayout>
      {/* Email Loading Modal */}
      <EmailLoadingModal
        isOpen={showEmailModal}
        isSuccess={emailSuccess}
        emailType="confirmation"
        customMessage="Sending welcome email..."
        customSuccessMessage="Welcome email sent successfully!"
        onComplete={() => setShowEmailModal(false)}
        autoCloseDuration={3000}
      />

      <div className="p-8">
          <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Manage Students</h1>
            <p className="text-muted-foreground">View and manage student accounts and enrollments</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="ml-auto flex items-center">
              {/* hidden file input for import placeholder (accessible via aria-label/title) */}
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.xlsx"
                className="hidden"
                onChange={handleFileChange}
                aria-label="Import students file"
                title="Select a CSV or Excel file to import students"
              />
              <Button variant="outline" onClick={handleImportClick} className="mr-3 border-2 rounded-xl px-4 py-2.5">
                <Upload className="h-4 w-4 mr-2" />
                Import Students
              </Button>

              <Button variant="outline" onClick={handleExport} className="mr-3 border-2 rounded-xl px-4 py-2.5">
                <DownloadCloud className="h-4 w-4 mr-2" />
                Export Students
              </Button>

              <Button 
                variant="outline" 
                onClick={() => navigate("/admin/users/students/grades")} 
                className="mr-3 border-2 rounded-xl px-4 py-2.5 hover:bg-primary/5 hover:border-primary/50"
              >
                <BookOpen className="h-4 w-4 mr-2" />
                Manage Grades
              </Button>

              <Button onClick={handleOpenCreate} className="bg-gradient-to-r from-primary to-accent text-white shadow-lg hover:shadow-xl">
                <Plus className="h-4 w-4 mr-2" />
                Add Student
              </Button>
            </div>
          </div>
        </div>

        <Card className="shadow-lg border-0">
          <CardHeader className="bg-gradient-to-r from-muted/50 to-muted border-b pb-6">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl font-bold">All Students ({filteredStudents.length})</CardTitle>
                <CardDescription>Enrolled students in the institution</CardDescription>
              </div>
            </div>
            
            <div className="flex items-center gap-3 mt-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="Search students by name or ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 py-2.5 text-base border-2 focus:border-accent-500 rounded-xl bg-background shadow-sm"
                />
              </div>
            
                <div className="flex items-center gap-3">
                  <div className="w-36">
                    <Select value={yearLevelFilter} onValueChange={setYearLevelFilter}>
                      <SelectTrigger className="border-2 rounded-xl px-3 py-2 bg-background font-medium shadow-sm">
                        {yearLevelFilter === "all" ? "All Grades" : yearLevelFilter}
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Grades</SelectItem>
                        {yearLevels.map((yl) => (
                          <SelectItem key={yl.id} value={yl.name}>{yl.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="w-40">
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="border-2 rounded-xl px-3 py-2 bg-background font-medium shadow-sm">
                        {statusFilter === "all" ? "All Status" : statusFilter}
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                        <SelectItem value="graduated">Graduated</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="w-40">
                    <Select value={sectionFilter} onValueChange={setSectionFilter}>
                        <SelectTrigger className="border-2 rounded-xl px-3 py-2 bg-background font-medium shadow-sm">
                          {sectionFilter === "all" ? "All Sections" : (() => {
                            const selected = availableSections.find(s => s.key === sectionFilter);
                            return selected ? selected.display : String(sectionFilter);
                          })()}
                        </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Sections</SelectItem>
                        {availableSections.map((sec) => (
                          <SelectItem key={sec.key} value={sec.key}>{sec.display}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="w-44">
                    <Select value={sortOption} onValueChange={setSortOption}>
                      <SelectTrigger className="border-2 rounded-xl px-4 py-2.5 bg-background font-medium shadow-sm">
                          {sortOption === "id_asc" && "Student ID ↑"}
                          {sortOption === "id_desc" && "Student ID ↓"}
                          {sortOption === "name_asc" && "Student Name ↑"}
                          {sortOption === "name_desc" && "Student Name ↓"}
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="id_asc">Student ID ↑</SelectItem>
                        <SelectItem value="id_desc">Student ID ↓</SelectItem>
                        <SelectItem value="name_asc">Student Name ↑</SelectItem>
                        <SelectItem value="name_desc">Student Name ↓</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setViewMode((v) => (v === "list" ? "grid" : "list"))}
                    className="px-4 py-2.5 rounded-xl font-medium border-2 gap-2 shadow-sm hover:bg-accent-50 hover:border-accent-300 transition-all"
                    title="Toggle view"
                    aria-pressed={viewMode === "grid"}
                  >
                    {viewMode === "grid" ? <LayoutGrid className="h-5 w-5" /> : <List className="h-5 w-5" />}
                    <span>{viewMode === "grid" ? "Grid" : "List"}</span>
                  </Button>
                </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
              {viewMode === "grid" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {pagedStudents.map((student) => (
                  <div
                    key={student.id}
                    className={`rounded-2xl border-2 transition-all duration-300 flex flex-col overflow-hidden ${
                      student.status === "inactive"
                        ? "bg-muted/50 border-muted opacity-70"
                        : "bg-gradient-to-br from-card to-muted/30 border-accent-200 hover:border-accent-400 hover:shadow-lg"
                    }`}
                  >
                    {/* Card Header */}
                    <div className="p-5 flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <div className={`w-14 h-14 rounded-xl flex items-center justify-center shadow-md flex-shrink-0 ${
                          student.status === "active" ? "bg-gradient-to-br from-primary to-accent" : "bg-slate-300"
                        }`}>
                          <User className="h-7 w-7 text-white" />
                        </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-bold text-lg">{student.name}</p>
                              <p className="text-sm text-muted-foreground truncate">{student.email}</p>
                              <p className="text-xs text-muted-foreground mt-1">{student.yearLevel} - {getSectionName(student.section) || student.section || '—'}</p>
                            </div>
                      </div>
                      <Badge
                        variant={student.status === "active" ? "default" : student.status === "graduated" ? "secondary" : "outline"}
                        className={`font-semibold ml-2 ${
                          student.status === "active" ? "bg-gradient-to-r from-primary to-accent text-white" : ""
                        }`}
                      >
                        {student.status}
                      </Badge>
                    </div>

                    {/* Card Metadata */}
                    <div className={`px-5 py-3 ${
                      student.status === "active"
                        ? "bg-gradient-to-r from-primary/5 to-accent/5 border-t border-primary/10"
                        : "bg-muted/30 border-t border-muted"
                    }`}>
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-xs font-semibold text-muted-foreground mb-1">Student ID</p>
                                  <p className="text-sm font-medium">{student.studentId}</p>
                                </div>
                                <div className="text-right">
                                  <div className="flex items-center gap-1 text-sm font-medium mb-1">
                                    <BookOpen className="h-4 w-4 text-primary" />
                                    <span>{student.assignedCourses.length} courses</span>
                                  </div>
                                  {student.assignedCourses.length > 0 && (
                                    <p className="text-xs text-muted-foreground">
                                      {student.assignedCourses.slice(0, 2).map((c) => c.course).join(", ")}
                                      {student.assignedCourses.length > 2 && "..."}
                                    </p>
                                  )}
                                </div>
                              </div>
                    </div>

                    {/* Card Actions */}
                    <div className={`px-5 py-4 border-t ${
                      student.status === "inactive" ? "border-muted bg-muted/30" : "border-accent-100 bg-card/50"
                    }`}>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenEdit(student)}
                          className="flex-1 gap-2 font-medium hover:bg-accent-50 hover:border-accent-300 transition-all"
                        >
                          <Edit className="h-4 w-4" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(student.id)}
                          disabled={student.status === "inactive"}
                          className={`text-destructive hover:text-destructive hover:bg-destructive/10 font-medium transition-all px-3 ${
                            student.status === "inactive" ? "opacity-50 cursor-not-allowed" : ""
                          }`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {pagedStudents.map((student) => (
                  <div
                    key={student.id}
                    className={`rounded-2xl border-2 transition-all duration-300 flex items-center justify-between p-4 ${
                      student.status === "inactive"
                        ? "bg-muted/50 border-muted opacity-80"
                        : "bg-card border-accent-100 hover:border-accent-300 hover:shadow-md"
                    }`}
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-md flex-shrink-0 ${
                        student.status === "active" ? "bg-gradient-to-br from-primary to-accent" : "bg-slate-200"
                      }`}>
                        <User className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-lg">{student.name}</p>
                          <Badge variant="outline" className="text-xs flex-shrink-0">{student.studentId}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{student.email}</p>
                        <p className="text-xs text-muted-foreground">{student.yearLevel} - {getSectionName(student.section) || student.section || '—'}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 flex-shrink-0">
                      <div className="text-right">
                            <div className="flex items-center gap-1 text-sm font-medium">
                              <BookOpen className="h-4 w-4" />
                              <span>{student.assignedCourses.length} courses</span>
                            </div>
                            {student.assignedCourses.length > 0 && (
                              <p className="text-xs text-muted-foreground mt-1">
                                {student.assignedCourses.slice(0, 3).map((c) => c.course).join(", ")}
                                {student.assignedCourses.length > 3 && "..."}
                              </p>
                            )}
                      </div>

                      <Badge variant={student.status === "active" ? "default" : student.status === "graduated" ? "secondary" : "outline"}>
                        {student.status}
                      </Badge>

                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" onClick={() => handleOpenEdit(student)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleDelete(student.id)}
                          disabled={student.status === "inactive"}
                          className={student.status === "inactive" ? "opacity-50 cursor-not-allowed" : ""}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}

                {totalItems === 0 && (
                  <div className="text-center py-12 text-muted-foreground">
                    <User className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                    <p className="text-lg font-medium">No students found matching your filters</p>
                  </div>
                )}
              </div>
            )}
            {/* Pagination controls */}
            <div className="mt-6 px-2">
              <Pagination
                currentPage={currentPage}
                totalItems={totalItems}
                itemsPerPage={itemsPerPage}
                onPageChange={(p) => setCurrentPage(p)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Create Dialog */}
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto border-0 shadow-2xl">
            <DialogHeader className="bg-gradient-to-r from-primary to-accent px-6 py-6 -mx-6 -mt-6 mb-6 rounded-t-lg">
              <DialogTitle className="text-2xl font-bold text-white">Add New Student</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    value={form.firstName}
                    onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))}
                    placeholder="Given name"
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    value={form.lastName}
                    onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))}
                    placeholder="Family name"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-2">
                <div>
                  <Label htmlFor="studentId">Student ID (optional)</Label>
                  <Input
                    id="studentId"
                    value={form.studentId}
                    onChange={(e) => setForm((f) => ({ ...f, studentId: e.target.value }))}
                    placeholder="e.g., MCAF2025-0001 — leave empty to auto-generate"
                  />
                </div>
                <div>
                  <Label htmlFor="middleName">Middle Name (optional)</Label>
                  <Input
                    id="middleName"
                    value={form.middleName}
                    onChange={(e) => setForm((f) => ({ ...f, middleName: e.target.value }))}
                    placeholder="Optional middle name"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                    placeholder="student@edu.com"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={form.phone}
                    onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                    placeholder="+1234567890"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="yearLevel">Grade Level</Label>
                  <Select value={form.yearLevel || ""} onValueChange={(v) => {
                      setForm((f) => ({ ...f, yearLevel: v as any }));
                      // update subject suggestions to match the selected year
                      fetchSubjects(String(v));
                    }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a grade level" />
                    </SelectTrigger>
                    <SelectContent>
                      {yearLevels.map((yl) => (
                        <SelectItem key={yl.id} value={String(yl.id)}>{yl.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select value={form.status || "active"} onValueChange={(v) => setForm((f) => ({ ...f, status: v as any }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="graduated">Graduated</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label className="text-sm font-semibold">Parent/Guardian Contact (Optional)</Label>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  <div>
                    <Label htmlFor="parentName" className="text-xs">Name</Label>
                    <Input
                      id="parentName"
                      value={form.parentContact?.name || ""}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          parentContact: { name: e.target.value, phone: f.parentContact?.phone || "" },
                        }))
                      }
                      placeholder="Parent name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="parentPhone" className="text-xs">Phone</Label>
                    <Input
                      id="parentPhone"
                      value={form.parentContact?.phone || ""}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          parentContact: { name: f.parentContact?.name || "", phone: e.target.value },
                        }))
                      }
                      placeholder="Parent phone"
                    />
                  </div>
                </div>
              </div>
              {/* Assigned courses removed from Add modal - assignment handled on dedicated page */}
              <Button className="w-full bg-gradient-to-r from-primary to-accent text-white py-3 font-semibold rounded-lg shadow-lg" onClick={handleCreate}>
                Add Student
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Dialog */}
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto border-0 shadow-2xl">
            <DialogHeader className="bg-gradient-to-r from-primary to-accent px-6 py-6 -mx-6 -mt-6 mb-6 rounded-t-lg">
              <DialogTitle className="text-2xl font-bold text-white">Edit Student</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-name">Full Name *</Label>
                  <Input
                    id="edit-name"
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-studentId">Student ID *</Label>
                  <Input
                    id="edit-studentId"
                    value={form.studentId}
                    onChange={(e) => setForm((f) => ({ ...f, studentId: e.target.value }))}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-email">Email *</Label>
                  <Input
                    id="edit-email"
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-phone">Phone</Label>
                  <Input
                    id="edit-phone"
                    value={form.phone}
                    onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="edit-yearLevel">Grade Level</Label>
                  <Select value={form.yearLevel || ""} onValueChange={(v) => {
                      setForm((f) => ({ ...f, yearLevel: v as any }));
                      fetchSubjects(String(v));
                    }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a grade level" />
                    </SelectTrigger>
                    <SelectContent>
                      {yearLevels.map((yl) => (
                        <SelectItem key={yl.id} value={String(yl.id)}>{yl.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="edit-status">Status</Label>
                  <Select value={form.status || "active"} onValueChange={(v) => setForm((f) => ({ ...f, status: v as any }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="graduated">Graduated</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label className="text-sm font-semibold">Parent/Guardian Contact (Optional)</Label>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  <div>
                    <Label htmlFor="edit-parentName" className="text-xs">Name</Label>
                    <Input
                      id="edit-parentName"
                      value={form.parentContact?.name || ""}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          parentContact: { name: e.target.value, phone: f.parentContact?.phone || "" },
                        }))
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-parentPhone" className="text-xs">Phone</Label>
                    <Input
                      id="edit-parentPhone"
                      value={form.parentContact?.phone || ""}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          parentContact: { name: f.parentContact?.name || "", phone: e.target.value },
                        }))
                      }
                    />
                  </div>
                </div>
              </div>
              {/* Manage Subjects removed - student course assignment handled elsewhere or deprecated */}
              <div className="flex gap-2 pt-4 border-t">
                <Button className="flex-1 bg-gradient-to-r from-primary to-accent text-white py-3 font-semibold rounded-lg shadow-lg" onClick={handleEdit}>
                  Save Changes
                </Button>
                <Button variant="outline" className="flex-1" onClick={() => setIsEditOpen(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Import Results Dialog */}
        <Dialog open={isImportResultOpen} onOpenChange={setIsImportResultOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto border-0 shadow-2xl">
            <DialogHeader className="bg-gradient-to-r from-primary to-accent px-6 py-6 -mx-6 -mt-6 mb-6 rounded-t-lg">
              <DialogTitle className="text-2xl font-bold text-white">Import Results</DialogTitle>
            </DialogHeader>
            {importResult && (
              <div className="space-y-4">
                {/* Summary Cards */}
                <div className="grid grid-cols-3 gap-4">
                  <Card className="border-2 border-green-200 bg-green-50">
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <p className="text-3xl font-bold text-green-700">{importResult.inserted}</p>
                        <p className="text-sm text-green-600 mt-1">Students Imported</p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="border-2 border-yellow-200 bg-yellow-50">
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <p className="text-3xl font-bold text-yellow-700">{importResult.skipped}</p>
                        <p className="text-sm text-yellow-600 mt-1">Skipped</p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="border-2 border-blue-200 bg-blue-50">
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <p className="text-3xl font-bold text-blue-700">{importResult.total_rows}</p>
                        <p className="text-sm text-blue-600 mt-1">Total Rows</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Error Details */}
                {importResult.errors && importResult.errors.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-lg mb-3 text-destructive">Errors & Warnings ({importResult.errors.length})</h3>
                    <div className="max-h-96 overflow-y-auto border-2 border-destructive/20 rounded-lg bg-destructive/5 p-4">
                      <ul className="space-y-2">
                        {importResult.errors.map((error, idx) => (
                          <li key={idx} className="text-sm text-destructive flex items-start gap-2">
                            <span className="font-mono text-xs bg-destructive/10 px-2 py-0.5 rounded flex-shrink-0">
                              {idx + 1}
                            </span>
                            <span>{error}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                {/* Success message if no errors */}
                {(!importResult.errors || importResult.errors.length === 0) && importResult.inserted > 0 && (
                  <div className="text-center py-4">
                    <p className="text-lg font-semibold text-green-700">✓ All students imported successfully!</p>
                    <p className="text-sm text-muted-foreground mt-2">Default password for all imported students: <code className="bg-muted px-2 py-1 rounded">demo123</code></p>
                  </div>
                )}

                <div className="flex gap-2 pt-4 border-t">
                  <Button
                    className="flex-1 bg-gradient-to-r from-primary to-accent text-white py-3 font-semibold rounded-lg shadow-lg"
                    onClick={() => setIsImportResultOpen(false)}
                  >
                    Close
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

export default Students;
