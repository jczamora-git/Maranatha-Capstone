import { useEffect, useMemo, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { API_ENDPOINTS, apiGet, apiPut } from "@/lib/api";
import { Brain, MessageSquare, RefreshCw, Search, TrendingUp } from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_SENTIMENT_API_URL || "http://localhost:5000";

type SentimentLabel = "positive" | "neutral" | "negative";

type FeedbackItem = {
  id: number;
  text: string;
  category: string;
  source: string;
  date: string;
  sentiment?: SentimentLabel;
  confidence?: number;
  responseText?: string;
  respondedAt?: string;
  responderName?: string;
};

const sentimentBadgeClass = (sentiment?: SentimentLabel) => {
  switch (sentiment) {
    case "positive":
      return "bg-emerald-500/10 text-emerald-700 border-emerald-200";
    case "negative":
      return "bg-rose-500/10 text-rose-700 border-rose-200";
    case "neutral":
      return "bg-amber-500/10 text-amber-700 border-amber-200";
    default:
      return "bg-muted text-muted-foreground border-border";
  }
};

const normalizeSentiment = (value?: string | null): SentimentLabel | undefined => {
  if (!value) return undefined;
  const normalized = value.toLowerCase();
  if (normalized === "positive" || normalized === "negative" || normalized === "neutral") {
    return normalized as SentimentLabel;
  }
  return undefined;
};

const AdminSentimentAnalytics = () => {
  const [feedbackItems, setFeedbackItems] = useState<FeedbackItem[]>([]);
  const [search, setSearch] = useState("");
  const [sentimentFilter, setSentimentFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [apiStatus, setApiStatus] = useState<"checking" | "online" | "offline">("checking");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [responseDrafts, setResponseDrafts] = useState<Record<number, string>>({});
  const [savingResponseIds, setSavingResponseIds] = useState<Record<number, boolean>>({});

  useEffect(() => {
    let active = true;
    const checkStatus = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/health`);
        if (!active) return;
        setApiStatus(res.ok ? "online" : "offline");
      } catch {
        if (!active) return;
        setApiStatus("offline");
      }
    };

    checkStatus();
    return () => {
      active = false;
    };
  }, []);

  const loadFeedback = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiGet(API_ENDPOINTS.FEEDBACK);
      const list = response?.data ?? [];
      const mapped: FeedbackItem[] = (Array.isArray(list) ? list : []).map((item: any) => {
        const sourceName = item.first_name || item.last_name
          ? `${item.first_name ?? ""} ${item.last_name ?? ""}`.trim()
          : item.role || "Student";
        return {
          id: item.id,
          text: item.message ?? "",
          category: item.category ?? "General",
          source: sourceName || "Student",
          date: item.created_at ? new Date(item.created_at).toLocaleDateString() : "",
          sentiment: normalizeSentiment(item.sentiment),
          confidence: item.confidence !== null && item.confidence !== undefined ? Number(item.confidence) : undefined,
          responseText: item.response_text ?? undefined,
          respondedAt: item.responded_at ?? undefined,
          responderName: item.response_text ? "System Admin" : undefined,
        };
      });

      setFeedbackItems(mapped);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load feedback.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadFeedback();
  }, []);

  const summary = useMemo(() => {
    const total = feedbackItems.length;
    const positive = feedbackItems.filter((item) => item.sentiment === "positive").length;
    const neutral = feedbackItems.filter((item) => item.sentiment === "neutral").length;
    const negative = feedbackItems.filter((item) => item.sentiment === "negative").length;
    const analyzed = positive + neutral + negative;

    return {
      total,
      positive,
      neutral,
      negative,
      analyzed,
      positiveRate: analyzed ? Math.round((positive / analyzed) * 100) : 0,
      neutralRate: analyzed ? Math.round((neutral / analyzed) * 100) : 0,
      negativeRate: analyzed ? Math.round((negative / analyzed) * 100) : 0,
    };
  }, [feedbackItems]);

  const filteredFeedback = useMemo(() => {
    return feedbackItems.filter((item) => {
      const matchesSearch = item.text.toLowerCase().includes(search.toLowerCase());
      const matchesSentiment = sentimentFilter === "all" || item.sentiment === sentimentFilter;
      const matchesCategory = categoryFilter === "all" || item.category === categoryFilter;
      return matchesSearch && matchesSentiment && matchesCategory;
    });
  }, [feedbackItems, search, sentimentFilter, categoryFilter]);

  const runBatchAnalysis = async () => {
    setIsAnalyzing(true);
    setError(null);

    if (feedbackItems.length === 0) {
      setError("No feedback available to analyze.");
      setIsAnalyzing(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/predict/batch`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ texts: feedbackItems.map((item) => item.text) }),
      });

      if (!response.ok) {
        throw new Error("Unable to reach sentiment service.");
      }

      const data = await response.json();
      if (!data || !Array.isArray(data.results)) {
        throw new Error("Unexpected response from sentiment service.");
      }

      const updated = feedbackItems.map((item, index) => ({
        ...item,
        sentiment: normalizeSentiment(data.results[index]?.sentiment) ?? item.sentiment,
        confidence: data.results[index]?.confidence ?? item.confidence,
      }));

      setFeedbackItems(updated);

      await Promise.all(
        updated.map((item, index) => {
          const result = data.results[index];
          if (!result) return Promise.resolve();
          return apiPut(API_ENDPOINTS.FEEDBACK_SENTIMENT_UPDATE(item.id), {
            sentiment: normalizeSentiment(result.sentiment) ?? result.sentiment,
            confidence: result.confidence,
            probabilities: result.probabilities ?? {},
          }).catch(() => undefined);
        })
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : "Sentiment analysis failed.";
      setError(message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const updateResponseDraft = (id: number, value: string) => {
    setResponseDrafts((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleSaveResponse = async (item: FeedbackItem) => {
    const responseText = (responseDrafts[item.id] ?? item.responseText ?? "").trim();
    if (!responseText) {
      setError("Response text cannot be empty.");
      return;
    }

    setSavingResponseIds((prev) => ({
      ...prev,
      [item.id]: true,
    }));
    setError(null);

    try {
      await apiPut(API_ENDPOINTS.FEEDBACK_RESPONSE_UPDATE(item.id), {
        response_text: responseText,
      });

      setFeedbackItems((prev) =>
        prev.map((entry) =>
          entry.id === item.id
            ? {
                ...entry,
                responseText,
                respondedAt: new Date().toISOString(),
                responderName: entry.responderName,
              }
            : entry
        )
      );
      setResponseDrafts((prev) => ({
        ...prev,
        [item.id]: responseText,
      }));
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to save response.";
      setError(message);
    } finally {
      setSavingResponseIds((prev) => ({
        ...prev,
        [item.id]: false,
      }));
    }
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8 space-y-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Brain className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Sentiment Analytics</h1>
                <p className="text-muted-foreground">Track feedback tone across campus services.</p>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Badge className={apiStatus === "online" ? "bg-emerald-500 text-white" : "bg-rose-500 text-white"}>
              {apiStatus === "online" ? "Model Online" : apiStatus === "offline" ? "Model Offline" : "Checking"}
            </Badge>
            <Button onClick={runBatchAnalysis} disabled={isAnalyzing} className="gap-2">
              <RefreshCw className={`h-4 w-4 ${isAnalyzing ? "animate-spin" : ""}`} />
              {isAnalyzing ? "Analyzing" : "Run Batch Analysis"}
            </Button>
          </div>
        </div>

        {error && (
          <Card className="border-rose-200 bg-rose-50/50">
            <CardContent className="py-4 text-sm text-rose-700">{error}</CardContent>
          </Card>
        )}

        <div className="grid gap-6 lg:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Feedback</CardTitle>
              <CardDescription>Collected entries</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{summary.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Positive Rate</CardTitle>
              <CardDescription>Analyzed feedback</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-end gap-2">
                <span className="text-3xl font-bold text-emerald-600">{summary.positiveRate}%</span>
                <span className="text-sm text-muted-foreground">{summary.positive} positive</span>
              </div>
              <Progress value={summary.positiveRate} className="h-2" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Neutral Rate</CardTitle>
              <CardDescription>Analyzed feedback</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-end gap-2">
                <span className="text-3xl font-bold text-amber-600">{summary.neutralRate}%</span>
                <span className="text-sm text-muted-foreground">{summary.neutral} neutral</span>
              </div>
              <Progress value={summary.neutralRate} className="h-2" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Negative Rate</CardTitle>
              <CardDescription>Analyzed feedback</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-end gap-2">
                <span className="text-3xl font-bold text-rose-600">{summary.negativeRate}%</span>
                <span className="text-sm text-muted-foreground">{summary.negative} negative</span>
              </div>
              <Progress value={summary.negativeRate} className="h-2" />
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <MessageSquare className="h-5 w-5" />
                Feedback Stream
              </CardTitle>
              <CardDescription>Filter, review, and prioritize the latest insights.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col lg:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="h-4 w-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                  <Input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search feedback"
                    className="pl-9"
                  />
                </div>
                <Select value={sentimentFilter} onValueChange={setSentimentFilter}>
                  <SelectTrigger className="w-full lg:w-44">
                    <SelectValue placeholder="Sentiment" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All sentiment</SelectItem>
                    <SelectItem value="positive">Positive</SelectItem>
                    <SelectItem value="neutral">Neutral</SelectItem>
                    <SelectItem value="negative">Negative</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-full lg:w-44">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All categories</SelectItem>
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
              </div>

              <div className="space-y-3">
                {isLoading ? (
                  <div className="rounded-xl border border-dashed border-border p-4 text-sm text-muted-foreground">
                    Loading feedback...
                  </div>
                ) : filteredFeedback.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-border p-4 text-sm text-muted-foreground">
                    No feedback entries found.
                  </div>
                ) : (
                  filteredFeedback.map((item) => (
                    <div key={item.id} className="border border-border rounded-xl p-4 space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>{item.category}</span>
                          <span>•</span>
                          <span>{item.source}</span>
                          <span>•</span>
                          <span>{item.date}</span>
                        </div>
                        <Badge className={sentimentBadgeClass(item.sentiment)}>
                          {item.sentiment ? item.sentiment : "Unanalyzed"}
                        </Badge>
                      </div>
                      <p className="text-sm leading-relaxed">{item.text}</p>
                      {item.confidence !== undefined && (
                        <p className="text-xs text-muted-foreground">Confidence: {(item.confidence * 100).toFixed(1)}%</p>
                      )}
                      {item.responseText ? (
                        <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-4 space-y-2">
                          <div className="flex items-center justify-between text-xs text-emerald-700">
                            <span className="font-semibold">Admin Response</span>
                            <span>System Admin</span>
                          </div>
                          <p className="text-sm text-emerald-900 leading-relaxed">{item.responseText}</p>
                        </div>
                      ) : (
                        <div className="rounded-lg border border-border bg-muted/20 p-3 space-y-2">
                          <p className="text-xs font-semibold text-muted-foreground">Admin Response</p>
                          <p className="text-sm text-muted-foreground">No response yet.</p>
                          <Textarea
                            value={responseDrafts[item.id] ?? ""}
                            onChange={(event) => updateResponseDraft(item.id, event.target.value)}
                            placeholder="Write a response for the student"
                            rows={3}
                          />
                          <div className="flex justify-end">
                            <Button
                              size="sm"
                              onClick={() => handleSaveResponse(item)}
                              disabled={savingResponseIds[item.id]}
                            >
                              {savingResponseIds[item.id] ? "Saving..." : "Save response"}
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <TrendingUp className="h-5 w-5" />
                  Insight Highlights
                </CardTitle>
                <CardDescription>Actionable opportunities for admins.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="rounded-xl border border-border p-3">
                  <p className="font-medium">Payment receipts timing</p>
                  <p className="text-muted-foreground">Delay reports increased this week. Check receipt batch jobs.</p>
                </div>
                <div className="rounded-xl border border-border p-3">
                  <p className="font-medium">Enrollment clarity</p>
                  <p className="text-muted-foreground">Positive sentiment remains high for enrollment steps.</p>
                </div>
                <div className="rounded-xl border border-border p-3">
                  <p className="font-medium">Notifications latency</p>
                  <p className="text-muted-foreground">Grades notifications trending negative. Review push queues.</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Model Snapshot</CardTitle>
                <CardDescription>Current classifier details.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Model type</span>
                  <span className="font-medium">CNN + BiLSTM</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">API URL</span>
                  <span className="font-medium truncate max-w-[180px]">{API_BASE_URL}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Analyzed items</span>
                  <span className="font-medium">{summary.analyzed} / {summary.total}</span>
                </div>
                <div className="rounded-lg bg-muted/40 p-3 text-xs text-muted-foreground">
                  Run batch analysis after importing new feedback to refresh sentiment scores.
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminSentimentAnalytics;
