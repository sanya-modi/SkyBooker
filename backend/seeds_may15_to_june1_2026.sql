\set ON_ERROR_STOP on

-- =====================================================================
-- SKYBOOKER FLIGHT + SEAT SEEDING (2026-05-15 to 2026-06-01)
-- =====================================================================
-- Purpose:
--   1. Seed dense flight coverage for all currently seeded airports.
--   2. Keep flight rows aligned with backend/frontend fields.
--   3. Model one-way and round-trip availability without changing app logic.
--   4. Seed seat rows as well so flights are searchable and usable in booking flows.
--
-- This script reads the currently active airports and airlines dynamically
-- from airline_airport_db, so it matches the real IDs present at seed time.
--
-- Usage:
--   psql -U postgres -d flight_db -f backend/seeds_may15_to_june1_2026.sql
--
-- Notes:
--   Round-trip is represented the same way your app already works:
--   as separate outbound + return flight rows. There is no trip_type column.
-- =====================================================================

\echo Seeding flights into flight_db...
\connect flight_db

BEGIN;

CREATE EXTENSION IF NOT EXISTS dblink;

WITH airports AS (
    SELECT *
    FROM dblink(
        'dbname=airline_airport_db user=postgres password=postgres',
        $dbq$
            SELECT id, iata_code, city
            FROM airports
            WHERE is_active = true
            ORDER BY id
        $dbq$
    ) AS a(id BIGINT, iata_code TEXT, city TEXT)
),
airlines AS (
    SELECT *
    FROM (
        SELECT
            id,
            iata_code AS airline_code,
            ROW_NUMBER() OVER (ORDER BY id) AS airline_index
        FROM dblink(
            'dbname=airline_airport_db user=postgres password=postgres',
            $dbq$
                SELECT id, iata_code
                FROM airlines
                WHERE is_active = true
                ORDER BY id
            $dbq$
        ) AS al(id BIGINT, iata_code TEXT)
    ) ranked_airlines
),
airline_count AS (
    SELECT COUNT(*) AS cnt
    FROM airlines
),
date_span AS (
    SELECT
        generated_date::date AS flight_date,
        ROW_NUMBER() OVER (ORDER BY generated_date) AS day_index
    FROM generate_series(DATE '2026-05-15', DATE '2026-06-01', INTERVAL '1 day') AS generated_date
),
directed_routes AS (
    SELECT
        dep.id AS departure_airport_id,
        arr.id AS arrival_airport_id,
        dep.iata_code AS departure_iata,
        arr.iata_code AS arrival_iata,
        dep.city AS departure_city,
        arr.city AS arrival_city,
        ROW_NUMBER() OVER (ORDER BY dep.id, arr.id) AS route_index
    FROM airports dep
    CROSS JOIN airports arr
    WHERE dep.id <> arr.id
),
one_way_seed AS (
    SELECT
        'OW' || LPAD((route_index * 100 + day_index)::text, 6, '0') AS flight_number,
        CASE (route_index + day_index) % 5
            WHEN 0 THEN 'A320'
            WHEN 1 THEN 'A321'
            WHEN 2 THEN 'B737'
            WHEN 3 THEN 'B787'
            ELSE 'A320'
        END AS aircraft_type,
        (
            SELECT id
            FROM airlines
            WHERE airline_index = ((route_index + day_index - 1) % (SELECT cnt FROM airline_count)) + 1
        ) AS airline_id,
        departure_airport_id,
        arrival_airport_id,
        (
            flight_date::timestamp
            + make_interval(
                hours => (5 + ((route_index + day_index * 2) % 14))::int,
                mins => (((route_index * 11 + day_index * 7) % 4) * 15)::int
            )
        ) AS departure_time,
        (
            flight_date::timestamp
            + make_interval(
                hours => (5 + ((route_index + day_index * 2) % 14))::int,
                mins => (((route_index * 11 + day_index * 7) % 4) * 15)::int
            )
            + make_interval(mins => (80 + ((departure_airport_id * 13 + arrival_airport_id * 17 + day_index * 5) % 121))::int)
        ) AS arrival_time,
        CASE (route_index + day_index) % 5
            WHEN 3 THEN 260
            WHEN 2 THEN 189
            WHEN 1 THEN 220
            ELSE 180
        END AS total_seats,
        ROUND(
            (
                3200
                + ABS(arrival_airport_id - departure_airport_id) * 375
                + day_index * 35
                + ((route_index % 5) * 140)
            )::numeric,
            2
        ) AS base_fare
    FROM directed_routes
    CROSS JOIN date_span
),
round_trip_pairs AS (
    SELECT
        dep.id AS outbound_airport_id,
        arr.id AS return_airport_id,
        dep.iata_code AS outbound_iata,
        arr.iata_code AS return_iata,
        ROW_NUMBER() OVER (ORDER BY dep.id, arr.id) AS pair_index
    FROM airports dep
    JOIN airports arr ON dep.id < arr.id
),
round_trip_cycles AS (
    SELECT
        pair_index,
        outbound_airport_id,
        return_airport_id,
        outbound_iata,
        return_iata,
        cycle_index,
        (DATE '2026-05-15' + ((cycle_index - 1) * 3)) AS outbound_date,
        (DATE '2026-05-15' + ((cycle_index - 1) * 3) + 1) AS return_date
    FROM round_trip_pairs
    CROSS JOIN generate_series(1, 5) AS cycle_index
),
round_trip_seed AS (
    SELECT
        'RT' || LPAD((pair_index * 100 + cycle_index * 2 - 1)::text, 6, '0') AS flight_number,
        CASE (pair_index + cycle_index) % 4
            WHEN 0 THEN 'A320'
            WHEN 1 THEN 'A321'
            WHEN 2 THEN 'B737'
            ELSE 'B787'
        END AS aircraft_type,
        (
            SELECT id
            FROM airlines
            WHERE airline_index = ((pair_index + cycle_index - 1) % (SELECT cnt FROM airline_count)) + 1
        ) AS airline_id,
        outbound_airport_id AS departure_airport_id,
        return_airport_id AS arrival_airport_id,
        (
            outbound_date::timestamp
            + make_interval(
                hours => (6 + ((pair_index + cycle_index) % 10))::int,
                mins => (((pair_index * 13 + cycle_index * 5) % 4) * 15)::int
            )
        ) AS departure_time,
        (
            outbound_date::timestamp
            + make_interval(
                hours => (6 + ((pair_index + cycle_index) % 10))::int,
                mins => (((pair_index * 13 + cycle_index * 5) % 4) * 15)::int
            )
            + make_interval(mins => (95 + ((outbound_airport_id * 19 + return_airport_id * 11 + cycle_index * 7) % 96))::int)
        ) AS arrival_time,
        CASE (pair_index + cycle_index) % 4
            WHEN 3 THEN 260
            WHEN 2 THEN 189
            WHEN 1 THEN 220
            ELSE 180
        END AS total_seats,
        ROUND(
            (
                4200
                + ABS(return_airport_id - outbound_airport_id) * 425
                + cycle_index * 120
                + ((pair_index % 5) * 160)
            )::numeric,
            2
        ) AS base_fare
    FROM round_trip_cycles

    UNION ALL

    SELECT
        'RT' || LPAD((pair_index * 100 + cycle_index * 2)::text, 6, '0') AS flight_number,
        CASE (pair_index + cycle_index) % 4
            WHEN 0 THEN 'A320'
            WHEN 1 THEN 'A321'
            WHEN 2 THEN 'B737'
            ELSE 'B787'
        END AS aircraft_type,
        (
            SELECT id
            FROM airlines
            WHERE airline_index = ((pair_index + cycle_index - 1) % (SELECT cnt FROM airline_count)) + 1
        ) AS airline_id,
        return_airport_id AS departure_airport_id,
        outbound_airport_id AS arrival_airport_id,
        (
            return_date::timestamp
            + make_interval(
                hours => (7 + ((pair_index + cycle_index) % 10))::int,
                mins => (((pair_index * 17 + cycle_index * 3) % 4) * 15)::int
            )
        ) AS departure_time,
        (
            return_date::timestamp
            + make_interval(
                hours => (7 + ((pair_index + cycle_index) % 10))::int,
                mins => (((pair_index * 17 + cycle_index * 3) % 4) * 15)::int
            )
            + make_interval(mins => (95 + ((outbound_airport_id * 19 + return_airport_id * 11 + cycle_index * 7) % 96))::int)
        ) AS arrival_time,
        CASE (pair_index + cycle_index) % 4
            WHEN 3 THEN 260
            WHEN 2 THEN 189
            WHEN 1 THEN 220
            ELSE 180
        END AS total_seats,
        ROUND(
            (
                4200
                + ABS(return_airport_id - outbound_airport_id) * 425
                + cycle_index * 120
                + ((pair_index % 5) * 160)
            )::numeric,
            2
        ) AS base_fare
    FROM round_trip_cycles
),
combined_seed AS (
    SELECT * FROM one_way_seed
    UNION ALL
    SELECT * FROM round_trip_seed
)
INSERT INTO flights (
    flight_number,
    aircraft_type,
    airline_id,
    departure_airport_id,
    arrival_airport_id,
    departure_time,
    arrival_time,
    total_seats,
    available_seats,
    base_fare,
    status,
    created_at,
    updated_at
)
SELECT
    flight_number,
    aircraft_type,
    airline_id,
    departure_airport_id,
    arrival_airport_id,
    departure_time,
    arrival_time,
    total_seats,
    total_seats AS available_seats,
    base_fare,
    'ON_TIME',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM combined_seed
