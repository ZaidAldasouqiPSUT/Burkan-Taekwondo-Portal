import { useState } from "react";
import { useLocation } from "wouter";
import { useRole, Role } from "@/lib/role-store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Award, Loader2 } from "lucide-react";

export default function Login() {
  const [, setLocation] = useLocation();
  const { setRole } = useRole();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role>('student');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate network delay for polish
    setTimeout(() => {
      setRole(selectedRole);
      setLocation("/");
    }, 800);
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
                <Input id="email" type="email" placeholder="champion@example.com" required className="h-12 bg-background" />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="uppercase text-xs font-bold text-muted-foreground tracking-wider">Password</Label>
                  <a href="#" className="text-xs font-medium text-primary hover:underline">Forgot password?</a>
                </div>
                <Input id="password" type="password" required className="h-12 bg-background" defaultValue="password123" />
              </div>
              
              <div className="space-y-2 pt-2">
                <Label className="uppercase text-xs font-bold text-muted-foreground tracking-wider mb-2 block">Prototype: Select Role</Label>
                <div className="grid grid-cols-2 gap-2">
                  {(['student', 'parent', 'coach', 'admin'] as const).map(r => (
                    <Button 
                      key={r}
                      type="button"
                      variant={selectedRole === r ? "default" : "outline"}
                      className={`capitalize ${selectedRole === r ? 'font-bold' : ''}`}
                      onClick={() => setSelectedRole(r)}
                    >
                      {r}
                    </Button>
                  ))}
                </div>
              </div>
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
