import { useState } from "react";
import {
  createChildProfile,
  getChildProfiles,
  type ChildProfile,
} from "@/lib/mock-database";
import { useRole } from "@/lib/role-store";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

export function ParentChildProfiles() {
  const { account } = useRole();
  const { toast } = useToast();
  const parentEmail = account?.email ?? "";
  const [profiles, setProfiles] = useState<ChildProfile[]>(() =>
    getChildProfiles(parentEmail),
  );
  const [isOpen, setIsOpen] = useState(false);
  const [fullName, setFullName] = useState("");

  const handleCreateProfile = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const name = fullName.trim();
    if (!name || !parentEmail) return;

    const profile = createChildProfile(parentEmail, name);
    setProfiles((current) => [...current, profile]);
    setFullName("");
    setIsOpen(false);
    toast({
      title: "Child profile created",
      description: `${profile.fullName} has been added to My Kids.`,
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
        Add new profile +
      </Button>

      {profiles.length > 0 && (
        <section className="space-y-3">
          <h2 className="font-display text-lg font-bold uppercase tracking-tight">
            Child profiles
          </h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {profiles.map((profile) => (
              <Card key={profile.id} className="border-border/60">
                <CardContent className="flex items-center gap-3 p-4">
                  <Avatar className="h-11 w-11">
                    <AvatarFallback className="bg-primary/10 font-bold text-primary">
                      {profile.fullName.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="truncate font-semibold">{profile.fullName}</p>
                    <p className="text-xs text-muted-foreground">
                      Parent-managed profile
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      <Dialog
        open={isOpen}
        onOpenChange={(open) => {
          setIsOpen(open);
          if (!open) setFullName("");
        }}
      >
        <DialogContent className="sm:max-w-md">
          <form onSubmit={handleCreateProfile} className="space-y-5">
            <DialogHeader>
              <DialogTitle>Add a child profile</DialogTitle>
              <DialogDescription>
                Create a profile managed from your parent account. Your child
                does not need a device or a separate login.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-2">
              <Label htmlFor="child-full-name">Child’s full name</Label>
              <Input
                id="child-full-name"
                autoFocus
                required
                maxLength={100}
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                placeholder="Enter full name"
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" variant="destructive">
                Create profile
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}