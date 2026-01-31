import { useNavigate } from '@tanstack/react-router';
import * as React from 'react';
import { playerService } from '../../../lib/appwrite/services/playerService';
import { roomService } from '../../../lib/appwrite/services/roomService';
import { useAuthStore } from '../../../lib/store/authStore';
import { useProfileStore } from '../../../lib/store/profileStore';
import { Button } from '../../ui/Button';
import { Input } from '../../ui/Input';

export const JoinRoomForm: React.FC = (): React.ReactElement => {
    const [roomCode, setRoomCode] = React.useState('');
    const [nickname, setNickname] = React.useState('');
    const [isLoading, setIsLoading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);

    const {userId} = useAuthStore();
    const {setProfile} = useProfileStore();
    const navigate = useNavigate();

    const handleJoin = async () => {
        if (!roomCode.trim() || !nickname.trim()) return;
        setError(null);
        setIsLoading(true);

        try {
            const room = await roomService.getRoom(roomCode);
            if (!room) {
                setError('Room with this code does not exist.');
                setIsLoading(false);
                return;
            }

            // userId is guaranteed by AuthGuard when this component is reached (if strictly used)
            // But checking for safety
            if (!userId) return;

            const profile = await playerService.createProfile({
                userId: userId,
                nickname: nickname,
                roomId: room.$id,
            });

            setProfile(profile);
            await navigate({to: '/'});

        } catch (err: any) {
            console.error('Failed to join room:', err);
            setError('Failed to join the room.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={'flex flex-col gap-6'}>
            <div className={'space-y-1'}>
                <h2 className={'text-[28px] font-bold text-white tracking-tight'}>Welcome back!</h2>
                <p className={'text-[17px] text-text-secondary'}>Join the game with colleagues.</p>
            </div>

            <div className={'space-y-4'}>
                <div className={'space-y-2'}>
                    <Input
                        label={'Nickname'}
                        placeholder={'John'}
                        value={nickname}
                        onChange={(e) => setNickname(e.target.value)}
                    />
                    <Input
                        label={'Code'}
                        placeholder={'RAY-123'}
                        value={roomCode}
                        onChange={(e) => setRoomCode(e.target.value)}
                        error={error || undefined}
                    />
                </div>

                <div className={'pt-4'}>
                    <Button
                        variant={'primary'}
                        size={'lg'}
                        onClick={handleJoin}
                        isLoading={isLoading}
                        disabled={!roomCode || !nickname}
                    >
                        Enter game
                    </Button>
                </div>
            </div>
        </div>
    );
};
