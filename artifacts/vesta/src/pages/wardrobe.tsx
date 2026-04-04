import { useState } from "react";
import { useListClothingItems, getListClothingItemsQueryKey } from "@workspace/api-client-react";
import { Link } from "wouter";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Shirt, Search, Filter, Plus, SlidersHorizontal } from "lucide-react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";

export default function Wardrobe() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>("");
  const [style, setStyle] = useState<string>("");
  const [season, setSeason] = useState<string>("");

  const { data: items, isLoading } = useListClothingItems({
    search: search || undefined,
    category: category || undefined,
    style: style || undefined,
    season: season || undefined
  });

  const clearFilters = () => {
    setCategory("");
    setStyle("");
    setSeason("");
  };

  const hasFilters = category || style || season;

  return (
    <div className="container max-w-6xl mx-auto py-8 px-4 space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-serif font-medium tracking-tight">Wardrobe</h1>
          <p className="text-muted-foreground mt-1">Browse and manage your collection.</p>
        </div>
        <Button asChild className="rounded-full shadow-sm" data-testid="button-add-item">
          <Link href="/wardrobe/upload">
            <Plus className="mr-2 h-4 w-4" />
            Add Item
          </Link>
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search your wardrobe..." 
            className="pl-9 bg-card border-border/50"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            data-testid="input-search-wardrobe"
          />
        </div>
        
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" className="w-full md:w-auto bg-card border-border/50" data-testid="button-filters">
              <SlidersHorizontal className="mr-2 h-4 w-4" />
              Filters
              {hasFilters && <Badge variant="secondary" className="ml-2 px-1 py-0 h-5 min-w-5 flex items-center justify-center rounded-full">!</Badge>}
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Filter Wardrobe</SheetTitle>
              <SheetDescription>
                Narrow down your clothing collection.
              </SheetDescription>
            </SheetHeader>
            <div className="py-6 space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Category</label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">All Categories</SelectItem>
                    <SelectItem value="pant">Pants</SelectItem>
                    <SelectItem value="shirt">Shirts</SelectItem>
                    <SelectItem value="t-shirt">T-Shirts</SelectItem>
                    <SelectItem value="top wear">Top Wear</SelectItem>
                    <SelectItem value="jeans">Jeans</SelectItem>
                    <SelectItem value="cargo">Cargos</SelectItem>
                    <SelectItem value="hoodie">Hoodies</SelectItem>
                    <SelectItem value="jacket">Jackets</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Style</label>
                <Select value={style} onValueChange={setStyle}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Styles" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">All Styles</SelectItem>
                    <SelectItem value="casual">Casual</SelectItem>
                    <SelectItem value="formal">Formal</SelectItem>
                    <SelectItem value="streetwear">Streetwear</SelectItem>
                    <SelectItem value="party">Party</SelectItem>
                    <SelectItem value="traditional">Traditional</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Season</label>
                <Select value={season} onValueChange={setSeason}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Seasons" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">All Seasons</SelectItem>
                    <SelectItem value="summer">Summer</SelectItem>
                    <SelectItem value="winter">Winter</SelectItem>
                    <SelectItem value="all-season">All Season</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {hasFilters && (
                <Button variant="outline" className="w-full" onClick={clearFilters}>
                  Clear Filters
                </Button>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(i => <Skeleton key={i} className="aspect-[3/4] rounded-xl" />)}
        </div>
      ) : items && items.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
          {items.map((item, i) => (
            <Link key={item.id} href={`/wardrobe/${item.id}`}>
              <div 
                className="group relative aspect-[3/4] rounded-xl overflow-hidden bg-muted border border-border/50 cursor-pointer animate-in fade-in slide-in-from-bottom-4"
                style={{ animationDelay: `${i * 50}ms`, animationFillMode: 'both' }}
                data-testid={`wardrobe-item-${item.id}`}
              >
                {item.imageUrl ? (
                  <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground p-4">
                    <Shirt className="h-10 w-10 mb-2 opacity-20" />
                    <span className="text-sm font-medium text-center line-clamp-2">{item.name}</span>
                  </div>
                )}
                {!item.isAvailable && (
                  <div className="absolute top-2 right-2">
                    <Badge variant="destructive" className="bg-destructive/90 hover:bg-destructive shadow-sm">In Laundry</Badge>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300">
                  <p className="text-white font-medium text-sm truncate">{item.name}</p>
                  <p className="text-white/70 text-xs capitalize">{item.category} • {item.style}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-24 bg-card border border-border/50 rounded-xl border-dashed">
          <Shirt className="mx-auto h-12 w-12 text-muted-foreground/30 mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-1">No items found</h3>
          <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
            {hasFilters || search ? "Try adjusting your filters or search query." : "Start adding your clothes to build your digital wardrobe."}
          </p>
          {hasFilters || search ? (
            <Button onClick={() => { clearFilters(); setSearch(""); }} variant="outline">Clear all filters</Button>
          ) : (
            <Button asChild>
              <Link href="/wardrobe/upload">Add your first item</Link>
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
