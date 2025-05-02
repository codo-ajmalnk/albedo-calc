import React from 'react';
import DashboardLayout from "@/components/DashboardLayout";
import { NotificationSettings as NotificationSettingsComponent } from "@/components/NotificationSettings";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bell, BellOff, BellRing, Settings } from "lucide-react";
import { useNotifications } from '@/context/NotificationContext';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AdminNotificationCreator } from "@/components/AdminNotificationCreator";
import { Card, CardContent } from '@/components/ui/card';

export default function NotificationSettingsPage() {
  const { addNotification } = useNotifications();

  const handleTestNotifications = () => {
    // Create sample notifications of each type
    addNotification(
      'Information Notice',
      'This is an informational notification for demonstration purposes.',
      'info'
    );

    setTimeout(() => {
      addNotification(
        'Operation Successful',
        'The requested action was completed successfully.',
        'success'
      );
    }, 1000);

    setTimeout(() => {
      addNotification(
        'Warning Alert',
        'This is a warning notification that requires your attention.',
        'warning'
      );
    }, 2000);

    setTimeout(() => {
      addNotification(
        'Error Detected',
        'An error occurred while processing your request.',
        'error'
      );
    }, 3000);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Notification Configuration</h2>
          <p className="text-muted-foreground mt-2">
            Manage and configure system notification settings.
          </p>
        </div>

        <Tabs defaultValue="settings" className="space-y-4">
          <TabsList>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              General Settings
            </TabsTrigger>
            <TabsTrigger value="create" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Create Notification
            </TabsTrigger>
          </TabsList>

          <TabsContent value="settings" className="space-y-4">
            <NotificationSettingsComponent />
          </TabsContent>

          <TabsContent value="create" className="space-y-4">
            <AdminNotificationCreator />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
