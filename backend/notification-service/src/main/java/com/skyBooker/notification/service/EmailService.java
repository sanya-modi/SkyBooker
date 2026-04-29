package com.skyBooker.notification.service;

import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;
    private final TemplateEngine templateEngine;

    @Value("${spring.mail.username:noreply@skybooker.com}")
    private String fromEmail;

    public void sendWelcomeEmail(String toEmail, String firstName, String lastName) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(toEmail);
            helper.setSubject("✈️ Welcome to SkyBooker - Your Journey Begins Here!");

            Context context = new Context();
            context.setVariable("firstName", firstName);
            context.setVariable("lastName", lastName);
            
            String htmlContent = templateEngine.process("welcome-email", context);
            helper.setText(htmlContent, true);

            mailSender.send(message);
            log.info("Welcome email sent to: {}", toEmail);
        } catch (Exception e) {
            log.error("Failed to send welcome email to: {}", toEmail, e);
        }
    }

    public void sendLoginNotification(String toEmail, String firstName, LocalDateTime loginTime, String ipAddress, String device) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(toEmail);
            helper.setSubject("🔐 New Login to Your SkyBooker Account");

            Context context = new Context();
            context.setVariable("firstName", firstName);
            context.setVariable("loginTime", loginTime.format(DateTimeFormatter.ofPattern("dd MMM yyyy, HH:mm")));
            context.setVariable("ipAddress", ipAddress != null ? ipAddress : "Unknown");
            context.setVariable("device", device != null ? device : "Unknown Device");
            
            String htmlContent = templateEngine.process("login-notification", context);
            helper.setText(htmlContent, true);

            mailSender.send(message);
            log.info("Login notification email sent to: {}", toEmail);
        } catch (Exception e) {
            log.error("Failed to send login notification email to: {}", toEmail, e);
        }
    }

    public void sendBookingConfirmation(String toEmail, String pnr, Map<String, Object> bookingDetails, byte[] ticketPdf) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(toEmail);
            helper.setSubject("✈️ Booking Confirmed - PNR: " + pnr + " | SkyBooker Airlines");

            Context context = new Context();
            context.setVariable("pnr", pnr);
            context.setVariable("bookingDetails", bookingDetails);
            
            String htmlContent = templateEngine.process("booking-confirmation", context);
            helper.setText(htmlContent, true);

            if (ticketPdf != null && ticketPdf.length > 0) {
                helper.addAttachment("E-Ticket-" + pnr + ".pdf", new ByteArrayResource(ticketPdf));
            }

            mailSender.send(message);
            log.info("Booking confirmation email sent to: {}", toEmail);
        } catch (Exception e) {
            log.error("Failed to send booking confirmation email to: {}", toEmail, e);
        }
    }

    public void sendCheckInReminder(String toEmail, String pnr, Map<String, Object> flightDetails) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(toEmail);
            helper.setSubject("⏰ Web Check-in Now Open - PNR: " + pnr);

            Context context = new Context();
            context.setVariable("pnr", pnr);
            context.setVariable("flightDetails", flightDetails);
            
            String htmlContent = templateEngine.process("checkin-reminder", context);
            helper.setText(htmlContent, true);

            mailSender.send(message);
            log.info("Check-in reminder email sent to: {}", toEmail);
        } catch (Exception e) {
            log.error("Failed to send check-in reminder email to: {}", toEmail, e);
        }
    }

    public void sendPasswordResetEmail(String toEmail, String firstName, String resetToken) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(toEmail);
            helper.setSubject("🔒 Reset Your SkyBooker Password");

            String resetLink = "http://localhost:5173/reset-password?token=" + resetToken;

            Context context = new Context();
            context.setVariable("firstName", firstName);
            context.setVariable("resetLink", resetLink);
            
            String htmlContent = templateEngine.process("password-reset", context);
            helper.setText(htmlContent, true);

            mailSender.send(message);
            log.info("Password reset email sent to: {}", toEmail);
        } catch (Exception e) {
            log.error("Failed to send password reset email to: {}", toEmail, e);
        }
    }

    public void sendPasswordResetSuccessEmail(String toEmail, String firstName) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(toEmail);
            helper.setSubject("✅ Your Password Has Been Reset");

            Context context = new Context();
            context.setVariable("firstName", firstName);
            
            String htmlContent = templateEngine.process("password-reset-success", context);
            helper.setText(htmlContent, true);

            mailSender.send(message);
            log.info("Password reset success email sent to: {}", toEmail);
        } catch (Exception e) {
            log.error("Failed to send password reset success email to: {}", toEmail, e);
        }
    }
}
