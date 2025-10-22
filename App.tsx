
import React, { useState, useCallback, lazy, Suspense } from 'react';
import { TradeInputPanel } from './components/TradeInputPanel';
import { DashboardPanel } from './components/DashboardPanel';
import { useTradeLog } from './hooks/useTradeLog';
import type { TradeInput, Trade, ChargesInput } from './types';
import { useTheme } from './hooks/useTheme';
import { Sun, Moon } from './components/icons';
import { ToastProvider, useToast } from './components/ui/Toast';

const TradeLog = lazy(() => import('./components/TradeLog'));

const LoadingFallback: React.FC = () => (
    <div className="w-full h-full min-h-[200px] flex items-center justify-center bg-white dark:bg-gray-800 rounded-xl shadow-lg">
        <p className="text-gray-500 animate-pulse">Loading Component...</p>
    </div>
);


const AppContent: React.FC = () => {
    const [tradeInput, setTradeInput] = useState<TradeInput | null>(null);
    const [chargesInput, setChargesInput] = useState<ChargesInput | null>(null);
    const [currentMarketPrice, setCurrentMarketPrice] = useState<number | null>(null);
    
    const { theme, toggleTheme } = useTheme();
    const { addToast } = useToast();
    const { log, addLog, clearLog } = useTradeLog();

    const handleSimulationStart = useCallback((data: { tradeDetails: Omit<TradeInput, 'expectedDirection'>, charges: ChargesInput }) => {
        const { tradeDetails, charges } = data;
        const fullInput: TradeInput = {
            ...tradeDetails,
            expectedDirection: tradeDetails.tradeType === 'BUY' ? 'UP' : 'DOWN',
        };
        setTradeInput(fullInput);
        setChargesInput(charges);
        setCurrentMarketPrice(fullInput.entryPrice);
        addToast({ title: 'Simulation Started', message: `Analysis ready for ${fullInput.stock}.`, type: 'info' });
    }, [addToast]);

    const handleLogTrade = useCallback((tradeToLog: Omit<Trade, 'id'>) => {
        addLog({ ...tradeToLog, id: Date.now() });
        addToast({ title: 'Trade Logged', message: `${tradeToLog.stock} trade has been saved.`, type: 'success' });
    }, [addLog, addToast]);

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300 font-sans">
            <header className="bg-white dark:bg-gray-800 shadow-md p-4 flex justify-between items-center">
                <h1 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-white">📈 Intraday Trading Assistant</h1>
                <button
                    onClick={toggleTheme}
                    className="p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                    aria-label="Toggle theme"
                >
                    {theme === 'dark' ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
                </button>
            </header>

            <main className="p-4 lg:p-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-1 flex flex-col gap-6">
                        <TradeInputPanel onSimulate={handleSimulationStart} />
                    </div>
                    <div className="lg:col-span-2 flex flex-col gap-6">
                       <DashboardPanel 
                          tradeInput={tradeInput}
                          chargesInput={chargesInput}
                          currentMarketPrice={currentMarketPrice}
                          setCurrentMarketPrice={setCurrentMarketPrice}
                          onLogTrade={handleLogTrade}
                       />
                    </div>
                </div>
                <div className="mt-6">
                    <Suspense fallback={<LoadingFallback />}>
                        <TradeLog log={log} clearLog={clearLog} />
                    </Suspense>
                </div>
            </main>
        </div>
    );
};

const App: React.FC = () => {
    return (
        <ToastProvider>
            <AppContent />
        </ToastProvider>
    );
}

export default App;