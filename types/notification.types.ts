export type NotificationType = 'info' | 'warning' | 'urgent' | 'success';

export interface GymNotification {
    id: string;
    recipientId: string; // The user who receives this notification
    title: string;
    message: string;
    timestamp: string; // ISO string
    isRead: boolean;
    type: NotificationType;
    branchId: string; // For filtering/analytics
    relatedMemberId?: string; // Optional: Link to the member causing the event (e.g. for "Payment Received")
    link?: string; // Optional: internal route to navigate to
}
