import './NavBar.css';
import { IoIosHome } from "react-icons/io";
import { GiMeal } from "react-icons/gi";
import { FaPlus } from "react-icons/fa";
import { IoMdSettings } from "react-icons/io";
import { IoPerson } from "react-icons/io5";

interface NavBarProps {
    onOpenMenu?: () => void;
}

function NavBar({ onOpenMenu }: NavBarProps) {
    return (
        <section>
            <nav className="NavBar">
                <button className="Buttontype1 active"><IoIosHome /><p>Home</p></button>
                <button className="Buttontype1"><GiMeal /><p>Meal log</p></button>
                <button className="Buttontype2" onClick={onOpenMenu}>
                    <FaPlus />
                </button>
                <button className="Buttontype1"><IoMdSettings /><p>Settings</p></button>
                <button className="Buttontype1"><IoPerson /><p>Profile</p></button>
            </nav>
        </section>
    );
}

export default NavBar;