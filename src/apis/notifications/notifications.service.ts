import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Notification } from 'src/schemas/Notification.schema';
import { CountData } from 'src/types/paginatedResult';

@Injectable()
export class NotificationService {
  constructor(
    @InjectModel(Notification.name) private notifModel: Model<Notification>,
  ) {}

  async getNotifications(
    userId: string,
    page: number,
    limit: number,
  ): Promise<CountData<Notification[]> & { unread: number }> {
    const skip = (page - 1) * limit;
    const notificationPromise = this.notifModel
      .find({ userId })
      .populate({ path: 'userId', select: '_id firstname lastname username' })
      .limit(limit)
      .skip(skip);
    const totalPromise = this.notifModel.find({ userId }).count();
    const unreadPromise = this.notifModel
      .find({ userId, status: false })
      .count();

    const [notifications, total, unread] = await Promise.all([
      notificationPromise,
      totalPromise,
      unreadPromise,
    ]);

    return {
      page,
      limit,
      total,
      unread,
      data: notifications,
    };
  }

  async updateRead(notificationId: string): Promise<Notification> {
    return await this.notifModel.findByIdAndUpdate(notificationId, {
      status: true,
    });
  }

  async deleteNotification(notificationId: string): Promise<void> {
    return await this.notifModel.findByIdAndDelete(notificationId);
  }
}
