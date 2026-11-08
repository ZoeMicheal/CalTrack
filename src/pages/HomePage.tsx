import NavBar from "../components/NavBar.tsx";
import { CSSProperties, useEffect, useState } from 'react';
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import './HomePage.css';
import { useAuth } from "@clerk/clerk-react";

import { MealLogForm, ModalStep } from "../types/meal";
import { AddMealMenu } from "../components/AddMealMenu";
import { CameraScanner } from "../components/CameraScanner";
import { MealDetails } from "../components/MealDetails";

// get calorie method
function getCaloriesFromIngredient() {

}
interface MealLogEntry extends MealLogForm {
    _id?: string;
    consumedAt?: string;
}

const formatDateKey = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const normalizeMealType = (mealType: string) => {
    if (mealType === 'Snack') {
        return 'Snacks';
    }

    return mealType;
};

function HomePage() {
    // webcam/ai logic
    const { userId } = useAuth(); // clerk userID

    const [currentStep, setCurrentStep] = useState<ModalStep>('CLOSED');
    const [capturedImage, setCapturedImage] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const [mealData, setMealData] = useState<MealLogForm>({
        foodName: '',
        mealType: 'Lunch',
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        servingSize: '1 serving',
        weightGrams: 0,
        source: 'manual',
        ingredients: []
    });

    const handleStartCamera = () => {
        setMealData(prev => ({ ...prev, source: 'ai' }));
        setCurrentStep('CAMERA');
    };

    const handleStartManual = () => {
        setMealData({
            foodName: '',
            mealType: 'Lunch',
            calories: 0,
            protein: 0,
            carbs: 0,
            fat: 0,
            servingSize: '1 serving',
            weightGrams: 0,
            source: 'manual',
            ingredients: [{ name: '', quantity: 1, unit: 'g' }]
        });
        setCurrentStep('EDIT_PAGE');
    };

    // when camera button/add meal and 'ai' is selected
    const handleCapture = (imageSrc: string) => {
        setCapturedImage(imageSrc);
    };

    // then call llm api
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
                setMealData({
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
                });
                setCurrentStep('EDIT_PAGE');
            }
        } catch (err) {
            console.error('Error analyzing image:', err);
        } finally {
            setLoading(false);
        }
    };

    // save meal to db & reset modal
    const handleSaveMeal = async (e: React.FormEvent) => {
        e.preventDefault();
        const payload = {
            ...mealData,
            clerkUserId: userId,
            consumedAt: new Date().toISOString(),
        };

        try {
            const res = await fetch('http://localhost:5000/api/meals', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (res.ok) {
                alert('Meal logged successfully!');
                resetModal();
                await loadDashboardData();
            }
        } catch (err) {
            console.error('Failed to log meal:', err);
        }
    };

    const resetModal = () => {
        setCurrentStep('CLOSED');
        setCapturedImage(null);
    };

    const [selecteddate, setselecteddate] = useState(new Date());
    const [meals, setMeals] = useState<MealLogEntry[]>([]);
    const [dailyGoal, setDailyGoal] = useState(2000);

    const loadDashboardData = async () => {
        if (!userId) {
            setMeals([]);
            return;
        }

        try {
            const [mealsResponse, goalResponse] = await Promise.all([
                fetch('http://localhost:5000/api/meals', {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json' },
                }),
                fetch('http://localhost:5000/api/goals', {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json' },
                }),
            ]);

            if (mealsResponse.ok) {
                const mealsData = await mealsResponse.json();
                setMeals(Array.isArray(mealsData) ? mealsData : []);
            }

            if (goalResponse.ok) {
                const goalData = await goalResponse.json();
                if (goalData && typeof goalData.calorieMax === 'number') {
                    setDailyGoal(goalData.calorieMax);
                }
            }
        } catch (error) {
            console.error('Failed to load dashboard data:', error);
        }
    };

    useEffect(() => {
        loadDashboardData();
    }, [userId]);

    function changeDate(amount: number) {
        const copydate = new Date(selecteddate);
        copydate.setDate(copydate.getDate() + amount);
        setselecteddate(copydate);
    }

    const selectedDateKey = formatDateKey(selecteddate);

    const selectedDateMeals = meals.filter((meal) => {
        if (!meal.consumedAt) {
            return false;
        }

        return formatDateKey(new Date(meal.consumedAt)) === selectedDateKey;
    });

    const consumed = selectedDateMeals.reduce(
        (sum, meal) => sum + (Number(meal.calories) || 0),
        0
    );

    const remaining = dailyGoal - consumed;
    const percentage = dailyGoal > 0 ? Math.round((consumed / dailyGoal) * 100) : 0;

    const meallog = [
        { id: 1, mealtype: 'Breakfast', calories: 0 },
        { id: 2, mealtype: 'Lunch', calories: 0 },
        { id: 3, mealtype: 'Dinner', calories: 0 },
        { id: 4, mealtype: 'Snacks', calories: 0 },
        { id: 5, mealtype: 'Drinks', calories: 0 }
    ].map((entry) => {
        const matchingMeals = selectedDateMeals.filter(
            (meal) => normalizeMealType(meal.mealType) === entry.mealtype
        );

        const calories = matchingMeals.reduce(
            (sum, meal) => sum + (Number(meal.calories) || 0),
            0
        );

        return {
            ...entry,
            calories,
        };
    });

    const date = selecteddate.toLocaleDateString('en-US', {
        weekday: 'long',
        day: 'numeric',
        month: 'short',
    });
    const changingdate = selecteddate.toLocaleDateString('en-US', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });

    return (
        <section className="HomePage">
            <div className="Dateheader">
                <p>{date}</p>
            </div>

            <div className="DashboardBubble">
                <div className="Percentbubble"><p>{percentage}%</p></div>
                <div
                    className="Pie"
                    style={{
                        '--percent': `${percentage}%`,
                    } as CSSProperties}
                >
                    <div className="Piehole"></div>
                </div>
                <div className="Statsrow">
                    <div className="group">
                        <p>{consumed}</p>
                        <p>Consumed</p>
                    </div>
                    <div className="divider"></div>
                    <div className="group">
                        <p>{remaining}</p>
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
                {meallog.map((meallog) => (
                    <li className="MeallogTags" key={meallog.id}>
                        <p>{meallog.mealtype}</p>
                        <p>{meallog.calories} cal</p>
                    </li>
                ))}
            </ul>

            {/* Popout Menu / Camera / Detailed Ingredients View */}
            {currentStep !== 'CLOSED' && (
                <div className="modal-overlay">
                    <div className="pink-bubble-modal">
                        <button className="close-bubble-btn" onClick={resetModal}>✕</button>

                        {currentStep === 'MENU' && (
                            <AddMealMenu
                                onSelectAI={handleStartCamera}
                                onSelectManual={handleStartManual}
                                onSelectSaved={() => setCurrentStep('SAVED_MEALS')}
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

                        {currentStep === 'SAVED_MEALS' && (
                            <div className="pink-saved-box">
                                <h3>Saved Meals</h3>
                                <p>No saved meals found.</p>
                                <button className="pink-bubble-btn secondary" onClick={() => setCurrentStep('MENU')}>
                                    Back
                                </button>
                            </div>
                        )}

                        {currentStep === 'EDIT_PAGE' && (
                            <MealDetails
                                mealData={mealData}
                                setMealData={setMealData}
                                onSubmit={handleSaveMeal}
                            />
                        )}
                    </div>
                </div>
            )}

            {/* Passes opening action directly to the bubbly plus button inside Navbar */}
            <NavBar onOpenMenu={() => setCurrentStep('MENU')} />
        </section>
    );
}

export default HomePage;