// @ts-ignore
import React from 'react';
import { MealLogForm, Ingredient } from '../types/meal';
import CalTrackDropdown from './CalTrackDropdown';

export interface SavedMealSuggestion {
    foodName: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    servingSize?: string;
    ingredients?: Ingredient[];
}

interface Props {
    mealData: MealLogForm;
    setMealData: React.Dispatch<React.SetStateAction<MealLogForm>>;
    onSubmit: (e: React.FormEvent) => void;
    onSaveFavorite: () => void; //Zoe added this
    savedMealSuggestions?: SavedMealSuggestion[];
}

export const MealDetails: React.FC<Props> = ({ mealData, setMealData, onSubmit, onSaveFavorite, savedMealSuggestions = [] }) => {
    const [showSuggestions, setShowSuggestions] = React.useState(false);

    const matchingMealSuggestions = React.useMemo(() => {
        const searchTerm = mealData.foodName.trim().toLowerCase();

        if (!searchTerm) {
            return [];
        }

        return savedMealSuggestions
            .filter((meal) => meal.foodName.toLowerCase().includes(searchTerm))
            .slice(0, 6);
    }, [mealData.foodName, savedMealSuggestions]);

    const handleFoodNameChange = (value: string) => {
        setMealData((current) => ({ ...current, foodName: value }));
        setShowSuggestions(value.trim().length > 0);
    };

    const handleSelectSavedMeal = (selectedMeal: SavedMealSuggestion) => {
        const restoredIngredients = Array.isArray(selectedMeal.ingredients)
            ? selectedMeal.ingredients.map((ingredient) => ({
                name: ingredient.name || '',
                quantity: Number(ingredient.quantity) || 0,
                unit: ingredient.unit || 'g',
            }))
            : [];

        setMealData((current) => ({
            ...current,
            foodName: selectedMeal.foodName,
            calories: selectedMeal.calories,
            protein: selectedMeal.protein,
            carbs: selectedMeal.carbs,
            fat: selectedMeal.fat,
            servingSize: selectedMeal.servingSize || current.servingSize || '1 serving',
            source: 'saved',
            ingredients: restoredIngredients,
        }));
        setShowSuggestions(false);
    };

    // user can change/edit/delete ingredients here:
    const handleIngredientChange = (index: number, field: keyof Ingredient, value: string | number) => {
        const updatedIngredients = [...mealData.ingredients];
        updatedIngredients[index] = {
            ...updatedIngredients[index],
            [field]: value,
        };
        setMealData({ ...mealData, ingredients: updatedIngredients });
    };

    const addIngredient = () => {
        setMealData({
            ...mealData,
            ingredients: [...mealData.ingredients, { name: '', quantity: 0, unit: 'g' }],
        });
    };

    const removeIngredient = (index: number) => {
        const updated = mealData.ingredients.filter((_, i) => i !== index);
        setMealData({ ...mealData, ingredients: updated });
    };

    return (
        <form onSubmit={onSubmit} className="mobile-meal-form">
            <h3 className="form-title">Meal Breakdown</h3>

            <div className="form-group">
                <label>Food Name</label>
                <div className="food-name-autocomplete">
                    <input
                        type="text"
                        placeholder="e.g. Chicken Salad"
                        value={mealData.foodName}
                        onChange={(e) => handleFoodNameChange(e.target.value)}
                        onFocus={() => setShowSuggestions(mealData.foodName.trim().length > 0)}
                        onBlur={() => window.setTimeout(() => setShowSuggestions(false), 120)}
                        required
                    />

                    {showSuggestions && matchingMealSuggestions.length > 0 && (
                        <ul className="meal-name-suggestions" aria-label="Matching saved meals">
                            {matchingMealSuggestions.map((suggestedMeal) => (
                                <li key={`${suggestedMeal.foodName}-${suggestedMeal.calories}`}> 
                                    <button
                                        type="button"
                                        className="meal-name-suggestion-btn"
                                        onMouseDown={(e) => e.preventDefault()}
                                        onClick={() => handleSelectSavedMeal(suggestedMeal)}
                                    >
                                        <span>{suggestedMeal.foodName}</span>
                                        <small>{suggestedMeal.calories} kcal</small>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>

            <div className="form-group">
                <label>Meal Type</label>

                <CalTrackDropdown
                    ariaLabel="Meal Type"
                    value={mealData.mealType}
                    onChange={(value) =>
                        setMealData({
                            ...mealData,
                            mealType: value as MealLogForm['mealType'],
                        })
                    }
                    options={[
                        { value: 'Breakfast', label: 'Breakfast' },
                        { value: 'Lunch', label: 'Lunch' },
                        { value: 'Dinner', label: 'Dinner' },
                        { value: 'Snack', label: 'Snack' },
                        { value: 'Drinks', label: 'Drinks' },
                    ]}
                />
            </div>

            {/* VERTICAL MACROS CARD */}
            <div className="vertical-macro-card">
                <div className="form-group">
                    <label>Total Calories (kcal)</label>
                    <input
                        type="number"
                        value={mealData.calories || ''}
                        onChange={(e) => setMealData({ ...mealData, calories: Number(e.target.value) })}
                        required
                    />
                </div>

                <div className="form-group">
                    <label>Total Weight (g)</label>
                    <input
                        type="number"
                        value={mealData.weightGrams || ''}
                        onChange={(e) => setMealData({ ...mealData, weightGrams: Number(e.target.value) })}
                    />
                </div>

                <div className="form-group">
                    <label>Protein (g)</label>
                    <input
                        type="number"
                        value={mealData.protein || ''}
                        onChange={(e) => setMealData({ ...mealData, protein: Number(e.target.value) })}
                    />
                </div>

                <div className="form-group">
                    <label>Carbs (g)</label>
                    <input
                        type="number"
                        value={mealData.carbs || ''}
                        onChange={(e) => setMealData({ ...mealData, carbs: Number(e.target.value) })}
                    />
                </div>

                <div className="form-group">
                    <label>Fat (g)</label>
                    <input
                        type="number"
                        value={mealData.fat || ''}
                        onChange={(e) => setMealData({ ...mealData, fat: Number(e.target.value) })}
                    />
                </div>
            </div>

            {/* VERTICAL INGREDIENT LIST */}
            <h4 className="section-subtitle">Ingredients List</h4>

            <div className="ingredients-container">
                {mealData.ingredients.map((ing, idx) => (
                    <div key={idx} className="ingredient-row">
                        <input
                            type="text"
                            placeholder="Ingredient"
                            className="ing-name-input"
                            value={ing.name}
                            onChange={(e) => handleIngredientChange(idx, 'name', e.target.value)}
                        />
                        <input
                            type="number"
                            placeholder="Qty"
                            className="ing-qty-input"
                            value={ing.quantity || ''}
                            onChange={(e) => handleIngredientChange(idx, 'quantity', Number(e.target.value))}
                        />
                        <input
                            type="text"
                            placeholder="Unit"
                            className="ing-unit-input"
                            value={ing.unit}
                            onChange={(e) => handleIngredientChange(idx, 'unit', e.target.value)}
                        />
                        <button type="button" className="delete-ing-btn" onClick={() => removeIngredient(idx)}>
                            ✕
                        </button>
                    </div>
                ))}
            </div>

            <button type="button" className="bubbly-secondary-btn" onClick={addIngredient}>
                + Add Ingredient
            </button>

            <button type="submit" className="bubbly-primary-btn">
                Save Meal to Log
            </button>
            <button
                type="button"
                className="bubbly-secondary-btn"
                onClick={onSaveFavorite}
            >
                Save to Favorites
            </button>
        </form>
    );
};