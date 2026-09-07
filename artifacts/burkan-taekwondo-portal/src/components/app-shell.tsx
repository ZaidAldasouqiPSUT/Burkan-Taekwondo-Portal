import { ReactNode, useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { useRole } from "@/lib/role-store";
import { 
  Home, 
  Users, 
  ClipboardCheck, 
  Award, 
  MessageSquare, 
  CreditCard, 
  CalendarDays, 
  Newspaper, 
  MapPin, 
  Info, 
  Settings, 
  Menu,
  X,
  LogOut,
  Shield
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle, SheetClose } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

const ALL_NAV_ITEMS = [
  { href: "/", label: "Dashboard", icon: Home, roles: ["parent", "student", "coach", "admin"] },
  { href: "/students", label: "Students", icon: Users, roles: ["parent", "coach", "admin"] },
  { href: "/attendance", label: "Attendance", icon: ClipboardCheck, roles: ["student", "parent", "coach", "admin"] },
  { href: "/belt-tests", label: "Belt Tests", icon: Award, roles: ["student", "parent", "coach", "admin"] },
  { href: "/schedule", label: "Schedule", icon: CalendarDays, roles: ["student", "parent", "coach", "admin"] },
  { href: "/feedback", label: "Feedback", icon: MessageSquare, roles: ["student", "parent", "coach", "admin"] },
  { href: "/finances", label: "Finances", icon: CreditCard, roles: ["student", "parent", "admin"] },
  { href: "/news", label: "News", icon: Newspaper, roles: ["student", "parent", "coach", "admin"] },
  { href: "/locations", label: "Locations", icon: MapPin, roles: ["student", "parent", "coach", "admin"] },
  { href: "/about", label: "About Us", icon: Info, roles: ["student", "parent", "coach", "admin"] },
];

export function AppShell({ children }: { children: ReactNode }) {
  const [location, setLocation] = useLocation();
  const { role, login, logout, isAuthenticated } = useRole();
  const queryClient = useQueryClient();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);

  useEffect(() => {
    if (!isAuthenticated && location !== "/login") {
      setLocation("/login");
    } else if (isAuthenticated && location === "/login") {
      setLocation("/");
    }
  }, [isAuthenticated, location, setLocation]);

  if (!isAuthenticated) {
    return <>{children}</>;
  }

  const isAuthPage = location === "/login";
  if (isAuthPage) return <>{children}</>;

  const handleLogout = () => {
    setMobileMenuOpen(false);
    setMoreMenuOpen(false);
    queryClient.clear();
    logout();
    setLocation("/login");
  };

  const handleRoleChange = (nextRole: "parent" | "student" | "coach") => {
    setMobileMenuOpen(false);
    setMoreMenuOpen(false);
    login(nextRole);
    setLocation("/");
  };

  const navItems = ALL_NAV_ITEMS.filter(item => role && item.roles.includes(role));

  
  // Mobile bottom nav items (max 4 + 'More' menu)
  const mobileNavItems = navItems.slice(0, 4);

  return (
    <div className="flex min-h-[100dvh] w-full flex-col bg-muted/30 md:flex-row">
      {/* Desktop Sidebar */}
      <aside className="hidden w-64 flex-col border-r bg-card md:flex">
        <div className="flex h-16 items-center border-b px-6">
          <Link href="/" className="flex items-center gap-2 font-display text-xl font-bold text-primary">
            <Award className="h-6 w-6" />
            <span>BURKAN TKD</span>
          </Link>
        </div>
        
        <div className="flex flex-1 flex-col overflow-y-auto py-4">
          <nav className="flex-1 space-y-1 px-4">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <div className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                  location === item.href ? "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground" : "text-muted-foreground"
                )}>
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </div>
              </Link>
            ))}
          </nav>
          
          <div className="mt-auto px-4 pt-4 border-t">
            <Link href="/settings">
              <div className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground cursor-pointer">
                <Settings className="h-5 w-5" />
                Settings
              </div>
            </Link>
            <div 
              className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-destructive hover:bg-destructive/10 mt-1 cursor-pointer"
              onClick={handleLogout}
            >
              <LogOut className="h-5 w-5" />
              Sign Out
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-card px-4 md:hidden">
        <Link href="/" className="flex items-center gap-2 font-display text-xl font-bold text-primary">
          <Award className="h-6 w-6" />
          <span>BURKAN TKD</span>
        </Link>
        
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="-mr-2">
              <Menu className="h-6 w-6" />
              <span className="sr-only">Toggle navigation menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[80vw] sm:w-[385px] p-0 flex flex-col">
            <SheetHeader className="p-6 border-b text-left">
              <SheetTitle className="flex items-center gap-2 font-display text-xl font-bold text-primary">
                <Award className="h-6 w-6" />
                BURKAN TKD
              </SheetTitle>
            </SheetHeader>
            <div className="flex-1 overflow-y-auto py-4">
              <nav className="flex flex-col space-y-1 px-4">
                {navItems.map((item) => (
                  <SheetClose asChild key={item.href}>
                    <Link href={item.href}>
                      <div className={cn(
                        "flex items-center gap-3 rounded-md px-3 py-3 text-sm font-medium transition-colors",
                        location === item.href ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                      )}>
                        <item.icon className="h-5 w-5" />
                        {item.label}
                      </div>
                    </Link>
                  </SheetClose>
                ))}
                
                <div className="my-4 h-px bg-border" />
                
                <SheetClose asChild>
                  <Link href="/settings">
                    <div className="flex items-center gap-3 rounded-md px-3 py-3 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground cursor-pointer">
                      <Settings className="h-5 w-5" />
                      Settings
                    </div>
                  </Link>
                </SheetClose>
                <SheetClose asChild>
                  <div 
                    className="flex items-center gap-3 rounded-md px-3 py-3 text-sm font-medium text-destructive hover:bg-destructive/10 cursor-pointer"
                    onClick={handleLogout}
                  >
                    <LogOut className="h-5 w-5" />
                    Sign Out
                  </div>
                </SheetClose>
              </nav>
            </div>
            
            {/* Prototype Role Switcher */}
            <div className="p-4 border-t bg-muted/30">
              <div className="text-xs font-semibold text-muted-foreground mb-3 flex items-center gap-2 uppercase tracking-wider">
                <Shield className="h-4 w-4" /> 
                Prototype Role
              </div>
              <div className="grid grid-cols-2 gap-2">
                {(['parent', 'student', 'coach'] as const).map(r => (
                  <Button 
                    key={r} 
                    variant={role === r ? "default" : "outline"}
                    size="sm"
                    className="capitalize text-xs"
                    onClick={() => handleRoleChange(r)}
                  >
                    {r}
                  </Button>
                ))}
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
        {/* Prototype role indicator for desktop */}
        <div className="hidden md:flex items-center justify-end px-8 py-2 bg-card border-b border-border/50 sticky top-0 z-10 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground font-medium text-xs">Viewing as:</span>
            <select 
              className="bg-transparent border-none text-primary font-bold text-sm capitalize focus:ring-0 outline-none cursor-pointer"
              value={role || ""}
              onChange={(e) => handleRoleChange(e.target.value as "parent" | "student" | "coach")}
            >
              <option value="student">Student</option>
              <option value="parent">Parent</option>
              <option value="coach">Coach</option>
            </select>
          </div>
        </div>
        
        {children}
      </main>

      {/* Mobile Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 z-40 border-t bg-card pb-[env(safe-area-inset-bottom)] md:hidden">
        <nav className="flex h-16 items-center justify-around px-2">
          {mobileNavItems.map((item) => {
            const isActive = location === item.href;
            return (
              <Link key={item.href} href={item.href} className="flex h-full flex-1 flex-col items-center justify-center gap-1">
                <div className={cn(
                  "flex flex-col items-center justify-center w-full h-full",
                  isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                )}>
                  <item.icon className={cn("h-5 w-5 mb-1", isActive && "fill-primary/20")} />
                  <span className="text-[10px] font-medium">{item.label}</span>
                </div>
              </Link>
            )
          })}
          {/* We replace the 5th item with the 'More' button that just opens the sheet if there are many */}
          {navItems.length > 4 && (
            <Sheet open={moreMenuOpen} onOpenChange={setMoreMenuOpen}>
              <SheetTrigger asChild>
                <button type="button" className="flex h-full flex-1 flex-col items-center justify-center gap-1 cursor-pointer text-muted-foreground hover:text-foreground">
                  <Menu className="h-5 w-5 mb-1" />
                  <span className="text-[10px] font-medium">More</span>
                </button>
              </SheetTrigger>
              <SheetContent side="bottom" className="h-[80dvh] rounded-t-xl px-0 pt-6">
                <SheetHeader className="px-6 mb-4 text-left">
                  <SheetTitle>Menu</SheetTitle>
                </SheetHeader>
                <div className="px-4 overflow-y-auto pb-8 space-y-1">
                  {navItems.map((item) => (
                    <SheetClose asChild key={item.href}>
                      <Link href={item.href}>
                        <div className={cn(
                          "flex items-center gap-3 rounded-md px-3 py-3 text-sm font-medium transition-colors",
                          location === item.href ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                        )}>
                          <item.icon className="h-5 w-5" />
                          {item.label}
                        </div>
                      </Link>
                    </SheetClose>
                  ))}
                  
                  <div className="my-4 h-px bg-border" />
                  
                  <div className="px-2 text-xs font-semibold text-muted-foreground mb-3 flex items-center gap-2 uppercase tracking-wider">
                    <Shield className="h-4 w-4" /> 
                    Prototype Role
                  </div>
                  <div className="grid grid-cols-2 gap-2 mb-6">
                    {(['parent', 'student', 'coach'] as const).map(r => (
                      <Button 
                        key={r} 
                        variant={role === r ? "default" : "outline"}
                        size="sm"
                        className="capitalize text-xs"
                        onClick={() => handleRoleChange(r)}
                      >
                        {r}
                      </Button>
                    ))}
                  </div>

                  <SheetClose asChild>
                    <Link href="/settings">
                      <div className="flex items-center gap-3 rounded-md px-3 py-3 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground cursor-pointer">
                        <Settings className="h-5 w-5" />
                        Settings
                      </div>
                    </Link>
                  </SheetClose>
                  <SheetClose asChild>
                    <div 
                      className="flex items-center gap-3 rounded-md px-3 py-3 text-sm font-medium text-destructive hover:bg-destructive/10 cursor-pointer"
                      onClick={handleLogout}
                    >
                      <LogOut className="h-5 w-5" />
                      Sign Out
                    </div>
                  </SheetClose>
                </div>
              </SheetContent>
            </Sheet>
          )}
        </nav>
      </div>
    </div>
  );
}
