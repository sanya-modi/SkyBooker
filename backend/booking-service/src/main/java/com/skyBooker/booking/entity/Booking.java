package com.skyBooker.booking.entity;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(
    name = "bookings",
    indexes = {
        @Index(name = "idx_bookings_pnr", columnList = "pnr")
    }
)
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Booking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 20)
    private String pnr;

    @Column(nullable = false)
    private Long userId;

    @Column(nullable = false)
    private Long flightId;

    @Column(nullable = false)
    private Integer numberOfPassengers;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal baseFare;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal taxes;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal ancillaryCharges;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal totalFare;

    @Column(name = "total_amount", nullable = false, precision = 10, scale = 2)
    private BigDecimal totalAmount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private BookingStatus status;

    @Column(nullable = false)
    private LocalDateTime bookingDate;

    @Column(name = "payment_id")
    private Long paymentId;

    @Column(nullable = false)
    private Boolean checkedIn;

    @Column(name = "checked_in_at")
    private LocalDateTime checkedInAt;

    @Column(name = "selected_seats", columnDefinition = "TEXT")
    private String selectedSeatsJson;

    @Column(nullable = false)
    private Boolean checkInReminderSent;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        bookingDate = LocalDateTime.now();
        status = BookingStatus.PENDING;
        checkedIn = Boolean.FALSE;
        checkInReminderSent = Boolean.FALSE;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public enum BookingStatus {
        PENDING, CONFIRMED, CANCELLED, COMPLETED, NO_SHOW
    }

    @Transient
    private static final ObjectMapper objectMapper = new ObjectMapper();

    public List<String> getSelectedSeats() {
        if (selectedSeatsJson == null || selectedSeatsJson.isEmpty()) {
            return new ArrayList<>();
        }
        try {
            return objectMapper.readValue(selectedSeatsJson, new TypeReference<List<String>>() {});
        } catch (JsonProcessingException e) {
            return new ArrayList<>();
        }
    }

    public void setSelectedSeats(List<String> seats) {
        try {
            this.selectedSeatsJson = objectMapper.writeValueAsString(seats);
        } catch (JsonProcessingException e) {
            this.selectedSeatsJson = "[]";
        }
    }

    public void setTotalFare(BigDecimal totalFare) {
        this.totalFare = totalFare;
        this.totalAmount = totalFare;
    }

    public void setTotalAmount(BigDecimal totalAmount) {
        this.totalAmount = totalAmount;
        this.totalFare = totalAmount;
    }
}
