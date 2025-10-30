import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle2, AlertCircle, Clock } from "lucide-react";
import { Link } from "wouter";

export default function Home() {
  const { data: statuses, isLoading } = trpc.stats.getAllStatus.useQuery();

  if (isLoading) {
    return (
      <div className="p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-4 w-3/4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const onlineCount = statuses?.filter((s) => s?.isOnline).length || 0;
  const offlineCount = (statuses?.length || 0) - onlineCount;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Monitoring Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Real-time status of all monitored services
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Services
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statuses?.length || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-green-600">
              Online
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{onlineCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-red-600">
              Offline
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{offlineCount}</div>
          </CardContent>
        </Card>
      </div>

      {/* Services List */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Service Status</h2>
        {statuses && statuses.length > 0 ? (
          <div className="grid grid-cols-1 gap-4">
            {statuses.map((status) => (
              <Link key={status?.targetId} href={`/targets/${status?.targetId}`}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        <div>
                          {status?.isOnline ? (
                            <CheckCircle2 className="h-6 w-6 text-green-600" />
                          ) : (
                            <AlertCircle className="h-6 w-6 text-red-600" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">Service {status?.targetId}</p>
                          <p className="text-sm text-muted-foreground">
                            {status?.statusCode ? `Status: ${status.statusCode}` : "No recent checks"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        {status?.responseTime && (
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            <span>{status.responseTime}ms</span>
                          </div>
                        )}
                        <Badge
                          variant={status?.isOnline ? "default" : "destructive"}
                        >
                          {status?.isOnline ? "Online" : "Offline"}
                        </Badge>
                      </div>
                    </div>

                    {status?.lastCheckTime && (
                      <p className="text-xs text-muted-foreground mt-3">
                        Last checked: {new Date(status.lastCheckTime).toLocaleString()}
                      </p>
                    )}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-muted-foreground">No services configured yet</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
