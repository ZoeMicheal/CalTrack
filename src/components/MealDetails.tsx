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
        <form onSubmit={onSubmit} className="edit-food-form">
            <h3>Your New Meal!</h3>

            <label>Food Name</label>
            <input
                type="text"
                value={mealData.foodName}
                onChange={(e) => setMealData({ ...mealData, foodName: e.target.value })}
                required
            />

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

            <div style={{ background: '#f5f5f5', padding: 10, borderRadius: 8, margin: '10px 0' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    <div>
                        <label>Total Calories</label>
                        <input
                            type="number"
                            value={mealData.calories}
                            onChange={(e) => setMealData({ ...mealData, calories: Number(e.target.value) })}
                            required
                        />
                    </div>
                    <div>
                        <label>Total Weight (g)</label>
                        <input
                            type="number"
                            value={mealData.weightGrams}
                            onChange={(e) => setMealData({ ...mealData, weightGrams: Number(e.target.value) })}
                        />
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6, marginTop: 8 }}>
                    <div>
                        <label>Protein (g)</label>
                        <input
                            type="number"
                            value={mealData.protein}
                            onChange={(e) => setMealData({ ...mealData, protein: Number(e.target.value) })}
                        />
                    </div>
                    <div>
                        <label>Carbs (g)</label>
                        <input
                            type="number"
                            value={mealData.carbs}
                            onChange={(e) => setMealData({ ...mealData, carbs: Number(e.target.value) })}
                        />
                    </div>
                    <div>
                        <label>Fat (g)</label>
                        <input
                            type="number"
                            value={mealData.fat}
                            onChange={(e) => setMealData({ ...mealData, fat: Number(e.target.value) })}
                        />
                    </div>
                </div>
            </div>

            <h4>Ingredients List</h4>
            {mealData.ingredients.map((ing, idx) => (
                <div key={idx} style={{ display: 'flex', gap: 6, marginBottom: 6 }}>
                    <input
                        type="text"
                        placeholder="Ingredient"
                        value={ing.name}
                        onChange={(e) => handleIngredientChange(idx, 'name', e.target.value)}
                    />
                    <input
                        type="number"
                        placeholder="Qty"
                        style={{ width: 60 }}
                        value={ing.quantity}
                        onChange={(e) => handleIngredientChange(idx, 'quantity', Number(e.target.value))}
                    />
                    <input
                        type="text"
                        placeholder="Unit"
                        style={{ width: 50 }}
                        value={ing.unit}
                        onChange={(e) => handleIngredientChange(idx, 'unit', e.target.value)}
                    />
                    <button type="button" onClick={() => removeIngredient(idx)}>✕</button>
                </div>
            ))}
            <button type="button" onClick={addIngredient} style={{ marginBottom: 15 }}>
                + Add Ingredient
            </button>

            <button type="submit" className="primary-btn" style={{ width: '100%', padding: 10 }}>
                Save Meal
            </button>
        </form>
    );
};