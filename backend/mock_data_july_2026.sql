-- Insert 5 new source/destination cities into the airports table (Run in airline_airport_db)
INSERT INTO airports (name, iata_code, city, country, description, phone_number, email, is_active, created_at, updated_at) VALUES
('Jaipur International Airport', 'JAI', 'Jaipur', 'India', 'International airport serving Jaipur', '9876543211', 'info@jai.airport', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Sardar Vallabhbhai Patel International Airport', 'AMD', 'Ahmedabad', 'India', 'International airport serving Ahmedabad', '9876543212', 'info@amd.airport', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Goa International Airport', 'GOI', 'Goa', 'India', 'International airport serving Goa', '9876543213', 'info@goi.airport', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Chaudhary Charan Singh International Airport', 'LKO', 'Lucknow', 'India', 'International airport serving Lucknow', '9876543214', 'info@lko.airport', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Trivandrum International Airport', 'TRV', 'Thiruvananthapuram', 'India', 'International airport serving Thiruvananthapuram', '9876543215', 'info@trv.airport', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- =================================================================================================

-- Insert Flights into flights table (Run in flight_db)
-- Note: Assuming the newly inserted airports above got IDs 9, 10, 11, 12, 13
-- And existing airports (DEL, BOM, BLR, HYD, MAA, CCU, COK, PNQ) have IDs 1 to 8

-- ONE-WAY flights
INSERT INTO flights (flight_number, aircraft_type, airline_id, departure_airport_id, arrival_airport_id, departure_time, arrival_time, total_seats, available_seats, base_fare, status, created_at, updated_at) VALUES
('6E401', 'A320', 1, 9, 10, '2026-07-01 08:00:00', '2026-07-01 09:30:00', 180, 180, 4500.00, 'SCHEDULED', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('AI402', 'A320', 2, 10, 11, '2026-07-02 10:00:00', '2026-07-02 11:45:00', 180, 180, 5000.00, 'SCHEDULED', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('QP403', 'B737', 3, 11, 12, '2026-07-03 14:00:00', '2026-07-03 16:10:00', 186, 186, 4800.00, 'SCHEDULED', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('6E404', 'A320', 1, 12, 13, '2026-07-04 09:00:00', '2026-07-04 10:30:00', 180, 180, 4200.00, 'SCHEDULED', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('AI405', 'A321', 2, 13, 9, '2026-07-05 11:00:00', '2026-07-05 13:00:00', 180, 180, 5500.00, 'SCHEDULED', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- ROUND-WAY flights
INSERT INTO flights (flight_number, aircraft_type, airline_id, departure_airport_id, arrival_airport_id, departure_time, arrival_time, total_seats, available_seats, base_fare, status, created_at, updated_at) VALUES
('6E501', 'A320', 1, 1, 2, '2026-07-06 07:00:00', '2026-07-06 09:15:00', 180, 180, 6000.00, 'SCHEDULED', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('6E502', 'A320', 1, 2, 1, '2026-07-10 16:00:00', '2026-07-10 18:15:00', 180, 180, 6000.00, 'SCHEDULED', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('AI503', 'A321', 2, 3, 4, '2026-07-07 08:30:00', '2026-07-07 10:00:00', 180, 180, 4800.00, 'SCHEDULED', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('AI504', 'A321', 2, 4, 3, '2026-07-11 14:00:00', '2026-07-11 15:30:00', 180, 180, 4800.00, 'SCHEDULED', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- MULTI-CITY flights
INSERT INTO flights (flight_number, aircraft_type, airline_id, departure_airport_id, arrival_airport_id, departure_time, arrival_time, total_seats, available_seats, base_fare, status, created_at, updated_at) VALUES
('QP601', 'B737', 3, 5, 6, '2026-07-12 09:00:00', '2026-07-12 11:30:00', 186, 186, 4200.00, 'SCHEDULED', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('QP602', 'B737', 3, 6, 7, '2026-07-14 13:00:00', '2026-07-14 15:00:00', 186, 186, 3800.00, 'SCHEDULED', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('6E603', 'A320', 1, 7, 8, '2026-07-15 10:00:00', '2026-07-15 11:45:00', 180, 180, 3500.00, 'SCHEDULED', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Additional flights for coverage
INSERT INTO flights (flight_number, aircraft_type, airline_id, departure_airport_id, arrival_airport_id, departure_time, arrival_time, total_seats, available_seats, base_fare, status, created_at, updated_at) VALUES
('AI701', 'A321', 2, 9, 2, '2026-07-08 06:30:00', '2026-07-08 08:00:00', 180, 180, 3900.00, 'SCHEDULED', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('QP702', 'B737', 3, 10, 3, '2026-07-09 17:00:00', '2026-07-09 19:15:00', 186, 186, 4100.00, 'SCHEDULED', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('6E703', 'A320', 1, 11, 4, '2026-07-13 12:00:00', '2026-07-13 13:30:00', 180, 180, 4600.00, 'SCHEDULED', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
