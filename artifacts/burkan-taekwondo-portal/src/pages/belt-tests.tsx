import { useState } from "react";
import { useGetBeltTests } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { MapPin, CalendarDays, Award, Clock } from "lucide-react";
import { format } from "date-fns";
import { useRole } from "@/lib/role-store";
import { useToast } from "@/hooks/use-toast";

export default function BeltTests() {
  const { data: tests, isLoading, error } = useGetBeltTests();
  const { role } = useRole();
  const { toast } = useToast();

  const [registeringFor, setRegisteringFor] = useState<any | null>(null);
  const [payingFor, setPayingFor] = useState<any | null>(null);
  const [viewingCandidates, setViewingCandidates] = useState<any | null>(null);

  // Local state override for demonstration
  const [localStatuses, setLocalStatuses] = useState<Record<string, string>>({});

  const handleRegister = (testId: string) => {
    setLocalStatuses(prev => ({ ...prev, [testId]: 'Pending Payment' }));
    toast({ title: "Registered Successfully", description: "You are now registered. Please complete payment." });
    setRegisteringFor(null);
  };

  const handlePay = (testId: string) => {
    setLocalStatuses(prev => ({ ...prev, [testId]: 'Registered' }));
    toast({ title: "Payment Complete", description: "Your payment has been recorded." });
    setPayingFor(null);
  };

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
            const status = localStatuses[test.id] || test.registrationStatus;
            const isRegistered = status === 'Registered';
            const isPending = status === 'Pending Payment';
            const canRegister = !isRegistered && !isPending;
            
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
                    <div className="mb-4 flex flex-col items-start gap-3 sm:flex-row sm:justify-between">
                      <div className="min-w-0">
                        <Badge variant="outline" className="mb-2 bg-muted/50 border-none text-xs font-bold uppercase tracking-wider">
                          {test.label}
                        </Badge>
                        <h3 className="text-2xl font-display font-bold uppercase">{test.label} Promotion</h3>
                      </div>
                      
                      {role !== 'coach' && role !== 'admin' && (
                        <Badge 
                          variant={isRegistered ? "default" : isPending ? "secondary" : "outline"}
                          className="max-w-full shrink-0 whitespace-normal px-3 py-1 text-center font-bold"
                        >
                          {status}
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
                    
                    <div className="mt-auto flex flex-col gap-3 border-t border-border/50 pt-4 sm:flex-row sm:justify-end">
                      {(role === 'parent' || role === 'student') && canRegister && (
                        <Button className="w-full font-bold uppercase tracking-wider sm:w-auto" onClick={() => setRegisteringFor(test)}>Register Now</Button>
                      )}
                      {(role === 'parent' || role === 'student') && isPending && (
                        <Button variant="default" className="w-full bg-amber-500 font-bold uppercase tracking-wider text-white hover:bg-amber-600 sm:w-auto" onClick={() => setPayingFor(test)}>Pay Fee</Button>
                      )}
                      {(role === 'coach' || role === 'admin') && (
                        <Button variant="outline" className="w-full font-bold uppercase tracking-wider sm:w-auto" onClick={() => setViewingCandidates(test)}>View Candidates</Button>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      <Dialog open={!!registeringFor} onOpenChange={(open) => !open && setRegisteringFor(null)}>
        <DialogContent className="sm:max-w-[425px]">
          {registeringFor && (
            <>
              <DialogHeader>
                <DialogTitle className="uppercase font-display">Register for {registeringFor.label} Test</DialogTitle>
                <DialogDescription>
                  Confirm registration for the upcoming belt test on {format(new Date(registeringFor.date), 'MMMM d, yyyy')}.
                </DialogDescription>
              </DialogHeader>
              <div className="bg-muted/50 p-4 rounded-lg space-y-2 mt-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Location</span>
                  <span className="font-medium">{registeringFor.location}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Testing Fee</span>
                  <span className="font-medium">${registeringFor.cost}</span>
                </div>
                <div className="flex justify-between border-t pt-2 mt-2">
                  <span className="text-muted-foreground font-bold">Total</span>
                  <span className="font-bold text-primary">${registeringFor.cost}</span>
                </div>
              </div>
              <DialogFooter className="mt-6">
                <Button variant="outline" onClick={() => setRegisteringFor(null)}>Cancel</Button>
                <Button onClick={() => handleRegister(registeringFor.id)}>Confirm Registration</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!payingFor} onOpenChange={(open) => !open && setPayingFor(null)}>
        <DialogContent className="sm:max-w-[425px]">
          {payingFor && (
            <>
              <DialogHeader>
                <DialogTitle className="uppercase font-display">Pay Testing Fee</DialogTitle>
                <DialogDescription>
                  Complete payment for the {payingFor.label} promotion test.
                </DialogDescription>
              </DialogHeader>
              <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg mt-2 mb-4 dark:bg-amber-950/30 dark:border-amber-900/50">
                <p className="text-sm font-medium text-amber-800 dark:text-amber-500">
                  Online payments are coming soon. This is a demo placeholder. Click "Simulate Payment" to proceed.
                </p>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setPayingFor(null)}>Cancel</Button>
                <Button className="bg-amber-500 hover:bg-amber-600 text-white" onClick={() => handlePay(payingFor.id)}>Simulate Payment (${payingFor.cost})</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!viewingCandidates} onOpenChange={(open) => !open && setViewingCandidates(null)}>
        <DialogContent className="sm:max-w-[500px]">
          {viewingCandidates && (
            <>
              <DialogHeader>
                <DialogTitle className="uppercase font-display">Candidates for {viewingCandidates.label}</DialogTitle>
                <DialogDescription>
                  Registered students for {format(new Date(viewingCandidates.date), 'MMMM d, yyyy')}
                </DialogDescription>
              </DialogHeader>
              <div className="py-4 space-y-3 max-h-[60vh] overflow-y-auto">
                {/* Dummy candidates list */}
                {[1, 2, 3].map(i => (
                  <div key={i} className="flex items-center justify-between p-3 border rounded-lg bg-card">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center font-bold text-xs">
                        S{i}
                      </div>
                      <div>
                        <div className="font-bold text-sm">Student {i}</div>
                        <div className="text-xs text-muted-foreground">{viewingCandidates.label} Belt Candidate</div>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-[10px]">Registered</Badge>
                  </div>
                ))}
              </div>
              <DialogFooter>
                <Button onClick={() => setViewingCandidates(null)}>Close</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
