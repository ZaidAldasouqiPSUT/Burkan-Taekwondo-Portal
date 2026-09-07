import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';

export default function NotFound() {
  return (
    <div className="min-h-full w-full flex items-center justify-center p-4">
      <Card className="w-full max-w-md mx-4 border-none shadow-lg text-center">
        <CardContent className="pt-8 pb-8 flex flex-col items-center">
          <AlertCircle className="h-16 w-16 text-primary mb-4" />
          <h1 className="text-3xl font-display font-bold uppercase tracking-tight mb-2">
            Page Not Found
          </h1>
          <p className="text-muted-foreground mb-8">
            The page you are looking for does not exist or has been moved.
          </p>
          <Button asChild className="font-bold uppercase tracking-wider">
            <Link href="/">Return to Dashboard</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
