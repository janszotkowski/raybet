import { Link } from '@tanstack/react-router';
import { LayoutDashboard, Trophy, Users } from 'lucide-react';
import * as React from 'react';
import { cn } from '../../lib/utils'; // Keep using cn

// Simple stick icon component
const HockeyIcon = ({ className }: { className?: string }) => (
    <svg
        viewBox={'0 0 24 24'}
        fill={'none'}
        stroke={'currentColor'}
        strokeWidth={'2'}
        strokeLinecap={'round'}
        strokeLinejoin={'round'}
        className={className}
    >
        <path d={'M2 20h20'} />
        <path d={'M5 20l4-12 10-6'} />
    </svg>
);


type MainLayoutProps = {
    children: React.ReactNode;
};

export const MainLayout: React.FC<MainLayoutProps> = (props: MainLayoutProps): React.ReactElement => {
    return (
        <div className={'w-full h-full max-w-[480px] bg-sport-bg relative flex flex-col sm:border-x sm:border-sport-card-border overflow-hidden shadow-2xl'}>
            {/* Header */}
            <header className={'shrink-0 pt-[env(safe-area-inset-top)] bg-sport-bg/95 backdrop-blur-sm z-30 transition-all duration-200'}>
                <div className={'h-16 flex items-center justify-center relative'}>
                    {/* Logo Area */}
                    <div className={'flex flex-col items-center justify-center pt-2'}>
                        <div className={'h-10 w-10 rounded-xl border border-brand-primary/30 flex items-center justify-center bg-sport-card shadow-[0_0_15px_rgba(45,212,191,0.15)]'}>
                            <HockeyIcon className={'text-brand-primary w-6 h-6'} />
                        </div>
                    </div>
                </div>
            </header>

            {/* Content */}
            <main className={'flex-1 overflow-y-auto overflow-x-hidden p-4 pb-28 overscroll-contain no-scrollbar relative w-full pt-2'}>
                {props.children}
            </main>

            {/* Tab Bar */}
            <nav className={'shrink-0 pb-[env(safe-area-inset-bottom)] bg-sport-bg border-t border-sport-card-border flex items-center justify-around h-[80px] z-30 absolute bottom-0 w-full left-0'}>
                <div className={'flex w-full justify-around h-full items-center px-2'}>
                    <NavLink
                        to={'/profile'}
                        icon={<Users size={24} />}
                        label={'Profile'}
                    />
                    <NavLink
                        to={'/'}
                        icon={<LayoutDashboard size={24} />}
                        label={'Matches'}
                    />
                    <NavLink
                        to={'/leaderboard'}
                        icon={<Trophy size={24} />}
                        label={'Ranking'}
                    />
                </div>
            </nav>
        </div>
    );
};

const NavLink = ({ to, icon, label }: { to: string; icon: React.ReactNode; label: string }) => (
    <Link
        to={to}
        className={'group flex flex-col items-center justify-center w-20 h-full gap-1.5 text-text-secondary transition-all duration-200'}
        activeProps={{ className: '!text-brand-primary' }}
    >
        {({ isActive }) => (
            <>
                <div className={cn(
                    'flex items-center justify-center transition-all duration-200',
                    isActive && 'scale-110 drop-shadow-[0_0_8px_rgba(45,212,191,0.5)]'
                )}
                >
                    {icon}
                </div>
                <span className={cn(
                    'text-[10px] font-medium tracking-wide transition-colors',
                    isActive ? 'text-brand-primary' : 'text-text-secondary/70'
                )}
                >{label}</span>
            </>
        )}
    </Link>
);
