import { useState } from "react";
import { useGetFinancialRecords, useGetDashboardSummary } from "@workspace/api-client-react";
import { useRole } from "@/lib/role-store";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { CreditCard, History, AlertCircle, Download, CheckCircle2, Clock, Filter } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

export default function Finances() {
  const { role } = useRole();
  const { data: records, isLoading } = useGetFinancialRecords();
  const { data: summary } = useGetDashboardSummary();
  const { toast } = useToast();

  const [paymentOpen, setPaymentOpen] = useState(false);

  if (role === 'coach') {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center p-6">
        <AlertCircle className="h-16 w-16 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-display font-bold mb-2">Access Restricted</h2>
        <p className="text-muted-foreground max-w-md">Financial records are restricted to Parents, Students, and Admins.</p>
      </div>
    );
  }

  const handleSimulatePayment = () => {
    toast({ title: "Payment Successful", description: "Your payment has been recorded." });
    setPaymentOpen(false);
  };

  const handleExport = () => {
    toast({ title: "Exporting Data", description: "Your financial report is being generated." });
  };

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-display font-bold uppercase tracking-tight">Financial Ledger</h1>
        <p className="text-muted-foreground mt-1">Manage dues, testing fees, and payment history.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Summary Card */}
        <Card className="md:col-span-1 border-none shadow-lg bg-card overflow-hidden">
          <div className="h-2 w-full bg-primary" />
          <CardContent className="p-6">
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2">Outstanding Balance</p>
            {summary ? (
              <h2 className="text-5xl font-display font-bold text-primary mb-6">${summary.outstandingBalance}</h2>
            ) : (
              <Skeleton className="h-12 w-32 mb-6" />
            )}
            
            <div className="space-y-3">
              <Dialog open={paymentOpen} onOpenChange={setPaymentOpen}>
                <DialogTrigger asChild>
                  <Button className="w-full font-bold uppercase tracking-wider h-12">
                    <CreditCard className="mr-2 h-5 w-5" /> Pay Now
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Make a Payment</DialogTitle>
                    <DialogDescription>
                      Settle your outstanding balance.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg mt-2 mb-4 dark:bg-amber-950/30 dark:border-amber-900/50">
                    <p className="text-sm font-medium text-amber-800 dark:text-amber-500">
                      Online payments are coming soon. This is a demo placeholder. Click "Simulate Payment" to proceed.
                    </p>
                  </div>
                  <div className="flex justify-between items-center text-lg font-bold mb-4 px-2">
                    <span>Total Due:</span>
                    <span className="text-primary">${summary?.outstandingBalance || 0}</span>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setPaymentOpen(false)}>Cancel</Button>
                    <Button onClick={handleSimulatePayment} disabled={!summary?.outstandingBalance}>Simulate Payment</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <div className="text-center text-xs text-muted-foreground">
                Online payments are coming soon.<br/>
                Please pay at the front desk.
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Ledger */}
        <Card className="md:col-span-2 border-none shadow-sm bg-card">
          <CardHeader className="border-b border-border/50 pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="font-display text-xl flex items-center gap-2">
                <History className="h-5 w-5 text-primary" />
                Transaction History
              </CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" size="icon" onClick={() => toast({ title: "Filter", description: "Filter options coming soon." })}>
                  <Filter className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={handleExport}>
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-6 space-y-4">
                {[1,2,3,4].map(i => <Skeleton key={i} className="h-16 w-full rounded-md" />)}
              </div>
            ) : records?.length === 0 ? (
              <div className="p-12 text-center text-muted-foreground">
                <p>No financial records found.</p>
              </div>
            ) : (
              <div className="divide-y divide-border/50">
                {records?.map((record) => (
                  <div key={record.id} className="p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-muted/30 transition-colors">
                    <div className="flex items-start gap-4">
                      <div className="mt-1">
                        {record.status === 'Paid' ? (
                          <CheckCircle2 className="h-5 w-5 text-green-500" />
                        ) : record.status === 'Pending' ? (
                          <Clock className="h-5 w-5 text-amber-500" />
                        ) : (
                          <AlertCircle className="h-5 w-5 text-destructive" />
                        )}
                      </div>
                      <div>
                        <div className="font-bold text-base mb-1">{record.description}</div>
                        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground font-medium">
                          <span className="uppercase">{record.type}</span>
                          <span>&bull;</span>
                          <span>{format(new Date(record.timestamp), 'MMM d, yyyy')}</span>
                          {(role === 'parent' || role === 'admin') && (
                            <>
                              <span>&bull;</span>
                              <span className="text-primary">{record.studentName}</span>
                            </>
                          )}
                        </div>
                        {record.dueDate && record.status === 'Pending' && (
                          <div className="text-xs text-amber-600 mt-1 font-bold">
                            Due: {format(new Date(record.dueDate), 'MMM d, yyyy')}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between sm:flex-col sm:items-end gap-2 shrink-0">
                      <div className="text-xl font-display font-bold">
                        {record.amount > 0 ? '+' : ''}{record.amount} JD
                      </div>
                      <Badge 
                        variant="outline" 
                        className="uppercase text-[10px] font-bold tracking-wider"
                      >
                        {record.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
