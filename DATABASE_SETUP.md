-- This SQL command creates the table required to store pool readings in your Neon (PostgreSQL) database.
-- Run this command in the SQL Editor in your Neon project console.

CREATE TABLE readings (
  id SERIAL PRIMARY KEY,
  resort_name VARCHAR(255) NOT NULL,
  reading_date DATE NOT NULL,
  data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(resort_name, reading_date) -- Ensures only one entry per resort per day
);

-- Optional: Create a function to automatically update the 'updated_at' timestamp
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Optional: Create a trigger to call the function when a row is updated
CREATE TRIGGER set_timestamp
BEFORE UPDATE ON readings
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();