ON CONFLICT (flight_number) DO NOTHING;

COMMIT;

\echo Seeding seats into seat_db...
\connect seat_db

BEGIN;

CREATE EXTENSION IF NOT EXISTS dblink;

WITH seeded_flights AS (
    SELECT *
    FROM dblink(
        'dbname=flight_db user=postgres password=postgres',
        $dbq$
            SELECT id, total_seats
            FROM flights
            WHERE flight_number LIKE 'OW%'
               OR flight_number LIKE 'RT%'
        $dbq$
    ) AS f(id BIGINT, total_seats INTEGER)
),
seat_positions AS (
    SELECT
        sf.id AS flight_id,
        gs AS seat_index,
        ((gs - 1) / 6) + 1 AS row_number,
        CHR(65 + ((gs - 1) % 6)) AS seat_letter
    FROM seeded_flights sf
    CROSS JOIN LATERAL generate_series(1, sf.total_seats) AS gs
),
generated_seats AS (
    SELECT
        flight_id,
        row_number::text || seat_letter AS seat_number,
        'ECONOMY' AS seat_class,
        'AVAILABLE' AS status
    FROM seat_positions
)
INSERT INTO seats (
    flight_id,
    seat_number,
    seat_class,
    status,
    passenger_id,
    booking_id,
    hold_expires_at,
    created_at,
    updated_at
)
SELECT
    flight_id,
    seat_number,
    seat_class,
    status,
    NULL,
    NULL,
    NULL,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM generated_seats
ON CONFLICT (flight_id, seat_number) DO NOTHING;

COMMIT;

\echo Seed complete.
\echo Verification examples:
\echo   SELECT COUNT(*) FROM flights WHERE departure_time::date BETWEEN DATE '2026-05-15' AND DATE '2026-06-01';
\echo   SELECT departure_airport_id, arrival_airport_id, COUNT(*) FROM flights GROUP BY 1,2 ORDER BY 1,2;
\echo   SELECT COUNT(*) FROM seats WHERE flight_id IN (SELECT id FROM dblink('dbname=flight_db user=postgres password=postgres', 'SELECT id FROM flights WHERE flight_number LIKE ''OW%%'' OR flight_number LIKE ''RT%%''') AS f(id BIGINT));
