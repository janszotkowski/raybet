import * as React from 'react';
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { authService } from '@/lib/appwrite/services/authService';
import { useAuthStore } from '@/lib/store/authStore';
import { Loader2 } from 'lucide-react';
import * as m from '../paraglide/messages';

export const Route = createFileRoute('/signin')({
    validateSearch: (search: Record<string, unknown>) => {
        return {
            redirect: (search.redirect as string) || undefined,
        };
    },
    component: SignInPage,
});

function SignInPage() {
    const [email, setEmail] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [error, setError] = React.useState<string | null>(null);
    const [isLoading, setIsLoading] = React.useState(false);

    const {login} = useAuthStore();
    const navigate = useNavigate();
    const search = Route.useSearch();

    const handleSignIn = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        try {
            await authService.createSession(email, password);
            const user = await authService.getAccount();
            login(user);

            if (search.redirect) {
                await navigate({to: search.redirect});
            } else {
                await navigate({to: '/'});
            }
        } catch (err: unknown) {
            console.error('Sign in failed', err);
            setError(m.err_signin_failed());
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={'flex flex-col items-center justify-center min-h-[80vh] px-4 space-y-8'}>
            <div className={'text-center space-y-2'}>
                <h1 className={'text-3xl font-bold text-white'}>{m.signin_title()}</h1>
                <p className={'text-text-secondary'}>{m.signin_subtitle()}</p>
            </div>

            <form onSubmit={handleSignIn} className={'w-full max-w-sm space-y-4'}>
                <Input
                    label={m.label_email()}
                    type={'email'}
                    placeholder={'john@example.com'}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <Input
                    label={m.label_password()}
                    type={'password'}
                    placeholder={'••••••••'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />

                {error && <p className={'text-status-error text-sm'}>{error}</p>}

                <Button
                    variant={'primary'}
                    size={'lg'}
                    className={'w-full mt-4'}
                    disabled={isLoading}
                    type={'submit'}
                >
                    {isLoading ? <Loader2 className={'animate-spin'}/> : m.action_sign_in()}
                </Button>
            </form>

            <p className={'text-text-secondary text-sm'}>
                {m.signin_no_account()}{' '}
                <Link
                    to={'/signup'}
                    className={'text-brand-primary hover:underline font-medium'}
                    search={{redirect: search.redirect || undefined}}
                >
                    {m.action_sign_up()}
                </Link>
            </p>
        </div>
    );
}
