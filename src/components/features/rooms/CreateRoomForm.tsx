import * as React from 'react';
import { Button } from '../../ui/Button';
import { Input } from '../../ui/Input';
import { roomService } from '@/lib/appwrite/services/roomService';
import { playerService } from '@/lib/appwrite/services/playerService';
import { useAuthStore } from '@/lib/store/authStore';
import { useProfileStore } from '@/lib/store/profileStore';
import { useNavigate } from '@tanstack/react-router';
import * as m from '../../../paraglide/messages';
import { toast } from 'sonner';

export const CreateRoomForm: React.FC = (): React.ReactElement => {
    const [roomName, setRoomName] = React.useState('');
    const [nickname, setNickname] = React.useState('');
    const [isLoading, setIsLoading] = React.useState(false);

    const {userId} = useAuthStore();
    const {setProfile} = useProfileStore();
    const navigate = useNavigate();

    const handleCreate = async () => {
        if (!roomName.trim() || !nickname.trim() || !userId) return;

        // Constraint check: if user already has a profile, they can't create a new room (in this simple model)
        // Adjust this logic if multi-room is allowed.
        // Based on "cannot create new room" bug, maybe they are failing silently.

        setIsLoading(true);
        try {
            const room = await roomService.createRoom({
                name: roomName,
                ownerId: userId,
            });

            const profile = await playerService.createProfile({
                userId: userId,
                nickname: nickname,
                roomId: room.$id,
            });

            setProfile(profile);
            toast.success(m.success_room_created());
            await navigate({to: '/'});

        } catch (error) {
            console.error('Failed to create room:', error);
            toast.error(m.err_create_room_failed());
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={'flex flex-col gap-6'}>
            <div className={'space-y-1'}>
                <h2 className={'text-[28px] font-bold text-white tracking-tight'}>{m.room_create_title()}</h2>
                <p className={'text-[17px] text-text-secondary'}>{m.room_create_subtitle()}</p>
            </div>

            <div className={'space-y-4'}>
                <div className={'space-y-2'}>
                    <Input
                        label={m.label_nickname()}
                        placeholder={m.nickname_placeholder()}
                        value={nickname}
                        onChange={(e) => setNickname(e.target.value)}
                    />
                    <Input
                        label={m.label_room_name()}
                        placeholder={m.room_name_placeholder()}
                        value={roomName}
                        onChange={(e) => setRoomName(e.target.value)}
                    />
                </div>

                <div className={'pt-4'}>
                    <Button
                        variant={'primary'}
                        size={'lg'}
                        className={'w-full'}
                        onClick={handleCreate}
                        isLoading={isLoading}
                        disabled={!roomName || !nickname}
                    >
                        {m.action_create_and_enter()}
                    </Button>
                </div>
            </div>
        </div>
    );
};
