"use client";

import { useEffect } from "react";
import { useStore } from "@/lib/store";

export function InitStore() {
    const fetchInitialData = useStore((state) => state.fetchInitialData);
    const loginUser = useStore((state) => state.loginUser);
    const user = useStore((state) => state.user);

    useEffect(() => {
        fetchInitialData().then(() => {
            // Restore session from localStorage
            const savedEmail = localStorage.getItem("quiniela_user_email");
            if (savedEmail && !useStore.getState().user) {
                loginUser(savedEmail);
            }
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return null;
}
