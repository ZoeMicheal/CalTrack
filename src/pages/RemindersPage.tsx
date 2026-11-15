import { useEffect, useState } from 'react';
import NavBar from '../components/NavBar';
import './RemindersPage.css';

interface RemindersPageProps {
    onBack: () => void;
    onNavigate?: (page: string) => void;
}

type Reminder = {
    id: string;
    label: string;
    time: string;
    enabled: boolean;
};

const defaultReminders: Reminder[] = [
    { id: 'breakfast', label: 'Breakfast', time: '09:00', enabled: true },
    { id: 'lunch', label: 'Lunch', time: '13:00', enabled: true },
    { id: 'dinner', label: 'Dinner', time: '17:00', enabled: true },
];

const storageKey = 'caltrack-reminders';

function RemindersPage({ onBack, onNavigate }: RemindersPageProps) {
    const [reminders, setReminders] = useState<Reminder[]>(() => {
        try {
            const saved = localStorage.getItem(storageKey);
            if (saved) {
                const parsed = JSON.parse(saved);
                if (Array.isArray(parsed)) {
                    return defaultReminders.map((item) => {
                        const existing = parsed.find((r) => r.id === item.id);
                        return existing
                            ? {
                                ...item,
                                time: typeof existing.time === 'string'
                                    ? existing.time
                                    : item.time,
                                enabled: typeof existing.enabled === 'boolean'
                                    ? existing.enabled
                                    : item.enabled,
                            }
                            : item;
                    });
                }
            }
        } catch (error) {
            console.error('Unable to load reminders:', error);
        }
        return defaultReminders;
    });

    const [saveMessage, setSaveMessage] = useState('');

    const updateReminder = (
        id: string,
        changes: Partial<Reminder>
    ) => {
        setReminders((current) =>
            current.map((item) =>
                item.id === id ? { ...item, ...changes } : item
            )
        );
        setSaveMessage('');
    };

    const saveReminders = () => {
        localStorage.setItem(storageKey, JSON.stringify(reminders));
        setSaveMessage('Your reminder preferences have been saved!');
    };

    useEffect(() => {
        if (!('Notification' in window)) return;

        let lastCheckedMinute = '';

        const checkReminders = () => {
            if (Notification.permission !== 'granted') return;

            const now = new Date();
            const currentTime = now.toTimeString().slice(0, 5);
            const currentMinute = `${now.toDateString()}-${currentTime}`;

            if (lastCheckedMinute === currentMinute) return;
            lastCheckedMinute = currentMinute;

            const saved = localStorage.getItem(storageKey);
            if (!saved) return;

            let activeReminders: Reminder[];
            try {
                activeReminders = JSON.parse(saved);
            } catch {
                return;
            }

            activeReminders.forEach((reminder) => {
                if (reminder.enabled && reminder.time === currentTime) {
                    new Notification('CalTrack Meal Reminder', {
                        body: `It's time to log your ${reminder.label.toLowerCase()}!`,
                    });
                }
            });
        };

        checkReminders();
        const interval = window.setInterval(checkReminders, 15000);
        return () => window.clearInterval(interval);
    }, []);

    const requestNotifications = async () => {
        if (!('Notification' in window)) {
            setSaveMessage('This browser does not support notifications.');
            return;
        }

        const permission = await Notification.requestPermission();

        setSaveMessage(
            permission === 'granted'
                ? 'Notifications enabled!'
                : 'Notification permission was not granted.'
        );
    };

    return (
        <section className="SettingsPage RemindersPage">
            <div className="RemindersHeader">
                <button
                    type="button"
                    className="RemindersBack"
                    onClick={onBack}
                    aria-label="Back to Settings"
                >
                    &#8592;
                </button>
                <h2>Reminders</h2>
            </div>

            <div className="RemindersContent">
                <p className="RemindersDescription">
                    Choose when CalTrack should remind you to log your meals.
                </p>

                {reminders.map((reminder) => (
                    <div className="ReminderCard" key={reminder.id}>
                        <div className="ReminderCardTop">
                            <label htmlFor={`enabled-${reminder.id}`}>
                                {reminder.label}
                            </label>
                            <input
                                id={`enabled-${reminder.id}`}
                                type="checkbox"
                                checked={reminder.enabled}
                                onChange={(e) =>
                                    updateReminder(reminder.id, {
                                        enabled: e.target.checked
                                    })
                                }
                            />
                        </div>

                        <label
                            className="ReminderTimeLabel"
                            htmlFor={`time-${reminder.id}`}
                        >
                            Reminder time
                        </label>
                        <input
                            id={`time-${reminder.id}`}
                            className="ReminderTime"
                            type="time"
                            value={reminder.time}
                            disabled={!reminder.enabled}
                            onChange={(e) =>
                                updateReminder(reminder.id, {
                                    time: e.target.value
                                })
                            }
                        />
                    </div>
                ))}

                <button
                    type="button"
                    className="ReminderPermissionButton"
                    onClick={requestNotifications}
                >
                    Enable Browser Notifications
                </button>

                <button
                    type="button"
                    className="ReminderSaveButton"
                    onClick={saveReminders}
                >
                    Save Reminders
                </button>

                {saveMessage && (
                    <p className="ReminderMessage" role="status">
                        {saveMessage}
                    </p>
                )}

                <p className="ReminderNote">
                    Notifications work while CalTrack is open in your browser.
                </p>
            </div>

            <NavBar
                onNavigate={onNavigate}
                currentPage="settings"
            />
        </section>
    );
}

export default RemindersPage;
