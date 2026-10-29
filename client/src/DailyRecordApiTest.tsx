import { useAuth } from "@clerk/react";
import { useState } from "react";

const API_URL = "http://localhost:5000/api/daily-records";
const TEST_DATE = "2026-10-29";

export default function DailyRecordApiTest() {
    const { getToken, isLoaded, isSignedIn } = useAuth();

    const [result, setResult] = useState("No test run yet.");
    const [loading, setLoading] = useState(false);

    async function request(
        endpoint: string,
        method: "GET" | "PUT" | "DELETE",
        body?: object
    ) {
        if (!isLoaded || !isSignedIn) {
        throw new Error("Please sign in first.");
        }

        const token = await getToken();

        if (!token) {
        throw new Error("Unable to retrieve Clerk token.");
        }

        const response = await fetch(`${API_URL}${endpoint}`, {
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

    async function runTest(
        action: "save" | "read" | "update" | "delete"
    ) {
        setLoading(true);
        setResult(`Running ${action} test...`);

        try {
        let data;

        switch (action) {
            case "save":
            data = await request(`/${TEST_DATE}`, "PUT", {
                isComplete: false,
                goalAchieved: false,
                stickerColor: "pink",
            });
            break;

            case "read":
            data = await request(`/${TEST_DATE}`, "GET");
            break;

            case "update":
            data = await request(`/${TEST_DATE}`, "PUT", {
                isComplete: true,
                goalAchieved: true,
                stickerColor: "pink",
            });
            break;

            case "delete":
            data = await request(`/${TEST_DATE}`, "DELETE");
            break;
        }

        setResult(
            JSON.stringify(
            {
                message: `${action.toUpperCase()} test successful!`,
                date: TEST_DATE,
                result: data,
            },
            null,
            2
            )
        );
        } catch (error) {
        console.error(`${action} test failed:`, error);

        setResult(
            error instanceof Error ? error.message : "Test failed."
        );
        } finally {
        setLoading(false);
        }
    }

    return (
        <div style={{ padding: "20px" }}>
        <h2>CalTrack Daily Records Test</h2>

        <p>Test date: {TEST_DATE}</p>

        <div
            style={{
            display: "flex",
            gap: "10px",
            flexWrap: "wrap",
            }}
        >
            <button
            disabled={loading || !isLoaded || !isSignedIn}
            onClick={() => runTest("save")}
            >
            Save Daily Record
            </button>

            <button
            disabled={loading || !isLoaded || !isSignedIn}
            onClick={() => runTest("read")}
            >
            Read Daily Record
            </button>

            <button
            disabled={loading || !isLoaded || !isSignedIn}
            onClick={() => runTest("update")}
            >
            Update Daily Record
            </button>

            <button
            disabled={loading || !isLoaded || !isSignedIn}
            onClick={() => runTest("delete")}
            >
            Delete Daily Record
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
