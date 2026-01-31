import * as React from 'react';
import { useLanguageStore } from '@/lib/store/languageStore';
import { Globe } from 'lucide-react';

type LanguageSwitcherProps = {
    className?: string;
};

const labels: Record<string, string> = {
    cs: 'Čeština',
    en: 'English',
    de: 'Deutsch',
    pl: 'Polski',
};

const flags: Record<string, string> = {
    cs: '🇨🇿',
    en: '🇬🇧',
    de: '🇩🇪',
    pl: '🇵🇱',
};

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = (props: LanguageSwitcherProps): React.ReactElement => {
    const {language, setLanguage} = useLanguageStore();
    const [isOpen, setIsOpen] = React.useState(false);

    // Close on click outside
    const ref = React.useRef<HTMLDivElement>(null);
    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (ref.current && !ref.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (lang: string) => {
        setLanguage(lang);
        setIsOpen(false);
    };

    return (
        <div className={`relative ${props.className || ''}`} ref={ref}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={'flex items-center gap-2 px-3 py-2 rounded-lg bg-sport-card hover:bg-sport-card/80 border border-white/10 text-text-primary transition-all text-sm font-medium'}
            >
                <span className={'text-lg leading-none'}>{flags[language]}</span>
                <span className={'hidden sm:inline'}>{labels[language]}</span>
                <Globe size={14} className={'opacity-50'}/>
            </button>

            {isOpen && (
                <div className={'absolute top-full right-0 mt-2 w-40 max-h-60 overflow-y-auto bg-sport-card border border-white/10 rounded-lg shadow-xl z-50'}>
                    <div className={'py-1'}>
                        {Object.keys(labels).map((lang) => (
                            <button
                                key={lang}
                                onClick={() => handleSelect(lang)}
                                className={`w-full text-left px-4 py-2 text-sm flex items-center gap-3 hover:bg-white/5 transition-colors ${language === lang ? 'bg-white/5 text-brand-primary' : 'text-text-secondary'
                                }`}
                            >
                                <span className={'text-lg leading-none'}>{flags[lang]}</span>
                                {labels[lang]}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};
