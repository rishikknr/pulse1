import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings as SettingsIcon, Bell, Shield, Database } from "lucide-react";

export default function Settings() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-2">
          Configure your monitoring service
        </p>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general" className="flex items-center gap-2">
            <SettingsIcon className="h-4 w-4" />
            General
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Security
          </TabsTrigger>
          <TabsTrigger value="data" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            Data
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>
                Configure basic monitoring preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="service-name">Service Name</Label>
                <Input
                  id="service-name"
                  placeholder="Pulse Monitoring"
                  defaultValue="Pulse Monitoring"
                />
              </div>
              <div>
                <Label htmlFor="default-interval">Default Check Interval (seconds)</Label>
                <Input
                  id="default-interval"
                  type="number"
                  defaultValue="300"
                />
              </div>
              <div>
                <Label htmlFor="default-timeout">Default Timeout (seconds)</Label>
                <Input
                  id="default-timeout"
                  type="number"
                  defaultValue="10"
                />
              </div>
              <Button>Save Changes</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>
                Configure how you receive alerts
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">Email Notifications</p>
                    <p className="text-sm text-muted-foreground">
                      Receive alerts via email
                    </p>
                  </div>
                  <Button variant="outline">Configure</Button>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">Slack Integration</p>
                    <p className="text-sm text-muted-foreground">
                      Send alerts to Slack
                    </p>
                  </div>
                  <Button variant="outline">Configure</Button>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">Discord Integration</p>
                    <p className="text-sm text-muted-foreground">
                      Send alerts to Discord
                    </p>
                  </div>
                  <Button variant="outline">Configure</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>
                Manage API keys and access control
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="api-key">API Key</Label>
                <div className="flex gap-2">
                  <Input
                    id="api-key"
                    type="password"
                    value="••••••••••••••••"
                    readOnly
                  />
                  <Button variant="outline">Regenerate</Button>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  Use this API key to integrate with external services
                </p>
              </div>
              <Button>Save Changes</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="data" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Data Management</CardTitle>
              <CardDescription>
                Manage your monitoring data
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="p-3 border rounded-lg">
                  <p className="font-medium">Data Retention</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Keep monitoring data for 30 days by default
                  </p>
                  <Button variant="outline" className="mt-3">
                    Configure
                  </Button>
                </div>
                <div className="p-3 border rounded-lg">
                  <p className="font-medium">Export Data</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Export all monitoring data as CSV
                  </p>
                  <Button variant="outline" className="mt-3">
                    Export
                  </Button>
                </div>
                <div className="p-3 border rounded-lg bg-destructive/5">
                  <p className="font-medium text-destructive">Delete All Data</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Permanently delete all monitoring data
                  </p>
                  <Button variant="destructive" className="mt-3">
                    Delete
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
