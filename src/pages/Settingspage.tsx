import { useState } from 'react';
import GoalsPage from './GoalsPage';
import AppearancePage from './AppearancePage';
import RemindersPage from './RemindersPage';
import HistoryPage from './HistoryPage';
import NavBar from '../components/NavBar';
import './Settingspage.css';
import { IoIosArrowForward } from "react-icons/io";


interface SettingspageProps {
    onNavigate?: (page: string) => void;
}

function Settingspage({ onNavigate }: SettingspageProps) {
    const [showGoals, setShowGoals] = useState(false);
    const [showAppearance, setShowAppearance] = useState(false);
    const [showReminders, setShowReminders] = useState(false);
    const [showHistory, setShowHistory] = useState(false);

    if (showGoals) {
        return (
            <GoalsPage
                onBack={() => setShowGoals(false)}
                onNavigate={onNavigate}
            />
        );
    }

    if (showAppearance) {
        return (
            <AppearancePage
                onBack={() => setShowAppearance(false)}
                onNavigate={onNavigate}
            />
        );
    }

    if (showReminders) {
        return (
            <RemindersPage
                onBack={() => setShowReminders(false)}
                onNavigate={onNavigate}
            />
        );
    }

    if (showHistory) {
        return (
            <HistoryPage
                onBack={() => setShowHistory(false)}
                onNavigate={onNavigate}
            />
        );
    }


    const settings = [
        { id: 1, label: 'Goals' },
        { id: 2, label: 'Appearance' },
        { id: 3, label: 'Reminders' },
        { id: 4, label: 'History' },
    ];

    return (
<section className="SettingsPage">
    <div className="SettingsHeader"> Settings </div>

    <ul className="SettingsMenu">
         {settings.map((settings)=>(
             <button
                 key={settings.id}
                 className="SettingsItem"
                 onClick={() => {
                     if (settings.label === 'Goals') {
                         setShowGoals(true);
                     } else if (settings.label === 'Appearance') {
                         setShowAppearance(true);
                     } else if (settings.label === 'Reminders') {
                         setShowReminders(true);
                     } else if (settings.label === 'History') {
                         setShowHistory(true);
                     }
                 }}
             >
                 <p>{settings.label}</p>
                 <div className="ArrowButton">< IoIosArrowForward/></div>
             </button>
         ))}
     </ul>
    <NavBar
        onOpenMenu={() => {}}
        onNavigate={onNavigate}
        currentPage="settings"
    />

</section>
    );
}
export default Settingspage;