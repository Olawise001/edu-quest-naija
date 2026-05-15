import { useState, useEffect } from "react";
import { Timer } from "lucide-react";
import { formatTime } from "@/lib/quizUtils";

// secondsPerQuestion: Easy=10, Medium=30, Hard=60
export default function QuizTimer({ totalSeconds, onTimeUpdate, onTimeUp, isRunning = true }) {
  const [remaining, setRemaining] = useState(totalSeconds);

  // Reset if totalSeconds changes (new quiz)
  useEffect(() => {
    setRemaining(totalSeconds);
  }, [totalSeconds]);

  useEffect(() => {
    if (!isRunning) return;
    if (remaining <= 0) {
      onTimeUp?.();
      return;
    }
    const interval = setInterval(() => {
      setRemaining(s => {
        const next = s - 1;
        onTimeUpdate?.(totalSeconds - next); // elapsed
        if (next <= 0) {
          clearInterval(interval);
          onTimeUp?.();
          return 0;
        }
        return next;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isRunning, remaining]);

  const isWarning = remaining <= Math.floor(totalSeconds * 0.2); // last 20%
  const isDanger = remaining <= 30;

  return (
    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm font-mono font-medium transition-colors ${
      isDanger ? "border-red-300 bg-red-50 text-red-600 animate-pulse" :
      isWarning ? "border-orange-300 bg-orange-50 text-orange-600" :
      "border-border bg-muted text-foreground"
    }`}>
      <Timer className="w-3.5 h-3.5" />
      {formatTime(remaining)}
    </div>
  );
}