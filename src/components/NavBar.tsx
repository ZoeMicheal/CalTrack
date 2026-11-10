import './NavBar.css';
import { IoIosHome } from "react-icons/io";
import { GiMeal } from "react-icons/gi";
import { FaPlus } from "react-icons/fa";
import { IoMdSettings } from "react-icons/io";
import { IoPerson } from "react-icons/io5";

interface NavBarProps {
    onOpenMenu?: () => void;
    onNavigate?: (page: string) => void;
    currentPage?: string;
}

function NavBar({ onOpenMenu, onNavigate, currentPage }: NavBarProps) {
    return (
        <section>
            <nav className="NavBar">
                <button
                    className={`Buttontype1 ${currentPage === 'home' ? 'active' : ''}`}
                    onClick={() => onNavigate?.('home')}
                >
                    <IoIosHome />
                    <p>Home</p>
                </button>

                <button className="Buttontype1" onClick={() => onNavigate?.('meallog')}>
                    <GiMeal />
                    <p>Meal log</p>
                </button>

                <button className="Buttontype2" onClick={onOpenMenu}>
                    <FaPlus />
                </button>

                <button
                    className={`Buttontype1 ${currentPage === 'settings' ? 'active' : ''}`}
                    onClick={() => onNavigate?.('settings')}
                >
                    <IoMdSettings />
                    <p>Settings</p>
                </button>
                <button className="Buttontype1"><IoPerson /><p>Profile</p></button>
            </nav>
        </section>
    );
}

export default NavBar;