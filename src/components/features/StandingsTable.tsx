"use client";

import { useMemo } from "react";
import { Match } from "@/types";
import { Group, COUNTRY_FLAG_MAP } from "@/lib/constants";
import { calculateGroupStandings } from "@/lib/standings";
import { Card } from "@/components/ui/Card";
import Image from "next/image";

interface StandingsTableProps {
    group: Group;
    matches: Match[];
}

export function StandingsTable({ group, matches }: StandingsTableProps) {
    const standings = useMemo(() => calculateGroupStandings(matches, group), [matches, group]);

    if (standings.length === 0) return null;

    return (
        <Card className="mb-6 bg-white/10 border-none text-white overflow-hidden">
            <div className="bg-[#00377B] p-2 text-center font-bold uppercase tracking-wider relative">
                GRUPO {group}
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-xs">
                    <thead>
                        <tr className="bg-white/5 text-white/70">
                            <th className="p-2 text-left w-1/3">Equipo</th>
                            <th className="p-2 text-center" title="Jugados">PJ</th>
                            <th className="p-2 text-center" title="Ganados">G</th>
                            <th className="p-2 text-center" title="Empatados">E</th>
                            <th className="p-2 text-center" title="Perdidos">P</th>
                            <th className="p-2 text-center" title="Diferencia de Goles">DG</th>
                            <th className="p-2 text-center font-bold" title="Puntos">PTS</th>
                        </tr>
                    </thead>
                    <tbody>
                        {standings.map((team, index) => (
                            <tr
                                key={team.team}
                                className={`border-b border-white/5 ${index < 2 ? 'bg-green-500/10' : ''}`}
                            >
                                <td className="p-2 flex items-center space-x-2">
                                    <div className="relative w-5 h-3.5 shrink-0 shadow-sm">
                                        {COUNTRY_FLAG_MAP[team.team] ? (
                                            <Image
                                                src={`https://flagcdn.com/w40/${COUNTRY_FLAG_MAP[team.team]}.png`}
                                                alt={team.team}
                                                fill
                                                className="object-cover rounded-[1px]"
                                            />
                                        ) : <span>🏳️</span>}
                                    </div>
                                    <span className="font-bold truncate max-w-[80px] sm:max-w-none">{team.team}</span>
                                </td>
                                <td className="p-2 text-center text-white/80">{team.played}</td>
                                <td className="p-2 text-center text-white/60">{team.won}</td>
                                <td className="p-2 text-center text-white/60">{team.drawn}</td>
                                <td className="p-2 text-center text-white/60">{team.lost}</td>
                                <td className="p-2 text-center font-medium">
                                    {team.gd > 0 ? `+${team.gd}` : team.gd}
                                </td>
                                <td className="p-2 text-center font-bold text-yellow-400 text-sm">
                                    {team.points}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </Card>
    );
}
