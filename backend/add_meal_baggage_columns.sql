-- Add meal and baggage columns to passengers table
ALTER TABLE passengers 
ADD COLUMN IF NOT EXISTS meal_preference VARCHAR(50),
ADD COLUMN IF NOT EXISTS meal_price DECIMAL(10,2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS baggage_preference VARCHAR(50),
ADD COLUMN IF NOT EXISTS baggage_price DECIMAL(10,2) DEFAULT 0.00;
