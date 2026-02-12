"use client";

import { useState, useEffect, useMemo } from "react";
import { useStore } from "@/lib/store";
import { AppState } from "@/lib/store/types";
import { COUNTRY_FLAG_MAP } from "@/lib/constants";
import Image from "next/image";
import { Timer } from "lucide-react";

interface TimeLeft {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
}

export function CountdownTimer() {
    const matches = useStore((state: AppState) => state.matches);
    const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);

    const nextMatch = useMemo(() => {
        const now = new Date();
        return matches
            .filter(m => m.status === 'open' && new Date(m.date) > now)
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];
    }, [matches]);

    useEffect(() => {
        if (!nextMatch) return;

        const calculate = () => {
            const now = new Date().getTime();
            const target = new Date(nextMatch.date).getTime();
            const diff = target - now;

            if (diff <= 0) {
                setTimeLeft(null);
                return;
            }

            setTimeLeft({
                days: Math.floor(diff / (1000 * 60 * 60 * 24)),
                hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
                minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
                seconds: Math.floor((diff % (1000 * 60)) / 1000),
            });
        };

        calculate();
        const interval = setInterval(calculate, 1000);
        return () => clearInterval(interval);
    }, [nextMatch]);

    if (!nextMatch || !timeLeft) return null;

    const units = [
        { value: timeLeft.days, label: "DÍAS" },
        { value: timeLeft.hours, label: "HRS" },
        { value: timeLeft.minutes, label: "MIN" },
        { value: timeLeft.seconds, label: "SEG" },
    ];

    const homeFlag = nextMatch.homeFlag || COUNTRY_FLAG_MAP[nextMatch.homeTeam];
    const awayFlag = nextMatch.awayFlag || COUNTRY_FLAG_MAP[nextMatch.awayTeam];

    return (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#00377B] via-[#004494] to-[#00377B] border border-white/10 p-5 shadow-2xl mb-6">
            {/* Glow effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/5 via-transparent to-yellow-400/5 pointer-events-none" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-1 bg-gradient-to-r from-transparent via-yellow-400/50 to-transparent rounded-full" />

            <div className="relative z-10">
                {/* Label */}
                <div className="flex items-center justify-center gap-2 mb-4">
                    <Timer size={14} className="text-yellow-400" />
                    <span className="text-[10px] font-bold text-yellow-400 uppercase tracking-[0.2em]">
                        Próximo Partido
                    </span>
                </div>

                {/* Teams */}
                <div className="flex items-center justify-center gap-4 mb-5">
                    <div className="flex items-center gap-2">
                        {homeFlag && (
                            <div className="relative w-8 h-5 shadow-md rounded-[1px] overflow-hidden">
                                <Image src={`https://flagcdn.com/w80/${homeFlag}.png`} alt={nextMatch.homeTeam} fill className="object-cover" />
                            </div>
                        )}
                        <span className="text-white font-black text-sm md:text-base uppercase tracking-wide">{nextMatch.homeTeam}</span>
                    </div>
                    <span className="text-white/30 text-xs font-bold">VS</span>
                    <div className="flex items-center gap-2">
                        <span className="text-white font-black text-sm md:text-base uppercase tracking-wide">{nextMatch.awayTeam}</span>
                        {awayFlag && (
                            <div className="relative w-8 h-5 shadow-md rounded-[1px] overflow-hidden">
                                <Image src={`https://flagcdn.com/w80/${awayFlag}.png`} alt={nextMatch.awayTeam} fill className="object-cover" />
                            </div>
                        )}
                    </div>
                </div>

                {/* Countdown */}
                <div className="flex justify-center gap-3">
                    {units.map((unit) => (
                        <div key={unit.label} className="flex flex-col items-center">
                            <div className="bg-black/30 backdrop-blur-sm border border-white/10 rounded-xl w-16 h-16 md:w-20 md:h-20 flex items-center justify-center shadow-lg">
                                <span className="text-2xl md:text-3xl font-black text-white tabular-nums">
                                    {String(unit.value).padStart(2, '0')}
                                </span>
                            </div>
                            <span className="text-[9px] font-bold text-white/40 mt-1.5 tracking-widest">{unit.label}</span>
                        </div>
                    ))}
                </div>

                {/* Match date */}
                <div className="text-center mt-4">
                    <span className="text-[10px] text-white/30 font-medium">
                        {new Date(nextMatch.date).toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                        {" — "}
                        {new Date(nextMatch.date).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })}
                    </span>
                </div>
            </div>
        </div>
    );
}
