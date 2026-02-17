import { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowLeft, BookOpen, Clock, FileText, HelpCircle, Award, Zap, 
  Palette, MessageCircle, Mic, UsersRound, ClipboardList, FileIcon,
  Upload, PlayCircle, CheckCircle, AlertCircle, Download, ExternalLink,
  Calendar
} from "lucide-react";
import { API_ENDPOINTS, apiGet } from "@/lib/api";

// Helper function to get activity type display
const getActivityTypeDisplay = (type: string) => {
  const typeMap: Record<string, { label: string; color: string; bgColor: string; Icon: any }> = {
    worksheet: { label: 'Worksheet', color: 'text-blue-600', bgColor: 'bg-blue-50 border-blue-200', Icon: FileText },
    quiz: { label: 'Quiz', color: 'text-purple-600', bgColor: 'bg-purple-50 border-purple-200', Icon: HelpCircle },
    exam: { label: 'Exam', color: 'text-red-600', bgColor: 'bg-red-50 border-red-200', Icon: Award },
    project: { label: 'Project', color: 'text-cyan-600', bgColor: 'bg-cyan-50 border-cyan-200', Icon: Zap },
    art: { label: 'Art', color: 'text-pink-600', bgColor: 'bg-pink-50 border-pink-200', Icon: Palette },
    storytime: { label: 'Storytime', color: 'text-orange-600', bgColor: 'bg-orange-50 border-orange-200', Icon: MessageCircle },
    recitation: { label: 'Recitation', color: 'text-green-600', bgColor: 'bg-green-50 border-green-200', Icon: Mic },
    participation: { label: 'Participation', color: 'text-indigo-600', bgColor: 'bg-indigo-50 border-indigo-200', Icon: UsersRound },
    other: { label: 'Other', color: 'text-gray-600', bgColor: 'bg-gray-50 border-gray-200', Icon: ClipboardList },
  };
  return typeMap[type] || typeMap['other'];
};

