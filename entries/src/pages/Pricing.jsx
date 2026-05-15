import { useState, useEffect } from "react";
import { CheckCircle, Crown, Zap, Copy, Send, Clock, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SUBSCRIPTION_PLANS, BANK_DETAILS } from "@/lib/constants";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { base44 } from "@/api/base44Client";

export default function Pricing() {
  const [user, setUser] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [reference, setReference] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [existingRequest, setExistingRequest] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  useEffect(() => {
    base44.auth.me()
      .then(async (u) => {
        setUser(u);
        // Check if there's already a pending request
        const reqs = await base44.entities.PaymentRequest.filter({ user_email: u.email, status: "pending" });
        if (reqs[0]) setExistingRequest(reqs[0]);
        setLoadingUser(false);
      })
      .catch(() => setLoadingUser(false));
  }, []);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const handleSentPayment = async () => {
    if (!selectedPlan) { toast.error("Please select a plan first"); return; }
    if (!user) { toast.error("Please log in first"); return; }
    if (!reference.trim()) { toast.error("Please enter your payment reference/teller number"); return; }
    setSubmitting(true);

    const amount = SUBSCRIPTION_PLANS[selectedPlan].price;
    const ref = reference.trim();

    const req = await base44.entities.PaymentRequest.create({
      user_email: user.email,
      user_name: user.full_name,
      plan: selectedPlan,
      amount,
      bank_account_number: BANK_DETAILS.account_number,
      bank_name: BANK_DETAILS.bank_name,
      account_name: BANK_DETAILS.account_name,
      payment_reference: ref,
      status: "pending",
    });

    // Send email notification to admin
    base44.integrations.Core.SendEmail({
      to: "olawiseinfinityhub@gmail.com",
      subject: `💰 New Payment Request — ${selectedPlan} plan`,
      body: `New payment request on QuizNaija:\n\nStudent: ${user.full_name} (${user.email})\nPlan: ${selectedPlan}\nAmount: ₦${amount.toLocaleString()}\nReference: ${ref}\n\nPlease log in to the admin panel to approve or reject this request.`,
    }).catch(() => {});

    setExistingRequest(req);
    setSubmitting(false);
    toast.success("Payment request submitted! Admin will approve within 24 hours.");
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-16 animate-fade-in">
      <div className="text-center mb-14">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
          <Crown className="w-4 h-4" /> Pricing Plans
        </div>
        <h1 className="font-poppins font-bold text-4xl mb-3">Simple, Transparent Pricing</h1>
        <p className="text-muted-foreground text-lg max-w-xl mx-auto">
          Invest in your education. Prices are affordable for every Nigerian student.
        </p>
      </div>

      {/* Pending request notice */}
      {existingRequest && (
        <div className="mb-8 p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3">
          <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-amber-800">Payment Pending Approval</p>
            <p className="text-sm text-amber-700 mt-0.5">
              Your <strong>{existingRequest.plan}</strong> plan payment (Ref: {existingRequest.payment_reference}) is awaiting admin approval. 
              You'll be upgraded automatically once approved.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        {/* Free */}
        <div className="bg-card border border-border rounded-2xl p-7 space-y-5">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-5 h-5 text-muted-foreground" />
              <span className="font-semibold">Free</span>
            </div>
            <p className="text-4xl font-bold font-poppins">₦0</p>
            <p className="text-sm text-muted-foreground mt-1">Forever free</p>
          </div>
          <ul className="space-y-3">
            {["3 quiz trials per day", "Easy level only", "Basic corrections", "Limited subjects"].map(f => (
              <li key={f} className="flex items-center gap-2.5 text-sm">
                <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />{f}
              </li>
            ))}
          </ul>
          <Link to="/register">
            <Button variant="outline" className="w-full">Get Started Free</Button>
          </Link>
        </div>

        {/* Monthly */}
        <div
          onClick={() => !existingRequest && setSelectedPlan("monthly")}
          className={`bg-card rounded-2xl p-7 space-y-5 relative shadow-xl cursor-pointer transition-all ${
            selectedPlan === "monthly" ? "border-2 border-primary ring-2 ring-primary/20" : "border-2 border-primary"
          }`}
        >
          <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
            <Badge className="bg-primary text-primary-foreground px-4 shadow-md">MOST POPULAR</Badge>
          </div>
          {selectedPlan === "monthly" && <div className="absolute top-3 right-3"><CheckCircle className="w-5 h-5 text-primary" /></div>}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Crown className="w-5 h-5 text-secondary" />
              <span className="font-semibold">{SUBSCRIPTION_PLANS.monthly.name}</span>
            </div>
            <p className="text-4xl font-bold font-poppins">₦{SUBSCRIPTION_PLANS.monthly.price.toLocaleString()}</p>
            <p className="text-sm text-muted-foreground mt-1">per month</p>
          </div>
          <ul className="space-y-3">
            {SUBSCRIPTION_PLANS.monthly.features.map(f => (
              <li key={f} className="flex items-center gap-2.5 text-sm">
                <CheckCircle className="w-4 h-4 text-primary shrink-0" />{f}
              </li>
            ))}
          </ul>
          <Button
            onClick={(e) => { e.stopPropagation(); setSelectedPlan("monthly"); }}
            className={`w-full ${selectedPlan === "monthly" ? "gradient-card border-0 text-white" : "border-primary text-primary"}`}
            variant={selectedPlan === "monthly" ? "default" : "outline"}
          >
            <Crown className="w-4 h-4 mr-2" /> Select Monthly
          </Button>
        </div>

        {/* Yearly */}
        <div
          onClick={() => !existingRequest && setSelectedPlan("yearly")}
          className={`bg-card rounded-2xl p-7 space-y-5 cursor-pointer transition-all ${
            selectedPlan === "yearly" ? "border-2 border-yellow-500 ring-2 ring-yellow-200" : "border border-border"
          }`}
        >
          {selectedPlan === "yearly" && <div className="absolute top-3 right-3"><CheckCircle className="w-5 h-5 text-yellow-500" /></div>}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Crown className="w-5 h-5 text-yellow-500" />
              <span className="font-semibold">{SUBSCRIPTION_PLANS.yearly.name}</span>
              <Badge variant="secondary" className="text-xs bg-yellow-100 text-yellow-700 border-yellow-200">Save 33%</Badge>
            </div>
            <p className="text-4xl font-bold font-poppins">₦{SUBSCRIPTION_PLANS.yearly.price.toLocaleString()}</p>
            <p className="text-sm text-muted-foreground mt-1">per year · ₦1,000/mo equivalent</p>
          </div>
          <ul className="space-y-3">
            {SUBSCRIPTION_PLANS.yearly.features.map(f => (
              <li key={f} className="flex items-center gap-2.5 text-sm">
                <CheckCircle className="w-4 h-4 text-yellow-500 shrink-0" />{f}
              </li>
            ))}
          </ul>
          <Button
            onClick={(e) => { e.stopPropagation(); setSelectedPlan("yearly"); }}
            className={`w-full ${selectedPlan === "yearly" ? "bg-yellow-500 hover:bg-yellow-600 text-white border-0" : "border-yellow-300 text-yellow-700 hover:bg-yellow-50"}`}
            variant="outline"
          >
            <Crown className="w-4 h-4 mr-2" /> Select Yearly
          </Button>
        </div>
      </div>

      {/* Payment Instructions */}
      {selectedPlan && !existingRequest && (
        <div className="mt-10 bg-card border-2 border-primary/30 rounded-2xl p-6 space-y-5 animate-fade-in">
          <h3 className="font-poppins font-bold text-xl flex items-center gap-2">
            <Send className="w-5 h-5 text-primary" />
            Pay via Bank Transfer
          </h3>
          <p className="text-muted-foreground text-sm">
            Transfer <strong className="text-foreground">₦{SUBSCRIPTION_PLANS[selectedPlan].price.toLocaleString()}</strong> to the account below, then click "I've Sent Payment".
          </p>

          <div className="bg-muted/50 rounded-xl p-5 space-y-3">
            {[
              { label: "Bank Name", value: BANK_DETAILS.bank_name },
              { label: "Account Number", value: BANK_DETAILS.account_number },
              { label: "Account Name", value: BANK_DETAILS.account_name },
              { label: "Amount", value: `₦${SUBSCRIPTION_PLANS[selectedPlan].price.toLocaleString()}` },
            ].map(item => (
              <div key={item.label} className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs text-muted-foreground">{item.label}</p>
                  <p className="font-semibold text-sm">{item.value}</p>
                </div>
                <Button size="sm" variant="ghost" className="h-7 px-2" onClick={() => copyToClipboard(item.value)}>
                  <Copy className="w-3.5 h-3.5" />
                </Button>
              </div>
            ))}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="ref">Payment Reference / Teller Number <span className="text-destructive">*</span></Label>
            <Input
              id="ref"
              value={reference}
              onChange={e => setReference(e.target.value)}
              placeholder="e.g. teller no. or transfer reference (required)"
              className="h-10"
            />
          </div>

          <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            After clicking the button below, your account will be upgraded within 24 hours once admin confirms your payment.
          </div>

          <div className="p-3 bg-green-50 border border-green-200 rounded-xl text-xs text-green-800 space-y-1.5">
            <p className="font-semibold text-green-900">Need help? Contact us:</p>
            <a href="https://wa.me/2348157361339" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:underline font-medium">
              📱 WhatsApp: 08157361339
            </a>
            <a href="mailto:olawiseinfinityhub@gmail.com" className="flex items-center gap-2 hover:underline font-medium">
              ✉️ Email: olawiseinfinityhub@gmail.com
            </a>
          </div>

          {!user && (
            <p className="text-sm text-destructive flex items-center gap-2">
              <AlertCircle className="w-4 h-4" /> Please <Link to="/login" className="underline font-medium">log in</Link> before submitting.
            </p>
          )}

          <Button
            onClick={handleSentPayment}
            disabled={submitting || !user}
            className="w-full h-12 gradient-card border-0 text-white hover:opacity-90 text-base font-semibold flex items-center justify-center gap-2"
          >
            {submitting ? (
              <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Processing…</>
            ) : (
              <><Send className="w-5 h-5" /> I've Sent the Payment</>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}