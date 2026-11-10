
import { useState } from 'react';
import './App.css';

import HomePage from './pages/HomePage.tsx';
import Settingspage from './pages/Settingspage.tsx';
import Meallog from './pages/Meallog.tsx';

function App() {
    const [currentPage, setCurrentPage] = useState('home');

    return (
        <section className="App">
            {currentPage === 'home' ? (
                <HomePage onNavigate={setCurrentPage} />
            ) : currentPage === 'settings' ? (
                <Settingspage onNavigate={setCurrentPage} />
            ) : currentPage === 'meallog' ? (
                <Meallog onNavigate={setCurrentPage} />
            ) : (
                <HomePage onNavigate={setCurrentPage} />
            )}
        </section>
    );
}

export default App;
