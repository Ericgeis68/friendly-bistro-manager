-- Create a table for floor plans
CREATE TABLE IF NOT EXISTS public.floor_plans (
  id TEXT NOT NULL PRIMARY KEY,
  name TEXT NOT NULL,
  room_size JSONB NOT NULL DEFAULT '{"width": 800, "height": 600}'::jsonb,
  elements JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security (RLS)
ALTER TABLE public.floor_plans ENABLE ROW LEVEL SECURITY;

-- Create policy that allows all operations (since this is for restaurant management)
CREATE POLICY "Allow all operations on floor_plans" 
  ON public.floor_plans 
  FOR ALL 
  USING (true)
  WITH CHECK (true);

-- Create trigger to update updated_at
CREATE TRIGGER update_floor_plans_updated_at
  BEFORE UPDATE ON public.floor_plans
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
