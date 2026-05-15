import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Lightbulb, FlaskConical, Calculator, Cpu, Palette, RefreshCw, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";

const CATEGORIES = [
  { key: "science", label: "Science", icon: FlaskConical, color: "text-emerald-600", bg: "bg-emerald-50 border-emerald-200" },
  { key: "mathematics", label: "Mathematics", icon: Calculator, color: "text-blue-600", bg: "bg-blue-50 border-blue-200" },
  { key: "engineering", label: "Engineering", icon: Cpu, color: "text-orange-600", bg: "bg-orange-50 border-orange-200" },
  { key: "art", label: "Art & Culture", icon: Palette, color: "text-purple-600", bg: "bg-purple-50 border-purple-200" },
];

const SAMPLE_IMAGES = {
  science: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=400&q=80",
  mathematics: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400&q=80",
  engineering: "https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=400&q=80",
  art: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=400&q=80",
};

export default function Research() {
  const [facts, setFacts] = useState({});
  const [loading, setLoading] = useState(false);
  const [loadedOnce, setLoadedOnce] = useState(false);
  const [expanded, setExpanded] = useState({});

  const loadFacts = async () => {
    setLoading(true);
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `Generate 3 fascinating and accurate fun facts for each of these categories: Science, Mathematics, Engineering, and Art.
Each fact should be educational, engaging, and suitable for Nigerian secondary school students (JSS1–SS3).
Make facts concise (2–3 sentences), surprising, and clearly true.`,
      response_json_schema: {
        type: "object",
        properties: {
          science: { type: "array", items: { type: "object", properties: { title: { type: "string" }, fact: { type: "string" } } } },
          mathematics: { type: "array", items: { type: "object", properties: { title: { type: "string" }, fact: { type: "string" } } } },
          engineering: { type: "array", items: { type: "object", properties: { title: { type: "string" }, fact: { type: "string" } } } },
          art: { type: "array", items: { type: "object", properties: { title: { type: "string" }, fact: { type: "string" } } } },
        }
      }
    });
    setFacts(result || {});
    setLoading(false);
    setLoadedOnce(true);
  };

  useEffect(() => { loadFacts(); }, []);

  const toggleExpand = (key) => setExpanded(e => ({ ...e, [key]: !e[key] }));

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 animate-fade-in space-y-8">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
          <Lightbulb className="w-4 h-4" /> Knowledge Hub
        </div>
        <h1 className="font-poppins font-bold text-3xl md:text-4xl">Research & Fun Facts</h1>
        <p className="text-muted-foreground max-w-xl mx-auto">
          Explore amazing facts across Science, Mathematics, Engineering and Art — refreshed just for you!
        </p>
        <Button onClick={loadFacts} disabled={loading} variant="outline" className="gap-2">
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          {loading ? "Loading new facts…" : "Refresh Facts"}
        </Button>
      </div>

      {/* Loading skeleton */}
      {loading && !loadedOnce && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {CATEGORIES.map(cat => (
            <div key={cat.key} className="bg-card border border-border rounded-2xl overflow-hidden animate-pulse">
              <div className="h-40 bg-muted" />
              <div className="p-5 space-y-3">
                <div className="h-5 bg-muted rounded w-1/3" />
                <div className="h-3 bg-muted rounded w-full" />
                <div className="h-3 bg-muted rounded w-4/5" />
                <div className="h-3 bg-muted rounded w-3/4" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Facts grid */}
      {loadedOnce && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {CATEGORIES.map(cat => {
            const catFacts = facts[cat.key] || [];
            const Icon = cat.icon;
            const isExpanded = expanded[cat.key];
            const visibleFacts = isExpanded ? catFacts : catFacts.slice(0, 2);

            return (
              <div key={cat.key} className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                {/* Image */}
                <div className="relative h-44 overflow-hidden">
                  <img
                    src={SAMPLE_IMAGES[cat.key]}
                    alt={cat.label}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-3 left-4 flex items-center gap-2 text-white">
                    <div className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur flex items-center justify-center">
                      <Icon className="w-4 h-4 text-white" />
                    </div>
                    <span className="font-poppins font-bold text-lg">{cat.label}</span>
                  </div>
                </div>

                {/* Facts */}
                <div className="p-5 space-y-3">
                  {loading ? (
                    <div className="space-y-2">
                      <div className="h-3 bg-muted rounded w-full animate-pulse" />
                      <div className="h-3 bg-muted rounded w-4/5 animate-pulse" />
                    </div>
                  ) : catFacts.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No facts available. Try refreshing.</p>
                  ) : (
                    <>
                      {visibleFacts.map((item, i) => (
                        <div key={i} className={`rounded-xl p-3 border ${cat.bg}`}>
                          <p className={`text-xs font-bold uppercase tracking-wide mb-1 ${cat.color}`}>💡 {item.title}</p>
                          <p className="text-sm text-foreground leading-relaxed">{item.fact}</p>
                        </div>
                      ))}
                      {catFacts.length > 2 && (
                        <button
                          onClick={() => toggleExpand(cat.key)}
                          className={`flex items-center gap-1 text-xs font-medium ${cat.color} hover:underline`}
                        >
                          {isExpanded ? <><ChevronUp className="w-3.5 h-3.5" /> Show less</> : <><ChevronDown className="w-3.5 h-3.5" /> Show more facts</>}
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}