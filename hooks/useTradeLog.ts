
import { useState, useEffect, useCallback } from 'react';
import type { Trade } from '../types';

const STORAGE_KEY = 'tradeLog';

export const useTradeLog = () => {
    const [log, setLog] = useState<Trade[]>([]);

    useEffect(() => {
        try {
            const items = window.localStorage.getItem(STORAGE_KEY);
            if (items) {
                setLog(JSON.parse(items));
            }
        } catch (error) {
            console.error('Error reading trade log from localStorage', error);
        }
    }, []);

    const addLog = useCallback((trade: Trade) => {
        setLog(prevLog => {
            const newLog = [...prevLog, trade];
            try {
                window.localStorage.setItem(STORAGE_KEY, JSON.stringify(newLog));
            } catch (error) {
                console.error('Error saving trade log to localStorage', error);
            }
            return newLog;
        });
    }, []);

    const clearLog = useCallback(() => {
        setLog([]);
        try {
            window.localStorage.removeItem(STORAGE_KEY);
        } catch (error) {
            console.error('Error clearing trade log from localStorage', error);
        }
    }, []);

    return { log, addLog, clearLog };
};
