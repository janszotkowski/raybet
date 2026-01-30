import * as React from 'react';
import { cn } from '../../lib/utils';
import { Loader2 } from 'lucide-react';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg' | 'icon';

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: ButtonVariant;
    size?: ButtonSize;
    isLoading?: boolean;
    fullWidth?: boolean;
};

export const Button: React.FC<ButtonProps> = (props: ButtonProps): React.ReactElement => {
    const { className, variant = 'primary', size = 'md', isLoading, fullWidth, children, disabled, ...rest } = props;

    const variants = {
        primary: 'bg-gradient-to-r from-brand-primary to-brand-secondary text-sport-bg font-bold hover:brightness-110 active:scale-[0.98] shadow-lg shadow-brand-primary/20',
        secondary: 'bg-sport-card text-white hover:bg-sport-card/80 active:scale-[0.98] border border-sport-card-border',
        outline: 'bg-transparent border border-sport-card-border text-white hover:border-brand-primary/50 active:scale-[0.98]',
        ghost: 'bg-transparent text-text-secondary hover:text-white',
        danger: 'bg-red-500/10 text-red-500 hover:bg-red-500/20 active:scale-[0.98]',
    };

    const sizes = {
        sm: 'h-8 px-3 text-xs rounded-lg',
        md: 'h-11 px-5 text-sm rounded-xl',
        lg: 'h-13 px-6 text-base rounded-2xl',
        icon: 'h-10 w-10 p-0 flex items-center justify-center rounded-xl',
    };

    return (
        <button
            className={cn(
                'inline-flex items-center justify-center transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none select-none',
                variants[variant],
                sizes[size],
                fullWidth && 'w-full',
                className
            )}
            disabled={disabled || isLoading}
            {...rest}
        >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {children}
        </button>
    );
};
