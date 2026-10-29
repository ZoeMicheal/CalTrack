
import { useAuth } from "@clerk/react";
import { useState } from "react";

type Meal = {
  _id: string;
  foodName: string;
  mealType: string;
  calories: number;
};

const API_URL = "http://localhost:5000/api/meals";

export default function MealApiTest() {
  const { getToken, isSignedIn, isLoaded } = useAuth();

  const [result, setResult] = useState("No test run yet.");
  const [loading, setLoading] = useState(false);
  const [mealId, setMealId] = useState<string | null>(null);

  // Get a valid Clerk token before making API requests
  async function getAuthToken() {
    if (!isLoaded || !isSignedIn) {
      throw new Error("Please sign in first.");
    }

    const token = await getToken();

    if (!token) {
      throw new Error("Unable to get Clerk token.");
    }

    return token;
  }

  // Helper function for authenticated API requests
  async function mealRequest(
    endpoint: string,
    method: string,
    body?: object
  ) {
    const token = await getAuthToken();

    const response = await fetch(`${API_URL}${endpoint}`, {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        ...(body ? { "Content-Type": "application/json" } : {}),
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });

    const text = await response.text();

    let data;

    try {
      data = JSON.parse(text);
    } catch {
      throw new Error(
        `Server returned an invalid response (HTTP ${response.status}).`
      );
    }

    if (!response.ok) {
      throw new Error(data.error || "Request failed.");
    }

    return data;
  }

  // CREATE: Save a new meal to MongoDB
  async function saveTestMeal() {
    setLoading(true);
    setResult("Saving test meal...");

    try {
      const savedMeal: Meal = await mealRequest("", "POST", {
        foodName: "Jollof Rice",
        mealType: "Lunch",
        calories: 450,
        protein: 12,
        carbs: 68,
        fat: 14,
        servingSize: "1 plate",
        weightGrams: 250,
        source: "manual",
      });

      setMealId(savedMeal._id);

      const meals: Meal[] = await mealRequest("", "GET");

      setResult(
        JSON.stringify(
          {
            message: "Meal saved successfully!",
            savedMeal,
            totalMeals: meals.length,
          },
          null,
          2
        )
      );
    } catch (error) {
      console.error("Save failed:", error);
      setResult(
        error instanceof Error ? error.message : "Save failed."
      );
    } finally {
      setLoading(false);
    }
  }

  // UPDATE: Change the saved meal's calories to 500
  async function updateTestMeal() {
    if (!mealId) {
      setResult("Save a test meal first.");
      return;
    }

    setLoading(true);
    setResult("Updating test meal...");

    try {
      const updatedMeal = await mealRequest(
        `/${mealId}`,
        "PUT",
        { calories: 500 }
      );

      setResult(
        JSON.stringify(
          {
            message: "Meal updated successfully!",
            updatedMeal,
          },
          null,
          2
        )
      );
    } catch (error) {
      console.error("Update failed:", error);
      setResult(
        error instanceof Error ? error.message : "Update failed."
      );
    } finally {
      setLoading(false);
    }
  }

  // DELETE: Remove the test meal from MongoDB
  async function deleteTestMeal() {
    if (!mealId) {
      setResult("Save a test meal first.");
      return;
    }

    setLoading(true);
    setResult("Deleting test meal...");

    try {
      const response = await mealRequest(
        `/${mealId}`,
        "DELETE"
      );

      setMealId(null);

      setResult(
        JSON.stringify(
          {
            message: "Meal deleted successfully!",
            response,
          },
          null,
          2
        )
      );
    } catch (error) {
      console.error("Delete failed:", error);
      setResult(
        error instanceof Error ? error.message : "Delete failed."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ padding: "20px" }}>
      <h2>CalTrack Database Test</h2>

      <p>
        Authentication status:{" "}
        {isSignedIn ? "Signed in" : "Signed out"}
      </p>

      <div
        style={{
          display: "flex",
          gap: "10px",
          flexWrap: "wrap",
        }}
      >
        <button
          onClick={saveTestMeal}
          disabled={loading || !isLoaded || !isSignedIn}
        >
          Save Test Meal
        </button>

        <button
          onClick={updateTestMeal}
          disabled={
            loading || !isLoaded || !isSignedIn || !mealId
          }
        >
          Update Test Meal
        </button>

        <button
          onClick={deleteTestMeal}
          disabled={
            loading || !isLoaded || !isSignedIn || !mealId
          }
        >
          Delete Test Meal
        </button>
      </div>

      <p>
        <strong>Selected Meal ID:</strong>{" "}
        {mealId || "No test meal selected"}
      </p>

      <pre
        style={{
          whiteSpace: "pre-wrap",
          overflowWrap: "anywhere",
        }}
      >
        {result}
      </pre>
    </div>
  );
}

