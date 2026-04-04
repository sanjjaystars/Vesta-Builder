import { useGetDashboardSummary, useGetRecentItems } from "@workspace/api-client-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shirt, Layers, Heart, Sparkles, Plus } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export default function Dashboard() {
  const { data: summary, isLoading: isLoadingSummary } = useGetDashboardSummary();
  const { data: recentItems, isLoading: isLoadingRecent } = useGetRecentItems({ query: { queryKey: ["recent-items"] }});

  return (
    <div className="container max-w-6xl mx-auto py-8 px-4 space-y-10 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-serif font-medium tracking-tight">Overview</h1>
          <p className="text-muted-foreground mt-1">Your wardrobe at a glance.</p>
        </div>
        <Button asChild className="rounded-full shadow-sm" data-testid="button-add-item-header">
          <Link href="/wardrobe/upload">
            <Plus className="mr-2 h-4 w-4" />
            Add Item
          </Link>
        </Button>
      </div>

      {isLoadingSummary ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-32 rounded-xl" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow bg-card/50 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Items</CardTitle>
              <Shirt className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-serif">{summary?.totalItems || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">In your closet</p>
            </CardContent>
          </Card>
          
          <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow bg-card/50 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Saved Outfits</CardTitle>
              <Heart className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-serif">{summary?.totalFavorites || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">Favorite combinations</p>
            </CardContent>
          </Card>
          
          <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow bg-primary text-primary-foreground">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-primary-foreground/80">Style Inspiration</CardTitle>
              <Sparkles className="h-4 w-4 text-primary-foreground/80" />
            </CardHeader>
            <CardContent>
              <div className="mt-1">
                <Button asChild variant="secondary" size="sm" className="w-full mt-2" data-testid="button-generate-outfit-dash">
                  <Link href="/outfits">Generate Outfit</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-serif">Recently Added</h2>
          <Button asChild variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
            <Link href="/wardrobe">View all</Link>
          </Button>
        </div>

        {isLoadingRecent ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => <Skeleton key={i} className="aspect-[3/4] rounded-xl" />)}
          </div>
        ) : recentItems && recentItems.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {recentItems.slice(0, 4).map((item, i) => (
              <Link key={item.id} href={`/wardrobe/${item.id}`}>
                <div 
                  className="group relative aspect-[3/4] rounded-xl overflow-hidden bg-muted border border-border/50 cursor-pointer animate-in fade-in slide-in-from-bottom-4"
                  style={{ animationDelay: `${i * 100}ms`, animationFillMode: 'both' }}
                  data-testid={`recent-item-${item.id}`}
                >
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground p-4">
                      <Shirt className="h-10 w-10 mb-2 opacity-20" />
                      <span className="text-sm font-medium text-center line-clamp-2">{item.name}</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <p className="text-white font-medium text-sm truncate">{item.name}</p>
                    <p className="text-white/70 text-xs capitalize">{item.category}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-card border border-border/50 rounded-xl border-dashed">
            <Shirt className="mx-auto h-12 w-12 text-muted-foreground/30 mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-1">Your wardrobe is empty</h3>
            <p className="text-muted-foreground mb-6 max-w-sm mx-auto">Start adding your clothes to get outfit recommendations and organize your style.</p>
            <Button asChild>
              <Link href="/wardrobe/upload">Add your first item</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
