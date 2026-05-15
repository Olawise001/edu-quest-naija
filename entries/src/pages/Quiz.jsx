import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import QuestionCard from "@/components/quiz/QuestionCard";
import QuizTimer from "@/components/quiz/QuizTimer";
import { calculateResults } from "@/lib/quizUtils";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight, Send, Loader2, Sparkles } from "lucide-react";

export default function Quiz() {
  const location = useLocation();
  const navigate = useNavigate();
  const { config, profile, forceNewQuestions } = location.state || {};

  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [currentIdx, setCurrentIdx] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [timeTaken, setTimeTaken] = useState(0);
  const [timerRunning, setTimerRunning] = useState(true);
  const [error, setError] = useState(null);

  // Countdown: Easy=20s/q, Medium=30s/q, Hard=60s/q
  const secondsPerQuestion = config?.difficulty === "Hard" ? 60 : config?.difficulty === "Medium" ? 30 : 20;
  const totalSeconds = (config?.numQuestions || 10) * secondsPerQuestion;

  useEffect(() => {
    if (!config) { navigate("/dashboard"); return; }
    loadQuestions();
  }, []);

  const loadQuestions = async () => {
    setLoading(true);
    setError(null);

    // If forcing new questions, go straight to AI generation
    if (forceNewQuestions) {
      await generateAIQuestions([], config.numQuestions);
      return;
    }

    // Try DB first — fetch a large pool to reduce repeats
    const filter = {
      class_level: config.classLevel,
      subject: config.subject,
      difficulty: config.difficulty,
      is_approved: true,
    };
    if (config.topic) filter.topic = config.topic;

    const dbQ = await base44.entities.Question.filter(filter, "created_date", 200);

    // Shuffle the full pool and take what we need — reduces repeat probability
    const shuffled = dbQ.sort(() => Math.random() - 0.5).slice(0, config.numQuestions);

    if (shuffled.length >= config.numQuestions) {
      setQuestions(shuffled);
      setLoading(false);
      return;
    }

    // Need AI to generate more
    const needed = config.numQuestions - shuffled.length;
    toast.info(`Loading ${needed} more questions...`);

    await generateAIQuestions(shuffled, needed);
  };

  const generateAIQuestions = async (existing, needed) => {
    const topicStr = config.topic ? ` specifically on the topic "${config.topic}"` : "";
    const requestCount = needed + 2; // Small buffer for speed — faster generation
    const classGroup = config.classLevel.startsWith("JSS") ? "Junior Secondary (JSS1–JSS3)" : "Senior Secondary (SS1–SS3)";
    const difficultyGuide = {
      Easy: `Easy — Basic recall, definitions, simple factual questions. Language and concepts appropriate for ${config.classLevel} beginners. Short answer stems.`,
      Medium: `Medium — Application and understanding. Requires ${config.classLevel} students to apply knowledge to scenarios. Moderate complexity.`,
      Hard: `Hard — Analysis, evaluation and higher-order thinking. Challenging questions that require deep understanding of ${config.classLevel} ${config.subject} curriculum including past WAEC/NECO/JAMB-style questions.`,
    }[config.difficulty];

    const prompt = `Generate exactly ${requestCount} UNIQUE multiple choice quiz questions strictly for:
- Class: ${config.classLevel} (${classGroup})
- Subject: ${config.subject}${topicStr}
- Difficulty: ${difficultyGuide}

CRITICAL RULES:
1. Every question MUST be age-appropriate and syllabus-accurate for ${config.classLevel} in Nigeria.
2. Do NOT mix difficulty levels — all questions must be ${config.difficulty}.
3. Do NOT repeat question themes or reuse answer choices across questions.
4. Align with Nigerian school curriculum (WAEC/NECO/JAMB standards where applicable).
5. Each question has exactly 4 options (A, B, C, D) with ONE correct answer.
6. Include a concise 1–2 sentence explanation for the correct answer.`;

    const aiResponse = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: "object",
        properties: {
          questions: {
            type: "array",
            items: {
              type: "object",
              properties: {
                question_text: { type: "string" },
                option_a: { type: "string" },
                option_b: { type: "string" },
                option_c: { type: "string" },
                option_d: { type: "string" },
                correct_answer: { type: "string" },
                explanation: { type: "string" },
              }
            }
          }
        }
      }
    });

    const aiQuestions = (aiResponse?.questions || []).map(q => ({
      ...q,
      class_level: config.classLevel,
      subject: config.subject,
      topic: config.topic || "",
      difficulty: config.difficulty,
      is_approved: true,
      source: "ai",
    }));

    // Save AI questions to DB for future use
    if (aiQuestions.length > 0) {
      base44.entities.Question.bulkCreate(aiQuestions).catch(() => {});
    }

    const allQuestions = [...existing, ...aiQuestions].slice(0, config.numQuestions);
    setQuestions(allQuestions);
    setLoading(false);
  };

  const handleAnswer = (label) => {
    setAnswers(prev => ({ ...prev, [currentIdx]: label }));
  };

  const handleSubmit = async () => {
    const unanswered = questions.filter((_, i) => !answers[i]);
    if (unanswered.length > 0) {
      const ok = window.confirm(`You have ${unanswered.length} unanswered question(s). Submit anyway?`);
      if (!ok) return;
    }

    setTimerRunning(false);
    setSubmitting(true);

    const results = calculateResults(questions, answers, timeTaken);
    const user = await base44.auth.me();

    // Save result
    await base44.entities.QuizResult.create({
      user_email: user.email,
      class_level: config.classLevel,
      subject: config.subject,
      topic: config.topic || "",
      difficulty: config.difficulty,
      ...results,
    });

    // Update user profile stats + award tokens for 100% Hard
    const profiles = await base44.entities.UserProfile.filter({ user_email: user.email });
    if (profiles[0]) {
      const p = profiles[0];
      const today = new Date().toISOString().split("T")[0];
      const used = p.daily_reset_date === today ? (p.daily_questions_used || 0) : 0;
      const newAvg = Math.round(((p.average_score || 0) * (p.total_quizzes_taken || 0) + results.score_percentage) / ((p.total_quizzes_taken || 0) + 1));
      const earnedTokens = (results.score_percentage === 100 && config.difficulty === "Hard") ? 5 : 0;
      if (earnedTokens > 0) {
        toast.success("🎉 100% in Hard mode! You earned 5 credit tokens + 5 leaderboard points!");
        // Update leaderboard entry for this week
        const weekStart = new Date();
        weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1); // Monday
        const weekKey = weekStart.toISOString().split("T")[0];
        const lbEntries = await base44.entities.LeaderboardEntry.filter({ user_email: user.email, week_start: weekKey });
        if (lbEntries[0]) {
          await base44.entities.LeaderboardEntry.update(lbEntries[0].id, {
            points: (lbEntries[0].points || 0) + 5,
            perfect_scores: (lbEntries[0].perfect_scores || 0) + 1,
          });
        } else {
          await base44.entities.LeaderboardEntry.create({ user_email: user.email, week_start: weekKey, points: 5, perfect_scores: 1 });
        }
      }
      await base44.entities.UserProfile.update(p.id, {
        total_quizzes_taken: (p.total_quizzes_taken || 0) + 1,
        average_score: newAvg,
        daily_questions_used: used + questions.length,
        daily_reset_date: today,
        credit_tokens: (p.credit_tokens || 0) + earnedTokens,
      });
    }

    navigate("/results", { state: { results, config } });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <div className="w-12 h-12 rounded-2xl gradient-card flex items-center justify-center">
          <Sparkles className="w-6 h-6 text-white animate-pulse" />
        </div>
        <p className="font-medium text-muted-foreground">Preparing your questions…</p>
        <p className="text-xs text-muted-foreground">Loading intelligent questions for you</p>
        <p className="text-sm text-muted-foreground">{config?.subject} • {config?.classLevel} • {config?.difficulty}</p>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 px-4">
        <p className="font-semibold text-lg">No questions available</p>
        <p className="text-muted-foreground text-sm text-center">Could not load questions for this selection.</p>
        <Button onClick={() => navigate("/dashboard")}>Back to Dashboard</Button>
      </div>
    );
  }

  const progress = ((currentIdx + 1) / questions.length) * 100;
  const answered = Object.keys(answers).length;

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-5 animate-fade-in">
      {/* Header */}
      <div className="bg-card border border-border rounded-2xl p-4 flex items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="font-semibold text-sm truncate">{config.subject} — {config.classLevel}</p>
          <p className="text-xs text-muted-foreground">{config.difficulty} • {questions.length} questions</p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className="text-xs text-muted-foreground">{answered}/{questions.length} answered</span>
          <QuizTimer
            totalSeconds={totalSeconds}
            onTimeUpdate={setTimeTaken}
            onTimeUp={() => { toast.error("Time's up! Submitting quiz..."); handleSubmit(); }}
            isRunning={timerRunning}
          />
        </div>
      </div>

      {/* Progress */}
      <Progress value={progress} className="h-2" />

      {/* Question */}
      <QuestionCard
        question={questions[currentIdx]}
        index={currentIdx}
        total={questions.length}
        selected={answers[currentIdx]}
        onSelect={handleAnswer}
        showResult={false}
      />

      {/* Navigation */}
      <div className="flex items-center justify-between gap-3">
        <Button
          variant="outline"
          onClick={() => setCurrentIdx(i => Math.max(0, i - 1))}
          disabled={currentIdx === 0}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" /> Previous
        </Button>

        <div className="flex flex-wrap gap-1.5 justify-center flex-1">
          {questions.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentIdx(i)}
              className={`w-7 h-7 rounded-md text-xs font-medium transition-all ${
                i === currentIdx ? "bg-primary text-primary-foreground shadow-md" :
                answers[i] ? "bg-primary/20 text-primary" :
                "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>

        {currentIdx < questions.length - 1 ? (
          <Button onClick={() => setCurrentIdx(i => i + 1)} className="flex items-center gap-2">
            Next <ArrowRight className="w-4 h-4" />
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            disabled={submitting}
            className="gradient-card border-0 text-white hover:opacity-90 flex items-center gap-2"
          >
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            Submit
          </Button>
        )}
      </div>
    </div>
  );
}