import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Crown, Zap } from "lucide-react";
import { isSubscriptionActive } from "@/lib/quizUtils";
import { format } from "date-fns";

export default function SubscriptionBanner({ profile }) {
  const isPaid = isSubscriptionActive(profile);

  if (isPaid) {
    return (
      <div className="bg-card border border-secondary/30 rounded-2xl p-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl gradient-gold flex items-center justify-center">
          <Crown className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1">
          <p className="font-semibold text-sm">Premium Active</p>
          <p className="text-xs text-muted-foreground">
            {profile.subscription_plan === "yearly" ? "Yearly Plan" : "Monthly Plan"} •{" "}
            Expires {profile.subscription_expires ? format(new Date(profile.subscription_expires), "dd MMM yyyy") : "—"}
          </p>
        </div>
        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse-green" />
      </div>
    );
  }

  return (
    <div className="gradient-card text-white rounded-2xl p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Zap className="w-4 h-4 text-yellow-300" />
            <span className="font-semibold text-sm">Free Plan</span>
          </div>
          <p className="text-white/80 text-xs leading-relaxed">
            You have 3 free quiz trials/day (Easy only). Upgrade for unlimited access, all levels & full explanations.
          </p>
        </div>
        <Link to="/pricing">
          <Button size="sm" className="bg-white text-primary hover:bg-white/90 font-semibold shrink-0 shadow-md">
            Upgrade
          </Button>
        </Link>
      </div>
    </div>
  );
}