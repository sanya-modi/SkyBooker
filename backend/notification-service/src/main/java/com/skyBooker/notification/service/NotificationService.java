package com.skyBooker.notification.service;

import com.skyBooker.notification.entity.Notification;

import java.util.List;

public interface NotificationService {
    Notification createNotification(Long userId, Long bookingId, Notification.NotificationType type,
                                    Notification.Channel channel, String subject, String message, String recipient);
    void sendNotification(Long notificationId);
    Notification getNotificationById(Long id);
    List<Notification> getNotificationsByUserId(Long userId);
    List<Notification> getUnreadNotificationsByUserId(Long userId);
    List<Notification> getNotificationsByBookingId(Long bookingId);
    List<Notification> getPendingNotifications();
    void markAsRead(Long notificationId);
    void markAllAsRead(Long userId);
    Long getUnreadCount(Long userId);
    List<Notification> sendBulk(List<Notification> notifications);
}
