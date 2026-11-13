import { useState } from 'react';
import NavBar from '../components/NavBar';
import './Settingspage.css';
import './AppearancePage.css';

type Theme = 'light' | 'dark' | 'system';

interface AppearancePageProps {
    onBack: () => void;
    onNavigate?: (page: string) => void;
}

function AppearancePage({ onBack, onNavigate }: AppearancePageProps) {
    const [theme, setTheme] = useState<Theme>(() => {
        const saved = localStorage.getItem('caltrack-theme');
        return saved === 'light' || saved === 'dark' || saved === 'system'
            ? saved
            : 'system';
    });

    const changeTheme = (newTheme: Theme) => {
        setTheme(newTheme);
        localStorage.setItem('caltrack-theme', newTheme);
        document.documentElement.setAttribute('data-theme', newTheme);
    };

    return (
        <section className="SettingsPage AppearancePage">
            <div className="AppearanceHeader">
                <button
                    type="button"
                    onClick={onBack}
                    className="AppearanceBack"
                    aria-label="Back to Settings"
                >
                    ←
                </button>
                <h2>Appearance</h2>
            </div>

            <div className="AppearanceContent">
                <h3>Theme</h3>
                <p>Choose how CalTrack looks on your device.</p>

                <div className="ThemeOptions">
                    {(['light', 'dark', 'system'] as Theme[]).map(option => (
                        <label key={option} className="ThemeOption">
                            <span>
                                {option === 'light'
                                    ? 'Light Pink'
                                    : option === 'dark'
                                        ? 'Dark Pink'
                                        : 'System Default'}
                            </span>

                            <input
                                type="radio"
                                name="theme"
                                value={option}
                                checked={theme === option}
                                onChange={() => changeTheme(option)}
                            />
                        </label>
                    ))}
                </div>
            </div>

            <NavBar
                onOpenMenu={() => {}}
                onNavigate={onNavigate}
                currentPage="settings"
            />
        </section>
    );
}

export default AppearancePage;
