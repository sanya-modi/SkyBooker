package com.skyBooker.passenger.service;

import com.skyBooker.passenger.dto.remote.RemoteBookingResponse;
import com.skyBooker.passenger.entity.Passenger;
import com.skyBooker.passenger.repository.PassengerRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PassengerServiceImplTest {

    @Mock private PassengerRepository repo;
    @Mock private RestTemplate restTemplate;

    @InjectMocks
    private PassengerServiceImpl service;

    // ================= CREATE =================

    @Test
    void createPassengerSuccess() {
        Passenger p = sample();
        when(repo.save(p)).thenReturn(p);

        Passenger result = service.createPassenger(p);

        assertThat(result).isNotNull();
    }

    @Test
    void createPassengerFutureDobThrows() {
        Passenger p = sample();
        p.setDateOfBirth(LocalDate.now().plusDays(1));

        assertThatThrownBy(() -> service.createPassenger(p))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    void createPassengerChildSuccess() {
        Passenger p = sample();
        p.setCategory(Passenger.Category.CHILD);
        p.setDateOfBirth(LocalDate.now().minusYears(10));
        when(repo.save(p)).thenReturn(p);

        Passenger result = service.createPassenger(p);

        assertThat(result.getCategory()).isEqualTo(Passenger.Category.CHILD);
    }

    @Test
    void createPassengerInfantSuccess() {
        Passenger p = sample();
        p.setCategory(Passenger.Category.INFANT);
        p.setDateOfBirth(LocalDate.now().minusMonths(18));
        when(repo.save(p)).thenReturn(p);

        Passenger result = service.createPassenger(p);

        assertThat(result.getCategory()).isEqualTo(Passenger.Category.INFANT);
    }

    // ================= VALIDATION =================

    @Test
    void validateAdultInvalidAge() {
        Passenger p = sample();
        p.setDateOfBirth(LocalDate.now().minusYears(10));
        p.setCategory(Passenger.Category.ADULT);

        assertThatThrownBy(() -> service.createPassenger(p))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    void validateChildInvalidAge() {
        Passenger p = sample();
        p.setDateOfBirth(LocalDate.now().minusYears(1));
        p.setCategory(Passenger.Category.CHILD);

        assertThatThrownBy(() -> service.createPassenger(p))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    void validateInfantInvalidAge() {
        Passenger p = sample();
        p.setDateOfBirth(LocalDate.now().minusYears(5));
        p.setCategory(Passenger.Category.INFANT);

        assertThatThrownBy(() -> service.createPassenger(p))
                .isInstanceOf(IllegalArgumentException.class);
    }

    // ================= GET =================

    @Test
    void getPassengerByIdSuccess() {
        when(repo.findById(1L)).thenReturn(Optional.of(sample()));

        assertThat(service.getPassengerById(1L)).isNotNull();
    }

    @Test
    void getPassengerByIdThrows() {
        when(repo.findById(1L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.getPassengerById(1L))
                .isInstanceOf(RuntimeException.class);
    }

    @Test
    void getPassengersByBookingId() {
        when(repo.findByBookingId(4L)).thenReturn(List.of(sample()));

        assertThat(service.getPassengersByBookingId(4L)).hasSize(1);
    }

    @Test
    void getPassengerByPassportSuccess() {
        when(repo.findByPassportNumber("P123")).thenReturn(sample());

        assertThat(service.getPassengerByPassportNumber("P123")).isNotNull();
    }

    @Test
    void getPassengerByPassportThrows() {
        when(repo.findByPassportNumber("X")).thenReturn(null);

        assertThatThrownBy(() -> service.getPassengerByPassportNumber("X"))
                .isInstanceOf(RuntimeException.class);
    }

    // ================= UPDATE =================

    @Test
    void updatePassengerPartial() {
        Passenger existing = sample();
        existing.setId(1L);

        Passenger update = new Passenger();
        update.setFirstName("New");

        when(repo.findById(1L)).thenReturn(Optional.of(existing));
        when(repo.save(existing)).thenReturn(existing);

        Passenger result = service.updatePassenger(1L, update);

        assertThat(result.getFirstName()).isEqualTo("New");
    }

    @Test
    void updatePassengerNoChanges() {
        Passenger existing = sample();
        existing.setId(1L);

        when(repo.findById(1L)).thenReturn(Optional.of(existing));
        when(repo.save(existing)).thenReturn(existing);

        Passenger result = service.updatePassenger(1L, new Passenger());

        assertThat(result).isNotNull();
    }

    @Test
    void updatePassengerAllFields() {
        Passenger existing = sample();
        Passenger update = new Passenger();
        update.setFirstName("Jane");
        update.setLastName("Smith");
        update.setEmail("jane@example.com");
        update.setPhoneNumber("9876543210");
        update.setSpecialRequests("Window seat");
        update.setDateOfBirth(LocalDate.now().minusYears(8));
        update.setCategory(Passenger.Category.CHILD);
        update.setGender(Passenger.Gender.FEMALE);
        update.setPassportNumber("ABCD1234");
        update.setNationality("Indian");

        when(repo.findById(1L)).thenReturn(Optional.of(existing));
        when(repo.save(existing)).thenReturn(existing);

        Passenger result = service.updatePassenger(1L, update);

        assertThat(result.getFirstName()).isEqualTo("Jane");
        assertThat(result.getLastName()).isEqualTo("Smith");
        assertThat(result.getEmail()).isEqualTo("jane@example.com");
        assertThat(result.getPhoneNumber()).isEqualTo("9876543210");
        assertThat(result.getSpecialRequests()).isEqualTo("Window seat");
        assertThat(result.getDateOfBirth()).isEqualTo(update.getDateOfBirth());
        assertThat(result.getCategory()).isEqualTo(Passenger.Category.CHILD);
        assertThat(result.getGender()).isEqualTo(Passenger.Gender.FEMALE);
        assertThat(result.getPassportNumber()).isEqualTo("ABCD1234");
        assertThat(result.getNationality()).isEqualTo("Indian");
    }

    // ================= DELETE =================

    @Test
    void deletePassenger() {
        service.deletePassenger(1L);

        verify(repo).deleteById(1L);
    }

    // ================= BLOCK =================

    @Test
    void blockPassengerSuccess() {
        Passenger p = sample();
        p.setId(1L);

        RemoteBookingResponse booking = new RemoteBookingResponse();
        booking.setUserId(99L);

        ReflectionTestUtils.setField(service, "bookingServiceBaseUrl", "http://booking");
        ReflectionTestUtils.setField(service, "authServiceBaseUrl", "http://auth");

        when(repo.findById(1L)).thenReturn(Optional.of(p));
        when(restTemplate.getForObject(anyString(), eq(RemoteBookingResponse.class)))
                .thenReturn(booking);

        service.blockPassenger(1L);

        verify(restTemplate).delete("http://auth/auth/users/99");
    }

    @Test
    void blockPassengerThrowsWhenBookingInvalid() {
        Passenger p = sample();

        ReflectionTestUtils.setField(service, "bookingServiceBaseUrl", "http://booking");

        when(repo.findById(1L)).thenReturn(Optional.of(p));
        when(restTemplate.getForObject(anyString(), eq(RemoteBookingResponse.class)))
                .thenReturn(null);

        assertThatThrownBy(() -> service.blockPassenger(1L))
                .isInstanceOf(RuntimeException.class);
    }

    @Test
    void blockPassengerThrowsWhenBookingUserIdMissing() {
        Passenger p = sample();
        RemoteBookingResponse booking = new RemoteBookingResponse();

        ReflectionTestUtils.setField(service, "bookingServiceBaseUrl", "http://booking");

        when(repo.findById(1L)).thenReturn(Optional.of(p));
        when(restTemplate.getForObject(anyString(), eq(RemoteBookingResponse.class)))
                .thenReturn(booking);

        assertThatThrownBy(() -> service.blockPassenger(1L))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("Booking user not found");
    }

    // ================= HELPER =================

    private Passenger sample() {
        Passenger p = new Passenger();
        p.setId(1L);
        p.setBookingId(4L);
        p.setFirstName("John");
        p.setLastName("Doe");
        p.setPassportNumber("P123");
        p.setDateOfBirth(LocalDate.now().minusYears(25));
        p.setCategory(Passenger.Category.ADULT);
        p.setGender(Passenger.Gender.MALE);
        p.setNationality("Indian");
        return p;
    }
}
