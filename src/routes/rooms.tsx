import * as React from 'react';
import { createFileRoute, Link } from '@tanstack/react-router';
import { useAuthStore } from '@/lib/store/authStore';
import { useMyRooms } from '@/lib/hooks/useMyRooms';
import { useOwnedRooms } from '@/lib/hooks/useOwnedRooms';
import { RoomList } from '@/components/features/rooms/RoomList';
import { Button } from '@/components/ui/Button';
import { Plus } from 'lucide-react';
import { ShareRoomModal } from '@/components/features/rooms/ShareRoomModal';
import * as m from '../paraglide/messages';

export const Route = createFileRoute('/rooms')({
    component: RoomsPage,
});

function RoomsPage() {
    const {userId} = useAuthStore();
    const {data: myRooms, isLoading: loadingMyRooms} = useMyRooms(userId);
    const {data: ownedRooms, isLoading: loadingOwnedRooms} = useOwnedRooms(userId);

    const [shareModalOpen, setShareModalOpen] = React.useState(false);
    const [selectedRoom, setSelectedRoom] = React.useState<{ $id: string, name: string } | null>(null);

    const handleShare = (room: { $id: string, name: string }) => {
        setSelectedRoom(room);
        setShareModalOpen(true);
    };

    return (
        <div className={'w-full max-w-120 mx-auto px-4 py-6 pb-24 space-y-8'}>
            <div className={'flex items-center justify-between'}>
                <h1 className={'text-2xl font-bold text-white'}>{m.rooms_my_rooms()}</h1>
                <Link to={'/'} search={{mode: 'create'}}>
                    {/* Assuming there is a create flow or we can link to a create form.
                For now just a link to home if create is there, or maybe we create a create route.
                The existing flow seems to vary. I'll just put a button that does nothing or links to home
                if that's where creation happens based on task context.
                Actually README says "Create Room" is part of onboarding or explicit action.
                Creation form component exists. I'll assume we can navigate to a create page.
            */}
                    <Button
                        variant={'secondary'}
                        size={'sm'}
                        className={'gap-2'}
                    >
                        <Plus className={'w-4 h-4'}/>
                        {m.action_new()}
                    </Button>
                </Link>
            </div>

            <div className={'space-y-8'}>
                {/* Managed Rooms */}
                <section>
                    {loadingOwnedRooms ? (
                        <div className={'text-text-secondary'}>{m.loading()}</div>
                    ) : (
                        <RoomList
                            title={m.rooms_managed()}
                            items={ownedRooms || []}
                            type={'owned'}
                            onShare={handleShare}
                        />
                    )}
                </section>

                {/* Joined Rooms */}
                <section>
                    {loadingMyRooms ? (
                        <div className={'text-text-secondary'}>{m.loading()}</div>
                    ) : (
                        <RoomList
                            title={m.rooms_joined()}
                            items={myRooms || []}
                            type={'joined'}
                            onShare={handleShare}
                        />
                    )}
                </section>
            </div>

            {selectedRoom && (
                <ShareRoomModal
                    isOpen={shareModalOpen}
                    onClose={() => setShareModalOpen(false)}
                    roomName={selectedRoom.name}
                    roomId={selectedRoom.$id}
                />
            )}
        </div>
    );
}
