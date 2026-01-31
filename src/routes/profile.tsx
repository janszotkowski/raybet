import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { Camera, Lock, LogOut, Medal, Trophy } from 'lucide-react';
import * as React from 'react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { playerService } from '../lib/appwrite/services/playerService';
import { useAuthStore } from '../lib/store/authStore';
import { useProfileStore } from '../lib/store/profileStore';
import { cn } from '../lib/utils';
import * as m from '../paraglide/messages';

export const Route = createFileRoute('/profile')({
    component: ProfilePage,
});

const COUNTRIES = [
    { code: 'CAN', name: 'Canada' },
    { code: 'USA', name: 'USA' },
    { code: 'CZE', name: 'Czech Republic' },
    { code: 'SWE', name: 'Sweden' },
    { code: 'FIN', name: 'Finland' },
    { code: 'SVK', name: 'Slovakia' },
    { code: 'SUI', name: 'Switzerland' },
    { code: 'GER', name: 'Germany' },
];

function ProfilePage() {
    const { userId, logout } = useAuthStore();
    const { profile, setProfile } = useProfileStore();
    const navigate = useNavigate();

    const [avatarUrl, setAvatarUrl] = React.useState(profile?.avatarUrl || '');
    const [winnerTip, setWinnerTip] = React.useState(profile?.tournamentWinnerTip || '');
    const [isSaving, setIsSaving] = React.useState(false);
    const [showAvatarInput, setShowAvatarInput] = React.useState(false);

    React.useEffect(() => {
        if (!userId) {
            navigate({ to: '/' });
        }
        if (profile) {
            setAvatarUrl(profile.avatarUrl || '');
            setWinnerTip(profile.tournamentWinnerTip || '');
        }
    }, [profile, userId, navigate]);

    const handleAvatarUpdate = async () => {
        if (!profile || !avatarUrl) return;
        setIsSaving(true);
        try {
            const updated = await playerService.updateAvatar(profile.$id, avatarUrl);
            setProfile(updated);
            setShowAvatarInput(false);
        } catch (err) {
            console.error('Failed to update avatar', err);
        } finally {
            setIsSaving(false);
        }
    };

    const handleLockTip = async () => {
        if (!profile || !winnerTip) return;
        if (!confirm('Are you sure? This action is irreversible.')) return;

        setIsSaving(true);
        try {
            if (winnerTip !== profile.tournamentWinnerTip) {
                await playerService.setTournamentTip(profile.$id, winnerTip);
            }
            const updated = await playerService.lockTournamentTip(profile.$id);
            setProfile(updated);
        } catch (err) {
            console.error('Failed to lock tip', err);
        } finally {
            setIsSaving(false);
        }
    };

    const handleSaveTip = async () => {
        if (!profile || !winnerTip) return;
        setIsSaving(true);
        try {
            const updated = await playerService.setTournamentTip(profile.$id, winnerTip);
            setProfile(updated);
            alert(m.msg_tip_saved());
        } catch (err) {
            console.error('Failed to save tip', err);
        } finally {
            setIsSaving(false);
        }
    };

    const logoutProfile = () => {
        logout();
        setProfile(null);
        navigate({ to: '/' });
    };

    if (!profile) return (
        <div className={'flex justify-center p-8'}>
            <span className={'text-brand-primary animate-pulse'}>{m.loading_profile()}</span>
        </div>
    );

    return (
        <div className={'flex flex-col gap-6 pb-20 relative'}>
            {/* Header: Avatar with Ring similar to Ref Image 2 */}
            <div className={'flex flex-col items-center pt-8 pb-4 relative'}>
                <div className={'relative mb-4'}>
                    {/* Outer Ring */}
                    <div className={'w-32 h-32 rounded-full border-4 border-brand-primary flex items-center justify-center relative shadow-[0_0_25px_rgba(45,212,191,0.3)]'}>
                        {/* Avatar */}
                        <div className={'w-28 h-28 rounded-full bg-sport-card overflow-hidden relative'}>
                            {profile.avatarUrl ? (
                                <img
                                    src={profile.avatarUrl}
                                    alt={'Avatar'}
                                    className={'h-full w-full object-cover'}
                                />
                            ) : (
                                <div className={'h-full w-full flex items-center justify-center bg-sport-card text-white text-3xl font-bold'}>
                                    {profile.nickname.substring(0, 2).toUpperCase()}
                                </div>
                            )}
                        </div>
                        {/* Camera Icon Badge */}
                        <button
                            onClick={() => setShowAvatarInput(!showAvatarInput)}
                            className={'absolute bottom-1 right-1 h-8 w-8 bg-brand-primary text-sport-bg rounded-full flex items-center justify-center shadow-lg border-2 border-sport-bg'}
                        >
                            <Camera size={14} />
                        </button>
                    </div>
                </div>

                <h1 className={'text-2xl font-bold text-white'}>{profile.nickname}</h1>

                <div className={'mt-2 px-6 py-2 bg-sport-card/50 rounded-xl border border-sport-card-border/50 backdrop-blur-md'}>
                    <span className={'text-3xl font-black text-brand-primary tracking-tight'}>{profile.totalPoints}</span>
                    <span className={'text-xs text-text-secondary ml-2 font-bold uppercase'}>{m.label_total_points()}</span>
                </div>
            </div>

            {/* Avatar Input */}
            {showAvatarInput && (
                <div className={'flex gap-2 px-6 animate-fade-in'}>
                    <Input
                        placeholder={'Image URL...'}
                        value={avatarUrl}
                        onChange={(e) => setAvatarUrl(e.target.value)}
                        className={'text-xs h-10 bg-sport-card border-sport-card-border'}
                    />
                    <Button
                        size={'sm'}
                        onClick={handleAvatarUpdate}
                        disabled={isSaving}
                    >{m.action_save()}</Button>
                </div>
            )}

            {/* 2x2 Grid Stats Reference Style */}
            <div className={'px-4'}>
                <h3 className={'text-sm font-bold text-white mb-3 ml-1'}>{m.profile_perf_grid()}</h3>
                <div className={'grid grid-cols-2 gap-3'}>
                    <Card className={'flex flex-col p-4 bg-sport-card/80 border-sport-card-border hover:border-brand-primary/30 transition-colors'}>
                        <span className={'text-2xl font-bold text-white'}>--</span>
                        <span className={'text-xs text-text-secondary font-medium'}>{m.stat_exact_scores()}</span>
                    </Card>
                    <Card className={'flex flex-col p-4 bg-sport-card/80 border-sport-card-border hover:border-brand-primary/30 transition-colors'}>
                        <span className={'text-2xl font-bold text-white'}>--</span>
                        <span className={'text-xs text-text-secondary font-medium'}>{m.stat_goal_diff()}</span>
                    </Card>
                    <Card className={'flex flex-col p-4 bg-sport-card/80 border-sport-card-border hover:border-brand-primary/30 transition-colors'}>
                        <span className={'text-2xl font-bold text-white'}>--</span>
                        <span className={'text-xs text-text-secondary font-medium'}>{m.stat_match_winner()}</span>
                    </Card>
                    <Card className={'flex flex-col p-4 bg-sport-card/80 border-sport-card-border hover:border-brand-primary/30 transition-colors'}>
                        <span className={'text-2xl font-bold text-white'}>--%</span>
                        <span className={'text-xs text-text-secondary font-medium'}>{m.stat_success_rate()}</span>
                    </Card>
                </div>
            </div>

            {/* Tournament Winner Section - Teal Bordered Card */}
            <div className={'px-4 mt-2'}>
                <Card className={cn(
                    'p-5 border relative overflow-hidden transition-all',
                    profile.isTournamentTipLocked
                        ? 'border-sport-card-border bg-sport-card/50'
                        : 'border-brand-primary/50 bg-linear-to-br from-sport-card to-brand-primary/5',
                )}
                >
                    <div className={'flex items-center gap-3 mb-4'}>
                        <Trophy className={'text-brand-primary'} size={20} />
                        <h3 className={'font-bold text-white text-lg'}>{m.profile_tournament_winner()}</h3>
                    </div>

                    <p className={'text-xs text-text-secondary mb-4'}>{m.profile_pick_gold()}</p>

                    <div className={'relative'}>
                        <select
                            className={cn(
                                'w-full h-12 rounded-xl bg-sport-bg border px-4 text-sm font-bold text-white focus:outline-none focus:border-brand-primary appearance-none transition-colors',
                                profile.isTournamentTipLocked ? 'border-transparent opacity-50 cursor-not-allowed' : 'border-sport-card-border hover:border-text-secondary',
                            )}
                            value={winnerTip}
                            onChange={(e) => setWinnerTip(e.target.value)}
                            disabled={profile.isTournamentTipLocked}
                        >
                            <option value={''}>{m.profile_select_team()}</option>
                            {COUNTRIES.map(c => (
                                <option key={c.code} value={c.code}>{c.name}</option>
                            ))}
                        </select>
                        <div className={'absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-text-secondary'}>
                            {profile.isTournamentTipLocked ? <Lock size={16} /> : <div className={'w-2 h-2 border-r-2 border-b-2 border-current rotate-45'} />}
                        </div>
                    </div>

                    {!profile.isTournamentTipLocked && (
                        <Button
                            variant={'primary'}
                            fullWidth
                            className={'mt-4 shadow-lg shadow-brand-primary/20'}
                            onClick={handleSaveTip}
                            disabled={!winnerTip || isSaving}
                        >
                            {m.action_save_tip()}
                        </Button>
                    )}

                    {profile.isTournamentTipLocked && (
                        <div className={'mt-4 flex items-center gap-2 text-xs text-text-secondary'}>
                            <Medal size={14} /> {m.status_tip_locked()}
                        </div>
                    )}
                </Card>

                {!profile.isTournamentTipLocked && winnerTip && (
                    <div className={'mt-4 px-1'}>
                        <button
                            onClick={handleLockTip}
                            className={'text-xs text-text-secondary hover:text-red-500 transition-colors flex items-center gap-1 mx-auto'}
                        >
                            <Lock size={12} /> {m.action_lock_prediction()}
                        </button>
                    </div>
                )}
            </div>

            <div className={'px-4 mt-6 mb-4'}>
                <button
                    onClick={logoutProfile}
                    className={'w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-sport-card text-text-secondary text-sm font-bold hover:bg-sport-card/80 hover:text-white transition-colors'}
                >
                    <LogOut size={16} />
                    {m.action_logout()}
                </button>
            </div>
        </div>
    );
}
