import { useGetBeltTests } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, CalendarDays, Award, Clock } from "lucide-react";
import { format } from "date-fns";
import { useRole } from "@/lib/role-store";

export default function BeltTests() {
  const { data: tests, isLoading, error } = useGetBeltTests();
  const { role } = useRole();

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold uppercase tracking-tight">Belt Testing</h1>
          <p className="text-muted-foreground mt-1">Upcoming promotion tests and schedules.</p>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-48 w-full rounded-xl" />
          <Skeleton className="h-48 w-full rounded-xl" />
        </div>
      ) : error ? (
        <div className="p-8 text-center text-destructive bg-destructive/10 rounded-xl">
          Failed to load belt tests.
        </div>
      ) : tests?.length === 0 ? (
        <div className="p-12 text-center bg-card rounded-xl border border-dashed">
          <Award className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-50" />
          <h3 className="font-display font-bold text-lg mb-2">No Upcoming Tests</h3>
          <p className="text-muted-foreground">There are no belt tests scheduled at this time.</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {tests?.map((test) => {
            const isRegistered = test.registrationStatus === 'Registered';
            const isPending = test.registrationStatus === 'Pending Payment';
            
            return (
              <Card key={test.id} className="overflow-hidden hover-elevate border-none shadow-md">
                <div className="flex flex-col md:flex-row">
                  <div className="md:w-64 bg-black text-white p-6 flex flex-col justify-center items-center text-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-primary/20"></div>
                    <div className="relative z-10">
                      <div className="text-5xl font-display font-bold mb-1">{test.daysRemaining}</div>
                      <div className="text-sm font-bold tracking-widest uppercase text-primary mb-4">Days Left</div>
                      <div className="font-medium">{format(new Date(test.date), 'MMMM d, yyyy')}</div>
                    </div>
                  </div>
                  
                  <div className="flex-1 p-6 flex flex-col">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <Badge variant="outline" className="mb-2 bg-muted/50 border-none text-xs font-bold uppercase tracking-wider">
                          {test.label}
                        </Badge>
                        <h3 className="text-2xl font-display font-bold uppercase">{test.label} Promotion</h3>
                      </div>
                      
                      {role !== 'coach' && role !== 'admin' && (
                        <Badge 
                          variant={isRegistered ? "default" : isPending ? "secondary" : "outline"}
                          className="px-3 py-1 font-bold"
                        >
                          {test.registrationStatus}
                        </Badge>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                      <div className="flex items-center gap-3 text-muted-foreground">
                        <MapPin className="h-5 w-5 text-primary" />
                        <span className="font-medium">{test.location}</span>
                      </div>
                      <div className="flex items-center gap-3 text-muted-foreground">
                        <Clock className="h-5 w-5 text-primary" />
                        <span className="font-medium">Testing Fee: ${test.cost}</span>
                      </div>
                    </div>
                    
                    <div className="mt-auto flex justify-end gap-3 pt-4 border-t border-border/50">
                      {(role === 'parent' || role === 'student') && test.registrationStatus === 'Not Registered' && (
                        <Button className="font-bold uppercase tracking-wider">Register Now</Button>
                      )}
                      {(role === 'parent' || role === 'student') && test.registrationStatus === 'Pending Payment' && (
                        <Button variant="default" className="bg-amber-500 hover:bg-amber-600 text-white font-bold uppercase tracking-wider">Pay Fee</Button>
                      )}
                      {(role === 'coach' || role === 'admin') && (
                        <Button variant="outline" className="font-bold uppercase tracking-wider">View Candidates</Button>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  );
}
