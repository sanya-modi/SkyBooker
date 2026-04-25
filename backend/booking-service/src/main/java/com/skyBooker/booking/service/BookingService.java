package com.skyBooker.booking.service;

import com.skyBooker.booking.dto.BookingRequest;
import com.skyBooker.booking.dto.BookingResponse;
import com.skyBooker.booking.entity.Booking;

import java.util.List;

public interface BookingService {
    BookingResponse createBooking(BookingRequest request);
    BookingResponse getBookingById(Long id);
    BookingResponse getBookingByPnr(String pnr);
    List<BookingResponse> getBookingsByUserId(Long userId);
    BookingResponse updateBookingStatus(Long id, Booking.BookingStatus status);
    BookingResponse webCheckIn(Long id, String seatNumber);
    int markNoShowsAfterGateClosure();
    byte[] generateETicketPdf(Long id);
    byte[] generateBoardingPassPdf(Long id);
    void cancelBooking(Long id);
    List<BookingResponse> getConfirmedBookingsByFlight(Long flightId);
    Long countConfirmedBookings(Long flightId);
}
