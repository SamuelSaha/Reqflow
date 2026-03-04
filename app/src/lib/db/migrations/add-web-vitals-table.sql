-- Migration: Add web_vitals table for Core Web Vitals monitoring
-- Created: 2026-03-04
-- Related to Issue #133: Establish Web Vitals baseline and monitoring

-- Create web_vitals table
CREATE TABLE IF NOT EXISTS web_vitals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Metric details
  metric_name TEXT NOT NULL,
  value DOUBLE PRECISION NOT NULL,
  rating TEXT NOT NULL,
  delta DOUBLE PRECISION,
  metric_id TEXT NOT NULL,

  -- Navigation context
  navigation_type TEXT,

  -- Page context
  url TEXT NOT NULL,
  page TEXT NOT NULL,

  -- User context
  user_agent TEXT NOT NULL,
  ip TEXT,

  -- Timestamps
  captured_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create indexes for efficient queries

-- Time-series queries (most common query pattern)
CREATE INDEX IF NOT EXISTS idx_web_vitals_captured_at ON web_vitals(captured_at DESC);

-- Filtering by metric type
CREATE INDEX IF NOT EXISTS idx_web_vitals_metric_name ON web_vitals(metric_name);

-- Page-specific analysis
CREATE INDEX IF NOT EXISTS idx_web_vitals_page_metric ON web_vitals(page, metric_name);

-- Filtering by rating (to find poor performers)
CREATE INDEX IF NOT EXISTS idx_web_vitals_rating ON web_vitals(rating);

-- Time-based page analysis
CREATE INDEX IF NOT EXISTS idx_web_vitals_page_captured ON web_vitals(page, captured_at DESC);

-- Add comments for documentation
COMMENT ON TABLE web_vitals IS 'Core Web Vitals performance metrics (CLS, FCP, LCP, TTFB, INP) for monitoring and analysis';
COMMENT ON COLUMN web_vitals.metric_name IS 'Metric type: CLS, FCP, LCP, TTFB, or INP';
COMMENT ON COLUMN web_vitals.value IS 'Metric value in milliseconds (or unitless for CLS)';
COMMENT ON COLUMN web_vitals.rating IS 'Performance rating: good, needs-improvement, or poor';
COMMENT ON COLUMN web_vitals.delta IS 'Change since last measurement';
COMMENT ON COLUMN web_vitals.metric_id IS 'Unique ID from web-vitals library for deduplication';
COMMENT ON COLUMN web_vitals.navigation_type IS 'Navigation type: navigate, reload, back-forward, or prerender';
COMMENT ON COLUMN web_vitals.page IS 'Page pathname (e.g., /, /pricing) for aggregation';
COMMENT ON COLUMN web_vitals.captured_at IS 'Timestamp when metric was captured in browser';
COMMENT ON COLUMN web_vitals.created_at IS 'Timestamp when record was inserted into database';
