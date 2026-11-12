import NavBar from '../components/NavBar';
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import './Meallog.css';
import { useEffect, useState } from "react";
import { useAuth } from "@clerk/clerk-react";


interface MeallogProps {
    onNavigate?: (page: string) => void;
}

interface LoggedMeal {
    _id: string;
    foodName: string;
    mealType: "Breakfast" | "Lunch" | "Dinner" | "Snack" | "Drinks";
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    servingSize?: string;
    weightGrams?: number;
    consumedAt: string;
}

function Meallog({ onNavigate }: MeallogProps) {

    const { userId, getToken } = useAuth();

    const [loggedMeals, setLoggedMeals] = useState<LoggedMeal[]>([]);

    const [selectedMeal, setSelectedMeal] = useState<LoggedMeal | null>(null);
    const [savingMeal, setSavingMeal] = useState(false);
    const [deletingMeal, setDeletingMeal] = useState(false);
    const [formData, setFormData] = useState({
        foodName: "",
        mealType: "Breakfast",
        calories: "",
        protein: "",
        carbs: "",
        fat: "",
        fiber: "",
        weightGrams: "",
    });

    const [loadingMeals, setLoadingMeals] = useState(true);
    const [mealError, setMealError] = useState("");
    useEffect(() => {
        if (!userId) {
            setLoggedMeals([]);
            setSelectedMeal(null);
            setLoadingMeals(false);
            return;
        }

        let cancelled = false;

        const fetchMeals = async () => {
            setLoadingMeals(true);
            setMealError("");

            try {
                const token = await getToken();

                if (!token) {
                    throw new Error("Please sign in to view your meals.");
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
                    throw new Error("Failed to retrieve your meals.");
                }

                const data: LoggedMeal[] = await response.json();
                console.log("Meal Log database response:", data);

                if (!cancelled) {
                    setLoggedMeals(data);
                }
            } catch (error) {
                if (!cancelled) {
                    setMealError(
                        error instanceof Error
                            ? error.message
                            : "Something went wrong."
                    );
                }
            } finally {
                if (!cancelled) {
                    setLoadingMeals(false);
                }
            }
        };

        fetchMeals();

        return () => {
            cancelled = true;
        };
    }, [userId, getToken]);

    const handleSelectMeal = (meal: LoggedMeal) => {
        setSelectedMeal(meal);

        setFormData({
            foodName: meal.foodName,
            mealType: meal.mealType,
            calories: String(meal.calories),
            protein: String(meal.protein),
            carbs: String(meal.carbs),
            fat: String(meal.fat),
            fiber: "",
            weightGrams: meal.weightGrams != null
                ? String(meal.weightGrams)
                : "",
        });
    };

    const hasChanges = selectedMeal !== null && (
        formData.foodName !== selectedMeal.foodName ||
        formData.mealType !== selectedMeal.mealType ||
        formData.calories !== String(selectedMeal.calories) ||
        formData.protein !== String(selectedMeal.protein) ||
        formData.carbs !== String(selectedMeal.carbs) ||
        formData.fat !== String(selectedMeal.fat) ||
        formData.weightGrams !== (
            selectedMeal.weightGrams != null
                ? String(selectedMeal.weightGrams)
                : ""
        )
    );

    const handleSaveChanges = async () => {
        if (!selectedMeal || !hasChanges || savingMeal) return;

        const numericFields = [
            formData.calories,
            formData.protein,
            formData.carbs,
            formData.fat,
        ];

        if (
            !formData.foodName.trim() ||
            numericFields.some((value) =>
                value.trim() === "" ||
                !Number.isFinite(Number(value)) ||
                Number(value) < 0
            ) ||
            (
                formData.weightGrams.trim() !== "" &&
                (
                    !Number.isFinite(Number(formData.weightGrams)) ||
                    Number(formData.weightGrams) < 0
                )
            )
        ) {
            alert("Please enter a food name and valid non-negative nutrition values.");
            return;
        }

        setSavingMeal(true);

        try {
            const token = await getToken();

            if (!token) {
                throw new Error("Please sign in to update your meal.");
            }

            const response = await fetch(
                `http://localhost:5000/api/meals/${selectedMeal._id}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        foodName: formData.foodName.trim(),
                        mealType: formData.mealType,
                        calories: Number(formData.calories),
                        protein: Number(formData.protein),
                        carbs: Number(formData.carbs),
                        fat: Number(formData.fat),
                        weightGrams: formData.weightGrams.trim() === ""
                            ? null
                            : Number(formData.weightGrams),
                    }),
                }
            );

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || "Failed to update meal.");
            }

            const updatedMeal: LoggedMeal = await response.json();

            setLoggedMeals((previous) =>
                previous.map((meal) =>
                    meal._id === updatedMeal._id ? updatedMeal : meal
                )
            );

            handleSelectMeal(updatedMeal);
            alert("Meal updated successfully!");
        } catch (error) {
            alert(
                error instanceof Error
                    ? error.message
                    : "Unable to update meal."
            );
        } finally {
            setSavingMeal(false);
        }
    };

    const handleDeleteMeal = async () => {
        if (!selectedMeal || deletingMeal) return;

        const confirmed = window.confirm(
            `Are you sure you want to delete "${selectedMeal.foodName}"?`
        );

        if (!confirmed) return;

        setDeletingMeal(true);

        try {
            const token = await getToken();

            if (!token) {
                throw new Error("Please sign in to delete your meal.");
            }

            const response = await fetch(
                `http://localhost:5000/api/meals/${selectedMeal._id}`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || "Failed to delete meal.");
            }

            setLoggedMeals((previous) =>
                previous.filter((meal) => meal._id !== selectedMeal._id)
            );

            setSelectedMeal(null);

            setFormData({
                foodName: "",
                mealType: "Breakfast",
                calories: "",
                protein: "",
                carbs: "",
                fat: "",
                fiber: "",
                weightGrams: "",
            });

            alert("Meal deleted successfully!");
        } catch (error) {
            alert(
                error instanceof Error
                    ? error.message
                    : "Unable to delete meal."
            );
        } finally {
            setDeletingMeal(false);
        }
    };

    const handleCancelChanges = () => {
        if (!selectedMeal) return;
        handleSelectMeal(selectedMeal);
    };

    const now = new Date();
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
    const mealsForSelectedDate = loggedMeals.filter((meal) => {
        return (
            new Date(meal.consumedAt).toDateString() ===
            selecteddate.toDateString()
        );
    });

    const meals = [
        {id:1, label: 'Food name', placeholder:'Eg: Protein Shake', type:'text'},
        {id:2, label: 'Calories (kcal)', placeholder:'Eg: 250', type:'number'},
        {id:3, label: 'Protein (g)', placeholder:'Eg: 23g', type:'number'},
        {id:4, label: 'Carbs (g)', placeholder:'Eg: 21g', type:'number'},
        {id:5, label: 'Fat (g)', placeholder:'Eg: 8g', type:'number'},
        {id:6, label: 'Fiber (g)', placeholder:'Eg: 5g', type:'number'},
        {id:7, label: 'Serving (g)', placeholder:'Eg: 400g', type:'number'},
    ]

    return (
        <section className="Meallogpage">
            <div className="Meallogheader"> Edit Meal</div>
     <div className="DateSwipe">
        <button className="swipebutton" onClick={() => changeDate(-1)}>
            <IoIosArrowBack />
        </button>
        <p className="Datetext">{changingdate}</p>
        <button className="swipebutton" onClick={() => changeDate(1)}>
            <IoIosArrowForward />
        </button>
    </div>

            <div className="LoggedMealsList">
                <h3>Logged Meals</h3>

                {loadingMeals ? (
                    <p>Loading your meals...</p>
                ) : mealError ? (
                    <p role="alert">{mealError}</p>
                ) : mealsForSelectedDate.length === 0 ? (
                    <p>No meals logged for this date.</p>
                ) : (
                    mealsForSelectedDate.map((meal) => (
                        <button
                            key={meal._id}
                            type="button"
                            className="LoggedMealItem"
                            onClick={() => handleSelectMeal(meal)}
                        >
                            <span>{meal.foodName}</span>
                            <span>{meal.calories} kcal</span>
                        </button>
                    ))
                )}
            </div>


            <select
                className="Mealtype"
                value={formData.mealType}
                onChange={(event) =>
                    setFormData((previous) => ({
                        ...previous,
                        mealType: event.target.value,
                    }))
                }
            >
                <option value="Breakfast">Breakfast</option>
                <option value="Lunch">Lunch</option>
                <option value="Dinner">Dinner</option>
                <option value="Snack">Snacks</option>
                <option value="Drinks">Drinks</option>
            </select>
            <div className="Logbubble">
   <ul className="Bubblecontent">
       {meals.map(meal => (
           <li className="Formrow" key={meal.id}>
               <label className="Formlabel">{meal.label}</label>
               <input
                   className="Forminput"
                   type={meal.type}
                   placeholder={meal.placeholder}
                   value={
                       meal.id === 1 ? formData.foodName :
                           meal.id === 2 ? formData.calories :
                               meal.id === 3 ? formData.protein :
                                   meal.id === 4 ? formData.carbs :
                                       meal.id === 5 ? formData.fat :
                                           meal.id === 6 ? formData.fiber :
                                               formData.weightGrams
                   }
                   onChange={(event) => {
                       const field = (
                           meal.id === 1 ? "foodName" :
                               meal.id === 2 ? "calories" :
                                   meal.id === 3 ? "protein" :
                                       meal.id === 4 ? "carbs" :
                                           meal.id === 5 ? "fat" :
                                               meal.id === 6 ? "fiber" :
                                                   "weightGrams"
                       );

                       setFormData((previous) => ({
                           ...previous,
                           [field]: event.target.value,
                       }));
                   }}
               />
           </li>
       ))}
   </ul>
            </div>
            {selectedMeal && (
                <>
                    {hasChanges && (
                        <>
                            <button
                                className="Savebutton"
                                onClick={handleSaveChanges}
                                disabled={savingMeal || deletingMeal}
                            >
                                {savingMeal ? "Saving..." : "Save changes"}
                            </button>

                            <button
                                className="Cancelbutton"
                                onClick={handleCancelChanges}
                                disabled={savingMeal || deletingMeal}
                            >
                                Cancel
                            </button>
                        </>
                    )}

                    <button
                        className="Deletebutton"
                        onClick={handleDeleteMeal}
                        disabled={savingMeal || deletingMeal}
                    >
                        {deletingMeal ? "Deleting..." : "Delete this meal"}
                    </button>
                </>
            )}
            <NavBar
                onOpenMenu={() => {}}
                onNavigate={onNavigate}
                currentPage="meallog"
            />
        </section>
    )
}

export default Meallog;
