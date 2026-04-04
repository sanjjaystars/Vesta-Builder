import { Link, useLocation } from "wouter";
import { UserButton } from "@clerk/react";
import { Menu, X, Home, Shirt, Layers, Heart, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface LayoutProps {
  children: React.ReactNode;
}

const NAV_ITEMS = [
  { href: "/dashboard", label: "Overview", icon: Home },
  { href: "/wardrobe", label: "Wardrobe", icon: Shirt },
  { href: "/outfits", label: "Outfits", icon: Layers },
  { href: "/favorites", label: "Favorites", icon: Heart },
  { href: "/profile", label: "Profile", icon: User },
];

export function Layout({ children }: LayoutProps) {
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background text-foreground">
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-6 md:gap-10">
            <Link href="/" className="flex items-center space-x-2">
              <span className="font-serif text-xl font-bold tracking-tight">Vesta</span>
            </Link>
            
            <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const isActive = location === item.href || location.startsWith(`${item.href}/`);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-2 transition-colors hover:text-foreground/80",
                      isActive ? "text-foreground" : "text-foreground/60"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <UserButton afterSignOutUrl="/" />
            
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden" data-testid="button-mobile-menu">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle Menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <SheetTitle className="font-serif text-xl mb-6">Vesta</SheetTitle>
                <nav className="flex flex-col gap-4">
                  {NAV_ITEMS.map((item) => {
                    const Icon = item.icon;
                    const isActive = location === item.href || location.startsWith(`${item.href}/`);
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={cn(
                          "flex items-center gap-3 px-2 py-3 rounded-md transition-colors",
                          isActive ? "bg-accent text-accent-foreground" : "hover:bg-accent/50 text-foreground/80 hover:text-foreground"
                        )}
                      >
                        <Icon className="h-5 w-5" />
                        <span className="text-base font-medium">{item.label}</span>
                      </Link>
                    );
                  })}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}
