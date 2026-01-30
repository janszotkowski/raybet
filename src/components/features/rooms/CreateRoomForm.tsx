import * as React from 'react';
import { Button } from '../../ui/Button';
import { Input } from '../../ui/Input';
import { roomService } from '../../../lib/appwrite/services/roomService';
import { playerService } from '../../../lib/appwrite/services/playerService';
import { useAuthStore } from '../../../lib/store/authStore';
import { useProfileStore } from '../../../lib/store/profileStore';
import { ID } from 'appwrite';
import { useNavigate } from '@tanstack/react-router';

export const CreateRoomForm: React.FC = (): React.ReactElement => {
    const [roomName, setRoomName] = React.useState('');
    const [nickname, setNickname] = React.useState('');
    const [isLoading, setIsLoading] = React.useState(false);

    const { userId, setUserId } = useAuthStore();
    const { setProfile } = useProfileStore();
    const navigate = useNavigate();

    const handleCreate = async () => {
        if (!roomName.trim() || !nickname.trim()) return;

        setIsLoading(true);
        try {
            const currentUserId = userId || ID.unique();
            if (!userId) setUserId(currentUserId);

            const room = await roomService.createRoom({
                name: roomName,
                ownerId: currentUserId
            });

            const profile = await playerService.createProfile({
                userId: currentUserId,
                nickname: nickname,
                roomId: room.$id
            });

            setProfile(profile);
            await navigate({ to: '/' });

        } catch (error) {
            console.error('Failed to create room:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col gap-6">
            <div className="space-y-1">
                <h2 className="text-[28px] font-bold text-white tracking-tight">Vytvořit hru</h2>
                <p className="text-[17px] text-text-secondary">Založ novou místnost pro kolegy.</p>
            </div>

            <div className="space-y-4">
                <div className="space-y-2">
                    <Input
                        label="Přezdívka"
                        placeholder="Jan"
                        value={nickname}
                        onChange={(e) => setNickname(e.target.value)}
                    />
                    <Input
                        label="Název"
                        placeholder="IT Oddělení"
                        value={roomName}
                        onChange={(e) => setRoomName(e.target.value)}
                    />
                </div>

                <div className="pt-4">
                    <Button
                        variant="primary"
                        size="lg"
                        className="w-full"
                        onClick={handleCreate}
                        isLoading={isLoading}
                        disabled={!roomName || !nickname}
                    >
                        Vytvořit a vstoupit
                    </Button>
                </div>
            </div>
        </div>
    );
};
