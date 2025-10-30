import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, CheckCircle2, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Incidents() {
  const { data: targets, isLoading: targetsLoading } = trpc.targets.list.useQuery();

  if (targetsLoading) {
    return (
      <div className="p-6 space-y-4">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Incidents</h1>
        </div>
        <div className="grid grid-cols-1 gap-4">
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

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Incidents</h1>
        <p className="text-muted-foreground mt-2">
          Track all downtime events and service disruptions
        </p>
      </div>

      {targets && targets.length > 0 ? (
        <div className="space-y-6">
          {targets.map((target) => (
            <TargetIncidents key={target.id} targetId={target.id} targetName={target.name} />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground">No targets configured yet</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function TargetIncidents({ targetId, targetName }: { targetId: number; targetName: string }) {
  const { data: incidents, isLoading } = trpc.incidents.getByTargetId.useQuery({
    targetId,
    limit: 10,
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-4 w-1/2" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-1/3" />
        </CardContent>
      </Card>
    );
  }

  if (!incidents || incidents.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            {targetName}
          </CardTitle>
          <CardDescription>No incidents recorded</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-orange-600" />
          {targetName}
        </CardTitle>
        <CardDescription>{incidents.length} incident(s) recorded</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {incidents.map((incident) => (
            <div
              key={incident.id}
              className="flex items-start justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Badge
                    variant={
                      incident.status === "ongoing" ? "destructive" : "secondary"
                    }
                  >
                    {incident.status === "ongoing" ? "Ongoing" : "Resolved"}
                  </Badge>
                  <span className="text-sm font-medium">
                    {new Date(incident.startTime).toLocaleString()}
                  </span>
                </div>
                {incident.reason && (
                  <p className="text-sm text-muted-foreground">{incident.reason}</p>
                )}
                {incident.endTime && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Resolved: {new Date(incident.endTime).toLocaleString()}
                  </p>
                )}
              </div>

              {incident.status === "ongoing" && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    // Resolve incident functionality
                  }}
                >
                  Resolve
                </Button>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
