package com.skyBooker.payment.repository;

import com.skyBooker.payment.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {
    Optional<Payment> findByTransactionId(String transactionId);

    @Query("SELECT p FROM Payment p WHERE p.bookingId = :bookingId ORDER BY p.transactionDate DESC")
    List<Payment> findByBookingId(@Param("bookingId") Long bookingId);

    Optional<Payment> findTopByBookingIdOrderByTransactionDateDesc(Long bookingId);

    @Query("SELECT p FROM Payment p WHERE p.userId = :userId ORDER BY p.transactionDate DESC")
    List<Payment> findByUserId(@Param("userId") Long userId);

    @Query("SELECT p FROM Payment p WHERE p.status = 'SUCCESS' AND p.bookingId = :bookingId")
    Optional<Payment> findSuccessfulPaymentByBookingId(@Param("bookingId") Long bookingId);

    Optional<Payment> findByRazorpayOrderId(String razorpayOrderId);

    @Query("SELECT p FROM Payment p WHERE p.status = :status")
    List<Payment> findByStatus(@Param("status") Payment.PaymentStatus status);
}
