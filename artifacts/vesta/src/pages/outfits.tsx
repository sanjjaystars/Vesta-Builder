import { useState } from "react";
import { 
  useListClothingItems, 
  useGetOutfitMatches, 
  useGenerateOutfit, 
  useSaveFavorite,
  getListFavoritesQueryKey,
  getGetDashboardSummaryQueryKey
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Sparkles, Heart, Shirt, AlertCircle, RefreshCw } from "lucide-react";
import type { ClothingItem, OutfitMatch, GeneratedOutfit } from "@workspace/api-client-react/src/generated/api.schemas";

export default function Outfits() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [selectedStyle, setSelectedStyle] = useState<string>("none");
  const [selectedItem, setSelectedItem] = useState<ClothingItem | null>(null);
  const [generatedOutfit, setGeneratedOutfit] = useState<GeneratedOutfit | null>(null);
  
  // Queries & Mutations
  const { data: wardrobeItems, isLoading: isLoadingWardrobe } = useListClothingItems({
    isAvailable: true
  });
  
  const getMatches = useGetOutfitMatches();
  const generateOutfit = useGenerateOutfit();
  const saveFavorite = useSaveFavorite();

  const handleSelectBaseItem = (item: ClothingItem) => {
    setSelectedItem(item);
    setGeneratedOutfit(null); // Clear any generated full outfit
    
    getMatches.mutate({ 
      data: { 
        clothingItemId: item.id,
        filterStyle: selectedStyle !== "none" ? selectedStyle : undefined
      } 
    });
  };

  const handleGenerateFullOutfit = () => {
    setSelectedItem(null); // Clear base item selection
    
    generateOutfit.mutate(
      { data: { filterStyle: selectedStyle !== "none" ? selectedStyle : undefined } },
      {
        onSuccess: (data) => setGeneratedOutfit(data),
        onError: () => {
          toast({
            title: "Could not generate outfit",
            description: "Make sure you have available top and bottom items in your wardrobe.",
            variant: "destructive"
          });
        }
      }
    );
  };

  const handleSaveFavorite = (topId: number, bottomId: number, score: number, reason: string) => {
    saveFavorite.mutate(
      { data: { topId, bottomId, score, reason } },
      {
        onSuccess: () => {
          toast({
            title: "Outfit saved!",
            description: "Added to your favorites."
          });
          queryClient.invalidateQueries({ queryKey: getListFavoritesQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetDashboardSummaryQueryKey() });
        },
        onError: () => {
          toast({
            title: "Error",
            description: "Failed to save outfit.",
            variant: "destructive"
          });
        }
      }
    );
  };

  const topWearItems = wardrobeItems?.filter(i => ["shirt", "t-shirt", "top wear", "hoodie", "jacket"].includes(i.category)) || [];
  const bottomWearItems = wardrobeItems?.filter(i => ["pant", "jeans", "cargo"].includes(i.category)) || [];

  return (
    <div className="container max-w-6xl mx-auto py-8 px-4 space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-serif font-medium tracking-tight">Style Suggestions</h1>
        <p className="text-muted-foreground mt-1">Discover new combinations from your wardrobe.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-6 p-6 rounded-2xl bg-card border border-border/50 shadow-sm items-center justify-between">
        <div className="space-y-1 w-full md:w-auto">
          <label className="text-sm font-medium">Style Context (Optional)</label>
          <Select value={selectedStyle} onValueChange={setSelectedStyle}>
            <SelectTrigger className="w-full md:w-[200px]" data-testid="select-outfit-style">
              <SelectValue placeholder="Select style context" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Any Style</SelectItem>
              <SelectItem value="casual">Casual</SelectItem>
              <SelectItem value="formal">Formal</SelectItem>
              <SelectItem value="streetwear">Streetwear</SelectItem>
              <SelectItem value="party">Party</SelectItem>
              <SelectItem value="traditional">Traditional</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="hidden md:block w-px h-10 bg-border"></div>
          <Button 
            size="lg" 
            className="w-full md:w-auto rounded-full" 
            onClick={handleGenerateFullOutfit}
            disabled={generateOutfit.isPending || isLoadingWardrobe}
            data-testid="button-magic-generate"
          >
            {generateOutfit.isPending ? (
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="mr-2 h-4 w-4" />
            )}
            Magic Generate
          </Button>
        </div>
      </div>

      {generatedOutfit && (
        <div className="animate-in slide-in-from-bottom-8 fade-in duration-700">
          <h2 className="text-xl font-serif mb-4 flex items-center gap-2"><Sparkles className="h-5 w-5 text-primary" /> Generated Look</h2>
          <Card className="border-primary/20 shadow-md bg-gradient-to-br from-card to-accent/5 overflow-hidden">
            <CardContent className="p-6 md:p-8">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div className="flex justify-center gap-4 md:gap-8">
                  <div className="space-y-2 text-center w-32 md:w-48">
                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Top</p>
                    <div className="aspect-[3/4] rounded-xl overflow-hidden bg-muted border border-border/50 shadow-sm relative">
                      {generatedOutfit.top.imageUrl ? (
                        <img src={generatedOutfit.top.imageUrl} alt={generatedOutfit.top.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                          <Shirt className="h-8 w-8 opacity-20" />
                        </div>
                      )}
                    </div>
                    <p className="text-sm font-medium line-clamp-1">{generatedOutfit.top.name}</p>
                  </div>
                  
                  <div className="space-y-2 text-center w-32 md:w-48">
                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Bottom</p>
                    <div className="aspect-[3/4] rounded-xl overflow-hidden bg-muted border border-border/50 shadow-sm relative">
                      {generatedOutfit.bottom.imageUrl ? (
                        <img src={generatedOutfit.bottom.imageUrl} alt={generatedOutfit.bottom.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                          <Shirt className="h-8 w-8 opacity-20" />
                        </div>
                      )}
                    </div>
                    <p className="text-sm font-medium line-clamp-1">{generatedOutfit.bottom.name}</p>
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">Match Score: {generatedOutfit.score}/10</Badge>
                    </div>
                    <h3 className="text-2xl font-serif font-medium leading-tight">Why this works</h3>
                    <p className="text-muted-foreground mt-2 leading-relaxed">{generatedOutfit.reason}</p>
                  </div>
                  
                  <Button 
                    onClick={() => handleSaveFavorite(generatedOutfit.top.id, generatedOutfit.bottom.id, generatedOutfit.score, generatedOutfit.reason)}
                    variant="outline"
                    className="rounded-full w-full sm:w-auto border-primary/20 hover:bg-primary/5"
                    disabled={saveFavorite.isPending}
                    data-testid="button-save-generated"
                  >
                    <Heart className="mr-2 h-4 w-4" /> Save to Favorites
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {!generatedOutfit && (
        <div className="space-y-6">
          <h2 className="text-xl font-serif">Or start with a base item</h2>
          <p className="text-sm text-muted-foreground -mt-4">Select an item below to see what matches it best.</p>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4">
            {isLoadingWardrobe ? (
              [1, 2, 3, 4, 5, 6].map(i => <Skeleton key={i} className="aspect-square rounded-xl" />)
            ) : topWearItems.slice(0, 6).map((item) => (
              <div 
                key={item.id}
                onClick={() => handleSelectBaseItem(item)}
                className={`cursor-pointer rounded-xl overflow-hidden border-2 transition-all aspect-square relative group ${
                  selectedItem?.id === item.id ? 'border-primary ring-2 ring-primary/20' : 'border-transparent hover:border-border'
                }`}
                data-testid={`base-item-${item.id}`}
              >
                {item.imageUrl ? (
                  <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-muted flex items-center justify-center">
                    <Shirt className="h-6 w-6 opacity-20 text-muted-foreground" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <span className="text-white text-xs font-medium px-2 text-center">Select Base</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedItem && getMatches.data && (
        <div className="space-y-6 pt-8 border-t border-border/50 animate-in fade-in duration-500">
          <h2 className="text-2xl font-serif font-medium flex items-center gap-2">
            Matches for <span className="text-muted-foreground italic text-xl">"{selectedItem.name}"</span>
          </h2>
          
          {getMatches.data.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {getMatches.data.map((match, idx) => {
                const isTopSelected = ["shirt", "t-shirt", "top wear", "hoodie", "jacket"].includes(selectedItem.category);
                const topItem = isTopSelected ? selectedItem : match.item;
                const bottomItem = isTopSelected ? match.item : selectedItem;
                
                return (
                  <Card key={idx} className="border-border/50 shadow-sm overflow-hidden flex flex-col h-full hover:shadow-md transition-shadow">
                    <CardContent className="p-0 flex flex-col h-full">
                      <div className="grid grid-cols-2 h-48 sm:h-56 bg-muted/30">
                        <div className="relative border-r border-border/50">
                          {topItem.imageUrl ? (
                            <img src={topItem.imageUrl} alt={topItem.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground p-2 text-center">
                              <Shirt className="h-6 w-6 opacity-20 mb-2" />
                              <span className="text-xs line-clamp-2">{topItem.name}</span>
                            </div>
                          )}
                          <div className="absolute top-2 left-2 bg-background/80 backdrop-blur-sm text-xs px-2 py-0.5 rounded uppercase font-medium tracking-wider text-muted-foreground">Top</div>
                        </div>
                        <div className="relative">
                          {bottomItem.imageUrl ? (
                            <img src={bottomItem.imageUrl} alt={bottomItem.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground p-2 text-center">
                              <Shirt className="h-6 w-6 opacity-20 mb-2" />
                              <span className="text-xs line-clamp-2">{bottomItem.name}</span>
                            </div>
                          )}
                          <div className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm text-xs px-2 py-0.5 rounded uppercase font-medium tracking-wider text-muted-foreground">Bottom</div>
                        </div>
                      </div>
                      
                      <div className="p-5 flex-1 flex flex-col">
                        <div className="flex justify-between items-start mb-2">
                          <Badge variant={match.score >= 8 ? "default" : "secondary"}>
                            {match.matchType} ({match.score}/10)
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-2 mb-4 flex-1">{match.reason}</p>
                        
                        <Button 
                          variant="outline" 
                          className="w-full rounded-full"
                          onClick={() => handleSaveFavorite(topItem.id, bottomItem.id, match.score, match.reason)}
                          disabled={saveFavorite.isPending}
                          data-testid={`button-save-match-${idx}`}
                        >
                          <Heart className="mr-2 h-4 w-4" /> Save Outfit
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="p-12 text-center bg-card rounded-xl border border-border/50 border-dashed">
              <AlertCircle className="h-10 w-10 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No matches found</h3>
              <p className="text-muted-foreground mb-4">We couldn't find good matches for this item based on your filters.</p>
              <Button variant="outline" onClick={() => setSelectedStyle("none")}>Clear Style Filter</Button>
            </div>
          )}
        </div>
      )}

      {getMatches.isPending && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-8 border-t border-border/50">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-80 rounded-xl" />)}
        </div>
      )}
    </div>
  );
}
