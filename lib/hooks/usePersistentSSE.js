import { useState, useEffect, useRef, useReducer } from "react";

export function usePersistentSSE({ url, autoReconnect = false }) {
    const [statusLog, setStatusLog] = useState([]);
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const eventSourceRef = useRef(null);
    const [, forceUpdate] = useReducer((x) => x + 1, 0);

    // Restore log from sessionStorage
    useEffect(() => {
        const savedLog = sessionStorage.getItem("statusLog");
        if (savedLog) setStatusLog(JSON.parse(savedLog));
    }, []);

    // Persist log to sessionStorage
    useEffect(() => {
        sessionStorage.setItem("statusLog", JSON.stringify(statusLog));
    }, [statusLog]);

    // Prevent accidental reload
    useEffect(() => {
        const handleBeforeUnload = (e) => {
            if (isLoading) {
                e.preventDefault();
                e.returnValue = "";
            }
        };

        window.addEventListener("beforeunload", handleBeforeUnload);
        return () =>
            window.removeEventListener("beforeunload", handleBeforeUnload);
    }, [isLoading]);

    const startStream = () => {
        if (eventSourceRef.current) return;

        setStatusLog(["Running the update... This may take a while."]);
        setError(null);
        setIsLoading(true);
        localStorage.setItem("streamActive", "true");

        const source = new EventSource(`${url}&_=${Date.now()}`);
        eventSourceRef.current = source;

        source.addEventListener("status", (event) => {
            const data = JSON.parse(event.data);
            setStatusLog((prev) => [...prev, data.message]);
            forceUpdate();

            const isTerminal =
                data.message.includes("completed") ||
                data.message.includes("error") ||
                data.message.includes("Task Complete");

            if (isTerminal) {
                setIsLoading(false);
                source.close();
                eventSourceRef.current = null;
                localStorage.removeItem("streamActive");

                // Schedule UI reset only if task completed successfully
                if (data.message.includes("Task Complete")) {
                    setTimeout(() => {
                        setStatusLog([]);
                        setError(null);
                    }, 30000);
                }
            }
        });

        source.addEventListener("error", (event) => {
            const message =
                event?.data?.trim() || "An unexpected error occurred.";
            setError(message);
            setStatusLog((prev) => [...prev, message]);
            setIsLoading(false);
            source.close();
            eventSourceRef.current = null;
            localStorage.removeItem("streamActive");
        });

        source.onerror = (event) => {
            if (!error) {
                const genericErrorMessage =
                    "Connection closed unexpectedly or network error.";
                setError(genericErrorMessage);
                setStatusLog((prev) => [...prev, genericErrorMessage]);
            }
        };
    };

    return {
        statusLog,
        error,
        isLoading,
        startStream,
    };
}
