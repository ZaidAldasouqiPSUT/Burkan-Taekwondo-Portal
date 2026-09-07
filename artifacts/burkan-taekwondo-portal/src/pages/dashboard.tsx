import { useGetDashboardSummary } from "@workspace/api-client-react";
import { useRole } from "@/lib/role-store";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CalendarDays, Users, TrendingUp, AlertCircle, Award, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function Dashboard() {
  const { role } = useRole();
  const { data: summary, isLoading, error } = useGetDashboardSummary();

  if (isLoading) {
    return (
      <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
        <Skeleton className="h-48 w-full rounded-xl" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Skeleton className="h-32 w-full rounded-xl" />
          <Skeleton className="h-32 w-full rounded-xl" />
          <Skeleton className="h-32 w-full rounded-xl" />
          <Skeleton className="h-32 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  if (error || !summary) {
    return (
      <div className="p-8 text-center text-destructive">
        Failed to load dashboard.
      </div>
    );
  }

  return (
    <div className="min-h-full bg-muted/20 pb-8">
      {/* HERO HERO HERO */}
      <div className="relative overflow-hidden bg-black text-white px-6 py-12 md:px-12 md:py-20 lg:py-24">
        {/* Background Image & Gradient overlay */}
        <div className="absolute inset-0 z-0">
          <img 
            src="/assets/Sarah_Abu_Jaish_and_Islam_composite_1788557360818.png" 
            alt="Burkan Champions" 
            className="w-full h-full object-cover object-center opacity-40 mix-blend-luminosity"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
        </div>

        <div className="relative z-10 max-w-4xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/20 text-primary border border-primary/30 mb-6 text-sm font-bold uppercase tracking-widest">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            {role?.toUpperCase()} PORTAL
          </div>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-display font-bold leading-tight tracking-tighter mb-4">
            WELCOME BACK, <br />
            <span className="text-primary">{summary.displayName}</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-300 max-w-2xl leading-relaxed mb-8">
            Stay disciplined. Track your progress. Never back down. This is Burkan Taekwondo.
          </p>

          <div className="flex flex-wrap gap-4">
            <Button asChild size="lg" className="font-bold tracking-wide uppercase h-14 px-8 text-base">
              <Link href="/schedule">View Schedule</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="bg-transparent border-white text-white hover:bg-white/10 font-bold tracking-wide uppercase h-14 px-8 text-base">
              <Link href="/attendance">My Attendance</Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="px-4 md:px-8 max-w-7xl mx-auto -mt-8 relative z-20 space-y-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {(role === 'coach' || role === 'admin') && (
            <Card className="shadow-lg border-none hover-elevate">
              <CardContent className="p-6">
                <Users className="h-8 w-8 text-primary mb-4" />
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-1">Active Students</p>
                <h3 className="text-3xl font-display font-bold">{summary.activeStudents}</h3>
              </CardContent>
            </Card>
          )}

          <Card className="shadow-lg border-none hover-elevate">
            <CardContent className="p-6">
              <TrendingUp className="h-8 w-8 text-green-500 mb-4" />
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-1">Attendance Rate</p>
              <h3 className="text-3xl font-display font-bold">{summary.attendanceRate}%</h3>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-none hover-elevate">
            <CardContent className="p-6">
              <Award className="h-8 w-8 text-amber-500 mb-4" />
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-1">Next Belt Test</p>
              <h3 className="text-2xl font-display font-bold mt-1 text-balance leading-none">{summary.nextTestDate}</h3>
            </CardContent>
          </Card>

          {(role === 'parent' || role === 'student' || role === 'admin') && (
            <Card className="shadow-lg border-none hover-elevate bg-primary/5 border-primary/20">
              <CardContent className="p-6">
                <AlertCircle className="h-8 w-8 text-primary mb-4" />
                <p className="text-sm font-medium text-primary uppercase tracking-wider mb-1">Balance Due</p>
                <h3 className="text-3xl font-display font-bold text-primary">${summary.outstandingBalance}</h3>
              </CardContent>
            </Card>
          )}

          {(role === 'coach' || role === 'parent') && summary.unreadFeedback > 0 && (
            <Card className="shadow-lg border-none hover-elevate bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:border-amber-900/50">
              <CardContent className="p-6">
                <MessageSquare className="h-8 w-8 text-amber-600 mb-4" />
                <p className="text-sm font-medium text-amber-700 dark:text-amber-500 uppercase tracking-wider mb-1">Unread Feedback</p>
                <h3 className="text-3xl font-display font-bold text-amber-700 dark:text-amber-400">{summary.unreadFeedback}</h3>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Action Banners */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="overflow-hidden border-none shadow-md group cursor-pointer hover-elevate">
            <div className="flex h-full">
              <div className="w-1/3 bg-black relative">
                <img src="/assets/Islam_Al_Natsheh_1788557360820.png" alt="Champion" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent to-card"></div>
              </div>
              <div className="w-2/3 p-6 flex flex-col justify-center">
                <div className="text-xs font-bold text-primary tracking-widest uppercase mb-2">Club News</div>
                <h3 className="font-display text-xl font-bold mb-2">National Team Selection 2026</h3>
                <p className="text-muted-foreground text-sm mb-4 line-clamp-2">Islam Al Natsheh represents Jordan! Read about our champions and club achievements.</p>
                <Link href="/news" className="text-primary font-bold text-sm flex items-center gap-1 mt-auto hover:underline">
                  READ MORE &rarr;
                </Link>
              </div>
            </div>
          </Card>

          <Card className="overflow-hidden border-none shadow-md group cursor-pointer hover-elevate">
            <div className="flex h-full">
              <div className="w-1/3 bg-primary relative">
                <img src="/assets/Burkan1_1788557360822.png" alt="Burkan Logo" className="w-full h-full object-contain p-4 opacity-90 group-hover:scale-110 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent to-card"></div>
              </div>
              <div className="w-2/3 p-6 flex flex-col justify-center">
                <div className="text-xs font-bold text-primary tracking-widest uppercase mb-2">Registration</div>
                <h3 className="font-display text-xl font-bold mb-2">Upcoming Belt Test</h3>
                <p className="text-muted-foreground text-sm mb-4 line-clamp-2">The countdown begins. Verify your attendance requirements and register for the next promotion test.</p>
                <Link href="/belt-tests" className="text-primary font-bold text-sm flex items-center gap-1 mt-auto hover:underline">
                  REGISTER NOW &rarr;
                </Link>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
