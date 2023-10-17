import {
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CountData } from 'src/types/paginatedResult';
import { AuthenticatedRequest } from 'src/types/request.type';
import { AuthGuard } from 'src/guards/auth.guard';
import { Notification } from 'src/schemas/Notification.schema';
import { PaginationQuery } from 'src/dtos/QueryParams';
import { NotificationService } from './notifications.service';

@UseGuards(AuthGuard)
@Controller('notifications')
export class NotificationController {
  constructor(private notifService: NotificationService) {}

  @Get()
  getNotifications(
    @Query() query: PaginationQuery,
    @Req() req: AuthenticatedRequest,
  ): Promise<CountData<Notification[]> & { unread: number }> {
    const { page = 1, limit = 1 } = query;

    return this.notifService.getNotifications(req.user.id, page, limit);
  }

  @Patch(':notificationId')
  readNotification(
    @Param('notificationId') notificationId: string,
  ): Promise<Notification> {
    return this.notifService.updateRead(notificationId);
  }

  @Delete(':notificationId')
  deleteNotification(
    @Param('notificationId') notificationId: string,
  ): Promise<void> {
    return this.notifService.deleteNotification(notificationId);
  }
}
