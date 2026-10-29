import { useAuth } from "@clerk/react";
import { useState } from "react";

const API_URL = "http://localhost:5000/api/goals";

export default function GoalApiTest() {
    const { getToken, isLoaded, isSignedIn } = useAuth();

    const [result, setResult] = useState("No test run yet.");
    const [loading, setLoading] = useState(false);

    // Get the signed-in user's Clerk token
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

    // SAVE: Create or update calorie and nutrition goals
    async function saveGoals() {
        setLoading(true);
        setResult("Saving nutrition goals...");

        try {
        const token = await getAuthToken();

        const response = await fetch(API_URL, {
            method: "PUT",
            headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
            calorieMin: 1800,
            calorieMax: 2200,
            proteinTarget: 120,
            carbsTarget: 250,
            fatTarget: 65,
            stickerColor: "pink",
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "Failed to save goals.");
        }

        setResult(
            JSON.stringify(
            {
                message: "Nutrition goals saved successfully!",
                savedGoals: data,
            },
            null,
            2
            )
        );
        } catch (error) {
        console.error("Save goals failed:", error);

        setResult(
            error instanceof Error ? error.message : "Save failed."
        );
        } finally {
        setLoading(false);
        }
    }

    // READ: Retrieve goals from MongoDB
    async function readGoals() {
        setLoading(true);
        setResult("Retrieving nutrition goals...");

        try {
        const token = await getAuthToken();

        const response = await fetch(API_URL, {
            headers: {
            Authorization: `Bearer ${token}`,
            },
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "Failed to retrieve goals.");
        }

        setResult(
            JSON.stringify(
            {
                message: "Nutrition goals retrieved successfully!",
                goals: data,
            },
            null,
            2
            )
        );
        } catch (error) {
        console.error("Read goals failed:", error);

        setResult(
            error instanceof Error ? error.message : "Read failed."
        );
        } finally {
        setLoading(false);
        }
    }

    return (
        <div style={{ padding: "20px" }}>
        <h2>CalTrack Nutrition Goals Test</h2>

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
            onClick={saveGoals}
            disabled={loading || !isLoaded || !isSignedIn}
            >
            Save Goals
            </button>

            <button
            onClick={readGoals}
            disabled={loading || !isLoaded || !isSignedIn}
            >
            Read Goals
            </button>
        </div>

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
