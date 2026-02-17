import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { API_ENDPOINTS } from '@/lib/api';
import { FileText, Plus, Edit, Trash2, Power, PowerOff, ArrowLeft, ChevronDown, ChevronUp, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface DocumentRequirement {
  id: number;
  grade_level: string;
  enrollment_type: 'New Student' | 'Returning Student' | 'Transferee' | null;
  document_name: string;
  is_required: boolean;
  display_order: number;
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const GRADE_LEVELS = [
  'Nursery 1',
  'Nursery 2',
  'Kinder',
  'Grade 1',
  'Grade 2',
  'Grade 3',
  'Grade 4',
  'Grade 5',
  'Grade 6'
];

const ENROLLMENT_TYPES = ['New Student', 'Returning Student', 'Transferee'];

interface DocumentRequirementsProps {
  embedded?: boolean;
}

export default function DocumentRequirements({ embedded = false }: DocumentRequirementsProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [requirements, setRequirements] = useState<DocumentRequirement[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isEditingGroup, setIsEditingGroup] = useState(false);
  const [filterGrade, setFilterGrade] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  
  const [formData, setFormData] = useState({
    grade_level: '',
    enrollment_types: [] as string[], // Changed to array for multiple selection
    document_name: '',
    is_required: true,
    display_order: 0,
    description: '',
    is_active: true
  });

  useEffect(() => {
    fetchRequirements();
  }, []);

  const fetchRequirements = async () => {
    try {
      setLoading(true);
      const response = await fetch(API_ENDPOINTS.ADMIN_DOCUMENT_REQUIREMENTS, {
        credentials: 'include'
      });

      if (!response.ok) throw new Error('Failed to fetch requirements');

      const data = await response.json();
      if (data.success) {
        setRequirements(data.data);
      }
    } catch (error) {
      console.error('Error fetching requirements:', error);
      toast({
        title: 'Error',
        description: 'Failed to load document requirements',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (requirement?: DocumentRequirement | { grade_level: string; document_name: string; types: (string | null)[]; allReqs: DocumentRequirement[] }) => {
    if (requirement && 'id' in requirement) {
      // Editing single requirement
      setEditingId(requirement.id);
      setIsEditingGroup(false);
      setFormData({
        grade_level: requirement.grade_level,
        enrollment_types: requirement.enrollment_type ? [requirement.enrollment_type] : [],
        document_name: requirement.document_name,
        is_required: Boolean(requirement.is_required),
        display_order: requirement.display_order,
        description: requirement.description || '',
        is_active: requirement.is_active
      });
    } else if (requirement && 'types' in requirement) {
      // Editing grouped document
      setEditingId(null);
      setIsEditingGroup(true);
      const firstReq = requirement.allReqs[0];
      // Only include active enrollment types in the checkbox selection
      const activeTypes = requirement.allReqs
        .filter(r => r.is_active && r.enrollment_type)
        .map(r => r.enrollment_type as string);
      
      setFormData({
        grade_level: requirement.grade_level,
        enrollment_types: activeTypes,
        document_name: requirement.document_name,
        is_required: Boolean(firstReq.is_required),
        display_order: firstReq.display_order,
        description: firstReq.description || '',
        is_active: firstReq.is_active
      });
    } else {
      setEditingId(null);
      setIsEditingGroup(false);
      setFormData({
        grade_level: '',
        enrollment_types: [],
        document_name: '',
        is_required: true,
        display_order: 0,
        description: '',
        is_active: true
      });
    }
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.grade_level || !formData.document_name) {
      toast({
        title: 'Validation Error',
        description: 'Grade level and document name are required',
        variant: 'destructive'
      });
      return;
    }

    try {
      if (isEditingGroup) {
        // Editing grouped document - activate/deactivate enrollment type variants
        const existingReqs = requirements.filter(
          r => r.grade_level === formData.grade_level && r.document_name === formData.document_name
        );

        // If no types selected, it means "All Types" - activate the null type record
        if (formData.enrollment_types.length === 0) {
          // Deactivate all specific type records
          for (const req of existingReqs) {
            if (req.enrollment_type !== null && req.is_active) {
              await fetch(`${API_ENDPOINTS.ADMIN_DOCUMENT_REQUIREMENTS}/${req.id}/toggle`, {
                method: 'PATCH',
                credentials: 'include'
              });
            }
          }
          
          // Activate or create/update the "All Types" (null) record
          const allTypesReq = existingReqs.find(r => r.enrollment_type === null);
          if (allTypesReq) {
            // Update the All Types record with new properties
            const updatePayload = {
              grade_level: formData.grade_level,
              enrollment_type: null,
              document_name: formData.document_name,
              is_required: formData.is_required,
              display_order: formData.display_order,
              description: formData.description,
              is_active: true
            };

            const updateResponse = await fetch(`${API_ENDPOINTS.ADMIN_DOCUMENT_REQUIREMENTS}/${allTypesReq.id}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              credentials: 'include',
              body: JSON.stringify(updatePayload)
            });

            if (!updateResponse.ok) {
              console.error(`Failed to update All Types requirement ${allTypesReq.id}:`, await updateResponse.text());
            }

            // Activate if it was inactive
            if (!allTypesReq.is_active) {
              await fetch(`${API_ENDPOINTS.ADMIN_DOCUMENT_REQUIREMENTS}/${allTypesReq.id}/toggle`, {
                method: 'PATCH',
                credentials: 'include'
              });
            }
          } else {
            // Create new "All Types" record
            const payload = {
              grade_level: formData.grade_level,
              enrollment_type: null,
              document_name: formData.document_name,
              is_required: formData.is_required,
              display_order: formData.display_order,
              description: formData.description,
              is_active: true
            };

            await fetch(API_ENDPOINTS.ADMIN_DOCUMENT_REQUIREMENTS, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              credentials: 'include',
              body: JSON.stringify(payload)
            });
          }
        } else {
          // Specific types are selected
          // Deactivate the "All Types" (null) record if it exists
          const allTypesReq = existingReqs.find(r => r.enrollment_type === null);
          if (allTypesReq && allTypesReq.is_active) {
            await fetch(`${API_ENDPOINTS.ADMIN_DOCUMENT_REQUIREMENTS}/${allTypesReq.id}/toggle`, {
              method: 'PATCH',
              credentials: 'include'
            });
          }

          // Handle specific enrollment types
          for (const req of existingReqs) {
            if (req.enrollment_type !== null) {
              const shouldBeActive = formData.enrollment_types.includes(req.enrollment_type);
              
              // Toggle activation status if needed
              if (req.is_active !== shouldBeActive) {
                await fetch(`${API_ENDPOINTS.ADMIN_DOCUMENT_REQUIREMENTS}/${req.id}/toggle`, {
                  method: 'PATCH',
                  credentials: 'include'
                });
              }
              
              // Update properties for active types
              if (shouldBeActive) {
                const updatePayload = {
                  grade_level: formData.grade_level,
                  enrollment_type: req.enrollment_type,
                  document_name: formData.document_name,
                  is_required: formData.is_required,
                  display_order: formData.display_order,
                  description: formData.description,
                  is_active: true
                };

                const updateResponse = await fetch(`${API_ENDPOINTS.ADMIN_DOCUMENT_REQUIREMENTS}/${req.id}`, {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json' },
                  credentials: 'include',
                  body: JSON.stringify(updatePayload)
                });

                if (!updateResponse.ok) {
                  console.error(`Failed to update requirement ${req.id}:`, await updateResponse.text());
                }
              }
            }
          }

          // Create new records for newly selected types that don't exist
          for (const type of formData.enrollment_types) {
            const exists = existingReqs.some(r => r.enrollment_type === type);
            if (!exists) {
              const payload = {
                grade_level: formData.grade_level,
                enrollment_type: type,
                document_name: formData.document_name,
                is_required: formData.is_required,
                display_order: formData.display_order,
                description: formData.description,
                is_active: true
              };

              await fetch(API_ENDPOINTS.ADMIN_DOCUMENT_REQUIREMENTS, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(payload)
              });
            }
          }
        }

        toast({
          title: 'Success',
          description: 'Requirements updated successfully'
        });
      } else if (editingId) {
        // Update single requirement
        const payload = {
          ...formData,
          enrollment_type: formData.enrollment_types[0] || null
        };

        const response = await fetch(`${API_ENDPOINTS.ADMIN_DOCUMENT_REQUIREMENTS}/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(payload)
        });

        if (!response.ok) throw new Error('Failed to update requirement');
        
        const data = await response.json();
        if (data.success) {
          toast({
            title: 'Success',
            description: 'Requirement updated successfully'
          });
        }
      } else {
        // Create new requirements (one for each selected type)
        const typesToSave = formData.enrollment_types.length > 0 
          ? formData.enrollment_types 
          : [null];

        for (const enrollmentType of typesToSave) {
          const payload = {
            grade_level: formData.grade_level,
            enrollment_type: enrollmentType,
            document_name: formData.document_name,
            is_required: formData.is_required,
            display_order: formData.display_order,
            description: formData.description,
            is_active: true
          };

          const response = await fetch(API_ENDPOINTS.ADMIN_DOCUMENT_REQUIREMENTS, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(payload)
          });

          if (!response.ok) throw new Error('Failed to create requirement');
        }

        toast({
          title: 'Success',
          description: `${typesToSave.length} requirement${typesToSave.length > 1 ? 's' : ''} created successfully`
        });
      }
      
      setDialogOpen(false);
      fetchRequirements();
    } catch (error) {
      console.error('Error saving requirement:', error);
      toast({
        title: 'Error',
        description: 'Failed to save requirement',
        variant: 'destructive'
      });
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this requirement?')) return;

    try {
      const response = await fetch(`${API_ENDPOINTS.ADMIN_DOCUMENT_REQUIREMENTS}/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (!response.ok) throw new Error('Failed to delete requirement');

      const data = await response.json();
      if (data.success) {
        toast({
          title: 'Success',
          description: 'Requirement deleted successfully'
        });
        fetchRequirements();
      }
    } catch (error) {
      console.error('Error deleting requirement:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete requirement',
        variant: 'destructive'
      });
    }
  };

  const handleToggleActive = async (id: number) => {
    try {
      const response = await fetch(`${API_ENDPOINTS.ADMIN_DOCUMENT_REQUIREMENTS}/${id}/toggle`, {
        method: 'PATCH',
        credentials: 'include'
      });

      if (!response.ok) throw new Error('Failed to toggle status');

      const data = await response.json();
      if (data.success) {
        toast({
          title: 'Success',
          description: 'Status updated successfully'
        });
        fetchRequirements();
      }
    } catch (error) {
      console.error('Error toggling status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update status',
        variant: 'destructive'
      });
    }
  };

  const toggleSection = (gradeLevel: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(gradeLevel)) {
        newSet.delete(gradeLevel);
      } else {
        newSet.add(gradeLevel);
      }
      return newSet;
    });
  };

  const filteredRequirements = requirements.filter(req => {
    if (filterGrade !== 'all' && req.grade_level !== filterGrade) return false;
    if (filterType !== 'all') {
      if (filterType === 'general' && req.enrollment_type !== null) return false;
      if (filterType !== 'general' && req.enrollment_type !== filterType) return false;
    }
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesName = req.document_name.toLowerCase().includes(query);
      const matchesGrade = req.grade_level.toLowerCase().includes(query);
      const matchesType = req.enrollment_type && req.enrollment_type.toLowerCase().includes(query);
      if (!matchesName && !matchesGrade && !matchesType) return false;
    }
    return true;
  });

  // Group by grade level first, then by document name
  const groupedRequirements = filteredRequirements.reduce((acc, req) => {
    if (!acc[req.grade_level]) {
      acc[req.grade_level] = {};
    }
    if (!acc[req.grade_level][req.document_name]) {
      acc[req.grade_level][req.document_name] = [];
    }
    acc[req.grade_level][req.document_name].push(req);
    return acc;
  }, {} as Record<string, Record<string, DocumentRequirement[]>>);

  const content = (
    <div className="space-y-6">
      {/* Filters and Actions */}
      <Card className="shadow-lg border-0">
        <CardHeader className="bg-gradient-to-r from-muted/50 to-muted border-b pb-6">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold">Document Requirements ({filteredRequirements.length})</CardTitle>
              <CardDescription className="text-base">Manage required documents by grade level and enrollment type</CardDescription>
            </div>
            <Button onClick={() => handleOpenDialog()} className="bg-gradient-to-r from-green-600 to-green-700 text-white shadow-lg hover:shadow-xl">
              <Plus className="w-4 h-4 mr-2" />
              Add Requirement
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search documents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 border-2 focus:border-green-500 rounded-lg"
              />
            </div>
            <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-semibold">Grade Level</Label>
              <Select value={filterGrade} onValueChange={setFilterGrade}>
                <SelectTrigger className="mt-2 border-2 focus:border-accent-500 rounded-lg">
                  <SelectValue placeholder="All grades" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Grades</SelectItem>
                  {GRADE_LEVELS.map(grade => (
                    <SelectItem key={grade} value={grade}>{grade}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm font-semibold">Enrollment Type</Label>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="mt-2 border-2 focus:border-accent-500 rounded-lg">
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="general">General (All Types)</SelectItem>
                  {ENROLLMENT_TYPES.map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          </div>
        </CardContent>
      </Card>

      {/* Requirements List */}
      {loading ? (
        <Card className="shadow-lg border-0">
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Loading requirements...</p>
          </CardContent>
        </Card>
      ) : Object.keys(groupedRequirements).length === 0 ? (
        <Card className="shadow-lg border-0">
          <CardContent className="py-12 text-center">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-muted-foreground font-medium">No requirements found</p>
            <p className="text-sm text-muted-foreground mt-2">
              {searchQuery ? 'Try a different search term' : 'Add document requirements to get started'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(groupedRequirements)
            .sort((a, b) => {
              const aIndex = GRADE_LEVELS.indexOf(a[0]);
              const bIndex = GRADE_LEVELS.indexOf(b[0]);
              return aIndex - bIndex;
            })
            .map(([gradeLevel, documentGroups]) => {
            const isExpanded = expandedSections.has(gradeLevel);
            const totalDocs = Object.values(documentGroups).flat().length;
            return (
              <Collapsible key={gradeLevel} open={isExpanded} onOpenChange={() => toggleSection(gradeLevel)}>
                <Card className="shadow-lg border-0 overflow-hidden">
                  <CollapsibleTrigger className="w-full">
                    <CardHeader className="bg-gradient-to-r from-green-500 to-green-600 border-b hover:from-green-600 hover:to-green-700 transition-all cursor-pointer">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-white/20 rounded-lg">
                            <FileText className="h-5 w-5 text-white" />
                          </div>
                          <div className="text-left">
                            <CardTitle className="text-white text-xl">{gradeLevel}</CardTitle>
                            <CardDescription className="text-green-100 mt-1">
                              {Object.keys(documentGroups).length} document type{Object.keys(documentGroups).length !== 1 ? 's' : ''} • {totalDocs} total requirement{totalDocs !== 1 ? 's' : ''}
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
                      <div className="space-y-4">
                        {Object.entries(documentGroups).map(([documentName, reqs]) => {
                          // Collect all enrollment types for this document
                          const enrollmentTypes = reqs.map(r => r.enrollment_type).filter((t): t is string => t !== null);
                          const hasAllTypes = reqs.some(r => r.enrollment_type === null);
                          const firstReq = reqs[0];
                          
                          return (
                            <div key={documentName} className="border-l-4 border-green-500 pl-4">
                              <div className="p-3 rounded-lg border-2 border-gray-200 bg-white hover:border-green-300 transition-all shadow-sm hover:shadow-md">
                                <div className="flex items-center justify-between">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                      <h4 className="font-bold text-lg text-gray-900">{documentName}</h4>
                                      {firstReq.is_required ? (
                                        <Badge className="bg-red-100 text-red-800 text-xs">Required</Badge>
                                      ) : (
                                        <Badge variant="outline" className="text-xs">Optional</Badge>
                                      )}
                                      {!firstReq.is_active && (
                                        <Badge variant="outline" className="bg-gray-200 text-gray-600 text-xs">
                                          Inactive
                                        </Badge>
                                      )}
                                    </div>
                                    <div className="flex items-center gap-2 flex-wrap ml-1">
                                      {hasAllTypes ? (
                                        <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200">
                                          All Types
                                        </Badge>
                                      ) : (
                                        reqs.map(req => req.enrollment_type && (
                                          <Badge 
                                            key={req.enrollment_type} 
                                            variant="outline" 
                                            className={`text-xs ${
                                              !req.is_active ? 'bg-gray-200 text-gray-600' : ''
                                            }`}
                                          >
                                            {req.enrollment_type}
                                          </Badge>
                                        ))
                                      )}
                                    </div>
                                    {firstReq.description && (
                                      <p className="text-sm text-gray-600 mt-2">{firstReq.description}</p>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Button
                                      size="icon"
                                      variant="ghost"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleOpenDialog({
                                          grade_level: gradeLevel,
                                          document_name: documentName,
                                          types: reqs.map(r => r.enrollment_type),
                                          allReqs: reqs
                                        });
                                      }}
                                      className="h-8 w-8 hover:bg-blue-100"
                                      title="Edit requirement"
                                    >
                                      <Edit className="w-4 h-4" />
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </CollapsibleContent>
                </Card>
              </Collapsible>
            );
          })}
        </div>
        )}

        {/* Add/Edit Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>{(editingId || isEditingGroup) ? 'Edit Requirement' : 'Add New Requirement'}</DialogTitle>
              <DialogDescription>
                Define document requirements for enrollment
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="grade_level">Grade Level *</Label>
                <Select
                  value={formData.grade_level}
                  onValueChange={(value) => setFormData({ ...formData, grade_level: value })}
                >
                  <SelectTrigger id="grade_level" className="mt-2">
                    <SelectValue placeholder="Select grade level" />
                  </SelectTrigger>
                  <SelectContent>
                    {GRADE_LEVELS.map(grade => (
                      <SelectItem key={grade} value={grade}>{grade}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Enrollment Types</Label>
                <div className="mt-2 p-4 border rounded-md space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="type-all"
                      checked={formData.enrollment_types.length === 0}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setFormData({ ...formData, enrollment_types: [] });
                        }
                      }}
                    />
                    <label
                      htmlFor="type-all"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      All Types
                    </label>
                  </div>
                  {ENROLLMENT_TYPES.map(type => (
                    <div key={type} className="flex items-center space-x-2">
                      <Checkbox
                        id={`type-${type}`}
                        checked={formData.enrollment_types.includes(type)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setFormData({ 
                              ...formData, 
                              enrollment_types: [...formData.enrollment_types, type] 
                            });
                          } else {
                            setFormData({ 
                              ...formData, 
                              enrollment_types: formData.enrollment_types.filter(t => t !== type) 
                            });
                          }
                        }}
                      />
                      <label
                        htmlFor={`type-${type}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        {type}
                      </label>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Select specific types or leave unchecked for all types
                </p>
              </div>

              <div>
                <Label htmlFor="document_name">Document Name *</Label>
                <Input
                  id="document_name"
                  value={formData.document_name}
                  onChange={(e) => setFormData({ ...formData, document_name: e.target.value })}
                  placeholder="e.g., Birth Certificate, Form 137"
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="e.g., For age verification"
                  className="mt-2"
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="display_order">Display Order</Label>
                  <Input
                    id="display_order"
                    type="number"
                    value={formData.display_order}
                    onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="is_required">Required?</Label>
                  <Select
                    value={formData.is_required.toString()}
                    onValueChange={(value) => setFormData({ ...formData, is_required: value === 'true' })}
                  >
                    <SelectTrigger id="is_required" className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">Required</SelectItem>
                      <SelectItem value="false">Optional</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">
                {(editingId || isEditingGroup) ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
  );

  return embedded ? content : <DashboardLayout role="admin">{content}</DashboardLayout>;
}
