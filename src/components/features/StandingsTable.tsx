"use client";

import { useMemo } from "react";
import { Match } from "@/types";
import { Group, COUNTRY_FLAG_MAP } from "@/lib/constants";
import { calculateGroupStandings } from "@/lib/standings";
import { Card } from "@/components/ui/Card";
import Image from "next/image";
import { motion } from "framer-motion";

interface StandingsTableProps {
    group: Group;
    matches: Match[];
}

export function StandingsTable({ group, matches }: StandingsTableProps) {
    const standings = useMemo(() => calculateGroupStandings(matches, group), [matches, group]);

    if (standings.length === 0) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <Card className="mb-8 glass border-none text-white overflow-hidden shadow-2xl">
                <div className="bg-white/10 p-3 text-center font-black uppercase tracking-[0.2em] text-accent text-sm">
                    GRUPO {group}
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-xs sm:text-sm">
                        <thead>
                            <tr className="bg-black/20 text-white/50 border-b border-white/5">
                                <th className="p-3 text-left font-bold uppercase tracking-tighter">Equipo</th>
                                <th className="p-3 text-center font-bold" title="Jugados">PJ</th>
                                <th className="p-3 text-center font-bold" title="Ganados">G</th>
                                <th className="p-3 text-center font-bold" title="Empatados">E</th>
                                <th className="p-3 text-center font-bold" title="Perdidos">P</th>
                                <th className="p-3 text-center font-bold" title="Diferencia de Goles">DG</th>
                                <th className="p-3 text-center font-black text-accent" title="Puntos">PTS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {standings.map((team, index) => (
                                <tr
                                    key={team.team}
                                    className={cn(
                                        "border-b border-white/5 transition-colors hover:bg-white/5",
                                        index < 2 ? 'bg-green-500/5' : ''
                                    )}
                                >
                                    <td className="p-3 flex items-center space-x-3">
                                        <div className="relative w-6 h-4 shrink-0 shadow-md border border-white/10 rounded-[1px] overflow-hidden">
                                            {COUNTRY_FLAG_MAP[team.team] ? (
                                                <Image
                                                    src={`https://flagcdn.com/w40/${COUNTRY_FLAG_MAP[team.team]}.png`}
                                                    alt={team.team}
                                                    fill
                                                    sizes="24px"
                                                    className="object-cover"
                                                />
                                            ) : <span>🏳️</span>}
                                        </div>
                                        <span className="font-bold truncate max-w-[100px] sm:max-w-none text-white/90">
                                            {team.team}
                                        </span>
                                    </td>
                                    <td className="p-3 text-center text-white/60 font-medium">{team.played}</td>
                                    <td className="p-3 text-center text-white/60">{team.won}</td>
                                    <td className="p-3 text-center text-white/60">{team.drawn}</td>
                                    <td className="p-3 text-center text-white/60">{team.lost}</td>
                                    <td className="p-3 text-center font-bold text-white/80">
                                        {team.gd > 0 ? `+${team.gd}` : team.gd}
                                    </td>
                                    <td className="p-3 text-center font-black text-accent text-base">
                                        {team.points}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </motion.div>
    );
}

// Helper to keep using 'cn' if needed, though not imported in original snippet. 
// Adding it for safety if I use it.
import { cn } from "@/lib/utils";
