package com.skyBooker.seat.repository;

import com.skyBooker.seat.entity.SeatClassConfig;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SeatClassConfigRepository extends JpaRepository<SeatClassConfig, Long> {
    List<SeatClassConfig> findByFlightIdOrderByStartRowAsc(Long flightId);
    void deleteByFlightId(Long flightId);
}
