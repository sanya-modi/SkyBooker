package com.skyBooker.booking;

import com.skyBooker.booking.config.RabbitMQConfig;
import com.skyBooker.booking.config.WebConfig;
import com.skyBooker.booking.dto.BookingRequest;
import com.skyBooker.booking.entity.Booking;
import com.skyBooker.booking.service.PdfTicketGenerator;
import com.skyBooker.booking.validation.BookingValidationPatterns;
import org.junit.jupiter.api.Test;
import org.mockito.MockedStatic;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.boot.SpringApplication;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.reactive.function.client.WebClient;

import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.mockStatic;

class BookingModuleCoverageTest {

    @Test
    void applicationMainAndWebClientBuilderAreCovered() {
        String[] args = {"--spring.main.web-application-type=none"};

        try (MockedStatic<SpringApplication> springApplication = mockStatic(SpringApplication.class)) {
            BookingServiceApplication.main(args);

            springApplication.verify(() -> SpringApplication.run(BookingServiceApplication.class, args));
        }

        WebClient.Builder builder = new BookingServiceApplication().webClientBuilder();
        assertThat(builder).isNotNull();
    }

    @Test
    void rabbitMqAndWebConfigBeansAreCovered() {
        RabbitMQConfig rabbitMQConfig = new RabbitMQConfig();

        Jackson2JsonMessageConverter converter = rabbitMQConfig.messageConverter();
        RabbitTemplate template = rabbitMQConfig.rabbitTemplate(mock(ConnectionFactory.class));

        assertThat(converter).isNotNull();
        assertThat(template.getMessageConverter()).isInstanceOf(Jackson2JsonMessageConverter.class);
        assertThat(new WebConfig()).isNotNull();
    }

    @Test
    void validationPatternAndBookingRequestNestedTypesAreCovered() {
        assertThat(BookingValidationPatterns.PNR).isEqualTo("^[A-Z0-9]{6}$");

        BookingRequest.PassengerValidationRequest passenger =
                new BookingRequest.PassengerValidationRequest(LocalDate.of(1995, 5, 1), BookingRequest.PassengerCategory.ADULT);

        assertThat(passenger.getDateOfBirth()).isEqualTo(LocalDate.of(1995, 5, 1));
        assertThat(passenger.getCategory()).isEqualTo(BookingRequest.PassengerCategory.ADULT);
    }

    @Test
    void bookingEntityCoversLifecycleSeatSerializationAndFareSynchronization() {
        Booking booking = new Booking();
        booking.setPnr("ABC123");
        booking.setUserId(1L);
        booking.setFlightId(2L);
        booking.setNumberOfPassengers(2);
        booking.setBaseFare(new BigDecimal("5000"));
        booking.setTaxes(new BigDecimal("500"));
        booking.setAncillaryCharges(new BigDecimal("250"));

        ReflectionTestUtils.invokeMethod(booking, "onCreate");
        assertThat(booking.getStatus()).isEqualTo(Booking.BookingStatus.PENDING);
        assertThat(booking.getCheckedIn()).isFalse();
        assertThat(booking.getCheckInReminderSent()).isFalse();
        assertThat(booking.getBookingDate()).isNotNull();

        booking.setSelectedSeats(List.of("1A", "1B"));
        assertThat(booking.getSelectedSeats()).containsExactly("1A", "1B");

        ReflectionTestUtils.setField(booking, "selectedSeatsJson", "not-json");
        assertThat(booking.getSelectedSeats()).isEmpty();

        booking.setTotalFare(new BigDecimal("5750"));
        assertThat(booking.getTotalAmount()).isEqualByComparingTo("5750");

        booking.setTotalAmount(new BigDecimal("5800"));
        assertThat(booking.getTotalFare()).isEqualByComparingTo("5800");

        ReflectionTestUtils.invokeMethod(booking, "onUpdate");
        assertThat(booking.getUpdatedAt()).isNotNull();
    }

    @Test
    void pdfTicketGeneratorProducesPdfBytes() throws Exception {
        PdfTicketGenerator generator = new PdfTicketGenerator();
        Booking booking = new Booking();
        booking.setId(10L);
        booking.setPnr("PNR123");
        booking.setNumberOfPassengers(2);
        booking.setBookingDate(LocalDateTime.of(2026, 5, 8, 10, 0));
        booking.setBaseFare(new BigDecimal("10000"));
        booking.setTaxes(new BigDecimal("500"));
        booking.setAncillaryCharges(new BigDecimal("350"));
        booking.setTotalFare(new BigDecimal("10850"));

        byte[] pdf = generator.generateModernTicket(booking, Map.of(
                "departureCode", "DEL",
                "departureCity", "Delhi",
                "arrivalCode", "BOM",
                "arrivalCity", "Mumbai",
                "flightNumber", "SB101",
                "date", "08 May 2026",
                "departureTime", "10:00",
                "arrivalTime", "12:15"
        ));

        assertThat(pdf).isNotEmpty();
        assertThat(new String(pdf, 0, 4, StandardCharsets.ISO_8859_1)).isEqualTo("%PDF");
    }
}
