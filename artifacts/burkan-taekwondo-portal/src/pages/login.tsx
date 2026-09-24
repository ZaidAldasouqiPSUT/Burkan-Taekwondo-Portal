import { useState } from "react";
import { useLocation } from "wouter";
import { useRole } from "@/lib/role-store";
import { DEMO_ACCOUNTS, DEMO_PASSWORD } from "@/lib/mock-database";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Award, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

export default function Login() {
  const [, setLocation] = useLocation();
  const { login } = useRole();
  const { toast } = useToast();
  
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [isForgotOpen, setIsForgotOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({ variant: "destructive", title: "Error", description: "Please enter your email and password." });
      return;
    }
    
    setIsLoading(true);
    
    setTimeout(() => {
      const authenticated = login(email, password);
      if (!authenticated) {
        setIsLoading(false);
        toast({
          variant: "destructive",
          title: "Sign-in failed",
          description: "Check the email and password. Demo accounts use password 123456.",
        });
        return;
      }
      toast({ title: "Welcome back!", description: "You are signed in." });
      setLocation("/");
    }, 800);
  };

  const handleResetPassword = () => {
    if (!resetEmail) {
      toast({ variant: "destructive", title: "Error", description: "Please enter your email address." });
      return;
    }
    
    toast({
      title: "Demo password",
      description: `Password resets are not enabled. Use ${DEMO_PASSWORD} for the demo accounts.`,
    });
    setIsForgotOpen(false);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-black relative overflow-hidden">
      {/* Background imagery */}
      <div className="absolute inset-0 z-0 opacity-40 mix-blend-luminosity">
        <img 
          src="/assets/Sarah_Abu_Jaish_and_Islam_composite_1788557360818.png" 
          alt="Background" 
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
          <CardDescription className="text-base">Sign in to access your dashboard</CardDescription>
        </CardHeader>
        <CardContent className="pb-8">
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="uppercase text-xs font-bold text-muted-foreground tracking-wider">Email Address</Label>
                <Input 
                  id="email" 
                  type="email" 
                  autoComplete="email"
                  placeholder="islam@burkantkd.com"
                  required 
                  className="h-12 bg-background"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="uppercase text-xs font-bold text-muted-foreground tracking-wider">Password</Label>
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
                          Password resets are not enabled for these demo accounts. Use the shared demo password.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label>Email</Label>
                          <Input 
                            type="email" 
                            autoComplete="email"
                            placeholder="your@email.com" 
                            value={resetEmail} 
                            onChange={(e) => setResetEmail(e.target.value)}
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setIsForgotOpen(false)}>Cancel</Button>
                        <Button type="button" onClick={handleResetPassword}>Show Demo Password</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
                <Input 
                  id="password" 
                  type="password" 
                  autoComplete="current-password"
                  required 
                  className="h-12 bg-background" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <div className="rounded-lg border bg-muted/30 p-3 text-xs text-muted-foreground">
              <p className="font-semibold text-foreground">Demo password: {DEMO_PASSWORD}</p>
              <details className="mt-2">
                <summary className="cursor-pointer font-medium">Demo account emails</summary>
                <ul className="mt-2 grid gap-1">
                  {DEMO_ACCOUNTS.map((account) => (
                    <li key={account.email} className="flex justify-between gap-3">
                      <span>{account.displayName}</span>
                      <span className="text-right">{account.email}</span>
                    </li>
                  ))}
                </ul>
              </details>
            </div>
            
            <Button type="submit" className="w-full h-14 text-lg font-bold uppercase tracking-widest mt-6" disabled={isLoading}>
              {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : "Sign In"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
