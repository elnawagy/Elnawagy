import React, { ReactNode } from 'react';

export const Modal: React.FC<{ children: ReactNode, onClose: () => void, title: string, size?: 'sm' | 'md' | 'lg' }> = ({ children, onClose, title, size = 'md' }) => {
    const sizeClasses = { sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-lg' };
    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className={`bg-card rounded-2xl shadow-2xl w-full ${sizeClasses[size]}`} onClick={(e) => e.stopPropagation()}>
                <div className="p-4 border-b border-border flex justify-between items-center">
                    <h2 className="text-xl font-bold">{title}</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-secondary text-2xl leading-none">&times;</button>
                </div>
                <div className="p-4">{children}</div>
            </div>
        </div>
    );
};
