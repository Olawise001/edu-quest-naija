import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import QuestionCard from "@/components/quiz/QuestionCard";
import { formatTime } from "@/lib/quizUtils";
import { Trophy, RotateCcw, Home, Clock, CheckCircle, XCircle, Target, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";

export default function Results() {
  const location = useLocation();
  const navigate = useNavigate();
  const { results, config } = location.state || {};

  if (!results) {
    navigate("/dashboard");
    return null;
  }

  const { total_questions, correct_answers, wrong_answers, score_percentage, grade, remark, gradeColor, time_taken_seconds, answers_data } = results;

  const gradeColors = {
    A: "from-emerald-400 to-green-500",
    B: "from-blue-400 to-blue-600",
    C: "from-yellow-400 to-amber-500",
    D: "from-orange-400 to-orange-600",
    F: "from-red-400 to-red-600",
  };

  const gradientClass = gradeColors[grade] || "from-primary to-primary/80";

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6 animate-fade-in">
      {/* Score Card */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className={`bg-gradient-to-br ${gradientClass} text-white rounded-3xl p-8 text-center shadow-xl`}
      >
        <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center mx-auto mb-4">
          <Trophy className="w-8 h-8 text-white" />
        </div>
        <p className="text-6xl font-bold font-poppins mb-1">{score_percentage}%</p>
        <p className="text-2xl font-semibold mb-1">{grade} — {remark}</p>
        <p className="text-white/80 text-sm">{config?.subject} • {config?.classLevel} • {config?.difficulty}</p>

        <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-white/20">
          <div>
            <p className="text-2xl font-bold">{correct_answers}</p>
            <p className="text-white/70 text-xs">Correct</p>
          </div>
          <div>
            <p className="text-2xl font-bold">{wrong_answers}</p>
            <p className="text-white/70 text-xs">Wrong</p>
          </div>
          <div>
            <p className="text-2xl font-bold">{formatTime(time_taken_seconds || 0)}</p>
            <p className="text-white/70 text-xs">Time</p>
          </div>
        </div>
      </motion.div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-card border border-emerald-200 rounded-xl p-4 text-center">
          <CheckCircle className="w-6 h-6 text-emerald-500 mx-auto mb-1" />
          <p className="text-xl font-bold text-emerald-600">{correct_answers}</p>
          <p className="text-xs text-muted-foreground">Correct</p>
        </div>
        <div className="bg-card border border-red-200 rounded-xl p-4 text-center">
          <XCircle className="w-6 h-6 text-red-400 mx-auto mb-1" />
          <p className="text-xl font-bold text-red-500">{wrong_answers}</p>
          <p className="text-xs text-muted-foreground">Wrong</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 text-center">
          <Target className="w-6 h-6 text-primary mx-auto mb-1" />
          <p className="text-xl font-bold">{total_questions}</p>
          <p className="text-xs text-muted-foreground">Total</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 flex-wrap">
        <Button
          variant="outline"
          className="flex-1 flex items-center gap-2"
          onClick={() => navigate("/dashboard")}
        >
          <Home className="w-4 h-4" /> Dashboard
        </Button>
        <Button
          variant="outline"
          className="flex-1 flex items-center gap-2"
          onClick={() => navigate("/dashboard", { state: { openQuizSetup: true } })}
        >
          <ArrowLeft className="w-4 h-4" /> New Quiz
        </Button>
        <Button
          className="flex-1 gradient-card border-0 text-white hover:opacity-90 flex items-center gap-2"
          onClick={() => navigate("/quiz", { state: { config, forceNewQuestions: true } })}
        >
          <RotateCcw className="w-4 h-4" /> Reset (New Questions)
        </Button>
      </div>

      {/* Review */}
      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All ({total_questions})</TabsTrigger>
          <TabsTrigger value="correct">Correct ({correct_answers})</TabsTrigger>
          <TabsTrigger value="wrong">Wrong ({wrong_answers})</TabsTrigger>
        </TabsList>

        {["all", "correct", "wrong"].map(tab => (
          <TabsContent key={tab} value={tab} className="mt-4 space-y-4">
            {answers_data
              .filter(a => tab === "all" ? true : tab === "correct" ? a.is_correct : !a.is_correct)
              .map((a, i) => (
                <QuestionCard
                  key={i}
                  question={a}
                  index={i}
                  total={answers_data.length}
                  selected={a.selected_answer}
                  onSelect={() => {}}
                  showResult={true}
                />
              ))}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}