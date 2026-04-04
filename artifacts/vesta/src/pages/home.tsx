import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <header className="absolute top-0 w-full z-10 px-6 py-8 flex justify-between items-center">
        <div className="font-serif text-2xl font-bold tracking-tight">Vesta</div>
        <div className="flex gap-4">
          <Link href="/sign-in" className="text-sm font-medium hover:text-primary transition-colors" data-testid="link-sign-in">
            Sign In
          </Link>
        </div>
      </header>
      
      <main className="flex-1 flex flex-col items-center justify-center relative overflow-hidden px-4">
        {/* Background elements */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-accent/20 via-background to-background pointer-events-none"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="z-10 max-w-3xl text-center space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <div className="space-y-4">
            <h1 className="text-5xl md:text-7xl font-serif font-medium tracking-tight text-foreground">
              Your personal style, <br/><span className="text-primary italic">beautifully organized</span>.
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto font-light leading-relaxed">
              A quiet, personal space for your wardrobe. Discover new outfits, track your favorites, and own your look.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Button asChild size="lg" className="h-14 px-8 text-base rounded-full shadow-lg hover:shadow-xl transition-all w-full sm:w-auto" data-testid="button-get-started">
              <Link href="/sign-up">Start organizing</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="h-14 px-8 text-base rounded-full w-full sm:w-auto bg-transparent border-primary/20 hover:bg-accent/50" data-testid="button-sign-in">
              <Link href="/sign-in">Sign in to your closet</Link>
            </Button>
          </div>
        </div>
        
        <div className="mt-20 w-full max-w-5xl rounded-xl overflow-hidden shadow-2xl border border-border/50 animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-300">
          <div
            className="w-full aspect-[16/9] bg-gradient-to-br from-primary/10 via-accent/30 to-muted flex items-center justify-center"
            aria-label="Wardrobe illustration"
          >
            <div className="text-center space-y-6 p-12">
              <div className="flex justify-center gap-3">
                {["casual", "formal", "streetwear", "party"].map((style) => (
                  <div
                    key={style}
                    className="w-24 h-32 rounded-lg bg-background/60 border border-border/40 flex items-end justify-center pb-3 shadow-sm"
                  >
                    <span className="text-xs text-muted-foreground capitalize font-medium">{style}</span>
                  </div>
                ))}
              </div>
              <p className="text-muted-foreground text-base font-light tracking-wide">Your entire wardrobe, beautifully organized</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
