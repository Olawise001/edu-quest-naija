import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Trophy, Medal, Star, Crown, Coins, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format, startOfWeek, endOfWeek } from "date-fns";

export default function Leaderboard() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [weekRange, setWeekRange] = useState("");

  useEffect(() => {
    const load = async () => {
      const user = await base44.auth.me().catch(() => null);
      setCurrentUser(user);

      // Week range
      const now = new Date();
      const wStart = startOfWeek(now, { weekStartsOn: 1 });
      const wEnd = endOfWeek(now, { weekStartsOn: 1 });
      setWeekRange(`${format(wStart, "MMM d")} – ${format(wEnd, "MMM d, yyyy")}`);

      // Get this week's leaderboard entries
      const weekKey = wStart.toISOString().split("T")[0];
      const lbEntries = await base44.entities.LeaderboardEntry.filter({ week_start: weekKey }, "-points", 50);

      // Enrich with profile data
      const enriched = await Promise.all(
        lbEntries.map(async (entry) => {
          const profiles = await base44.entities.UserProfile.filter({ user_email: entry.user_email });
          const p = profiles[0];
          return {
            email: entry.user_email,
            points: entry.points || 0,
            count: entry.perfect_scores || 0,
            name: p?.full_name || entry.user_email.split("@")[0],
            class_level: p?.class_level || "—",
          };
        })
      );

      setEntries(enriched.sort((a, b) => b.points - a.points));
      setLoading(false);
    };
    load();
  }, []);

  const getRankStyle = (rank) => {
    if (rank === 1) return "bg-yellow-50 border-yellow-300";
    if (rank === 2) return "bg-gray-50 border-gray-300";
    if (rank === 3) return "bg-orange-50 border-orange-200";
    return "bg-card border-border";
  };

  const getRankIcon = (rank) => {
    if (rank === 1) return <Crown className="w-5 h-5 text-yellow-500" />;
    if (rank === 2) return <Medal className="w-5 h-5 text-gray-400" />;
    if (rank === 3) return <Medal className="w-5 h-5 text-orange-400" />;
    return <span className="text-sm font-bold text-muted-foreground w-5 text-center">#{rank}</span>;
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 animate-fade-in space-y-8">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-100 text-yellow-700 text-sm font-medium">
          <Trophy className="w-4 h-4" /> Weekly Leaderboard
        </div>
        <h1 className="font-poppins font-bold text-3xl md:text-4xl">Top Performers</h1>
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Calendar className="w-4 h-4" />
          <span>{weekRange}</span>
        </div>
      </div>

      {/* Rules card */}
      <div className="bg-primary/5 border border-primary/20 rounded-2xl p-5 space-y-2">
        <p className="font-semibold text-primary flex items-center gap-2"><Star className="w-4 h-4" /> How to earn points</p>
        <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
          <li>Score <strong>100%</strong> in a <strong>Hard</strong> difficulty quiz</li>
          <li>Earn <strong>5 leaderboard points</strong> + <strong>5 credit tokens</strong> per perfect score</li>
          <li>Leaderboard resets every <strong>Monday</strong></li>
          <li>The <strong>#1 top scorer</strong> at week's end wins <strong>100 bonus tokens</strong> 🎉</li>
        </ul>
      </div>

      {/* Podium for top 3 */}
      {!loading && entries.length >= 3 && (
        <div className="flex items-end justify-center gap-4 py-4">
          {/* 2nd */}
          <div className="flex flex-col items-center">
            <div className="w-14 h-14 rounded-full bg-gray-200 flex items-center justify-center text-xl font-bold text-gray-600 border-4 border-gray-300 mb-2">
              {entries[1].name.charAt(0).toUpperCase()}
            </div>
            <p className="text-xs font-semibold truncate max-w-[70px] text-center">{entries[1].name}</p>
            <p className="text-xs text-muted-foreground">{entries[1].points} pts</p>
            <div className="w-16 h-16 bg-gray-200 rounded-t-lg flex items-end justify-center pb-1 mt-2">
              <span className="text-gray-600 font-bold text-lg">2</span>
            </div>
          </div>
          {/* 1st */}
          <div className="flex flex-col items-center">
            <Crown className="w-6 h-6 text-yellow-500 mb-1" />
            <div className="w-16 h-16 rounded-full bg-yellow-100 flex items-center justify-center text-2xl font-bold text-yellow-700 border-4 border-yellow-400 mb-2">
              {entries[0].name.charAt(0).toUpperCase()}
            </div>
            <p className="text-xs font-semibold truncate max-w-[80px] text-center">{entries[0].name}</p>
            <p className="text-xs text-yellow-600 font-bold">{entries[0].points} pts</p>
            <div className="w-16 h-24 bg-yellow-400 rounded-t-lg flex items-end justify-center pb-1 mt-2">
              <span className="text-white font-bold text-xl">1</span>
            </div>
          </div>
          {/* 3rd */}
          <div className="flex flex-col items-center">
            <div className="w-14 h-14 rounded-full bg-orange-100 flex items-center justify-center text-xl font-bold text-orange-600 border-4 border-orange-300 mb-2">
              {entries[2].name.charAt(0).toUpperCase()}
            </div>
            <p className="text-xs font-semibold truncate max-w-[70px] text-center">{entries[2].name}</p>
            <p className="text-xs text-muted-foreground">{entries[2].points} pts</p>
            <div className="w-16 h-12 bg-orange-300 rounded-t-lg flex items-end justify-center pb-1 mt-2">
              <span className="text-white font-bold text-lg">3</span>
            </div>
          </div>
        </div>
      )}

      {/* Full list */}
      <div className="space-y-3">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 bg-muted rounded-xl animate-pulse" />
          ))
        ) : entries.length === 0 ? (
          <div className="text-center py-16 bg-card border border-border rounded-2xl space-y-3">
            <Trophy className="w-12 h-12 text-muted-foreground mx-auto" />
            <p className="font-semibold">No entries yet this week</p>
            <p className="text-sm text-muted-foreground">Score 100% in Hard mode to claim the top spot!</p>
          </div>
        ) : (
          entries.map((entry, i) => {
            const rank = i + 1;
            const isMe = currentUser?.email === entry.email;
            return (
              <div
                key={entry.email}
                className={`flex items-center gap-4 p-4 rounded-2xl border transition-all ${getRankStyle(rank)} ${isMe ? "ring-2 ring-primary" : ""}`}
              >
                <div className="w-8 flex justify-center shrink-0">
                  {getRankIcon(rank)}
                </div>
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary text-sm shrink-0">
                  {entry.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate">{entry.name} {isMe && <span className="text-primary text-xs">(You)</span>}</p>
                  <p className="text-xs text-muted-foreground">{entry.class_level} • {entry.count} perfect quiz{entry.count !== 1 ? "zes" : ""}</p>
                </div>
                <div className="text-right shrink-0">
                  <div className="flex items-center gap-1 justify-end">
                    <Coins className="w-4 h-4 text-yellow-500" />
                    <span className="font-bold text-sm">{entry.points}</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground">pts</p>
                </div>
                {rank === 1 && (
                  <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200 text-[10px] shrink-0">🏆 Leader</Badge>
                )}
              </div>
            );
          })
        )}
      </div>

      {entries.length > 0 && (
        <p className="text-center text-xs text-muted-foreground pb-4">
          Top scorer wins 100 bonus tokens at week's end • Leaderboard resets every Monday
        </p>
      )}
    </div>
  );
}