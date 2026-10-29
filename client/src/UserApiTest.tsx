import { useAuth } from "@clerk/react";
import { useState } from "react";

const API_URL = "http://localhost:5000/api/users";

export default function UserApiTest() {
    const { getToken, isLoaded, isSignedIn } = useAuth();
    const [result, setResult] = useState("No test run yet.");
    const [loading, setLoading] = useState(false);

    async function request(method: "GET" | "PUT", body?: object) {
        if (!isLoaded || !isSignedIn) {
        throw new Error("Please sign in first.");
        }

        const token = await getToken();
        if (!token) throw new Error("Clerk token unavailable.");

        const response = await fetch(API_URL, {
        method,
        headers: {
            Authorization: `Bearer ${token}`,
            ...(body ? { "Content-Type": "application/json" } : {}),
        },
        ...(body ? { body: JSON.stringify(body) } : {}),
        });

        const data = await response.json();

        if (!response.ok) {
        throw new Error(data.error || "Request failed.");
        }

        return data;
    }

    async function runTest(method: "GET" | "PUT") {
        setLoading(true);

        try {
        const data = await request(
            method,
            method === "PUT"
            ? {
                displayName: "CalTrack Test User",
                hiddenNutrients: ["fat"],
                }
            : undefined
        );

        setResult(
            JSON.stringify(
            {
                message:
                method === "PUT"
                    ? "User settings saved successfully!"
                    : "User settings retrieved successfully!",
                user: data,
            },
            null,
            2
            )
        );
        } catch (error) {
        setResult(
            error instanceof Error ? error.message : "Test failed."
        );
        } finally {
        setLoading(false);
        }
    }

    return (
        <div style={{ padding: "20px" }}>
        <h2>CalTrack User Settings Test</h2>

        <div style={{ display: "flex", gap: "10px" }}>
            <button
            disabled={loading || !isLoaded || !isSignedIn}
            onClick={() => runTest("PUT")}
            >
            Save User Settings
            </button>

            <button
            disabled={loading || !isLoaded || !isSignedIn}
            onClick={() => runTest("GET")}
            >
            Read User Settings
            </button>
        </div>

        <pre style={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}>
            {result}
        </pre>
        </div>
    );
}
