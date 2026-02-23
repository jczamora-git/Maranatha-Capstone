import { AlertCircle, CheckCircle2, XCircle, Package, RotateCcw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useState, useEffect } from 'react';
import { API_ENDPOINTS, API_BASE_URL } from '@/lib/api';

interface DocumentRequirement {
  id: number;
  grade_level: string;
  enrollment_type: 'New Student' | 'Returning Student' | 'Transferee' | null;
  document_name: string;
  is_required: boolean;
  display_order: number;
  description: string | null;
  is_active: boolean;
}

interface Document {
  id: number;
  file_name: string;
  document_type: string;
  verification_status: 'Pending' | 'Verified' | 'Rejected';
  verified_date: string | null;
  file_path: string;
  
  // Resubmission fields
  submission_method?: 'Uploaded' | 'Physical' | 'Both';
  rejection_reason?: string;
  verification_notes?: string;
  resubmission_count?: number;
  is_current_version?: boolean;
  physical_verification_status?: 'Not Required' | 'Pending' | 'Checked' | 'Missing';
}

interface EnrollmentStep2Props {
  enrollment: any;
  actionLoading: boolean;
  handleVerifyDocument: (docId: number) => void;
  handleRejectDocument: (docId: number) => void;
  onComplete: () => void;
  onRefresh?: () => void;
}

const statusConfig = {
  'Pending': { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: <AlertCircle className="w-5 h-5" /> },
  'Verified': { bg: 'bg-green-100', text: 'text-green-800', icon: <CheckCircle2 className="w-5 h-5" /> },
  'Rejected': { bg: 'bg-red-100', text: 'text-red-800', icon: <XCircle className="w-5 h-5" /> },
};

