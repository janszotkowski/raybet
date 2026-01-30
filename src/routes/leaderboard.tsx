import { createFileRoute } from '@tanstack/react-router';
import * as React from 'react';
import { useProfileStore } from '../lib/store/profileStore';
import { playerService } from '../lib/appwrite/services/playerService';
import type { Profile } from '../lib/appwrite/types';
import { Crown, Loader2, Medal, Trophy } from 'lucide-react';
import { cn } from '../lib/utils';
import { Card } from '../components/ui/Card';

export const Route = createFileRoute('/leaderboard')({
    component: LeaderboardPage,
});

function LeaderboardPage() {
    const {profile} = useProfileStore();
    const [profiles, setProfiles] = React.useState<Profile[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);

    React.useEffect(() => {
        const fetchData = async () => {
            if (!profile?.roomId) return;
            setIsLoading(true);
            try {
                const list = await playerService.listProfiles(profile.roomId);
                const sorted = list.sort((a, b) => b.totalPoints - a.totalPoints);
                setProfiles(sorted);
            } catch (err) {
                console.error('Failed to fetch leaderboard', err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [profile?.roomId]);

    if (!profile?.roomId) {
        return (
            <div className={'flex flex-col items-center justify-center min-h-[50vh] text-center p-8 text-text-secondary'}>
                <p>Join a room to see the leaderboard.</p>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className={'flex justify-center py-20'}>
                <Loader2 className={'w-8 h-8 animate-spin text-brand-primary'}/>
            </div>
        );
    }

    const userRankIndex = profiles.findIndex(p => p.userId === profile.userId);
    const userRank = userRankIndex !== -1 ? userRankIndex + 1 : '-';

    // Helper for Rank Badge
    const getRankBadge = (rank: number) => {
        if (rank === 1) return <div className={'h-8 w-8 rounded-full bg-yellow-400 flex items-center justify-center text-black font-bold shadow-[0_0_15px_rgba(250,204,21,0.5)]'}><Crown size={16}/></div>;
        if (rank === 2) return <div className={'h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center text-black font-bold shadow-[0_0_10px_rgba(209,213,219,0.3)]'}><Medal size={16}/></div>;
        if (rank === 3) return <div className={'h-8 w-8 rounded-full bg-amber-600 flex items-center justify-center text-white font-bold shadow-[0_0_10px_rgba(217,119,6,0.3)]'}><Medal size={16}/></div>;
        return <span className={'text-[17px] font-bold text-text-secondary w-8 text-center'}>{rank}</span>;
    };

    return (
        <div className={'flex flex-col pb-24 relative min-h-full'}>
            {/* Header */}
            <div className={'flex flex-col items-center pt-4 pb-6 px-4'}>
                <div className={'h-12 w-12 rounded-2xl bg-sport-card border border-sport-card-border flex items-center justify-center mb-3 text-brand-primary shadow-lg shadow-brand-primary/10'}>
                    <Trophy size={24}/>
                </div>
                <h1 className={'text-2xl font-bold text-white tracking-tight'}>Leaderboard</h1>
                <p className={'text-sm text-text-secondary'}>Top performers in the pool</p>
            </div>

            {/* List */}
            <div className={'flex flex-col gap-3 px-4'}>
                {profiles.map((p, index) => {
                    const rank = index + 1;
                    const isMe = p.userId === profile.userId;

                    return (
                        <Card
                            key={p.$id}
                            className={cn(
                                'flex items-center gap-4 px-4 py-3 border transition-transform active:scale-[0.99]',
                                isMe
                                    ? 'bg-sport-card border-brand-primary'
                                    : 'bg-sport-card/50 border-transparent',
                            )}
                            noPadding
                        >
                            {/* Rank */}
                            <div className={'shrink-0'}>
                                {getRankBadge(rank)}
                            </div>

                            {/* Avatar */}
                            <div className={cn(
                                'h-11 w-11 rounded-full flex items-center justify-center text-[14px] font-bold overflow-hidden shrink-0 border-2',
                                isMe ? 'border-brand-primary bg-brand-primary/10 text-brand-primary' : 'border-sport-card-border bg-sport-bg text-text-secondary',
                            )}
                            >
                                {p.avatarUrl ? (
                                    <img
                                        src={p.avatarUrl}
                                        alt={p.nickname}
                                        className={'h-full w-full object-cover'}
                                    />
                                ) : (
                                    p.nickname.substring(0, 2).toUpperCase()
                                )}
                            </div>

                            {/* Name */}
                            <div className={'flex-1 flex flex-col min-w-0'}>
                                <span className={cn(
                                    'font-bold text-[16px] truncate',
                                    isMe ? 'text-brand-primary' : 'text-white',
                                )}
                                >
                                    {p.nickname}
                                </span>
                                {isMe && <span className={'text-[10px] uppercase font-bold text-text-secondary tracking-widest'}>You</span>}
                                {rank <= 3 && !isMe && <span className={cn(
                                    'text-[10px] font-bold',
                                    rank === 1 ? 'text-yellow-400' : rank === 2 ? 'text-gray-300' : 'text-amber-600',
                                )}
                                                       >
                                    {rank === 1 ? 'Gold' : rank === 2 ? 'Silver' : 'Bronze'}
                                </span>}
                            </div>

                            {/* Points */}
                            <div className={'flex flex-col items-end shrink-0'}>
                                <span className={'font-black text-xl text-white tracking-tight'}>
                                    {p.totalPoints}
                                </span>
                                <span className={'text-[10px] font-bold text-text-secondary uppercase'}>Points</span>
                            </div>
                        </Card>
                    );
                })}
            </div>

            {/* Sticky Me (Bottom) - if not in view logic, static for now just as reference style */}
            {!profiles.slice(0, 5).some(p => p.userId === profile.userId) && (
                <div className={'fixed bottom-[85px] left-0 w-full px-4 z-20 animate-slide-up'}>
                    <Card
                        className={'flex items-center gap-4 px-4 py-3 bg-sport-card border border-brand-primary shadow-[0_0_20px_rgba(45,212,191,0.15)]'}
                        noPadding
                    >
                        <span className={'text-[17px] font-bold text-white w-8 text-center'}>{userRank}</span>
                        <div className={'h-10 w-10 rounded-full border-2 border-brand-primary bg-brand-primary/10 flex items-center justify-center text-[12px] font-bold text-brand-primary overflow-hidden shrink-0'}>
                            {profile.nickname.substring(0, 2).toUpperCase()}
                        </div>
                        <div className={'flex-1'}>
                            <span className={'font-bold text-white block'}>{profile.nickname} (You)</span>
                            <span className={'text-[11px] text-brand-primary'}>Your current position</span>
                        </div>
                        <span className={'font-black text-xl text-brand-primary'}>
                            {profile.totalPoints} <span className={'text-[10px] text-text-secondary font-bold'}>pts</span>
                        </span>
                    </Card>
                </div>
            )}
        </div>
    );
}
