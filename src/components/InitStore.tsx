"use client";

import { useEffect } from "react";
import { useStore } from "@/lib/store";
import { supabase } from "@/lib/supabase";

export function InitStore() {
    const fetchInitialData = useStore((state) => state.fetchInitialData);
    const fetchMatches = useStore((state) => state.fetchMatches);

    useEffect(() => {
        fetchInitialData();

        // Supabase Realtime: subscribe to changes
        const usersChannel = supabase
            .channel("realtime-users")
            .on("postgres_changes", { event: "*", schema: "public", table: "users" }, () => {
                fetchInitialData();
            })
            .subscribe();

        const matchesChannel = supabase
            .channel("realtime-matches")
            .on("postgres_changes", { event: "*", schema: "public", table: "matches" }, () => {
                fetchMatches();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(usersChannel);
            supabase.removeChannel(matchesChannel);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return null;
}
