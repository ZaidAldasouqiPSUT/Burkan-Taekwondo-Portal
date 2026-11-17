import { useState } from "react";
import { useRole, type RequestableRole } from "@/lib/role-store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Award, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

type Mode = "signin" | "signup";

const ROLE_OPTIONS: { value: RequestableRole; label: string }[] = [
  { value: "parent", label: "Parent of a student" },
  { value: "student", label: "Student" },
  { value: "coach", label: "Coach" },
];

const labelClass = "uppercase text-xs font-bold text-muted-foreground tracking-wider";

export default function Login() {
  const { login, signup, resetPassword } = useRole();
  const { toast } = useToast();

  const [mode, setMode] = useState<Mode>("signin");
  const [isLoading, setIsLoading] = useState(false);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [requestedRole, setRequestedRole] = useState<RequestableRole>("parent");

  const [isForgotOpen, setIsForgotOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [isResetting, setIsResetting] = useState(false);

  const showError = (description: string) =>
    toast({ variant: "destructive", title: "Couldn't continue", description });

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return showError("Please enter your email and password.");
    setIsLoading(true);
    const result = await login(email, password);
    setIsLoading(false);
    if (!result.ok) return showError(result.error);
    // AppShell sends the person to the right screen once their status loads.
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) return showError("Please enter your full name.");
    if (password.length < 8) return showError("Use a password of at least 8 characters.");
    if (password !== confirmPassword) return showError("The two passwords don't match.");
    setIsLoading(true);
    const result = await signup({ fullName, email, password, requestedRole });
    setIsLoading(false);
    if (!result.ok) return showError(result.error);
    toast({
      title: "Request sent",
      description: "An admin will review your account. We also sent you a verification email.",
    });
  };

  const handleResetPassword = async () => {
    if (!resetEmail) return showError("Please enter your email address.");
    setIsResetting(true);
    const result = await resetPassword(resetEmail);
    setIsResetting(false);
    if (!result.ok) return showError(result.error);
    toast({
      title: "Check your inbox",
      description: "If an account exists for that email, a reset link is on its way.",
    });
    setIsForgotOpen(false);
  };

  const switchMode = (next: Mode) => {
    setMode(next);
    setPassword("");
    setConfirmPassword("");
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-black relative overflow-hidden py-10">
      {/* Background imagery */}
      <div className="absolute inset-0 z-0 opacity-40 mix-blend-luminosity">
        <img
          src="/assets/Sarah_Abu_Jaish_and_Islam_composite_1788557360818.png"
          alt=""
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent"></div>
      </div>

      <Card className="w-full max-w-md mx-4 relative z-10 border-none shadow-2xl bg-card/95 backdrop-blur-sm">
        <CardHeader className="space-y-1 text-center pt-8">
          <div className="mx-auto w-16 h-16 bg-primary rounded-full flex items-center justify-center mb-4 shadow-lg shadow-primary/20">
            <Award className="h-8 w-8 text-primary-foreground" />
          </div>
          <CardTitle className="text-3xl font-display font-bold uppercase tracking-tight">Burkan Portal</CardTitle>
          <CardDescription className="text-base">
            {mode === "signin" ? "Sign in to access your dashboard" : "Request an account. An admin approves every new member."}
          </CardDescription>
        </CardHeader>
        <CardContent className="pb-8">
          <div className="mb-6 grid grid-cols-2 rounded-lg bg-muted p-1 text-sm font-semibold">
            {(["signin", "signup"] as const).map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => switchMode(item)}
                className={cn(
                  "rounded-md py-2 transition-colors",
                  mode === item ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
                )}
              >
                {item === "signin" ? "Sign In" : "Create Account"}
              </button>
            ))}
          </div>

          <form onSubmit={mode === "signin" ? handleSignIn : handleSignUp} className="space-y-6">
            <div className="space-y-4">
              {mode === "signup" && (
                <div className="space-y-2">
                  <Label htmlFor="fullName" className={labelClass}>Full Name</Label>
                  <Input
                    id="fullName"
                    autoComplete="name"
                    required
                    className="h-12 bg-background"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className={labelClass}>Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="your@email.com"
                  required
                  className="h-12 bg-background"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              {mode === "signup" && (
                <div className="space-y-2">
                  <Label htmlFor="requestedRole" className={labelClass}>I am a</Label>
                  <select
                    id="requestedRole"
                    className="h-12 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                    value={requestedRole}
                    onChange={(e) => setRequestedRole(e.target.value as RequestableRole)}
                  >
                    {ROLE_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className={labelClass}>Password</Label>
                  {mode === "signin" && (
                    <Dialog open={isForgotOpen} onOpenChange={setIsForgotOpen}>
                      <DialogTrigger asChild>
                        <button type="button" className="text-xs font-medium text-primary hover:underline bg-transparent border-none cursor-pointer">
                          Forgot password?
                        </button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                          <DialogTitle>Reset Password</DialogTitle>
                          <DialogDescription>
                            Enter your account email and we'll send you a link to choose a new password.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-2 py-4">
                          <Label htmlFor="resetEmail">Email</Label>
                          <Input
                            id="resetEmail"
                            type="email"
                            autoComplete="email"
                            placeholder="your@email.com"
                            value={resetEmail}
                            onChange={(e) => setResetEmail(e.target.value)}
                          />
                        </div>
                        <DialogFooter>
                          <Button type="button" variant="outline" onClick={() => setIsForgotOpen(false)}>Cancel</Button>
                          <Button type="button" onClick={handleResetPassword} disabled={isResetting}>
                            {isResetting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send Reset Link"}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  )}
                </div>
                <Input
                  id="password"
                  type="password"
                  autoComplete={mode === "signin" ? "current-password" : "new-password"}
                  required
                  minLength={mode === "signup" ? 8 : undefined}
                  className="h-12 bg-background"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              {mode === "signup" && (
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className={labelClass}>Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    required
                    className="h-12 bg-background"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
              )}
            </div>

            <Button type="submit" className="w-full h-14 text-lg font-bold uppercase tracking-widest" disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : mode === "signin" ? (
                "Sign In"
              ) : (
                "Request Access"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
