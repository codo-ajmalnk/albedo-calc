
import React, { useState } from 'react';
import { useNotifications } from '@/context/NotificationContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Role } from '@/lib/types';
import { Form, FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { NotificationType } from '@/context/NotificationContext';

const notificationSchema = z.object({
  title: z.string().min(3, { message: "Title must be at least 3 characters." }),
  message: z.string().min(10, { message: "Message must be at least 10 characters." }),
  notificationType: z.enum(['info', 'success', 'warning', 'error']).default('info'),
  targetType: z.enum(['all', 'roles', 'custom']).default('all'),
  roles: z.array(z.string()).optional(),
  customEmails: z.string().optional(),
});

type NotificationFormValues = z.infer<typeof notificationSchema>;

export function AdminNotificationCreator() {
  const { addNotification } = useNotifications();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedRoles, setSelectedRoles] = useState<Role[]>([]);
  
  const form = useForm<NotificationFormValues>({
    resolver: zodResolver(notificationSchema),
    defaultValues: {
      title: '',
      message: '',
      notificationType: 'info',
      targetType: 'all',
    },
  });
  
  const targetType = form.watch('targetType');
  
  const onSubmit = (data: NotificationFormValues) => {
    setIsSubmitting(true);
    
    try {
      // Determine the target roles based on the selection
      let targetRoles: Role[] | 'all' = 'all';
      
      if (data.targetType === 'roles') {
        targetRoles = selectedRoles;
      } else if (data.targetType === 'all') {
        targetRoles = 'all';
      } else {
        // Custom emails would be handled differently in a real implementation
        // For now, we'll just treat it as 'all'
        targetRoles = 'all';
      }
      
      // Add the notification
      addNotification(
        data.title,
        data.message,
        data.notificationType as NotificationType,
        targetRoles,
        'admin' // Hardcoded for now, would come from auth context in real impl
      );
      
      // Reset the form
      form.reset({
        title: '',
        message: '',
        notificationType: 'info',
        targetType: 'all',
      });
      setSelectedRoles([]);
      
      // Show success message
      addNotification(
        'Notification Sent',
        'Your notification has been successfully sent to the selected recipients.',
        'success'
      );
      
    } catch (error) {
      addNotification(
        'Error',
        'Failed to send notification. Please try again.',
        'error'
      );
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleRoleToggle = (role: Role) => {
    setSelectedRoles(prev => {
      if (prev.includes(role)) {
        return prev.filter(r => r !== role);
      } else {
        return [...prev, role];
      }
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create System Notification</CardTitle>
        <CardDescription>
          Create and send notifications to users in the system
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notification Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter notification title..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Message</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Enter notification message..." 
                      className="min-h-[100px]" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="notificationType"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Notification Type</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-wrap gap-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="info" id="info" />
                        <Label htmlFor="info">Information</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="success" id="success" />
                        <Label htmlFor="success">Success</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="warning" id="warning" />
                        <Label htmlFor="warning">Warning</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="error" id="error" />
                        <Label htmlFor="error">Error</Label>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="targetType"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Recipients</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-wrap gap-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="all" id="all-users" />
                        <Label htmlFor="all-users">All Users</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="roles" id="by-role" />
                        <Label htmlFor="by-role">By Role</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="custom" id="custom-emails" />
                        <Label htmlFor="custom-emails">Custom</Label>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {targetType === 'roles' && (
              <div className="border rounded-md p-4 space-y-2">
                <Label>Select Roles</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="coordinator" 
                      checked={selectedRoles.includes('coordinator')} 
                      onCheckedChange={() => handleRoleToggle('coordinator')}
                    />
                    <Label htmlFor="coordinator">Coordinators</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="mentor" 
                      checked={selectedRoles.includes('mentor')} 
                      onCheckedChange={() => handleRoleToggle('mentor')}
                    />
                    <Label htmlFor="mentor">Mentors</Label>
                  </div>
                </div>
              </div>
            )}
            
            {targetType === 'custom' && (
              <FormField
                control={form.control}
                name="customEmails"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Custom Recipients</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Enter email addresses separated by commas..." 
                        className="min-h-[80px]" 
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      Enter email addresses separated by commas
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            
            <div className="pt-2">
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full sm:w-auto"
              >
                Send Notification
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
