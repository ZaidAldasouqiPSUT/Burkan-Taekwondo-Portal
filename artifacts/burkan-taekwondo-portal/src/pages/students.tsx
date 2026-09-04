import { useGetStudents } from "@workspace/api-client-react";
import { useRole } from "@/lib/role-store";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function Students() {
  const { role } = useRole();
  const { data: students, isLoading, error } = useGetStudents();

  if (role === 'student') {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center p-6">
        <AlertCircle className="h-16 w-16 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-display font-bold mb-2">Access Restricted</h2>
        <p className="text-muted-foreground max-w-md">Students cannot view the roster. Please switch to Parent, Coach, or Admin to view this page.</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold uppercase tracking-tight">Roster & Profiles</h1>
          <p className="text-muted-foreground mt-1">
            {role === 'parent' ? "Manage your children's profiles" : "Manage student roster and details"}
          </p>
        </div>
        
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search students..." className="pl-9 bg-card border-none shadow-sm" />
          </div>
          <Button variant="outline" size="icon" className="shrink-0 bg-card border-none shadow-sm">
            <Filter className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3,4,5,6].map(i => (
            <Skeleton key={i} className="h-32 w-full rounded-xl" />
          ))}
        </div>
      ) : error ? (
        <div className="p-8 text-center text-destructive bg-destructive/10 rounded-xl font-medium">
          Failed to load students.
        </div>
      ) : students?.length === 0 ? (
        <div className="p-12 text-center bg-card rounded-xl border border-dashed">
          <h3 className="font-display font-bold text-lg mb-2">No Students Found</h3>
          <p className="text-muted-foreground">The roster is currently empty.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {students?.map(student => (
            <Card key={student.id} className="overflow-hidden hover-elevate border-border/50 group">
              <CardContent className="p-0">
                <div className="p-6 flex items-start gap-4">
                  <Avatar className="h-16 w-16 border-2 border-background shadow-sm group-hover:scale-105 transition-transform">
                    <AvatarImage src={student.avatar} alt={student.fullName} />
                    <AvatarFallback className="bg-primary/10 text-primary font-bold text-xl">
                      {student.fullName.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="font-bold text-lg truncate pr-2">{student.fullName}</h3>
                      <Badge variant={student.status === 'Active' ? 'default' : 'secondary'} className="text-[10px] uppercase font-bold tracking-wider px-2 py-0 h-5">
                        {student.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-sm mb-3">
                      <div className="flex items-center gap-1.5 font-medium text-muted-foreground">
                        <div 
                          className="w-3 h-3 rounded-sm shadow-sm" 
                          style={{ backgroundColor: student.beltColor }}
                        />
                        {student.belt} Belt
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 text-xs bg-muted/50 p-2.5 rounded-md">
                      <div>
                        <span className="text-muted-foreground block mb-0.5">Attendance</span>
                        <span className="font-bold">{student.attendanceRate}%</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block mb-0.5">Next Test</span>
                        <span className="font-bold">{new Date(student.nextTestDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-muted/30 px-6 py-3 border-t text-xs text-muted-foreground flex justify-between items-center">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-green-500" />
                    Fees: {student.paymentStatus}
                  </div>
                  <Button variant="link" size="sm" className="h-auto p-0 text-primary font-bold">
                    View Details &rarr;
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      
      <div className="bg-card/50 border border-dashed rounded-xl p-6 flex items-start gap-4">
        <AlertCircle className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
        <div className="text-sm text-muted-foreground">
          <p className="font-bold text-foreground mb-1">Name Corrections</p>
          Names must match official federation records exactly. If your name is spelled incorrectly, please contact the front desk or your head coach to request a formal correction. You cannot edit names directly.
        </div>
      </div>
    </div>
  );
}
