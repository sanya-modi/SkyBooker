package com.skyBooker.notification.service;

import com.skyBooker.notification.entity.Notification;
import com.skyBooker.notification.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;
    private final EmailService emailService;
    private final SmsService smsService;

    @Override
    public Notification createNotification(Long userId, Long bookingId, Notification.NotificationType type,
                                           Notification.Channel channel, String subject, String message, String recipient) {
        Notification notification = new Notification();
        notification.setUserId(userId);
        notification.setBookingId(bookingId);
        notification.setType(type);
        notification.setChannel(channel);
        notification.setSubject(subject);
        notification.setMessage(message);
        notification.setRecipient(recipient);

        return notificationRepository.save(notification);
    }

    @Override
    @Async
    public void sendNotification(Long notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));

        try {
            switch (notification.getChannel()) {
                case EMAIL -> sendEmailNotification(notification);
                case SMS -> sendSmsNotification(notification);
                case PUSH_NOTIFICATION -> sendPushNotification(notification);
                case IN_APP -> markAsDelivered(notification);
            }
        } catch (Exception e) {
            log.error("Failed to send notification: {}", notificationId, e);
            notification.setStatus(Notification.NotificationStatus.FAILED);
            notificationRepository.save(notification);
        }
    }

    private void sendEmailNotification(Notification notification) {
        log.info("Sending email notification to: {}", notification.getRecipient());
        // Email service will handle actual sending
        notification.setStatus(Notification.NotificationStatus.DELIVERED);
        notificationRepository.save(notification);
    }

    private void sendSmsNotification(Notification notification) {
        log.info("Sending SMS notification to: {}", notification.getRecipient());
        // SMS service will handle actual sending
        notification.setStatus(Notification.NotificationStatus.DELIVERED);
        notificationRepository.save(notification);
    }

    private void sendPushNotification(Notification notification) {
        log.info("Sending push notification for user: {}", notification.getUserId());
        notification.setStatus(Notification.NotificationStatus.DELIVERED);
        notificationRepository.save(notification);
    }

    private void markAsDelivered(Notification notification) {
        notification.setStatus(Notification.NotificationStatus.DELIVERED);
        notificationRepository.save(notification);
    }

    @Override
    @Transactional(readOnly = true)
    public Notification getNotificationById(Long id) {
        return notificationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Notification not found"));
    }

    @Override
    @Transactional(readOnly = true)
    public List<Notification> getNotificationsByUserId(Long userId) {
        return notificationRepository.findByUserId(userId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Notification> getUnreadNotificationsByUserId(Long userId) {
        return notificationRepository.findUnreadByUserId(userId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Notification> getNotificationsByBookingId(Long bookingId) {
        return notificationRepository.findByBookingId(bookingId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Notification> getPendingNotifications() {
        return notificationRepository.findPendingNotifications();
    }

    @Override
    public void markAsRead(Long notificationId) {
        Notification notification = getNotificationById(notificationId);
        notification.setIsRead(Boolean.TRUE);
        notification.setStatus(Notification.NotificationStatus.DELIVERED);
        notificationRepository.save(notification);
    }

    @Override
    public void markAllAsRead(Long userId) {
        List<Notification> notifications = notificationRepository.findUnreadByUserId(userId);
        notifications.forEach(notification -> {
            notification.setIsRead(Boolean.TRUE);
            if (notification.getStatus() == Notification.NotificationStatus.PENDING) {
                notification.setStatus(Notification.NotificationStatus.DELIVERED);
            }
        });
        notificationRepository.saveAll(notifications);
    }

    @Override
    @Transactional(readOnly = true)
    public Long getUnreadCount(Long userId) {
        return notificationRepository.countUnreadByUserId(userId);
    }

    @Override
    public List<Notification> sendBulk(List<Notification> notifications) {
        List<Notification> saved = notificationRepository.saveAll(notifications);
        saved.forEach(n -> sendNotification(n.getId()));
        return saved;
    }

    public void sendBookingConfirmationEmail(String email, String pnr, Map<String, Object> bookingDetails, byte[] ticketPdf) {
        emailService.sendBookingConfirmation(email, pnr, bookingDetails, ticketPdf);
    }

    public void sendBookingConfirmationSms(String phoneNumber, String pnr, String flightNumber, String date) {
        smsService.sendBookingConfirmation(phoneNumber, pnr, flightNumber, date);
    }

    public void sendSupportEmails(com.skyBooker.notification.dto.SupportRequest request) {
        // Send email to host
        emailService.sendSupportToHost(request.getTitle(), request.getDescription(), request.getUserEmail(), request.getFullName());
        // Send thank you email to user
        emailService.sendSupportThankYouToUser(request.getUserEmail(), request.getFullName());
    }
}
