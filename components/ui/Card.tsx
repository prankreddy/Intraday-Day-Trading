
import React from 'react';

const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
    <div className={`bg-white dark:bg-gray-800 shadow-lg rounded-xl overflow-hidden ${className}`}>
        {children}
    </div>
);

const CardHeader: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
    <div className={`p-4 border-b border-gray-200 dark:border-gray-700 ${className}`}>
        {children}
    </div>
);

const CardTitle: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
    <h2 className={`text-lg font-semibold text-gray-800 dark:text-gray-100 ${className}`}>
        {children}
    </h2>
);

const CardContent: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
    <div className={`p-4 ${className}`}>
        {children}
    </div>
);

const CardFooter: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
    <div className={`p-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700 ${className}`}>
        {children}
    </div>
);


export { Card, CardHeader, CardTitle, CardContent, CardFooter };
