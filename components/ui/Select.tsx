
import React from 'react';

export const Select: React.FC<React.SelectHTMLAttributes<HTMLSelectElement>> = ({ className = '', children, ...props }) => {
    const baseClasses = "mt-1 block w-full pl-3 pr-10 py-2 text-base bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md";
    return <select className={`${baseClasses} ${className}`} {...props}>{children}</select>;
};
