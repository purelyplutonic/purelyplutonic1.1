import { PushNotifications } from '@capacitor/push-notifications';
import { Capacitor } from '@capacitor/core';
import { supabase } from '../lib/supabase';

export class PushNotificationService {
  static async initialize(userId: string) {
    if (!Capacitor.isNativePlatform()) {
      console.log('Push notifications only available on native platforms');
      return;
    }

    try {
      let permStatus = await PushNotifications.checkPermissions();

      if (permStatus.receive === 'prompt') {
        permStatus = await PushNotifications.requestPermissions();
      }

      if (permStatus.receive !== 'granted') {
        console.warn('Push notification permission denied');
        return;
      }

      await PushNotifications.register();

      PushNotifications.addListener('registration', async (token) => {
        console.log('Push registration success, token:', token.value);
        await this.saveDeviceToken(userId, token.value);
      });

      PushNotifications.addListener('registrationError', (error) => {
        console.error('Error on registration:', error);
      });

      PushNotifications.addListener('pushNotificationReceived', (notification) => {
        console.log('Push notification received:', notification);
      });

      PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
        console.log('Push notification action performed:', notification);
      });

    } catch (error) {
      console.error('Error initializing push notifications:', error);
    }
  }

  static async saveDeviceToken(userId: string, token: string) {
    try {
      const platform = Capacitor.getPlatform();

      const { error } = await supabase
        .from('device_tokens')
        .upsert({
          user_id: userId,
          token,
          platform: platform === 'ios' ? 'ios' : 'android',
        }, {
          onConflict: 'user_id,token'
        });

      if (error) {
        console.error('Error saving device token:', error);
      } else {
        console.log('Device token saved successfully');
      }
    } catch (error) {
      console.error('Error saving device token:', error);
    }
  }

  static async removeDeviceToken(userId: string) {
    try {
      const { data: tokens } = await PushNotifications.getDeliveredNotifications();

      if (tokens) {
        for (const token of tokens) {
          await supabase
            .from('device_tokens')
            .delete()
            .eq('user_id', userId)
            .eq('token', token);
        }
      }

      await PushNotifications.removeAllListeners();
    } catch (error) {
      console.error('Error removing device token:', error);
    }
  }

  static async sendPushNotification(userIds: string[], title: string, body: string, data?: Record<string, any>) {
    try {
      const { data: response, error } = await supabase.functions.invoke('send-push-notification', {
        body: {
          userIds,
          title,
          body,
          data
        }
      });

      if (error) {
        throw error;
      }

      return response;
    } catch (error) {
      console.error('Error sending push notification:', error);
      throw error;
    }
  }
}
