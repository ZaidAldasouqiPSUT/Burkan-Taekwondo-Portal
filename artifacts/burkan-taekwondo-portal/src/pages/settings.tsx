import { useState, useEffect } from "react";
import { useRole } from "@/lib/role-store";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { AlertCircle, User, Bell, Shield } from "lucide-react";
import { useGetDashboardSummary } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";

export default function Settings() {
  const { role } = useRole();
  const { data: summary } = useGetDashboardSummary();
  const { toast } = useToast();

  const [pushNotifs, setPushNotifs] = useState(true);
  const [emailUpdates, setEmailUpdates] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(false);
  
  const [isPasswordOpen, setIsPasswordOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState("");

  // Load saved preferences
  useEffect(() => {
    const saved = localStorage.getItem('burkan_notifs');
    if (saved) {
      const parsed = JSON.parse(saved);
      setPushNotifs(parsed.pushNotifs ?? true);
      setEmailUpdates(parsed.emailUpdates ?? true);
      setSmsAlerts(parsed.smsAlerts ?? false);
    }
  }, []);

  // Save preferences
  useEffect(() => {
    localStorage.setItem('burkan_notifs', JSON.stringify({ pushNotifs, emailUpdates, smsAlerts }));
  }, [pushNotifs, emailUpdates, smsAlerts]);

  const handleSaveContact = () => {
    toast({ title: "Contact Info Saved", description: "Your contact details have been updated successfully." });
  };

  const handleResetPassword = () => {
    toast({ title: "Reset link sent", description: "If an account exists, a Firebase password reset email has been sent." });
    setIsPasswordOpen(false);
  };

  return (
    <div className="p-4 md:p-8 max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-display font-bold uppercase tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your account preferences.</p>
      </div>

      <div className="space-y-6">
        {/* Identity Details (Read-only) */}
        <Card className="border-none shadow-sm overflow-hidden">
          <div className="h-1 w-full bg-primary" />
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-display text-xl uppercase">
              <User className="h-5 w-5 text-primary" /> Profile Details
            </CardTitle>
            <CardDescription>Your official identity records.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-primary/5 border border-primary/20 rounded-md p-4 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <div className="text-sm text-foreground">
                <p className="font-bold mb-1">Name Changes Restricted</p>
                <p className="text-muted-foreground">For federation compliance, names must match official records exactly. You cannot edit your name here. Please contact the front desk or your head coach to request spelling corrections.</p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Full Name (Read-only)</Label>
                <Input value={summary?.displayName || "Loading..."} readOnly className="bg-muted cursor-not-allowed" />
              </div>
              <div className="space-y-2">
                <Label>Assigned Role (Read-only)</Label>
                <Input value={role?.toUpperCase() || ""} readOnly className="bg-muted cursor-not-allowed uppercase" />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input type="email" defaultValue={`${summary?.displayName?.toLowerCase().replace(' ', '.')}@example.com`} />
              </div>
              <div className="space-y-2">
                <Label>Phone Number</Label>
                <Input type="tel" defaultValue="+962 7 9000 0000" />
              </div>
            </div>
            
            <Button className="font-bold uppercase tracking-wider" onClick={handleSaveContact}>Save Contact Info</Button>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-display text-xl uppercase">
              <Bell className="h-5 w-5 text-primary" /> Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Push Notifications</Label>
                <p className="text-sm text-muted-foreground">Receive alerts for schedule changes and feedback on your device.</p>
              </div>
              <Switch checked={pushNotifs} onCheckedChange={setPushNotifs} />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Email Updates</Label>
                <p className="text-sm text-muted-foreground">Monthly progress reports and billing statements.</p>
              </div>
              <Switch checked={emailUpdates} onCheckedChange={setEmailUpdates} />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">SMS Alerts</Label>
                <p className="text-sm text-muted-foreground">Urgent club closures or emergency updates.</p>
              </div>
              <Switch checked={smsAlerts} onCheckedChange={setSmsAlerts} />
            </div>
          </CardContent>
        </Card>

        {/* Security */}
        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-display text-xl uppercase">
              <Shield className="h-5 w-5 text-primary" /> Security
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Dialog open={isPasswordOpen} onOpenChange={setIsPasswordOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full sm:w-auto font-bold uppercase tracking-wider">Change Password</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Reset Password</DialogTitle>
                  <DialogDescription>
                    Enter your email to receive a Firebase password reset link.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Email Address</Label>
                    <Input 
                      type="email" 
                      placeholder="your@email.com" 
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsPasswordOpen(false)}>Cancel</Button>
                  <Button onClick={handleResetPassword}>Send Reset Link</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
