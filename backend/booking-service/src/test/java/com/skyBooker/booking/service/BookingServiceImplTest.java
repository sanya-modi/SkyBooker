package com.skyBooker.booking.service;

import com.skyBooker.booking.dto.BookingRequest;
import com.skyBooker.booking.dto.BookingResponse;
import com.skyBooker.booking.dto.FlightBookingAnalyticsResponse;
import com.skyBooker.booking.dto.TicketLookupResponse;
import com.skyBooker.booking.entity.Booking;
import com.skyBooker.booking.repository.BookingRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.http.ResponseEntity;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.doAnswer;
import static org.mockito.Mockito.doReturn;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.spy;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class BookingServiceImplTest {

    @Mock
    private BookingRepository bookingRepository;

    @Mock
    private WebClient.Builder webClientBuilder;

    @Mock
    private PdfTicketGenerator pdfTicketGenerator;

    @Mock
    private RabbitTemplate rabbitTemplate;

    @InjectMocks
    private BookingServiceImpl bookingService;

    private WebClient webClient;
    private WebClient.RequestHeadersUriSpec<?> getSpec;
    private WebClient.RequestBodyUriSpec postSpec;
    private WebClient.RequestHeadersUriSpec<?> deleteSpec;
    private WebClient.RequestHeadersSpec<?> headersSpec;
    private WebClient.RequestHeadersSpec<?> deleteHeadersSpec;
    private WebClient.ResponseSpec responseSpec;

    private BookingServiceImpl.FlightDTO flightDto;
    private BookingServiceImpl.UserDTO userDto;
    private BookingServiceImpl.PassengerDTO passengerDto;

    @BeforeEach
    void setUp() {
        webClient = mock(WebClient.class);
        getSpec = mock(WebClient.RequestHeadersUriSpec.class);
        postSpec = mock(WebClient.RequestBodyUriSpec.class);
        deleteSpec = mock(WebClient.RequestHeadersUriSpec.class);
        headersSpec = mock(WebClient.RequestHeadersSpec.class);
        deleteHeadersSpec = mock(WebClient.RequestHeadersSpec.class);
        responseSpec = mock(WebClient.ResponseSpec.class);

        doReturn(webClient).when(webClientBuilder).build();

        doReturn(getSpec).when(webClient).get();
        doReturn(headersSpec).when(getSpec).uri(anyString(), any(Object[].class));
        doReturn(responseSpec).when(headersSpec).retrieve();

        doReturn(postSpec).when(webClient).post();
        doReturn(postSpec).when(postSpec).uri(anyString());
        doReturn(postSpec).when(postSpec).uri(anyString(), any(Object[].class));
        doReturn(postSpec).when(postSpec).bodyValue(any());
        doReturn(responseSpec).when(postSpec).retrieve();

        doReturn(deleteSpec).when(webClient).delete();
        doReturn(deleteHeadersSpec).when(deleteSpec).uri(anyString(), any(Object[].class));
        doReturn(responseSpec).when(deleteHeadersSpec).retrieve();

        flightDto = new BookingServiceImpl.FlightDTO();
        flightDto.setId(11L);
        flightDto.setFlightNumber("SK100");
        flightDto.setAircraftType("A320");
        flightDto.setAirlineId(5L);
        flightDto.setDepartureAirportId(101L);
        flightDto.setArrivalAirportId(202L);
        flightDto.setBaseFare(new BigDecimal("5000"));
        flightDto.setDepartureTime(LocalDateTime.now().plusHours(6));
        flightDto.setArrivalTime(flightDto.getDepartureTime().plusHours(2));
        flightDto.setTotalSeats(180);
        flightDto.setAvailableSeats(42);
        flightDto.setStatus("SCHEDULED");

        userDto = new BookingServiceImpl.UserDTO();
        userDto.setEmail("traveler@example.com");
        userDto.setPhoneNumber("9999999999");

        passengerDto = new BookingServiceImpl.PassengerDTO();
        passengerDto.setId(91L);
        passengerDto.setBookingId(1L);
        passengerDto.setFirstName("Ava");
        passengerDto.setLastName("Stone");
        passengerDto.setEmail("ava@example.com");
        passengerDto.setPhoneNumber("1234567890");
        passengerDto.setPassportNumber("P12345");
        passengerDto.setDateOfBirth("1998-04-02");
        passengerDto.setCategory("ADULT");
        passengerDto.setGender("F");
        passengerDto.setNationality("IN");
        passengerDto.setSpecialRequests("Wheelchair");

        doAnswer(invocation -> {
            Class<?> type = invocation.getArgument(0);
            if (type == BookingServiceImpl.FlightDTO.class) {
                return Mono.just(flightDto);
            }
            if (type == BookingServiceImpl.UserDTO.class) {
                return Mono.just(userDto);
            }
            if (type == BookingServiceImpl.PassengerDTO[].class) {
                return Mono.just(new BookingServiceImpl.PassengerDTO[]{passengerDto});
            }
            return Mono.empty();
        }).when(responseSpec).bodyToMono(any(Class.class));

        doReturn(Mono.just(ResponseEntity.ok().build())).when(responseSpec).toBodilessEntity();

        ReflectionTestUtils.setField(bookingService, "flightServiceUrl", "http://flight");
        ReflectionTestUtils.setField(bookingService, "notificationServiceUrl", "http://notification");
        ReflectionTestUtils.setField(bookingService, "authServiceUrl", "http://auth");
        ReflectionTestUtils.setField(bookingService, "seatServiceUrl", "http://seat");
        ReflectionTestUtils.setField(bookingService, "paymentServiceUrl", "http://payment");
        ReflectionTestUtils.setField(bookingService, "passengerServiceUrl", "http://passenger");
    }

    @Test
    void createBookingCalculatesTotalsAndDefaultsMissingCharges() {
        BookingRequest request = validRequest();
        request.setTaxes(null);
        request.setSeatCharge(null);
        request.setMealCharge(new BigDecimal("250"));
        request.setBaggageCharge(null);

        when(bookingRepository.findByPnr(anyString())).thenReturn(Optional.empty());
        when(bookingRepository.save(any(Booking.class))).thenAnswer(invocation -> {
            Booking booking = invocation.getArgument(0);
            booking.setId(99L);
            booking.setStatus(Booking.BookingStatus.PENDING);
            booking.setCheckedIn(false);
            booking.setCheckInReminderSent(false);
            booking.setBookingDate(LocalDateTime.now());
            return booking;
        });

        BookingResponse response = bookingService.createBooking(request);

        assertThat(response.getId()).isEqualTo(99L);
        assertThat(response.getBaseFare()).isEqualByComparingTo("10000");
        assertThat(response.getTaxes()).isEqualByComparingTo("0");
        assertThat(response.getAncillaryCharges()).isEqualByComparingTo("250");
        assertThat(response.getTotalFare()).isEqualByComparingTo("10250");
        assertThat(response.getSelectedSeats()).containsExactly("1A", "1B");
    }

    @Test
    void createBookingRejectsMismatchedSeatCount() {
        BookingRequest request = validRequest();
        request.setSelectedSeats(List.of("1A"));

        assertThatThrownBy(() -> bookingService.createBooking(request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Selected seats must match");
    }

    @Test
    void createBookingRejectsMismatchedPassengerCount() {
        BookingRequest request = validRequest();
        request.setPassengers(List.of(request.getPassengers().get(0)));

        assertThatThrownBy(() -> bookingService.createBooking(request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Passenger count must match");
    }

    @Test
    void createBookingRejectsFutureDateOfBirth() {
        BookingRequest request = validRequest();
        request.setPassengers(List.of(
                new BookingRequest.PassengerValidationRequest(LocalDate.now().plusYears(1), BookingRequest.PassengerCategory.ADULT),
                new BookingRequest.PassengerValidationRequest(LocalDate.now().minusYears(30), BookingRequest.PassengerCategory.ADULT)
        ));

        assertThatThrownBy(() -> bookingService.createBooking(request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("future");
    }

    @Test
    void createBookingRejectsInvalidAdultAge() {
        BookingRequest request = validRequest();
        request.setPassengers(List.of(
                new BookingRequest.PassengerValidationRequest(LocalDate.now().minusYears(10), BookingRequest.PassengerCategory.ADULT),
                new BookingRequest.PassengerValidationRequest(LocalDate.now().minusYears(30), BookingRequest.PassengerCategory.ADULT)
        ));

        assertThatThrownBy(() -> bookingService.createBooking(request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("older than 12");
    }

    @Test
    void createBookingRejectsInvalidChildAge() {
        BookingRequest request = validRequest();
        request.setPassengers(List.of(
                new BookingRequest.PassengerValidationRequest(LocalDate.now().minusYears(1), BookingRequest.PassengerCategory.CHILD),
                new BookingRequest.PassengerValidationRequest(LocalDate.now().minusYears(30), BookingRequest.PassengerCategory.ADULT)
        ));

        assertThatThrownBy(() -> bookingService.createBooking(request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("between 2 and 12");
    }

    @Test
    void createBookingRejectsInvalidInfantAge() {
        BookingRequest request = validRequest();
        request.setPassengers(List.of(
                new BookingRequest.PassengerValidationRequest(LocalDate.now().minusYears(3), BookingRequest.PassengerCategory.INFANT),
                new BookingRequest.PassengerValidationRequest(LocalDate.now().minusYears(30), BookingRequest.PassengerCategory.ADULT)
        ));

        assertThatThrownBy(() -> bookingService.createBooking(request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("below 2 years");
    }

    @Test
    void createBookingRejectsNegativePricing() {
        BookingRequest request = validRequest();
        request.setTaxes(new BigDecimal("-1"));

        assertThatThrownBy(() -> bookingService.createBooking(request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("zero or positive");
    }

    @Test
    void getTicketByPnrReturnsBookingFlightAndPassengers() {
        when(bookingRepository.findByPnr("PNR123")).thenReturn(Optional.of(sampleBooking(Booking.BookingStatus.CONFIRMED)));

        TicketLookupResponse response = bookingService.getTicketByPnr("PNR123");

        assertThat(response.getBooking().getPnr()).isEqualTo("PNR123");
        assertThat(response.getFlight().getFlightNumber()).isEqualTo("SK100");
        assertThat(response.getPassengers()).singleElement()
                .extracting(TicketLookupResponse.PassengerSummary::getFirstName)
                .isEqualTo("Ava");
    }

    @Test
    void getTicketByPnrRejectsCancelledBooking() {
        when(bookingRepository.findByPnr("PNR123")).thenReturn(Optional.of(sampleBooking(Booking.BookingStatus.CANCELLED)));

        assertThatThrownBy(() -> bookingService.getTicketByPnr("PNR123"))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("cancelled");
    }

    @Test
    void getTicketByPnrRejectsPendingBooking() {
        when(bookingRepository.findByPnr("PNR123")).thenReturn(Optional.of(sampleBooking(Booking.BookingStatus.PENDING)));

        assertThatThrownBy(() -> bookingService.getTicketByPnr("PNR123"))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Payment is pending");
    }

    @Test
    void getTicketByPnrThrowsWhenBookingMissing() {
        when(bookingRepository.findByPnr("MISSING")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> bookingService.getTicketByPnr("MISSING"))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Booking not found");
    }

    @Test
    void updateBookingStatusConfirmedBooksSeatsSavesPaymentAndPublishesNotification() throws Exception {
        Booking booking = sampleBooking(Booking.BookingStatus.PENDING);

        when(bookingRepository.findById(1L)).thenReturn(Optional.of(booking));
        when(bookingRepository.save(booking)).thenReturn(booking);
        when(pdfTicketGenerator.generateModernTicket(any(Booking.class), any(Map.class))).thenReturn(new byte[]{1, 2, 3});

        BookingResponse response = bookingService.updateBookingStatus(1L, Booking.BookingStatus.CONFIRMED, 55L);

        assertThat(response.getStatus()).isEqualTo("CONFIRMED");
        assertThat(booking.getPaymentId()).isEqualTo(55L);
        verify(responseSpec, times(2)).toBodilessEntity();
        verify(rabbitTemplate).convertAndSend(anyString(), anyString(), any(Map.class));
    }

    @Test
    void updateBookingStatusThrowsWhenBookingIsMissing() {
        when(bookingRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> bookingService.updateBookingStatus(999L, Booking.BookingStatus.CONFIRMED, null))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Booking not found");
    }

    @Test
    void webCheckInRejectsNonConfirmedBookings() {
        when(bookingRepository.findById(1L)).thenReturn(Optional.of(sampleBooking(Booking.BookingStatus.PENDING)));

        assertThatThrownBy(() -> bookingService.webCheckIn(1L, "2C"))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Only confirmed bookings");
    }

    @Test
    void webCheckInKeepsExistingSeatWhenSameSeatIsRequested() {
        Booking booking = sampleBooking(Booking.BookingStatus.CONFIRMED);
        flightDto.setDepartureTime(LocalDateTime.now().plusHours(5));
        when(bookingRepository.findById(1L)).thenReturn(Optional.of(booking));
        when(bookingRepository.save(any(Booking.class))).thenAnswer(invocation -> invocation.getArgument(0));

        BookingResponse response = bookingService.webCheckIn(1L, "1A");

        assertThat(response.getSelectedSeats()).containsExactly("1A", "1B");
        verify(deleteHeadersSpec, never()).retrieve();
    }

    @Test
    void webCheckInWithoutSeatChangeStillChecksInPassenger() {
        Booking booking = sampleBooking(Booking.BookingStatus.CONFIRMED);
        flightDto.setDepartureTime(LocalDateTime.now().plusHours(5));
        when(bookingRepository.findById(1L)).thenReturn(Optional.of(booking));
        when(bookingRepository.save(any(Booking.class))).thenAnswer(invocation -> invocation.getArgument(0));

        BookingResponse response = bookingService.webCheckIn(1L, null);

        assertThat(response.getCheckedIn()).isTrue();
        assertThat(response.getSelectedSeats()).containsExactly("1A", "1B");
    }

    @Test
    void webCheckInFailsWhenDepartureTimeCannotBeFetched() {
        Booking booking = sampleBooking(Booking.BookingStatus.CONFIRMED);
        flightDto.setDepartureTime(null);
        when(bookingRepository.findById(1L)).thenReturn(Optional.of(booking));

        assertThatThrownBy(() -> bookingService.webCheckIn(1L, "2C"))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Unable to fetch flight departure time");
    }

    @Test
    void webCheckInRejectsRequestsOutsideAllowedWindow() {
        Booking booking = sampleBooking(Booking.BookingStatus.CONFIRMED);
        flightDto.setDepartureTime(LocalDateTime.now().plusDays(3));
        when(bookingRepository.findById(1L)).thenReturn(Optional.of(booking));

        assertThatThrownBy(() -> bookingService.webCheckIn(1L, "2C"))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("24 hours to 1 hour");
    }

    @Test
    void webCheckInReleasesOldSeatAndStoresNewSeat() {
        Booking booking = sampleBooking(Booking.BookingStatus.CONFIRMED);
        flightDto.setDepartureTime(LocalDateTime.now().plusHours(4));
        when(bookingRepository.findById(1L)).thenReturn(Optional.of(booking));
        when(bookingRepository.save(any(Booking.class))).thenAnswer(invocation -> invocation.getArgument(0));

        BookingResponse response = bookingService.webCheckIn(1L, "3D");

        assertThat(response.getCheckedIn()).isTrue();
        assertThat(response.getSelectedSeats()).containsExactly("3D");
        verify(deleteHeadersSpec, times(2)).retrieve();
    }

    @Test
    void markNoShowsAfterGateClosureOnlyUpdatesUncheckedExpiredBookings() {
        Booking overdueUnchecked = sampleBooking(Booking.BookingStatus.CONFIRMED);
        overdueUnchecked.setCheckedIn(false);

        Booking checkedInBooking = sampleBooking(Booking.BookingStatus.CONFIRMED);
        checkedInBooking.setId(2L);
        checkedInBooking.setCheckedIn(true);
        flightDto.setDepartureTime(LocalDateTime.now().minusHours(2));

        when(bookingRepository.findByStatus(Booking.BookingStatus.CONFIRMED))
                .thenReturn(List.of(overdueUnchecked, checkedInBooking));
        when(bookingRepository.save(any(Booking.class))).thenAnswer(invocation -> invocation.getArgument(0));

        int updated = bookingService.markNoShowsAfterGateClosure();

        assertThat(updated).isEqualTo(1);
        assertThat(overdueUnchecked.getStatus()).isEqualTo(Booking.BookingStatus.NO_SHOW);
        verify(bookingRepository, times(1)).save(any(Booking.class));
    }

    @Test
    void generateETicketPdfReturnsGeneratorBytes() throws Exception {
        Booking booking = sampleBooking(Booking.BookingStatus.CONFIRMED);
        when(bookingRepository.findById(1L)).thenReturn(Optional.of(booking));
        when(pdfTicketGenerator.generateModernTicket(any(Booking.class), any(Map.class))).thenReturn(new byte[]{9, 8});

        byte[] result = bookingService.generateETicketPdf(1L);

        assertThat(result).containsExactly(9, 8);
    }

    @Test
    void generateETicketPdfWrapsGeneratorFailures() throws Exception {
        Booking booking = sampleBooking(Booking.BookingStatus.CONFIRMED);
        when(bookingRepository.findById(1L)).thenReturn(Optional.of(booking));
        when(pdfTicketGenerator.generateModernTicket(any(Booking.class), any(Map.class)))
                .thenThrow(new IllegalStateException("broken pdf"));

        assertThatThrownBy(() -> bookingService.generateETicketPdf(1L))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Failed to generate e-ticket PDF");
    }

    @Test
    void generateETicketPdfRejectsPendingBooking() {
        when(bookingRepository.findById(1L)).thenReturn(Optional.of(sampleBooking(Booking.BookingStatus.PENDING)));

        assertThatThrownBy(() -> bookingService.generateETicketPdf(1L))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Payment is pending");
    }

    @Test
    void generateETicketPdfRejectsCancelledBooking() {
        when(bookingRepository.findById(1L)).thenReturn(Optional.of(sampleBooking(Booking.BookingStatus.CANCELLED)));

        assertThatThrownBy(() -> bookingService.generateETicketPdf(1L))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("cancelled");
    }

    @Test
    void generateETicketPdfWrapsMissingFlightDetails() {
        Booking booking = sampleBooking(Booking.BookingStatus.CONFIRMED);
        when(bookingRepository.findById(1L)).thenReturn(Optional.of(booking));
        doReturn(Mono.empty()).when(responseSpec).bodyToMono(BookingServiceImpl.FlightDTO.class);

        assertThatThrownBy(() -> bookingService.generateETicketPdf(1L))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Failed to generate e-ticket PDF");
    }

    @Test
    void generateBoardingPassRejectsUncheckedInBooking() {
        Booking booking = sampleBooking(Booking.BookingStatus.CONFIRMED);
        booking.setCheckedIn(false);
        when(bookingRepository.findById(1L)).thenReturn(Optional.of(booking));

        assertThatThrownBy(() -> bookingService.generateBoardingPassPdf(1L))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("only after web check-in");
    }

    @Test
    void generateBoardingPassPdfReturnsGeneratorBytes() throws Exception {
        Booking booking = sampleBooking(Booking.BookingStatus.CONFIRMED);
        booking.setCheckedIn(true);
        when(bookingRepository.findById(1L)).thenReturn(Optional.of(booking));
        when(pdfTicketGenerator.generateModernTicket(any(Booking.class), any(Map.class))).thenReturn(new byte[]{4, 5});

        byte[] result = bookingService.generateBoardingPassPdf(1L);

        assertThat(result).containsExactly(4, 5);
    }

    @Test
    void generateBoardingPassRejectsPendingBooking() {
        when(bookingRepository.findById(1L)).thenReturn(Optional.of(sampleBooking(Booking.BookingStatus.PENDING)));

        assertThatThrownBy(() -> bookingService.generateBoardingPassPdf(1L))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Payment is pending");
    }

    @Test
    void generateBoardingPassRejectsCancelledBooking() {
        when(bookingRepository.findById(1L)).thenReturn(Optional.of(sampleBooking(Booking.BookingStatus.CANCELLED)));

        assertThatThrownBy(() -> bookingService.generateBoardingPassPdf(1L))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("cancelled");
    }

    @Test
    void generateBoardingPassWrapsGeneratorFailures() throws Exception {
        Booking booking = sampleBooking(Booking.BookingStatus.CONFIRMED);
        booking.setCheckedIn(true);
        when(bookingRepository.findById(1L)).thenReturn(Optional.of(booking));
        when(pdfTicketGenerator.generateModernTicket(any(Booking.class), any(Map.class)))
                .thenThrow(new IllegalStateException("boarding-pass-failure"));

        assertThatThrownBy(() -> bookingService.generateBoardingPassPdf(1L))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Failed to generate boarding pass PDF");
    }

    @Test
    void scheduledSendCheckInRemindersSendsThreeChannelsAndMarksReminder() {
        Booking booking = sampleBooking(Booking.BookingStatus.CONFIRMED);
        booking.setCheckedIn(false);
        booking.setCheckInReminderSent(false);
        flightDto.setDepartureTime(LocalDateTime.now().plusHours(23).plusMinutes(30));

        when(bookingRepository.findByStatus(Booking.BookingStatus.CONFIRMED)).thenReturn(List.of(booking));
        when(bookingRepository.save(any(Booking.class))).thenAnswer(invocation -> invocation.getArgument(0));

        bookingService.scheduledSendCheckInReminders();

        assertThat(booking.getCheckInReminderSent()).isTrue();
        verify(responseSpec, times(3)).toBodilessEntity();
    }

    @Test
    void scheduledSendCheckInRemindersSkipsAlreadyRemindedAndCheckedInBookings() {
        Booking alreadyReminded = sampleBooking(Booking.BookingStatus.CONFIRMED);
        alreadyReminded.setCheckInReminderSent(true);

        Booking checkedIn = sampleBooking(Booking.BookingStatus.CONFIRMED);
        checkedIn.setId(2L);
        checkedIn.setCheckedIn(true);

        when(bookingRepository.findByStatus(Booking.BookingStatus.CONFIRMED))
                .thenReturn(List.of(alreadyReminded, checkedIn));

        bookingService.scheduledSendCheckInReminders();

        verify(bookingRepository, never()).save(any(Booking.class));
    }

    @Test
    void scheduledSendCheckInRemindersSkipsOutsideReminderWindow() {
        Booking booking = sampleBooking(Booking.BookingStatus.CONFIRMED);
        booking.setCheckedIn(false);
        booking.setCheckInReminderSent(false);
        flightDto.setDepartureTime(LocalDateTime.now().plusHours(30));

        when(bookingRepository.findByStatus(Booking.BookingStatus.CONFIRMED)).thenReturn(List.of(booking));

        bookingService.scheduledSendCheckInReminders();

        assertThat(booking.getCheckInReminderSent()).isFalse();
        verify(bookingRepository, never()).save(any(Booking.class));
    }

    @Test
    void scheduledSendCheckInRemindersFallsBackToInAppWhenUserLookupFails() {
        Booking booking = sampleBooking(Booking.BookingStatus.CONFIRMED);
        booking.setCheckedIn(false);
        booking.setCheckInReminderSent(false);
        flightDto.setDepartureTime(LocalDateTime.now().plusHours(23).plusMinutes(15));
        doReturn(Mono.error(new RuntimeException("auth down"))).when(responseSpec).bodyToMono(BookingServiceImpl.UserDTO.class);

        when(bookingRepository.findByStatus(Booking.BookingStatus.CONFIRMED)).thenReturn(List.of(booking));
        when(bookingRepository.save(any(Booking.class))).thenAnswer(invocation -> invocation.getArgument(0));

        bookingService.scheduledSendCheckInReminders();

        assertThat(booking.getCheckInReminderSent()).isTrue();
        verify(responseSpec, times(1)).toBodilessEntity();
    }

    @Test
    void cancelBookingRejectsAlreadyCancelledBookings() {
        when(bookingRepository.findById(1L)).thenReturn(Optional.of(sampleBooking(Booking.BookingStatus.CANCELLED)));

        assertThatThrownBy(() -> bookingService.cancelBooking(1L))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("already cancelled");
    }

    @Test
    void cancelBookingRejectsCompletedBookings() {
        when(bookingRepository.findById(1L)).thenReturn(Optional.of(sampleBooking(Booking.BookingStatus.COMPLETED)));

        assertThatThrownBy(() -> bookingService.cancelBooking(1L))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("completed");
    }

    @Test
    void cancelBookingReleasesSeatsStartsRefundAndSendsNotification() {
        Booking booking = sampleBooking(Booking.BookingStatus.CONFIRMED);
        booking.setPaymentId(777L);

        when(bookingRepository.findById(1L)).thenReturn(Optional.of(booking));
        when(bookingRepository.save(any(Booking.class))).thenAnswer(invocation -> invocation.getArgument(0));

        bookingService.cancelBooking(1L);

        assertThat(booking.getStatus()).isEqualTo(Booking.BookingStatus.CANCELLED);
        verify(deleteHeadersSpec, times(2)).retrieve();
        verify(postSpec, times(2)).retrieve();
    }

    @Test
    void cancelBookingWithoutPaymentSkipsRefundCall() {
        Booking booking = sampleBooking(Booking.BookingStatus.CONFIRMED);
        booking.setPaymentId(null);
        when(bookingRepository.findById(1L)).thenReturn(Optional.of(booking));
        when(bookingRepository.save(any(Booking.class))).thenAnswer(invocation -> invocation.getArgument(0));

        bookingService.cancelBooking(1L);

        verify(deleteHeadersSpec, times(2)).retrieve();
        verify(postSpec, times(1)).retrieve();
    }

    @Test
    void cancelBookingContinuesWhenSeatRefundAndNotificationCallsFail() {
        Booking booking = sampleBooking(Booking.BookingStatus.CONFIRMED);
        booking.setPaymentId(777L);
        when(bookingRepository.findById(1L)).thenReturn(Optional.of(booking));
        when(bookingRepository.save(any(Booking.class))).thenAnswer(invocation -> invocation.getArgument(0));
        doReturn(Mono.error(new RuntimeException("downstream failure"))).when(responseSpec).toBodilessEntity();

        bookingService.cancelBooking(1L);

        assertThat(booking.getStatus()).isEqualTo(Booking.BookingStatus.CANCELLED);
    }

    @Test
    void getConfirmedBookingsAndCountsUseRepositoryData() {
        when(bookingRepository.findConfirmedBookingsByFlight(11L)).thenReturn(List.of(sampleBooking(Booking.BookingStatus.CONFIRMED)));
        when(bookingRepository.countConfirmedBookingsByFlight(11L)).thenReturn(3L);
        when(bookingRepository.sumConfirmedRevenueByFlight(11L)).thenReturn(new BigDecimal("12000"));

        List<BookingResponse> bookings = bookingService.getConfirmedBookingsByFlight(11L);
        Long count = bookingService.countConfirmedBookings(11L);
        FlightBookingAnalyticsResponse analytics = bookingService.getFlightBookingAnalytics(11L);

        assertThat(bookings).hasSize(1);
        assertThat(count).isEqualTo(3L);
        assertThat(analytics.getRevenue()).isEqualByComparingTo("12000");
    }

    @Test
    void getBookingByIdAndPnrReturnMappedBooking() {
        Booking booking = sampleBooking(Booking.BookingStatus.CONFIRMED);
        when(bookingRepository.findById(1L)).thenReturn(Optional.of(booking));
        when(bookingRepository.findByPnr("PNR123")).thenReturn(Optional.of(booking));

        BookingResponse byId = bookingService.getBookingById(1L);
        BookingResponse byPnr = bookingService.getBookingByPnr("PNR123");

        assertThat(byId.getPnr()).isEqualTo("PNR123");
        assertThat(byPnr.getSelectedSeats()).containsExactly("1A", "1B");
    }

    @Test
    void getBookingByIdAndPnrThrowWhenMissing() {
        when(bookingRepository.findById(999L)).thenReturn(Optional.empty());
        when(bookingRepository.findByPnr("MISSING")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> bookingService.getBookingById(999L))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Booking not found");
        assertThatThrownBy(() -> bookingService.getBookingByPnr("MISSING"))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Booking not found");
    }

    @Test
    void getBookingsByUserIdMapsRepositoryList() {
        when(bookingRepository.findByUserId(7L)).thenReturn(List.of(sampleBooking(Booking.BookingStatus.CONFIRMED)));

        List<BookingResponse> responses = bookingService.getBookingsByUserId(7L);

        assertThat(responses).singleElement().extracting(BookingResponse::getUserId).isEqualTo(7L);
    }

    @Test
    void updateBookingStatusConfirmedWithoutSeatsSkipsSeatBookingButStillNotifies() throws Exception {
        Booking booking = sampleBooking(Booking.BookingStatus.PENDING);
        booking.setSelectedSeats(List.of());

        when(bookingRepository.findById(1L)).thenReturn(Optional.of(booking));
        when(bookingRepository.save(booking)).thenReturn(booking);
        when(pdfTicketGenerator.generateModernTicket(any(Booking.class), any(Map.class))).thenReturn(new byte[]{7});

        bookingService.updateBookingStatus(1L, Booking.BookingStatus.CONFIRMED, null);

        verify(responseSpec, never()).toBodilessEntity();
        verify(rabbitTemplate).convertAndSend(anyString(), anyString(), any(Map.class));
    }

    @Test
    void updateBookingStatusWithoutPaymentLeavesExistingPaymentUntouched() {
        Booking booking = sampleBooking(Booking.BookingStatus.PENDING);
        when(bookingRepository.findById(1L)).thenReturn(Optional.of(booking));
        when(bookingRepository.save(booking)).thenReturn(booking);

        BookingResponse response = bookingService.updateBookingStatus(1L, Booking.BookingStatus.CANCELLED, null);

        assertThat(response.getStatus()).isEqualTo("CANCELLED");
        assertThat(booking.getPaymentId()).isEqualTo(444L);
    }

    @Test
    void updateBookingStatusPropagatesSeatBookingFailures() {
        Booking booking = sampleBooking(Booking.BookingStatus.PENDING);
        when(bookingRepository.findById(1L)).thenReturn(Optional.of(booking));
        when(bookingRepository.save(booking)).thenReturn(booking);
        doReturn(Mono.error(new RuntimeException("seat-service-down"))).when(responseSpec).toBodilessEntity();

        assertThatThrownBy(() -> bookingService.updateBookingStatus(1L, Booking.BookingStatus.CONFIRMED, null))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Failed to confirm seat booking");
    }

    @Test
    void scheduledMarkNoShowsAfterGateClosureDelegatesToServiceMethod() {
        BookingServiceImpl serviceSpy = spy(bookingService);

        serviceSpy.scheduledMarkNoShowsAfterGateClosure();

        verify(serviceSpy).markNoShowsAfterGateClosure();
    }

    private BookingRequest validRequest() {
        BookingRequest request = new BookingRequest();
        request.setUserId(7L);
        request.setFlightId(11L);
        request.setNumberOfPassengers(2);
        request.setSelectedSeats(List.of("1A", "1B"));
        request.setTaxes(new BigDecimal("500"));
        request.setSeatCharge(new BigDecimal("200"));
        request.setMealCharge(new BigDecimal("100"));
        request.setBaggageCharge(new BigDecimal("50"));
        request.setPassengers(List.of(
                new BookingRequest.PassengerValidationRequest(LocalDate.now().minusYears(30), BookingRequest.PassengerCategory.ADULT),
                new BookingRequest.PassengerValidationRequest(LocalDate.now().minusYears(8), BookingRequest.PassengerCategory.CHILD)
        ));
        return request;
    }

    private Booking sampleBooking(Booking.BookingStatus status) {
        Booking booking = new Booking();
        booking.setId(1L);
        booking.setPnr("PNR123");
        booking.setUserId(7L);
        booking.setFlightId(11L);
        booking.setNumberOfPassengers(2);
        booking.setBaseFare(new BigDecimal("10000"));
        booking.setTaxes(new BigDecimal("500"));
        booking.setAncillaryCharges(new BigDecimal("350"));
        booking.setTotalFare(new BigDecimal("10850"));
        booking.setStatus(status);
        booking.setBookingDate(LocalDateTime.now().minusDays(1));
        booking.setPaymentId(444L);
        booking.setCheckedIn(false);
        booking.setCheckInReminderSent(false);
        booking.setSelectedSeats(List.of("1A", "1B"));
        return booking;
    }
}
