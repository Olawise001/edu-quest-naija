import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { GraduationCap, BookOpen, Zap, Shield, BarChart3, Users, CheckCircle, Star } from "lucide-react";
import { CLASS_LEVELS } from "@/lib/constants";

const features = [
  { icon: BookOpen, title: "All Nigerian Subjects", desc: "Mathematics, English, Sciences, Arts & more covering JSS1–SS3 curriculum." },
  { icon: Zap, title: "Intelligent Questions", desc: "Fresh intelligent questions for every quiz — no repetition, always challenging." },
  { icon: BarChart3, title: "Track Your Progress", desc: "Detailed score history, performance trends and grade analytics." },
  { icon: Shield, title: "Exam-Ready Practice", desc: "Questions mapped to WAEC, NECO & JAMB standards for real exam prep." },
];

export default function Landing() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="gradient-hero text-white py-20 px-4 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-40 h-40 rounded-full bg-white" />
          <div className="absolute bottom-10 right-20 w-60 h-60 rounded-full bg-white" />
          <div className="absolute top-1/2 left-1/2 w-32 h-32 rounded-full bg-yellow-300" />
        </div>
        <div className="max-w-4xl mx-auto text-center relative">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 text-white/90 text-sm font-medium mb-6">
            <Star className="w-4 h-4 text-yellow-300 fill-yellow-300" />
            Nigeria's #1 School Quiz Platform
          </div>
          <h1 className="font-poppins font-bold text-4xl md:text-6xl mb-5 leading-tight">
            Ace Your Exams with<br />
            <span className="text-yellow-300">Smart Practice</span>
          </h1>
          <p className="text-white/80 text-lg md:text-xl mb-10 max-w-2xl mx-auto leading-relaxed">
            Practice with intelligent quiz questions tailored to your class and subject. 
            From JSS1 to SS3 — covering all major Nigerian school subjects.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link to="/register">
              <Button size="lg" className="bg-secondary text-secondary-foreground hover:bg-secondary/90 font-bold shadow-xl px-8 h-13">
                Start Free Today →
              </Button>
            </Link>
            <Link to="/login">
              <Button size="lg" variant="outline" className="border-white/40 text-white hover:bg-white/20 bg-white/10 px-8">
                I have an account
              </Button>
            </Link>
          </div>
          {/* Class tags */}
          <div className="flex flex-wrap justify-center gap-2 mt-10">
            {CLASS_LEVELS.map(c => (
              <span key={c} className="px-3 py-1 rounded-full bg-white/20 text-white/90 text-sm font-medium">{c}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 px-4 bg-card border-b border-border">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { num: "20+", label: "Subjects" },
            { num: "1000+", label: "Questions" },
            { num: "6", label: "Class Levels" },
            { num: "3", label: "Difficulty Levels" },
          ].map(s => (
            <div key={s.label}>
              <p className="text-3xl font-bold font-poppins text-primary">{s.num}</p>
              <p className="text-sm text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="font-poppins font-bold text-3xl md:text-4xl mb-3">Everything You Need to Excel</h2>
            <p className="text-muted-foreground text-lg">Designed specifically for Nigerian secondary school students</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map(f => (
              <div key={f.title} className="bg-card border border-border rounded-2xl p-6 hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <f.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{f.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing teaser */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-poppins font-bold text-3xl mb-3">Simple, Fair Pricing</h2>
            <p className="text-muted-foreground">Start free. Upgrade when you're ready.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Free */}
            <div className="bg-card border border-border rounded-2xl p-6">
              <p className="text-sm font-medium text-muted-foreground mb-1">Free Forever</p>
              <p className="text-3xl font-bold font-poppins mb-4">₦0</p>
              {["10 questions/day", "Easy level only", "Basic corrections"].map(f => (
                <div key={f} className="flex items-center gap-2 mb-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-emerald-500" />{f}
                </div>
              ))}
              <Link to="/register" className="block mt-5">
                <Button variant="outline" className="w-full">Get Started Free</Button>
              </Link>
            </div>
            {/* Monthly */}
            <div className="bg-card border-2 border-primary rounded-2xl p-6 shadow-lg relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full">POPULAR</div>
              <p className="text-sm font-medium text-primary mb-1">Monthly</p>
              <p className="text-3xl font-bold font-poppins mb-4">₦1,500<span className="text-base font-normal text-muted-foreground">/mo</span></p>
              {["Unlimited questions", "All 3 difficulty levels", "Full explanations", "Progress tracking"].map(f => (
                <div key={f} className="flex items-center gap-2 mb-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-primary" />{f}
                </div>
              ))}
              <Link to="/pricing" className="block mt-5">
                <Button className="w-full gradient-card border-0 text-white hover:opacity-90">Subscribe Monthly</Button>
              </Link>
            </div>
            {/* Yearly */}
            <div className="bg-card border border-border rounded-2xl p-6">
              <p className="text-sm font-medium text-muted-foreground mb-1">Yearly</p>
              <p className="text-3xl font-bold font-poppins mb-4">₦12,000<span className="text-base font-normal text-muted-foreground">/yr</span></p>
              {["Everything in Monthly", "Save 33%", "Priority support", "Performance analytics"].map(f => (
                <div key={f} className="flex items-center gap-2 mb-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-emerald-500" />{f}
                </div>
              ))}
              <Link to="/pricing" className="block mt-5">
                <Button variant="outline" className="w-full">Subscribe Yearly</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 gradient-hero text-white text-center">
        <h2 className="font-poppins font-bold text-3xl md:text-4xl mb-4">Ready to Start Practicing?</h2>
        <p className="text-white/80 text-lg mb-8">Join thousands of Nigerian students improving their grades daily.</p>
        <Link to="/register">
          <Button size="lg" className="bg-white text-primary hover:bg-white/90 font-bold shadow-xl px-10">
            Create Free Account
          </Button>
        </Link>
      </section>

      <footer className="py-8 px-4 bg-card border-t border-border text-center text-sm text-muted-foreground space-y-2">
        <p>© 2026 QuizNaija — Nigerian School Quiz Test Platform. Built for Nigerian students. 🇳🇬</p>
        <div className="flex flex-wrap justify-center gap-4 text-xs">
          <a href="https://wa.me/2348157361339" target="_blank" rel="noopener noreferrer" className="hover:text-primary">📱 WhatsApp: 08157361339</a>
          <a href="mailto:olawiseinfinityhub@gmail.com" className="hover:text-primary">✉️ olawiseinfinityhub@gmail.com</a>
        </div>
      </footer>
    </div>
  );
}