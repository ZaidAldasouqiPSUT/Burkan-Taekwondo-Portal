import { useGetSchedule } from "@workspace/api-client-react";
import { useRole } from "@/lib/role-store";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, Clock, MapPin, User, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Schedule() {
  const { data: schedule, isLoading } = useGetSchedule();
  const { role } = useRole();

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold uppercase tracking-tight">Class Schedule</h1>
          <p className="text-muted-foreground mt-1">Weekly training schedule and locations.</p>
        </div>
        
        {role === 'coach' && (
          <Button className="font-bold uppercase tracking-wider">
            Request Time Off
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3,4,5,6].map(i => <Skeleton key={i} className="h-48 w-full rounded-xl" />)}
        </div>
      ) : schedule?.length === 0 ? (
        <div className="p-12 text-center bg-card rounded-xl border border-dashed">
          <CalendarDays className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-50" />
          <h3 className="font-display font-bold text-lg mb-2">No Schedule Found</h3>
          <p className="text-muted-foreground">The class schedule is currently unavailable.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {daysOfWeek.map(day => {
            const dayClasses = schedule?.filter(s => s.day === day) || [];
            if (dayClasses.length === 0) return null;

            return (
              <div key={day} className="space-y-4">
                <h3 className="font-display text-2xl font-bold uppercase border-b-2 border-primary inline-block pb-1">{day}</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {dayClasses.map(cls => (
                    <Card key={cls.id} className="border-none shadow-sm hover-elevate group overflow-hidden bg-card">
                      <div className="h-1 w-full bg-primary/20 group-hover:bg-primary transition-colors" />
                      <CardContent className="p-5 flex flex-col h-full">
                        <div className="flex justify-between items-start mb-3">
                          <h4 className="font-bold text-lg leading-tight">{cls.className}</h4>
                        </div>
                        
                        <div className="space-y-2 mb-4 flex-1">
                          <div className="flex items-center text-sm font-medium text-muted-foreground">
                            <Clock className="h-4 w-4 mr-2 text-primary shrink-0" />
                            {cls.startTime} - {cls.endTime}
                          </div>
                          <div className="flex items-center text-sm font-medium text-muted-foreground">
                            <MapPin className="h-4 w-4 mr-2 text-primary shrink-0" />
                            {cls.location}
                          </div>
                          <div className="flex items-center text-sm font-medium text-muted-foreground">
                            <User className="h-4 w-4 mr-2 text-primary shrink-0" />
                            Coach {cls.coachName}
                          </div>
                        </div>

                        {role === 'coach' && (
                          <div className="pt-3 border-t border-border/50 text-xs text-center font-bold text-primary cursor-pointer hover:underline uppercase tracking-wider">
                            Manage Coverage
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
