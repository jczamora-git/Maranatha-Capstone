import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { DashboardLayout } from "@/components/DashboardLayout";
import { AlertCircle, CheckCircle2, Clock, XCircle, Mail, ChevronLeft, FileCheck, Upload, Eye } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { apiGet, API_ENDPOINTS } from "@/lib/api";

interface EnrollmentStatus {
  id: number;
  confirmation_number: string;
  status: "Pending" | "Incomplete" | "Under Review" | "Approved" | "Rejected";
  enrollment_type?: string;
  submitted_date: string;
  first_reviewed_date: string | null;
  approved_date: string | null;
  rejected_date: string | null;
  student_name: string;
  grade_level: string;
  documents: {
    type: string;
    status: "Verified" | "Not Uploaded" | "Pending" | "Rejected";
    uploaded?: string;
    verified?: string;
  }[];
  timeline: Array<{
    date: string;
    event: string;
  }>;
  next_steps: string;
  rejection_reason?: string;
  created_student_id?: number;
}

const statusColors: Record<string, { bg: string; text: string; icon: React.ReactNode; badgeBg: string; badgeText: string }> = {
  Pending: {
    bg: "bg-yellow-50 border-yellow-300",
    text: "text-yellow-900",
    icon: <Clock className="w-6 h-6 text-yellow-600" />,
    badgeBg: "bg-yellow-100",
    badgeText: "text-yellow-800",
  },
  Incomplete: {
    bg: "bg-orange-50 border-orange-300",
    text: "text-orange-900",
    icon: <AlertCircle className="w-6 h-6 text-orange-600" />,
    badgeBg: "bg-orange-100",
    badgeText: "text-orange-800",
  },
  "Under Review": {
    bg: "bg-purple-50 border-purple-300",
    text: "text-purple-900",
    icon: <Clock className="w-6 h-6 text-purple-600" />,
    badgeBg: "bg-purple-100",
    badgeText: "text-purple-800",
  },
  Approved: {
    bg: "bg-green-50 border-green-300",
    text: "text-green-900",
    icon: <CheckCircle2 className="w-6 h-6 text-green-600" />,
    badgeBg: "bg-green-100",
    badgeText: "text-green-800",
  },
  Rejected: {
    bg: "bg-red-50 border-red-300",
    text: "text-red-900",
    icon: <XCircle className="w-6 h-6 text-red-600" />,
    badgeBg: "bg-red-100",
    badgeText: "text-red-800",
  },
};

