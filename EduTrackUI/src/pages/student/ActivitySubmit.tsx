import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { AlertMessage } from "@/components/AlertMessage";
import { 
  ArrowLeft, 
  Upload, 
  FileText, 
  Send, 
  Clock,
  CheckCircle,
  AlertCircle,
  X
} from "lucide-react";
import { API_ENDPOINTS, apiGet, apiPost } from "@/lib/api";

const ActivitySubmit = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { courseId, activityId } = useParams();

  const [activity, setActivity] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  
  const [submissionText, setSubmissionText] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [existingSubmission, setExistingSubmission] = useState<any>(null);
  const [studentDbId, setStudentDbId] = useState<number | null>(null);

  useEffect(() => {
    if (!isAuthenticated || user?.role !== "student") {
      navigate("/auth");
    }
  }, [isAuthenticated, user, navigate]);

  useEffect(() => {
    loadActivityData();
  }, [activityId, user]);

  const loadActivityData = async () => {
    if (!user?.id || !activityId) return;

    try {
      setLoading(true);

      // Fetch activity details
      const activityRes = await apiGet(`${API_ENDPOINTS.ACTIVITIES}/${activityId}`);
      if (activityRes.success && activityRes.data) {
        setActivity(activityRes.data);
      }

      // Get student info to fetch student_id
      const studentRes = await apiGet(API_ENDPOINTS.STUDENT_BY_USER(user.id));
      const student = studentRes.data || studentRes.student || studentRes || null;
      const dbId = student?.id;
      setStudentDbId(dbId);

      // Check if there's already a submission
      if (dbId) {
        try {
          const submissionRes = await apiGet(
            `${API_ENDPOINTS.ACTIVITIES}/${activityId}/submissions?student_id=${dbId}`
          );
          const submissions = submissionRes.data || submissionRes || [];
          if (Array.isArray(submissions) && submissions.length > 0) {
            setExistingSubmission(submissions[0]);
            setSubmissionText(submissions[0].submission_text || "");
          }
        } catch (err) {
          // No existing submission
        }
      }

    } catch (error) {
      console.error('Error loading activity:', error);
      setAlert({ type: 'error', message: 'Failed to load activity details' });
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setSelectedFiles([...selectedFiles, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(selectedFiles.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!submissionText.trim() && selectedFiles.length === 0) {
      setAlert({ type: 'error', message: 'Please provide a submission text or upload files' });
      return;
    }

    try {
      setSubmitting(true);

      if (!studentDbId) {
        setAlert({ type: 'error', message: 'Student information not loaded. Please refresh the page.' });
        setSubmitting(false);
        return;
      }

      const formData = new FormData();
      formData.append('activity_id', activityId!);
      formData.append('student_id', String(studentDbId));
      formData.append('submission_text', submissionText);

      // Append files
      selectedFiles.forEach((file) => {
        formData.append('files[]', file);
      });

      const res = await apiPost(`${API_ENDPOINTS.ACTIVITIES}/${activityId}/submit`, formData);

      if (res.success) {
        setAlert({ type: 'success', message: 'Submission successful!' });
        setTimeout(() => {
          navigate(`/student/courses/${courseId}`);
        }, 2000);
      } else {
        setAlert({ type: 'error', message: res.message || 'Submission failed' });
      }

    } catch (error) {
      console.error('Submission error:', error);
      setAlert({ type: 'error', message: 'Error submitting activity' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading activity...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <Button
            variant="ghost"
            onClick={() => navigate(`/student/courses/${courseId}`)}
            className="mb-4 gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Course
          </Button>

          {/* Header Card */}
          <Card className="border-0 shadow-lg mb-6">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 border-b">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-2xl font-bold mb-2">{activity?.title}</CardTitle>
                  <CardDescription className="text-base">
                    Submit your work for this activity
                  </CardDescription>
                  <div className="flex items-center gap-3 mt-3">
                    <Badge className="bg-blue-600 text-white capitalize">
                      {activity?.type}
                    </Badge>
                    <span className="text-sm text-gray-600 flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      Due: {activity?.due_at ? new Date(activity.due_at).toLocaleDateString() : 'No deadline'}
                    </span>
                    <span className="text-sm font-semibold text-blue-700">
                      {activity?.max_score} points
                    </span>
                  </div>
                </div>
              </div>
            </CardHeader>

            {activity?.description && (
              <CardContent className="p-6 border-b bg-blue-50/30">
                <Label className="text-sm font-semibold text-gray-700 mb-2 block">Instructions:</Label>
                <div 
                  className="prose prose-sm max-w-none text-gray-800"
                  dangerouslySetInnerHTML={{ __html: activity.description }}
                />
              </CardContent>
            )}
          </Card>

          {/* Existing Submission Warning */}
          {existingSubmission && (
            <Card className="border-2 border-amber-200 bg-amber-50 mb-6">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
                  <div>
                    <p className="font-semibold text-amber-900">Previous Submission Found</p>
                    <p className="text-sm text-amber-700 mt-1">
                      You have already submitted this activity. Submitting again will replace your previous submission.
                    </p>
                    {existingSubmission.submitted_at && (
                      <p className="text-xs text-amber-600 mt-1">
                        Last submitted: {new Date(existingSubmission.submitted_at).toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Submission Form */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-600" />
                Your Submission
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Text Submission */}
              <div>
                <Label htmlFor="submission-text" className="text-sm font-semibold mb-2 block">
                  Written Response
                </Label>
                <Textarea
                  id="submission-text"
                  value={submissionText}
                  onChange={(e) => setSubmissionText(e.target.value)}
                  placeholder="Type your response here..."
                  rows={10}
                  className="w-full resize-none"
                />
              </div>

              {/* File Upload */}
              <div>
                <Label htmlFor="file-upload" className="text-sm font-semibold mb-2 block">
                  Attach Files (optional)
                </Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                  <input
                    type="file"
                    id="file-upload"
                    multiple
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <Upload className="h-10 w-10 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      PDF, DOC, DOCX, images, etc.
                    </p>
                  </label>
                </div>

                {/* Selected Files */}
                {selectedFiles.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <p className="text-sm font-semibold text-gray-700">Selected Files:</p>
                    {selectedFiles.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg"
                      >
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <FileText className="h-4 w-4 text-blue-600 flex-shrink-0" />
                          <span className="text-sm text-gray-700 truncate">{file.name}</span>
                          <span className="text-xs text-gray-500">
                            ({(file.size / 1024).toFixed(1)} KB)
                          </span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(index)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => navigate(`/student/courses/${courseId}`)}
                  disabled={submitting}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={submitting || (!submissionText.trim() && selectedFiles.length === 0)}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Submit Activity
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {alert && (
          <div className="fixed bottom-6 right-6 z-50">
            <AlertMessage type={alert.type} message={alert.message} onClose={() => setAlert(null)} />
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ActivitySubmit;
