import { Card, CardContent } from "@/components/ui/card";

export default function About() {
  return (
    <div className="min-h-full bg-muted/20">
      {/* Hero Section */}
      <div className="relative bg-black text-white px-6 py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="/assets/Mahmoud_Sqoor_1788557360819.png" 
            alt="Grand Master Mahmoud Sqoor" 
            className="w-full h-full object-cover object-top opacity-50"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-transparent"></div>
        </div>
        
        <div className="relative z-10 max-w-4xl mx-auto">
          <img src="/assets/Burkan2_1788557360821.png" alt="Burkan TKD" className="h-24 md:h-32 mb-8 object-contain" />
          <h1 className="text-4xl md:text-6xl font-display font-bold uppercase tracking-tighter mb-4">
            Legacy of <span className="text-primary">Champions</span>
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl leading-relaxed">
            Burkan Taekwondo Center is a pillar of Jordanian Taekwondo. For decades, we have shaped national heroes, fostered discipline, and built a community bound by respect and excellence.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 md:px-8 py-12 md:py-16 space-y-16 relative z-20">
        
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-display font-bold uppercase mb-6 border-l-4 border-primary pl-4">The Grand Master</h2>
            <div className="prose prose-lg dark:prose-invert text-muted-foreground">
              <p className="font-medium text-foreground">
                Founded by Grand Master Mahmoud Sqoor, Burkan Taekwondo Center represents the pinnacle of martial arts in Jordan.
              </p>
              <p>
                Under his leadership, the club has produced countless national team members, international medalists, and champions who carry the Burkan spirit across the globe. His philosophy blends rigorous traditional discipline with modern athletic science.
              </p>
            </div>
          </div>
          <div className="relative">
            <div className="absolute inset-0 bg-primary translate-x-3 translate-y-3 rounded-xl"></div>
            <img 
              src="/assets/Mahmoud_Sqoor_1788557360819.png" 
              alt="Grand Master Mahmoud Sqoor" 
              className="relative z-10 rounded-xl w-full h-auto object-cover shadow-xl grayscale hover:grayscale-0 transition-all duration-700" 
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="order-2 md:order-1 grid grid-cols-2 gap-4">
            <img 
              src="/assets/Sarah_Abu_Jaish_and_Islam_composite_1788557360818.png" 
              alt="Champions" 
              className="rounded-xl w-full h-64 object-cover shadow-md" 
            />
            <img 
              src="/assets/Rama1_1788557360821.png" 
              alt="Tournament" 
              className="rounded-xl w-full h-64 object-cover shadow-md mt-8" 
            />
          </div>
          <div className="order-1 md:order-2">
            <h2 className="text-3xl font-display font-bold uppercase mb-6 border-l-4 border-primary pl-4">National Pride</h2>
            <div className="prose prose-lg dark:prose-invert text-muted-foreground">
              <p>
                Our athletes don't just compete; they dominate. Burkan Taekwondo is a recognized feeder for the Jordanian National Team.
              </p>
              <p>
                From cadet championships to the Olympic stage, the red and black of Burkan is feared and respected. We train not just for medals, but to represent our country with unparalleled honor and strength.
              </p>
            </div>
          </div>
        </div>

        <Card className="bg-primary text-primary-foreground border-none shadow-xl text-center p-8 md:p-12">
          <CardContent className="p-0 space-y-6">
            <h3 className="text-3xl font-display font-bold uppercase">Join The Family</h3>
            <p className="text-lg text-primary-foreground/90 max-w-2xl mx-auto">
              Whether you are taking your first step onto the mat or aiming for gold on the world stage, Burkan Taekwondo Center is your home.
            </p>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
