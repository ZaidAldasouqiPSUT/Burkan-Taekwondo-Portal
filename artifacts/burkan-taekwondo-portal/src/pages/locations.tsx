import { useGetLocations } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { MapPin, Phone, Clock, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Locations() {
  const { data: locations, isLoading } = useGetLocations();

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-4xl font-display font-bold uppercase tracking-tight">Our Locations</h1>
        <p className="text-muted-foreground mt-2 text-lg">Visit us at Tabarbour or North Marka branches.</p>
      </div>

      {isLoading ? (
        <div className="space-y-6">
          <Skeleton className="h-64 w-full rounded-xl" />
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      ) : (
        <div className="grid gap-8">
          {locations?.map((location) => (
            <Card key={location.id} className="overflow-hidden border-none shadow-lg">
              <div className="flex flex-col md:flex-row">
                <div className="md:w-1/3 bg-muted relative h-64 md:h-auto">
                  {/* Map Placeholder */}
                  <div className="absolute inset-0 bg-secondary flex flex-col items-center justify-center text-secondary-foreground">
                    <MapPin className="h-12 w-12 text-primary/50 mb-2" />
                    <span className="font-display font-bold text-xl uppercase tracking-widest opacity-50">Map View</span>
                  </div>
                </div>
                
                <CardContent className="md:w-2/3 p-8 flex flex-col justify-center bg-card">
                  <h2 className="text-3xl font-display font-bold uppercase mb-6 flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <MapPin className="h-4 w-4 text-primary" />
                    </span>
                    {location.name}
                  </h2>
                  
                  <div className="space-y-4 mb-8">
                    <div className="flex items-start gap-4 text-lg">
                      <MapPin className="h-6 w-6 text-muted-foreground mt-0.5 shrink-0" />
                      <span className="font-medium text-foreground/80">{location.address}</span>
                    </div>
                    
                    <div className="flex items-center gap-4 text-lg">
                      <Phone className="h-6 w-6 text-muted-foreground shrink-0" />
                      <span className="font-medium text-foreground/80">{location.phone}</span>
                    </div>
                    
                    <div className="flex items-start gap-4 text-lg">
                      <Clock className="h-6 w-6 text-muted-foreground mt-0.5 shrink-0" />
                      <span className="font-medium text-foreground/80 whitespace-pre-line">{location.hours}</span>
                    </div>
                  </div>
                  
                  <Button asChild size="lg" className="w-full sm:w-auto font-bold uppercase tracking-wider h-14">
                    <a href={location.mapsUrl} target="_blank" rel="noopener noreferrer">
                      Open in Google Maps <ExternalLink className="ml-2 h-5 w-5" />
                    </a>
                  </Button>
                </CardContent>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
