import { useState, useEffect } from "react";
import Joyride, { CallBackProps, STATUS, Step } from 'react-joyride';
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertCircle, Upload, X, CheckCircle2, File, FileText, Package, Info } from "lucide-react";
import { API_ENDPOINTS } from "@/lib/api";
import { EnrollmentFormData } from "../EnrollmentForm";

interface Step6Props {
  formData: EnrollmentFormData;
  updateFormData: (updates: Partial<EnrollmentFormData>) => void;
  errors: Record<string, string>;
  isReturningStudent?: boolean;
  isFirstTimer?: boolean;
}

interface PhysicalDocStatus {
  [key: string]: boolean; // document type -> will submit physically
}

interface DocumentRequirement {
  id: number;
  document_name: string;
  description?: string | null;
  is_required: boolean;
  is_active: boolean;
}

const Step6DocumentUpload = ({ formData, updateFormData, errors, isReturningStudent = false, isFirstTimer = true }: Step6Props) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<Array<{ file: File; name: string; documentType?: string }>>([]);
  const [physicalDocs, setPhysicalDocs] = useState<PhysicalDocStatus>({});
  const [documentRequirements, setDocumentRequirements] = useState<DocumentRequirement[]>([]);
  const [documentsLoading, setDocumentsLoading] = useState(false);
  const [documentsError, setDocumentsError] = useState<string | null>(null);

  // Tour State
  const [runTour, setRunTour] = useState(false);

  const documentUploadTourSteps: Step[] = [
    {
      target: 'body',
      content: (
        <div className="text-left">
          <h3 className="font-bold text-lg mb-2">📄 Document Upload</h3>
          <p>Upload supporting documents or indicate physical submission for your enrollment.</p>
        </div>
      ),
      placement: 'center',
      disableBeacon: true,
    },
    ...(formData.enrollment_type === 'Continuing Student' ? [
      {
        target: '.bg-green-50',
        content: 'As a continuing student, your documents are already on file. No upload required!',
      },
    ] : [
      {
        target: '.bg-blue-50',
        content: 'Review the information about document requirements for your enrollment type.',
      },
      {
        target: '.bg-orange-50',
        content: 'Remember: all uploads are optional. You can proceed without documents.',
      },
      {
        target: '[class*="border-dashed"]',
        content: 'Drag and drop your files here, or click to select files. Supports PDF, JPG, PNG up to 10MB each.',
      },
      {
        target: 'input[type="file"]',
        content: 'Click this area to browse and select multiple files from your computer.',
      },
      {
        target: '.space-y-3',
        content: 'Check the documents you plan to submit in person during enrollment.',
      },
      {
        target: 'input[type="checkbox"]',
        content: 'Check this box for any document you will bring physically instead of uploading.',
      },
    ]),
  ];

  const togglePhysicalDoc = (docId: string) => {
    setPhysicalDocs(prev => ({
      ...prev,
      [docId]: !prev[docId]
    }));
  };

  const handleFiles = (files: FileList | null) => {
    if (!files) return;

    const newFiles: File[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      // Validate file type
      const validTypes = ["application/pdf", "image/jpeg", "image/png"];
      if (!validTypes.includes(file.type)) {
        continue;
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        continue;
      }

      newFiles.push(file);
      setUploadedFiles((prev) => [
        ...prev,
        { file, name: file.name },
      ]);
    }

    updateFormData({ documents: [...formData.documents, ...newFiles] });
  };

  useEffect(() => {
    const grade = formData.grade_level?.trim();
    if (!grade) {
      setDocumentRequirements([]);
      setDocumentsError(null);
      setDocumentsLoading(false);
      return;
    }

    const controller = new AbortController();
    const enrollmentType = formData.enrollment_type || undefined;

    const loadRequirements = async () => {
      setDocumentsLoading(true);
      setDocumentsError(null);

      try {
        const response = await fetch(API_ENDPOINTS.DOCUMENT_REQUIREMENTS_BY_GRADE(grade, enrollmentType), {
          credentials: "include",
          signal: controller.signal
        });

        if (!response.ok) {
          throw new Error("Failed to load document requirements");
        }

        const payload = await response.json();
        const requirements = payload?.data || payload?.requirements || [];
        const activeRequirements = requirements.filter((req: DocumentRequirement) => Boolean(req.is_active));
        setDocumentRequirements(activeRequirements);
      } catch (error) {
        if (controller.signal.aborted) return;
        console.error("Error fetching document requirements:", error);
        setDocumentsError("Unable to load document requirements at this time.");
        setDocumentRequirements([]);
      } finally {
        if (!controller.signal.aborted) {
          setDocumentsLoading(false);
        }
      }
    };

    loadRequirements();

    return () => controller.abort();
  }, [formData.grade_level, formData.enrollment_type]);

  useEffect(() => {
    // Auto start tour for step 6
    const hasSeenTour = localStorage.getItem('documentUploadTourCompleted');
    if (!hasSeenTour) {
      setRunTour(true);
    }
  }, []);

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status } = data;

    if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
      setRunTour(false);
      localStorage.setItem('documentUploadTourCompleted', 'true');
    }
  };

  const removeFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
    updateFormData({
      documents: formData.documents.filter((_, i) => i !== index),
    });
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    handleFiles(e.dataTransfer.files);
  };

  const requiredDocumentList = documentRequirements.filter(req => req.is_required);
  const optionalDocumentList = documentRequirements.filter(req => !req.is_required);
  const allDocumentOptions = [...requiredDocumentList, ...optionalDocumentList];

  return (
    <div className="space-y-6">
      {/* Header Card - Only show for non-continuing students */}
      {formData.enrollment_type !== 'Continuing Student' && (
        <Card className="border-0 shadow-md bg-gradient-to-r from-blue-600 to-blue-700">
          <CardHeader>
            <div className="flex items-center gap-3">
              <FileText className="h-6 w-6 text-white" />
              <div>
                <CardTitle className="text-white text-xl">Supporting Documents</CardTitle>
                <p className="text-orange-100 text-sm mt-1">Upload documents to support your enrollment (all optional)</p>
              </div>
            </div>
          </CardHeader>
        </Card>
      )}

      <div className="space-y-6">
      {formData.enrollment_type === 'Continuing Student' && !isFirstTimer ? (
        <>
          <Alert className="bg-green-50 border-green-200">
            <Info className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              As a continuing student, your academic documents are already on file. <strong>No document upload is required.</strong> You can proceed directly to review and submit your enrollment.
            </AlertDescription>
          </Alert>
        </>
      ) : formData.enrollment_type === 'Continuing Student' ? (
        <>
          <Alert className="bg-green-50 border-green-200">
            <Info className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              As a continuing student, your academic documents from previous years are on file. <strong>No document upload is required.</strong> You can proceed directly to review and submit your enrollment.
            </AlertDescription>
          </Alert>
        </>
      ) : (
        <>
          <Alert className="bg-blue-50 border-blue-200">
            <Info className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              {isFirstTimer 
                ? "Please upload required documents or indicate if you'll submit physical copies."
                : "Please upload updated documents if any information has changed, or indicate if you'll submit physical copies."}
            </AlertDescription>
          </Alert>
          
          <Alert className="bg-orange-50 border-orange-200">
            <AlertCircle className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-800">
              {isFirstTimer 
                ? <>All document uploads are <strong>optional</strong>. You can proceed with your enrollment without uploading documents.</>
                : "Returning students should provide updated documents or indicate physical submission. You can still proceed if documents are being submitted physically."}
            </AlertDescription>
          </Alert>
        </>
      )}

      {documentsError && (
        <Alert className="bg-red-50 border-red-200">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            {documentsError}
          </AlertDescription>
        </Alert>
      )}

      {/* Only show upload section for non-continuing students */}
      {formData.enrollment_type !== 'Continuing Student' && (
        <>
      {/* Upload Area */}

      {/* Upload Area */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`relative rounded-lg border-2 border-dashed p-8 transition-colors ${
          dragActive ? "border-blue-500 bg-blue-50" : "border-gray-300 bg-gray-50"
        } ${errors.documents ? "border-red-500 bg-red-50" : ""}`}
      >
        <div className="flex flex-col items-center justify-center space-y-2">
          <Upload className="h-10 w-10 text-gray-400" />
          <p className="text-center font-semibold text-gray-700">Drag and drop your files here</p>
          <p className="text-center text-sm text-gray-500">or</p>
          <Label htmlFor="fileInput" className="cursor-pointer">
            <Button variant="outline" type="button" asChild>
              <span>Click to select files</span>
            </Button>
          </Label>
          <input
            id="fileInput"
            type="file"
            multiple
            onChange={(e) => handleFiles(e.currentTarget.files)}
            accept=".pdf,.jpg,.jpeg,.png"
            className="hidden"
          />
          <p className="text-xs text-gray-500 text-center">
            Supported formats: PDF, JPG, PNG
            <br />
            Maximum file size: 10MB
          </p>
        </div>
      </div>

      {errors.documents && <p className="text-red-600 text-sm">{errors.documents}</p>}

      {/* Uploaded Files */}
      {uploadedFiles.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              Uploaded Files ({uploadedFiles.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {uploadedFiles.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <File className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium text-gray-800">{item.name}</p>
                      <p className="text-xs text-gray-500">{(item.file.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  </div>
                  <button
                    onClick={() => removeFile(index)}
                    className="text-red-600 hover:text-red-800 transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Documents Checklist */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Suggested Documents</CardTitle>
          <p className="text-sm text-gray-600 mt-1">Check the box if you'll submit the document in person (face-to-face)</p>
        </CardHeader>
        <CardContent className="space-y-3">
          {documentsLoading ? (
            <p className="text-sm text-gray-500">Loading document requirements...</p>
          ) : requiredDocumentList.length === 0 ? (
            <p className="text-sm text-gray-500">
              No required documents configured for {formData.grade_level || "this grade"}. You can upload anything you already have.
            </p>
          ) : (
            requiredDocumentList.map((doc) => {
              const docKey = doc.id.toString();
              return (
                <div key={doc.id} className={`p-4 rounded-lg border-2 transition-all ${
                  physicalDocs[docKey] ? 'border-purple-300 bg-purple-50' : 'border-gray-200 bg-gray-50'
                }`}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <p className="font-semibold text-gray-800">{doc.document_name}</p>
                      {doc.description && (
                        <p className="text-sm text-gray-600">{doc.description}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id={`physical-${docKey}`}
                        checked={physicalDocs[docKey] || false}
                        onCheckedChange={() => togglePhysicalDoc(docKey)}
                      />
                      <Label htmlFor={`physical-${docKey}`} className="text-sm font-medium cursor-pointer whitespace-nowrap flex items-center gap-1">
                        <Package className="w-4 h-4" />
                        Submit Physically
                      </Label>
                    </div>
                  </div>
                  {physicalDocs[docKey] && (
                    <div className="mt-3 p-2 bg-purple-100 border border-purple-200 rounded">
                      <p className="text-xs font-semibold text-purple-800">
                        ✓ You will submit this document face-to-face during enrollment
                      </p>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </CardContent>
      </Card>

      {/* Physical Documents Summary */}
      {Object.values(physicalDocs).some(v => v) && (
        <Alert className="bg-purple-50 border-purple-300">
          <Package className="h-5 w-5 text-purple-600" />
          <AlertDescription className="text-purple-900">
            <p className="font-semibold mb-2">Documents to Submit Face-to-Face ({Object.values(physicalDocs).filter(v => v).length}):</p>
            <ul className="list-disc list-inside space-y-1 text-sm">
              {Object.entries(physicalDocs)
                .filter(([_, checked]) => checked)
                .map(([docId]) => {
                  const doc = allDocumentOptions.find(d => d.id.toString() === docId);
                  return doc ? <li key={docId}>{doc.document_name}</li> : null;
                })}
            </ul>
            <p className="text-xs mt-3 text-purple-700">
              Please bring these documents when you visit the school for enrollment processing.
            </p>
          </AlertDescription>
        </Alert>
      )}

      {/* Tips */}
      <Alert className="bg-blue-50 border-blue-200">
        <AlertCircle className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-800">
          <strong>Tips:</strong> Make sure documents are clear and readable. Photo copies from PDFs or scans should have good contrast. You can upload some documents now and submit others physically during your visit.
        </AlertDescription>
      </Alert>
        </>
      )}

      <Joyride
        steps={documentUploadTourSteps}
        run={runTour}
        continuous
        showProgress
        showSkipButton
        callback={handleJoyrideCallback}
        styles={{
          options: {
            primaryColor: '#2563eb',
            zIndex: 1000,
          },
        }}
        locale={{
          last: 'Finish',
          skip: 'Skip',
        }}
      />
    </div>
    </div>
  );
};

export default Step6DocumentUpload;
