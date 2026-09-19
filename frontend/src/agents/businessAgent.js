/**
 * SevaSetu – Business Agent
 *
 * Top-level agent that dispatches merchant questions to the AI service.
 * Both the text chat interface and the voice assistant route through here.
 * This ensures a single source of truth for all AI responses.
 *
 * To connect a real AI API: update processQuery() in aiService.js.
 */

import { processQuery } from "../services/aiService.js";

/**
 * Answer a merchant's question using the available business data.
 * @param {string} query        - The merchant's question
 * @param {string} selectedYear - The selected financial year
 * @returns {{ text: string, data?: object }}
 */
export function answerQuery(query, selectedYear = "FY 2025-26") {
  if (!query || !query.trim()) {
    return {
      text: "Please ask me something about your business! For example: 'What were my total sales?' or 'Which month was my best?'",
    };
  }

  // Route through the AI service (single source of truth for both text + voice)
  return processQuery(query.trim(), selectedYear);
}
