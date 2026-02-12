"use client";

import { useState, useEffect } from "react";
import { Match, Prediction } from "@/types";
import { useStore } from "@/lib/store";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { cn, vibrate } from "@/lib/utils";
import { COUNTRY_FLAG_MAP } from "@/lib/constants";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { AppState } from "@/lib/store/types";

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
        }, 60000);

        return () => clearInterval(interval);
    }, [targetDate]);

    return timeLeft;
}

export function MatchCard({ match }: MatchCardProps) {
    const submitPrediction = useStore((state: AppState) => state.submitPrediction);
    const predictions = useStore((state: AppState) => state.predictions);
    const countdown = useCountdown(match.date);

    const existingPrediction = predictions.find((p) => p.matchId === match.id);

    const [homeScore, setHomeScore] = useState<string>(
        existingPrediction?.homeScore.toString() ?? ""
    );
    const [awayScore, setAwayScore] = useState<string>(
        existingPrediction?.awayScore.toString() ?? ""
    );
    const [isEditing, setIsEditing] = useState(!existingPrediction);

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
            return { type: 'correct', points: 3, label: 'Resultado +3 pts', color: 'text-yellow-400' };
        }

        return { type: 'miss', points: 0, label: 'No acertaste', color: 'text-red-400' };
    };

    const predictionResult = getPredictionResult();

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
        >
            <Card className="mb-4 glass border-none text-white overflow-hidden shadow-2xl">
                <div className="bg-white/5 p-2 text-[10px] text-center uppercase tracking-widest text-blue-200 flex items-center justify-center gap-2">
                    <span className="font-bold">
                        {new Date(match.date).toLocaleDateString("es-ES", {
                            weekday: "short",
                            day: "numeric",
                            month: "short",
                        })} - {match.group ? `GRUPO ${match.group}` : match.stage}
                    </span>
                    {match.status === 'open' && countdown && (
                        <span className="bg-yellow-400 text-[#00377B] px-2 py-0.5 rounded-full text-[9px] font-black">
                            {countdown}
                        </span>
                    )}
                    {match.status === 'locked' && match.homeScore === undefined && (
                        <span className="bg-red-500 text-white px-2 py-0.5 rounded-full text-[9px] font-black animate-pulse">
                            VIVO
                        </span>
                    )}
                </div>

                <div className="p-4 flex items-center justify-between gap-2">
                    {/* Home Team */}
                    <div className="flex flex-col items-center w-[30%]">
                        <div className="relative w-10 h-7 mb-2 shadow-lg rounded-sm overflow-hidden border border-white/10">
                            {COUNTRY_FLAG_MAP[match.homeTeam] ? (
                                <Image
                                    src={`https://flagcdn.com/w160/${COUNTRY_FLAG_MAP[match.homeTeam]}.png`}
                                    alt={match.homeTeam}
                                    fill
                                    sizes="40px"
                                    className="object-cover"
                                />
                            ) : <span className="text-xl">🏳️</span>}
                        </div>
                        <span className="text-[11px] font-bold text-center leading-tight h-[2.5em] flex items-center justify-center">
                            {match.homeTeam}
                        </span>
                    </div>

                    {/* Scores */}
                    <div className="flex flex-col items-center w-[40%]">
                        <div className="flex items-center justify-center gap-2 sm:gap-4">
                            {/* Home Score */}
                            <div className="flex flex-col items-center">
                                <AnimatePresence>
                                    {isEditing && !isLocked && (
                                        <motion.button
                                            initial={{ opacity: 0, y: 5 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: 5 }}
                                            onClick={() => { setHomeScore(String(Math.min(99, parseInt(homeScore || '0') + 1))); vibrate(10); }}
                                            className="w-8 h-6 bg-accent text-primary rounded-t-lg font-black hover:bg-yellow-300 active:scale-90 transition-all"
                                        >+</motion.button>
                                    )}
                                </AnimatePresence>
                                <div className={cn(
                                    "w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center text-xl font-black rounded-lg transition-all shadow-inner",
                                    isEditing && !isLocked ? "bg-white text-primary scale-110 shadow-accent/20" : "bg-black/40 text-white/50"
                                )}>
                                    {homeScore || '0'}
                                </div>
                                <AnimatePresence>
                                    {isEditing && !isLocked && (
                                        <motion.button
                                            initial={{ opacity: 0, y: -5 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -5 }}
                                            onClick={() => { setHomeScore(String(Math.max(0, parseInt(homeScore || '0') - 1))); vibrate(10); }}
                                            className="w-8 h-6 bg-white/20 text-white rounded-b-lg font-black hover:bg-white/30 active:scale-90 transition-all"
                                        >−</motion.button>
                                    )}
                                </AnimatePresence>
                            </div>

                            <span className="text-xl font-black text-accent/50">VS</span>

                            {/* Away Score */}
                            <div className="flex flex-col items-center">
                                <AnimatePresence>
                                    {isEditing && !isLocked && (
                                        <motion.button
                                            initial={{ opacity: 0, y: 5 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: 5 }}
                                            onClick={() => { setAwayScore(String(Math.min(99, parseInt(awayScore || '0') + 1))); vibrate(10); }}
                                            className="w-8 h-6 bg-accent text-primary rounded-t-lg font-black hover:bg-yellow-300 active:scale-90 transition-all"
                                        >+</motion.button>
                                    )}
                                </AnimatePresence>
                                <div className={cn(
                                    "w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center text-xl font-black rounded-lg transition-all shadow-inner",
                                    isEditing && !isLocked ? "bg-white text-primary scale-110 shadow-accent/20" : "bg-black/40 text-white/50"
                                )}>
                                    {awayScore || '0'}
                                </div>
                                <AnimatePresence>
                                    {isEditing && !isLocked && (
                                        <motion.button
                                            initial={{ opacity: 0, y: -5 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -5 }}
                                            onClick={() => { setAwayScore(String(Math.max(0, parseInt(awayScore || '0') - 1))); vibrate(10); }}
                                            className="w-8 h-6 bg-white/20 text-white rounded-b-lg font-black hover:bg-white/30 active:scale-90 transition-all"
                                        >−</motion.button>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    </div>

                    {/* Away Team */}
                    <div className="flex flex-col items-center w-[30%]">
                        <div className="relative w-10 h-7 mb-2 shadow-lg rounded-sm overflow-hidden border border-white/10">
                            {COUNTRY_FLAG_MAP[match.awayTeam] ? (
                                <Image
                                    src={`https://flagcdn.com/w160/${COUNTRY_FLAG_MAP[match.awayTeam]}.png`}
                                    alt={match.awayTeam}
                                    fill
                                    sizes="40px"
                                    className="object-cover"
                                />
                            ) : <span className="text-xl">🏳️</span>}
                        </div>
                        <span className="text-[11px] font-bold text-center leading-tight h-[2.5em] flex items-center justify-center">
                            {match.awayTeam}
                        </span>
                    </div>
                </div>

                {/* Footer Controls */}
                <div className="px-4 pb-4 flex justify-center">
                    {!isLocked ? (
                        <Button
                            onClick={isEditing ? handleSave : () => setIsEditing(true)}
                            className={cn(
                                "rounded-full font-black px-8 transition-all active:scale-95",
                                isEditing ? "bg-accent text-primary shadow-lg shadow-accent/20" : "bg-white/10 text-accent border border-accent/30 hover:bg-white/20"
                            )}
                        >
                            {isEditing ? 'CONFIRMAR' : 'EDITAR'}
                        </Button>
                    ) : (
                        <div className="flex flex-col items-center w-full">
                            {match.status === 'finished' && (
                                <motion.div
                                    initial={{ opacity: 0, y: 5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="text-center w-full"
                                >
                                    <div className="text-xl font-black text-accent mb-2">
                                        {match.homeScore} - {match.awayScore}
                                    </div>
                                    {existingPrediction && predictionResult && (
                                        <div className="bg-black/20 rounded-xl p-3 border border-white/5">
                                            <div className="text-[9px] font-bold text-white/40 uppercase mb-1">Tu Predicción</div>
                                            <div className="flex items-center justify-center gap-3">
                                                <span className="text-sm font-black text-white/90">
                                                    {existingPrediction.homeScore} - {existingPrediction.awayScore}
                                                </span>
                                                <span className={cn("text-[10px] font-black uppercase tracking-tighter", predictionResult.color)}>
                                                    {predictionResult.label}
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                </motion.div>
                            )}
                            {match.status === 'locked' && match.homeScore === undefined && (
                                <div className="text-xs font-bold text-red-400 animate-pulse tracking-widest uppercase">
                                    Partido en progreso
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </Card>
        </motion.div>
    );
}
