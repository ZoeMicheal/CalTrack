import NavBar from '../components/NavBar';
import './Settingspage.css';
import { IoIosArrowForward } from "react-icons/io";


function Settingspage() {
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
             <button key={settings.id} className="SettingsItem">
                 <p>{settings.label}</p>
                 <div className="ArrowButton">< IoIosArrowForward/></div>
             </button>
         ))}
     </ul>
    <NavBar onOpenMenu={() => {}} />

</section>
    );
}
export default Settingspage;