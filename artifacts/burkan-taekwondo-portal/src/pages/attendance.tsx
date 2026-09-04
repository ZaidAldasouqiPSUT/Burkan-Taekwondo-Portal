import { useState } from "react";
import { useGetAttendance, useCreateAttendance, getGetAttendanceQueryKey, useGetStudents } from "@workspace/api-client-react";
import { useRole } from "@/lib/role-store";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CalendarDays, CheckCircle2, XCircle, Clock, AlertCircle } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";

export default function Attendance() {
  const { role } = useRole();
  const { data: records, isLoading } = useGetAttendance();
  const { data: students } = useGetStudents();
  
  const createAttendance = useCreateAttendance();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [selectedStudent, setSelectedStudent] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>("Present");
  const [selectedClass, setSelectedClass] = useState<string>("Beginners TKD");

  const handleRecordAttendance = () => {
    if (!selectedStudent) return;
    
    createAttendance.mutate(
      {
        data: {
          studentId: selectedStudent,
          date: new Date().toISOString().split('T')[0],
          status: selectedStatus,
          className: selectedClass
        }
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetAttendanceQueryKey() });
          toast({
            title: "Attendance Recorded",
            description: "The record has been saved successfully.",
          });
          setSelectedStudent("");
        },
        onError: () => {
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to record attendance. Please try again.",
          });
        }
      }
    );
  };

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'Present': return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'Absent': return <XCircle className="h-4 w-4 text-destructive" />;
      case 'Late': return <Clock className="h-4 w-4 text-amber-500" />;
      default: return null;
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-display font-bold uppercase tracking-tight">Attendance</h1>
        <p className="text-muted-foreground mt-1">Track classes and training history.</p>
      </div>

      {(role === 'coach' || role === 'admin') && (
        <Card className="border-none shadow-md overflow-hidden bg-card">
          <div className="h-2 w-full bg-primary" />
          <CardHeader>
            <CardTitle className="font-display uppercase tracking-wider">Record Attendance</CardTitle>
            <CardDescription>Mark presence for today's classes.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase">Student</label>
                <Select value={selectedStudent} onValueChange={setSelectedStudent}>
                  <SelectTrigger className="bg-muted/50 border-none">
                    <SelectValue placeholder="Select student..." />
                  </SelectTrigger>
                  <SelectContent>
                    {students?.map(s => (
                      <SelectItem key={s.id} value={s.id}>{s.fullName}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase">Class</label>
                <Select value={selectedClass} onValueChange={setSelectedClass}>
                  <SelectTrigger className="bg-muted/50 border-none">
                    <SelectValue placeholder="Select class..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Beginners TKD">Beginners TKD</SelectItem>
                    <SelectItem value="Advanced Poomsae">Advanced Poomsae</SelectItem>
                    <SelectItem value="Sparring Team">Sparring Team</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase">Status</label>
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="bg-muted/50 border-none">
                    <SelectValue placeholder="Status..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Present">Present</SelectItem>
                    <SelectItem value="Late">Late</SelectItem>
                    <SelectItem value="Absent">Absent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button 
                onClick={handleRecordAttendance} 
                disabled={!selectedStudent || createAttendance.isPending}
                className="w-full font-bold uppercase tracking-wider"
              >
                {createAttendance.isPending ? "Saving..." : "Save Record"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="border-none shadow-sm bg-card">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle className="font-display text-xl">Recent History</CardTitle>
            <CardDescription>Your latest training sessions</CardDescription>
          </div>
          <CalendarDays className="h-5 w-5 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4 mt-4">
              {[1,2,3,4].map(i => <Skeleton key={i} className="h-16 w-full rounded-md" />)}
            </div>
          ) : records?.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              <CalendarDays className="h-12 w-12 mx-auto mb-3 opacity-20" />
              <p>No attendance records found.</p>
            </div>
          ) : (
            <div className="mt-4 divide-y">
              {records?.map((record) => (
                <div key={record.id} className="py-4 flex items-center justify-between group">
                  <div className="flex flex-col gap-1">
                    <div className="font-bold">{record.className}</div>
                    <div className="text-sm text-muted-foreground flex items-center gap-2">
                      <span>{format(new Date(record.date), 'MMM d, yyyy')}</span>
                      <span>&bull;</span>
                      <span className="text-xs">Logged by {record.markedBy}</span>
                    </div>
                    {(role === 'coach' || role === 'admin' || role === 'parent') && (
                      <div className="text-xs font-medium mt-1 text-primary">{record.studentName}</div>
                    )}
                  </div>
                  <Badge 
                    variant="outline" 
                    className="flex items-center gap-1.5 px-3 py-1 bg-muted/50 border-none font-bold"
                  >
                    {getStatusIcon(record.status)}
                    {record.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