const EnrollmentStatus = () => {
  const navigate = useNavigate();
  const { enrollmentId } = useParams<{ enrollmentId: string }>();
  const { user } = useAuth();
  const [enrollment, setEnrollment] = useState<EnrollmentStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }

    const fetchEnrollmentStatus = async () => {
      try {
        const response = await apiGet(API_ENDPOINTS.ENROLLMENT_STATUS(enrollmentId || ''));

        if (response.enrollment) {
          setEnrollment(response.enrollment);
        } else {
          throw new Error(response.message || "No enrollment data received");
        }
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Failed to load enrollment status");
        navigate("/enrollment/my-enrollments");
      } finally {
        setLoading(false);
      }
    };

    fetchEnrollmentStatus();
  }, [enrollmentId, user, navigate]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading enrollment status...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!enrollment) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
          <div className="max-w-4xl mx-auto">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>Enrollment not found. Please try again or contact support.</AlertDescription>
            </Alert>
            <Button onClick={() => navigate("/enrollment/my-enrollments")} className="mt-4">
              Back to My Enrollments
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const statusInfo = statusColors[enrollment.status] || statusColors.Pending;

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6">
        <div className="max-w-5xl mx-auto">
          {/* Back Button */}
          <Button
            variant="ghost"
            onClick={() => navigate("/enrollment/my-enrollments")}
            className="mb-8 -ml-2 hover:bg-white/80"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Back to My Enrollments
          </Button>

          {/* Status Header Card */}
          <Card className={`mb-8 border-2 shadow-lg ${statusInfo.bg}`}>
            <CardContent className="p-8">
              <div className="flex items-start justify-between gap-6">
                <div className="flex items-start gap-4 flex-1">
                  <div className="mt-1 p-3 bg-white rounded-lg shadow-sm">{statusInfo.icon}</div>
                  <div className="flex-1">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">Enrollment Status</h1>
                    <div className="flex items-center gap-3 mb-3">
                      <Badge className={`${statusInfo.badgeBg} ${statusInfo.badgeText} text-lg px-4 py-1 rounded-full font-semibold`}>
                        {enrollment.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">
                      <strong>Confirmation ID:</strong> {enrollment.confirmation_number}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      <strong>Submitted:</strong> {new Date(enrollment.submitted_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Applicant Information */}
          <Card className="mb-8 shadow-md">
            <CardHeader className="border-b border-gray-200">
              <CardTitle className="text-xl">Applicant Information</CardTitle>
            </CardHeader>
            <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <p className="text-sm text-gray-500 font-semibold uppercase tracking-wide">Enrollment Type</p>
                <p className="text-lg font-bold text-gray-900 mt-2">{enrollment.enrollment_type || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 font-semibold uppercase tracking-wide">Grade Level</p>
                <p className="text-lg font-bold text-gray-900 mt-2">{enrollment.grade_level}</p>
              </div>
            </CardContent>
          </Card>

          {/* Status Timeline */}
          <Card className="mb-8 shadow-md">
            <CardHeader className="border-b border-gray-200">
              <CardTitle className="text-xl">Status Timeline</CardTitle>
            </CardHeader>
              <CardContent className="p-6 space-y-4">
                {enrollment.submitted_date && (
                  <div>
                    <p className="text-sm text-gray-500 font-semibold uppercase tracking-wide">Submitted</p>
                    <p className="text-sm text-gray-700 mt-2">{new Date(enrollment.submitted_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                  </div>
                )}
                {enrollment.first_reviewed_date && (
                  <div>
                    <p className="text-sm text-gray-500 font-semibold uppercase tracking-wide">First Reviewed</p>
                    <p className="text-sm text-gray-700 mt-2">{new Date(enrollment.first_reviewed_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                  </div>
                )}
                {enrollment.approved_date && (
                  <div>
                    <p className="text-sm text-gray-500 font-semibold uppercase tracking-wide">Approved</p>
                    <p className="text-sm text-gray-700 mt-2">{new Date(enrollment.approved_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                  </div>
                )}
              </CardContent>
            </Card>

          {/* Timeline */}
          <Card className="mb-8 shadow-md">
            <CardHeader className="border-b border-gray-200">
              <CardTitle className="text-xl">Application Progress</CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="space-y-6">
                {enrollment.timeline.map((event, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-4 h-4 bg-blue-600 rounded-full mt-1.5 shadow-sm"></div>
                      {index < enrollment.timeline.length - 1 && (
                        <div className="w-1 h-16 bg-gradient-to-b from-blue-600 to-blue-200 mt-2"></div>
                      )}
                    </div>
                    <div className="pb-4 flex-1">
                      <p className="font-semibold text-gray-900 text-lg">{event.event}</p>
                      <p className="text-sm text-gray-500 mt-1">
                        {new Date(event.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Documents Status */}
          {enrollment.documents && enrollment.documents.length > 0 && (
            <Card className="mb-8 shadow-md">
              <CardHeader className="border-b border-gray-200">
                <CardTitle className="text-xl">Required Documents</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-3">
                  {(enrollment.documents || []).map((doc, index) => {
                    const docStatusConfig = {
                      "Verified": { bg: "bg-green-50", border: "border-green-200", badge: "bg-green-100 text-green-800", icon: <FileCheck className="w-5 h-5 text-green-600" /> },
                      "Not Uploaded": { bg: "bg-red-50", border: "border-red-200", badge: "bg-red-100 text-red-800", icon: <Upload className="w-5 h-5 text-red-600" /> },
                      "Pending": { bg: "bg-yellow-50", border: "border-yellow-200", badge: "bg-yellow-100 text-yellow-800", icon: <Clock className="w-5 h-5 text-yellow-600" /> },
                      "Rejected": { bg: "bg-orange-50", border: "border-orange-200", badge: "bg-orange-100 text-orange-800", icon: <XCircle className="w-5 h-5 text-orange-600" /> },
                    };
                    const config = docStatusConfig[doc.status] || docStatusConfig.Pending;
                    
                    return (
                      <div key={index} className={`p-4 rounded-lg border-2 ${config.bg} ${config.border}`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-start gap-3 flex-1">
                            <div className="mt-1">{config.icon}</div>
                            <div className="flex-1">
                              <p className="font-semibold text-gray-900">{doc.type}</p>
                              <div className="flex items-center gap-2 mt-2">
                                <Badge className={`${config.badge} text-xs px-3 py-1 rounded-full font-medium`}>
                                  {doc.status}
                                </Badge>
                              </div>
                              {doc.uploaded && (
                                <p className="text-xs text-gray-600 mt-2">
                                  Uploaded: {new Date(doc.uploaded).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                                </p>
                              )}
                              {doc.verified && (
                                <p className="text-xs text-green-700 font-semibold mt-1">
                                  ✓ Verified: {new Date(doc.verified).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                                </p>
                              )}
                            </div>
                          </div>
                          {doc.status === "Verified" && (
                            <div className="ml-4">
                              <CheckCircle2 className="w-6 h-6 text-green-600" />
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Next Steps */}
          <Card className="mb-8 shadow-md">
            <CardHeader className="border-b border-gray-200">
              <CardTitle className="text-xl">Next Steps</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="bg-teal-50 border-l-4 border-teal-500 p-4 rounded">
                <p className="text-gray-800 text-base leading-relaxed">{enrollment.next_steps}</p>
              </div>
            </CardContent>
          </Card>

          {/* Rejection Reason (if applicable) */}
          {enrollment.status === "Rejected" && enrollment.rejection_reason && (
            <Card className="mb-8 border-2 border-red-300 bg-red-50 shadow-md">
              <CardHeader className="border-b border-red-300">
                <CardTitle className="text-xl flex items-center gap-2 text-red-900">
                  <XCircle className="w-5 h-5" />
                  Rejection Reason
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <p className="text-gray-800 bg-white p-4 rounded-lg border-l-4 border-red-500">{enrollment.rejection_reason}</p>
              </CardContent>
            </Card>
          )}

          {/* Approved Information (if applicable) */}
          {enrollment.status === "Approved" && enrollment.created_student_id && (
            <Alert className="mb-8 bg-green-50 border-2 border-green-300 shadow-md">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <AlertDescription className="text-green-800 text-base ml-4">
                <strong className="block mb-2">🎉 Congratulations!</strong>
                Your child's enrollment has been approved. You will receive login credentials via email. Please check your email for next steps and important school information.
              </AlertDescription>
            </Alert>
          )}

          {/* Contact Support */}
          <Card className="shadow-md">
            <CardContent className="p-8">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Mail className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-gray-900 text-lg">Have Questions?</p>
                  <p className="text-gray-700 text-sm mt-2 leading-relaxed">
                    If you need to update your enrollment or have questions, please contact us at <strong>enrollment@maranatha-school.edu</strong> or call <strong>(555) 123-4567</strong>. We're here to help!
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="mt-8 flex gap-4 justify-center">
            <Button
              onClick={() => navigate("/enrollment/my-enrollments")}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-2 rounded-lg shadow-md font-semibold transition-all"
            >
              <Eye className="w-4 h-4 mr-2" />
              Back to All Enrollments
            </Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default EnrollmentStatus;
