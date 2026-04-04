import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCreateClothingItem, getListClothingItemsQueryKey, getGetDashboardSummaryQueryKey, getGetRecentItemsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowLeft, Upload, Loader2, Image as ImageIcon } from "lucide-react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  category: z.string().min(1, "Please select a category."),
  color: z.string().min(1, "Color is required."),
  pattern: z.string().min(1, "Please select a pattern."),
  fit: z.string().min(1, "Please select a fit."),
  style: z.string().min(1, "Please select a style."),
  season: z.string().min(1, "Please select a season."),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function UploadItem() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  
  const createItem = useCreateClothingItem();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      category: "",
      color: "",
      pattern: "",
      fit: "",
      style: "",
      season: "",
      notes: "",
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = (data: FormValues) => {
    createItem.mutate(
      { data: { ...data, imageUrl: imageUrl || undefined } },
      {
        onSuccess: () => {
          toast({
            title: "Item added",
            description: "Your clothing item has been added to your wardrobe.",
          });
          queryClient.invalidateQueries({ queryKey: getListClothingItemsQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetDashboardSummaryQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetRecentItemsQueryKey() });
          setLocation("/wardrobe");
        },
        onError: () => {
          toast({
            title: "Error",
            description: "Failed to add item. Please try again.",
            variant: "destructive",
          });
        }
      }
    );
  };

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4 space-y-8 animate-in fade-in duration-500">
      <div>
        <Button asChild variant="ghost" className="mb-4 -ml-4 text-muted-foreground" data-testid="button-back-wardrobe">
          <Link href="/wardrobe">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Wardrobe
          </Link>
        </Button>
        <h1 className="text-3xl font-serif font-medium tracking-tight">Add New Item</h1>
        <p className="text-muted-foreground mt-1">Expand your digital closet.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1 space-y-4">
          <Card className="border-border/50 shadow-sm overflow-hidden bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg">Item Photo</CardTitle>
              <CardDescription>Upload a clear photo of your item.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center">
              <label 
                htmlFor="image-upload" 
                className="w-full aspect-[3/4] rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center cursor-pointer hover:bg-accent/20 transition-colors relative overflow-hidden bg-muted/30"
              >
                {imageUrl ? (
                  <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="flex flex-col items-center p-6 text-center text-muted-foreground">
                    <ImageIcon className="h-10 w-10 mb-4 opacity-50" />
                    <span className="text-sm font-medium">Click to upload</span>
                    <span className="text-xs mt-1">JPEG, PNG, WebP</span>
                  </div>
                )}
                <input 
                  id="image-upload" 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={handleImageChange}
                  data-testid="input-image-upload"
                />
              </label>
              {imageUrl && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="mt-4 text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={() => setImageUrl(null)}
                >
                  Remove Image
                </Button>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <Card className="border-border/50 shadow-sm bg-card/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-lg">Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Item Name</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Navy Blue Chinos, Vintage Denim Jacket" {...field} data-testid="input-name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-category">
                                <SelectValue placeholder="Select category" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="pant">Pant</SelectItem>
                              <SelectItem value="shirt">Shirt</SelectItem>
                              <SelectItem value="t-shirt">T-Shirt</SelectItem>
                              <SelectItem value="top wear">Top Wear</SelectItem>
                              <SelectItem value="jeans">Jeans</SelectItem>
                              <SelectItem value="cargo">Cargo</SelectItem>
                              <SelectItem value="hoodie">Hoodie</SelectItem>
                              <SelectItem value="jacket">Jacket</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="color"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Color</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. Navy, Black, Olive" {...field} data-testid="input-color" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="pattern"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Pattern</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-pattern">
                                <SelectValue placeholder="Select pattern" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="plain">Plain</SelectItem>
                              <SelectItem value="striped">Striped</SelectItem>
                              <SelectItem value="checked">Checked</SelectItem>
                              <SelectItem value="printed">Printed</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="fit"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Fit</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-fit">
                                <SelectValue placeholder="Select fit" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="slim">Slim</SelectItem>
                              <SelectItem value="regular">Regular</SelectItem>
                              <SelectItem value="oversized">Oversized</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="style"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Style</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-style">
                                <SelectValue placeholder="Select style" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="casual">Casual</SelectItem>
                              <SelectItem value="formal">Formal</SelectItem>
                              <SelectItem value="streetwear">Streetwear</SelectItem>
                              <SelectItem value="party">Party</SelectItem>
                              <SelectItem value="traditional">Traditional</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="season"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Season</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-season">
                                <SelectValue placeholder="Select season" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="summer">Summer</SelectItem>
                              <SelectItem value="winter">Winter</SelectItem>
                              <SelectItem value="all-season">All Season</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Notes (Optional)</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Add any details like fabric type, brand, size, or when you bought it..." 
                            className="resize-none h-24"
                            {...field} 
                            data-testid="input-notes"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="pt-4 flex justify-end">
                    <Button 
                      type="submit" 
                      className="w-full sm:w-auto min-w-32 rounded-full" 
                      disabled={createItem.isPending}
                      data-testid="button-submit-item"
                    >
                      {createItem.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <Upload className="mr-2 h-4 w-4" />
                          Save Item
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}
