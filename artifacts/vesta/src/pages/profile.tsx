import { useUser } from "@clerk/react";
import { useGetDashboardSummary } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function Profile() {
  const { user, isLoaded } = useUser();
  const { data: stats, isLoading: isLoadingStats } = useGetDashboardSummary();

  if (!isLoaded) {
    return (
      <div className="container max-w-4xl mx-auto py-8 px-4 space-y-8">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-40 rounded-xl" />
        <div className="grid md:grid-cols-2 gap-6">
          <Skeleton className="h-64 rounded-xl" />
          <Skeleton className="h-64 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4 space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-serif font-medium tracking-tight">Profile</h1>
        <p className="text-muted-foreground mt-1">Manage your account and view your wardrobe insights.</p>
      </div>

      <Card className="border-border/50 shadow-sm bg-card/50 backdrop-blur-sm overflow-hidden">
        <CardContent className="p-8 sm:p-10">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <Avatar className="h-24 w-24 border-4 border-background shadow-sm">
              <AvatarImage src={user?.imageUrl} alt={user?.fullName || "User"} />
              <AvatarFallback className="text-2xl">{user?.firstName?.charAt(0) || "U"}</AvatarFallback>
            </Avatar>
            <div className="text-center sm:text-left space-y-2">
              <h2 className="text-2xl font-serif font-medium">{user?.fullName || "Vesta User"}</h2>
              <p className="text-muted-foreground">{user?.primaryEmailAddress?.emailAddress}</p>
              <div className="inline-block px-3 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full mt-2">
                Member since {user?.createdAt ? new Date(user.createdAt).getFullYear() : "2024"}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-6">
        <h2 className="text-xl font-serif font-medium">Wardrobe Insights</h2>
        
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="border-border/50 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Distribution by Category</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingStats ? (
                <div className="space-y-4">
                  {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-4 w-full" />)}
                </div>
              ) : stats && Object.keys(stats.byCategory).length > 0 ? (
                <div className="space-y-4">
                  {Object.entries(stats.byCategory)
                    .sort(([, a], [, b]) => b - a)
                    .map(([cat, count]) => {
                      const percentage = Math.round((count / stats.totalItems) * 100);
                      return (
                        <div key={cat} className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span className="capitalize font-medium">{cat}</span>
                            <span className="text-muted-foreground">{count} ({percentage}%)</span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2">
                            <div className="bg-primary h-2 rounded-full" style={{ width: `${percentage}%` }}></div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-6">Not enough data to show insights yet.</p>
              )}
            </CardContent>
          </Card>

          <Card className="border-border/50 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Distribution by Style</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingStats ? (
                <div className="space-y-4">
                  {[1, 2, 3].map(i => <Skeleton key={i} className="h-4 w-full" />)}
                </div>
              ) : stats && Object.keys(stats.byStyle).length > 0 ? (
                <div className="space-y-4">
                  {Object.entries(stats.byStyle)
                    .sort(([, a], [, b]) => b - a)
                    .map(([style, count]) => {
                      const percentage = Math.round((count / stats.totalItems) * 100);
                      return (
                        <div key={style} className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span className="capitalize font-medium">{style}</span>
                            <span className="text-muted-foreground">{count} ({percentage}%)</span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2">
                            <div className="bg-primary h-2 rounded-full opacity-80" style={{ width: `${percentage}%` }}></div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-6">Not enough data to show insights yet.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
