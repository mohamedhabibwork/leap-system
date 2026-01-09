import { Injectable, Logger } from '@nestjs/common';
import { NotificationsGateway, AdminNotificationEvent } from './notifications.gateway';

interface AdminNotificationData {
  title: string;
  message: string;
  type: AdminNotificationEvent;
  data?: any;
  actionUrl?: string;
}

/**
 * Admin notification service
 * 
 * Handles broadcasting admin notifications through WebSocket
 */
@Injectable()
export class AdminNotificationsService {
  private readonly logger = new Logger(AdminNotificationsService.name);

  constructor(private readonly notificationsGateway: NotificationsGateway) {}

  /**
   * Notify admins about a new ticket
   */
  notifyTicketCreated(ticket: any) {
    this.notificationsGateway.notifyAdmins({
      type: AdminNotificationEvent.TICKET_CREATED,
      title: 'New Ticket Created',
      message: `Ticket #${ticket.id}: ${ticket.subject}`,
      data: ticket,
      actionUrl: `/admin/tickets/${ticket.id}`,
      timestamp: new Date(),
    });
  }

  /**
   * Notify admins about a ticket update
   */
  notifyTicketUpdated(ticket: any, assigneeId?: number) {
    const notification = {
      type: AdminNotificationEvent.TICKET_UPDATED,
      title: 'Ticket Updated',
      message: `Ticket #${ticket.id} has been updated`,
      data: ticket,
      actionUrl: `/admin/tickets/${ticket.id}`,
      timestamp: new Date(),
    };

    if (assigneeId) {
      // Notify specific assignee
      this.notificationsGateway.notifyAdminUser(assigneeId, notification);
    } else {
      // Notify all admins
      this.notificationsGateway.notifyAdmins(notification);
    }
  }

  /**
   * Notify admins about a new report
   */
  notifyReportCreated(report: any) {
    // Notify moderators and admins
    this.notificationsGateway.notifyRoles(['admin', 'superadmin', 'moderator'], {
      type: AdminNotificationEvent.REPORT_CREATED,
      title: 'New Report Submitted',
      message: `${report.reportableType} reported: ${report.reason}`,
      data: report,
      actionUrl: `/admin/reports/${report.id}`,
      timestamp: new Date(),
    });
  }

  /**
   * Notify admins about a report review
   */
  notifyReportUpdated(report: any) {
    this.notificationsGateway.notifyRoles(['admin', 'superadmin', 'moderator'], {
      type: AdminNotificationEvent.REPORT_UPDATED,
      title: 'Report Reviewed',
      message: `Report #${report.id} has been ${report.status}`,
      data: report,
      actionUrl: `/admin/reports/${report.id}`,
      timestamp: new Date(),
    });
  }

  /**
   * Notify admins about a new user registration
   */
  notifyUserRegistered(user: any) {
    this.notificationsGateway.notifyAdmins({
      type: AdminNotificationEvent.USER_REGISTERED,
      title: 'New User Registered',
      message: `${user.firstName} ${user.lastName} (${user.email}) has registered`,
      data: user,
      actionUrl: `/admin/users/${user.id}`,
      timestamp: new Date(),
    });
  }

  /**
   * Notify admins about flagged content
   */
  notifyContentFlagged(content: any) {
    this.notificationsGateway.notifyRoles(['admin', 'superadmin', 'moderator', 'contentmanager'], {
      type: AdminNotificationEvent.CONTENT_FLAGGED,
      title: 'Content Flagged for Review',
      message: `${content.type} has been flagged for moderation`,
      data: content,
      actionUrl: `/admin/moderation/${content.id}`,
      timestamp: new Date(),
    });
  }

  /**
   * Broadcast real-time statistics update
   */
  broadcastStatsUpdate(stats: any) {
    this.notificationsGateway.broadcastStatsUpdate(stats);
  }

  /**
   * Generic method to notify admins
   */
  notify(data: AdminNotificationData, roles?: string[], userId?: number) {
    const notification = {
      ...data,
      timestamp: new Date(),
    };

    if (userId) {
      this.notificationsGateway.notifyAdminUser(userId, notification);
    } else if (roles && roles.length > 0) {
      this.notificationsGateway.notifyRoles(roles, notification);
    } else {
      this.notificationsGateway.notifyAdmins(notification);
    }
  }

  /**
   * Get connection statistics
   */
  getConnectionStats() {
    return {
      totalConnections: this.notificationsGateway.getConnectedClientsCount(),
      adminConnections: this.notificationsGateway.getAdminClientsCount(),
    };
  }
}
