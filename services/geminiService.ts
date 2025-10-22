import { GoogleGenAI } from "@google/genai";
import type { TradeInput } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.warn("API_KEY environment variable not set. AI features will be disabled.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const generateContentWithGuard = async (prompt: string) => {
  if (!API_KEY) {
    throw new Error("API key is not configured. Cannot call AI service.");
  }
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
  });
  return response.text;
};

export const getMarketInsights = async (): Promise<string> => {
  const prompt = `
    As an expert intraday trading analyst for the Indian market (NSE), provide a concise market overview.
    1.  **Market Trend:** What is the current NIFTY 50 trend (e.g., bullish, bearish, sideways) based on today's early trading?
    2.  **Top 3 Momentum Stocks:** Suggest three NIFTY 50 stocks showing strong intraday momentum (either up or down). For each, provide the stock name, a brief rationale (e.g., "breaking key resistance", "high volume sell-off"), and a potential direction.
    3.  **Key Sector:** Mention one sector that is particularly active today.

    Format your response as clean markdown.
  `;
  return generateContentWithGuard(prompt);
};

export const getTradeStrategy = async (tradeInput: TradeInput): Promise<string> => {
  const { stock, tradeType, entryPrice, quantity, expectedDirection, stopLossPercentage, targetPricePercentage } = tradeInput;
  
  const customLevels = `
- **My Custom Stop-Loss:** ${stopLossPercentage ? `${stopLossPercentage}%` : 'Not set (using default 3%)'}
- **My Custom Target Price:** ${targetPricePercentage ? `${targetPricePercentage}%` : 'Not set (using default 10%)'}
  `;
  
  const prompt = `
    I am planning an intraday trade in the Indian market. Here are the details:
    - **Stock:** ${stock}
    - **Trade Type:** ${tradeType}
    - **Entry Price:** ₹${entryPrice}
    - **Quantity:** ${quantity} shares
    - **My Expected Direction:** ${expectedDirection}
    ${customLevels}
    - **My Personal Strategy:** I prefer to exit by 1:00 PM IST if the trade is still open, unless my stop-loss or target is hit first.

    Based on this, provide a concise, actionable trading strategy covering these points:
    1.  **Initial Strategy:** Given my parameters, is this a sound entry? Provide a brief confirmation or a word of caution, especially considering my custom stop-loss/target if provided.
    2.  **Risk Management:** Analyze my stop-loss (custom or default). Is it appropriate for this stock's volatility today? Suggest an adjustment if necessary.
    3.  **Exit Strategy:** Incorporate my 1:00 PM IST exit rule and my target price. Recommend any other condition-based exits to consider.
    4.  **Confidence Score:** Provide a confidence score (out of 10) for this trade's success based on my strategy and custom levels.

    Keep the advice practical for a retail intraday trader. Format as clean markdown.
  `;
  return generateContentWithGuard(prompt);
};