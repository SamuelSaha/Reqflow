/**
 * Slack Command Parser
 * Extracts structured request data from natural language text
 */

export interface ParsedRequest {
  intent: "modal" | "quick";
  category?: string;
  amount?: string;
  title?: string;
  vendorName?: string;
  urgency?: "low" | "normal" | "urgent";
}

/**
 * Parse /request command text into structured data
 * @param text - Command text after "/request "
 * @returns Parsed request data with intent
 */
export function parseRequestCommand(text: string): ParsedRequest {
  const trimmed = text.trim();

  // Empty text → modal flow
  if (!trimmed) {
    return { intent: "modal" };
  }

  // Quick request flow
  const parsed: ParsedRequest = { intent: "quick" };

  // Extract amount (€500, $500, 500EUR, 500, 1250.50)
  const amountMatch = trimmed.match(
    /[€$]?\s*(\d+(?:[.,]\d{1,2})?)\s*(?:EUR|€|USD|\$)?/i
  );
  if (amountMatch) {
    // Normalize decimal separator to period
    parsed.amount = amountMatch[1].replace(",", ".");
  }

  // Extract category keywords
  const categoryMap: Record<string, RegExp> = {
    saas: /\b(saas|software|subscription|license|app|tool|platform)\b/i,
    services: /\b(service|consulting|contractor|freelance|agency|consulting)\b/i,
    office: /\b(office|supplies|furniture|equipment|desk|chair)\b/i,
    travel: /\b(travel|flight|hotel|conference|event|trip|accommodation)\b/i,
    hardware: /\b(hardware|laptop|monitor|phone|device|computer|tablet)\b/i,
  };

  for (const [cat, regex] of Object.entries(categoryMap)) {
    if (regex.test(trimmed)) {
      parsed.category = cat;
      break;
    }
  }

  // Default category if not detected
  if (!parsed.category) {
    parsed.category = "other";
  }

  // Extract vendor name (capitalized words, brand names)
  // Matches: "Figma", "Adobe Photoshop", "Microsoft Teams"
  const vendorMatch = trimmed.match(/\b([A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]+)*)\b/);
  if (vendorMatch) {
    parsed.vendorName = vendorMatch[1];
  }

  // Extract urgency
  if (/\b(urgent|asap|emergency|critical)\b/i.test(trimmed)) {
    parsed.urgency = "urgent";
  } else {
    parsed.urgency = "normal";
  }

  // Build title from remaining text
  let title = trimmed
    // Remove amount patterns
    .replace(/[€$]?\s*\d+(?:[.,]\d{1,2})?\s*(?:EUR|€|USD|\$)?/gi, "")
    // Remove category keywords
    .replace(
      /\b(saas|software|subscription|license|service|office|travel|hardware|urgent|asap)\b/gi,
      ""
    )
    // Remove extra whitespace
    .replace(/\s+/g, " ")
    .trim();

  // Fallback if title too short
  if (title.length < 3) {
    title = `${parsed.category} purchase`;
  }

  // Capitalize first letter
  title = title.charAt(0).toUpperCase() + title.slice(1);

  // Limit length
  parsed.title = title.slice(0, 100);

  return parsed;
}

/**
 * Validate parsed request has minimum required fields
 * @param parsed - Parsed request data
 * @returns Error message if invalid, null if valid
 */
export function validateParsedRequest(parsed: ParsedRequest): string | null {
  if (parsed.intent === "modal") {
    return null; // Modal validates its own fields
  }

  if (!parsed.title || parsed.title.length < 3) {
    return "Title must be at least 3 characters. Try using the full form: /request";
  }

  if (!parsed.amount) {
    return "Amount not detected. Include a price like €500 or use: /request";
  }

  if (!parsed.category) {
    return "Category not detected. Use keywords like 'saas', 'office', etc. or use: /request";
  }

  return null;
}
