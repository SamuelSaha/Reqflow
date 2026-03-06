/**
 * Analytics Hook - Track CTA clicks and conversion events
 * Supports Google Analytics (gtag), Plausible, and custom trackers
 */

"use client";

import { useCallback } from "react";

interface AnalyticsEvent {
  category: string;
  action: string;
  label?: string;
  value?: number;
}

declare global {
  interface Window {
    gtag?: (
      command: string,
      eventName: string,
      params: Record<string, unknown>
    ) => void;
    plausible?: (eventName: string, options?: { props: Record<string, unknown> }) => void;
  }
}

export function useAnalytics() {
  /**
   * Track a generic event
   */
  const trackEvent = useCallback((event: AnalyticsEvent) => {
    // Google Analytics (gtag)
    if (typeof window !== "undefined" && window.gtag) {
      window.gtag("event", event.action, {
        event_category: event.category,
        event_label: event.label,
        value: event.value,
      });
    }

    // Plausible Analytics
    if (typeof window !== "undefined" && window.plausible) {
      window.plausible(event.action, {
        props: {
          category: event.category,
          label: event.label,
          value: event.value,
        },
      });
    }

    // Log in development
    if (process.env.NODE_ENV === "development") {
      console.debug("[Analytics]", event);
    }
  }, []);

  /**
   * Track CTA clicks
   */
  const trackCtaClick = useCallback(
    (ctaType: "primary" | "secondary" | "tertiary", label: string, location: string) => {
      trackEvent({
        category: "CTA",
        action: `cta_${ctaType}_click`,
        label: `${label} - ${location}`,
      });
    },
    [trackEvent]
  );

  /**
   * Track form submissions
   */
  const trackFormSubmission = useCallback(
    (formName: string, success: boolean) => {
      trackEvent({
        category: "Form",
        action: success ? "form_submit_success" : "form_submit_error",
        label: formName,
      });
    },
    [trackEvent]
  );

  /**
   * Track page section views (scroll-based)
   */
  const trackSectionView = useCallback(
    (sectionName: string) => {
      trackEvent({
        category: "Engagement",
        action: "section_view",
        label: sectionName,
      });
    },
    [trackEvent]
  );

  /**
   * Track demo/video plays
   */
  const trackVideoPlay = useCallback(
    (videoName: string) => {
      trackEvent({
        category: "Engagement",
        action: "video_play",
        label: videoName,
      });
    },
    [trackEvent]
  );

  /**
   * Track pricing tier selection
   */
  const trackPricingTierClick = useCallback(
    (tierName: string, action: "view_details" | "select") => {
      trackEvent({
        category: "Pricing",
        action: `pricing_${action}`,
        label: tierName,
      });
    },
    [trackEvent]
  );

  return {
    trackEvent,
    trackCtaClick,
    trackFormSubmission,
    trackSectionView,
    trackVideoPlay,
    trackPricingTierClick,
  };
}
