import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { API_ENDPOINTS, apiGet, apiPost } from "@/lib/api";
import { MessageSquare, Sparkles } from "lucide-react";

type SubmittedFeedback = {
  id: number;
  text: string;
  category: string;
  date: string;
  responseText?: string;
  respondedAt?: string;
};

const StudentFeedbackSentiment = () => {
  const [text, setText] = useState("");
  const [category, setCategory] = useState("Payments");
  const [title, setTitle] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [recentFeedback, setRecentFeedback] = useState<SubmittedFeedback[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadRecentFeedback = async () => {
    try {
      const response = await apiGet(API_ENDPOINTS.FEEDBACK_MY);
      const list = response?.data ?? [];
      const mapped: SubmittedFeedback[] = (Array.isArray(list) ? list : []).slice(0, 5).map((item: any) => ({
        id: item.id,
        text: item.message ?? "",
        category: item.category ?? "General",
        date: item.created_at ? new Date(item.created_at).toISOString().slice(0, 10) : "",
        responseText: item.response_text ?? undefined,
        respondedAt: item.responded_at ?? undefined,
      }));

      setRecentFeedback(mapped);
    } catch {
      // ignore load errors for now
    }
  };

  useEffect(() => {
    loadRecentFeedback();
  }, []);

  const handleSubmit = async () => {
    if (!text.trim()) {
      setError("Please add a message before submitting.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await apiPost(API_ENDPOINTS.FEEDBACK, {
        title: title.trim() || null,
        message: text,
        category,
      });

      setText("");
      setTitle("");
      await loadRecentFeedback();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to submit feedback.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8 space-y-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                <MessageSquare className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Feedback Reviews</h1>
                <p className="text-muted-foreground">Share your feedback about campus services.</p>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <Card className="border-rose-200 bg-rose-50/50">
            <CardContent className="py-4 text-sm text-rose-700">{error}</CardContent>
          </Card>
        )}

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Sparkles className="h-5 w-5" />
                Write Feedback
              </CardTitle>
              <CardDescription>Describe your experience to help us improve.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Short title (optional)"
              />
              <div className="grid gap-3 lg:grid-cols-2">
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Payments">Payments</SelectItem>
                    <SelectItem value="Enrollments">Enrollments</SelectItem>
                    <SelectItem value="Grades">Grades</SelectItem>
                    <SelectItem value="Events">Events</SelectItem>
                    <SelectItem value="Facilities">Facilities</SelectItem>
                    <SelectItem value="Teachers">Teachers</SelectItem>
                    <SelectItem value="Learning Management System">Learning Management System</SelectItem>
                    <SelectItem value="RFID Student Gate System">RFID Student Gate System</SelectItem>
                    <SelectItem value="Notifications">Notifications</SelectItem>
                    <SelectItem value="Others">Others</SelectItem>
                  </SelectContent>
                </Select>
                <Input placeholder="Course or service (optional)" />
              </div>
              <Textarea
                value={text}
                onChange={(event) => setText(event.target.value)}
                placeholder="Share your thoughts"
                rows={6}
              />
              <div className="flex flex-wrap gap-3">
                <Button variant="outline" onClick={handleSubmit} disabled={!text.trim() || isSubmitting}>
                  Submit feedback
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Feedback</CardTitle>
            <CardDescription>Your latest submissions (local preview).</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentFeedback.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border p-4 text-sm text-muted-foreground">
                No feedback submitted yet.
              </div>
            ) : (
              recentFeedback.map((entry) => (
                <div key={entry.id} className="rounded-xl border border-border p-4 space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-muted-foreground">
                    <span>{entry.category}</span>
                    <span>{entry.date}</span>
                  </div>
                  <p className="text-sm">{entry.text}</p>
                  {entry.responseText ? (
                    <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-4 space-y-2">
                      <div className="flex items-center justify-between text-xs text-emerald-700">
                        <span className="font-semibold">Admin Response</span>
                        <span>System Admin</span>
                      </div>
                      <p className="text-sm text-emerald-900 leading-relaxed">{entry.responseText}</p>
                    </div>
                  ) : (
                    <div className="rounded-lg border border-border bg-muted/20 p-3 text-sm">
                      <p className="text-xs font-semibold text-muted-foreground">Admin Response</p>
                      <p className="mt-1 text-muted-foreground">No response yet.</p>
                    </div>
                  )}
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default StudentFeedbackSentiment;
