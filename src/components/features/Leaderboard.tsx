"use client";

import { useStore } from "@/lib/store";
import { User } from "@/types";
import { Card } from "@/components/ui/Card";
import { useMemo, useState } from "react";
import { COUNTRY_FLAG_MAP } from "@/lib/constants";
import Image from "next/image";

export function Leaderboard() {
    const currentUser = useStore((state) => state.user);
    const users = useStore((state) => state.users);

    const [filter, setFilter] = useState<"global" | "local">("global");

    const sortedUsers = useMemo(() => {
        let filteredUsers = [...users];

        // Filter users based on selection
        if (filter === "local" && currentUser?.country) {
            filteredUsers = filteredUsers.filter(u => u.country === currentUser.country);
        }

        // Sort by points descending
        // Tie-breaker: Exact Matches (desc) -> Name (asc)
        filteredUsers.sort((a, b) => {
            if (b.points !== a.points) {
                return b.points - a.points;
            }
            if (b.exactMatches !== a.exactMatches) {
                return b.exactMatches - a.exactMatches;
            }
            return a.name.localeCompare(b.name);
        });

        return filteredUsers;
    }, [users, currentUser, filter]);

    return (
        <div className="space-y-4">
            {/* Filter Tabs */}
            <div className="flex bg-[#002a5e] p-1 rounded-lg">
                <button
                    onClick={() => setFilter("global")}
                    className={`flex-1 py-1 text-xs font-bold rounded-md transition-all ${filter === "global"
                        ? "bg-yellow-400 text-[#00377B]"
                        : "text-white/60 hover:text-white"
                        }`}
                >
                    GLOBAL
                </button>
                <button
                    onClick={() => setFilter("local")}
                    className={`flex-1 py-1 text-xs font-bold rounded-md transition-all ${filter === "local"
                        ? "bg-yellow-400 text-[#00377B]"
                        : "text-white/60 hover:text-white"
                        }`}
                >
                    {currentUser?.country ? currentUser.country.toUpperCase() : "PAÍS"}
                </button>
            </div>
            <Card className="bg-[#00377B] text-white p-4 mb-4 border-none shadow-lg sticky top-0 z-10">
                <div className="grid grid-cols-[1fr_3fr_1fr_1fr] gap-2 items-center text-xs font-bold opacity-80 uppercase tracking-widest mb-0">
                    <span className="text-center">Pos</span>
                    <span>Jugador</span>
                    <span className="text-center" title="Marcadores Exactos">M.E.</span>
                    <span className="text-right">Pts</span>
                </div>
            </Card>

            {sortedUsers.map((user, index) => (
                <div
                    key={index}
                    className={`grid grid-cols-[1fr_3fr_1fr_1fr] gap-2 items-center p-3 rounded-lg mb-2 text-white ${user.email === currentUser?.email
                        ? "bg-yellow-400/20 border border-yellow-400"
                        : "bg-white/5"
                        }`}
                >
                    <span className="font-bold text-xl text-center">{index + 1}</span>
                    <div className="flex flex-col min-w-0">
                        <span className="font-bold uppercase truncate">{user.name}</span>
                        <div className="flex items-center space-x-2 text-xs text-gray-300">
                            <div className="relative w-5 h-3.5 shrink-0">
                                {COUNTRY_FLAG_MAP[user.country] ? (
                                    <Image
                                        src={`https://flagcdn.com/w40/${COUNTRY_FLAG_MAP[user.country]}.png`}
                                        alt={user.country}
                                        fill
                                        sizes="20px"
                                        className="object-cover rounded-[1px]"
                                    />
                                ) : <span>🏳️</span>}
                            </div>
                            <span className="truncate hidden sm:inline">{user.country}</span>
                        </div>
                    </div>
                    <span className="font-bold text-lg text-center text-yellow-400/80">{user.exactMatches}</span>
                    <span className="font-bold text-xl text-right">{user.points}</span>
                </div>
            ))}
        </div>
    );
}
