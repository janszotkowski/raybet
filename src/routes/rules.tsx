import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { ArrowLeft, Clock, Info, Target, Trophy } from 'lucide-react';
import * as React from 'react';
import { Card } from '@/components/ui/Card';
import * as m from '../paraglide/messages';

export const Route = createFileRoute('/rules')({
    component: RulesPage,
});

function RulesPage() {
    const navigate = useNavigate();

    return (
        <div className={'flex flex-col gap-6 pb-20 p-4 relative min-h-screen'}>
            {/* Header */}
            <div className={'flex items-center gap-4 pt-4'}>
                <button
                    onClick={() => navigate({to: '/profile'})}
                    className={'p-2 rounded-full bg-sport-card border border-sport-card-border text-white hover:bg-sport-card/80 transition-colors'}
                >
                    <ArrowLeft size={20}/>
                </button>
                <h1 className={'text-2xl font-bold text-white'}>{m.rules_title()}</h1>
            </div>

            {/* Scoring Section */}
            <div className={'space-y-4'}>
                <div>
                    <h2 className={'text-xl font-bold text-brand-primary mb-1'}>{m.rules_scoring_header()}</h2>
                    <p className={'text-sm text-text-secondary uppercase tracking-wider font-bold'}>{m.rules_scoring_subtitle()}</p>
                </div>

                <div className={'grid gap-3'}>
                    <ScoreCard points={6} text={m.rules_point_6()} icon={<Target size={18} className={'text-brand-primary'}/>}/>
                    <ScoreCard points={4} text={m.rules_point_4()} icon={<div className={'text-brand-primary font-bold text-xs border border-brand-primary rounded px-1'}>+/-</div>}/>
                    <ScoreCard points={2} text={m.rules_point_2()} icon={<Trophy size={18} className={'text-brand-primary'}/>}/>
                    <ScoreCard points={15} text={m.rules_point_15()} isHighlight icon={<Trophy size={18} className={'text-sport-bg'}/>}/>
                </div>
            </div>

            {/* General Rules Section */}
            <div className={'space-y-4 pt-4'}>
                <h2 className={'text-xl font-bold text-white flex items-center gap-2'}>
                    <Info size={24} className={'text-brand-secondary'}/>
                    {m.rules_info_header()}
                </h2>

                <div className={'space-y-4'}>
                    <RuleItem
                        title={m.rules_info_basic_time_title()}
                        text={m.rules_info_basic_time_text()}
                    />
                    <RuleItem
                        title={m.rules_info_match_deadline_title()}
                        text={m.rules_info_match_deadline_text()}
                        icon={<Clock size={16} className={'text-brand-secondary'}/>}
                    />
                    <RuleItem
                        title={m.rules_info_winner_deadline_title()}
                        text={m.rules_info_winner_deadline_text()}
                        icon={<Clock size={16} className={'text-brand-secondary'}/>}
                    />
                </div>
            </div>
        </div>
    );
}

type ScoreCardProps = {
    points: number;
    text: string;
    icon: React.ReactNode;
    isHighlight?: boolean;
};

const ScoreCard: React.FC<ScoreCardProps> = (props: ScoreCardProps): React.ReactElement => (
    <Card className={`flex items-center gap-4 p-4 border border-sport-card-border ${props.isHighlight ? 'bg-brand-primary text-sport-bg' : 'bg-sport-card text-white'}`}>
        <div className={`flex items-center justify-center w-10 h-10 rounded-full ${props.isHighlight ? 'bg-white/20' : 'bg-sport-bg border border-sport-card-border'} shrink-0`}>
            {props.icon}
        </div>
        <div className={'flex-1'}>
            <div className={`text-xs font-bold uppercase mb-0.5 ${props.isHighlight ? 'text-sport-bg/70' : 'text-brand-primary'}`}>
                {props.points} {props.points === 1 ? 'bod' : (props.points >= 2 && props.points <= 4 ? 'body' : 'bodů')}
            </div>
            <div className={'text-sm font-medium leading-tight'}>
                {props.text.split(':')[1] || props.text}
            </div>
        </div>
    </Card>
);

type RuleItemProps = {
    title: string;
    text: string;
    icon?: React.ReactNode;
};

const RuleItem: React.FC<RuleItemProps> = (props: RuleItemProps): React.ReactElement => (
    <div className={'bg-sport-card/50 border border-sport-card-border/50 rounded-xl p-4'}>
        <h3 className={'font-bold text-white mb-2 flex items-center gap-2'}>
            {props.icon}
            {props.title}
        </h3>
        <p className={'text-sm text-text-secondary leading-relaxed'}>
            {props.text}
        </p>
    </div>
);