const StudentCourseManagement = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { courseId } = useParams();
  const location = useLocation();

  const [courseTitle, setCourseTitle] = useState<string | null>(null);
  const [courseCode, setCourseCode] = useState<string | null>(null);
  const [sectionName, setSectionName] = useState<string | null>(null);
  const [activities, setActivities] = useState<any[]>([]);
  const [learningMaterials, setLearningMaterials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"activities" | "materials">("activities");

  useEffect(() => {
    if (!isAuthenticated || user?.role !== "student") {
      navigate("/auth");
    }
  }, [isAuthenticated, user, navigate]);

  // Fetch course info and student data
  useEffect(() => {
    const fetchCourseInfo = async () => {
      if (!user?.id || !courseId) return;

      try {
        setLoading(true);

        // Get student info
        const studentRes = await apiGet(API_ENDPOINTS.STUDENT_BY_USER(user.id));
        const student = studentRes.data || studentRes.student || studentRes || null;
        
        if (!student) {
          console.error('Student record not found');
          return;
        }

        const sectionId = student.section_id || student.sectionId;
        const sectionNameFromStudent = student.section_name || student.sectionName;

        // Try to get course info from teacher assignments
        try {
          const taRes = await apiGet(`${API_ENDPOINTS.TEACHER_ASSIGNMENTS_FOR_STUDENT}?section_id=${sectionId}`);
          const assignments = taRes.data || taRes.assignments || taRes || [];
          const courseAssignment = assignments.find((a: any) => 
            String(a.id) === String(courseId) || String(a.subject?.id) === String(courseId)
          );

          if (courseAssignment) {
            const subj = courseAssignment.subject || courseAssignment.subject_info || {};
            setCourseTitle(subj.course_name || subj.title || subj.name || 'Course');
            setCourseCode(subj.course_code || subj.code || 'N/A');
          }
        } catch (err) {
          console.warn('Failed to fetch from teacher assignments', err);
        }

        // Fallback: try subjects endpoint
        try {
          const subjRes = await apiGet(API_ENDPOINTS.SUBJECT_BY_ID(courseId));
          const subj = subjRes.data || subjRes.subject || subjRes || null;
          if (subj && !courseTitle) {
            setCourseTitle(subj.course_name || subj.title || subj.name || 'Course');
            setCourseCode(subj.course_code || subj.code || 'N/A');
          }
        } catch (err) {
          console.warn('Failed to fetch subject', err);
        }

        setSectionName(sectionNameFromStudent || 'N/A');

        // Fetch activities with student's grades
        try {
          const actRes = await apiGet(
            `${API_ENDPOINTS.ACTIVITIES_STUDENT_GRADES}?course_id=${courseId}&student_id=${student.id}${sectionId ? `&section_id=${sectionId}` : ''}`
          );
          const actList = actRes.data || actRes || [];
          setActivities(Array.isArray(actList) ? actList.map((a: any) => ({
            id: a.id,
            title: a.title,
            type: a.type,
            description: a.description,
            max_score: a.max_score,
            due_at: a.due_at,
            student_grade: a.student_grade,
            submission_status: a.submission_status || (a.student_grade !== null ? 'graded' : 'pending'),
            grading_stats: a.grading_stats || {}
          })) : []);
        } catch (err) {
          console.error('Failed to fetch activities:', err);
          setActivities([]);
        }

        // Fetch learning materials
        try {
          const matRes = await apiGet(`${API_ENDPOINTS.LEARNING_MATERIALS}/subject/${courseId}`);
          if (matRes.success && Array.isArray(matRes.data)) {
            setLearningMaterials(matRes.data);
          }
        } catch (err) {
          console.error('Failed to fetch learning materials:', err);
          setLearningMaterials([]);
        }

      } catch (error) {
        console.error('Error fetching course info:', error);
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated && user?.role === 'student') {
      fetchCourseInfo();
    }
  }, [user, isAuthenticated, courseId, navigate]);

  if (!isAuthenticated) return null;

  // Helper to format relative time
  const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffDays < 0) return `in ${Math.abs(diffDays)} day${Math.abs(diffDays) !== 1 ? 's' : ''}`;
    if (diffDays === 0) return 'today';
    if (diffDays === 1) return 'yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  // Helper to get YouTube ID
  const getYouTubeId = (url: string) => {
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[7].length === 11) ? match[7] : null;
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col h-screen bg-gradient-to-b from-background to-muted/30">
        {/* Header */}
        <div className="border-b border-blue-100 px-8 py-6 shadow-sm bg-white">
          <Button variant="ghost" onClick={() => navigate("/student/courses")} className="mb-4 text-gray-600 hover:text-gray-900">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to My Courses
          </Button>

          <div className="space-y-2">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              {courseTitle || 'Course'}
            </h1>
            <p className="text-xl text-gray-600 font-semibold">
              Manage your Activities and Learning Materials for {courseTitle || 'this course'}
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-hidden p-6">
          <Card className="h-full border-0 shadow-lg flex flex-col overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-primary/8 to-accent/8 border-b border-blue-100 px-6 py-4">
              <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
                <TabsList className="grid w-full max-w-md grid-cols-2 bg-white border-2">
                  <TabsTrigger value="activities" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-cyan-500 data-[state=active]:text-white">
                    <ClipboardList className="h-4 w-4 mr-2" />
                    Activities ({activities.length})
                  </TabsTrigger>
                  <TabsTrigger value="materials" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-cyan-500 data-[state=active]:text-white">
                    <FileIcon className="h-4 w-4 mr-2" />
                    Materials ({learningMaterials.length})
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </CardHeader>

            <CardContent className="flex-1 overflow-hidden p-0">
              <div className="h-full overflow-y-auto">
                {loading ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
                      <p className="text-muted-foreground">Loading...</p>
                    </div>
                  </div>
                ) : (
                  <Tabs value={activeTab} className="h-full">
                    {/* Activities Tab */}
                    <TabsContent value="activities" className="h-full m-0 p-6">
                      {activities.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center">
                          <ClipboardList className="h-16 w-16 text-gray-300 mb-4" />
                          <p className="text-lg text-gray-500 font-medium">No activities yet</p>
                          <p className="text-sm text-gray-400 mt-2">Your teacher will post activities here</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {activities.map((activity) => {
                            const typeInfo = getActivityTypeDisplay(activity.type);
                            const isOverdue = activity.due_at && new Date(activity.due_at) < new Date() && activity.submission_status !== 'graded';
                            
                            return (
                              <div
                                key={activity.id}
                                className="p-5 border-2 border-gray-200 rounded-xl hover:shadow-lg hover:border-accent-300 transition-all duration-200 bg-white"
                              >
                                <div className="flex items-start justify-between mb-3">
                                  <div className="flex items-start gap-3 flex-1">
                                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${typeInfo.bgColor} border-2`}>
                                      <typeInfo.Icon className="h-6 w-6" />
                                    </div>
                                    <div className="flex-1">
                                      <h3 className="font-bold text-lg text-gray-900">{activity.title}</h3>
                                      <div className="flex items-center gap-2 mt-1">
                                        <Badge variant="outline" className={typeInfo.bgColor}>
                                          {typeInfo.label}
                                        </Badge>
                                        {activity.student_grade !== null && (
                                          <Badge className="bg-green-600 text-white">
                                            Graded: {activity.student_grade}/{activity.max_score}
                                          </Badge>
                                        )}
                                        {isOverdue && (
                                          <Badge variant="destructive">
                                            <AlertCircle className="h-3 w-3 mr-1" />
                                            Overdue
                                          </Badge>
                                        )}
                                      </div>
                                      {activity.description && (
                                        <p className="text-sm text-gray-600 mt-2 line-clamp-2">{activity.description}</p>
                                      )}
                                    </div>
                                  </div>
                                  
                                  {activity.due_at && (
                                    <div className="flex items-center gap-2 text-sm text-gray-500 flex-shrink-0 ml-4">
                                      <Clock className="h-4 w-4" />
                                      <span>Due {getRelativeTime(activity.due_at)}</span>
                                    </div>
                                  )}
                                </div>

                                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
                                  <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <span className="font-medium">Max Score:</span>
                                    <span className="font-bold text-blue-600">{activity.max_score}</span>
                                  </div>
                                  
                                  <div className="flex items-center gap-2">
                                    {/* Action Buttons */}
                                    {activity.student_grade === null && (activity.type === 'quiz' || activity.type === 'exam') && (
                                      <Button
                                        size="sm"
                                        onClick={() => navigate(`/student/courses/${courseId}/activities/${activity.id}/quiz`)}
                                        className="bg-gradient-to-r from-blue-600 to-blue-500 text-white hover:from-blue-700 hover:to-blue-600"
                                      >
                                        <PlayCircle className="h-4 w-4 mr-1" />
                                        Take {activity.type === 'exam' ? 'Exam' : 'Quiz'}
                                      </Button>
                                    )}
                                    
                                    {activity.student_grade === null && ['worksheet', 'project', 'art'].includes(activity.type) && (
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => navigate(`/student/courses/${courseId}/activities/${activity.id}/submit`)}
                                        className="border-blue-200 text-blue-700 hover:bg-blue-50"
                                      >
                                        <Upload className="h-4 w-4 mr-1" />
                                        Submit Work
                                      </Button>
                                    )}

                                    {activity.student_grade !== null && (
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        className="border-green-200 text-green-700 hover:bg-green-50"
                                      >
                                        <CheckCircle className="h-4 w-4 mr-1" />
                                        Graded
                                      </Button>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </TabsContent>

                    {/* Learning Materials Tab */}
                    <TabsContent value="materials" className="h-full m-0 p-6">
                      {learningMaterials.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center">
                          <FileIcon className="h-16 w-16 text-gray-300 mb-4" />
                          <p className="text-lg text-gray-500 font-medium">No learning materials yet</p>
                          <p className="text-sm text-gray-400 mt-2">Your teacher will share resources here</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {learningMaterials.map((material) => {
                            // Parse links
                            let links: string[] = [];
                            if (material.type === 'link' && material.link_url) {
                              try {
                                const parsed = JSON.parse(material.link_url);
                                links = Array.isArray(parsed) ? parsed : [material.link_url];
                              } catch {
                                links = [material.link_url];
                              }
                            }

                            // Get YouTube links
                            const youtubeLinks = links.map(link => ({
                              url: link,
                              youtubeId: getYouTubeId(link)
                            })).filter(item => item.youtubeId);

                            const MaterialIcon = material.type === 'file' ? FileIcon : material.type === 'link' ? ExternalLink : FileText;

                            return (
                              <div
                                key={material.id}
                                className="p-5 border-2 border-gray-200 rounded-xl hover:shadow-lg hover:border-blue-300 transition-all duration-200 bg-white"
                              >
                                <div className="flex gap-4">
                                  {/* Icon */}
                                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center flex-shrink-0">
                                    <MaterialIcon className="h-6 w-6 text-white" />
                                  </div>

                                  {/* Content */}
                                  <div className="flex-1 min-w-0">
                                    <h3 className="font-bold text-lg text-gray-900 mb-1">{material.title}</h3>
                                    {material.description && (
                                      <div 
                                        className="text-sm text-gray-600 mb-3 prose prose-sm max-w-none"
                                        dangerouslySetInnerHTML={{ __html: material.description }}
                                      />
                                    )}

                                    {/* Text Content */}
                                    {material.type === 'text' && material.content && (
                                      <div 
                                        className="prose prose-sm max-w-none p-4 bg-blue-50 rounded-lg border border-blue-200"
                                        dangerouslySetInnerHTML={{ __html: material.content }}
                                      />
                                    )}

                                    {/* File Downloads */}
                                    {material.type === 'file' && material.file_url && (
                                      <div className="space-y-2">
                                        {(() => {
                                          try {
                                            const files = JSON.parse(material.file_url);
                                            const fileNames = material.file_name ? JSON.parse(material.file_name) : [];
                                            return Array.isArray(files) ? files.map((fileUrl: string, idx: number) => (
                                              <a
                                                key={idx}
                                                href={fileUrl}
                                                download
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-2 p-3 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors group"
                                              >
                                                <Download className="h-4 w-4 text-blue-600" />
                                                <span className="text-sm font-medium text-blue-700 group-hover:underline flex-1">
                                                  {fileNames[idx] || `File ${idx + 1}`}
                                                </span>
                                              </a>
                                            )) : (
                                              <a
                                                href={material.file_url}
                                                download
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-2 p-3 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors group"
                                              >
                                                <Download className="h-4 w-4 text-blue-600" />
                                                <span className="text-sm font-medium text-blue-700 group-hover:underline">
                                                  {material.file_name || 'Download File'}
                                                </span>
                                              </a>
                                            );
                                          } catch {
                                            return (
                                              <a
                                                href={material.file_url}
                                                download
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-2 p-3 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors group"
                                              >
                                                <Download className="h-4 w-4 text-blue-600" />
                                                <span className="text-sm font-medium text-blue-700 group-hover:underline">
                                                  {material.file_name || 'Download File'}
                                                </span>
                                              </a>
                                            );
                                          }
                                        })()}
                                      </div>
                                    )}

                                    {/* Links */}
                                    {material.type === 'link' && links.length > 0 && (
                                      <div className="space-y-3">
                                        {/* YouTube Embeds */}
                                        {youtubeLinks.length > 0 && (
                                          <div className="space-y-3">
                                            {youtubeLinks.map((item, idx) => (
                                              <div key={idx} className="rounded-lg overflow-hidden border-2 border-blue-200 max-w-md">
                                                <iframe
                                                  width="100%"
                                                  height="200"
                                                  src={`https://www.youtube.com/embed/${item.youtubeId}`}
                                                  title="YouTube video"
                                                  frameBorder="0"
                                                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                  allowFullScreen
                                                  className="w-full"
                                                />
                                              </div>
                                            ))}
                                          </div>
                                        )}
                                        
                                        {/* Regular Links */}
                                        {links.filter(link => !getYouTubeId(link)).map((link, idx) => (
                                          <a
                                            key={idx}
                                            href={link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-2 p-3 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors group"
                                          >
                                            <ExternalLink className="h-4 w-4 text-blue-600" />
                                            <span className="text-sm font-medium text-blue-700 group-hover:underline truncate flex-1">
                                              {link}
                                            </span>
                                          </a>
                                        ))}
                                      </div>
                                    )}

                                    {/* Metadata */}
                                    <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-200 text-xs text-gray-500">
                                      <div className="flex items-center gap-1">
                                        <Calendar className="h-3 w-3" />
                                        <span>Posted {getRelativeTime(material.created_at)}</span>
                                      </div>
                                      <Badge variant="outline" className="text-xs">
                                        {material.type === 'file' ? 'File' : material.type === 'link' ? 'Link' : 'Text'}
                                      </Badge>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </TabsContent>
                  </Tabs>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default StudentCourseManagement;
