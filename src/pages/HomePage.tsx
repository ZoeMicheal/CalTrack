import NavBar from '../components/NavBar';
import { CSSProperties, useEffect, useState } from 'react';
import { IoIosArrowBack, IoIosArrowForward } from 'react-icons/io';
import './HomePage.css';
import {
    useAuth,
    SignInButton,
    SignedIn,
    SignedOut,
    UserButton,
} from '@clerk/clerk-react';

import { MealLogForm } from '../types/meal';
import { AddMealMenu } from '../components/AddMealMenu';
import { CameraScanner } from '../components/CameraScanner';

interface SavedMeal {
    _id: string;
    foodName: string;
    mealType: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    servingSize?: string;
    weightGrams?: number;
    ingredients?: Array<{
        name: string;
        quantity: number;
        unit: string;
    }>;
    consumedAt: string;
}

interface UserGoal {
    _id: string;
    calorieMin: number;
    calorieMax: number;
    proteinTarget: number;
    carbsTarget: number;
    fatTarget: number;
    primaryMetric?: 'calories' | 'protein' | 'carbs' | 'fat';
    stickerColor: string;
}

interface HomePageProps {
    onNavigate?: (page: string) => void;
}

type HomeModalStep = 'CLOSED' | 'MENU' | 'CAMERA';

