import { createFileRoute } from '@tanstack/react-router';
import * as React from 'react';
import { useAuthStore } from '../lib/store/authStore';
import { useProfileStore } from '../lib/store/profileStore';
import { CreateRoomForm } from '../components/features/rooms/CreateRoomForm';
import { JoinRoomForm } from '../components/features/rooms/JoinRoomForm';
import { MatchList } from '../components/features/matches/MatchList';
import { Button } from '../components/ui/Button';

export const Route = createFileRoute('/')({
    component: IndexPage,
});

function IndexPage() {
    const {user} = useAuthStore();
    const {profile} = useProfileStore();
    const [view, setView] = React.useState<'selection' | 'create' | 'join'>('selection');

    // Authenticated and has room -> Show Dashboard
    if (profile?.roomId) {
        return (
            <div className={'flex flex-col gap-4 -mx-4'}>
                <div className={'bg-brand-dark px-4 py-2'}>
                    <h1 className={'text-white font-bold text-lg'}>Matches</h1>
                </div>
                <div className={'px-4'}>
                    <MatchList/>
                </div>
            </div>
        );
    }

    // Authenticated but no room -> Onboarding
    return (
        <div className={'flex flex-col gap-6 pt-10 px-2'}>
            <div className={'text-center space-y-2'}>
                <h1 className={'text-2xl font-bold text-brand-dark'}>Welcome, {user?.name}!</h1>
                <p className={'text-slate-500 text-sm'}>To get started, you need to join a room.</p>
            </div>

            {view === 'selection' && (
                <div className={'flex flex-col gap-4 mt-4'}>
                    <Button
                        variant={'primary'}
                        size={'lg'}
                        onClick={() => setView('join')}
                    >
                        I have a room code
                    </Button>
                    <div className={'relative flex py-2 items-center'}>
                        <div className={'grow border-t border-slate-300'}></div>
                        <span className={'shrink mx-4 text-slate-400 text-xs'}>OR</span>
                        <div className={'grow border-t border-slate-300'}></div>
                    </div>
                    <Button variant={'outline'} onClick={() => setView('create')}>
                        Create a new room
                    </Button>
                </div>
            )}

            {view === 'create' && (
                <div className={'flex flex-col gap-2'}>
                    <Button
                        variant={'ghost'}
                        size={'sm'}
                        onClick={() => setView('selection')}
                        className={'self-start -ml-2'}
                    >
                        ← Back
                    </Button>
                    <CreateRoomForm/>
                </div>
            )}

            {view === 'join' && (
                <div className={'flex flex-col gap-2'}>
                    <Button
                        variant={'ghost'}
                        size={'sm'}
                        onClick={() => setView('selection')}
                        className={'self-start -ml-2'}
                    >
                        ← Back
                    </Button>
                    <JoinRoomForm/>
                </div>
            )}
        </div>
    );
}