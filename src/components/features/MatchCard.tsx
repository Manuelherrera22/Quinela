"use client";

import { useState, useEffect } from "react";
import { Match, Prediction } from "@/types";
import { useStore } from "@/lib/store";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { cn, vibrate } from "@/lib/utils";
import { COUNTRY_FLAG_MAP } from "@/lib/constants";
import Image from "next/image";

interface MatchCardProps {
    match: Match;
}

function useCountdown(targetDate: string) {
    const [timeLeft, setTimeLeft] = useState<string>("");

    useEffect(() => {
        const calculateTimeLeft = () => {
            const now = new Date().getTime();
            const target = new Date(targetDate).getTime();
            const diff = target - now;

            if (diff <= 0) return "";

            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

            if (days > 0) return `${days}d ${hours}h`;
            if (hours > 0) return `${hours}h ${minutes}m`;
            return `${minutes}m`;
        };

        setTimeLeft(calculateTimeLeft());
        const interval = setInterval(() => {
            setTimeLeft(calculateTimeLeft());
        }, 60000); // Update every minute

        return () => clearInterval(interval);
    }, [targetDate]);

    return timeLeft;
}

export function MatchCard({ match }: MatchCardProps) {
    const submitPrediction = useStore((state) => state.submitPrediction);
    const predictions = useStore((state) => state.predictions);
    const countdown = useCountdown(match.date);

    // Find existing prediction
    const existingPrediction = predictions.find((p) => p.matchId === match.id);

    const [homeScore, setHomeScore] = useState<string>(
        existingPrediction?.homeScore.toString() ?? ""
    );
    const [awayScore, setAwayScore] = useState<string>(
        existingPrediction?.awayScore.toString() ?? ""
    );
    const [isEditing, setIsEditing] = useState(!existingPrediction);

    // Update local state if prediction changes externally (unlikely but good practice)
    useEffect(() => {
        if (existingPrediction) {
            setHomeScore(existingPrediction.homeScore.toString());
            setAwayScore(existingPrediction.awayScore.toString());
            setIsEditing(false);
        }
    }, [existingPrediction]);

    const handleSave = () => {
        if (homeScore === "" || awayScore === "") return;

        submitPrediction(match.id, parseInt(homeScore), parseInt(awayScore));
        setIsEditing(false);
    };

    const isLocked = match.status !== "open";

    // Determine prediction result for finished matches
    const getPredictionResult = () => {
        if (match.status !== 'finished' || !existingPrediction || match.homeScore === undefined || match.awayScore === undefined) {
            return null;
        }

        const predHome = existingPrediction.homeScore;
        const predAway = existingPrediction.awayScore;
        const realHome = match.homeScore;
        const realAway = match.awayScore;

        if (predHome === realHome && predAway === realAway) {
            return { type: 'exact', points: 5, label: '¡Exacto! +5 pts', color: 'text-green-400' };
        }

        const predWinner = predHome > predAway ? 'home' : (predHome < predAway ? 'away' : 'draw');
        const realWinner = realHome > realAway ? 'home' : (realHome < realAway ? 'away' : 'draw');

        if (predWinner === realWinner) {
            return { type: 'correct', points: 3, label: 'Resultado correcto +3 pts', color: 'text-yellow-400' };
        }

        return { type: 'miss', points: 0, label: 'No acertaste', color: 'text-red-400' };
    };

    const predictionResult = getPredictionResult();

    return (
        <Card className="mb-4 bg-white/10 border-none text-white overflow-hidden">
            {/* Header with Date/Info */}
            <div className="bg-white/5 p-2 text-xs text-center uppercase tracking-wider text-blue-200 flex items-center justify-center gap-2">
                <span>
                    {new Date(match.date).toLocaleDateString("es-ES", {
                        weekday: "long",
                        day: "numeric",
                        month: "long",
                    })}{" "}
                    - {(match as any).group ? `GRUPO ${(match as any).group}` : match.stage}
                </span>
                {match.status === 'open' && countdown && (
                    <span className="bg-yellow-400/20 text-yellow-300 px-2 py-0.5 rounded-full text-[10px] font-bold">
                        ⏱ {countdown}
                    </span>
                )}
                {match.status === 'locked' && match.homeScore === undefined && (
                    <span className="bg-red-500/30 text-red-300 px-2 py-0.5 rounded-full text-[10px] font-bold animate-pulse">
                        🔴 EN VIVO
                    </span>
                )}
            </div>

            <div className="p-3 sm:p-4 flex items-center justify-between gap-1 sm:gap-2">
                {/* Home Team */}
                <div className="flex flex-col items-center w-[30%] sm:w-1/3">
                    <div className="relative w-8 h-6 sm:w-12 sm:h-8 mb-1 sm:mb-2 shadow-sm">
                        {COUNTRY_FLAG_MAP[match.homeTeam] ? (
                            <Image
                                src={`https://flagcdn.com/w160/${COUNTRY_FLAG_MAP[match.homeTeam]}.png`}
                                alt={match.homeTeam}
                                fill
                                sizes="48px"
                                className="object-cover rounded-[2px]"
                            />
                        ) : <span className="text-xl sm:text-2xl">🏳️</span>}
                    </div>
                    <span className="text-[10px] sm:text-sm font-bold text-center leading-tight line-clamp-2 h-[2.5em] flex items-center justify-center">
                        {match.homeTeam}
                    </span>
                </div>

                {/* Score Inputs / Display */}
                <div className="flex flex-col items-center w-[40%] sm:w-1/3 space-y-1 sm:space-y-2">
                    <div className="flex items-center justify-center gap-1 sm:gap-3">
                        {/* Home Score Stepper */}
                        <div className="flex flex-col items-center">
                            {isEditing && !isLocked && (
                                <button
                                    onClick={() => {
                                        setHomeScore(String(Math.min(99, parseInt(homeScore || '0') + 1)));
                                        vibrate(10);
                                    }}
                                    className="w-8 h-6 sm:w-10 sm:h-7 bg-yellow-400 text-[#00377B] rounded-t-lg font-bold text-base sm:text-lg leading-none hover:bg-yellow-300 active:scale-95 transition-all touch-manipulation"
                                >+</button>
                            )}
                            <div className={cn(
                                "w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center text-lg sm:text-xl font-bold rounded-md transition-colors",
                                isEditing && !isLocked ? "bg-white text-black" : "bg-white/20 text-white"
                            )}>
                                {homeScore || '–'}
                            </div>
                            {isEditing && !isLocked && (
                                <button
                                    onClick={() => {
                                        setHomeScore(String(Math.max(0, parseInt(homeScore || '0') - 1)));
                                        vibrate(10);
                                    }}
                                    className="w-8 h-6 sm:w-10 sm:h-7 bg-white/20 text-white rounded-b-lg font-bold text-base sm:text-lg leading-none hover:bg-white/30 active:scale-95 transition-all touch-manipulation"
                                >−</button>
                            )}
                        </div>

                        <span className="text-lg sm:text-xl font-bold opacity-50">-</span>

                        {/* Away Score Stepper */}
                        <div className="flex flex-col items-center">
                            {isEditing && !isLocked && (
                                <button
                                    onClick={() => {
                                        setAwayScore(String(Math.min(99, parseInt(awayScore || '0') + 1)));
                                        vibrate(10);
                                    }}
                                    className="w-8 h-6 sm:w-10 sm:h-7 bg-yellow-400 text-[#00377B] rounded-t-lg font-bold text-base sm:text-lg leading-none hover:bg-yellow-300 active:scale-95 transition-all touch-manipulation"
                                >+</button>
                            )}
                            <div className={cn(
                                "w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center text-lg sm:text-xl font-bold rounded-md transition-colors",
                                isEditing && !isLocked ? "bg-white text-black" : "bg-white/20 text-white"
                            )}>
                                {awayScore || '–'}
                            </div>
                            {isEditing && !isLocked && (
                                <button
                                    onClick={() => {
                                        setAwayScore(String(Math.max(0, parseInt(awayScore || '0') - 1)));
                                        vibrate(10);
                                    }}
                                    className="w-8 h-6 sm:w-10 sm:h-7 bg-white/20 text-white rounded-b-lg font-bold text-base sm:text-lg leading-none hover:bg-white/30 active:scale-95 transition-all touch-manipulation"
                                >−</button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Away Team */}
                <div className="flex flex-col items-center w-[30%] sm:w-1/3">
                    <div className="relative w-8 h-6 sm:w-12 sm:h-8 mb-1 sm:mb-2 shadow-sm">
                        {COUNTRY_FLAG_MAP[match.awayTeam] ? (
                            <Image
                                src={`https://flagcdn.com/w160/${COUNTRY_FLAG_MAP[match.awayTeam]}.png`}
                                alt={match.awayTeam}
                                fill
                                sizes="48px"
                                className="object-cover rounded-[2px]"
                            />
                        ) : <span className="text-xl sm:text-2xl">🏳️</span>}
                    </div>
                    <span className="text-[10px] sm:text-sm font-bold text-center leading-tight line-clamp-2 h-[2.5em] flex items-center justify-center">
                        {match.awayTeam}
                    </span>
                </div>
            </div>

            {/* Footer Actions */}
            <div className="px-4 pb-4 flex justify-center">
                {!isLocked ? (
                    isEditing ? (
                        <Button
                            onClick={handleSave}
                            className="bg-yellow-400 hover:bg-yellow-500 text-[#00377B] font-bold rounded-full w-32"
                        >
                            GUARDAR
                        </Button>
                    ) : (
                        <Button
                            onClick={() => setIsEditing(true)}
                            variant="ghost"
                            className="text-yellow-400 hover:text-yellow-300 hover:bg-white/10 border border-yellow-400 rounded-full w-32"
                        >
                            EDITAR
                        </Button>
                    )
                ) : (
                    <div className="flex flex-col items-center w-full">
                        <div className="text-xs text-gray-400 uppercase font-bold mb-1">
                            {match.status === 'finished' ? 'Finalizado' : 'Cerrado - Jugando'}
                        </div>
                        {match.status === 'finished' && (
                            <>
                                <div className="text-xl font-bold text-yellow-400">
                                    {match.homeScore} - {match.awayScore}
                                </div>
                                {/* Show user prediction vs result */}
                                {existingPrediction && predictionResult && (
                                    <div className="mt-2 text-center w-full bg-white/5 rounded-lg py-2 px-3">
                                        <div className="text-[10px] text-gray-400 uppercase mb-1">Tu predicción</div>
                                        <div className="flex items-center justify-center gap-2">
                                            <span className="text-sm font-bold text-white/80">
                                                {existingPrediction.homeScore} - {existingPrediction.awayScore}
                                            </span>
                                            <span className={cn("text-xs font-bold", predictionResult.color)}>
                                                {predictionResult.label}
                                            </span>
                                        </div>
                                    </div>
                                )}
                                {!existingPrediction && (
                                    <div className="mt-2 text-[10px] text-gray-500 italic">
                                        No hiciste predicción
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                )}
            </div>
        </Card>
    );
}
