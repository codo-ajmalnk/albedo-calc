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
import { users } from '@/lib/mock-data';
import Select from "react-select";

const notificationSchema = z.object({
  title: z.string().min(3, { message: "Title must be at least 3 characters." }),
  message: z.string().min(10, { message: "Message must be at least 10 characters." }),
  targetType: z.enum(['all', 'roles', 'custom']).default('all'),
  roles: z.array(z.string()).optional(),
  customEmails: z.string().optional(),
});

type NotificationFormValues = z.infer<typeof notificationSchema>;

type SentNotification = {
  title: string;
  message: string;
  date: string;
  recipients: string;
};

export function AdminNotificationCreator() {
  const { addNotification } = useNotifications();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedRoles, setSelectedRoles] = useState<Role[]>([]);
  const [selectedCustomUsers, setSelectedCustomUsers] = useState<string[]>([]);
  const [notifications, setNotifications] = useState<SentNotification[]>([]);
  const [page, setPage] = useState(1);
  const pageSize = 5;
  const paginated = notifications.slice((page-1)*pageSize, page*pageSize);
  
  const form = useForm<NotificationFormValues>({
    resolver: zodResolver(notificationSchema),
    defaultValues: {
      title: '',
      message: '',
      targetType: 'all',
    },
  });
  
  const targetType = form.watch('targetType');
  
  const onSubmit = (data: NotificationFormValues) => {
    setIsSubmitting(true);
    try {
      let targetRoles: Role[] | 'all' = 'all';
      if (data.targetType === 'roles') {
        targetRoles = selectedRoles;
      } else if (data.targetType === 'all') {
        targetRoles = 'all';
      } else {
        targetRoles = selectedCustomUsers.map(id => users.find(u => u.id === id)?.role as Role);
      }
      addNotification(
        data.title,
        data.message,
        'info' as NotificationType,
        targetRoles,
        'admin'
      );
      setNotifications(prev => [
        {
          title: data.title,
          message: data.message,
          date: new Date().toLocaleString(),
          recipients: Array.isArray(targetRoles) ? targetRoles.map(role => role).join(', ') : 'All Users',
        },
        ...prev
      ]);
      form.reset({
        title: '',
        message: '',
        targetType: 'all',
      });
      setSelectedRoles([]);
      setSelectedCustomUsers([]);
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

  const allUsers = users;
  const customUserOptions = allUsers.filter(
    u => u.role === 'mentor' || u.role === 'coordinator'
  );

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
              <div className="border rounded-md p-4 space-y-2">
                <Label>Select Users</Label>
                <Select
                  isMulti
                  options={customUserOptions.map(user => ({
                    value: user.id,
                    label: `${user.name} (${user.role})`
                  }))}
                  value={selectedCustomUsers.map(id => {
                    const user = customUserOptions.find(u => u.id === id);
                    return user ? { value: user.id, label: `${user.name} (${user.role})` } : null;
                  }).filter(Boolean)}
                  onChange={(selected) => {
                    setSelectedCustomUsers(selected.map(option => option.value));
                  }}
                  className="basic-multi-select"
                  classNamePrefix="select"
                />
              </div>
            )}
            
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Sending...' : 'Send Notification'}
            </Button>
          </form>
        </Form>
        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-4">Sent Notifications</h3>
          <ul className="space-y-3">
            {paginated.map((n, i) => (
              <li key={i} className="flex items-start gap-3 p-4 rounded-lg border bg-muted/50 shadow-sm">
                <div className="mt-1">
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
                  </span>
                </div>
                <div className="flex-1 min-w-0">                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-base">{n.title}</span>
                  </div>
                  <div className="text-sm mt-1 text-muted-foreground break-words">{n.message}</div>
                  <div className="text-xs text-muted-foreground mt-2">
                    <span className="font-medium">Recipients:</span>
                    <ul className="list-disc list-inside mt-1 space-y-1">
                      {n.recipients === 'All Users' ? (
                        <li className="text-blue-700 hover:text-blue-800 transition-colors duration-200">All Users</li>
                      ) : (
                        n.recipients.split(', ').map((role, idx) => (
                          <li key={idx} className="text-gray-700 hover:text-gray-800 transition-colors duration-200">{role}</li>
                        ))
                      )}
                    </ul>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">{n.date}</div>
                </div>
              </li>
            ))}
          </ul>
          <div className="flex gap-2 mt-4 justify-end">
            <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => p-1)}>Prev</Button>
            <Button variant="outline" size="sm" disabled={page*pageSize >= notifications.length} onClick={() => setPage(p => p+1)}>Next</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
