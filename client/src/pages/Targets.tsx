import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Edit2, Trash2, CheckCircle2, AlertCircle } from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function Targets() {
  const { data: targets, isLoading, refetch } = trpc.targets.list.useQuery();
  const { data: statuses } = trpc.stats.getAllStatus.useQuery();
  const createMutation = trpc.targets.create.useMutation({
    onSuccess: () => refetch(),
  });
  const deleteMutation = trpc.targets.delete.useMutation({
    onSuccess: () => refetch(),
  });

  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    url: "",
    description: "",
    checkInterval: 300,
    timeout: 10,
    expectedStatusCode: 200,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createMutation.mutateAsync(formData);
      setFormData({
        name: "",
        url: "",
        description: "",
        checkInterval: 300,
        timeout: 10,
        expectedStatusCode: 200,
      });
      setIsOpen(false);
    } catch (error) {
      console.error("Failed to create target:", error);
    }
  };

  const getStatusForTarget = (targetId: number) => {
    return statuses?.find((s) => s?.targetId === targetId);
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Monitoring Targets</h1>
          <Skeleton className="h-10 w-32" />
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Monitoring Targets</h1>
          <p className="text-muted-foreground mt-2">
            Manage all URLs and services being monitored
          </p>
        </div>

        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Target
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Monitoring Target</DialogTitle>
              <DialogDescription>
                Add a new URL or service to monitor
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Target Name</Label>
                <Input
                  id="name"
                  placeholder="e.g., My API"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <Label htmlFor="url">URL</Label>
                <Input
                  id="url"
                  type="url"
                  placeholder="https://example.com"
                  value={formData.url}
                  onChange={(e) =>
                    setFormData({ ...formData, url: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <Label htmlFor="description">Description (optional)</Label>
                <Input
                  id="description"
                  placeholder="Service description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="interval">Check Interval (seconds)</Label>
                  <Input
                    id="interval"
                    type="number"
                    value={formData.checkInterval}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        checkInterval: parseInt(e.target.value),
                      })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="timeout">Timeout (seconds)</Label>
                  <Input
                    id="timeout"
                    type="number"
                    value={formData.timeout}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        timeout: parseInt(e.target.value),
                      })
                    }
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="statusCode">Expected Status Code</Label>
                <Input
                  id="statusCode"
                  type="number"
                  value={formData.expectedStatusCode}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      expectedStatusCode: parseInt(e.target.value),
                    })
                  }
                />
              </div>
              <Button type="submit" className="w-full">
                Create Target
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {targets && targets.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
          {targets.map((target) => {
            const status = getStatusForTarget(target.id);
            return (
              <Link key={target.id} href={`/targets/${target.id}`}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-lg">{target.name}</h3>
                          <Badge
                            variant={
                              status?.isOnline ? "default" : "destructive"
                            }
                          >
                            {status?.isOnline ? "Online" : "Offline"}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground break-all">
                          {target.url}
                        </p>
                        {target.description && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {target.description}
                          </p>
                        )}
                        <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                          <span>Interval: {target.checkInterval}s</span>
                          <span>Timeout: {target.timeout}s</span>
                          {status?.responseTime && (
                            <span>Response: {status.responseTime}ms</span>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.preventDefault();
                            // Edit functionality
                          }}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.preventDefault();
                            deleteMutation.mutate({ id: target.id });
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground mb-4">No targets configured yet</p>
            <Button onClick={() => setIsOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create First Target
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
