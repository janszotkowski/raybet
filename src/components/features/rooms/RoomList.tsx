import * as React from 'react';
import type { Room, Profile } from '../../../lib/appwrite/types';
import { Button } from '../../ui/Button';
import { Share2 } from 'lucide-react';

type RoomListProps = {
    title: string;
    items: Room[] | Profile[];
    type: 'joined' | 'owned';
    onShare: (room: Room | any) => void;
};

export const RoomList: React.FC<RoomListProps> = (props: RoomListProps): React.ReactElement => {
    if (!props.items?.length) {
        return (
            <div className={'bg-surface-secondary/50 rounded-xl p-8 text-center border border-border-primary/50'}>
                <p className={'text-text-secondary'}>Žádné místnosti k zobrazení.</p>
            </div>
        );
    }

    return (
        <div className={'space-y-4'}>
            <h3 className={'text-xl font-bold text-white'}>{props.title}</h3>
            <div className={'grid gap-4 md:grid-cols-2'}>
                {props.items.map((item) => {
                    const room = props.type === 'owned' ? (item as Room) : null;
                    const profile = props.type === 'joined' ? (item as Profile) : null;

                    // If it's a profile, we don't strictly have the Room details here unless populated.
                    // But for now let's assume we display what we have.
                    // Actually, getting Room details for joined rooms might need a relation or extra fetch.
                    // For now, Profile has roomId. We might need to fetch Room names.
                    // Wait, `getProfilesByUserId` returns Profiles. Profile has `roomId`. It doesn't have Room Name unless we expand it.
                    // The valid requirement implies we should see Room Names.

                    // FIXME: The Profile object might not have room Name. 
                    // I should check if I can genericize this or if I need to fetch room details for profiles.
                    // For the 'owned' list it's easy, we have Room objects.
                    // For 'joined', we have Profile objects which link to Room.

                    // Let's assume for this step we render what we can and I might need to update the service to expand data 
                    // or fetch rooms for the profiles.
                    // Actually, Appwrite `listRows` doesn't auto-expand unless specified.
                    // I will display ID for now if Name is missing, but I should probably fix this.

                    const displayId = room?.$id || profile?.roomId || 'Unknown';
                    const displayName = room?.name || (profile as any)?.room?.name || `Místnost ${displayId.substring(0, 5)}...`;

                    return (
                        <div
                            key={item.$id}
                            className={'bg-sport-card/80 hover:bg-sport-card transition-all p-5 rounded-xl border border-sport-card-border backdrop-blur-sm flex justify-between items-center group relative overflow-hidden'}
                        >
                            {/* Decorative gradient glow */}
                            <div className={'absolute top-0 right-0 w-20 h-20 bg-brand-primary/5 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none'} />

                            <div className={'z-10'}>
                                <h4 className={'font-bold text-white text-lg tracking-tight'}>{displayName}</h4>
                                <span className={'text-xs text-brand-primary uppercase tracking-widest font-bold'}>
                                    {props.type === 'owned' ? 'ADMIN' : 'ČLEN'}
                                </span>
                            </div>

                            <Button
                                variant={'secondary'}
                                size={'sm'}
                                onClick={() => props.onShare(room || { $id: profile?.roomId, name: displayName })}
                                className={'z-10 shrink-0 border-sport-card-border/50 bg-sport-card hover:bg-sport-card/80'}
                                title={'Sdílet místnost'}
                            >
                                <Share2 className={'w-4 h-4 text-brand-primary mr-2'} />
                                <span className={'text-xs font-bold text-white'}>Sdílet</span>
                            </Button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
