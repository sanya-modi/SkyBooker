-- SQL Script to Fix Seats for Cancelled Bookings
-- Run this script to manually release seats that are stuck in BOOKED status for cancelled bookings

-- Step 1: Identify seats that need to be released
-- These are seats that belong to cancelled bookings but are still marked as BOOKED
SELECT 
    s.id AS seat_id,
    s.flight_id,
    s.seat_number,
    s.status AS seat_status,
    s.booking_id,
    b.pnr,
    b.status AS booking_status
FROM seats s
INNER JOIN bookings b ON s.booking_id = b.id
WHERE b.status = 'CANCELLED' 
  AND s.status = 'BOOKED';

-- Step 2: Release the seats (update their status to AVAILABLE and clear references)
UPDATE seats s
INNER JOIN bookings b ON s.booking_id = b.id
SET 
    s.status = 'AVAILABLE',
    s.booking_id = NULL,
    s.passenger_id = NULL,
    s.hold_expires_at = NULL,
    s.updated_at = NOW()
WHERE b.status = 'CANCELLED' 
  AND s.status = 'BOOKED';

-- Step 3: Verify the fix
-- This should return 0 rows if the fix was successful
SELECT 
    s.id AS seat_id,
    s.flight_id,
    s.seat_number,
    s.status AS seat_status,
    s.booking_id,
    b.pnr,
    b.status AS booking_status
FROM seats s
INNER JOIN bookings b ON s.booking_id = b.id
WHERE b.status = 'CANCELLED' 
  AND s.status = 'BOOKED';

-- Step 4: Check seat availability for a specific flight
-- Replace {flight_id} with your actual flight ID
-- SELECT 
--     seat_number,
--     seat_class,
--     status,
--     booking_id,
--     passenger_id
-- FROM seats
-- WHERE flight_id = {flight_id}
-- ORDER BY seat_number;
