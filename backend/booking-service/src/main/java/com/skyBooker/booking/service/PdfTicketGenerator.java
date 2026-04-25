package com.skyBooker.booking.service;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import com.skyBooker.booking.entity.Booking;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.apache.pdfbox.pdmodel.graphics.image.LosslessFactory;
import org.apache.pdfbox.pdmodel.graphics.image.PDImageXObject;
import org.springframework.stereotype.Component;

import javax.imageio.ImageIO;
import java.awt.*;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Map;

@Component
public class PdfTicketGenerator {

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("dd MMM yyyy");
    private static final DateTimeFormatter TIME_FORMATTER = DateTimeFormatter.ofPattern("HH:mm");

    public byte[] generateModernTicket(Booking booking, Map<String, Object> flightDetails) throws Exception {
        try (PDDocument document = new PDDocument(); ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {
            PDPage page = new PDPage(PDRectangle.A4);
            document.addPage(page);

            try (PDPageContentStream content = new PDPageContentStream(document, page)) {
                float pageWidth = page.getMediaBox().getWidth();
                float pageHeight = page.getMediaBox().getHeight();
                float margin = 50;

                // Header with gradient effect (simulated with rectangles)
                drawHeader(content, pageWidth, pageHeight, margin, booking.getPnr());

                // Flight Route Section
                float yPos = pageHeight - 180;
                drawFlightRoute(content, margin, yPos, pageWidth, flightDetails);

                // Flight Details Section
                yPos -= 120;
                drawFlightDetails(content, margin, yPos, pageWidth, flightDetails);

                // Passenger Details
                yPos -= 100;
                drawPassengerDetails(content, margin, yPos, pageWidth, booking);

                // Fare Breakdown
                yPos -= 120;
                drawFareBreakdown(content, margin, yPos, pageWidth, booking);

                // QR Code
                BufferedImage qrImage = generateQRCode(booking.getPnr());
                PDImageXObject pdImage = LosslessFactory.createFromImage(document, qrImage);
                content.drawImage(pdImage, pageWidth - margin - 100, 80, 100, 100);

                // Footer
                drawFooter(content, margin, 50, pageWidth);
            }

            document.save(outputStream);
            return outputStream.toByteArray();
        }
    }

    private void drawHeader(PDPageContentStream content, float pageWidth, float pageHeight, float margin, String pnr) throws IOException {
        // Background rectangle
        content.setNonStrokingColor(new Color(0, 35, 111));
        content.addRect(0, pageHeight - 140, pageWidth, 140);
        content.fill();

        // Title
        content.beginText();
        content.setNonStrokingColor(Color.WHITE);
        content.setFont(PDType1Font.HELVETICA_BOLD, 28);
        content.newLineAtOffset(margin, pageHeight - 70);
        content.showText("SkyBooker E-Ticket");
        content.endText();

        // PNR
        content.beginText();
        content.setFont(PDType1Font.HELVETICA, 14);
        content.newLineAtOffset(margin, pageHeight - 95);
        content.showText("Booking Reference: " + pnr);
        content.endText();

        // Status Badge
        content.setNonStrokingColor(new Color(34, 197, 94));
        content.addRect(pageWidth - margin - 120, pageHeight - 90, 120, 35);
        content.fill();

        content.beginText();
        content.setNonStrokingColor(Color.WHITE);
        content.setFont(PDType1Font.HELVETICA_BOLD, 16);
        content.newLineAtOffset(pageWidth - margin - 105, pageHeight - 80);
        content.showText("CONFIRMED");
        content.endText();
    }

    private void drawFlightRoute(PDPageContentStream content, float margin, float yPos, float pageWidth, Map<String, Object> flightDetails) throws IOException {
        content.setNonStrokingColor(new Color(241, 245, 249));
        content.addRect(margin, yPos - 90, pageWidth - 2 * margin, 90);
        content.fill();

        // From
        content.beginText();
        content.setNonStrokingColor(new Color(100, 116, 139));
        content.setFont(PDType1Font.HELVETICA_BOLD, 10);
        content.newLineAtOffset(margin + 20, yPos - 25);
        content.showText("FROM");
        content.endText();

        content.beginText();
        content.setNonStrokingColor(new Color(0, 35, 111));
        content.setFont(PDType1Font.HELVETICA_BOLD, 32);
        content.newLineAtOffset(margin + 20, yPos - 55);
        content.showText(flightDetails.getOrDefault("departureCode", "DEP").toString());
        content.endText();

        content.beginText();
        content.setNonStrokingColor(new Color(51, 65, 85));
        content.setFont(PDType1Font.HELVETICA, 11);
        content.newLineAtOffset(margin + 20, yPos - 75);
        content.showText(flightDetails.getOrDefault("departureCity", "Departure City").toString());
        content.endText();

        // Arrow
        content.setStrokingColor(new Color(203, 213, 225));
        content.setLineWidth(2);
        content.moveTo(pageWidth / 2 - 40, yPos - 45);
        content.lineTo(pageWidth / 2 + 40, yPos - 45);
        content.stroke();

        // To
        content.beginText();
        content.setNonStrokingColor(new Color(100, 116, 139));
        content.setFont(PDType1Font.HELVETICA_BOLD, 10);
        content.newLineAtOffset(pageWidth - margin - 120, yPos - 25);
        content.showText("TO");
        content.endText();

        content.beginText();
        content.setNonStrokingColor(new Color(0, 35, 111));
        content.setFont(PDType1Font.HELVETICA_BOLD, 32);
        content.newLineAtOffset(pageWidth - margin - 120, yPos - 55);
        content.showText(flightDetails.getOrDefault("arrivalCode", "ARR").toString());
        content.endText();

        content.beginText();
        content.setNonStrokingColor(new Color(51, 65, 85));
        content.setFont(PDType1Font.HELVETICA, 11);
        content.newLineAtOffset(pageWidth - margin - 120, yPos - 75);
        content.showText(flightDetails.getOrDefault("arrivalCity", "Arrival City").toString());
        content.endText();
    }

    private void drawFlightDetails(PDPageContentStream content, float margin, float yPos, float pageWidth, Map<String, Object> flightDetails) throws IOException {
        float colWidth = (pageWidth - 2 * margin) / 4;

        String[][] details = {
            {"Flight Number", flightDetails.getOrDefault("flightNumber", "N/A").toString()},
            {"Date", flightDetails.getOrDefault("date", "N/A").toString()},
            {"Departure", flightDetails.getOrDefault("departureTime", "N/A").toString()},
            {"Arrival", flightDetails.getOrDefault("arrivalTime", "N/A").toString()}
        };

        for (int i = 0; i < details.length; i++) {
            float xPos = margin + i * colWidth;
            
            content.beginText();
            content.setNonStrokingColor(new Color(100, 116, 139));
            content.setFont(PDType1Font.HELVETICA_BOLD, 9);
            content.newLineAtOffset(xPos, yPos);
            content.showText(details[i][0].toUpperCase());
            content.endText();

            content.beginText();
            content.setNonStrokingColor(new Color(15, 23, 42));
            content.setFont(PDType1Font.HELVETICA_BOLD, 13);
            content.newLineAtOffset(xPos, yPos - 20);
            content.showText(details[i][1]);
            content.endText();
        }
    }

    private void drawPassengerDetails(PDPageContentStream content, float margin, float yPos, float pageWidth, Booking booking) throws IOException {
        content.beginText();
        content.setNonStrokingColor(new Color(0, 35, 111));
        content.setFont(PDType1Font.HELVETICA_BOLD, 14);
        content.newLineAtOffset(margin, yPos);
        content.showText("PASSENGER DETAILS");
        content.endText();

        content.beginText();
        content.setNonStrokingColor(new Color(51, 65, 85));
        content.setFont(PDType1Font.HELVETICA, 11);
        content.newLineAtOffset(margin, yPos - 25);
        content.showText("Booking ID: " + booking.getId());
        content.endText();

        content.beginText();
        content.newLineAtOffset(margin, yPos - 45);
        content.showText("Passengers: " + booking.getNumberOfPassengers());
        content.endText();

        content.beginText();
        content.newLineAtOffset(margin, yPos - 65);
        content.showText("Booked on: " + booking.getBookingDate().format(DATE_FORMATTER));
        content.endText();
    }

    private void drawFareBreakdown(PDPageContentStream content, float margin, float yPos, float pageWidth, Booking booking) throws IOException {
        content.setNonStrokingColor(new Color(248, 250, 252));
        content.addRect(margin, yPos - 80, pageWidth - 2 * margin - 130, 80);
        content.fill();

        content.beginText();
        content.setNonStrokingColor(new Color(0, 35, 111));
        content.setFont(PDType1Font.HELVETICA_BOLD, 14);
        content.newLineAtOffset(margin + 15, yPos - 20);
        content.showText("FARE BREAKDOWN");
        content.endText();

        String[][] fareItems = {
            {"Base Fare:", "₹" + booking.getBaseFare()},
            {"Taxes & Fees:", "₹" + booking.getTaxes()},
            {"Ancillary:", "₹" + booking.getAncillaryCharges()}
        };

        float itemY = yPos - 40;
        for (String[] item : fareItems) {
            content.beginText();
            content.setNonStrokingColor(new Color(71, 85, 105));
            content.setFont(PDType1Font.HELVETICA, 10);
            content.newLineAtOffset(margin + 15, itemY);
            content.showText(item[0]);
            content.endText();

            content.beginText();
            content.newLineAtOffset(margin + 150, itemY);
            content.showText(item[1]);
            content.endText();

            itemY -= 15;
        }

        // Total
        content.setNonStrokingColor(new Color(0, 35, 111));
        content.addRect(pageWidth - margin - 120, yPos - 80, 120, 80);
        content.fill();

        content.beginText();
        content.setNonStrokingColor(Color.WHITE);
        content.setFont(PDType1Font.HELVETICA_BOLD, 10);
        content.newLineAtOffset(pageWidth - margin - 100, yPos - 30);
        content.showText("TOTAL FARE");
        content.endText();

        content.beginText();
        content.setFont(PDType1Font.HELVETICA_BOLD, 20);
        content.newLineAtOffset(pageWidth - margin - 100, yPos - 55);
        content.showText("₹" + booking.getTotalFare());
        content.endText();
    }

    private void drawFooter(PDPageContentStream content, float margin, float yPos, float pageWidth) throws IOException {
        content.beginText();
        content.setNonStrokingColor(new Color(148, 163, 184));
        content.setFont(PDType1Font.HELVETICA, 8);
        content.newLineAtOffset(margin, yPos);
        content.showText("© 2024 SkyBooker Airlines. All rights reserved.");
        content.endText();

        content.beginText();
        content.newLineAtOffset(pageWidth - margin - 200, yPos);
        content.showText("Support: support@skybooker.com | +91-1800-123-4567");
        content.endText();

        content.beginText();
        content.newLineAtOffset(margin, yPos - 15);
        content.showText("Please arrive at the airport at least 2 hours before departure for domestic flights and 3 hours for international flights.");
        content.endText();
    }

    private BufferedImage generateQRCode(String pnr) throws Exception {
        QRCodeWriter qrCodeWriter = new QRCodeWriter();
        BitMatrix bitMatrix = qrCodeWriter.encode("SKYBOOKER-" + pnr, BarcodeFormat.QR_CODE, 200, 200);
        return MatrixToImageWriter.toBufferedImage(bitMatrix);
    }
}
