import { useState } from "react";
import { useGetNews } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Calendar, User } from "lucide-react";

// The API doesn't provide these images, so we use local assets for the prototype
const LOCAL_IMAGES: Record<string, string> = {
  "islam": "/assets/Islam_Al_Natsheh_1788557360820.png",
  "sarah": "/assets/Sarah_Abu_Jaish2_1788557360819.png",
  "rama": "/assets/Rama1_1788557360821.png",
  "default": "/assets/Burkan1_1788557360822.png",
};

export default function News() {
  const { data: news, isLoading } = useGetNews();
  const [selectedStory, setSelectedStory] = useState<any | null>(null);

  const getImageForNews = (title: string) => {
    const t = title.toLowerCase();
    if (t.includes('islam')) return LOCAL_IMAGES.islam;
    if (t.includes('sarah')) return LOCAL_IMAGES.sarah;
    if (t.includes('rama') || t.includes('championship')) return LOCAL_IMAGES.rama;
    return LOCAL_IMAGES.default;
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-4xl font-display font-bold uppercase tracking-tight">Club News</h1>
        <p className="text-muted-foreground mt-2 text-lg">Announcements, achievements, and Burkan pride.</p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3,4].map(i => (
            <div key={i} className="space-y-4">
              <Skeleton className="h-64 w-full rounded-xl" />
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-20 w-full" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {news?.map((item, index) => (
            <Card key={item.id} className="overflow-hidden border-none shadow-md hover-elevate group flex flex-col cursor-pointer" onClick={() => setSelectedStory(item)}>
              <div className="relative h-64 overflow-hidden bg-black">
                <img 
                  src={getImageForNews(item.title)} 
                  alt={item.title} 
                  className="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700" 
                />
                <div className="absolute top-4 left-4">
                  <Badge className="bg-primary hover:bg-primary text-primary-foreground font-bold uppercase tracking-wider text-xs">
                    {item.category}
                  </Badge>
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              </div>
              
              <CardContent className="p-6 flex-1 flex flex-col bg-card">
                <div className="flex items-center gap-4 text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">
                  <span className="flex items-center gap-1.5"><Calendar className="h-3 w-3 text-primary" /> {format(new Date(item.publishedAt), 'MMM d, yyyy')}</span>
                  <span className="flex items-center gap-1.5"><User className="h-3 w-3 text-primary" /> {item.author}</span>
                </div>
                
                <h3 className="font-display text-2xl font-bold mb-3 leading-tight group-hover:text-primary transition-colors">
                  {item.title}
                </h3>
                
                <p className="text-muted-foreground line-clamp-3 mb-4">
                  {item.excerpt}
                </p>
                
                <div className="mt-auto pt-4">
                  <span className="text-primary font-bold text-sm uppercase tracking-widest cursor-pointer hover:underline">
                    Read Story &rarr;
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={!!selectedStory} onOpenChange={(open) => !open && setSelectedStory(null)}>
        <DialogContent className="sm:max-w-[700px] p-0 overflow-hidden">
          {selectedStory && (
            <>
              <div className="relative h-48 sm:h-64 bg-black w-full">
                <img 
                  src={getImageForNews(selectedStory.title)} 
                  alt={selectedStory.title} 
                  className="w-full h-full object-cover opacity-80" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
              </div>
              
              <div className="px-6 sm:px-8 pb-8 -mt-12 relative z-10">
                <div className="flex items-center gap-2 mb-3">
                  <Badge className="bg-primary hover:bg-primary text-primary-foreground font-bold uppercase tracking-wider text-xs">
                    {selectedStory.category}
                  </Badge>
                  <span className="text-xs font-bold text-muted-foreground flex items-center gap-1.5">
                    <Calendar className="h-3 w-3" /> {format(new Date(selectedStory.publishedAt), 'MMM d, yyyy')}
                  </span>
                </div>
                
                <DialogTitle className="text-3xl font-display font-bold mb-4 leading-tight">
                  {selectedStory.title}
                </DialogTitle>
                
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-6 pb-6 border-b border-border/50">
                  <User className="h-4 w-4" /> By {selectedStory.author}
                </div>
                
                <div className="prose dark:prose-invert max-w-none text-foreground leading-relaxed space-y-4">
                  <p className="font-medium text-lg mb-4">{selectedStory.excerpt}</p>
                  <p>
                    The dedication and spirit shown by our members continue to impress the coaching staff and the wider federation. 
                    This achievement is a testament to the rigorous training regime and the unyielding support of the Burkan community.
                  </p>
                  <p>
                    As we move forward into the next season, we expect to build on this momentum. Stay disciplined, track your progress, 
                    and never back down.
                  </p>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
