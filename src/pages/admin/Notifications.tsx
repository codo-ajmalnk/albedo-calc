
import React from 'react';
import DashboardLayout from "@/components/DashboardLayout";
import { AdminNotificationCreator } from "@/components/AdminNotificationCreator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NotificationPanel } from "@/components/NotificationPanel";
import { Card } from "@/components/ui/card";

export default function AdminNotificationsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">System Notifications</h2>
          <p className="text-muted-foreground mt-2">
            Create, send, and manage notifications for users of the system
          </p>
        </div>
        
        <Tabs defaultValue="create" className="space-y-4">
          <TabsList>
            <TabsTrigger value="create">Create Notification</TabsTrigger>
            <TabsTrigger value="history">Notification History</TabsTrigger>
          </TabsList>
          
          <TabsContent value="create" className="space-y-4">
            <AdminNotificationCreator />
          </TabsContent>
          
          <TabsContent value="history" className="space-y-4">
            <Card className="p-6">
              <h3 className="text-lg font-medium mb-4">Recent System Notifications</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                This is a history of all notifications that have been sent out from the system.
              </p>
              
              {/* In a real implementation, you would have a more advanced component here
                  showing notification history with filtering options */}
              <div className="border rounded-lg overflow-hidden">
                <div className="p-8 text-center">
                  <p className="text-muted-foreground">
                    A notification history table would appear here in a real implementation.
                    For now, you can view your personal notifications in the notification panel.
                  </p>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
