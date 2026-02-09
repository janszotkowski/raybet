import * as React from 'react';
import { DailySlider } from './DailySlider';
import { MatchCard } from './MatchCard';
import { matchService } from '../../../lib/appwrite/services/matchService';
import type { Match, Prediction } from '../../../lib/appwrite/types';
import { predictionService } from '../../../lib/appwrite/services/predictionService';
import { useAuthStore } from '../../../lib/store/authStore';
import { Loader2, Calendar } from 'lucide-react';

export const MatchList: React.FC = (): React.ReactElement => {
    const { userId } = useAuthStore();
    const [matches, setMatches] = React.useState<Match[]>([]);
    const [predictions, setPredictions] = React.useState<Record<string, Prediction>>({});
    const [selectedDate, setSelectedDate] = React.useState<string>('');
    const [isLoading, setIsLoading] = React.useState(true);
    const [days, setDays] = React.useState<string[]>([]);

    React.useEffect(() => {
        const fetchData = async () => {
            if (!userId) return;
            setIsLoading(true);
            try {
                const [matchesLog, predictionsLog] = await Promise.all([
                    matchService.listMatches(),
                    predictionService.getUserPredictions(userId)
                ]);

                setMatches(matchesLog);

                const predMap: Record<string, Prediction> = {};
                predictionsLog.forEach(p => { predMap[p.matchId] = p; });
                setPredictions(predMap);

                const uniqueDays = Array.from(new Set(matchesLog.map(m => m.date.split('T')[0]))).sort();
                setDays(uniqueDays);

                const today = new Date().toISOString().split('T')[0];
                if (uniqueDays.includes(today)) {
                    setSelectedDate(today);
                } else {
                    const futureDates = uniqueDays.filter(d => d >= today);
                    if (futureDates.length > 0) setSelectedDate(futureDates[0]);
                    else if (uniqueDays.length > 0) setSelectedDate(uniqueDays[0]);
                }

            } catch (err) {
                console.error('Error fetching data', err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [userId]);

    const filteredMatches = matches
        .filter(m => m.date.startsWith(selectedDate))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    if (isLoading) return (
        <div className={'flex flex-col items-center justify-center min-h-[300px]'}>
            <Loader2 className={'w-8 h-8 text-brand-primary animate-spin'} />
        </div>
    );

    if (matches.length === 0) return (
        <div className={'flex flex-col items-center justify-center min-h-[50vh] text-center p-8 text-text-secondary'}>
            <h3 className={'font-bold text-lg text-white mb-2'}>No Matches Found</h3>
            <p className={'opacity-70'}>Check back later for upcoming games.</p>
        </div>
    );

    return (
        <div className={'flex flex-col w-full h-full'}>
            {/* Header Area */}
            <div className={'px-4 pt-2'}>
                <div className={'flex items-center gap-3 mb-2'}>
                    <div className={'p-2 rounded-lg bg-sport-card border border-sport-card-border text-brand-primary'}>
                        <Calendar size={20} />
                    </div>
                    <div>
                        <h1 className={'text-xl font-bold text-white tracking-tight'}>Matches & Predictions</h1>
                        <p className={'text-xs text-text-secondary'}>Make your picks before matches start</p>
                    </div>
                </div>
            </div>

            {/* Date Tabs */}
            <div className={'px-3 border-b border-sport-card-border/50 mb-4 sticky top-0 bg-sport-bg z-20 backdrop-blur-md'}>
                <DailySlider
                    days={days}
                    selectedDate={selectedDate}
                    onSelectDate={setSelectedDate}
                />
            </div>

            {/* Matches List */}
            <div className={'px-4 pb-24 flex flex-col gap-4'}>
                {/* Optional Group Helper: "Group Stage" */}
                <h3 className={'text-xs font-bold text-brand-primary uppercase tracking-widest pl-1'}>Games</h3>

                {filteredMatches.length > 0 ? (
                    filteredMatches.map(match => (
                        <MatchCard
                            key={match.$id}
                            match={match}
                            existingPrediction={predictions[match.$id]}
                            onPredictionUpdate={(p) => setPredictions(prev => ({ ...prev, [p.matchId]: p }))}
                        />
                    ))
                ) : (
                    <div className={'py-12 text-center text-text-secondary border border-dashed border-sport-card-border rounded-2xl bg-sport-card/30'}>
                        No matches scheduled for this day.
                    </div>
                )}
            </div>
        </div>
    );
};
