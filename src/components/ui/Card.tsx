import * as React from 'react';
import { cn } from '../../lib/utils';

type CardProps = React.HTMLAttributes<HTMLDivElement> & {
    noPadding?: boolean;
    variant?: 'default' | 'outlined' | 'gradient';
};

export const Card: React.FC<CardProps> = (props: CardProps): React.ReactElement => {
    const { className, children, noPadding = false, variant = 'default', ...rest } = props;

    const variants = {
        default: 'bg-sport-card text-white border border-transparent',
        outlined: 'bg-transparent border border-sport-card-border',
        gradient: 'bg-gradient-to-br from-sport-card to-sport-bg border border-sport-card-border/50',
    };

    return (
        <div
            className={cn(
                'rounded-[16px]',
                variants[variant],
                !noPadding && 'p-4',
                className
            )}
            {...rest}
        >
            {children}
        </div>
    );
};