export function EnrollmentStep2({ 
  enrollment, 
  actionLoading,
  handleVerifyDocument,
  handleRejectDocument,
  onComplete,
  onRefresh
}: EnrollmentStep2Props) {
  const [requiredDocs, setRequiredDocs] = useState<DocumentRequirement[]>([]);
  const [loading, setLoading] = useState(true);
  const [verifyDialogOpen, setVerifyDialogOpen] = useState(false);
  const [selectedDocId, setSelectedDocId] = useState<number | string | null>(null);
  const [selectedVerificationMethod, setSelectedVerificationMethod] = useState<'Physical' | null>(null);
  // Upload rejection flow is disabled for now (physical-only verification policy).
  // Keep these states and related UI code commented for future upload feature re-enable.
  // const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  // const [rejectionReason, setRejectionReason] = useState('');
  // const [rejectionNotes, setRejectionNotes] = useState('');
  // const [requestResubmission, setRequestResubmission] = useState(true);
  const [lastFetchKey, setLastFetchKey] = useState<string>('');
  const [manuallyCheckedDocs, setManuallyCheckedDocs] = useState<Set<string>>(new Set());

  // Helper function to get document status
  const getDocumentStatus = (docName: string) => {
    const doc = enrollment.documents?.find((d: Document) => 
      d.document_type.toLowerCase().includes(docName.toLowerCase()) ||
      docName.toLowerCase().includes(d.document_type.toLowerCase())
    );
    return doc || null;
  };

  // Check if all required documents are verified
  const isStepComplete = enrollment.enrollment_type === 'Continuing Student' || 
    requiredDocs.filter(req => req.is_required).every(req => {
      const doc = getDocumentStatus(req.document_name);
      const status = doc?.verification_status;
      const isManuallyChecked = manuallyCheckedDocs.has(req.document_name);
      return status === 'Verified' || isManuallyChecked;
    });

  // Upload verification flow disabled (no document uploads).
  // const openVerifyDialog = (docId: number) => {
  //   setSelectedDocId(docId);
  //   setSelectedVerificationMethod(null);
  //   setVerifyDialogOpen(true);
  // };

  const handleVerifyConfirm = () => {
    if (!selectedVerificationMethod) return;

    // Check if this is a document ID (number) or document name (string)
    // Upload verification by document ID is disabled for now (physical-only flow).
    // if (typeof selectedDocId === 'number') {
    //   handleVerifyDocument(selectedDocId);
    // } else
    if (typeof selectedDocId === 'string') {
      // It's a manual check (document name)
      const docName = selectedDocId;
      try {
        setManuallyCheckedDocs(prev => {
          const next = new Set(prev);
          next.add(docName);
          return next;
        });

        const fetchData = async () => {
          const response = await fetch(`${API_BASE_URL}/api/admin/documents/toggle-manual`, {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              enrollment_id: enrollment.id,
              document_type: docName
            })
          });

          const data = await response.json();
          
          if (data.success) {
            if (onRefresh) {
              onRefresh();
            }
          } else {
            console.error('Failed to toggle document:', data.message);
            // Revert on failure
            setManuallyCheckedDocs(prev => {
              const next = new Set(prev);
              next.delete(docName);
              return next;
            });
          }
        };
        fetchData();
      } catch (error) {
        console.error('Error toggling document:', error);
        // Revert on error
        setManuallyCheckedDocs(prev => {
          const next = new Set(prev);
          next.delete(docName);
          return next;
        });
      }
    }

    setVerifyDialogOpen(false);
  };

  // Upload rejection flow disabled (no document uploads).
  // const openRejectDialog = (docId: number) => {
  //   setSelectedDocId(docId);
  //   setRejectionReason('');
  //   setRejectionNotes('');
  //   setRequestResubmission(true);
  //   setRejectDialogOpen(true);
  // };

  // const handleRejectConfirm = () => {
  //   if (typeof selectedDocId === 'number' && rejectionReason) {
  //     handleRejectDocument(selectedDocId);
  //     setRejectDialogOpen(false);
  //   }
  // };

  const toggleManualCheck = async (docName: string) => {
    const isChecked = manuallyCheckedDocs.has(docName);
    
    // If unchecking, do it directly without modal
    if (isChecked) {
      try {
        setManuallyCheckedDocs(prev => {
          const next = new Set(prev);
          next.delete(docName);
          return next;
        });

        const response = await fetch(`${API_BASE_URL}/api/admin/documents/toggle-manual`, {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            enrollment_id: enrollment.id,
            document_type: docName
          })
        });

        const data = await response.json();
        
        if (data.success) {
          if (onRefresh) {
            onRefresh();
          }
        } else {
          console.error('Failed to toggle document:', data.message);
          // Revert on failure
          setManuallyCheckedDocs(prev => {
            const next = new Set(prev);
            next.add(docName);
            return next;
          });
        }
      } catch (error) {
        console.error('Error toggling document:', error);
        // Revert on error
        setManuallyCheckedDocs(prev => {
          const next = new Set(prev);
          next.add(docName);
          return next;
        });
      }
      return;
    }

    // If checking, open modal to confirm verification method
    setSelectedDocId(null);
    setSelectedVerificationMethod(null);
    setVerifyDialogOpen(true);
    
    // Store the doc name for later use in handleVerifyConfirm
    setSelectedDocId(docName);
  };

  useEffect(() => {
    const fetchDocumentRequirements = async () => {
      const gradeLevel = enrollment.grade_level || '';
      
      // Derive enrollment type from is_returning_student field
      // If not explicitly set, default to "New Student"
      let enrollmentType = 'New Student';
      if (enrollment.enrollment_type) {
        enrollmentType = enrollment.enrollment_type;
      } else if (enrollment.is_returning_student === true) {
        enrollmentType = 'Returning Student';
      } else if (enrollment.is_returning_student === false) {
        enrollmentType = 'New Student';
      }
      
      // Create a unique key to prevent duplicate fetches
      const fetchKey = `${gradeLevel}|${enrollmentType}`;
      
      // Skip if we already fetched for this combination
      if (fetchKey === lastFetchKey || !gradeLevel) {
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        
        console.log('Fetching requirements for:', { gradeLevel, enrollmentType });
        
        const response = await fetch(
          API_ENDPOINTS.DOCUMENT_REQUIREMENTS_BY_GRADE(gradeLevel, enrollmentType),
          { credentials: 'include' }
        );
        
        console.log('API Response status:', response.status);
        
        if (response.ok) {
          const responseText = await response.text();
          console.log('API Response text:', responseText.substring(0, 500));
          
          try {
            const result = JSON.parse(responseText);
            console.log('API Response data:', result);
            
            // The API returns { success: true, data: [...] }
            const requirements = result.data || result.requirements || [];
            console.log('Requirements found:', requirements.length);
            
            // Sort by display_order and filter only active requirements
            const sorted = requirements
              .filter((req: DocumentRequirement) => req.is_active)
              .sort((a: DocumentRequirement, b: DocumentRequirement) => a.display_order - b.display_order);
            setRequiredDocs(sorted);
            setLastFetchKey(fetchKey);
          } catch (parseError) {
            console.error('Failed to parse response as JSON. Response:', responseText);
            setRequiredDocs([]);
          }
        } else {
          const errorText = await response.text();
          console.error('Failed to fetch document requirements:', response.status, errorText);
          setRequiredDocs([]);
        }
      } catch (error) {
        console.error('Error fetching document requirements:', error);
        setRequiredDocs([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDocumentRequirements();
  }, [enrollment.grade_level, enrollment.enrollment_type, enrollment.is_returning_student, lastFetchKey]);

  return (
    <div className="space-y-6">
      {/* Continuing Student Document Exemption */}
      {enrollment.enrollment_type === 'Continuing Student' && (
        <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-6 h-6 text-green-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-base font-semibold text-green-900">Documents on File</p>
              <p className="text-sm text-green-700 mt-1">
                As a continuing student, your academic documents from previous years are already on file. No new document uploads are required for this enrollment.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Required Documents Checklist - Skip for Continuing Students */}
      {enrollment.enrollment_type !== 'Continuing Student' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 px-6 py-4">
            <h2 className="text-lg font-semibold text-white">Required Documents</h2>
            <p className="text-emerald-100 text-sm mt-1">
              For {enrollment.grade_level || 'student'} 
              {enrollment.enrollment_type ? ` (${enrollment.enrollment_type})` : enrollment.is_returning_student ? ' (Returning Student)' : ' (New Student)'}
            </p>
          </div>
          <div className="p-6">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
                <span className="ml-3 text-gray-600">Loading requirements...</span>
              </div>
            ) : requiredDocs.length > 0 ? (
              <div className="space-y-3">
                {requiredDocs.map((requirement) => {
                  const doc = getDocumentStatus(requirement.document_name);
                  const status = doc?.verification_status || null;
                  const isManuallyChecked = manuallyCheckedDocs.has(requirement.document_name);
                  
                  return (
                    <div 
                      key={requirement.id} 
                      className={`p-4 rounded-lg border-2 transition-all ${
                        status === 'Verified' || isManuallyChecked ? 'border-green-300 bg-green-50' :
                        status === 'Rejected' ? 'border-red-300 bg-red-50' :
                        status === 'Pending' ? 'border-yellow-300 bg-yellow-50' :
                        'border-gray-200 bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 flex-1">
                          <button
                            type="button"
                            onClick={() => toggleManualCheck(requirement.document_name)}
                            className={`flex-shrink-0 cursor-pointer`}
                          >
                            {status === 'Verified' ? (
                              <CheckCircle2 className="w-6 h-6 text-green-600" />
                            ) : status === 'Rejected' ? (
                              <XCircle className="w-6 h-6 text-red-600" />
                            ) : status === 'Pending' ? (
                              <AlertCircle className="w-6 h-6 text-yellow-600" />
                            ) : isManuallyChecked ? (
                              <div className="w-6 h-6 rounded border-2 border-green-600 bg-green-600 flex items-center justify-center">
                                <CheckCircle2 className="w-4 h-4 text-white" />
                              </div>
                            ) : (
                              <div className="w-6 h-6 rounded border-2 border-gray-400 hover:border-emerald-500 transition-colors" />
                            )}
                          </button>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="font-semibold text-gray-900">{requirement.document_name}</p>
                              {requirement.is_required && (
                                <Badge variant="outline" className="text-xs bg-red-50 text-red-700 border-red-200">Required</Badge>
                              )}
                              {isManuallyChecked && !status && (
                                <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">Checked in Person</Badge>
                              )}
                            </div>
                            {requirement.description && (
                              <p className="text-xs text-gray-500 mt-0.5">{requirement.description}</p>
                            )}
                            {!status && !isManuallyChecked && (
                              <p className="text-xs text-gray-500 mt-1">Not submitted • Click checkbox to mark as received</p>
                            )}
                            {!status && isManuallyChecked && (
                              <p className="text-xs text-green-700 mt-1">✓ Verified in person</p>
                            )}
                            {status === 'Pending' && (
                              <p className="text-xs text-yellow-700 mt-1">Awaiting verification</p>
                            )}
                            {status === 'Verified' && (
                              <p className="text-xs text-green-700 mt-1">✓ Verified (digital upload)</p>
                            )}
                            {status === 'Rejected' && (
                              <p className="text-xs text-red-700 mt-1">✗ Rejected</p>
                            )}
                          </div>
                        </div>
                        {doc && (
                          <Badge className={statusConfig[doc.verification_status].bg}>
                            <span className={statusConfig[doc.verification_status].text}>{doc.verification_status}</span>
                          </Badge>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-lg border-2 border-gray-200 p-6 bg-gray-50 text-center">
                <AlertCircle className="h-8 w-8 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600 font-medium">No document requirements found</p>
                <p className="text-sm text-gray-500 mt-1">Unable to determine required documents for this enrollment</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/*
        Upload-related UI is intentionally disabled based on current school policy
        (physical verification only for this step).

        Keep this block for future re-enable of digital uploads/review/rejection flow.
      */}
      {/**
      {enrollment.enrollment_type !== 'Continuing Student' && (
        <>
          {enrollment.documents?.some((d: Document) => d.is_current_version !== false && d.submission_method !== 'Physical') ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              ... Uploaded Documents UI ...
            </div>
          ) : null}
        </>
      )}
      */}

      {/* Document Verification Note - Skip for Continuing Students */}
      {enrollment.enrollment_type !== 'Continuing Student' && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-blue-900">Document Verification is Required</p>
              <p className="text-sm text-blue-700 mt-1">
                Documents must be verified manually during enrollment processing to keep complete system records. Please complete verification before proceeding to final approval.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Complete Step 2 Button */}
      <div className="mt-8 bg-emerald-50 border border-emerald-200 rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-semibold text-emerald-900 text-lg">
              {isStepComplete ? 'Document verification complete?' : 'Document verification incomplete'}
            </p>
            <p className="text-sm text-emerald-700 mt-1">
              {isStepComplete 
                ? (enrollment.enrollment_type === 'Continuing Student' 
                    ? 'Click to confirm continuing student enrollment and proceed to final approval.'
                    : 'Click to confirm and proceed to final approval.')
                : 'All required documents must be verified before proceeding.'}
            </p>
          </div>
          <Button
            onClick={onComplete}
            disabled={!isStepComplete}
            className={`font-semibold px-6 py-3 text-base ${
              isStepComplete 
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white' 
                : 'bg-gray-400 text-gray-200 cursor-not-allowed'
            }`}
          >
            Mark Complete → Next Step
          </Button>
        </div>
      </div>

      {/* Document Verification Method Dialog */}
      <Dialog open={verifyDialogOpen} onOpenChange={setVerifyDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Physical Verification</DialogTitle>
            <DialogDescription>
              This will mark the selected required document as verified in person.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-sm font-semibold">Verification Method</Label>
              <div className="space-y-2">
                <button
                  onClick={() => setSelectedVerificationMethod('Physical')}
                  className={`w-full p-3 text-left rounded-lg border-2 transition-all ${
                    selectedVerificationMethod === 'Physical'
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 bg-white hover:border-green-300'
                  }`}
                >
                  <p className="font-semibold text-gray-900">Physical Verification</p>
                  <p className="text-xs text-gray-600 mt-1">Document was verified in person during enrollment</p>
                </button>
                {/*
                  Digital verification option is disabled while upload flow is paused.
                  Keep this button for future re-enable.
                */}
                {/**
                <button
                  onClick={() => setSelectedVerificationMethod('Digital')}
                  className={`w-full p-3 text-left rounded-lg border-2 transition-all ${
                    selectedVerificationMethod === 'Digital'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 bg-white hover:border-blue-300'
                  }`}
                >
                  <p className="font-semibold text-gray-900">Digital Upload</p>
                  <p className="text-xs text-gray-600 mt-1">Document was uploaded and verified digitally</p>
                </button>
                */}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setVerifyDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleVerifyConfirm}
              disabled={!selectedVerificationMethod}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              Confirm Verification
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/*
        Upload rejection dialog is disabled while document upload flow is paused.
        Keep this block for future re-enable.
      */}
      {/**
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent className="sm:max-w-md">
          ... Reject Document dialog ...
        </DialogContent>
      </Dialog>
      */}
    </div>
  );
}
