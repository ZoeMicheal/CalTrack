import { useEffect, useMemo, useState } from 'react';
import { IoIosArrowBack, IoIosArrowForward } from 'react-icons/io';
import { useAuth, useUser } from '@clerk/clerk-react';
import NavBar from '../components/NavBar';
import './ProfilePage.css';

interface UserGoal {
    _id?: string;
    calorieMin?: number;
    calorieMax?: number;
    proteinTarget?: number;
    carbsTarget?: number;
    fatTarget?: number;
}

interface MealLog {
    _id: string;
    foodName: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    consumedAt: string;
}

interface ProfilePageProps {
    onNavigate?: (page: string) => void;
}

const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

const weekdayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function formatDateKey(date: Date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function ProfilePage({ onNavigate }: ProfilePageProps) {
    const { user, isLoaded } = useUser();
    const { getToken } = useAuth();

    const today = useMemo(() => new Date(), []);
    const [monthView, setMonthView] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));
    const [savedMeals, setSavedMeals] = useState<MealLog[]>([]);
    const [userGoals, setUserGoals] = useState<UserGoal | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!getToken) return;

        const fetchProfileData = async () => {
            try {
                setLoading(true);
                const token = await getToken();

                if (!token) {
                    setSavedMeals([]);
                    setUserGoals(null);
                    return;
                }

                const [mealsResponse, goalsResponse] = await Promise.all([
                    fetch('http://localhost:5000/api/meals', {
                        headers: { Authorization: `Bearer ${token}` },
                    }),
                    fetch('http://localhost:5000/api/goals', {
                        headers: { Authorization: `Bearer ${token}` },
                    }),
                ]);

                if (mealsResponse.ok) {
                    const meals = await mealsResponse.json();
                    setSavedMeals(Array.isArray(meals) ? meals : []);
                }

                if (goalsResponse.ok) {
                    const goalData = await goalsResponse.json();
                    setUserGoals(goalData ?? null);
                }
            } catch (error) {
                console.error('Error loading profile data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchProfileData();
    }, [getToken]);

    const dailyCaloriesByDate = useMemo(() => {
        const totals = new Map<string, number>();

        savedMeals.forEach((meal) => {
            const key = formatDateKey(new Date(meal.consumedAt));
            totals.set(key, (totals.get(key) ?? 0) + (Number(meal.calories) || 0));
        });

        return totals;
    }, [savedMeals]);

    const isGoalReachedForDate = (date: Date) => {
        const goal = userGoals ?? {};
        const dateKey = formatDateKey(date);
        const caloriesToday = dailyCaloriesByDate.get(dateKey) ?? 0;
        const minimum = Number(goal.calorieMin ?? 0);
        const maximum = Number(goal.calorieMax ?? 0);

        if (maximum > 0) {
            return caloriesToday >= minimum && caloriesToday <= maximum;
        }

        if (minimum > 0) {
            return caloriesToday >= minimum;
        }

        return false;
    };

    const monthDays = useMemo(() => {
        const year = monthView.getFullYear();
        const month = monthView.getMonth();
        const firstOfMonth = new Date(year, month, 1);
        const lastDayOfMonth = new Date(year, month + 1, 0).getDate();
        const firstWeekday = (firstOfMonth.getDay() + 6) % 7;

        const days: Array<{ date: Date; inMonth: boolean }> = [];

        const previousMonthLastDay = new Date(year, month, 0).getDate();
        for (let index = firstWeekday - 1; index >= 0; index -= 1) {
            days.push({
                date: new Date(year, month - 1, previousMonthLastDay - index),
                inMonth: false,
            });
        }

        for (let day = 1; day <= lastDayOfMonth; day += 1) {
            days.push({
                date: new Date(year, month, day),
                inMonth: true,
            });
        }

        while (days.length % 7 !== 0) {
            const nextDay = days.length - (firstWeekday + lastDayOfMonth) + 1;
            days.push({
                date: new Date(year, month + 1, nextDay),
                inMonth: false,
            });
        }

        return days;
    }, [monthView]);

    const goalDaysThisMonth = useMemo(() => {
        const year = monthView.getFullYear();
        const month = monthView.getMonth();
        const totalDays = new Date(year, month + 1, 0).getDate();

        let count = 0;
        for (let day = 1; day <= totalDays; day += 1) {
            const currentDate = new Date(year, month, day);
            if (isGoalReachedForDate(currentDate)) {
                count += 1;
            }
        }

        return count;
    }, [monthView, dailyCaloriesByDate, userGoals]);

    const monthGoalSummary = `${goalDaysThisMonth}/${new Date(monthView.getFullYear(), monthView.getMonth() + 1, 0).getDate()} days this month`;
    const monthYearDisplay = `${monthNames[monthView.getMonth()]} ${monthView.getFullYear()}`;

    const displayName = user?.fullName || user?.firstName || user?.username || 'Your profile';
    const avatarUrl = user?.imageUrl || '';

    const changeMonth = (step: number) => {
        setMonthView(new Date(monthView.getFullYear(), monthView.getMonth() + step, 1));
    };

    return (
        <section className="ProfilePage">
            <div className="profile-header-row">
                <div className="profile-identity">
                    <div className="profile-avatar-shell">
                        {avatarUrl ? (
                            <img src={avatarUrl} alt={displayName} className="profile-avatar" />
                        ) : (
                            <span className="profile-avatar-fallback">
                                {displayName.charAt(0).toUpperCase()}
                            </span>
                        )}
                    </div>
                    <p className="profile-name">{displayName}</p>
                </div>
            </div>

            <div className="profile-calendar-banner">
                <button
                    type="button"
                    className="profile-month-button banner-arrow-left"
                    onClick={() => changeMonth(-1)}
                    aria-label="Previous month"
                >
                    <IoIosArrowBack />
                </button>

                <div className="profile-calendar-banner-text">{monthYearDisplay}</div>

                <button
                    type="button"
                    className="profile-month-button banner-arrow-right"
                    onClick={() => changeMonth(1)}
                    aria-label="Next month"
                >
                    <IoIosArrowForward />
                </button>
            </div>

            <div className="profile-calendar-shell">
                <div className="calendar-weekdays">
                    {weekdayLabels.map((label) => (
                        <span key={label} className="weekday-label">{label}</span>
                    ))}
                </div>

                <div className="calendar-grid">
                    {monthDays.map(({ date, inMonth }, index) => {
                        const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
                        const isToday = formatDateKey(date) === formatDateKey(todayStart);
                        const isPast = date < todayStart && inMonth;
                        const isFuture = date > todayStart && inMonth;
                        const reachedGoal = isGoalReachedForDate(date) && inMonth;

                        return (
                            <div
                                key={`${formatDateKey(date)}-${index}`}
                                className={[
                                    'calendar-day',
                                    inMonth ? 'in-month' : 'out-of-month',
                                    isPast ? 'past-day' : '',
                                    isFuture ? 'future-day' : '',
                                    isToday ? 'current-day' : '',
                                ].join(' ')}
                            >
                                <span className="calendar-date-number">{date.getDate()}</span>
                                {reachedGoal && <span className="goal-star" aria-label="Goal reached">★</span>}
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="profile-summary-card">
                <p>
                    You made your goal {monthGoalSummary} - {goalDaysThisMonth > 0 ? 'good job!' : 'keep going!'}
                </p>
            </div>

            <NavBar
                onOpenMenu={() => {}}
                onNavigate={onNavigate}
                currentPage="profile"
            />
        </section>
    );
}

export default ProfilePage;
