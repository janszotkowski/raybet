import * as React from 'react';
import { Card } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { cn } from '../../../lib/utils';
import type { Match, Prediction } from '../../../lib/appwrite/types';
import { predictionService } from '../../../lib/appwrite/services/predictionService';
import { useAuthStore } from '../../../lib/store/authStore';
import { Loader2, Lock, Clock, CheckCircle } from 'lucide-react';

type MatchCardProps = {
    match: Match;
    existingPrediction?: Prediction;
    onPredictionUpdate?: (prediction: Prediction) => void;
};

// Map team names to country codes for flags (simplified)
const getFlagUrl = (teamName: string) => {
    // This would typically be a map or utility
    // Using placeholder for now, ideally user would add actual flags
    // Example: https://flagcdn.com/w80/cz.png
    const codeMap: Record<string, string> = {
        'Česko': 'cz', 'USA': 'us', 'Kanada': 'ca', 'Švédsko': 'se',
        'Finsko': 'fi', 'Slovensko': 'sk', 'Německo': 'de', 'Švýcarsko': 'ch'
    };
    const code = codeMap[teamName] || 'xx';
    return `https://flagcdn.com/w80/${code}.png`;
};

export const MatchCard: React.FC<MatchCardProps> = (props: MatchCardProps): React.ReactElement => {
    const { match, existingPrediction, onPredictionUpdate } = props;
    const { userId } = useAuthStore();

    const [homeScore, setHomeScore] = React.useState<string>(existingPrediction?.homeScore?.toString() ?? '');
    const [awayScore, setAwayScore] = React.useState<string>(existingPrediction?.awayScore?.toString() ?? '');
    const [isSaving, setIsSaving] = React.useState(false);
    const [isEditMode, setIsEditMode] = React.useState(false);

    const isLive = match.status === 'live';
    const isFinished = match.status === 'finished';
    const isLocked = isLive || isFinished;

    // Auto-enter edit mode if not locked and no prediction
    React.useEffect(() => {
        if (!isLocked && !existingPrediction) {
            // Optional: setIsEditMode(true);
        }
    }, [isLocked, existingPrediction]);

    const handleSave = async () => {
        if (homeScore === '' || awayScore === '' || !userId) return;
        setIsSaving(true);
        try {
            const scoreHome = parseInt(homeScore, 10);
            const scoreAway = parseInt(awayScore, 10);

            let updated: Prediction;
            if (existingPrediction) {
                updated = await predictionService.updatePrediction(existingPrediction.$id, scoreHome, scoreAway);
            } else {
                updated = await predictionService.createPrediction({ matchId: match.$id, userId: userId, homeScore: scoreHome, awayScore: scoreAway });
            }
            onPredictionUpdate?.(updated);
            setIsEditMode(false);
        } catch (err) {
            console.error("Failed to save prediction", err);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Card className="flex flex-col gap-4 relative overflow-hidden bg-sport-card/80 border-sport-card-border backdrop-blur-sm" variant="default">
            {/* Header */}
            <div className="flex justify-between items-center text-xs font-medium text-text-secondary">
                <div className="flex items-center gap-1.5 bg-sport-bg/50 px-2 py-1 rounded-full">
                    {isLocked ? (
                        <span className="flex items-center gap-1 text-text-secondary"><Lock size={12} /> {isFinished ? 'Finished' : 'Locked'}</span>
                    ) : (
                        <span className="flex items-center gap-1 text-brand-primary"><Clock size={12} /> {new Date(match.date).toLocaleTimeString('cs-CZ', { hour: '2-digit', minute: '2-digit' })}</span>
                    )}
                </div>
                {isLive && <span className="text-red-500 font-bold animate-pulse">LIVE</span>}
            </div>

            {/* Teams Row */}
            <div className="flex items-center justify-between px-2">
                {/* Home */}
                <div className="flex flex-col items-center gap-2 w-1/3">
                    <div className="h-10 w-14 shadow-lg rounded-[4px] overflow-hidden bg-gray-800 relative">
                        <img src={getFlagUrl(match.homeTeam)} alt={match.homeTeam} className="w-full h-full object-cover" />
                    </div>
                    <span className="text-sm font-bold text-white text-center leading-tight">{match.homeTeam}</span>
                </div>

                {/* VS / Score */}
                <div className="flex flex-col items-center justify-center w-1/3 z-10">
                    {isEditMode ? (
                        <div className="flex items-center gap-2 bg-sport-bg/80 p-1.5 rounded-xl border border-sport-card-border shadow-inner">
                            <input
                                className="w-9 h-10 bg-sport-card rounded-lg text-center text-xl font-bold text-white focus:ring-1 focus:ring-brand-primary outline-none transition-all"
                                value={homeScore}
                                onChange={(e) => setHomeScore(e.target.value)}
                                type="number"
                                placeholder="-"
                            />
                            <span className="text-text-secondary font-bold">:</span>
                            <input
                                className="w-9 h-10 bg-sport-card rounded-lg text-center text-xl font-bold text-white focus:ring-1 focus:ring-brand-primary outline-none transition-all"
                                value={awayScore}
                                onChange={(e) => setAwayScore(e.target.value)}
                                type="number"
                                placeholder="-"
                            />
                        </div>
                    ) : (
                        <div className="flex flex-col items-center">
                            <div className="text-3xl font-black text-white tracking-widest flex items-center gap-2">
                                {existingPrediction ? (
                                    <>
                                        <span className={existingPrediction.homeScore > existingPrediction.awayScore ? 'text-brand-primary' : ''}>{existingPrediction.homeScore}</span>
                                        <span className="text-sport-card-border text-2xl">:</span>
                                        <span className={existingPrediction.awayScore > existingPrediction.homeScore ? 'text-brand-primary' : ''}>{existingPrediction.awayScore}</span>
                                    </>
                                ) : (
                                    <span className="text-2xl text-sport-card-border font-bold">VS</span>
                                )}
                            </div>
                            {/* Real Score if finished */}
                            {isFinished && (
                                <span className="text-[10px] text-text-secondary mt-1 bg-sport-bg px-2 py-0.5 rounded-full">
                                    Real: {match.homeScore}:{match.awayScore}
                                </span>
                            )}
                        </div>
                    )}
                </div>

                {/* Away */}
                <div className="flex flex-col items-center gap-2 w-1/3">
                    <div className="h-10 w-14 shadow-lg rounded-[4px] overflow-hidden bg-gray-800 relative">
                        <img src={getFlagUrl(match.awayTeam)} alt={match.awayTeam} className="w-full h-full object-cover" />
                    </div>
                    <span className="text-sm font-bold text-white text-center leading-tight">{match.awayTeam}</span>
                </div>
            </div>

            {/* Action Button - Full Width Gradient */}
            {!isLocked && (
                isEditMode ? (
                    <Button
                        variant="primary"
                        fullWidth
                        size="md"
                        onClick={handleSave}
                        isLoading={isSaving}
                        className="mt-2"
                    >
                        Save Tip
                    </Button>
                ) : (
                    <Button
                        variant="secondary"
                        fullWidth
                        size="sm"
                        onClick={() => setIsEditMode(true)}
                        className="mt-2 bg-sport-card/50 hover:bg-sport-card border-dashed border-sport-card-border"
                    >
                        {existingPrediction ? 'Edit Prediction' : 'Make Prediction'}
                    </Button>
                )
            )}

            {/* Locked Visual */}
            {isLocked && existingPrediction && (
                <div className="absolute inset-0 pointer-events-none border border-transparent" />
            )}
        </Card>
    );
};
