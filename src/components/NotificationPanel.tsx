
import React, { useState } from 'react';
import { useNotifications } from '@/context/NotificationContext';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Bell, Check, Info, AlertTriangle, AlertCircle, X } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

export function NotificationPanel() {
  const [open, setOpen] = useState(false);
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead, 
    clearNotifications 
  } = useNotifications();
  
  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen && unreadCount > 0) {
      markAllAsRead();
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'info':
        return <Info className="h-4 w-4 text-palette-info" />;
      case 'success':
        return <Check className="h-4 w-4 text-palette-accent" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-palette-warning" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-palette-danger" />;
      default:
        return <Info className="h-4 w-4 text-palette-info" />;
    }
  };

  const unreadNotifications = notifications.filter(notification => !notification.read);
  const readNotifications = notifications.filter(notification => notification.read);

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          aria-label="Open notifications"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 px-1 min-w-[18px] h-[18px] flex items-center justify-center text-xs"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[380px] p-0" align="end">
        <div className="flex items-center justify-between px-4 py-2 border-b">
          <h3 className="font-medium">Notifications</h3>
          <div className="flex gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-xs h-8"
              onClick={markAllAsRead}
              disabled={unreadCount === 0}
            >
              Mark all as read
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-xs h-8"
              onClick={clearNotifications}
              disabled={notifications.length === 0}
            >
              Clear all
            </Button>
          </div>
        </div>
        
        <Tabs defaultValue="unread">
          <TabsList className="grid grid-cols-2 mx-4 my-2">
            <TabsTrigger value="unread" className="relative">
              Unread
              {unreadCount > 0 && (
                <Badge variant="secondary" className="ml-1">{unreadCount}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="all">All</TabsTrigger>
          </TabsList>
          
          <TabsContent value="unread" className="mt-0">
            <ScrollArea className="h-[300px]">
              {unreadNotifications.length > 0 ? (
                <div className="flex flex-col">
                  {unreadNotifications.map(notification => (
                    <div 
                      key={notification.id}
                      className="flex items-start gap-3 px-4 py-3 border-b hover:bg-gray-50 dark:hover:bg-gray-900"
                    >
                      <div className="mt-1">
                        {getIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <p className="font-medium text-sm truncate pr-2">
                            {notification.title}
                          </p>
                          <span className="text-xs text-gray-500 whitespace-nowrap">
                            {formatDistanceToNow(notification.createdAt, { addSuffix: true })}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                          {notification.message}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => markAsRead(notification.id)}
                      >
                        <X className="h-3 w-3" />
                        <span className="sr-only">Mark as read</span>
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full py-8 text-center">
                  <Bell className="h-10 w-10 text-gray-300 mb-2" />
                  <p className="text-gray-500 font-medium">No unread notifications</p>
                </div>
              )}
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="all" className="mt-0">
            <ScrollArea className="h-[300px]">
              {notifications.length > 0 ? (
                <div className="flex flex-col">
                  {notifications.map(notification => (
                    <div 
                      key={notification.id}
                      className={cn(
                        "flex items-start gap-3 px-4 py-3 border-b hover:bg-gray-50 dark:hover:bg-gray-900",
                        notification.read ? "opacity-70" : ""
                      )}
                    >
                      <div className="mt-1">
                        {getIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <p className={cn(
                            "font-medium text-sm truncate pr-2",
                            notification.read ? "font-normal" : ""
                          )}>
                            {notification.title}
                          </p>
                          <span className="text-xs text-gray-500 whitespace-nowrap">
                            {formatDistanceToNow(notification.createdAt, { addSuffix: true })}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                          {notification.message}
                        </p>
                      </div>
                      {!notification.read && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => markAsRead(notification.id)}
                        >
                          <X className="h-3 w-3" />
                          <span className="sr-only">Mark as read</span>
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full py-8 text-center">
                  <Bell className="h-10 w-10 text-gray-300 mb-2" />
                  <p className="text-gray-500 font-medium">No notifications</p>
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </PopoverContent>
    </Popover>
  );
}
