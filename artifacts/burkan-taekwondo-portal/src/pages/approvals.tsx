import { useEffect, useMemo, useState } from "react";
import {
  collection,
  doc,
  onSnapshot,
  serverTimestamp,
  updateDoc,
  type Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useRole, friendlyAuthError, type AppRole } from "@/lib/role-store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Loader2, UserCheck, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Member {
  uid: string;
  email: string;
  displayName: string;
  requestedRole: AppRole | null;
  role: AppRole | null;
  status: "pending" | "approved" | "rejected";
  createdAt: Timestamp | null;
}

const ROLES: AppRole[] = ["parent", "student", "coach", "admin"];

function RoleSelect({
  value,
  onChange,
  disabled,
}: {
  value: AppRole;
  onChange: (role: AppRole) => void;
  disabled?: boolean;
}) {
  return (
    <select
      aria-label="Role"
      className="h-9 rounded-md border border-input bg-background px-2 text-sm capitalize"
      value={value}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value as AppRole)}
    >
      {ROLES.map((role) => (
        <option key={role} value={role}>{role}</option>
      ))}
    </select>
  );
}

function formatDate(value: Timestamp | null) {
  if (!value) return "";
  return value.toDate().toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
}

export default function Approvals() {
  const { isAdmin, account } = useRole();
  const { toast } = useToast();
  const [members, setMembers] = useState<Member[] | null>(null);
  const [chosenRoles, setChosenRoles] = useState<Record<string, AppRole>>({});
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    if (!isAdmin) return;
    return onSnapshot(
      collection(db, "users"),
      (snapshot) => {
        setMembers(
          snapshot.docs.map((item) => {
            const data = item.data();
            return {
              uid: item.id,
              email: data.email ?? "",
              displayName: data.displayName ?? "",
              requestedRole: data.requestedRole ?? null,
              role: data.role ?? null,
              status: data.status ?? "pending",
              createdAt: data.createdAt ?? null,
            } as Member;
          }),
        );
      },
      (error) => {
        toast({ variant: "destructive", title: "Couldn't load members", description: friendlyAuthError(error) });
        setMembers([]);
      },
    );
  }, [isAdmin, toast]);

  const { pending, approved, rejected } = useMemo(() => {
    const list = members ?? [];
    const byNewest = (a: Member, b: Member) =>
      (b.createdAt?.toMillis() ?? 0) - (a.createdAt?.toMillis() ?? 0);
    return {
      pending: list.filter((m) => m.status === "pending").sort(byNewest),
      approved: list.filter((m) => m.status === "approved").sort((a, b) => a.displayName.localeCompare(b.displayName)),
      rejected: list.filter((m) => m.status === "rejected").sort(byNewest),
    };
  }, [members]);

  if (!isAdmin) {
    return <div className="p-8 text-muted-foreground">Only admins can open this page.</div>;
  }

  const roleFor = (member: Member): AppRole =>
    chosenRoles[member.uid] ?? member.role ?? member.requestedRole ?? "parent";

  const review = async (member: Member, status: Member["status"], role: AppRole | null) => {
    setBusyId(member.uid);
    try {
      await updateDoc(doc(db, "users", member.uid), {
        status,
        role,
        reviewedBy: account?.uid ?? null,
        reviewedAt: serverTimestamp(),
      });
      toast({
        title: status === "approved" ? "Saved" : "Request declined",
        description: `${member.displayName || member.email}${status === "approved" && role ? ` is now ${role}.` : "."}`,
      });
    } catch (error) {
      toast({ variant: "destructive", title: "Couldn't save", description: friendlyAuthError(error) });
    } finally {
      setBusyId(null);
    }
  };

  const MemberRow = ({ member, children }: { member: Member; children: React.ReactNode }) => (
    <div className="flex flex-col gap-3 rounded-lg border bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <p className="font-semibold truncate">{member.displayName || "No name"}</p>
        <p className="text-sm text-muted-foreground truncate">{member.email}</p>
        <p className="text-xs text-muted-foreground mt-1">
          {member.requestedRole ? <>Asked to join as <span className="capitalize">{member.requestedRole}</span></> : null}
          {member.createdAt ? ` · ${formatDate(member.createdAt)}` : ""}
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-2">{children}</div>
    </div>
  );

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-display font-bold uppercase tracking-tight">Member Approvals</h1>
        <p className="text-muted-foreground">New sign-ups can't see anything until you approve them and choose their role.</p>
      </div>

      {members === null ? (
        <div className="flex items-center gap-2 text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Loading members…</div>
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Waiting for approval <Badge variant={pending.length ? "default" : "secondary"}>{pending.length}</Badge>
              </CardTitle>
              <CardDescription>Check that you know each person before approving. The role you pick here is what they get.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {pending.length === 0 && <p className="text-sm text-muted-foreground">No requests right now.</p>}
              {pending.map((member) => (
                <MemberRow key={member.uid} member={member}>
                  <RoleSelect
                    value={roleFor(member)}
                    disabled={busyId === member.uid}
                    onChange={(role) => setChosenRoles((current) => ({ ...current, [member.uid]: role }))}
                  />
                  <Button size="sm" disabled={busyId === member.uid} onClick={() => review(member, "approved", roleFor(member))}>
                    <Check className="h-4 w-4 mr-1" /> Approve
                  </Button>
                  <Button size="sm" variant="outline" disabled={busyId === member.uid} onClick={() => review(member, "rejected", null)}>
                    <X className="h-4 w-4 mr-1" /> Decline
                  </Button>
                </MemberRow>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><UserCheck className="h-5 w-5" /> Members ({approved.length})</CardTitle>
              <CardDescription>Change a role, or remove someone's access.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {approved.map((member) => {
                const isSelf = member.uid === account?.uid;
                return (
                  <MemberRow key={member.uid} member={member}>
                    {isSelf ? (
                      <Badge variant="secondary" className="capitalize">{member.role} (you)</Badge>
                    ) : (
                      <>
                        <RoleSelect
                          value={roleFor(member)}
                          disabled={busyId === member.uid}
                          onChange={(role) => {
                            setChosenRoles((current) => ({ ...current, [member.uid]: role }));
                            void review(member, "approved", role);
                          }}
                        />
                        <Button size="sm" variant="outline" disabled={busyId === member.uid} onClick={() => review(member, "rejected", null)}>
                          Remove access
                        </Button>
                      </>
                    )}
                  </MemberRow>
                );
              })}
            </CardContent>
          </Card>

          {rejected.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Declined ({rejected.length})</CardTitle>
                <CardDescription>These accounts can sign in but see nothing. You can still approve them.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {rejected.map((member) => (
                  <MemberRow key={member.uid} member={member}>
                    <RoleSelect
                      value={roleFor(member)}
                      disabled={busyId === member.uid}
                      onChange={(role) => setChosenRoles((current) => ({ ...current, [member.uid]: role }))}
                    />
                    <Button size="sm" variant="outline" disabled={busyId === member.uid} onClick={() => review(member, "approved", roleFor(member))}>
                      Approve
                    </Button>
                  </MemberRow>
                ))}
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
