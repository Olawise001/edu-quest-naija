import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { BookOpen, BarChart3, Trophy, Flame, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import StatsCard from "@/components/dashboard/StatsCard";
import QuizHistoryCard from "@/components/dashboard/QuizHistoryCard";
import SubscriptionBanner from "@/components/dashboard/SubscriptionBanner";
import QuizSetup from "@/components/quiz/QuizSetup";
import { canTakeQuiz } from "@/lib/quizUtils";
import { toast } from "sonner";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      const u = await base44.auth.me();
      setUser(u);
      const profiles = await base44.entities.UserProfile.filter({ user_email: u.email });
      let p = profiles[0];
      if (!p) {
        p = await base44.entities.UserProfile.create({ user_email: u.email, full_name: u.full_name, subscription_plan: "free" });
      }
      setProfile(p);
      const results = await base44.entities.QuizResult.filter({ user_email: u.email }, "-created_date", 20);
      setHistory(results);
      setLoading(false);
    };
    load();
  }, []);

  const handleStartQuiz = (config) => {
    const check = canTakeQuiz(profile, config.difficulty);
    if (!check.allowed) {
      toast.error(check.reason);
      return;
    }
    navigate("/quiz", { state: { config, profile } });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  const avgScore = history.length > 0
    ? Math.round(history.reduce((a, r) => a + r.score_percentage, 0) / history.length)
    : 0;
  const bestScore = history.length > 0 ? Math.max(...history.map(r => r.score_percentage)) : 0;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6 animate-fade-in">
      {/* Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="font-poppins font-bold text-2xl md:text-3xl">
            Welcome back, {user?.full_name?.split(" ")[0] || "Student"}! 👋
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">{profile?.class_level || "Set your class"} • Ready to practice?</p>
        </div>
      </div>

      {/* Subscription banner */}
      <SubscriptionBanner profile={profile} />

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatsCard icon={BookOpen} label="Quizzes Taken" value={history.length} color="text-primary" bg="bg-primary/10" />
        <StatsCard icon={BarChart3} label="Average Score" value={`${avgScore}%`} color="text-blue-600" bg="bg-blue-100" />
        <StatsCard icon={Trophy} label="Best Score" value={`${bestScore}%`} color="text-yellow-600" bg="bg-yellow-100" />
        <StatsCard icon={Flame} label="Today's Streak" value={history.filter(r => {
          const d = new Date(r.created_date); const t = new Date();
          return d.toDateString() === t.toDateString();
        }).length} color="text-orange-600" bg="bg-orange-100" sub="quizzes today" />
      </div>

      {/* Main tabs */}
      <Tabs defaultValue="new-quiz">
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="new-quiz" className="flex-1 sm:flex-none">
            <Plus className="w-4 h-4 mr-1.5" />New Quiz
          </TabsTrigger>
          <TabsTrigger value="history" className="flex-1 sm:flex-none">
            <Trophy className="w-4 h-4 mr-1.5" />History ({history.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="new-quiz" className="mt-5">
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
            <h2 className="font-poppins font-semibold text-lg mb-5">Configure Your Quiz</h2>
            <QuizSetup profile={profile} onStart={handleStartQuiz} />
          </div>
        </TabsContent>

        <TabsContent value="history" className="mt-5">
          {history.length === 0 ? (
            <div className="text-center py-16 bg-card border border-border rounded-2xl">
              <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="font-medium text-muted-foreground">No quizzes yet. Take your first quiz!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {history.map(r => <QuizHistoryCard key={r.id} result={r} />)}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}