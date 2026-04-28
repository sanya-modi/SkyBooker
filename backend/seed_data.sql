-- Run this script in the airline_airport_db
-- Insert Airlines
INSERT INTO airlines (name, iata_code, description, phone_number, email, is_active) VALUES
('IndiGo', '6E', 'India''s largest low-cost carrier', '9876543210', 'support@goindigo.in', true),
('Air India', 'AI', 'Full-service international carrier', '9876543211', 'contact@airindia.com', true),
('Akasa Air', 'QP', 'Fast-growing domestic airline', '9876543212', 'hello@akasaair.com', true);

-- Insert Airports
INSERT INTO airports (name, iata_code, city, country, description, phone_number, email, is_active) VALUES
('Indira Gandhi International Airport', 'DEL', 'Delhi', 'India', 'Primary airport serving New Delhi', '9876543201', 'info@del.airport', true),
('Chhatrapati Shivaji Maharaj International Airport', 'BOM', 'Mumbai', 'India', 'Major hub serving Mumbai', '9876543202', 'info@bom.airport', true),
('Kempegowda International Airport', 'BLR', 'Bengaluru', 'India', 'International airport serving Bengaluru', '9876543203', 'info@blr.airport', true),
('Rajiv Gandhi International Airport', 'HYD', 'Hyderabad', 'India', 'International airport serving Hyderabad', '9876543204', 'info@hyd.airport', true),
('Chennai International Airport', 'MAA', 'Chennai', 'India', 'International airport serving Chennai', '9876543205', 'info@maa.airport', true),
('Netaji Subhas Chandra Bose International Airport', 'CCU', 'Kolkata', 'India', 'International airport serving Kolkata', '9876543206', 'info@ccu.airport', true),
('Cochin International Airport', 'COK', 'Kochi', 'India', 'International airport serving Kochi', '9876543207', 'info@cok.airport', true),
('Pune Airport', 'PNQ', 'Pune', 'India', 'Domestic and limited international airport serving Pune', '9876543208', 'info@pnq.airport', true);

-- =================================================================================================
-- Run this script in the flight_db
-- Insert Flights (Modify dates as needed, default is set to future dates for testing)
INSERT INTO flights (flight_number, aircraft_type, airline_id, departure_airport_id, arrival_airport_id, departure_time, arrival_time, total_seats, available_seats, base_fare, status) VALUES
('6E201', 'A320', 1, 1, 2, CURRENT_DATE + INTERVAL '1 day' + TIME '06:30:00', CURRENT_DATE + INTERVAL '1 day' + TIME '08:45:00', 180, 180, 5200.00, 'ON_TIME'),
('AI204', 'A320', 2, 1, 2, CURRENT_DATE + INTERVAL '1 day' + TIME '10:00:00', CURRENT_DATE + INTERVAL '1 day' + TIME '12:10:00', 180, 180, 5700.00, 'ON_TIME'),
('QP206', 'B737', 3, 1, 2, CURRENT_DATE + INTERVAL '1 day' + TIME '18:20:00', CURRENT_DATE + INTERVAL '1 day' + TIME '20:35:00', 186, 186, 4950.00, 'ON_TIME'),
('AI302', 'A321', 2, 2, 1, CURRENT_DATE + INTERVAL '1 day' + TIME '09:15:00', CURRENT_DATE + INTERVAL '1 day' + TIME '11:30:00', 180, 180, 5600.00, 'ON_TIME'),
('6E304', 'A321', 1, 2, 1, CURRENT_DATE + INTERVAL '1 day' + TIME '14:10:00', CURRENT_DATE + INTERVAL '1 day' + TIME '16:20:00', 180, 180, 5100.00, 'ON_TIME'),
('QP306', 'B737', 3, 2, 1, CURRENT_DATE + INTERVAL '1 day' + TIME '20:25:00', CURRENT_DATE + INTERVAL '1 day' + TIME '22:35:00', 186, 186, 4850.00, 'ON_TIME');
