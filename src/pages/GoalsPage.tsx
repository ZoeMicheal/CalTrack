import './GoalsPage.css';
import { useEffect, useState } from 'react';
import { useAuth } from '@clerk/clerk-react';
import NavBar from '../components/NavBar';
import './Settingspage.css';

interface GoalsPageProps {
    onBack: () => void;
    onNavigate?: (page: string) => void;
}

function GoalsPage({ onBack, onNavigate }: GoalsPageProps) {
    const { userId, getToken } = useAuth();
    const [loadingGoals, setLoadingGoals] = useState(true);
    const [savingGoals, setSavingGoals] = useState(false);
    const [saveMessage, setSaveMessage] = useState('');
    const [primaryMetric, setPrimaryMetric] = useState('calories');
    const [calorieMax, setCalorieMax] = useState(2000);
    const [proteinTarget, setProteinTarget] = useState(0);
    const [carbsTarget, setCarbsTarget] = useState(0);
    const [fatTarget, setFatTarget] = useState(0);
    const [weightGoal, setWeightGoal] = useState('maintain');
    const [targetWeight, setTargetWeight] = useState('');
    // Zoe: Retrieve the signed-in user's saved goals from MongoDB
    useEffect(() => {
        if (!userId) {
            setLoadingGoals(false);
            return;
        }

        let cancelled = false;

        const fetchGoals = async () => {
            setLoadingGoals(true);

            try {
                const token = await getToken();

                if (!token) {
                    throw new Error('No Clerk authentication token available.');
                }

                const response = await fetch(
                    'http://localhost:5000/api/goals',
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                if (!response.ok) {
                    throw new Error('Failed to retrieve goals.');
                }

                const goals = await response.json();

                if (!cancelled && goals) {
                    setPrimaryMetric(goals.primaryMetric ?? 'calories');
                    setCalorieMax(goals.calorieMax ?? 2000);
                    setProteinTarget(goals.proteinTarget ?? 0);
                    setCarbsTarget(goals.carbsTarget ?? 0);
                    setFatTarget(goals.fatTarget ?? 0);
                    setWeightGoal(goals.weightGoal ?? 'maintain');
                    setTargetWeight(
                        goals.targetWeight == null
                            ? ''
                            : String(goals.targetWeight)
                    );
                }
            } catch (error) {
                if (!cancelled) {
                    console.error('Error loading goals:', error);
                }
            } finally {
                if (!cancelled) {
                    setLoadingGoals(false);
                }
            }
        };

        fetchGoals();

        return () => {
            cancelled = true;
        };
    }, [userId, getToken]);

    // Zoe: Save user preferences to MongoDB
    const handleSaveGoals = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!userId) {
            setSaveMessage('Please sign in to save your goals.');
            return;
        }

        if (
            [calorieMax, proteinTarget, carbsTarget, fatTarget].some(
                value => !Number.isFinite(value) || value < 0
            ) ||
            (targetWeight !== '' &&
                (!Number.isFinite(Number(targetWeight)) ||
                    Number(targetWeight) <= 0))
        ) {
            setSaveMessage('Please enter valid goal values.');
            return;
        }

        setSavingGoals(true);
        setSaveMessage('');

        try {
            const token = await getToken();

            if (!token) {
                throw new Error('No Clerk authentication token available.');
            }

            const response = await fetch(
                'http://localhost:5000/api/goals',
                {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        primaryMetric,
                        calorieMax,
                        proteinTarget,
                        carbsTarget,
                        fatTarget,
                        weightGoal,
                        targetWeight:
                            targetWeight === '' ? null : Number(targetWeight)
                    })
                }
            );

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to save goals.');
            }

            const savedGoals = await response.json();

            console.log('Goals saved to MongoDB:', savedGoals);
            setSaveMessage('Your goals have been saved successfully!');
        } catch (error) {
            console.error('Error saving goals:', error);
            setSaveMessage('Unable to save your goals. Please try again.');
        } finally {
            setSavingGoals(false);
        }
    };



    return (
        <section className="SettingsPage">
            <div
                className="SettingsHeader"
                style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr auto 1fr',
                    alignItems: 'center',
                    padding: '10px 15px'
                }}
            >
                <button
                    type="button"
                    onClick={onBack}
                    aria-label="Back to Settings"
                    style={{
                        gridColumn: 1,
                        justifySelf: 'start',
                        position: 'static',
                        transform: 'none',
                        background: 'transparent',
                        border: 'none',
                        color: '#000000',
                        cursor: 'pointer',
                        fontSize: '26px',
                        padding: '0 5px',
                        lineHeight: 1
                    }}
                >
                    ←
                </button>
                <span style={{ gridColumn: 2 }}>Goals</span>
            </div>

            <form
                className="goals-form"
                onSubmit={handleSaveGoals}
            >
                {loadingGoals && (
                    <p role="status">Loading your saved goals...</p>
                )}
                <div className="goal-card">
                    <h3>Primary Tracking Metric</h3>
                    <p>Choose what your dashboard focuses on.</p>

                    <select
                        value={primaryMetric}
                        onChange={(e) => setPrimaryMetric(e.target.value)}
                    >
                        <option value="calories">Calories</option>
                        <option value="protein">Protein</option>
                        <option value="carbs">Carbohydrates</option>
                        <option value="fat">Fat</option>
                    </select>
                </div>

                <div className="goal-card">
                    <h3>Daily Nutrition Goals</h3>

                    <label>Calories (kcal)</label>
                    <input
                        type="number"
                        min="0"
                        value={calorieMax}
                        onChange={(e) => setCalorieMax(Number(e.target.value))}
                    />

                    <label>Protein (g)</label>
                    <input
                        type="number"
                        min="0"
                        value={proteinTarget}
                        onChange={(e) => setProteinTarget(Number(e.target.value))}
                    />

                    <label>Carbohydrates (g)</label>
                    <input
                        type="number"
                        min="0"
                        value={carbsTarget}
                        onChange={(e) => setCarbsTarget(Number(e.target.value))}
                    />

                    <label>Fat (g)</label>
                    <input
                        type="number"
                        min="0"
                        value={fatTarget}
                        onChange={(e) => setFatTarget(Number(e.target.value))}
                    />
                </div>

                <div className="goal-card">
                    <h3>Weight Goals</h3>

                    <label>My goal is to:</label>
                    <select
                        value={weightGoal}
                        onChange={(e) => setWeightGoal(e.target.value)}
                    >
                        <option value="lose">Lose weight</option>
                        <option value="maintain">Maintain weight</option>
                        <option value="gain">Gain weight</option>
                    </select>

                    <label>Target Weight (lb)</label>
                    <input
                        type="number"
                        min="0"
                        placeholder="Enter your target weight"
                        value={targetWeight}
                        onChange={(e) => setTargetWeight(e.target.value)}
                    />
                </div>


                <button
                    type="submit"
                    className="goals-save-btn"
                    disabled={loadingGoals || savingGoals || !userId}
                >
                    {savingGoals ? 'Saving...' : 'Save Goals'}
                </button>

                {saveMessage && (
                    <p role="status" style={{ textAlign: 'center', color: '#333' }}>
                        {saveMessage}
                    </p>
                )}
            </form>

            <NavBar
                onNavigate={onNavigate}
                currentPage="settings"
            />
        </section>
    );
}

export default GoalsPage;
