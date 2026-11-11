import { useEffect, useState } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { IoIosArrowBack, IoIosArrowForward } from 'react-icons/io';
import NavBar from '../components/NavBar';
import { MealLogForm } from '../types/meal';
import { AddMealMenu } from '../components/AddMealMenu';
import { CameraScanner } from '../components/CameraScanner';
import { MealDetails } from '../components/MealDetails';
import './Meallog.css';
import './HomePage.css';

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

interface MeallogProps {
    onNavigate?: (page: string) => void;
}

type MealLogView = 'EDIT_PAGE' | 'SAVED_MEALS';
type NavModalStep = 'CLOSED' | 'MENU' | 'CAMERA';

const DEFAULT_MEAL: MealLogForm = {
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

function Meallog({ onNavigate }: MeallogProps) {
    const { userId, getToken } = useAuth();

    // Read handoff payload from HomePage (if any) on initial mount
    const [initialPayload] = useState<{
        mode?: MealLogView;
        mealData?: MealLogForm;
    } | null>(() => {
        try {
            const raw = sessionStorage.getItem('pendingMealLog');
            if (raw) {
                sessionStorage.removeItem('pendingMealLog');
                return JSON.parse(raw);
            }
        } catch (err) {
            console.error('Error reading pendingMealLog:', err);
        }
        return null;
    });

    const [activeView, setActiveView] = useState<MealLogView>(
        initialPayload?.mode ?? 'EDIT_PAGE'
    );
    const [mealData, setMealData] = useState<MealLogForm>(
        initialPayload?.mealData ?? DEFAULT_MEAL
    );

    // Date navigation state
    const now = new Date();
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

    // Optional popout modal if user taps '+' while already on MealLog
    const [navModalStep, setNavModalStep] = useState<NavModalStep>('CLOSED');
    const [capturedImage, setCapturedImage] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    // Saved meals & favorites state
    const [savedMeals, setSavedMeals] = useState<SavedMeal[]>([]);
    const [savedFoods, setSavedFoods] = useState<SavedFood[]>([]);
    const [refreshSavedFoods, setRefreshSavedFoods] = useState(0);
    const [savedFoodSearch, setSavedFoodSearch] = useState('');
    const [editingFavorite, setEditingFavorite] = useState<SavedFood | null>(null);
    const [editFavoriteData, setEditFavoriteData] = useState<SavedFood | null>(null);

    const [savedMealConflict, setSavedMealConflict] = useState<{
        savedFood: SavedFood;
        mealData: MealLogForm;
    } | null>(null);
    const [updatingSavedMeal, setUpdatingSavedMeal] = useState(false);

    // Fetch meal history for autocomplete suggestions
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


    useEffect(() => {
        if (!userId) {
            setSavedFoods([]);
            return;
        }

        let cancelled = false;
        const fetchSavedFoods = async () => {
            try {
                const token = await getToken();
                if (!token) return;

                const response = await fetch('http://localhost:5000/api/saved-foods', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (!response.ok) throw new Error('Failed to fetch saved foods.');

                const foods: SavedFood[] = await response.json();
                if (!cancelled) setSavedFoods(foods);
            } catch (error) {
                if (!cancelled) console.error('Error fetching saved foods:', error);
            }
        };

        fetchSavedFoods();
        return () => {
            cancelled = true;
        };
    }, [userId, getToken, refreshSavedFoods]);


    const analyzePhotoOnMealLog = async () => {
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
                setCapturedImage(null);
                setNavModalStep('CLOSED');
                setActiveView('EDIT_PAGE');
            }
        } catch (err) {
            console.error('Error analyzing image:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveMeal = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const token = await getToken();
            if (!token) {
                alert('Please sign in before saving a meal.');
                return;
            }

            const payload = {
                ...mealData,
                consumedAt: selecteddate.toISOString(),
            };

            const res = await fetch('http://localhost:5000/api/meals', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.error || 'Failed to save meal');
            }

            const matchedSavedFood = savedFoods.find(
                (food) =>
                    food.foodName.trim().toLowerCase() === mealData.foodName.trim().toLowerCase()
            );

            if (matchedSavedFood) {
                const valuesDiffer =
                    Math.abs(matchedSavedFood.calories - mealData.calories) > 0.01 ||
                    Math.abs(matchedSavedFood.protein - mealData.protein) > 0.01 ||
                    Math.abs(matchedSavedFood.carbs - mealData.carbs) > 0.01 ||
                    Math.abs(matchedSavedFood.fat - mealData.fat) > 0.01 ||
                    (matchedSavedFood.servingSize || '').trim().toLowerCase() !==
                    (mealData.servingSize || '').trim().toLowerCase();

                if (valuesDiffer) {
                    setSavedMealConflict({
                        savedFood: matchedSavedFood,
                        mealData: { ...mealData },
                    });
                    return;
                }
            }

            alert('Meal logged successfully!');
            onNavigate?.('home');
        } catch (err) {
            console.error('Failed to log meal:', err);
            alert('Unable to save meal. Please try again.');
        }
    };

    const handleSaveFavorite = async () => {
        if (!mealData.foodName.trim()) {
            alert('Please enter a food name.');
            return;
        }
        if (!Number.isFinite(mealData.calories) || mealData.calories < 0) {
            alert('Please enter a valid calorie amount.');
            return;
        }

        try {
            const token = await getToken();
            if (!token) {
                alert('Please sign in before saving a favorite.');
                return;
            }

            const response = await fetch('http://localhost:5000/api/saved-foods', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    foodName: mealData.foodName,
                    calories: mealData.calories,
                    protein: mealData.protein,
                    carbs: mealData.carbs,
                    fat: mealData.fat,
                    servingSize: mealData.servingSize || '1 serving',
                }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to save favorite.');
            }

            setRefreshSavedFoods((prev) => prev + 1);
            alert('Food saved to favorites successfully!');
        } catch (error) {
            console.error('Error saving favorite:', error);
            alert('Unable to save favorite. Please try again.');
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
            ingredients: [],
        });
        setActiveView('EDIT_PAGE');
    };

    const handleEditFavorite = (food: SavedFood) => {
        setEditingFavorite(food);
        setEditFavoriteData({ ...food });
    };

    const handleUpdateFavorite = async () => {
        if (!editingFavorite || !editFavoriteData) return;

        if (!editFavoriteData.foodName.trim()) {
            alert('Please enter a food name.');
            return;
        }

        if (
            [
                editFavoriteData.calories,
                editFavoriteData.protein,
                editFavoriteData.carbs,
                editFavoriteData.fat,
            ].some((value) => !Number.isFinite(value) || value < 0)
        ) {
            alert('Please enter valid nutrition values.');
            return;
        }

        try {
            const token = await getToken();
            if (!token) {
                alert('Please sign in before editing a favorite.');
                return;
            }

            const response = await fetch(
                `http://localhost:5000/api/saved-foods/${editingFavorite._id}`,
                {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
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

            if (!response.ok) throw new Error('Failed to update favorite.');

            setRefreshSavedFoods((prev) => prev + 1);
            setEditingFavorite(null);
            setEditFavoriteData(null);
            alert('Favorite updated successfully!');
        } catch (error) {
            console.error('Error updating favorite:', error);
            alert('Unable to update favorite. Please try again.');
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
                alert('Please sign in before deleting a favorite.');
                return;
            }

            const response = await fetch(
                `http://localhost:5000/api/saved-foods/${food._id}`,
                {
                    method: 'DELETE',
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            if (!response.ok) throw new Error('Failed to delete favorite.');

            if (editingFavorite?._id === food._id) {
                setEditingFavorite(null);
                setEditFavoriteData(null);
            }

            setRefreshSavedFoods((prev) => prev + 1);
            alert('Favorite deleted successfully!');
        } catch (error) {
            console.error('Error deleting favorite:', error);
            alert('Unable to delete favorite. Please try again.');
        }
    };

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

            if (!response.ok) throw new Error('Failed to update saved meal.');

            setRefreshSavedFoods((prev) => prev + 1);
            setSavedMealConflict(null);
            alert('Saved meal updated to match this log.');
            onNavigate?.('home');
        } catch (error) {
            console.error('Error updating saved meal:', error);
            alert('Unable to update the saved meal right now.');
        } finally {
            setUpdatingSavedMeal(false);
        }
    };

    const handleCancelSavedMealUpdate = () => {
        setSavedMealConflict(null);
        onNavigate?.('home');
    };

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
                            servingSize:
                                typeof meal.servingSize === 'string' && meal.servingSize
                                    ? meal.servingSize
                                    : '1 serving',
                            ingredients: normalizedIngredients,
                        },
                    ];
                })
        ).values()
    );

    return (
        <section className="Meallogpage">
            <div className="Meallogheader">
                {activeView === 'SAVED_MEALS' ? 'Saved Meals' : 'Edit Meal'}
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

            {/* Saved Meals Selection View */}
            {activeView === 'SAVED_MEALS' && (
                <div className="Logbubble pink-saved-box">
                    <div className="saved-food-search">
                        <input
                            type="search"
                            placeholder="Search for your saved meals"
                            value={savedFoodSearch}
                            onChange={(e) => setSavedFoodSearch(e.target.value)}
                        />
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
                                            foodName: e.target.value,
                                        })
                                    }
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="edit-calories">Calories</label>
                                <input
                                    id="edit-calories"
                                    type="number"
                                    value={editFavoriteData.calories}
                                    onChange={(e) =>
                                        setEditFavoriteData({
                                            ...editFavoriteData,
                                            calories: Number(e.target.value),
                                        })
                                    }
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="edit-protein">Protein (g)</label>
                                <input
                                    id="edit-protein"
                                    type="number"
                                    value={editFavoriteData.protein}
                                    onChange={(e) =>
                                        setEditFavoriteData({
                                            ...editFavoriteData,
                                            protein: Number(e.target.value),
                                        })
                                    }
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="edit-carbs">Carbs (g)</label>
                                <input
                                    id="edit-carbs"
                                    type="number"
                                    value={editFavoriteData.carbs}
                                    onChange={(e) =>
                                        setEditFavoriteData({
                                            ...editFavoriteData,
                                            carbs: Number(e.target.value),
                                        })
                                    }
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="edit-fat">Fat (g)</label>
                                <input
                                    id="edit-fat"
                                    type="number"
                                    value={editFavoriteData.fat}
                                    onChange={(e) =>
                                        setEditFavoriteData({
                                            ...editFavoriteData,
                                            fat: Number(e.target.value),
                                        })
                                    }
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="edit-serving">Serving Size</label>
                                <input
                                    id="edit-serving"
                                    type="text"
                                    value={editFavoriteData.servingSize}
                                    onChange={(e) =>
                                        setEditFavoriteData({
                                            ...editFavoriteData,
                                            servingSize: e.target.value,
                                        })
                                    }
                                />
                            </div>
                            <button
                                type="button"
                                className="Savebutton"
                                onClick={handleUpdateFavorite}
                            >
                                Save Favorite
                            </button>
                            <button
                                type="button"
                                className="Cancelbutton"
                                onClick={() => {
                                    setEditingFavorite(null);
                                    setEditFavoriteData(null);
                                }}
                            >
                                Cancel Edit
                            </button>
                        </div>
                    )}

                    <ul className="Bubblecontent">
                        {filteredSavedFoods.map((food) => (
                            <li className="Formrow" key={food._id}>
                                <div
                                    style={{ cursor: 'pointer', flex: 1 }}
                                    onClick={() => handleSelectSavedFood(food)}
                                >
                                    <strong>{food.foodName}</strong>
                                    <p>
                                        {food.calories} kcal • {food.protein}g P • {food.carbs}g C •{' '}
                                        {food.fat}g F
                                    </p>
                                </div>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <button
                                        type="button"
                                        onClick={() => handleEditFavorite(food)}
                                    >
                                        Edit
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleDeleteFavorite(food)}
                                    >
                                        Delete
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Meal Details Form (Pre-filled from AI photo, Saved Meal, or blank Manual) */}
            {activeView === 'EDIT_PAGE' && (
                <div className="Logbubble">
                    <MealDetails
                        mealData={mealData}
                        setMealData={setMealData}
                        onSubmit={handleSaveMeal}
                        onSaveFavorite={handleSaveFavorite}
                        savedMealSuggestions={savedMealSuggestions}
                    />
                </div>
            )}

            <button
                type="button"
                className="Cancelbutton"
                onClick={() => onNavigate?.('home')}
            >
                Cancel
            </button>

            {/* Popout Menu if user clicks '+' while on MealLog */}
            {navModalStep !== 'CLOSED' && (
                <div className="modal-overlay">
                    <div className="pink-bubble-modal">
                        <button
                            className="close-bubble-btn"
                            onClick={() => {
                                setNavModalStep('CLOSED');
                                setCapturedImage(null);
                            }}
                        >
                            ✕
                        </button>

                        {navModalStep === 'MENU' && (
                            <AddMealMenu
                                onSelectAI={() => {
                                    setCapturedImage(null);
                                    setNavModalStep('CAMERA');
                                }}
                                onSelectManual={() => {
                                    setMealData(DEFAULT_MEAL);
                                    setActiveView('EDIT_PAGE');
                                    setNavModalStep('CLOSED');
                                }}
                                onSelectSaved={() => {
                                    setActiveView('SAVED_MEALS');
                                    setNavModalStep('CLOSED');
                                }}
                            />
                        )}

                        {navModalStep === 'CAMERA' && (
                            <CameraScanner
                                capturedImage={capturedImage}
                                loading={loading}
                                onCapture={(src) => setCapturedImage(src)}
                                onRetake={() => setCapturedImage(null)}
                                onAnalyze={analyzePhotoOnMealLog}
                            />
                        )}
                    </div>
                </div>
            )}

            {/* Saved Meal Conflict Prompt */}
            {savedMealConflict && (
                <div className="modal-overlay">
                    <div className="pink-bubble-modal saved-meal-update-prompt">
                        <button
                            className="close-bubble-btn"
                            onClick={handleCancelSavedMealUpdate}
                        >
                            ✕
                        </button>

                        <h3>Update Saved Meal?</h3>
                        <p>
                            There is already a saved meal named "
                            {savedMealConflict.savedFood.foodName}". Its nutrition values are
                            different from this meal log. Would you like to update the saved meal
                            to match the current log?
                        </p>

                        <div className="saved-meal-update-grid">
                            <div className="saved-meal-update-card">
                                <span>Saved Meal</span>
                                <strong>{savedMealConflict.savedFood.calories} kcal</strong>
                                <small>
                                    {savedMealConflict.savedFood.protein}g protein •{' '}
                                    {savedMealConflict.savedFood.carbs}g carbs •{' '}
                                    {savedMealConflict.savedFood.fat}g fat
                                </small>
                            </div>

                            <div className="saved-meal-update-card">
                                <span>Current Log</span>
                                <strong>{savedMealConflict.mealData.calories} kcal</strong>
                                <small>
                                    {savedMealConflict.mealData.protein}g protein •{' '}
                                    {savedMealConflict.mealData.carbs}g carbs •{' '}
                                    {savedMealConflict.mealData.fat}g fat
                                </small>
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

            <NavBar
                onOpenMenu={() => setNavModalStep('MENU')}
                onNavigate={onNavigate}
                currentPage="meallog"
            />
        </section>
    );
}

export default Meallog;