function HomePage({ onNavigate }: HomePageProps) {
    const { userId, getToken } = useAuth();
    const [savedMeals, setSavedMeals] = useState<SavedMeal[]>([]);
    const [userGoals, setUserGoals] = useState<UserGoal | null>(null);

    // Popout menu & AI camera state
    const [currentStep, setCurrentStep] = useState<HomeModalStep>('CLOSED');
    const [capturedImage, setCapturedImage] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    // Fetch meals for dashboard calculations
    useEffect(() => {
        if (!userId) {
            setSavedMeals([]);
            return;
        }

        const fetchMeals = async () => {
            try {
                const token = await getToken();
                if (!token) return;

                const response = await fetch('http://localhost:5000/api/meals', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (!response.ok) throw new Error('Failed to fetch meals');

                const meals: SavedMeal[] = await response.json();
                setSavedMeals(meals);
            } catch (error) {
                console.error('Error fetching meals:', error);
            }
        };

        fetchMeals();
    }, [userId, getToken]);

    // Fetch user goals
    useEffect(() => {
        if (!userId) {
            setUserGoals(null);
            return;
        }

        let cancelled = false;
        const fetchUserGoals = async () => {
            try {
                const token = await getToken();
                if (!token) return;

                const response = await fetch('http://localhost:5000/api/goals', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (!response.ok) throw new Error('Failed to fetch user goals.');

                const goalData: UserGoal | null = await response.json();
                if (!cancelled) setUserGoals(goalData);
            } catch (error) {
                if (!cancelled) console.error('Error fetching goals:', error);
            }
        };

        fetchUserGoals();
        return () => {
            cancelled = true;
        };
    }, [userId, getToken]);

    const resetModal = () => {
        setCurrentStep('CLOSED');
        setCapturedImage(null);
    };

    // Option 1: AI Photo -> stay in modal to capture photo
    const handleStartCamera = () => {
        setCapturedImage(null);
        setCurrentStep('CAMERA');
    };

    // Option 2: Manual Log -> pass blank form & redirect to MealLog page
    const handleStartManual = () => {
        const manualDraft: MealLogForm = {
            foodName: '',
            mealType: 'Lunch',
            calories: 0,
            protein: 0,
            carbs: 0,
            fat: 0,
            servingSize: '1 serving',
            weightGrams: 0,
            source: 'manual',
            ingredients: [{ name: '', quantity: 1, unit: 'g' }],
        };

        sessionStorage.setItem(
            'pendingMealLog',
            JSON.stringify({ mode: 'EDIT_PAGE', mealData: manualDraft })
        );
        resetModal();
        onNavigate?.('meallog');
    };

    // Option 3: Saved Meals -> redirect to MealLog page in SAVED_MEALS mode
    const handleSelectSavedOption = () => {
        sessionStorage.setItem(
            'pendingMealLog',
            JSON.stringify({ mode: 'SAVED_MEALS' })
        );
        resetModal();
        onNavigate?.('meallog');
    };

    const handleCapture = (imageSrc: string) => {
        setCapturedImage(imageSrc);
    };

    // Analyze photo with AI -> pass extracted data & redirect to MealLog page
    const analyzePhoto = async () => {
        if (!capturedImage) return;
        setLoading(true);

        try {
            const res = await fetch('http://localhost:5000/api/ai/extract-food', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ imageBase64: capturedImage }),
            });
            const result = await res.json();
            if (result.success) {
                const aiMealData: MealLogForm = {
                    clerkUserId: userId || '',
                    foodName: result.data.foodName || '',
                    mealType: result.data.mealType || 'Lunch',
                    calories: result.data.calories || 0,
                    protein: result.data.protein || 0,
                    carbs: result.data.carbs || 0,
                    fat: result.data.fat || 0,
                    servingSize: result.data.servingSize || '1 plate',
                    weightGrams: result.data.weightGrams || 0,
                    source: 'ai',
                    ingredients: result.data.ingredients || [],
                };

                sessionStorage.setItem(
                    'pendingMealLog',
                    JSON.stringify({ mode: 'EDIT_PAGE', mealData: aiMealData })
                );
                resetModal();
                onNavigate?.('meallog');
            }
        } catch (err) {
            console.error('Error analyzing image:', err);
        } finally {
            setLoading(false);
        }
    };

    // Date & Dashboard UI logic
    const now = new Date();
    const date = now.toLocaleDateString('en-US', {
        weekday: 'long',
        day: 'numeric',
        month: 'short',
    });

    const [selecteddate, setselecteddate] = useState(now);
    function changeDate(amount: number) {
        const copydate = new Date(selecteddate);
        copydate.setDate(copydate.getDate() + amount);
        setselecteddate(copydate);
    }

    const changingdate = selecteddate.toLocaleDateString('en-US', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });

    const primaryMetric = userGoals?.primaryMetric ?? 'calories';

    const todaysMeals = savedMeals.filter(
        (meal) => new Date(meal.consumedAt).toDateString() === selecteddate.toDateString()
    );

    const consumed = todaysMeals.reduce((total, meal) => total + (meal[primaryMetric] ?? 0), 0);

    const goal =
        primaryMetric === 'protein'
            ? (userGoals?.proteinTarget ?? 0)
            : primaryMetric === 'carbs'
                ? (userGoals?.carbsTarget ?? 0)
                : primaryMetric === 'fat'
                    ? (userGoals?.fatTarget ?? 0)
                    : (userGoals?.calorieMax ?? 2000);

    const remaining = goal - consumed;
    const percentage = goal > 0 ? Math.min(Math.round((consumed / goal) * 100), 100) : 0;
    const metricUnit = primaryMetric === 'calories' ? 'kcal' : 'g';

    const mealCategories = ['Breakfast', 'Lunch', 'Dinner', 'Snacks', 'Drinks'];
    const meallog = mealCategories.map((category, index) => {
        const categoryCalories = todaysMeals
            .filter((meal) => meal.mealType.toLowerCase() === category.toLowerCase())
            .reduce((total, meal) => total + meal.calories, 0);

        return {
            id: index + 1,
            mealtype: category,
            calories: categoryCalories,
        };
    });

    return (
        <section className="HomePage">
            {/* Temporary Clerk authentication controls */}
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    alignItems: 'center',
                    padding: '15px',
                    gap: '10px',
                }}
            >
                <SignedOut>
                    <SignInButton mode="modal">
                        <button type="button">Sign In / Sign Up</button>
                    </SignInButton>
                </SignedOut>
                <SignedIn>
                    <UserButton />
                </SignedIn>
            </div>

            <div className="Dateheader">
                <p>{date}</p>
            </div>

            <div className="DashboardBubble">
                <div className="primary-metric-label">
                    {primaryMetric === 'calories' && 'Daily Calories'}
                    {primaryMetric === 'protein' && 'Daily Protein'}
                    {primaryMetric === 'carbs' && 'Daily Carbohydrates'}
                    {primaryMetric === 'fat' && 'Daily Fat'}
                </div>

                <div className="Percentbubble">
                    <p>{percentage}%</p>
                </div>
                <div
                    className="Pie"
                    style={
                        {
                            '--percent': `${percentage}%`,
                        } as CSSProperties
                    }
                >
                    <div className="Piehole"></div>
                </div>
                <div className="Statsrow">
                    <div className="group">
                        <p>
                            {consumed} {metricUnit}
                        </p>
                        <p>Consumed</p>
                    </div>
                    <div className="divider"></div>
                    <div className="group">
                        <p>
                            {remaining} {metricUnit}
                        </p>
                        <p>Remaining</p>
                    </div>
                </div>
            </div>

            <div className="DateSwipe">
                <button className="swipebutton" onClick={() => changeDate(-1)}>
                    <IoIosArrowBack />
                </button>
                <p className="Datetext">{changingdate}</p>
                <button className="swipebutton" onClick={() => changeDate(1)}>
                    <IoIosArrowForward />
                </button>
            </div>

            <div className="Horizontaldivider"></div>

            <ul className="Meallog">
                {meallog.map((item) => (
                    <li className="MeallogTags" key={item.id}>
                        <p>{item.mealtype}</p>
                        <p>{item.calories} cal</p>
                    </li>
                ))}
            </ul>

            {/* Popout Menu (Manual / AI Photo / Saved Meals) & AI Camera */}
            {currentStep !== 'CLOSED' && (
                <div className="modal-overlay">
                    <div className="pink-bubble-modal">
                        <button className="close-bubble-btn" onClick={resetModal}>
                            ✕
                        </button>

                        {currentStep === 'MENU' && (
                            <AddMealMenu
                                onSelectAI={handleStartCamera}
                                onSelectManual={handleStartManual}
                                onSelectSaved={handleSelectSavedOption}
                            />
                        )}

                        {currentStep === 'CAMERA' && (
                            <CameraScanner
                                capturedImage={capturedImage}
                                loading={loading}
                                onCapture={handleCapture}
                                onRetake={() => setCapturedImage(null)}
                                onAnalyze={analyzePhoto}
                            />
                        )}
                    </div>
                </div>
            )}

            <NavBar
                onOpenMenu={() => setCurrentStep('MENU')}
                onNavigate={onNavigate}
                currentPage="home"
            />
        </section>
    );
}

export default HomePage;