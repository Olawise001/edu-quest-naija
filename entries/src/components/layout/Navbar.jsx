import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Menu, X, GraduationCap, UserCircle, FlaskConical, Trophy } from "lucide-react";

export default function Navbar({ user }) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    base44.auth.logout("/");
  };

  return (
    <nav className="sticky top-0 z-50 bg-card/95 backdrop-blur border-b border-border shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl gradient-card flex items-center justify-center shadow-md">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-poppins font-bold text-primary text-base leading-none">QuizNaija</span>
              <p className="text-[10px] text-muted-foreground leading-none">Nigerian Quiz Platform</p>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-2">
            {user ? (
              <>
                <Link to="/dashboard">
                  <Button variant="ghost" size="sm">Dashboard</Button>
                </Link>
                <Link to="/research">
                  <Button variant="ghost" size="sm" className="flex items-center gap-1.5">
                    <FlaskConical className="w-4 h-4" />Research
                  </Button>
                </Link>
                <Link to="/leaderboard">
                  <Button variant="ghost" size="sm" className="flex items-center gap-1.5">
                    <Trophy className="w-4 h-4" />Leaderboard
                  </Button>
                </Link>
                <Link to="/profile">
                  <Button variant="ghost" size="sm" className="flex items-center gap-1.5">
                    <UserCircle className="w-4 h-4" />Profile
                  </Button>
                </Link>
                {user.role === "admin" && (
                  <Link to="/admin">
                    <Button variant="ghost" size="sm">Admin Panel</Button>
                  </Link>
                )}
                <Button size="sm" variant="outline" onClick={handleLogout}>Logout</Button>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" size="sm">Login</Button>
                </Link>
                <Link to="/register">
                  <Button size="sm" className="bg-primary text-primary-foreground">Get Started</Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile toggle */}
          <button className="md:hidden p-2" onClick={() => setOpen(!open)}>
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {open && (
          <div className="md:hidden py-3 border-t border-border space-y-1">
            {user ? (
              <>
                <Link to="/dashboard" className="block px-3 py-2 text-sm rounded-lg hover:bg-muted" onClick={() => setOpen(false)}>Dashboard</Link>
                <Link to="/research" className="block px-3 py-2 text-sm rounded-lg hover:bg-muted" onClick={() => setOpen(false)}>Research</Link>
                <Link to="/leaderboard" className="block px-3 py-2 text-sm rounded-lg hover:bg-muted" onClick={() => setOpen(false)}>Leaderboard</Link>
                <Link to="/profile" className="block px-3 py-2 text-sm rounded-lg hover:bg-muted" onClick={() => setOpen(false)}>Profile</Link>
                {user.role === "admin" && (
                  <Link to="/admin" className="block px-3 py-2 text-sm rounded-lg hover:bg-muted" onClick={() => setOpen(false)}>Admin Panel</Link>
                )}
                <button onClick={handleLogout} className="block w-full text-left px-3 py-2 text-sm rounded-lg hover:bg-muted text-destructive">Logout</button>
              </>
            ) : (
              <>
                <Link to="/login" className="block px-3 py-2 text-sm rounded-lg hover:bg-muted" onClick={() => setOpen(false)}>Login</Link>
                <Link to="/register" className="block px-3 py-2 text-sm rounded-lg hover:bg-muted font-medium text-primary" onClick={() => setOpen(false)}>Get Started</Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}