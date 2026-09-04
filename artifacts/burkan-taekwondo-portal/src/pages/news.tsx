import { useGetNews } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
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
            <Card key={item.id} className="overflow-hidden border-none shadow-md hover-elevate group flex flex-col">
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
    </div>
  );
}
