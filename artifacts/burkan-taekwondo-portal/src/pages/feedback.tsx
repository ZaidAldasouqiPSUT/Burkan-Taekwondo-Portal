import { useState } from "react";
import { useGetFeedback, useCreateFeedback, getGetFeedbackQueryKey, useGetStudents } from "@workspace/api-client-react";
import { useRole } from "@/lib/role-store";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MessageSquare, Calendar, ChevronRight, PenTool } from "lucide-react";
import { format } from "date-fns";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

export default function Feedback() {
  const { role } = useRole();
  const { data: feedbacks, isLoading } = useGetFeedback();
  const { data: students } = useGetStudents();
  
  const createFeedback = useCreateFeedback();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [isOpen, setIsOpen] = useState(false);
  const [studentId, setStudentId] = useState("");
  const [category, setCategory] = useState("Technical");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = () => {
    if (!studentId || !title || !message) return;
    
    createFeedback.mutate(
      {
        data: {
          studentId,
          category,
          title,
          message
        }
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetFeedbackQueryKey() });
          toast({ title: "Feedback Sent", description: "Your message has been sent successfully." });
          setIsOpen(false);
          // reset form
          setStudentId("");
          setTitle("");
          setMessage("");
        },
        onError: () => {
          toast({ variant: "destructive", title: "Error", description: "Failed to send feedback." });
        }
      }
    );
  };

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold uppercase tracking-tight">Coach Feedback</h1>
          <p className="text-muted-foreground mt-1">Direct evaluations and progress notes.</p>
        </div>
        
        {(role === 'coach' || role === 'admin') && (
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button className="font-bold uppercase tracking-wider gap-2">
                <PenTool className="h-4 w-4" /> Compose
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle className="font-display text-xl uppercase">New Feedback</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-muted-foreground uppercase">Student</label>
                  <Select value={studentId} onValueChange={setStudentId}>
                    <SelectTrigger>
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
                  <label className="text-xs font-bold text-muted-foreground uppercase">Category</label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Technical">Technical</SelectItem>
                      <SelectItem value="Behavior">Behavior / Discipline</SelectItem>
                      <SelectItem value="Tournament">Tournament Review</SelectItem>
                      <SelectItem value="General">General Progress</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-muted-foreground uppercase">Title</label>
                  <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="E.g. Great improvement on roundhouse kicks" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-muted-foreground uppercase">Message</label>
                  <Textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Write your feedback..." rows={5} />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
                <Button onClick={handleSubmit} disabled={!studentId || !title || !message || createFeedback.isPending}>
                  {createFeedback.isPending ? "Sending..." : "Send Feedback"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="space-y-4">
        {isLoading ? (
          [1,2,3].map(i => <Skeleton key={i} className="h-32 w-full rounded-xl" />)
        ) : feedbacks?.length === 0 ? (
          <div className="p-12 text-center bg-card rounded-xl border border-dashed">
            <MessageSquare className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-50" />
            <h3 className="font-display font-bold text-lg mb-2">No Feedback Yet</h3>
            <p className="text-muted-foreground">Feedback from coaches will appear here.</p>
          </div>
        ) : (
          feedbacks?.map((item) => (
            <Card key={item.id} className={cn("overflow-hidden hover-elevate transition-all border-l-4 cursor-pointer group", !item.read && role !== 'coach' ? "border-l-primary bg-primary/5" : "border-l-transparent bg-card")}>
              <CardContent className="p-0">
                <div className="p-6 flex items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        {!item.read && role !== 'coach' && (
                          <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                        )}
                        <Badge variant="secondary" className="text-[10px] uppercase font-bold tracking-wider rounded-sm">
                          {item.category}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                        <Calendar className="h-3.5 w-3.5" />
                        {format(new Date(item.date), 'MMM d, yyyy')}
                      </div>
                    </div>
                    
                    <h3 className={cn("text-lg font-bold mb-1", !item.read && role !== 'coach' && "text-primary")}>{item.title}</h3>
                    <p className="text-muted-foreground text-sm line-clamp-2 leading-relaxed mb-3">
                      {item.message}
                    </p>
                    
                    <div className="flex items-center justify-between text-xs mt-4 pt-4 border-t border-border/50">
                      <span className="font-medium text-muted-foreground">
                        {role === 'coach' ? `To: ${item.studentName}` : `From: Coach ${item.coachName}`}
                      </span>
                      <span className="text-primary font-bold flex items-center group-hover:underline">
                        Read Full Message <ChevronRight className="h-3 w-3 ml-0.5" />
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
