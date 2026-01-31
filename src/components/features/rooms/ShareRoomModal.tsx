import * as React from 'react';
import QRCode from 'react-qr-code';
import { X, Copy, Check } from 'lucide-react';
import { Button } from '../../ui/Button';

type ShareRoomModalProps = {
    isOpen: boolean;
    onClose: () => void;
    roomName: string;
    roomId: string; // The invitation code
};

export const ShareRoomModal: React.FC<ShareRoomModalProps> = (props: ShareRoomModalProps): React.ReactElement | null => {
    const [copied, setCopied] = React.useState(false);

    if (!props.isOpen) return null;

    // Use absolute URL for sharing
    const shareUrl = `${window.location.origin}/join/${props.roomId}`;

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(shareUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy', err);
        }
    };

    return (
        <div className={'fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200'}>
            <div
                className={'bg-surface-primary w-full max-w-sm rounded-2xl border border-border-primary shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200'}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className={'flex items-center justify-between p-4 border-b border-border-primary/50'}>
                    <h3 className={'font-bold text-white text-lg'}>Invite Colleagues</h3>
                    <Button
                        variant={'ghost'}
                        size={'icon'}
                        onClick={props.onClose}
                    >
                        <X className={'w-5 h-5 text-text-secondary'} />
                    </Button>
                </div>

                <div className={'p-6 space-y-6 flex flex-col items-center'}>
                    <div className={'text-center space-y-1'}>
                        <p className={'text-text-secondary text-sm'}>Room</p>
                        <h4 className={'text-xl font-bold text-white'}>{props.roomName}</h4>
                    </div>

                    {/* QR Code */}
                    <div className={'bg-white p-4 rounded-xl'}>
                        <QRCode
                            value={shareUrl}
                            size={180}
                            style={{ height: 'auto', maxWidth: '100%', width: '100%' }}
                            viewBox={'0 0 256 256'}
                        />
                    </div>

                    {/* Link Section */}
                    <div className={'w-full space-y-2'}>
                        <label className={'text-xs font-semibold text-text-secondary uppercase tracking-wider'}>
                            Share Link
                        </label>
                        <div className={'flex gap-2'}>
                            <div className={'flex-1 bg-surface-secondary rounded-lg px-3 py-2 text-sm text-text-primary truncate font-mono border border-border-primary/50'}>
                                {shareUrl}
                            </div>
                            <Button
                                variant={copied ? 'primary' : 'secondary'}
                                size={'icon'}
                                onClick={handleCopy}
                                className={'shrink-0'}
                            >
                                {copied ? <Check className={'w-4 h-4'} /> : <Copy className={'w-4 h-4'} />}
                            </Button>
                        </div>
                    </div>

                    <div className={'w-full text-center'}>
                        <p className={'text-xs text-text-tertiary'}>
                            Room Code: <span className={'font-mono text-text-secondary'}>{props.roomId}</span>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
