import * as React from 'react';
import { cn } from '../../lib/utils';
import { AlertCircle } from 'lucide-react';

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
    label?: string;
    error?: string;
    containerClassName?: string;
};

export const Input: React.FC<InputProps> = (props: InputProps): React.ReactElement => {
    const { className, containerClassName, label, error, ...rest } = props;

    return (
        <div className={cn("w-full", containerClassName)}>
            <div className="relative group bg-[#1C1C1E] rounded-[10px] overflow-hidden flex items-center">
                {label && (
                    <label className="pl-4 py-3 text-[17px] text-white whitespace-nowrap min-w-[100px]">
                        {label}
                    </label>
                )}
                <input
                    className={cn(
                        'flex-1 h-12 bg-transparent px-4 py-3 text-[17px] text-right text-brand-primary placeholder:text-zinc-600 focus:outline-none disabled:opacity-50',
                        !label && 'text-left pl-4',
                        className
                    )}
                    {...rest}
                />
            </div>
            {error && (
                <div className="flex items-center gap-1.5 text-red-500 text-[13px] mt-1.5 pl-4">
                    <AlertCircle size={14} />
                    <span>{error}</span>
                </div>
            )}
        </div>
    );
};
