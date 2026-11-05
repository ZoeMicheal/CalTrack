import React from 'react';
import { MealLogForm, Ingredient } from '../types/meal';

interface Props {
    mealData: MealLogForm;
    setMealData: React.Dispatch<React.SetStateAction<MealLogForm>>;
    onSubmit: (e: React.FormEvent) => void;
}

export const MealDetails: React.FC<Props> = ({ mealData, setMealData, onSubmit }) => {

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
                <input
                    type="text"
                    placeholder="e.g. Chicken Salad"
                    value={mealData.foodName}
                    onChange={(e) => setMealData({ ...mealData, foodName: e.target.value })}
                    required
                />
            </div>

            <div className="form-group">
                <label>Meal Type</label>
                <select
                    value={mealData.mealType}
                    onChange={(e) => setMealData({ ...mealData, mealType: e.target.value as MealLogForm['mealType'] })}
                >
                    <option value="Breakfast">Breakfast</option>
                    <option value="Lunch">Lunch</option>
                    <option value="Dinner">Dinner</option>
                    <option value="Snack">Snack</option>
                    <option value="Drinks">Drinks</option>
                </select>
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
        </form>
    );
};