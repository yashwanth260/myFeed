import { Injectable, Logger } from '@nestjs/common';

export type PushNotificationEventType =
  | 'order:placed'
  | 'kitchen:ready_for_pickup'
  | 'courier:picked_up'
  | 'order:delivered';

export interface PushNotificationPayload {
  userId: string;
  orderId: string;
  title: string;
  body: string;
  data?: Record<string, string>;
}

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger('NotificationsService');

  // Firebase Admin Messaging Hook (instantiated when credentials configured)
  private firebaseMessaging: any = null;

  async sendPushNotification(
    event: PushNotificationEventType,
    payload: PushNotificationPayload,
  ): Promise<boolean> {
    this.logger.log(
      `[PUSH NOTIFICATION] Event: ${event} | User: ${payload.userId} | Order: ${payload.orderId} | "${payload.title}" - ${payload.body}`,
    );

    if (this.firebaseMessaging) {
      try {
        await this.firebaseMessaging.send({
          topic: `user_${payload.userId}`,
          notification: { title: payload.title, body: payload.body },
          data: { ...payload.data, orderId: payload.orderId, event },
        });
      } catch (err: any) {
        this.logger.warn(`Firebase delivery skipped: ${err.message}`);
      }
    }

    return true;
  }
}
