import { useEffect, useMemo, useState } from "react";
import {
  assignStudentToCoach,
  DEMO_COACHES,
  DEMO_STUDENTS,
  getRosterAssignments,
} from "@/lib/mock-database";
import { useRole } from "@/lib/role-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Search, Unlock, LockKeyhole, CircleCheck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function RosterBuilder() {
  const { account } = useRole();
  const { toast } = useToast();
  const coach =
    DEMO_COACHES.find((item) => item.email === account?.email) ??
    DEMO_COACHES[0];
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [assignments, setAssignments] = useState<Record<string, string>>(
    getRosterAssignments,
  );
  const [conflictMessage, setConflictMessage] = useState("");

  useEffect(() => {
    const refreshAssignments = () =>
      setAssignments(getRosterAssignments());
    window.addEventListener("storage", refreshAssignments);
    window.addEventListener("burkan:roster-updated", refreshAssignments);
    return () => {
      window.removeEventListener("storage", refreshAssignments);
      window.removeEventListener("burkan:roster-updated", refreshAssignments);
    };
  }, []);

  const filteredStudents = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return DEMO_STUDENTS;
    return DEMO_STUDENTS.filter(
      (student) =>
        student.fullName.toLowerCase().includes(query) ||
        student.email.toLowerCase().includes(query),
    );
  }, [search]);

  const handleStudentClick = (studentId: string, fullName: string) => {
    const assignedCoachEmail = assignments[studentId];
    if (assignedCoachEmail && assignedCoachEmail !== coach.email) {
      const assignedCoach = DEMO_COACHES.find(
        (item) => item.email === assignedCoachEmail,
      );
      setConflictMessage(
        `Sorry, ${fullName} is registered in ${assignedCoach?.displayName ?? "another coach"}'s roster.`,
      );
      return;
    }
    if (assignedCoachEmail === coach.email) return;

    const result = assignStudentToCoach(studentId, coach.email);
    if (!result.ok) {
      const assignedCoach = DEMO_COACHES.find(
        (item) => item.email === result.coachEmail,
      );
      setConflictMessage(
        `Sorry, ${fullName} is registered in ${assignedCoach?.displayName ?? "another coach"}'s roster.`,
      );
      return;
    }

    setAssignments(result.assignments);
    toast({
      title: "Student added to roster",
      description: `${fullName} is now assigned to ${coach.displayName}.`,
    });
  };

  return (
    <>
      <Button
        type="button"
        variant="destructive"
        className="whitespace-nowrap font-bold"
        onClick={() => setIsOpen(true)}
      >
        Create new Roster +
      </Button>

      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent
          side="bottom"
          className="h-[80dvh] rounded-t-xl px-0 pt-6"
        >
          <div className="flex h-full flex-col">
            <SheetHeader className="mb-5 px-6 text-left">
              <SheetTitle className="text-xl font-display uppercase">
                Build your roster
              </SheetTitle>
              <SheetDescription>
                Search all students and add anyone who is not assigned to
                another coach.
              </SheetDescription>
            </SheetHeader>

            <div className="relative mx-6 mb-4">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                aria-label="Search students"
                placeholder="Search students..."
                className="pl-9"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>

            <div className="flex-1 space-y-2 overflow-y-auto px-6 pb-8">
              {filteredStudents.map((student) => {
                const assignedCoachEmail = assignments[student.id];
                const assignedCoach = DEMO_COACHES.find(
                  (item) => item.email === assignedCoachEmail,
                );
                const assignedToCurrentCoach =
                  assignedCoachEmail === coach.email;
                const lockedByOtherCoach =
                  Boolean(assignedCoachEmail) && !assignedToCurrentCoach;

                return (
                  <button
                    type="button"
                    key={student.id}
                    onClick={() =>
                      handleStudentClick(student.id, student.fullName)
                    }
                    disabled={assignedToCurrentCoach}
                    className="flex w-full items-center gap-4 rounded-xl border bg-card px-4 py-4 text-left transition-colors hover:bg-accent/60 disabled:cursor-default disabled:opacity-80"
                    aria-label={
                      lockedByOtherCoach
                        ? `${student.fullName}, assigned to ${assignedCoach?.displayName ?? "another coach"}`
                        : assignedToCurrentCoach
                          ? `${student.fullName}, on your roster`
                          : `Add ${student.fullName} to your roster`
                    }
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                      {lockedByOtherCoach ? (
                        <LockKeyhole className="h-5 w-5" aria-hidden="true" />
                      ) : assignedToCurrentCoach ? (
                        <CircleCheck className="h-5 w-5" aria-hidden="true" />
                      ) : (
                        <Unlock className="h-5 w-5" aria-hidden="true" />
                      )}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-semibold">
                        {student.fullName}
                      </span>
                      <span className="block truncate text-sm text-muted-foreground">
                        {lockedByOtherCoach
                          ? `Registered with ${assignedCoach?.displayName ?? "another coach"}`
                          : assignedToCurrentCoach
                            ? "Already on your roster"
                            : student.email}
                      </span>
                    </span>
                    <span className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                      {lockedByOtherCoach
                        ? "Assigned"
                        : assignedToCurrentCoach
                          ? "Added"
                          : "Add"}
                    </span>
                  </button>
                );
              })}
              {filteredStudents.length === 0 && (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  No students match your search.
                </p>
              )}
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <Dialog
        open={Boolean(conflictMessage)}
        onOpenChange={(open) => !open && setConflictMessage("")}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Student already assigned</DialogTitle>
            <DialogDescription>{conflictMessage}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setConflictMessage("")}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}