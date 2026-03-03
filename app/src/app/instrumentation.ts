/**
 * Next.js Instrumentation
 * Runs on both server and client for performance monitoring
 * https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 */

export async function register() {
  // Client-side Web Vitals tracking
  if (typeof window !== 'undefined') {
    // Dynamic import to avoid bundling on server
    const { onCLS, onFCP, onLCP, onTTFB, onINP } = await import('web-vitals');

    /**
     * Send Web Vitals to analytics endpoint
     * Batches metrics to reduce network requests
     */
    function sendToAnalytics(metric: {
      name: string;
      value: number;
      rating: string;
      delta: number;
      id: string;
      navigationType: string;
    }) {
      const body = JSON.stringify({
        name: metric.name,
        value: metric.value,
        rating: metric.rating,
        delta: metric.delta,
        id: metric.id,
        navigationType: metric.navigationType,
        // Context
        url: window.location.href,
        userAgent: navigator.userAgent,
        timestamp: Date.now(),
      });

      // Use sendBeacon if available (works even if page is unloading)
      if (navigator.sendBeacon) {
        navigator.sendBeacon('/api/analytics/vitals', body);
      } else {
        // Fallback to fetch
        fetch('/api/analytics/vitals', {
          method: 'POST',
          body,
          headers: { 'Content-Type': 'application/json' },
          keepalive: true, // Keep request alive if page unloads
        }).catch(() => {
          // Silent fail - don't break user experience
          // Metrics are best-effort, no logging needed
        });
      }
    }

    // Track all Core Web Vitals
    onCLS(sendToAnalytics);   // Cumulative Layout Shift
    onFCP(sendToAnalytics);   // First Contentful Paint
    onLCP(sendToAnalytics);   // Largest Contentful Paint
    onTTFB(sendToAnalytics);  // Time to First Byte
    onINP(sendToAnalytics);   // Interaction to Next Paint
  }
}
