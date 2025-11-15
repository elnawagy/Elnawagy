
import React, { ReactNode } from 'react';
import { EmptyBoxIcon } from './icons';

interface EmptyStateProps {
    icon?: ReactNode;
    title: string;
    description: string;
    actionButton?: ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
    icon = <EmptyBoxIcon />,
    title,
    description,
    actionButton
}) => {
    return (
        <div className="text-center py-16 px-6 bg-secondary/50 border-2 border-dashed border-border rounded-xl">
            {icon}
            <h2 className="mt-4 text-xl font-bold text-foreground">{title}</h2>
            <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto">{description}</p>
            {actionButton && <div className="mt-6">{actionButton}</div>}
        </div>
    );
};