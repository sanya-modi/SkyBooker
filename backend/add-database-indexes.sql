\set ON_ERROR_STOP on

-- =====================================================================
-- SKYBOOKER DATABASE INDEXING SCRIPT
-- =====================================================================
-- Purpose: Add critical indexes to improve query performance
-- =====================================================================

\echo Adding indexes to flight_db...
\connect flight_db

BEGIN;

-- Flight table indexes
CREATE INDEX IF NOT EXISTS idx_flights_departure_airport ON flights(departure_airport_id);
CREATE INDEX IF NOT EXISTS idx_flights_arrival_airport ON flights(arrival_airport_id);
CREATE INDEX IF NOT EXISTS idx_flights_airline ON flights(airline_id);
CREATE INDEX IF NOT EXISTS idx_flights_departure_time ON flights(departure_time);
CREATE INDEX IF NOT EXISTS idx_flights_status ON flights(status);
CREATE INDEX IF NOT EXISTS idx_flights_route_date ON flights(departure_airport_id, arrival_airport_id, departure_time);

COMMIT;

\echo Adding indexes to seat_db...
\connect seat_db

BEGIN;

-- Seat table indexes
CREATE INDEX IF NOT EXISTS idx_seats_flight ON seats(flight_id);
CREATE INDEX IF NOT EXISTS idx_seats_status ON seats(status);
CREATE INDEX IF NOT EXISTS idx_seats_flight_status ON seats(flight_id, status);
CREATE INDEX IF NOT EXISTS idx_seats_booking ON seats(booking_id);
CREATE INDEX IF NOT EXISTS idx_seats_passenger ON seats(passenger_id);

COMMIT;

\echo Indexes created successfully.
