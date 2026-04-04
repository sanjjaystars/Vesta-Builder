import { useParams, Link, useLocation } from "wouter";
import { 
  useGetClothingItem, 
  useDeleteClothingItem, 
  useToggleClothingAvailability, 
  getGetClothingItemQueryKey,
  getListClothingItemsQueryKey,
  getGetDashboardSummaryQueryKey,
  getGetRecentItemsQueryKey
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Trash2, Edit, WashingMachine, CheckCircle2 } from "lucide-react";
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

export default function ItemDetails() {
  const params = useParams();
  const id = Number(params.id);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: item, isLoading } = useGetClothingItem(id, {
    query: { enabled: !!id, queryKey: getGetClothingItemQueryKey(id) }
  });

  const deleteItem = useDeleteClothingItem();
  const toggleAvailability = useToggleClothingAvailability();

  const handleDelete = () => {
    deleteItem.mutate({ id }, {
      onSuccess: () => {
        toast({
          title: "Item deleted",
          description: "The item has been removed from your wardrobe."
        });
        queryClient.invalidateQueries({ queryKey: getListClothingItemsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetDashboardSummaryQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetRecentItemsQueryKey() });
        setLocation("/wardrobe");
      },
      onError: () => {
        toast({
          title: "Error",
          description: "Failed to delete item. Please try again.",
          variant: "destructive"
        });
      }
    });
  };

  const handleToggleLaundry = () => {
    if (!item) return;
    
    toggleAvailability.mutate({ id, data: { isAvailable: !item.isAvailable } }, {
      onSuccess: (updatedItem) => {
        toast({
          title: updatedItem.isAvailable ? "Marked as available" : "Moved to laundry",
          description: updatedItem.isAvailable ? "Item is now available for outfits." : "Item marked as unavailable."
        });
        queryClient.setQueryData(getGetClothingItemQueryKey(id), updatedItem);
        queryClient.invalidateQueries({ queryKey: getListClothingItemsQueryKey() });
      },
      onError: () => {
        toast({
          title: "Error",
          description: "Failed to update item status.",
          variant: "destructive"
        });
      }
    });
  };

  if (isLoading) {
    return (
      <div className="container max-w-5xl mx-auto py-8 px-4 space-y-8">
        <Skeleton className="h-10 w-32" />
        <div className="grid md:grid-cols-2 gap-12">
          <Skeleton className="aspect-[3/4] rounded-xl" />
          <div className="space-y-6">
            <Skeleton className="h-12 w-3/4" />
            <Skeleton className="h-6 w-1/4" />
            <Separator />
            <div className="grid grid-cols-2 gap-4">
              <Skeleton className="h-16 rounded-lg" />
              <Skeleton className="h-16 rounded-lg" />
              <Skeleton className="h-16 rounded-lg" />
              <Skeleton className="h-16 rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="container max-w-md mx-auto py-24 px-4 text-center space-y-6">
        <h2 className="text-2xl font-serif">Item not found</h2>
        <p className="text-muted-foreground">The item you're looking for doesn't exist or has been deleted.</p>
        <Button asChild>
          <Link href="/wardrobe">Back to Wardrobe</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container max-w-5xl mx-auto py-8 px-4 space-y-8 animate-in fade-in duration-500">
      <div>
        <Button asChild variant="ghost" className="mb-4 -ml-4 text-muted-foreground" data-testid="button-back-wardrobe">
          <Link href="/wardrobe">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Wardrobe
          </Link>
        </Button>
      </div>

      <div className="grid md:grid-cols-2 gap-8 md:gap-16">
        <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-muted border border-border/50 shadow-sm">
          {item.imageUrl ? (
            <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              No image available
            </div>
          )}
          {!item.isAvailable && (
            <div className="absolute inset-0 bg-black/20 flex flex-col items-center justify-center text-white backdrop-blur-[2px]">
              <WashingMachine className="h-12 w-12 mb-4 opacity-80" />
              <span className="font-serif text-2xl font-medium tracking-tight">In Laundry</span>
            </div>
          )}
        </div>

        <div className="flex flex-col space-y-8">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <Badge variant="secondary" className="capitalize px-3 py-1 font-medium">{item.category}</Badge>
              {item.isAvailable ? (
                <Badge variant="outline" className="border-green-500/30 text-green-700 bg-green-500/10"><CheckCircle2 className="mr-1.5 h-3 w-3" /> Available</Badge>
              ) : (
                <Badge variant="outline" className="border-destructive/30 text-destructive bg-destructive/10"><WashingMachine className="mr-1.5 h-3 w-3" /> In Laundry</Badge>
              )}
            </div>
            <h1 className="text-4xl font-serif font-medium tracking-tight mb-2">{item.name}</h1>
            <p className="text-muted-foreground text-sm">Added on {format(new Date(item.createdAt), 'MMMM d, yyyy')}</p>
          </div>

          <Separator className="bg-border/60" />

          <div className="grid grid-cols-2 gap-x-6 gap-y-8">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1 uppercase tracking-wider">Color</p>
              <p className="text-lg capitalize">{item.color}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1 uppercase tracking-wider">Style</p>
              <p className="text-lg capitalize">{item.style}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1 uppercase tracking-wider">Fit</p>
              <p className="text-lg capitalize">{item.fit}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1 uppercase tracking-wider">Pattern</p>
              <p className="text-lg capitalize">{item.pattern}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1 uppercase tracking-wider">Season</p>
              <p className="text-lg capitalize">{item.season}</p>
            </div>
          </div>

          {item.notes && (
            <>
              <Separator className="bg-border/60" />
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2 uppercase tracking-wider">Notes</p>
                <p className="text-base leading-relaxed whitespace-pre-wrap">{item.notes}</p>
              </div>
            </>
          )}

          <div className="flex-1" />

          <div className="flex flex-col sm:flex-row gap-4 pt-6 mt-auto border-t border-border/60">
            <Button 
              variant={item.isAvailable ? "secondary" : "default"} 
              className="flex-1 rounded-full h-12"
              onClick={handleToggleLaundry}
              disabled={toggleAvailability.isPending}
              data-testid="button-toggle-laundry"
            >
              {toggleAvailability.isPending ? (
                <Skeleton className="h-5 w-24 mx-auto" />
              ) : item.isAvailable ? (
                <><WashingMachine className="mr-2 h-4 w-4" /> Send to Laundry</>
              ) : (
                <><CheckCircle2 className="mr-2 h-4 w-4" /> Mark Available</>
              )}
            </Button>
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="flex-1 rounded-full h-12" data-testid="button-delete-item">
                  <Trash2 className="mr-2 h-4 w-4" /> Delete Item
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete this clothing item from your wardrobe.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                    {deleteItem.isPending ? "Deleting..." : "Delete Item"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </div>
    </div>
  );
}
