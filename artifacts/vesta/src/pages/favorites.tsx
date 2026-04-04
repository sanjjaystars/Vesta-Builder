import { useListFavorites, useDeleteFavorite, getListFavoritesQueryKey, getGetDashboardSummaryQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Heart, Trash2, Shirt, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { format } from "date-fns";

export default function Favorites() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: favorites, isLoading } = useListFavorites();
  const deleteFavorite = useDeleteFavorite();

  const handleDelete = (id: number) => {
    deleteFavorite.mutate({ id }, {
      onSuccess: () => {
        toast({
          title: "Favorite removed",
          description: "The outfit has been removed from your favorites."
        });
        queryClient.invalidateQueries({ queryKey: getListFavoritesQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetDashboardSummaryQueryKey() });
      },
      onError: () => {
        toast({
          title: "Error",
          description: "Failed to remove favorite.",
          variant: "destructive"
        });
      }
    });
  };

  return (
    <div className="container max-w-6xl mx-auto py-8 px-4 space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-serif font-medium tracking-tight">Saved Outfits</h1>
        <p className="text-muted-foreground mt-1">Your personal lookbook of perfect combinations.</p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => <Skeleton key={i} className="h-96 rounded-xl" />)}
        </div>
      ) : favorites && favorites.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {favorites.map((fav) => (
            <Card key={fav.id} className="border-border/50 shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-all group">
              <CardContent className="p-0 flex flex-col h-full relative">
                <div className="absolute top-3 right-3 z-10">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="secondary" size="icon" className="h-8 w-8 rounded-full bg-background/80 backdrop-blur opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive hover:bg-background" data-testid={`button-delete-fav-${fav.id}`}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Remove saved outfit?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will remove this combination from your favorites. The individual clothing items will not be deleted.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(fav.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                          {deleteFavorite.isPending ? "Removing..." : "Remove"}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>

                <div className="grid grid-cols-2 h-56 bg-muted/30">
                  <Link href={`/wardrobe/${fav.topId}`} className="relative border-r border-border/50 group/img">
                    {fav.top.imageUrl ? (
                      <img src={fav.top.imageUrl} alt={fav.top.name} className="w-full h-full object-cover transition-transform duration-500 group-hover/img:scale-105" />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground p-2 text-center">
                        <Shirt className="h-6 w-6 opacity-20 mb-2" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/0 group-hover/img:bg-black/10 transition-colors" />
                    <div className="absolute bottom-2 left-2 right-2 p-1.5 bg-background/90 backdrop-blur-sm rounded text-xs truncate text-center shadow-sm opacity-0 group-hover/img:opacity-100 transition-opacity">
                      {fav.top.name}
                    </div>
                  </Link>
                  
                  <Link href={`/wardrobe/${fav.bottomId}`} className="relative group/img">
                    {fav.bottom.imageUrl ? (
                      <img src={fav.bottom.imageUrl} alt={fav.bottom.name} className="w-full h-full object-cover transition-transform duration-500 group-hover/img:scale-105" />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground p-2 text-center">
                        <Shirt className="h-6 w-6 opacity-20 mb-2" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/0 group-hover/img:bg-black/10 transition-colors" />
                    <div className="absolute bottom-2 left-2 right-2 p-1.5 bg-background/90 backdrop-blur-sm rounded text-xs truncate text-center shadow-sm opacity-0 group-hover/img:opacity-100 transition-opacity">
                      {fav.bottom.name}
                    </div>
                  </Link>
                </div>
                
                <div className="p-5 flex-1 flex flex-col">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-primary">Score: {fav.score}/10</span>
                    <span className="text-xs text-muted-foreground">{format(new Date(fav.createdAt), 'MMM d, yyyy')}</span>
                  </div>
                  <p className="text-sm text-foreground/80 mt-1 flex-1 italic">"{fav.reason}"</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-24 bg-card border border-border/50 rounded-xl border-dashed">
          <Heart className="mx-auto h-12 w-12 text-muted-foreground/30 mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-1">No saved outfits yet</h3>
          <p className="text-muted-foreground mb-6 max-w-sm mx-auto">Generate and save outfit recommendations to build your personal lookbook.</p>
          <Button asChild>
            <Link href="/outfits">Find outfits</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
