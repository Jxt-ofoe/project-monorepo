import { Injectable } from '@nestjs/common';
import { NotificationsGateway } from './notifications.gateway';

@Injectable()
export class NotificationsService {
  constructor(private readonly gateway: NotificationsGateway) {}

  notifyUser(userId: string, event: string, payload: any) {
    this.gateway.sendToRoom(`user_${userId}`, event, payload);
  }

  notifyDriver(driverId: string, event: string, payload: any) {
    this.gateway.sendToRoom(`driver_${driverId}`, event, payload);
  }

  notifyAdmins(event: string, payload: any) {
    this.gateway.sendToRoom('admins', event, payload);
  }

  broadcast(event: string, payload: any) {
    this.gateway.broadcast(event, payload);
  }
}
