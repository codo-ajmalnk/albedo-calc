
import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from "@/hooks/use-toast";
import { Bell, Check } from "lucide-react";
import { Role } from '@/lib/types';

export type NotificationType = 'info' | 'success' | 'warning' | 'error';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  createdAt: Date;
  targetRoles?: Role[] | 'all'; // Add targeting by role
  sender?: string; // For tracking who sent the notification
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (title: string, message: string, type: NotificationType, targetRoles?: Role[] | 'all', sender?: string) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
  settings: {
    soundEnabled: boolean;
    desktopEnabled: boolean;
    emailEnabled: boolean;
  };
  updateSettings: (settings: Partial<NotificationContextType['settings']>) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [settings, setSettings] = useState({
    soundEnabled: true,
    desktopEnabled: false,
    emailEnabled: true,
  });

  // Load notifications and settings from localStorage on mount
  useEffect(() => {
    const savedNotifications = localStorage.getItem('notifications');
    const savedSettings = localStorage.getItem('notificationSettings');
    
    if (savedNotifications) {
      try {
        const parsedNotifications = JSON.parse(savedNotifications);
        // Convert string dates back to Date objects
        setNotifications(parsedNotifications.map((notification: any) => ({
          ...notification,
          createdAt: new Date(notification.createdAt)
        })));
      } catch (error) {
        console.error('Failed to parse saved notifications', error);
      }
    }
    
    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings));
      } catch (error) {
        console.error('Failed to parse saved settings', error);
      }
    }
  }, []);

  // Save notifications and settings to localStorage when they change
  useEffect(() => {
    localStorage.setItem('notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('notificationSettings', JSON.stringify(settings));
  }, [settings]);

  // Calculate unread count
  const unreadCount = notifications.filter(notification => !notification.read).length;

  // Add a new notification with optional target roles
  const addNotification = (
    title: string, 
    message: string, 
    type: NotificationType = 'info',
    targetRoles?: Role[] | 'all',
    sender?: string
  ) => {
    const newNotification: Notification = {
      id: Date.now().toString(),
      title,
      message,
      type,
      read: false,
      createdAt: new Date(),
      targetRoles,
      sender
    };
    
    setNotifications(prev => [newNotification, ...prev]);
    
    // Show toast notification
    toast({
      title,
      description: message,
      variant: type === 'error' ? 'destructive' : 'default',
    });
    
    // Show browser notification if enabled
    if (settings.desktopEnabled && "Notification" in window) {
      if (Notification.permission === "granted") {
        new Notification(title, { body: message });
      } else if (Notification.permission !== "denied") {
        Notification.requestPermission().then(permission => {
          if (permission === "granted") {
            new Notification(title, { body: message });
          }
        });
      }
    }
    
    // Play sound if enabled
    if (settings.soundEnabled) {
      const audio = new Audio('/notification-sound.mp3');
      audio.play().catch(error => {
        // Browsers may block autoplay
        console.log('Notification sound blocked:', error);
      });
    }
  };

  // Mark a notification as read
  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };

  // Mark all notifications as read
  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
  };

  // Clear all notifications
  const clearNotifications = () => {
    setNotifications([]);
  };

  // Update notification settings
  const updateSettings = (newSettings: Partial<NotificationContextType['settings']>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  // Context value
  const value = {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    clearNotifications,
    settings,
    updateSettings,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
