import * as React from 'react';
import { cn } from '../../../lib/utils';
import { Button } from '../../ui/Button';
import { ChevronRight, ChevronLeft } from 'lucide-react';

type DailySliderProps = {
    days: string[]; // ISO date strings (YYYY-MM-DD)
    selectedDate: string;
    onSelectDate: (date: string) => void;
};

export const DailySlider: React.FC<DailySliderProps> = (props: DailySliderProps): React.ReactElement => {
    const { days, selectedDate, onSelectDate } = props;

    // Reference style uses "Pill" selector - [ < Today > ] style or just tabs
    // The reference image 3 shows horizontal tabs: [Feb 10] [Feb 11] ...

    return (
        <div className="flex gap-2 overflow-x-auto py-4 px-1 no-scrollbar items-center">
            {/* Navigation Arrows could be added if list is long, but scroll is native enough */}

            {days.map((day) => {
                const date = new Date(day);
                // Format: Feb 10
                const label = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                const isActive = day === selectedDate;

                return (
                    <button
                        key={day}
                        onClick={() => onSelectDate(day)}
                        className={cn(
                            "flex items-center justify-center h-10 px-5 rounded-xl text-sm font-bold transition-all whitespace-nowrap",
                            isActive
                                ? "bg-gradient-to-r from-brand-primary to-brand-secondary text-sport-bg shadow-[0_0_15px_rgba(45,212,191,0.3)]"
                                : "bg-sport-card text-text-secondary hover:text-white border border-sport-card-border"
                        )}
                    >
                        {label}
                    </button>
                );
            })}
        </div>
    );
};
