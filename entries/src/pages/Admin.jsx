import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { CLASS_LEVELS, getSubjectsForClass, DIFFICULTIES } from "@/lib/constants";
import { Users, BookOpen, BarChart3, Plus, Trash2, Check, Loader2, Sparkles, CreditCard, UserX, Eye, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Admin() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState([]);
  const [users, setUsers] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [paymentRequests, setPaymentRequests] = useState([]);
  const [generating, setGenerating] = useState(false);
  const [viewingProfile, setViewingProfile] = useState(null);
  const navigate = useNavigate();

  // New question form
  const [form, setForm] = useState({
    class_level: "", subject: "", topic: "", difficulty: "Easy",
    question_text: "", option_a: "", option_b: "", option_c: "", option_d: "",
    correct_answer: "A", explanation: ""
  });

  // AI gen form
  const [aiForm, setAiForm] = useState({ class_level: "SS2", subject: "Mathematics", topic: "", difficulty: "Medium", count: 10 });

  useEffect(() => {
    const init = async () => {
      const u = await base44.auth.me();
      if (u.role !== "admin") { navigate("/dashboard"); return; }
      setUser(u);
      const [qs, us, ps, prs] = await Promise.all([
        base44.entities.Question.list("-created_date", 50),
        base44.entities.User.list(),
        base44.entities.UserProfile.list("-created_date", 50),
        base44.entities.PaymentRequest.list("-created_date", 100),
      ]);
      setQuestions(qs);
      setUsers(us);
      setProfiles(ps);
      setPaymentRequests(prs);
      setLoading(false);
    };
    init();
  }, []);

  const handleAddQuestion = async () => {
    if (!form.class_level || !form.subject || !form.question_text) {
      toast.error("Fill in all required fields");
      return;
    }
    await base44.entities.Question.create({ ...form, is_approved: true, source: "manual" });
    toast.success("Question added!");
    setForm({ class_level: "", subject: "", topic: "", difficulty: "Easy", question_text: "", option_a: "", option_b: "", option_c: "", option_d: "", correct_answer: "A", explanation: "" });
    const qs = await base44.entities.Question.list("-created_date", 50);
    setQuestions(qs);
  };

  const handleDelete = async (id) => {
    await base44.entities.Question.delete(id);
    setQuestions(qs => qs.filter(q => q.id !== id));
    toast.success("Deleted");
  };

  const handleApprove = async (id) => {
    await base44.entities.Question.update(id, { is_approved: true });
    setQuestions(qs => qs.map(q => q.id === id ? { ...q, is_approved: true } : q));
    toast.success("Approved");
  };

  const handleManualSubscribe = async (email, plan) => {
    const ps = await base44.entities.UserProfile.filter({ user_email: email });
    if (!ps[0]) { toast.error("User profile not found"); return; }

    if (plan === "free") {
      await base44.entities.UserProfile.update(ps[0].id, {
        subscription_plan: "free",
        subscription_expires: null,
      });
      toast.success(`${email} reset to Free plan`);
    } else {
      const days = plan === "yearly" ? 365 : 30;
      const end = new Date(); end.setDate(end.getDate() + days);
      await base44.entities.UserProfile.update(ps[0].id, {
        subscription_plan: plan,
        subscription_expires: end.toISOString().split("T")[0],
      });
      toast.success(`${email} upgraded to ${plan}`);
    }
    const updatedPs = await base44.entities.UserProfile.list("-created_date", 50);
    setProfiles(updatedPs);
  };

  const handleApprovePayment = async (req) => {
    // Upgrade user
    await handleManualSubscribe(req.user_email, req.plan);
    // Mark request as approved
    await base44.entities.PaymentRequest.update(req.id, { status: "approved" });
    setPaymentRequests(prs => prs.map(p => p.id === req.id ? { ...p, status: "approved" } : p));
    toast.success(`Payment approved — ${req.user_email} upgraded to ${req.plan}`);
  };

  const handleRejectPayment = async (id) => {
    await base44.entities.PaymentRequest.update(id, { status: "rejected" });
    setPaymentRequests(prs => prs.map(p => p.id === id ? { ...p, status: "rejected" } : p));
    toast.success("Payment request rejected");
  };

  const handleAIGenerate = async () => {
    setGenerating(true);
    const topicStr = aiForm.topic ? ` on topic "${aiForm.topic}"` : "";
    const prompt = `Generate ${aiForm.count} multiple choice quiz questions for Nigerian secondary school students.
Class: ${aiForm.class_level}, Subject: ${aiForm.subject}${topicStr}, Difficulty: ${aiForm.difficulty}.
Align with WAEC/NECO/JAMB standards. Return JSON with "questions" array.`;

    const res = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: "object",
        properties: {
          questions: {
            type: "array",
            items: {
              type: "object",
              properties: {
                question_text: { type: "string" }, option_a: { type: "string" }, option_b: { type: "string" },
                option_c: { type: "string" }, option_d: { type: "string" },
                correct_answer: { type: "string" }, explanation: { type: "string" }
              }
            }
          }
        }
      }
    });

    const aiQs = (res?.questions || []).map(q => ({
      ...q,
      class_level: aiForm.class_level,
      subject: aiForm.subject,
      topic: aiForm.topic || "",
      difficulty: aiForm.difficulty,
      is_approved: false,
      source: "ai",
    }));

    if (aiQs.length > 0) {
      await base44.entities.Question.bulkCreate(aiQs);
      toast.success(`${aiQs.length} AI questions generated! Review & approve them below.`);
      const qs = await base44.entities.Question.list("-created_date", 50);
      setQuestions(qs);
    }
    setGenerating(false);
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen"><div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" /></div>;
  }

  const subjects = getSubjectsForClass(form.class_level);
  const pendingQs = questions.filter(q => !q.is_approved);
  const approvedQs = questions.filter(q => q.is_approved);
  const pendingPayments = paymentRequests.filter(p => p.status === "pending");

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6 animate-fade-in">
      <div>
        <h1 className="font-poppins font-bold text-2xl md:text-3xl">Admin Panel</h1>
        <p className="text-muted-foreground text-sm">Manage questions, users, and subscriptions</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Questions", value: questions.length, color: "text-primary" },
          { label: "Pending Approval", value: pendingQs.length, color: "text-orange-500" },
          { label: "Registered Users", value: users.length, color: "text-blue-600" },
          { label: "Active Subscribers", value: profiles.filter(p => p.subscription_plan !== "free").length, color: "text-emerald-600" },
          { label: "Pending Payments", value: pendingPayments.length, color: "text-orange-500" },
        ].map(s => (
          <div key={s.label} className="bg-card border border-border rounded-2xl p-4 text-center">
            <p className={`text-2xl font-bold font-poppins ${s.color}`}>{s.value}</p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      <Tabs defaultValue="questions">
        <TabsList className="flex-wrap h-auto gap-1">
          <TabsTrigger value="questions">Questions</TabsTrigger>
          <TabsTrigger value="add">Add Question</TabsTrigger>
          <TabsTrigger value="ai">AI Generator</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="payments" className="relative">
            Payments
            {pendingPayments.length > 0 && (
              <span className="ml-1.5 bg-orange-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{pendingPayments.length}</span>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Questions list */}
        <TabsContent value="questions" className="mt-5 space-y-4">
          {pendingQs.length > 0 && (
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Badge className="bg-orange-100 text-orange-700 border-orange-200">Pending</Badge>
                {pendingQs.length} questions awaiting approval
              </h3>
              <div className="space-y-2">
                {pendingQs.map(q => (
                  <div key={q.id} className="bg-card border border-orange-200 rounded-xl p-4 flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{q.question_text}</p>
                      <div className="flex gap-2 mt-1 flex-wrap">
                        <Badge variant="outline" className="text-xs">{q.class_level}</Badge>
                        <Badge variant="outline" className="text-xs">{q.subject}</Badge>
                        <Badge variant="outline" className="text-xs">{q.difficulty}</Badge>
                        <Badge variant="outline" className="text-xs">{q.source}</Badge>
                      </div>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <Button size="sm" className="bg-emerald-500 hover:bg-emerald-600 text-white h-8" onClick={() => handleApprove(q.id)}>
                        <Check className="w-3.5 h-3.5" />
                      </Button>
                      <Button size="sm" variant="destructive" className="h-8" onClick={() => handleDelete(q.id)}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <h3 className="font-semibold mb-3">Approved Questions ({approvedQs.length})</h3>
            <div className="space-y-2">
              {approvedQs.slice(0, 20).map(q => (
                <div key={q.id} className="bg-card border border-border rounded-xl p-4 flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm truncate">{q.question_text}</p>
                    <div className="flex gap-2 mt-1 flex-wrap">
                      <Badge variant="outline" className="text-xs">{q.class_level}</Badge>
                      <Badge variant="outline" className="text-xs">{q.subject}</Badge>
                      <Badge variant="outline" className="text-xs">{q.difficulty}</Badge>
                    </div>
                  </div>
                  <Button size="sm" variant="destructive" className="h-8 shrink-0" onClick={() => handleDelete(q.id)}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* Add question */}
        <TabsContent value="add" className="mt-5">
          <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
            <h3 className="font-semibold text-lg">Add Question Manually</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label>Class</Label>
                <Select value={form.class_level} onValueChange={v => setForm(f => ({ ...f, class_level: v, subject: "" }))}>
                  <SelectTrigger><SelectValue placeholder="Select class" /></SelectTrigger>
                  <SelectContent>{CLASS_LEVELS.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Subject</Label>
                <Select value={form.subject} onValueChange={v => setForm(f => ({ ...f, subject: v }))} disabled={!form.class_level}>
                  <SelectTrigger><SelectValue placeholder="Select subject" /></SelectTrigger>
                  <SelectContent>{subjects.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Difficulty</Label>
                <Select value={form.difficulty} onValueChange={v => setForm(f => ({ ...f, difficulty: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{DIFFICULTIES.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Topic (optional)</Label>
              <Input value={form.topic} onChange={e => setForm(f => ({ ...f, topic: e.target.value }))} placeholder="e.g. Algebra" />
            </div>
            <div className="space-y-1.5">
              <Label>Question *</Label>
              <Textarea value={form.question_text} onChange={e => setForm(f => ({ ...f, question_text: e.target.value }))} placeholder="Enter question text..." rows={3} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {["a", "b", "c", "d"].map(opt => (
                <div key={opt} className="space-y-1.5">
                  <Label>Option {opt.toUpperCase()}</Label>
                  <Input value={form[`option_${opt}`]} onChange={e => setForm(f => ({ ...f, [`option_${opt}`]: e.target.value }))} placeholder={`Option ${opt.toUpperCase()}`} />
                </div>
              ))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Correct Answer</Label>
                <Select value={form.correct_answer} onValueChange={v => setForm(f => ({ ...f, correct_answer: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{["A", "B", "C", "D"].map(o => <SelectItem key={o} value={o}>Option {o}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Explanation</Label>
              <Textarea value={form.explanation} onChange={e => setForm(f => ({ ...f, explanation: e.target.value }))} placeholder="Explain the correct answer..." rows={2} />
            </div>
            <Button onClick={handleAddQuestion} className="gradient-card border-0 text-white hover:opacity-90 flex items-center gap-2">
              <Plus className="w-4 h-4" /> Add Question
            </Button>
          </div>
        </TabsContent>

        {/* AI generator */}
        <TabsContent value="ai" className="mt-5">
          <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-secondary" /> AI Question Generator
            </h3>
            <p className="text-sm text-muted-foreground">Generate questions using AI. They'll be saved as "pending" for your review.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-1.5">
                <Label>Class</Label>
                <Select value={aiForm.class_level} onValueChange={v => setAiForm(f => ({ ...f, class_level: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{CLASS_LEVELS.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Subject</Label>
                <Select value={aiForm.subject} onValueChange={v => setAiForm(f => ({ ...f, subject: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{getSubjectsForClass(aiForm.class_level).map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Difficulty</Label>
                <Select value={aiForm.difficulty} onValueChange={v => setAiForm(f => ({ ...f, difficulty: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{DIFFICULTIES.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Count (5-50)</Label>
                <Input type="number" min={5} max={50} value={aiForm.count} onChange={e => setAiForm(f => ({ ...f, count: +e.target.value }))} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Topic (optional)</Label>
              <Input value={aiForm.topic} onChange={e => setAiForm(f => ({ ...f, topic: e.target.value }))} placeholder="e.g. Photosynthesis" />
            </div>
            <Button onClick={handleAIGenerate} disabled={generating} className="gradient-gold border-0 text-white hover:opacity-90 flex items-center gap-2">
              {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              {generating ? "Generating…" : `Generate ${aiForm.count} Questions`}
            </Button>
          </div>
        </TabsContent>

        {/* Users */}
        <TabsContent value="users" className="mt-5">
          {/* Profile Modal */}
          {viewingProfile && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
              <div className="bg-card border border-border rounded-2xl w-full max-w-md shadow-2xl animate-fade-in">
                <div className="flex items-center justify-between p-5 border-b border-border">
                  <h3 className="font-poppins font-bold text-lg">User Profile</h3>
                  <button onClick={() => setViewingProfile(null)} className="p-1 rounded-lg hover:bg-muted">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="p-5 space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-2xl font-bold text-primary">
                      {(viewingProfile.user?.full_name || "?").charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-base">{viewingProfile.user?.full_name || "—"}</p>
                      <p className="text-sm text-muted-foreground">{viewingProfile.user?.email}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    {[
                      { label: "Class Level", value: viewingProfile.profile?.class_level || "—" },
                      { label: "School", value: viewingProfile.profile?.school_name || "—" },
                      { label: "Location", value: viewingProfile.profile?.location || "—" },
                      { label: "Subscription", value: viewingProfile.profile?.subscription_plan || "free" },
                      { label: "Expires", value: viewingProfile.profile?.subscription_expires || "—" },
                      { label: "Quizzes Taken", value: viewingProfile.profile?.total_quizzes_taken ?? 0 },
                      { label: "Avg Score", value: viewingProfile.profile?.average_score ? `${viewingProfile.profile.average_score}%` : "—" },
                      { label: "Credit Tokens", value: viewingProfile.profile?.credit_tokens ?? 0 },
                    ].map(item => (
                      <div key={item.label} className="bg-muted/50 rounded-xl p-3">
                        <p className="text-xs text-muted-foreground mb-0.5">{item.label}</p>
                        <p className="font-semibold">{item.value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-border">
              <h3 className="font-semibold">Registered Users ({users.length})</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left p-3 font-medium">Name</th>
                    <th className="text-left p-3 font-medium">Email</th>
                    <th className="text-left p-3 font-medium">Plan</th>
                    <th className="text-left p-3 font-medium">Class</th>
                    <th className="text-left p-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => {
                    const p = profiles.find(p => p.user_email === u.email);
                    return (
                      <tr key={u.id} className="border-t border-border hover:bg-muted/30">
                        <td className="p-3">{u.full_name}</td>
                        <td className="p-3 text-muted-foreground">{u.email}</td>
                        <td className="p-3">
                          <Badge variant="outline" className={p?.subscription_plan !== "free" ? "border-emerald-300 text-emerald-700" : ""}>
                            {p?.subscription_plan || "free"}
                          </Badge>
                        </td>
                        <td className="p-3">{p?.class_level || "—"}</td>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 text-xs px-2"
                              onClick={() => setViewingProfile({ user: u, profile: p })}
                              title="View Profile"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </Button>
                            <Select onValueChange={plan => handleManualSubscribe(u.email, plan)}>
                              <SelectTrigger className="h-7 text-xs w-28">
                                <SelectValue placeholder="Set plan" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="monthly">Monthly</SelectItem>
                                <SelectItem value="yearly">Yearly</SelectItem>
                              </SelectContent>
                            </Select>
                            {p?.subscription_plan !== "free" && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 text-xs px-2 border-red-200 text-red-600 hover:bg-red-50"
                                onClick={() => handleManualSubscribe(u.email, "free")}
                                title="Reset to Free"
                              >
                                <UserX className="w-3.5 h-3.5" />
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>
        {/* Payments */}
        <TabsContent value="payments" className="mt-5">
          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <h3 className="font-semibold flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-primary" /> Payment Requests ({paymentRequests.length})
              </h3>
              {pendingPayments.length > 0 && (
                <Badge className="bg-orange-100 text-orange-700 border-orange-200">{pendingPayments.length} pending</Badge>
              )}
            </div>
            {paymentRequests.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground text-sm">No payment requests yet.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="text-left p-3 font-medium">User</th>
                      <th className="text-left p-3 font-medium">Plan</th>
                      <th className="text-left p-3 font-medium">Amount</th>
                      <th className="text-left p-3 font-medium">Reference</th>
                      <th className="text-left p-3 font-medium">Status</th>
                      <th className="text-left p-3 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paymentRequests.map(req => (
                      <tr key={req.id} className="border-t border-border hover:bg-muted/30">
                        <td className="p-3">
                          <p className="font-medium">{req.user_name || req.user_email}</p>
                          <p className="text-xs text-muted-foreground">{req.user_email}</p>
                        </td>
                        <td className="p-3">
                          <Badge variant="outline" className={req.plan === "yearly" ? "border-yellow-300 text-yellow-700" : "border-primary/30 text-primary"}>
                            {req.plan}
                          </Badge>
                        </td>
                        <td className="p-3 font-medium">₦{req.amount?.toLocaleString()}</td>
                        <td className="p-3 text-xs text-muted-foreground font-mono">{req.payment_reference || "—"}</td>
                        <td className="p-3">
                          <Badge className={
                            req.status === "approved" ? "bg-emerald-100 text-emerald-700 border-emerald-200" :
                            req.status === "rejected" ? "bg-red-100 text-red-700 border-red-200" :
                            "bg-orange-100 text-orange-700 border-orange-200"
                          }>
                            {req.status}
                          </Badge>
                        </td>
                        <td className="p-3">
                          {req.status === "pending" && (
                            <div className="flex gap-2">
                              <Button size="sm" className="bg-emerald-500 hover:bg-emerald-600 text-white h-7 px-2 text-xs" onClick={() => handleApprovePayment(req)}>
                                <Check className="w-3.5 h-3.5 mr-1" /> Approve
                              </Button>
                              <Button size="sm" variant="destructive" className="h-7 px-2 text-xs" onClick={() => handleRejectPayment(req.id)}>
                                Reject
                              </Button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}