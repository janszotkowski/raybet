import * as React from 'react';
import { createFileRoute, useNavigate, Link } from '@tanstack/react-router';
import { useAuthStore } from '../../lib/store/authStore';
import { useProfileStore } from '../../lib/store/profileStore';
import { roomService } from '../../lib/appwrite/services/roomService';
import { playerService } from '../../lib/appwrite/services/playerService';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Loader2 } from 'lucide-react';
import { ID } from 'appwrite';

export const Route = createFileRoute('/join/$roomId')({
    component: JoinRoomPage,
});

function JoinRoomPage() {
    const { roomId } = Route.useParams();
    const navigate = useNavigate();
    const { userId, setUserId } = useAuthStore();
    const { setProfile } = useProfileStore();

    const [isLoading, setIsLoading] = React.useState(true);
    const [isJoining, setIsJoining] = React.useState(false);
    const [roomName, setRoomName] = React.useState<string | null>(null);
    const [error, setError] = React.useState<string | null>(null);
    const [nickname, setNickname] = React.useState('');

    // Fetch room details and check if already member
    React.useEffect(() => {
        const checkRoom = async () => {
            try {
                // 1. Check if room exists
                const room = await roomService.getRoom(roomId);
                if (!room) {
                    setError('Tato místnost neexistuje.');
                    setIsLoading(false);
                    return;
                }
                setRoomName(room.name);

                // 2. If logged in, check if already joined
                if (userId) {
                    const profiles = await playerService.getProfilesByUserId(userId);
                    const existingMembership = profiles.find(p => p.roomId === roomId);

                    if (existingMembership) {
                        // Already joined -> set as active profile and redirect
                        setProfile(existingMembership);
                        navigate({ to: '/' });
                        return;
                    }

                    // Pre-fill nickname if they have other profiles
                    if (profiles.length > 0) {
                        setNickname(profiles[0].nickname);
                    }
                }
            } catch (err) {
                console.error(err);
                setError('Nepodařilo se načíst informace o místnosti.');
            } finally {
                setIsLoading(false);
            }
        };

        checkRoom();
    }, [roomId, userId, navigate, setProfile]);

    const handleJoin = async () => {
        if (!nickname.trim()) return;
        setIsJoining(true);
        setError(null);

        try {
            const currentUserId = userId || ID.unique();
            // If not logged in, we set the ID now. 
            // NOTE: Real auth flow might require registration first. 
            // The current app seems to use "userId" as a simple specialized ID or expects the user to be handled.
            // Based on JoinRoomForm, if !userId, it sets one.
            if (!userId) {
                setUserId(currentUserId);
            }

            const profile = await playerService.createProfile({
                userId: currentUserId,
                nickname: nickname,
                roomId: roomId
            });

            setProfile(profile);
            await navigate({ to: '/' });

        } catch (err) {
            console.error('Failed to join:', err);
            setError('Nepodařilo se připojit k místnosti.');
        } finally {
            setIsJoining(false);
        }
    };

    if (isLoading) {
        return (
            <div className={'flex justify-center items-center h-screen bg-surface-primary'}>
                <Loader2 className={'animate-spin text-brand-primary'} size={32} />
            </div>
        );
    }

    if (error) {
        return (
            <div className={'flex flex-col items-center justify-center h-screen p-4 bg-surface-primary text-center space-y-4'}>
                <h1 className={'text-2xl font-bold text-white'}>Chyba</h1>
                <p className={'text-status-error'}>{error}</p>
                <Link to={'/'}>
                    <Button variant={'secondary'}>Zpět na domovskou stránku</Button>
                </Link>
            </div>
        );
    }

    return (
        <div className={'min-h-screen bg-surface-primary flex items-center justify-center p-4'}>
            <div className={'w-full max-w-md bg-surface-secondary/30 p-8 rounded-2xl border border-border-primary/50 backdrop-blur-sm space-y-6'}>
                <div className={'text-center space-y-2'}>
                    <span className={'text-xs font-bold text-brand-primary uppercase tracking-widest'}>Pozvánka</span>
                    <h1 className={'text-3xl font-bold text-white'}>Připoj se do hry!</h1>
                    <p className={'text-text-secondary'}>
                        Byl jsi pozván do místnosti <span className={'font-bold text-white'}>{roomName}</span>.
                    </p>
                </div>

                <div className={'space-y-4'}>
                    {!userId && (
                        <div className={'bg-blue-500/10 text-blue-200 text-sm p-3 rounded-lg border border-blue-500/20 mb-4'}>
                            Tip: Pokud už máš účet, přihlaš se v jiné záložce a obnov tuto stránku.
                            {/* Ideally implement login here or link to login. 
                                 For now, standardizing on the simplified auth model of this app. */}
                        </div>
                    )}

                    <div className={'relative'}>
                        <Input
                            label={'Tvoje přezdívka'}
                            placeholder={'Jan'}
                            value={nickname}
                            onChange={(e) => setNickname(e.target.value)}
                        // If userId exists, maybe we allow changing nickname for this specific room? Yes.
                        />
                    </div>

                    <Button
                        variant={'primary'}
                        size={'lg'}
                        className={'w-full'}
                        onClick={handleJoin}
                        isLoading={isJoining}
                        disabled={!nickname.trim()}
                    >
                        Vstoupit do místnosti
                    </Button>
                </div>
            </div>
        </div>
    );
}
