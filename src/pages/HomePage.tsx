import NavBar from '../components/NavBar';
import { CSSProperties, useEffect, useState } from 'react';
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import './HomePage.css';
// import { useAuth } from "@clerk/clerk-react";
// Temporary replacement:
import {
    useAuth,
    SignInButton,
    SignedIn,
    SignedOut,
    UserButton
} from "@clerk/clerk-react";

import { MealLogForm, ModalStep } from "../types/meal";
import { AddMealMenu } from "../components/AddMealMenu";
import { CameraScanner } from "../components/CameraScanner";
import { MealDetails } from "../components/MealDetails";

// get calorie method
function getCaloriesFromIngredient() {

}

// Beginning of edit to add db to frontend
interface SavedMeal {
    _id: string;
    foodName: string;
    mealType: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    servingSize?: string;
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
interface SavedFood {
    _id: string;
    foodName: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    servingSize: string;
    recipeNotes: string;
    recipeUrl: string;
}
// End of Addition to connect db to front end

interface HomePageProps {
    onNavigate?: (page: string) => void;
}

function HomePage({ onNavigate }: HomePageProps) {
    // webcam/ai logic
    const { userId, getToken } = useAuth(); // clerk userID
    const [savedMeals, setSavedMeals] = useState<SavedMeal[]>([]); //hold meals gotten from Mongodb
    const [savedFoods, setSavedFoods] = useState<SavedFood[]>([]); //Stores saved foods put in db
    const [refreshSavedFoods, setRefreshSavedFoods] = useState(0); //refresh saved foods
    const [savedFoodSearch, setSavedFoodSearch] = useState('');
    const [editingFavorite, setEditingFavorite] = useState<SavedFood | null>(null);
    const [editFavoriteData, setEditFavoriteData] = useState<SavedFood | null>(null);
    const [userGoals, setUserGoals] = useState<UserGoal | null>(null);
    const [refreshMeals, setRefreshMeals] = useState(0); //Reacts fetch the meals
    const [savedMealConflict, setSavedMealConflict] = useState<{
        savedFood: SavedFood;
        mealData: MealLogForm;
    } | null>(null);
    const [updatingSavedMeal, setUpdatingSavedMeal] = useState(false);

    // Giving homepage access to meal records
    useEffect(() => {
        if (!userId) {
            setSavedMeals([]);
            return;
        }

        const fetchMeals = async () => {
            try {
                const token = await getToken();

                if (!token) {
                    console.error("No Clerk token available.");
                    return;
                }

                const response = await fetch(
                    "http://localhost:5000/api/meals",
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                if (!response.ok) {
                    throw new Error("Failed to fetch meals");
                }

                const meals: SavedMeal[] = await response.json();
                setSavedMeals(meals);

                console.log("Meals retrieved from MongoDB:", meals);
            } catch (error) {
                console.error("Error fetching meals:", error);
            }
        };
        fetchMeals();
    }, [userId, getToken, refreshMeals]);

    // User goals

    useEffect(() => {
        if (!userId) {
            setUserGoals(null);
            return;
        }
        let cancelled = false;
        const fetchUserGoals = async () => {
            try {
                const token = await getToken();
                if (!token) {
                    console.error("No Clerk token available for goals.");
                    return;
                }
                const response = await fetch(
                    "http://localhost:5000/api/goals",
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );
                if (!response.ok) {
                    throw new Error("Failed to fetch user goals.");
                }
                const goalData: UserGoal | null = await response.json();
                if (!cancelled) {
                    setUserGoals(goalData);
                    console.log("Goals retrieved from MongoDB:", goalData);
                }
            } catch (error) {
                if (!cancelled) {
                    console.error("Error fetching goals:", error);
                }
            }
        };

        fetchUserGoals();

        return () => {
            cancelled = true;
        };
    }, [userId, getToken]);

    // saved foods:
    useEffect(() => {
        if (!userId) {
            setSavedFoods([]);
            return;
        }

        let cancelled = false;

        const fetchSavedFoods = async () => {
            try {
                const token = await getToken();

                if (!token) {
                    console.error("No Clerk token available for saved foods.");
                    return;
                }

                const response = await fetch(
                    "http://localhost:5000/api/saved-foods",
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                if (!response.ok) {
                    throw new Error("Failed to fetch saved foods.");
                }

                const foods: SavedFood[] = await response.json();

                if (!cancelled) {
                    setSavedFoods(foods);
                    console.log("Saved foods retrieved from MongoDB:", foods);
                }
            } catch (error) {
                if (!cancelled) {
                    console.error("Error fetching saved foods:", error);
                }
            }
        };

        fetchSavedFoods();

        return () => {
            cancelled = true;
        };
    }, [userId, getToken, refreshSavedFoods]);

    // end of giving homepage access to meal records.


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

        try {
            const token = await getToken();

            if (!token) {
                alert('Please sign in before saving a meal.');
                return;
            }

            const res = await fetch('http://localhost:5000/api/meals', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(mealData),
            });

            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.error || 'Failed to save meal');
            }

            const savedMeal = await res.json();
            console.log('Meal saved successfully:', savedMeal);

            setRefreshMeals(prev => prev + 1); // Refresh the homepage's meal data after saving

            const matchedSavedFood = savedFoods.find((food) => {
                return food.foodName.trim().toLowerCase() === mealData.foodName.trim().toLowerCase();
            });

            if (matchedSavedFood) {
                const valuesDiffer = 
                    Math.abs(matchedSavedFood.calories - mealData.calories) > 0.01 ||
                    Math.abs(matchedSavedFood.protein - mealData.protein) > 0.01 ||
                    Math.abs(matchedSavedFood.carbs - mealData.carbs) > 0.01 ||
                    Math.abs(matchedSavedFood.fat - mealData.fat) > 0.01 ||
                    (matchedSavedFood.servingSize || '').trim().toLowerCase() !== (mealData.servingSize || '').trim().toLowerCase();

                if (valuesDiffer) {
                    setSavedMealConflict({
                        savedFood: matchedSavedFood,
                        mealData: { ...mealData },
                    });
                    resetModal();
                    return;
                }
            }

            alert('Meal logged successfully!');
            resetModal();

        } catch (err) {
            console.error('Failed to log meal:', err);
            alert('Unable to save meal. Please try again.');
        }
    };


    const handleSaveFavorite = async () => {
        if (!mealData.foodName.trim()) {
            alert("Please enter a food name.");
            return;
        }

        if (!Number.isFinite(mealData.calories) || mealData.calories < 0) {
            alert("Please enter a valid calorie amount.");
            return;
        }

        try {
            const token = await getToken();

            if (!token) {
                alert("Please sign in before saving a favorite.");
                return;
            }

            const response = await fetch(
                "http://localhost:5000/api/saved-foods",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        foodName: mealData.foodName,
                        calories: mealData.calories,
                        protein: mealData.protein,
                        carbs: mealData.carbs,
                        fat: mealData.fat,
                        servingSize: mealData.servingSize || "1 serving",
                    }),
                }
            );

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || "Failed to save favorite.");
            }

            const savedFood = await response.json();

            console.log("Favorite saved to MongoDB:", savedFood);

            setRefreshSavedFoods(prev => prev + 1);

            alert("Food saved to favorites successfully!");
        } catch (error) {
            console.error("Error saving favorite:", error);
            alert("Unable to save favorite. Please try again.");
        }
    };


    const handleSelectSavedFood = (food: SavedFood) => {
        setMealData({
            foodName: food.foodName,
            mealType: 'Lunch',
            calories: food.calories,
            protein: food.protein,
            carbs: food.carbs,
            fat: food.fat,
            servingSize: food.servingSize || '1 serving',
            weightGrams: 0,
            source: 'manual',
            ingredients: []
        });

        setCurrentStep('EDIT_PAGE');
    };

    const handleEditFavorite = (food: SavedFood) => {
        setEditingFavorite(food);
        setEditFavoriteData({ ...food });
    };


    const handleUpdateFavorite = async () => {
        if (!editingFavorite || !editFavoriteData) return;

        if (!editFavoriteData.foodName.trim()) {
            alert("Please enter a food name.");
            return;
        }

        if (
            [editFavoriteData.calories, editFavoriteData.protein,
                editFavoriteData.carbs, editFavoriteData.fat].some(
                value => !Number.isFinite(value) || value < 0
            )
        ) {
            alert("Please enter valid nutrition values.");
            return;
        }

        try {
            const token = await getToken();

            if (!token) {
                alert("Please sign in before editing a favorite.");
                return;
            }

            const response = await fetch(
                `http://localhost:5000/api/saved-foods/${editingFavorite._id}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        foodName: editFavoriteData.foodName.trim(),
                        calories: editFavoriteData.calories,
                        protein: editFavoriteData.protein,
                        carbs: editFavoriteData.carbs,
                        fat: editFavoriteData.fat,
                        servingSize: editFavoriteData.servingSize,
                    }),
                }
            );

            if (!response.ok) {
                throw new Error("Failed to update favorite.");
            }

            setRefreshSavedFoods(prev => prev + 1);
            setEditingFavorite(null);
            setEditFavoriteData(null);

            alert("Favorite updated successfully!");
        } catch (error) {
            console.error("Error updating favorite:", error);
            alert("Unable to update favorite. Please try again.");
        }
    };

    const handleDeleteFavorite = async (food: SavedFood) => {
        const confirmed = window.confirm(
            `Are you sure you want to delete ${food.foodName} from favorites?`
        );

        if (!confirmed) return;

        try {
            const token = await getToken();

            if (!token) {
                alert("Please sign in before deleting a favorite.");
                return;
            }

            const response = await fetch(
                `http://localhost:5000/api/saved-foods/${food._id}`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (!response.ok) {
                throw new Error("Failed to delete favorite.");
            }

            if (editingFavorite?._id === food._id) {
                setEditingFavorite(null);
                setEditFavoriteData(null);
            }

            setRefreshSavedFoods(prev => prev + 1);

            alert("Favorite deleted successfully!");
        } catch (error) {
            console.error("Error deleting favorite:", error);
            alert("Unable to delete favorite. Please try again.");
        }
    };


    //filtering saved foods based on the users search
    const filteredSavedFoods = savedFoods.filter((food) =>
        food.foodName.toLowerCase().includes(savedFoodSearch.toLowerCase())
    );

    const savedMealSuggestions = Array.from(
        new Map(
            savedMeals
                .filter((meal) => typeof meal.foodName === 'string' && meal.foodName.trim())
                .map((meal) => {
                    const normalizedName = meal.foodName.trim();
                    const normalizedIngredients = Array.isArray(meal.ingredients)
                        ? meal.ingredients.map((ingredient) => ({
                            name: String(ingredient.name || '').trim(),
                            quantity: Number(ingredient.quantity) || 0,
                            unit: String(ingredient.unit || 'g').trim() || 'g',
                        }))
                        : [];

                    return [
                        normalizedName.toLowerCase(),
                        {
                            foodName: normalizedName,
                            calories: Number(meal.calories) || 0,
                            protein: Number(meal.protein) || 0,
                            carbs: Number(meal.carbs) || 0,
                            fat: Number(meal.fat) || 0,
                            servingSize: typeof meal.servingSize === 'string' && meal.servingSize
                                ? meal.servingSize
                                : '1 serving',
                            ingredients: normalizedIngredients,
                        },
                    ];
                })
        ).values()
    );

    const handleAcceptSavedMealUpdate = async () => {
        if (!savedMealConflict) return;

        try {
            setUpdatingSavedMeal(true);
            const token = await getToken();

            if (!token) {
                alert('Please sign in before updating a saved meal.');
                return;
            }

            const response = await fetch(
                `http://localhost:5000/api/saved-foods/${savedMealConflict.savedFood._id}`,
                {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        foodName: savedMealConflict.mealData.foodName.trim(),
                        calories: savedMealConflict.mealData.calories,
                        protein: savedMealConflict.mealData.protein,
                        carbs: savedMealConflict.mealData.carbs,
                        fat: savedMealConflict.mealData.fat,
                        servingSize: savedMealConflict.mealData.servingSize || '1 serving',
                    }),
                }
            );

            if (!response.ok) {
                throw new Error('Failed to update saved meal.');
            }

            setRefreshSavedFoods(prev => prev + 1);
            setSavedMealConflict(null);
            alert('Saved meal updated to match this log.');
        } catch (error) {
            console.error('Error updating saved meal:', error);
            alert('Unable to update the saved meal right now.');
        } finally {
            setUpdatingSavedMeal(false);
        }
    };

    const handleCancelSavedMealUpdate = () => {
        setSavedMealConflict(null);
    };

    const resetModal = () => {
        setCurrentStep('CLOSED');
        setCapturedImage(null);
    };

    // data and UI logic
    const now = new Date();
    const date = now.toLocaleDateString('en-US', {
        weekday: 'long',
        day: 'numeric',
        month: 'short',
    });
    const [selecteddate, setselecteddate] = useState(now);
    function changeDate(amount: any) {
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

    //const goal = 1000;
    //const consumed = 866;
    //const remaining = goal - consumed;
    //const percentage = Math.round((consumed / goal) * 100);

    //Temporal replacement to lines 228 - 231:

    // Zoe: Homepage now uses the user's selected tracking metric
    const primaryMetric = userGoals?.primaryMetric ?? 'calories';

    // Get meals belonging to the currently selected date
    const todaysMeals = savedMeals.filter((meal) => {
        return (
            new Date(meal.consumedAt).toDateString() ===
            selecteddate.toDateString()
        );
    });

    // Calculate the selected metric's total for the day
    const consumed = todaysMeals.reduce((total, meal) => {
        return total + (meal[primaryMetric] ?? 0);
    }, 0);

    // Match the selected metric to its saved daily target
    const goal =
        primaryMetric === 'protein'
            ? (userGoals?.proteinTarget ?? 0)
            : primaryMetric === 'carbs'
                ? (userGoals?.carbsTarget ?? 0)
                : primaryMetric === 'fat'
                    ? (userGoals?.fatTarget ?? 0)
                    : (userGoals?.calorieMax ?? 2000);

    // Calculate remaining amount and progress
    const remaining = goal - consumed;

    const percentage = goal > 0
        ? Math.min(Math.round((consumed / goal) * 100), 100)
        : 0;

    // Display unit for the selected metric
    const metricUnit = primaryMetric === 'calories' ? 'kcal' : 'g';
// end of replacement.

    //const meallog = [
       // { id: 1, mealtype: 'Breakfast', calories: 0 },
       // { id: 2, mealtype: 'Lunch', calories: 0 },
       // { id: 3, mealtype: 'Dinner', calories: 0 },
       // { id: 4, mealtype: 'Snacks', calories: 0 },
      //  { id: 5, mealtype: 'Drinks', calories: 0 }
    //];

    // Replacement for lines 261-267
    //Updating mealtype preview to actually show what was documented instead of 0
    const mealCategories = [
        'Breakfast',
        'Lunch',
        'Dinner',
        'Snacks',
        'Drinks'
    ];

    const meallog = mealCategories.map((category, index) => {
        const categoryCalories = todaysMeals
            .filter(
                (meal) =>
                    meal.mealType.toLowerCase() ===
                    category.toLowerCase()
            )
            .reduce(
                (total, meal) => total + meal.calories,
                0
            );

        return {
            id: index + 1,
            mealtype: category,
            calories: categoryCalories
        };
    });
    // End of that

    // @ts-ignore
    return (
        <section className="HomePage">

            {/* Temporary Clerk authentication controls for database testing */}
            <div style={{
                display: 'flex',
                justifyContent: 'flex-end',
                alignItems: 'center',
                padding: '15px',
                gap: '10px'
            }}>
                <SignedOut>
                    <SignInButton mode="modal">
                        <button type="button">Sign In / Sign Up</button>
                    </SignInButton>
                </SignedOut>

                <SignedIn>
                    <UserButton />
                </SignedIn>
            </div>
            {/*End of temporary addition*/}

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
                    style={{
                        '--percent': `${percentage}%`,
                    } as CSSProperties}
                >
                    <div className="Piehole"></div>
                </div>
                <div className="Statsrow">
                    <div className="group">
                        <p>{consumed} {metricUnit}</p>
                        <p>Consumed</p>
                    </div>
                    <div className="divider"></div>
                    <div className="group">
                        <p>{remaining} {metricUnit}</p>
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

            {savedMealConflict && (
                <div className="modal-overlay">
                    <div className="pink-bubble-modal saved-meal-update-prompt">
                        <button className="close-bubble-btn" onClick={handleCancelSavedMealUpdate}>✕</button>

                        <h3>Update Saved Meal?</h3>
                        <p>
                            There is already a saved meal named "{savedMealConflict.savedFood.foodName}".
                            Its nutrition values are different from this meal log. Would you like to update the saved meal to match the current log?
                        </p>

                        <div className="saved-meal-update-grid">
                            <div className="saved-meal-update-card">
                                <span>Saved Meal</span>
                                <strong>{savedMealConflict.savedFood.calories} kcal</strong>
                                <small>{savedMealConflict.savedFood.protein}g protein • {savedMealConflict.savedFood.carbs}g carbs • {savedMealConflict.savedFood.fat}g fat</small>
                            </div>

                            <div className="saved-meal-update-card">
                                <span>Current Log</span>
                                <strong>{savedMealConflict.mealData.calories} kcal</strong>
                                <small>{savedMealConflict.mealData.protein}g protein • {savedMealConflict.mealData.carbs}g carbs • {savedMealConflict.mealData.fat}g fat</small>
                            </div>
                        </div>

                        <button
                            type="button"
                            className="bubbly-primary-btn"
                            onClick={handleAcceptSavedMealUpdate}
                            disabled={updatingSavedMeal}
                        >
                            {updatingSavedMeal ? 'Updating...' : 'Update saved meal'}
                        </button>

                        <button
                            type="button"
                            className="bubbly-secondary-btn"
                            onClick={handleCancelSavedMealUpdate}
                        >
                            Keep previous saved data
                        </button>
                    </div>
                </div>
            )}

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

                                <div className="saved-food-search">
                                    <input type="search" placeholder="Search for your saved meals" value={savedFoodSearch} onChange={(e) => setSavedFoodSearch(e.target.value)}/>
                                </div>

                                {editingFavorite && editFavoriteData && (
                                    <div className="saved-food-edit-form">
                                        <h4>Edit Favorite</h4>

                                        <div className="form-group">
                                            <label htmlFor="edit-food-name">Food Name</label>
                                            <input
                                                id="edit-food-name"
                                                type="text"
                                                value={editFavoriteData.foodName}
                                                onChange={(e) =>
                                                    setEditFavoriteData({
                                                        ...editFavoriteData,
                                                        foodName: e.target.value
                                                    })
                                                }
                                            />
                                        </div>

                                        {([
                                            ['calories', 'Calories'],
                                            ['protein', 'Protein (g)'],
                                            ['carbs', 'Carbs (g)'],
                                            ['fat', 'Fat (g)']
                                        ] as const).map(([field, label]) => (
                                            <div className="form-group" key={field}>
                                                <label htmlFor={`edit-${field}`}>{label}</label>
                                                <input
                                                    id={`edit-${field}`}
                                                    type="number"
                                                    min="0"
                                                    value={editFavoriteData[field]}
                                                    onChange={(e) =>
                                                        setEditFavoriteData({
                                                            ...editFavoriteData,
                                                            [field]: Number(e.target.value)
                                                        })
                                                    }
                                                />
                                            </div>
                                        ))}

                                        <button
                                            type="button"
                                            className="bubbly-primary-btn"
                                            onClick={handleUpdateFavorite}
                                        >
                                            Save Changes
                                        </button>

                                        <button
                                            type="button"
                                            className="bubbly-secondary-btn"
                                            onClick={() => {
                                                setEditingFavorite(null);
                                                setEditFavoriteData(null);
                                            }}
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                )}

                                {savedFoods.length === 0 ? (
                                    <p className="saved-meals-empty">
                                        No saved meals found.
                                    </p>
                                ) : (
                                    <>
                                        {filteredSavedFoods.length === 0 ? (
                                            <p className="saved-meals-empty">
                                                No saved meals matched your search.
                                            </p>
                                        ) : (
                                            <ul className="saved-food-list">
                                                {filteredSavedFoods.map((food) => (
                                                    <li className="saved-food-card" key={food._id}>
                                                        <div className="saved-food-header">
                                                            <div>
                                                                <h4>{food.foodName}</h4>
                                                                <p>{food.calories} calories</p>
                                                            </div>
                                                            <span className="saved-food-icon">♡</span>
                                                        </div>

                                                        <div className="saved-food-macros">
                                                            <div>
                                                                <span>Protein</span>
                                                                <strong>{food.protein}g</strong>
                                                            </div>
                                                            <div>
                                                                <span>Carbs</span>
                                                                <strong>{food.carbs}g</strong>
                                                            </div>
                                                            <div>
                                                                <span>Fat</span>
                                                                <strong>{food.fat}g</strong>
                                                            </div>
                                                        </div>

                                                        <button
                                                            type="button"
                                                            className="bubbly-primary-btn"
                                                            onClick={() => handleSelectSavedFood(food)}
                                                        >
                                                            Log This Food
                                                        </button>

                                                        <div className="saved-food-actions">
                                                            <button
                                                                type="button"
                                                                className="saved-food-edit-btn"
                                                                onClick={() => handleEditFavorite(food)}
                                                            >
                                                                Edit
                                                            </button>

                                                            <button
                                                                type="button"
                                                                className="saved-food-delete-btn"
                                                                onClick={() => handleDeleteFavorite(food)}
                                                            >
                                                                Delete
                                                            </button>
                                                        </div>

                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </>
                                )}

                                <button
                                    type="button"
                                    className="bubbly-secondary-btn"
                                    onClick={() => setCurrentStep('MENU')}
                                >
                                    Back
                                </button>
                            </div>
                        )}


                        {currentStep === 'EDIT_PAGE' && (
                            <MealDetails
                                mealData={mealData}
                                setMealData={setMealData}
                                onSubmit={handleSaveMeal}
                                onSaveFavorite={handleSaveFavorite}
                                savedMealSuggestions={savedMealSuggestions}
                            />
                        )}
                    </div>
                </div>
            )}

            {/* Passes opening action directly to the bubbly plus button inside Navbar */}
            <NavBar
                onOpenMenu={() => setCurrentStep('MENU')}
                onNavigate={onNavigate}
                currentPage="home"
            />
        </section>
    );
}

export default HomePage;