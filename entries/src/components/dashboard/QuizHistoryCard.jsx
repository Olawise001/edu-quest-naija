import { Badge } from "@/components/ui/badge";
import { BookOpen, Clock, Calendar } from "lucide-react";
import { getGrade } from "@/lib/constants";
import { format } from "date-fns";

export default function QuizHistoryCard({ result }) {
  const grade = getGrade(result.score_percentage);
  const date = result.created_date ? format(new Date(result.created_date), "dd MMM yyyy") : "—";

  return (
    <div className="bg-card border border-border rounded-xl p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <BookOpen className="w-5 h-5 text-primary" />
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-sm truncate">{result.subject}</p>
            <p className="text-xs text-muted-foreground">{result.class_level} • {result.difficulty}</p>
          </div>
        </div>
        <div className="text-right shrink-0">
          <p className={`text-2xl font-bold font-poppins ${grade.color}`}>{result.score_percentage}%</p>
          <Badge variant="outline" className="text-xs">{grade.grade} — {grade.remark}</Badge>
        </div>
      </div>
      <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{date}</span>
        <span>{result.correct_answers}/{result.total_questions} correct</span>
        {result.time_taken_seconds && (
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {Math.floor(result.time_taken_seconds / 60)}m {result.time_taken_seconds % 60}s
          </span>
        )}
      </div>
    </div>
  );
}