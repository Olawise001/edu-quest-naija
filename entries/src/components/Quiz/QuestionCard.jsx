import { motion } from "framer-motion";
import { CheckCircle, XCircle } from "lucide-react";

const OPTION_LABELS = ["A", "B", "C", "D"];

export default function QuestionCard({ question, index, total, selected, onSelect, showResult }) {
  const options = [question.option_a, question.option_b, question.option_c, question.option_d];

  const getOptionStyle = (label) => {
    if (!showResult) {
      return selected === label
        ? "border-primary bg-primary/10 text-primary font-medium shadow-md"
        : "border-border hover:border-primary/50 hover:bg-muted/50";
    }
    if (label === question.correct_answer) return "border-emerald-500 bg-emerald-50 text-emerald-700";
    if (label === selected && label !== question.correct_answer) return "border-red-400 bg-red-50 text-red-600";
    return "border-border text-muted-foreground";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-card rounded-2xl border border-border shadow-sm p-6 space-y-5"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 flex-1">
          <span className="shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold flex items-center justify-center">
            {index + 1}
          </span>
          <p className="text-foreground font-medium leading-relaxed pt-0.5">{question.question_text}</p>
        </div>
        <span className="text-xs text-muted-foreground shrink-0">{index + 1}/{total}</span>
      </div>

      <div className="grid grid-cols-1 gap-2.5">
        {options.map((opt, i) => {
          const label = OPTION_LABELS[i];
          const isCorrect = showResult && label === question.correct_answer;
          const isWrong = showResult && label === selected && label !== question.correct_answer;

          return (
            <button
              key={label}
              onClick={() => !showResult && onSelect(label)}
              disabled={showResult}
              className={`w-full text-left px-4 py-3 rounded-xl border-2 transition-all flex items-center gap-3 ${getOptionStyle(label)}`}
            >
              <span className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-bold shrink-0 ${
                showResult && isCorrect ? "border-emerald-500 bg-emerald-500 text-white" :
                showResult && isWrong ? "border-red-400 bg-red-400 text-white" :
                selected === label ? "border-primary bg-primary text-primary-foreground" :
                "border-current"
              }`}>
                {label}
              </span>
              <span className="flex-1 text-sm">{opt}</span>
              {showResult && isCorrect && <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />}
              {showResult && isWrong && <XCircle className="w-4 h-4 text-red-400 shrink-0" />}
            </button>
          );
        })}
      </div>

      {showResult && question.explanation && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="mt-1 p-4 bg-amber-50 border border-amber-200 rounded-xl"
        >
          <p className="text-xs font-semibold text-amber-700 mb-1">💡 Explanation</p>
          <p className="text-sm text-amber-800 leading-relaxed">{question.explanation}</p>
        </motion.div>
      )}
    </motion.div>
  );
}