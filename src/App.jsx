import { useState } from 'react'
import './App.css'
import HomePage from "./pages/HomePage.tsx";
import Settingspage from "./pages/Settingspage.tsx";

function App() {
    const [currentPage, setCurrentPage] = useState('home');

    return (
        <section className="App">
            {currentPage === 'home' ? (
                <HomePage onNavigate={setCurrentPage}/>
            ) : (
                <Settingspage onNavigate={setCurrentPage}/>
            )}
        </section>
    )
}

export default App
