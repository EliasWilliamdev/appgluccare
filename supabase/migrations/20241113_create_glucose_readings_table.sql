-- Create glucose_readings table for GlucCare application
-- This table stores user's glucose measurements with proper foreign key relationship to auth.users

CREATE TABLE IF NOT EXISTS public.glucose_readings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    value INTEGER NOT NULL CHECK (value > 0),
    recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index for better query performance on user_id and recorded_at
CREATE INDEX IF NOT EXISTS idx_glucose_readings_user_id ON public.glucose_readings(user_id);
CREATE INDEX IF NOT EXISTS idx_glucose_readings_recorded_at ON public.glucose_readings(recorded_at DESC);

-- Create a composite index for efficient querying by user and date
CREATE INDEX IF NOT EXISTS idx_glucose_readings_user_recorded ON public.glucose_readings(user_id, recorded_at DESC);