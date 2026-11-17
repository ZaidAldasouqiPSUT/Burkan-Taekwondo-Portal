import { useState } from "react";
import { useRole, type RequestableRole } from "@/lib/role-store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Clock, Loader2, MailCheck, ShieldX } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

/** Shown to anyone signed in who doesn't have approved access yet. */
export default function Pending() {
  const { status, account, firebaseUser, logout, resendVerification, submitAccessRequest } = useRole();
  const { toast } = useToast();
  const [busy, setBusy] = useState(false);
  const [fullName, setFullName] = useState(account?.displayName ?? "");
  const [requestedRole, setRequestedRole] = useState<RequestableRole>("parent");

  const handleResend = async () => {
    setBusy(true);
    const result = await resendVerification();
    setBusy(false);
    toast(
      result.ok
        ? { title: "Email sent", description: "Check your inbox and spam folder." }
        : { variant: "destructive", title: "Couldn't send", description: result.error },
    );
  };

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) return;
    setBusy(true);
    const result = await submitAccessRequest(fullName, requestedRole);
    setBusy(false);
    if (!result.ok) {
      toast({ variant: "destructive", title: "Couldn't send request", description: result.error });
    }
  };

  const isRejected = status === "rejected";
  const needsRequest = status === "incomplete";

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-muted/30 px-4 py-10">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center space-y-2 pt-8">
          <div className="mx-auto w-14 h-14 rounded-full flex items-center justify-center bg-primary/10 text-primary">
            {isRejected ? <ShieldX className="h-7 w-7" /> : <Clock className="h-7 w-7" />}
          </div>
          <CardTitle className="text-2xl font-display font-bold uppercase">
            {isRejected ? "Request declined" : needsRequest ? "One more step" : "Waiting for approval"}
          </CardTitle>
          <CardDescription className="text-base">
            {isRejected
              ? "An admin did not approve this account. If you think this is a mistake, contact the club."
              : needsRequest
                ? "Tell us who you are so an admin can approve your account."
                : `Thanks${account?.displayName ? `, ${account.displayName}` : ""}. A club admin will review your account soon. This page opens up by itself once you're approved.`}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4 pb-8">
          {needsRequest && (
            <form onSubmit={handleSubmitRequest} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="pendingName">Full name</Label>
                <Input id="pendingName" required value={fullName} onChange={(e) => setFullName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pendingRole">I am a</Label>
                <select
                  id="pendingRole"
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                  value={requestedRole}
                  onChange={(e) => setRequestedRole(e.target.value as RequestableRole)}
                >
                  <option value="parent">Parent of a student</option>
                  <option value="student">Student</option>
                  <option value="coach">Coach</option>
                </select>
              </div>
              <Button type="submit" className="w-full" disabled={busy}>
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send request"}
              </Button>
            </form>
          )}

          {!isRejected && !needsRequest && firebaseUser && !firebaseUser.emailVerified && (
            <div className="rounded-lg border bg-muted/40 p-3 text-sm text-muted-foreground flex gap-3 items-start">
              <MailCheck className="h-5 w-5 shrink-0 text-primary mt-0.5" />
              <div className="space-y-2">
                <p>Please verify your email ({account?.email}) using the link we sent you.</p>
                <Button variant="outline" size="sm" onClick={handleResend} disabled={busy}>
                  Resend verification email
                </Button>
              </div>
            </div>
          )}

          <Button variant="ghost" className="w-full" onClick={() => void logout()}>
            Sign out
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
