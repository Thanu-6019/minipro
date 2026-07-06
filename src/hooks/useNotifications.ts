import { useState, useEffect } from 'react';
import { Platform } from 'react-native';
import { notificationService } from '../services/notifications/notification.service';

const IS_NATIVE = Platform.OS !== 'web';

export const useNotifications = () => {
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [loading, setLoading] = useState(!IS_NATIVE ? false : true);

  const checkPermission = async () => {
    if (!IS_NATIVE) return;
    const Notifications = require('expo-notifications');
    const { status } = await Notifications.getPermissionsAsync();
    setPermissionGranted(status === 'granted');
    setLoading(false);
  };

  useEffect(() => {
    if (!IS_NATIVE) return;
    const Notifications = require('expo-notifications');
    Notifications.getPermissionsAsync().then(({ status }: { status: string }) => {
      setPermissionGranted(status === 'granted');
      setLoading(false);
    });
  }, []);

  const requestPermission = async () => {
    setLoading(true);
    const granted = await notificationService.requestPermissions();
    setPermissionGranted(granted);
    setLoading(false);
    return granted;
  };

  return { permissionGranted, loading, requestPermission, checkPermission };
};
