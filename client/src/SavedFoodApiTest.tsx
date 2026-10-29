import { useAuth } from "@clerk/react";
import { useState } from "react";

const API_URL = "http://localhost:5000/api/saved-foods";

type SavedFood = {
    _id: string;
    foodName: string;
    calories: number;
    protein?: number;
    carbs?: number;
    fat?: number;
    servingSize?: string;
    };

    export default function SavedFoodApiTest() {
    const { getToken, isLoaded, isSignedIn } = useAuth();

    const [result, setResult] = useState("No test run yet.");
    const [loading, setLoading] = useState(false);
    const [foodId, setFoodId] = useState<string | null>(null);

    // Get the signed-in user's Clerk token
    async function getAuthToken() {
        if (!isLoaded || !isSignedIn) {
        throw new Error("Please sign in first.");
        }

        const token = await getToken();

        if (!token) {
        throw new Error("Unable to retrieve Clerk token.");
        }

        return token;
    }

    // Helper for authenticated requests
    async function foodRequest(
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

    // CREATE: Save a favorite food
    async function saveFood() {
        setLoading(true);
        setResult("Saving favorite food...");

        try {
        const savedFood: SavedFood = await foodRequest("", "POST", {
            foodName: "Jollof Rice",
            calories: 450,
            protein: 12,
            carbs: 68,
            fat: 14,
            servingSize: "1 plate",
            recipeNotes: "Homemade Nigerian jollof rice.",
        });

        setFoodId(savedFood._id);

        setResult(
            JSON.stringify(
            {
                message: "Favorite food saved successfully!",
                savedFood,
            },
            null,
            2
            )
        );
        } catch (error) {
        console.error("Save food failed:", error);
        setResult(
            error instanceof Error ? error.message : "Save failed."
        );
        } finally {
        setLoading(false);
        }
    }

    // READ: Retrieve all saved foods
    async function readFoods() {
        setLoading(true);
        setResult("Retrieving saved foods...");

        try {
        const foods: SavedFood[] = await foodRequest("", "GET");

        setResult(
            JSON.stringify(
            {
                message: "Saved foods retrieved successfully!",
                totalFoods: foods.length,
                foods,
            },
            null,
            2
            )
        );
        } catch (error) {
        console.error("Read foods failed:", error);
        setResult(
            error instanceof Error ? error.message : "Read failed."
        );
        } finally {
        setLoading(false);
        }
    }

    // UPDATE: Change the favorite food's calories
    async function updateFood() {
        if (!foodId) {
        setResult("Save a favorite food first.");
        return;
        }

        setLoading(true);
        setResult("Updating saved food...");

        try {
        const updatedFood = await foodRequest(
            `/${foodId}`,
            "PUT",
            {
            calories: 500,
            recipeNotes: "Updated homemade jollof rice recipe.",
            }
        );

        setResult(
            JSON.stringify(
            {
                message: "Saved food updated successfully!",
                updatedFood,
            },
            null,
            2
            )
        );
        } catch (error) {
        console.error("Update food failed:", error);
        setResult(
            error instanceof Error ? error.message : "Update failed."
        );
        } finally {
        setLoading(false);
        }
    }

    // DELETE: Remove the saved favorite food
    async function deleteFood() {
        if (!foodId) {
        setResult("Save a favorite food first.");
        return;
        }

        setLoading(true);
        setResult("Deleting saved food...");

        try {
        const response = await foodRequest(
            `/${foodId}`,
            "DELETE"
        );

        setFoodId(null);

        setResult(
            JSON.stringify(
            {
                message: "Saved food deleted successfully!",
                response,
            },
            null,
            2
            )
        );
        } catch (error) {
        console.error("Delete food failed:", error);
        setResult(
            error instanceof Error ? error.message : "Delete failed."
        );
        } finally {
        setLoading(false);
        }
    }

    return (
        <div style={{ padding: "20px" }}>
        <h2>CalTrack Saved Foods Test</h2>

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
            onClick={saveFood}
            disabled={loading || !isLoaded || !isSignedIn}
            >
            Save Favorite Food
            </button>

            <button
            onClick={readFoods}
            disabled={loading || !isLoaded || !isSignedIn}
            >
            Read Saved Foods
            </button>

            <button
            onClick={updateFood}
            disabled={
                loading || !isLoaded || !isSignedIn || !foodId
            }
            >
            Update Saved Food
            </button>

            <button
            onClick={deleteFood}
            disabled={
                loading || !isLoaded || !isSignedIn || !foodId
            }
            >
            Delete Saved Food
            </button>
        </div>

        <p>
            <strong>Selected Food ID:</strong>{" "}
            {foodId || "No favorite food selected"}
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
