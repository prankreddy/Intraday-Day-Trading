
import React, { useState, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from './ui/Card';
import { Button } from './ui/Button';
import { getMarketInsights, getTradeStrategy } from '../services/geminiService';
import type { TradeInput } from '../types';
import { Bot, Lightbulb } from './icons';

interface AiAssistantProps {
    tradeInput: TradeInput | null;
}

const MarkdownRenderer: React.FC<{ content: string }> = ({ content }) => {
    // A very basic markdown to HTML converter for this app's needs
    const htmlContent = content
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Bold
        .replace(/\n/g, '<br />'); // Newlines

    return <div dangerouslySetInnerHTML={{ __html: htmlContent }} className="prose prose-sm dark:prose-invert" />;
};


export const AiAssistant: React.FC<AiAssistantProps> = ({ tradeInput }) => {
    const [insights, setInsights] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleFetchInsights = useCallback(async (type: 'market' | 'trade') => {
        setIsLoading(true);
        setError(null);
        setInsights('');

        try {
            let result;
            if (type === 'market') {
                result = await getMarketInsights();
            } else if (tradeInput) {
                result = await getTradeStrategy(tradeInput);
            } else {
                throw new Error("No trade details for strategy analysis.");
            }
            setInsights(result);
        } catch (e: any) {
            setError(e.message || 'Failed to fetch AI insights. The API key might be missing or invalid.');
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    }, [tradeInput]);

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Bot /> AI Assistant</CardTitle>
            </CardHeader>
            <CardContent className="min-h-[150px]">
                {isLoading && <p className="text-center">🧠 Thinking...</p>}
                {error && <p className="text-red-500 text-sm">{error}</p>}
                {insights && <MarkdownRenderer content={insights} />}
                {!isLoading && !error && !insights && (
                    <div className="text-center text-gray-500 flex flex-col items-center gap-2">
                        <Lightbulb />
                        <p>Get AI-powered market insights or a strategy analysis for your current trade simulation.</p>
                    </div>
                )}
            </CardContent>
            <CardFooter className="grid grid-cols-2 gap-2">
                <Button onClick={() => handleFetchInsights('market')} disabled={isLoading}>
                    Market Overview
                </Button>
                <Button onClick={() => handleFetchInsights('trade')} disabled={isLoading || !tradeInput}>
                    Trade Strategy
                </Button>
            </CardFooter>
        </Card>
    );
};
