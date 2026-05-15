import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { User, Coins, Gift, Smartphone, Wifi, Save, Loader2 } from "lucide-react";
import { CLASS_LEVELS } from "@/lib/constants";
import { isSubscriptionActive } from "@/lib/quizUtils";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [redeeming, setRedeeming] = useState(false);

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    date_of_birth: "",
    location: "",
    class_level: "",
    school_name: "",
  });

  useEffect(() => {
    const init = async () => {
      const u = await base44.auth.me();
      setUser(u);
      const profiles = await base44.entities.UserProfile.filter({ user_email: u.email });
      let p = profiles[0];
      if (!p) {
        p = await base44.entities.UserProfile.create({ user_email: u.email, full_name: u.full_name, subscription_plan: "free", credit_tokens: 0 });
      }
      setProfile(p);
      setForm({
        first_name: p.first_name || u.full_name?.split(" ")[0] || "",
        last_name: p.last_name || u.full_name?.split(" ").slice(1).join(" ") || "",
        date_of_birth: p.date_of_birth || "",
        location: p.location || "",
        class_level: p.class_level || "",
        school_name: p.school_name || "",
      });
      setLoading(false);
    };
    init();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    await base44.entities.UserProfile.update(profile.id, {
      ...form,
      full_name: `${form.first_name} ${form.last_name}`.trim(),
    });
    setProfile(p => ({ ...p, ...form }));
    toast.success("Profile saved!");
    setSaving(false);
  };

  const handleRedeem = async (type) => {
    if ((profile.credit_tokens || 0) < 500) {
      toast.error("You need at least 500 credit tokens to redeem.");
      return;
    }
    setRedeeming(true);
    await base44.entities.UserProfile.update(profile.id, {
      credit_tokens: (profile.credit_tokens || 0) - 500,
    });
    setProfile(p => ({ ...p, credit_tokens: (p.credit_tokens || 0) - 500 }));
    toast.success(`Redemption request for ${type} submitted! You'll be contacted within 24 hours.`);
    setRedeeming(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  const tokens = profile?.credit_tokens || 0;
  const canRedeem = tokens >= 500;
  const isPaid = isSubscriptionActive(profile);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6 animate-fade-in">
      <div>
        <h1 className="font-poppins font-bold text-2xl md:text-3xl">My Profile</h1>
        <p className="text-muted-foreground text-sm">Manage your personal details and rewards</p>
      </div>

      {/* Credit Tokens Card */}
      <div className={`rounded-2xl p-5 ${canRedeem ? "gradient-gold" : "gradient-card"} text-white`}>
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
              <Coins className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="font-poppins font-bold text-2xl">{tokens.toLocaleString()}</p>
              <p className="text-white/80 text-sm">Credit Tokens</p>
            </div>
          </div>
          <div className="text-right">
            {canRedeem ? (
              <Badge className="bg-white text-yellow-700 font-semibold">Ready to Redeem!</Badge>
            ) : (
              <div>
                <p className="text-white/80 text-xs">Need {(500 - tokens).toLocaleString()} more to redeem</p>
                <div className="mt-1 h-2 bg-white/20 rounded-full w-32">
                  <div
                    className="h-2 bg-white rounded-full transition-all"
                    style={{ width: `${Math.min((tokens / 500) * 100, 100)}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-white/20">
          <p className="text-white/70 text-xs mb-3">
            Earn 5 tokens by scoring 100% in Hard mode. Redeem 500 tokens for airtime or data.
          </p>
          <div className="flex gap-3">
            <Button
              size="sm"
              disabled={!canRedeem || redeeming}
              onClick={() => handleRedeem("Airtime")}
              className="bg-white text-primary hover:bg-white/90 font-semibold flex items-center gap-1.5"
            >
              {redeeming ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Smartphone className="w-3.5 h-3.5" />}
              Get Airtime
            </Button>
            <Button
              size="sm"
              disabled={!canRedeem || redeeming}
              onClick={() => handleRedeem("Data")}
              className="bg-white/20 border border-white/30 text-white hover:bg-white/30 font-semibold flex items-center gap-1.5"
            >
              {redeeming ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Wifi className="w-3.5 h-3.5" />}
              Get Data
            </Button>
          </div>
        </div>
      </div>

      {/* Profile Form */}
      <div className="bg-card border border-border rounded-2xl p-6 space-y-5">
        <div className="flex items-center gap-2">
          <User className="w-5 h-5 text-primary" />
          <h2 className="font-semibold text-lg">Personal Information</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>First Name</Label>
            <Input
              value={form.first_name}
              onChange={e => setForm(f => ({ ...f, first_name: e.target.value }))}
              placeholder="Enter first name"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Last Name</Label>
            <Input
              value={form.last_name}
              onChange={e => setForm(f => ({ ...f, last_name: e.target.value }))}
              placeholder="Enter last name"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label>Email</Label>
          <Input value={user?.email || ""} disabled className="bg-muted text-muted-foreground" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>Date of Birth</Label>
            <Input
              type="date"
              value={form.date_of_birth}
              onChange={e => setForm(f => ({ ...f, date_of_birth: e.target.value }))}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Location (City / State)</Label>
            <Input
              value={form.location}
              onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
              placeholder="e.g. Lagos, Abuja"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>Class Level</Label>
            <Select value={form.class_level} onValueChange={v => setForm(f => ({ ...f, class_level: v }))}>
              <SelectTrigger><SelectValue placeholder="Select class" /></SelectTrigger>
              <SelectContent>
                {CLASS_LEVELS.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>School Name</Label>
            <Input
              value={form.school_name}
              onChange={e => setForm(f => ({ ...f, school_name: e.target.value }))}
              placeholder="Your school name"
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-border">
          <div>
            <p className="text-sm font-medium">Subscription</p>
            <p className="text-xs text-muted-foreground">
              {isPaid ? `${profile.subscription_plan} plan — expires ${profile.subscription_expires}` : "Free plan"}
            </p>
          </div>
          <Button onClick={handleSave} disabled={saving} className="gradient-card border-0 text-white hover:opacity-90 flex items-center gap-2">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Profile
          </Button>
        </div>
      </div>
    </div>
  );
}