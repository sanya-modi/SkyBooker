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

import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;
    private final TemplateEngine templateEngine;

    @Value("${spring.mail.username:noreply@skybooker.com}")
    private String fromEmail;

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
            throw new RuntimeException("Failed to send email", e);
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
}
