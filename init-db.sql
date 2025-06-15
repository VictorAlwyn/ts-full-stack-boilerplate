-- Initialize the database with required extensions and basic setup
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create the public schema if it doesn't exist (though it should by default)
CREATE SCHEMA IF NOT EXISTS public;

-- Grant permissions
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;

-- Create a comment for documentation
COMMENT ON DATABASE turbo_fullstack IS 'Turbo Full Stack Application Database'; 