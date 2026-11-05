export interface Ingredient {
    name: string;
    quantity: number;
    unit: string;
}

export interface MealLogForm {
    clerkUserId?: string;
    foodName: string;
    mealType: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack' | 'Drinks';
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    servingSize: string;
    weightGrams: number;
    source: 'manual' | 'ai' | 'saved';
    ingredients: Ingredient[];
}

export type ModalStep = 'CLOSED' | 'MENU' | 'CAMERA' | 'EDIT_PAGE' | 'SAVED_MEALS';