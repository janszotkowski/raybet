import * as React from 'react';
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { authService } from '../lib/appwrite/services/authService';
import { useAuthStore } from '../lib/store/authStore';
import { Loader2 } from 'lucide-react';

export const Route = createFileRoute('/signup')({
    validateSearch: (search: Record<string, unknown>) => {
        return {
            redirect: (search.redirect as string) || undefined,
        };
    },
    component: SignUpPage,
});

function SignUpPage() {
    const [name, setName] = React.useState('');
    const [email, setEmail] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [error, setError] = React.useState<string | null>(null);
    const [isLoading, setIsLoading] = React.useState(false);

    const {login} = useAuthStore();
    const navigate = useNavigate();
    const search = Route.useSearch();

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        try {
            await authService.createAccount(email, password, name);
            await authService.createSession(email, password);
            const user = await authService.getAccount();
            login(user);

            if (search.redirect) {
                await navigate({to: search.redirect});
            } else {
                await navigate({to: '/'});
            }
        } catch (err: unknown) {
            console.error('Sign up failed', err);
            setError('Registrace se nezdařila. Zkuste to prosím znovu.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={'flex flex-col items-center justify-center min-h-[80vh] px-4 space-y-8'}>
            <div className={'text-center space-y-2'}>
                <h1 className={'text-3xl font-bold text-white'}>Vytvořit účet</h1>
                <p className={'text-text-secondary'}>Zaregistruj se a začni tipovat</p>
            </div>

            <form onSubmit={handleSignUp} className={'w-full max-w-sm space-y-4'}>
                <Input
                    label={'Jméno'}
                    type={'text'}
                    placeholder={'Jan Novák'}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                />
                <Input
                    label={'Email'}
                    type={'email'}
                    placeholder={'jan@example.com'}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <Input
                    label={'Heslo'}
                    type={'password'}
                    placeholder={'••••••••'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={8}
                />

                {error && <p className={'text-status-error text-sm'}>{error}</p>}

                <Button
                    variant={'primary'}
                    size={'lg'}
                    className={'w-full mt-4'}
                    disabled={isLoading}
                    type={'submit'}
                >
                    {isLoading ? <Loader2 className={'animate-spin'}/> : 'Zaregistrovat se'}
                </Button>
            </form>

            <p className={'text-text-secondary text-sm'}>
                Už máš účet?{' '}
                <Link
                    to={'/signin'}
                    className={'text-brand-primary hover:underline font-medium'}
                    search={{redirect: search.redirect || undefined}}
                >
                    Přihlaš se
                </Link>
            </p>
        </div>
    );
}
