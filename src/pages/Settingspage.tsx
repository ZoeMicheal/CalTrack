import { useState } from 'react';
import GoalsPage from './GoalsPage';
import NavBar from '../components/NavBar';
import './Settingspage.css';
import { IoIosArrowForward } from "react-icons/io";


interface SettingspageProps {
    onNavigate?: (page: string) => void;
}

function Settingspage({ onNavigate }: SettingspageProps) {
    const [showGoals, setShowGoals] = useState(false);

    if (showGoals) {
        return (
            <GoalsPage
                onBack={() => setShowGoals(false)}
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