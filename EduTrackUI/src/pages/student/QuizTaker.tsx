import { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  ArrowRight,
  Clock, 
  Send,
  CheckCircle2,
  AlertCircle,
  Timer,
  BookOpen,
  Save
} from "lucide-react";
import { API_ENDPOINTS, apiGet, apiPost } from "@/lib/api";
import { AlertMessage } from "@/components/AlertMessage";
import { Checkbox } from "@/components/ui/checkbox";

interface Question {
  id: number;
  question_text: string;
  question_type: string;
  points: number;
  order_num: number;
  image_url?: string;
  choices?: Array<{
    id: number;
    choice_text: string;
    order_num: number;
  }>;
}

interface Activity {
  id: number;
  title: string;
  description: string;
  max_score: number;
  due_at: string;
  type: string;
}

interface QuizSettings {
  time_limit?: number;
  max_attempts?: number;
  shuffle_questions?: boolean;
  shuffle_choices?: boolean;
  show_correct_answers?: boolean;
  pass_threshold?: number;
}

interface StudentAnswer {
  question_id: number;
  choice_id?: number;
  answer_text?: string;
  selected_choices?: number[]; // For multiple_select
  matching_pairs?: { [leftIndex: number]: number }; // For matching type
}

const QuizTaker = () => {
  const { courseId, activityId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [activity, setActivity] = useState<Activity | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [settings, setSettings] = useState<QuizSettings>({});
  const [answers, setAnswers] = useState<{ [questionId: number]: StudentAnswer }>({});
  const [matchingData, setMatchingData] = useState<{ [questionId: number]: { leftItems: any[]; rightItems: any[] } }>({});
  const [selectedLeftItems, setSelectedLeftItems] = useState<{ [questionId: number]: number | null }>({});
  const [dragState, setDragState] = useState<{ questionId: number; leftIndex: number; mouseX: number; mouseY: number } | null>(null);
  const [linePositions, setLinePositions] = useState<{ [key: string]: { x1: number; y1: number; x2: number; y2: number } }>({});
  const [errorAnimation, setErrorAnimation] = useState<{ questionId: number } | null>(null);
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [autoSaveStatus, setAutoSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved');
  
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Update line positions for matching questions
  useEffect(() => {
    if (!quizStarted || !questions[currentQuestionIndex]) return;
    
    const currentQuestion = questions[currentQuestionIndex];
    if (currentQuestion.question_type !== 'matching') return;
    
    const updateLinePositions = () => {
      const newPositions: { [key: string]: { x1: number; y1: number; x2: number; y2: number } } = {};
      const gridContainer = document.querySelector('.matching-grid');
      if (!gridContainer) return;
      
      const gridRect = gridContainer.getBoundingClientRect();
      const answer = answers[currentQuestion.id];
      const pairs = answer?.matching_pairs || {};
      
      Object.entries(pairs).forEach(([leftIdx, rightIdx]) => {
        const leftCircle = document.getElementById(`match-left-${currentQuestion.id}-${leftIdx}`);
        const rightCircle = document.getElementById(`match-right-${currentQuestion.id}-${rightIdx}`);
        
        if (leftCircle && rightCircle) {
          const leftRect = leftCircle.getBoundingClientRect();
          const rightRect = rightCircle.getBoundingClientRect();
          
          const x1 = leftRect.left + leftRect.width  / 2 - gridRect.left;
          const y1 = leftRect.top + leftRect.height / 2 - gridRect.top;
          const x2 = rightRect.left + rightRect.width / 2 - gridRect.left;
          const y2 = rightRect.top + rightRect.height / 2 - gridRect.top;
          
          newPositions[`${leftIdx}-${rightIdx}`] = { x1, y1, x2, y2 };
        }
      });
      
      setLinePositions(newPositions);
    };
    
    const timer = setTimeout(updateLinePositions, 50);
    
    // Also update on window resize
    window.addEventListener('resize', updateLinePositions);
    
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updateLinePositions);
    };
  }, [answers, currentQuestionIndex, questions, quizStarted]);

  useEffect(() => {
    loadQuizData();
    return () => {
      if (autoSaveTimerRef.current) clearInterval(autoSaveTimerRef.current);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [activityId]);

  const loadQuizData = async () => {
    try {
      setLoading(true);

      // Fetch activity details
      const activityRes = await apiGet(`${API_ENDPOINTS.ACTIVITIES}/${activityId}`);
      if (activityRes.success && activityRes.data) {
        setActivity(activityRes.data);
      }

      // Fetch questions
      const questionsRes = await apiGet(`${API_ENDPOINTS.ACTIVITIES}/${activityId}/questions`);
      if (questionsRes.success && questionsRes.data) {
        let questionsList = questionsRes.data;
        
        // Shuffle questions if setting enabled
        const settingsRes = await apiGet(`${API_ENDPOINTS.ACTIVITIES}/${activityId}/settings`);
        if (settingsRes.success && settingsRes.data) {
          setSettings(settingsRes.data);
          
          if (settingsRes.data.shuffle_questions) {
            questionsList = [...questionsList].sort(() => Math.random() - 0.5);
          }

          // Shuffle choices if setting enabled
          if (settingsRes.data.shuffle_choices) {
            questionsList = questionsList.map((q: Question) => {
              if (q.choices && q.choices.length > 0) {
                return {
                  ...q,
                  choices: [...q.choices].sort(() => Math.random() - 0.5)
                };
              }
              return q;
            });
          }
        }

        // Prepare matching questions data with shuffled right column
        const matchingDataMap: { [questionId: number]: { leftItems: any[]; rightItems: any[] } } = {};
        questionsList.forEach((q: Question) => {
          if (q.question_type === 'matching' && q.choices) {
            const leftItems: any[] = [];
            const rightItems: any[] = [];
            
            q.choices.forEach((choice, index) => {
              const [left, right] = choice.choice_text.split('::');
              leftItems.push({ index, text: left.trim(), originalIndex: index });
              rightItems.push({ index, text: right.trim(), originalIndex: index });
            });
            
            // Shuffle right items
            const shuffledRight = [...rightItems].sort(() => Math.random() - 0.5);
            
            matchingDataMap[q.id] = { leftItems, rightItems: shuffledRight };
          }
        });
        setMatchingData(matchingDataMap);

        setQuestions(questionsList);
      }

    } catch (error) {
      console.error('Error loading quiz:', error);
      setAlert({ type: 'error', message: 'Failed to load quiz' });
    } finally {
      setLoading(false);
    }
  };

  const startQuiz = async () => {
    try {
      // Call start API to log quiz attempt
      await apiGet(`${API_ENDPOINTS.ACTIVITIES}/${activityId}/quiz/start`);
      
      setQuizStarted(true);

      // Start timer if time limit is set
      if (settings.time_limit) {
        setTimeRemaining(settings.time_limit * 60); // Convert minutes to seconds
        
        timerRef.current = setInterval(() => {
          setTimeRemaining((prev) => {
            if (prev === null || prev <= 1) {
              handleSubmitQuiz();
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }

      // Start auto-save timer (every 30 seconds)
      autoSaveTimerRef.current = setInterval(() => {
        autoSaveAnswers();
      }, 30000);

    } catch (error) {
      console.error('Error starting quiz:', error);
      setAlert({ type: 'error', message: 'Failed to start quiz' });
    }
  };

  const autoSaveAnswers = async () => {
    if (Object.keys(answers).length === 0) return;

    try {
      setAutoSaveStatus('saving');
      
      // Save each answer
      for (const [questionId, answer] of Object.entries(answers)) {
        await apiPost(`${API_ENDPOINTS.ACTIVITIES}/${activityId}/quiz/save-answer`, {
          question_id: Number(questionId),
          choice_id: answer.choice_id,
          answer_text: answer.answer_text,
          selected_choices: answer.selected_choices
        });
      }

      setAutoSaveStatus('saved');
    } catch (error) {
      console.error('Auto-save error:', error);
      setAutoSaveStatus('unsaved');
    }
  };

  const handleAnswerChange = (questionId: number, answer: Partial<StudentAnswer>) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: {
        question_id: questionId,
        ...prev[questionId],
        ...answer
      }
    }));
    setAutoSaveStatus('unsaved');
  };

  const handleSubmitQuiz = async () => {
    if (!window.confirm('Are you sure you want to submit? You cannot change your answers after submission.')) {
      return;
    }

    try {
      setSubmitting(true);

      // Clear timers
      if (autoSaveTimerRef.current) clearInterval(autoSaveTimerRef.current);
      if (timerRef.current) clearInterval(timerRef.current);

      // Submit quiz
      const res = await apiPost(`${API_ENDPOINTS.ACTIVITIES}/${activityId}/quiz/submit`, {
        answers: Object.values(answers)
      });

      if (res.success) {
        setQuizSubmitted(true);
        setAlert({ type: 'success', message: 'Quiz submitted successfully!' });
      } else {
        setAlert({ type: 'error', message: res.message || 'Failed to submit quiz' });
      }

    } catch (error) {
      console.error('Submit error:', error);
      setAlert({ type: 'error', message: 'Error submitting quiz' });
    } finally {
      setSubmitting(false);
    }
  };

  const renderQuestionInput = (question: Question) => {
    const answer = answers[question.id];

    switch (question.question_type) {
      case 'multiple_choice':
        return (
          <div className="space-y-3">
            {question.choices?.map((choice) => (
              <div
                key={choice.id}
                onClick={() => handleAnswerChange(question.id, { choice_id: choice.id })}
                className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  answer?.choice_id === choice.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      answer?.choice_id === choice.id
                        ? 'border-blue-500 bg-blue-500'
                        : 'border-gray-300'
                    }`}
                  >
                    {answer?.choice_id === choice.id && (
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    )}
                  </div>
                  <span className="text-gray-800">{choice.choice_text}</span>
                </div>
              </div>
            ))}
          </div>
        );

      case 'multiple_select':
        return (
          <div className="space-y-3">
            {question.choices?.map((choice) => {
              const isSelected = answer?.selected_choices?.includes(choice.id) || false;
              return (
                <div
                  key={choice.id}
                  onClick={() => {
                    const currentSelections = answer?.selected_choices || [];
                    const newSelections = isSelected
                      ? currentSelections.filter(id => id !== choice.id)
                      : [...currentSelections, choice.id];
                    handleAnswerChange(question.id, { selected_choices: newSelections });
                  }}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Checkbox checked={isSelected} />
                    <span className="text-gray-800">{choice.choice_text}</span>
                  </div>
                </div>
              );
            })}
          </div>
        );

      case 'true_false':
        return (
          <div className="space-y-3">
            {['True', 'False'].map((option) => (
              <div
                key={option}
                onClick={() => handleAnswerChange(question.id, { answer_text: option })}
                className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  answer?.answer_text === option
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      answer?.answer_text === option
                        ? 'border-blue-500 bg-blue-500'
                        : 'border-gray-300'
                    }`}
                  >
                    {answer?.answer_text === option && (
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    )}
                  </div>
                  <span className="text-gray-800 font-medium">{option}</span>
                </div>
              </div>
            ))}
          </div>
        );

      case 'short_answer':
        return (
          <Input
            value={answer?.answer_text || ''}
            onChange={(e) => handleAnswerChange(question.id, { answer_text: e.target.value })}
            placeholder="Type your answer here..."
            className="w-full"
          />
        );

      case 'essay':
        return (
          <Textarea
            value={answer?.answer_text || ''}
            onChange={(e) => handleAnswerChange(question.id, { answer_text: e.target.value })}
            placeholder="Write your essay answer here..."
            rows={10}
            className="w-full resize-none"
          />
        );

      case 'matching':
        const matchData = matchingData[question.id];
        if (!matchData) return <p className="text-gray-500">Loading matching question...</p>;
        
        const pairs = answer?.matching_pairs || {};
        const colors = [
          { bg: 'bg-green-100', border: 'border-green-500', line: '#10b981', text: 'text-green-700' },
          { bg: 'bg-blue-100', border: 'border-blue-500', line: '#3b82f6', text: 'text-blue-700' },
          { bg: 'bg-purple-100', border: 'border-purple-500', line: '#a855f7', text: 'text-purple-700' },
          { bg: 'bg-pink-100', border: 'border-pink-500', line: '#ec4899', text: 'text-pink-700' },
          { bg: 'bg-orange-100', border: 'border-orange-500', line: '#f97316', text: 'text-orange-700' },
          { bg: 'bg-cyan-100', border: 'border-cyan-500', line: '#06b6d4', text: 'text-cyan-700' },
          { bg: 'bg-amber-100', border: 'border-amber-500', line: '#f59e0b', text: 'text-amber-700' },
          { bg: 'bg-rose-100', border: 'border-rose-500', line: '#f43f5e', text: 'text-rose-700' },
        ];
        
        const selectedLeft = selectedLeftItems[question.id] || null;
        
        const handleDragStart = (leftIndex: number, e: React.MouseEvent) => {
          const gridContainer = e.currentTarget.closest('.matching-grid');
          if (!gridContainer) return;
          
          const gridRect = gridContainer.getBoundingClientRect();
          
          setDragState({
            questionId: question.id,
            leftIndex,
            mouseX: e.clientX - gridRect.left,
            mouseY: e.clientY - gridRect.top
          });
        };
        
        const handleDragMove = (e: React.MouseEvent) => {
          if (dragState && dragState.questionId === question.id) {
            const gridContainer = document.querySelector('.matching-grid');
            if (!gridContainer) return;
            
            const gridRect = gridContainer.getBoundingClientRect();
            setDragState({
              ...dragState,
              mouseX: e.clientX - gridRect.left,
              mouseY: e.clientY - gridRect.top
            });
          }
        };
        
        const handleDragEnd = (rightIndex?: number) => {
          if (dragState && dragState.questionId === question.id) {
            if (rightIndex !== undefined) {
              // Check if this right item is already matched to a DIFFERENT left item
              const existingLeftIndex = Object.keys(pairs).find(k => pairs[parseInt(k)] === rightIndex);
              
              if (existingLeftIndex !== undefined && parseInt(existingLeftIndex) !== dragState.leftIndex) {
                // Show error animation instead of linking
                setErrorAnimation({ questionId: question.id });
                setTimeout(() => setErrorAnimation(null), 600);
                setDragState(null);
                return;
              }
              
              const newPairs = { ...pairs };
              
              // Remove any existing match for this left item
              if (newPairs[dragState.leftIndex] !== undefined) {
                delete newPairs[dragState.leftIndex];
              }
              
              // Add new match
              newPairs[dragState.leftIndex] = rightIndex;
              
              handleAnswerChange(question.id, { matching_pairs: newPairs });
            }
            
            setDragState(null);
          }
        };
        
        const getColorForPair = (leftIndex: number) => {
          const pairIndex = Object.keys(pairs).indexOf(String(leftIndex));
          return colors[pairIndex % colors.length];
        };
        
        const handleUnlinkPair = (rightIndex: number, e: React.MouseEvent) => {
          e.preventDefault();
          e.stopPropagation();
          
          // Find the left index that's matched to this right index
          const leftIndex = Object.keys(pairs).find(k => pairs[parseInt(k)] === rightIndex);
          if (leftIndex === undefined) return;
          
          const leftIndexNum = parseInt(leftIndex);
          
          // Get the circle position to start dragging from it
          const leftCircle = document.getElementById(`match-left-${question.id}-${leftIndexNum}`);
          if (!leftCircle) return;
          
          const gridContainer = e.currentTarget.closest('.matching-grid');
          if (!gridContainer) return;
          
          const gridRect = gridContainer.getBoundingClientRect();
          
          // Remove the pairing
          const newPairs = { ...pairs };
          delete newPairs[leftIndexNum];
          handleAnswerChange(question.id, { matching_pairs: newPairs });
          
          // Start dragging from the left item
          setDragState({
            questionId: question.id,
            leftIndex: leftIndexNum,
            mouseX: e.clientX - gridRect.left,
            mouseY: e.clientY - gridRect.top
          });
        };
        
        return (
          <div 
            className={`space-y-4 matching-container relative select-none transition-all ${
              errorAnimation?.questionId === question.id 
                ? 'animate-shake ring-4 ring-red-500 ring-opacity-50 rounded-lg' 
                : ''
            }`}
            onMouseMove={handleDragMove}
            onMouseUp={() => handleDragEnd()}
            onMouseLeave={() => setDragState(null)}
            style={{ userSelect: 'none' }}
          >
            <p className="text-sm text-gray-600 mb-4">Click and drag from a circle on the left to a circle on the right to create matches. Click on a matched circle on the right to unlink and re-match.</p>
            
            <div className="matching-grid grid grid-cols-[1fr_auto_1fr] gap-4 relative items-start">
              {/* Left Column */}
              <div className="space-y-3">
                {matchData.leftItems.map((item, idx) => {
                  const isMatched = pairs[idx] !== undefined;
                  const color = isMatched ? getColorForPair(idx) : null;
                  
                  return (
                    <div
                      key={idx}
                      className={`
                        relative w-full px-4 py-3 rounded-xl text-left font-medium transition-all
                        border-2 flex items-center justify-between
                        ${
                          isMatched
                            ? `${color?.bg} ${color?.border}`
                            : 'bg-white border-gray-200'
                        }
                      `}
                    >
                      <span className={isMatched ? color?.text : ''}>{item.text}</span>
                      <div
                        id={`match-left-${question.id}-${idx}`}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          handleDragStart(idx, e);
                        }}
                        className={`
                          w-6 h-6 rounded-full border-3 cursor-grab active:cursor-grabbing
                          flex items-center justify-center transition-all flex-shrink-0 ml-2
                          ${isMatched ? `${color?.border} bg-white` : 'border-gray-400 bg-white hover:border-blue-500'}
                        `}
                        style={{ borderWidth: '3px' }}
                      >
                        <div className={`w-3 h-3 rounded-full ${isMatched ? color?.border.replace('border-', 'bg-') : ''}`} />
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {/* Center Gap */}
              <div className="w-16" style={{ pointerEvents: 'none' }} />
              
              {/* Right Column */}
              <div className="space-y-3">
                {matchData.rightItems.map((item, idx) => {
                  const leftIndex = Object.keys(pairs).find(k => pairs[parseInt(k)] === idx);
                  const isMatched = leftIndex !== undefined;
                  const color = isMatched ? getColorForPair(parseInt(leftIndex)) : null;
                  
                  return (
                    <div
                      key={idx}
                      className={`
                        relative w-full px-4 py-3 rounded-xl text-left font-medium transition-all
                        border-2 flex items-center justify-between
                        ${
                          isMatched
                            ? `${color?.bg} ${color?.border}`
                            : dragState && dragState.questionId === question.id
                            ? 'bg-blue-50 border-blue-300'
                            : 'bg-white border-gray-200'
                        }
                      `}
                    >
                      <div
                        id={`match-right-${question.id}-${idx}`}
                        onMouseUp={(e) => {
                          e.preventDefault();
                          handleDragEnd(idx);
                        }}
                        onMouseDown={(e) => {
                          if (isMatched) {
                            handleUnlinkPair(idx, e);
                          }
                        }}
                        className={`
                          w-6 h-6 rounded-full border-3 transition-all
                          flex items-center justify-center flex-shrink-0 mr-2
                          ${isMatched ? `${color?.border} bg-white cursor-pointer hover:scale-110 hover:ring-2 hover:ring-offset-1 ${color?.border.replace('border-', 'hover:ring-')}` : 'border-gray-400 bg-white'}
                          ${dragState && dragState.questionId === question.id ? 'ring-2 ring-blue-400 ring-offset-1' : ''}
                        `}
                        style={{ borderWidth: '3px' }}
                      >
                        <div className={`w-3 h-3 rounded-full ${isMatched ? color?.border.replace('border-', 'bg-') : ''}`} />
                      </div>
                      <span className={isMatched ? color?.text : ''}>{item.text}</span>
                    </div>
                  );
                })}
              </div>
              
              {/* SVG Overlay for lines */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 10 }}>
                {/* Draw existing matches using cached positions */}
                {Object.entries(linePositions).map(([key, pos]) => {
                  const [leftIdx, rightIdx] = key.split('-').map(Number);
                  
                  // Only draw if this pair still exists
                  if (pairs[leftIdx] !== rightIdx) return null;
                  
                  const color = getColorForPair(leftIdx);
                  if (!color) return null;
                  
                  return (
                    <line
                      key={`line-${key}`}
                      x1={pos.x1}
                      y1={pos.y1}
                      x2={pos.x2}
                      y2={pos.y2}
                      stroke={color.line}
                      strokeWidth="4"
                      strokeLinecap="round"
                    />
                  );
                })}
                
                {/* Draw dragging line */}
                {dragState && dragState.questionId === question.id && (() => {
                  const leftCircle = document.getElementById(`match-left-${question.id}-${dragState.leftIndex}`);
                  if (leftCircle) {
                    const gridContainer = document.querySelector('.matching-grid');
                    if (!gridContainer) return null;
                    
                    const gridRect = gridContainer.getBoundingClientRect();
                    const leftRect = leftCircle.getBoundingClientRect();
                    
                    const x1 = leftRect.left + leftRect.width / 2 - gridRect.left;
                    const y1 = leftRect.top + leftRect.height / 2 - gridRect.top;

                    return (
                      <line
                        x1={x1}
                        y1={y1}
                        x2={dragState.mouseX}
                        y2={dragState.mouseY}
                        stroke="#3b82f6"
                        strokeWidth="4"
                        strokeLinecap="round"
                        strokeDasharray="8,4"
                        opacity="0.7"
                      />
                    );
                  }
                  return null;
                })()}
              </svg>
            </div>
            
            {Object.keys(pairs).length > 0 && (
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm font-medium text-blue-900">
                  Matches: {Object.keys(pairs).length} / {matchData.leftItems.length}
                </p>
              </div>
            )}
          </div>
        );

      case 'fill_blank':
        return (
          <div className="space-y-3">
            <div
              className="p-4 bg-gray-50 border border-gray-200 rounded-lg"
              dangerouslySetInnerHTML={{ __html: question.question_text }}
            />
            <Textarea
              value={answer?.answer_text || ''}
              onChange={(e) => handleAnswerChange(question.id, { answer_text: e.target.value })}
              placeholder="Fill in the blanks (separate multiple answers with commas)..."
              rows={4}
              className="w-full resize-none"
            />
          </div>
        );

      default:
        return <p className="text-gray-500">Unknown question type</p>;
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;
  const answeredCount = Object.keys(answers).length;

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading quiz...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (quizSubmitted) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-6">
          <Card className="max-w-2xl w-full border-0 shadow-2xl">
            <CardContent className="p-12 text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="h-10 w-10 text-green-600" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Quiz Submitted!</h2>
              <p className="text-gray-600 mb-8">
                Your answers have been recorded. Your teacher will review and grade your submission.
              </p>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                  <span className="text-gray-600">Questions Answered:</span>
                  <span className="font-bold text-gray-900">{answeredCount} / {questions.length}</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                  <span className="text-gray-600">Total Points:</span>
                  <span className="font-bold text-gray-900">{activity?.max_score}</span>
                </div>
              </div>
              <Button
                onClick={() => navigate(`/student/courses/${courseId}`)}
                className="mt-8 bg-gradient-to-r from-blue-600 to-purple-600 text-white"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Course
              </Button>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  if (!quizStarted) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-6">
          <Card className="max-w-3xl w-full border-0 shadow-2xl">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-8">
              <CardTitle className="text-3xl font-bold">{activity?.title}</CardTitle>
              <p className="text-blue-100 mt-2">Ready to begin?</p>
            </CardHeader>
            <CardContent className="p-8">
              {activity?.description && (
                <div
                  className="prose max-w-none mb-6 text-gray-700"
                  dangerouslySetInnerHTML={{ __html: activity.description }}
                />
              )}

              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="text-sm text-blue-600 font-semibold">Total Questions</div>
                  <div className="text-2xl font-bold text-blue-700">{questions.length}</div>
                </div>
                <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                  <div className="text-sm text-purple-600 font-semibold">Total Points</div>
                  <div className="text-2xl font-bold text-purple-700">{activity?.max_score}</div>
                </div>
                {settings.time_limit && (
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                    <div className="text-sm text-amber-600 font-semibold">Time Limit</div>
                    <div className="text-2xl font-bold text-amber-700">{settings.time_limit} mins</div>
                  </div>
                )}
                {settings.max_attempts && (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="text-sm text-green-600 font-semibold">Attempts Allowed</div>
                    <div className="text-2xl font-bold text-green-700">{settings.max_attempts}</div>
                  </div>
                )}
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div className="text-sm text-yellow-800">
                    <p className="font-semibold mb-1">Important:</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Your answers will be auto-saved every 30 seconds</li>
                      <li>Once submitted, you cannot change your answers</li>
                      {settings.time_limit && <li>The quiz will auto-submit when time runs out</li>}
                    </ul>
                  </div>
                </div>
              </div>

              <Button
                onClick={startQuiz}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-6 text-lg"
              >
                <BookOpen className="h-5 w-5 mr-2" />
                Start Quiz
              </Button>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10">
          <div className="max-w-5xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-bold text-gray-900">{activity?.title}</h1>
                <p className="text-sm text-gray-600">
                  Question {currentQuestionIndex + 1} of {questions.length}
                </p>
              </div>

              <div className="flex items-center gap-4">
                {timeRemaining !== null && (
                  <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                    timeRemaining < 300 ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                  }`}>
                    <Timer className="h-4 w-4" />
                    <span className="font-mono font-bold">{formatTime(timeRemaining)}</span>
                  </div>
                )}

                <Badge variant={autoSaveStatus === 'saved' ? 'default' : 'secondary'}>
                  {autoSaveStatus === 'saved' && <CheckCircle2 className="h-3 w-3 mr-1" />}
                  {autoSaveStatus === 'saving' && <Save className="h-3 w-3 mr-1 animate-spin" />}
                  {autoSaveStatus === 'saved' ? 'Saved' : autoSaveStatus === 'saving' ? 'Saving...' : 'Unsaved'}
                </Badge>

                <Badge className="bg-green-100 text-green-700">
                  {answeredCount} / {questions.length} Answered
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Question Content */}
        <div className="max-w-4xl mx-auto px-6 py-8">
          <Card className="border-0 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 border-b">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className="bg-blue-600 text-white">
                      {currentQuestion?.question_type?.replace('_', ' ')}
                    </Badge>
                    <Badge variant="outline">{currentQuestion?.points} points</Badge>
                  </div>
                  <div
                    className="text-lg text-gray-800 leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: currentQuestion?.question_text || '' }}
                  />
                </div>
              </div>
              {currentQuestion?.image_url && (
                <img
                  src={currentQuestion.image_url}
                  alt="Question"
                  className="mt-4 max-w-md rounded-lg border shadow-sm"
                />
              )}
            </CardHeader>

            <CardContent className="p-8">
              {renderQuestionInput(currentQuestion)}

              {/* Navigation */}
              <div className="flex items-center justify-between mt-8 pt-6 border-t">
                <Button
                  variant="outline"
                  onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
                  disabled={currentQuestionIndex === 0}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Previous
                </Button>

                {isLastQuestion ? (
                  <Button
                    onClick={handleSubmitQuiz}
                    disabled={submitting}
                    className="bg-gradient-to-r from-green-600 to-emerald-600 text-white"
                  >
                    {submitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Submit Quiz
                      </>
                    )}
                  </Button>
                ) : (
                  <Button
                    onClick={() => setCurrentQuestionIndex(prev => Math.min(questions.length - 1, prev + 1))}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                  >
                    Next
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Question Navigator */}
          <Card className="mt-6 border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-sm">Question Navigator</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 xl:grid-cols-15 gap-1">
                {questions.map((q, idx) => {
                  const isAnswered = answers[q.id] !== undefined;
                  const isCurrent = idx === currentQuestionIndex;
                  return (
                    <button
                      key={q.id}
                      onClick={() => setCurrentQuestionIndex(idx)}
                      className={`
                        aspect-square rounded-lg font-semibold text-xs transition-all flex items-center justify-center
                        ${isCurrent ? 'ring-2 ring-blue-500 ring-offset-1' : ''}
                        ${isAnswered 
                          ? 'bg-green-500 text-white hover:bg-green-600' 
                          : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                        }
                      `}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
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

export default QuizTaker;
