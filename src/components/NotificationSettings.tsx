import React from 'react';
import { useNotifications } from '@/context/NotificationContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Info } from 'lucide-react';
import { AdminNotificationCreator } from '@/components/AdminNotificationCreator';

export function NotificationSettings() {
  const { settings, updateSettings, addNotification } = useNotifications();

  const handleToggleSetting = (setting: keyof typeof settings) => {
    updateSettings({ [setting]: !settings[setting] });
  };

  const handleTestNotification = () => {
    addNotification(
      'Test Notification',
      'This is a test notification to preview how notifications will appear.',
      'info'
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notification Settings</CardTitle>
        <CardDescription>
          Configure how you want to receive notifications in the system.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert variant="default" className="bg-blue-50 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border-blue-200 dark:border-blue-900">
          <Info className="h-4 w-4" />
          <AlertTitle>Information</AlertTitle>
          <AlertDescription>
            These settings control how notifications appear throughout the system for your account.
            You can test how they appear using the button below.
          </AlertDescription>
        </Alert>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="sound-toggle" className="text-base font-medium">
                Notification Sounds
              </Label>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Play sounds when new notifications arrive
              </p>
            </div>
            <Switch 
              id="sound-toggle" 
              checked={settings.soundEnabled}
              onCheckedChange={() => handleToggleSetting('soundEnabled')}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="desktop-toggle" className="text-base font-medium">
                Desktop Notifications
              </Label>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Show browser notifications when new alerts arrive
              </p>
            </div>
            <Switch 
              id="desktop-toggle" 
              checked={settings.desktopEnabled}
              onCheckedChange={() => handleToggleSetting('desktopEnabled')}
            />
          </div>
        </div>

        <div className="pt-4 border-t">
          <Button onClick={handleTestNotification}>
            Send Test Notification
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
