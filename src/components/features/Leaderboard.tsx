import { useStore } from "@/lib/store";
import { AppState } from "@/lib/store/types";
import { Card } from "@/components/ui/Card";
import { useMemo, useState } from "react";
import { COUNTRY_FLAG_MAP } from "@/lib/constants";
import Image from "next/image";
import { motion } from "framer-motion";

export function Leaderboard() {
    const currentUser = useStore((state: AppState) => state.user);
    const users = useStore((state: AppState) => state.users);

    const [filter, setFilter] = useState<"global" | "local">("global");

    const sortedUsers = useMemo(() => {
        let filteredUsers = [...users];

        if (filter === "local" && currentUser?.country) {
            filteredUsers = filteredUsers.filter(u => u.country === currentUser.country);
        }

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
        <div className="space-y-4 animate-fade-in mb-24">
            <div className="flex bg-black/20 p-1 rounded-xl backdrop-blur-sm border border-white/5">
                <button
                    onClick={() => setFilter("global")}
                    className={`flex-1 py-1.5 text-xs font-black rounded-lg transition-all ${filter === "global"
                        ? "bg-accent text-primary shadow-lg"
                        : "text-white/40 hover:text-white"
                        }`}
                >
                    GLOBAL
                </button>
                <button
                    onClick={() => setFilter("local")}
                    className={`flex-1 py-1.5 text-xs font-black rounded-lg transition-all ${filter === "local"
                        ? "bg-accent text-primary shadow-lg"
                        : "text-white/40 hover:text-white"
                        }`}
                >
                    {currentUser?.country ? currentUser.country.toUpperCase() : "PAÍS"}
                </button>
            </div>

            <Card className="glass text-white p-4 sticky top-4 z-10 border-none shadow-2xl">
                <div className="grid grid-cols-[1fr_3fr_1fr_1fr] gap-2 items-center text-[10px] font-black opacity-40 uppercase tracking-[0.2em]">
                    <span className="text-center">Pos</span>
                    <span>Jugador</span>
                    <span className="text-center">ME</span>
                    <span className="text-right">Pts</span>
                </div>
            </Card>

            <div className="space-y-2">
                {sortedUsers.map((user, index) => (
                    <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        key={user.email}
                        className={`grid grid-cols-[1fr_3fr_1fr_1fr] gap-2 items-center p-3 rounded-xl transition-all border ${user.email === currentUser?.email
                            ? "bg-accent/10 border-accent/30 shadow-[0_0_20px_rgba(250,204,21,0.1)]"
                            : "bg-white/5 border-white/5 hover:border-white/10"
                            }`}
                    >
                        <span className={`font-black text-xl text-center ${index < 3 ? 'text-accent' : 'text-white/40'}`}>
                            {index + 1}
                        </span>
                        <div className="flex flex-col min-w-0">
                            <span className="font-bold uppercase truncate text-sm text-white/90">{user.name}</span>
                            <div className="flex items-center space-x-2 text-[10px] text-white/30 font-bold tracking-tighter">
                                <div className="relative w-4 h-2.5 shrink-0 shadow-sm border border-white/5 rounded-[1px] overflow-hidden">
                                    {COUNTRY_FLAG_MAP[user.country] ? (
                                        <Image
                                            src={`https://flagcdn.com/w40/${COUNTRY_FLAG_MAP[user.country]}.png`}
                                            alt={user.country}
                                            fill
                                            sizes="16px"
                                            className="object-cover"
                                        />
                                    ) : <span>🏳️</span>}
                                </div>
                                <span className="truncate">{user.country}</span>
                            </div>
                        </div>
                        <span className="font-black text-base text-center text-accent/60">{user.exactMatches}</span>
                        <span className="font-black text-lg text-right">{user.points}</span>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
