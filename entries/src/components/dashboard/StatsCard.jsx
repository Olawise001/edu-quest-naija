export default function StatsCard({ icon: Icon, label, value, sub, color = "text-primary", bg = "bg-primary/10" }) {
  return (
    <div className="bg-card rounded-2xl border border-border p-5 flex items-start gap-4 shadow-sm">
      <div className={`w-11 h-11 rounded-xl ${bg} flex items-center justify-center shrink-0`}>
        <Icon className={`w-5 h-5 ${color}`} />
      </div>
      <div>
        <p className="text-2xl font-bold font-poppins text-foreground">{value}</p>
        <p className="text-sm font-medium text-foreground">{label}</p>
        {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}