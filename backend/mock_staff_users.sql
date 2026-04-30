-- Mock Airline Staff Users
-- Run this in auth_db
-- Password for all staff: Staff@123
-- BCrypt hash of Staff@123
-- $2a$10$8zCzC0qoYjlUv8YfRjb45OHhtvLLxqOT7xGJOwGxN0vQRjDAHYvKm

INSERT INTO users (first_name, last_name, email, password, phone_number, airline_id, auth_provider, role, is_active, created_at, updated_at) VALUES
('Rahul',   'Sharma',  'rahul.sharma@goindigo.in',   '$2a$10$8zCzC0qoYjlUv8YfRjb45OHhtvLLxqOT7xGJOwGxN0vQRjDAHYvKm', '9811001001', 1, 'LOCAL', 'AIRLINE_STAFF', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Priya',   'Mehta',   'priya.mehta@goindigo.in',    '$2a$10$8zCzC0qoYjlUv8YfRjb45OHhtvLLxqOT7xGJOwGxN0vQRjDAHYvKm', '9811001002', 1, 'LOCAL', 'AIRLINE_STAFF', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Arjun',   'Nair',    'arjun.nair@airindia.com',    '$2a$10$8zCzC0qoYjlUv8YfRjb45OHhtvLLxqOT7xGJOwGxN0vQRjDAHYvKm', '9822002001', 2, 'LOCAL', 'AIRLINE_STAFF', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Sneha',   'Iyer',    'sneha.iyer@airindia.com',    '$2a$10$8zCzC0qoYjlUv8YfRjb45OHhtvLLxqOT7xGJOwGxN0vQRjDAHYvKm', '9822002002', 2, 'LOCAL', 'AIRLINE_STAFF', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Vikram',  'Patel',   'vikram.patel@akasaair.com',  '$2a$10$8zCzC0qoYjlUv8YfRjb45OHhtvLLxqOT7xGJOwGxN0vQRjDAHYvKm', '9833003001', 3, 'LOCAL', 'AIRLINE_STAFF', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Ananya',  'Reddy',   'ananya.reddy@akasaair.com',  '$2a$10$8zCzC0qoYjlUv8YfRjb45OHhtvLLxqOT7xGJOwGxN0vQRjDAHYvKm', '9833003002', 3, 'LOCAL', 'AIRLINE_STAFF', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
