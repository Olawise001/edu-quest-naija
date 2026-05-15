import { useState } from "react";
import { CLASS_LEVELS, getSubjectsForClass, DIFFICULTIES, TOPICS_BY_SUBJECT } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { BookOpen, GraduationCap, Target, Layers, Hash, Lock } from "lucide-react";
import { isSubscriptionActive } from "@/lib/quizUtils";
import { Badge } from "@/components/ui/badge";

export default function QuizSetup({ profile, onStart }) {
  const [classLevel, setClassLevel] = useState(profile?.class_level || "");
  const [subject, setSubject] = useState("");
  const [topic, setTopic] = useState("");
  const [difficulty, setDifficulty] = useState("Easy");
  const [numQuestions, setNumQuestions] = useState(10);

  const isPaid = isSubscriptionActive(profile);
  const subjects = getSubjectsForClass(classLevel);
  const topics = TOPICS_BY_SUBJECT[subject] || [];

  const handleStart = () => {
    if (!classLevel || !subject || !difficulty) return;
    onStart({ classLevel, subject, topic, difficulty, numQuestions });
  };

  const difficultyInfo = {
    Easy: { color: "bg-emerald-100 text-emerald-700 border-emerald-200", desc: "Basic concepts, suitable for revision" },
    Medium: { color: "bg-yellow-100 text-yellow-700 border-yellow-200", desc: "Intermediate level, exam preparation" },
    Hard: { color: "bg-red-100 text-red-700 border-red-200", desc: "Advanced, challenging questions" },
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Class */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-sm font-medium">
            <GraduationCap className="w-4 h-4 text-primary" /> Select Class
          </Label>
          <Select value={classLevel} onValueChange={(v) => { setClassLevel(v); setSubject(""); setTopic(""); }}>
            <SelectTrigger className="h-11">
              <SelectValue placeholder="Choose your class..." />
            </SelectTrigger>
            <SelectContent>
              {CLASS_LEVELS.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {/* Subject */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-sm font-medium">
            <BookOpen className="w-4 h-4 text-primary" /> Select Subject
          </Label>
          <Select value={subject} onValueChange={(v) => { setSubject(v); setTopic(""); }} disabled={!classLevel}>
            <SelectTrigger className="h-11">
              <SelectValue placeholder={classLevel ? "Choose subject..." : "Select class first"} />
            </SelectTrigger>
            <SelectContent>
              {subjects.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {/* Topic */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-sm font-medium">
            <Layers className="w-4 h-4 text-primary" /> Topic <span className="text-muted-foreground font-normal">(optional)</span>
          </Label>
          <Select value={topic} onValueChange={setTopic} disabled={!subject || topics.length === 0}>
            <SelectTrigger className="h-11">
              <SelectValue placeholder={topics.length > 0 ? "All topics" : "No topics available"} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={null}>All Topics</SelectItem>
              {topics.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {/* Number of Questions */}
        <div className="space-y-3">
          <Label className="flex items-center gap-2 text-sm font-medium">
            <Hash className="w-4 h-4 text-primary" /> Number of Questions: <span className="text-primary font-bold">{numQuestions}</span>
          </Label>
          <div className="px-1 pt-2">
            <Slider
              min={5}
              max={isPaid ? 50 : 10}
              step={5}
              value={[numQuestions]}
              onValueChange={([v]) => setNumQuestions(v)}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>5</span>
              <span>{isPaid ? "50" : "10 (Free limit)"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Difficulty */}
      <div className="space-y-3">
        <Label className="flex items-center gap-2 text-sm font-medium">
          <Target className="w-4 h-4 text-primary" /> Difficulty Level
        </Label>
        <div className="grid grid-cols-3 gap-3">
          {DIFFICULTIES.map(d => {
            const locked = !isPaid && d !== "Easy";
            return (
              <button
                key={d}
                onClick={() => !locked && setDifficulty(d)}
                disabled={locked}
                className={`relative p-3 rounded-xl border-2 text-left transition-all ${
                  difficulty === d
                    ? "border-primary bg-primary/5 shadow-md"
                    : locked
                    ? "border-border bg-muted/50 opacity-60 cursor-not-allowed"
                    : "border-border hover:border-primary/50 hover:bg-muted/50"
                }`}
              >
                {locked && (
                  <Lock className="absolute top-2 right-2 w-3.5 h-3.5 text-muted-foreground" />
                )}
                <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium border ${difficultyInfo[d].color} mb-1`}>{d}</span>
                <p className="text-xs text-muted-foreground leading-tight">{difficultyInfo[d].desc}</p>
                {locked && <p className="text-[10px] text-secondary font-medium mt-1">Paid only</p>}
              </button>
            );
          })}
        </div>
      </div>

      <Button
        onClick={handleStart}
        disabled={!classLevel || !subject}
        className="w-full h-12 text-base font-semibold gradient-card text-white border-0 hover:opacity-90 transition-opacity shadow-lg"
      >
        Start Quiz →
      </Button>
    </div>
  );
}