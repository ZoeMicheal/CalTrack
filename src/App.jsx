import { useEffect, useState } from 'react';
import { SignedOut, SignInButton, SignUpButton } from '@clerk/clerk-react';
import './App.css';
import './pages/HomePage.css'; // Ensures modal-overlay and pink-bubble-modal styles load globally

import HomePage from './pages/HomePage.tsx';
import Settingspage from './pages/Settingspage.tsx';
import Meallog from './pages/Meallog.tsx';
import ProfilePage from './pages/ProfilePage.tsx';
import ToastNotification from './components/ToastNotification';
import CalTrackDialog from './components/CalTrackDialog';

function App() {
    const [currentPage, setCurrentPage] = useState('home');

    useEffect(() => {
        const savedTheme = localStorage.getItem('caltrack-theme');
        const theme = ['light', 'dark', 'system'].includes(savedTheme)
            ? savedTheme
            : 'system';

        document.documentElement.setAttribute('data-theme', theme);
    }, []);


    return (
        <section className="App">
            <CalTrackDialog />
            <ToastNotification />
            {currentPage === 'home' ? (
                <HomePage onNavigate={setCurrentPage} />
            ) : currentPage === 'settings' ? (
                <Settingspage onNavigate={setCurrentPage} />
            ) : currentPage === 'meallog' ? (
                <Meallog onNavigate={setCurrentPage} />
            ) : currentPage === 'profile' ? (
                <ProfilePage onNavigate={setCurrentPage} />
            ) : (
                <HomePage onNavigate={setCurrentPage} />
            )}

            <SignedOut>
                <div className="modal-overlay">
                    <div className="pink-bubble-modal auth-welcome-modal">
                        <h3>Welcome!</h3>
                        <p>
                            Create an account or log in to start logging meals and tracking your daily goals.
                        </p>

                        <SignUpButton mode="modal">
                            <button type="button" className="bubbly-primary-btn">
                                Create an Account
                            </button>
                        </SignUpButton>

                        <SignInButton mode="modal">
                            <button type="button" className="bubbly-secondary-btn">
                                Log In
                            </button>
                        </SignInButton>
                    </div>
                </div>
            </SignedOut>
        </section>
    );
}

export default App;