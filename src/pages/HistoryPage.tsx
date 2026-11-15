import { useEffect, useState } from 'react';
import { useAuth } from '@clerk/clerk-react';
import NavBar from '../components/NavBar';
import './Settingspage.css';
import './HistoryPage.css';

interface HistoryPageProps {
    onBack: () => void;
    onNavigate?: (page: string) => void;
}

interface Meal {
    _id: string;
    foodName?: string;
    mealType?: string;
    calories?: number;
    protein?: number;
    carbs?: number;
    fat?: number;
    consumedAt?: string;
}

interface Goals {
    primaryMetric?: string;
    calorieMax?: number;
    proteinTarget?: number;
    carbsTarget?: number;
    fatTarget?: number;
    weightGoal?: string;
    targetWeight?: number | null;
}

const formatNumber = (value?: number) =>
    Number(value ?? 0).toLocaleString(undefined, {
        maximumFractionDigits: 1
    });

const formatDate = (date?: string) => {
    if (!date) return 'Date unavailable';

    const parsed = new Date(date);
    if (Number.isNaN(parsed.getTime())) return 'Date unavailable';

    return parsed.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
};

const getLocalDate = (date?: string) => {
    if (!date) return '';
    const parsed = new Date(date);
    if (Number.isNaN(parsed.getTime())) return '';

    const year = parsed.getFullYear();
    const month = String(parsed.getMonth() + 1).padStart(2, '0');
    const day = String(parsed.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
};

function HistoryPage({ onBack, onNavigate }: HistoryPageProps) {
    const { userId, getToken } = useAuth();

    const [meals, setMeals] = useState<Meal[]>([]);
    const [goals, setGoals] = useState<Goals | null>(null);
    const [selectedDate, setSelectedDate] = useState('');

    const changeHistoryDate = (direction: number) => {
        const date = selectedDate
            ? new Date(`${selectedDate}T12:00:00`)
            : new Date();

        date.setDate(date.getDate() + direction);

        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');

        setSelectedDate(`${year}-${month}-${day}`);
    };

    const displayHistoryDate = () => {
        if (!selectedDate) return 'All Dates';

        return new Date(`${selectedDate}T12:00:00`)
            .toLocaleDateString(undefined, {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
                year: 'numeric'
            });
    };

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!userId) {
            setLoading(false);
            setError('Please sign in to view your history.');
            return;
        }

        let cancelled = false;

        const loadHistory = async () => {
            setLoading(true);
            setError('');

            try {
                const token = await getToken();

                if (!token) {
                    throw new Error('Authentication token unavailable.');
                }

                const headers = {
                    Authorization: `Bearer ${token}`
                };

                const [mealsResult, goalsResult] = await Promise.allSettled([
                    fetch('http://localhost:5000/api/meals', { headers }),
                    fetch('http://localhost:5000/api/goals', { headers })
                ]);

                if (cancelled) return;

                const problems: string[] = [];

                if (
                    mealsResult.status === 'fulfilled' &&
                    mealsResult.value.ok
                ) {
                    const mealData = await mealsResult.value.json();

                    if (!cancelled) {
                        setMeals(Array.isArray(mealData) ? mealData : []);
                    }
                } else {
                    problems.push('Unable to load meal history.');
                }

                if (
                    goalsResult.status === 'fulfilled' &&
                    goalsResult.value.ok
                ) {
                    const goalData = await goalsResult.value.json();

                    if (!cancelled) {
                        setGoals(goalData ?? null);
                    }
                } else {
                    problems.push('Unable to load saved goals.');
                }

                if (!cancelled && problems.length > 0) {
                    setError(problems.join(' '));
                }
            } catch (err) {
                if (!cancelled) {
                    console.error('History loading error:', err);
                    setError('Unable to load history. Please try again.');
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        loadHistory();

        return () => {
            cancelled = true;
        };
    }, [userId, getToken]);

    const filteredMeals = meals
        .filter((meal) =>
            !selectedDate ||
            getLocalDate(meal.consumedAt) === selectedDate
        )
        .sort((a, b) =>
            new Date(b.consumedAt ?? 0).getTime() -
            new Date(a.consumedAt ?? 0).getTime()
        );

    const totalCalories = filteredMeals.reduce(
        (sum, meal) => sum + Number(meal.calories ?? 0),
        0
    );

    const totalProtein = filteredMeals.reduce(
        (sum, meal) => sum + Number(meal.protein ?? 0),
        0
    );

    const totalCarbs = filteredMeals.reduce(
        (sum, meal) => sum + Number(meal.carbs ?? 0),
        0
    );

    const totalFat = filteredMeals.reduce(
        (sum, meal) => sum + Number(meal.fat ?? 0),
        0
    );

    return (
        <section className="SettingsPage HistoryPage">
            <header className="HistoryHeader">
                <button
                    type="button"
                    className="HistoryBack"
                    onClick={onBack}
                    aria-label="Back to Settings"
                >
                    &#8592;
                </button>
                <h2>History</h2>
            </header>

            <main className="HistoryContent">
                {loading && (
                    <p className="HistoryStatus" role="status">
                        Loading your history...
                    </p>
                )}

                {error && (
                    <p className="HistoryError" role="alert">
                        {error}
                    </p>
                )}

                {!loading && (
                    <>
                        <section className="HistoryCard">
                            <h3>Meal History</h3>


                            <div className="HistoryFilter">
                                <label>Browse Meals by Date</label>

                                <div className="HistoryDateSwipe">
                                    <button
                                        type="button"
                                        className="HistorySwipeButton"
                                        onClick={() => changeHistoryDate(-1)}
                                        aria-label="Previous day"
                                    >
                                        &#8249;
                                    </button>

                                    <div className="HistoryDateText">
                                        {displayHistoryDate()}
                                    </div>

                                    <button
                                        type="button"
                                        className="HistorySwipeButton"
                                        onClick={() => changeHistoryDate(1)}
                                        aria-label="Next day"
                                    >
                                        &#8250;
                                    </button>
                                </div>

                                <button
                                    type="button"
                                    className="HistoryClearButton"
                                    onClick={() => setSelectedDate('')}
                                >
                                    Show All Meals
                                </button>
                            </div>


                            <div className="HistoryTotals">
                                <div>
                                    <strong>{filteredMeals.length}</strong>
                                    <span>Meals</span>
                                </div>
                                <div>
                                    <strong>{formatNumber(totalCalories)}</strong>
                                    <span>Calories</span>
                                </div>
                            </div>

                            <div className="HistoryMacroTotals">
                                <span>Protein: {formatNumber(totalProtein)}g</span>
                                <span>Carbs: {formatNumber(totalCarbs)}g</span>
                                <span>Fat: {formatNumber(totalFat)}g</span>
                            </div>

                            {filteredMeals.length === 0 ? (
                                <p className="HistoryEmpty">
                                    {selectedDate
                                        ? 'No meals were logged on this date.'
                                        : 'No logged meals found yet.'}
                                </p>
                            ) : (
                                <div className="HistoryMealList">
                                    {filteredMeals.map((meal) => (
                                        <article
                                            className="HistoryMealItem"
                                            key={meal._id}
                                        >
                                            <div className="HistoryMealTop">
                                                <h4>
                                                    {meal.foodName || 'Unnamed Meal'}
                                                </h4>
                                                <span>
                                                    {formatNumber(meal.calories)} cal
                                                </span>
                                            </div>

                                            <p className="HistoryMealDate">
                                                {formatDate(meal.consumedAt)}
                                                {' • '}
                                                {meal.mealType || 'Meal'}
                                            </p>

                                            <div className="HistoryMealMacros">
                                                <span>
                                                    Protein: {formatNumber(meal.protein)}g
                                                </span>
                                                <span>
                                                    Carbs: {formatNumber(meal.carbs)}g
                                                </span>
                                                <span>
                                                    Fat: {formatNumber(meal.fat)}g
                                                </span>
                                            </div>
                                        </article>
                                    ))}
                                </div>
                            )}
                        </section>

                        <section className="HistoryCard">
                            <h3>Saved Goals</h3>

                            {!goals ? (
                                <p className="HistoryEmpty">
                                    No saved goals found yet.
                                </p>
                            ) : (
                                <div className="HistoryGoalsGrid">
                                    <div className="HistoryGoalItem">
                                        <span>Primary Tracking Metric</span>
                                        <strong>
                                            {goals.primaryMetric || 'Calories'}
                                        </strong>
                                    </div>

                                    <div className="HistoryGoalItem">
                                        <span>Daily Calorie Goal</span>
                                        <strong>
                                            {formatNumber(goals.calorieMax)} cal
                                        </strong>
                                    </div>

                                    <div className="HistoryGoalItem">
                                        <span>Protein Goal</span>
                                        <strong>
                                            {formatNumber(goals.proteinTarget)}g
                                        </strong>
                                    </div>

                                    <div className="HistoryGoalItem">
                                        <span>Carbs Goal</span>
                                        <strong>
                                            {formatNumber(goals.carbsTarget)}g
                                        </strong>
                                    </div>

                                    <div className="HistoryGoalItem">
                                        <span>Fat Goal</span>
                                        <strong>
                                            {formatNumber(goals.fatTarget)}g
                                        </strong>
                                    </div>

                                    <div className="HistoryGoalItem">
                                        <span>Weight Goal</span>
                                        <strong>
                                            {goals.weightGoal || 'Not set'}
                                        </strong>
                                    </div>

                                    {goals.targetWeight != null && (
                                        <div className="HistoryGoalItem">
                                            <span>Target Weight</span>
                                            <strong>
                                                {formatNumber(goals.targetWeight)}
                                            </strong>
                                        </div>
                                    )}
                                </div>
                            )}
                        </section>
                    </>
                )}
            </main>

            <NavBar
                onOpenMenu={() => {}}
                onNavigate={onNavigate}
                currentPage="settings"
            />
        </section>
    );
}

export default HistoryPage;
