ALTER TABLE public.glucose_readings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ALLOW_SELECT_OWN_DATA"
ON public.glucose_readings
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "ALLOW_INSERT_OWN_DATA"
ON public.glucose_readings
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "ALLOW_UPDATE_OWN_DATA"
ON public.glucose_readings
FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "ALLOW_DELETE_OWN_DATA"
ON public.glucose_readings
FOR DELETE
TO authenticated
USING (user_id = auth.uid());