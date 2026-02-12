"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/utils";
import { COUNTRIES, COUNTRY_FLAG_MAP, CHAMPION_LOCK_DATE } from "@/lib/constants";
import Image from "next/image";
import { AppState } from "@/lib/store/types";
import { RulesModal } from "./RulesModal";

export function ChampionSelector() {
    const router = useRouter();
    const user = useStore((state: AppState) => state.user);
    const setChampion = useStore((state: AppState) => state.setChampion);
    const [selected, setSelected] = useState<string | null>(user?.selectedChampion || null);
    const [searchTerm, setSearchTerm] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [showRules, setShowRules] = useState(false);

    // Bloqueo de campeón: 11 de Junio 2026 14:00 (Inicio primer partido)
    const now = new Date();
    const isLocked = now >= CHAMPION_LOCK_DATE;

    const isChanging = !!user?.selectedChampion;

    const handleConfirmClick = () => {
        if (selected && !isLocked) {
            setShowRules(true);
        }
    };

    const handleRulesAccept = async () => {
        setShowRules(false);
        if (selected) {
            setIsLoading(true);
            await setChampion(selected);
            router.push("/dashboard");
        }
    };

    const filteredCountries = useMemo(() => {
        return COUNTRIES.filter((c) =>
            c.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [searchTerm]);

    return (
        <div className="w-full max-w-md md:max-w-5xl space-y-6 flex flex-col h-[85vh] md:h-auto animate-fade-in">
            <RulesModal
                isOpen={showRules}
                onClose={() => setShowRules(false)}
                onAccept={handleRulesAccept}
                mode="accept"
            />

            <Card className="flex-1 flex flex-col p-6 glass border-none overflow-hidden shadow-2xl">
                <div className="text-center mb-6">
                    <h2 className="text-2xl font-black text-white mb-2 uppercase tracking-widest">
                        {isChanging ? 'Cambiar Campeón' : 'Tu Candidato'}
                    </h2>
                    <p className="text-white/60 text-sm font-medium">
                        {isChanging ? (
                            <>Tu selección actual: <span className="font-bold text-yellow-400 block text-lg">{user?.selectedChampion}</span></>
                        ) : (
                            <>Selecciona quién crees que será el<br />
                                <span className="font-bold text-yellow-400">CAMPEÓN DEL MUNDO 2026</span></>
                        )}
                    </p>
                </div>

                <div className="max-w-md mx-auto w-full mb-6">
                    <Input
                        placeholder="Buscar país..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="bg-white/10 border-white/10 text-white placeholder:text-white/40 focus:border-yellow-400 focus:ring-yellow-400"
                    />
                </div>

                <div className="overflow-y-auto pr-2 flex-1 md:min-h-[400px]">
                    <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4 content-start">
                        {filteredCountries.map((country) => (
                            <button
                                key={country}
                                onClick={() => setSelected(country)}
                                className={cn(
                                    "flex flex-col items-center justify-center p-3 rounded-xl transition-all border-2 h-24 md:h-32 group",
                                    selected === country
                                        ? "border-yellow-400 bg-yellow-400/20 scale-105 shadow-[0_0_15px_rgba(250,204,21,0.3)]"
                                        : "border-white/5 bg-white/5 hover:bg-white/10 hover:border-white/20 hover:scale-105"
                                )}
                            >
                                <div className="relative w-12 h-8 md:w-16 md:h-10 mb-2 shadow-md rounded-[2px] overflow-hidden transition-transform group-hover:scale-110">
                                    {COUNTRY_FLAG_MAP[country] ? (
                                        <Image
                                            src={`https://flagcdn.com/w160/${COUNTRY_FLAG_MAP[country]}.png`}
                                            alt={country}
                                            fill
                                            className="object-cover"
                                        />
                                    ) : <span className="text-4xl">🏳️</span>}
                                </div>
                                <span className={cn(
                                    "text-[10px] md:text-xs font-bold uppercase truncate w-full text-center tracking-wide",
                                    selected === country ? "text-yellow-400" : "text-white/70 group-hover:text-white"
                                )}>
                                    {country}
                                </span>
                            </button>
                        ))}
                        {filteredCountries.length === 0 && (
                            <div className="col-span-full text-center text-white/40 py-10 font-bold">
                                No se encontraron países
                            </div>
                        )}
                    </div>
                </div>

                {isLocked ? (
                    <div className="w-full text-center p-4 bg-red-500/20 border border-red-500/50 rounded-lg">
                        <p className="text-red-400 font-bold uppercase text-sm">
                            La selección de campeón está cerrada
                        </p>
                    </div>
                ) : (
                    <div className="flex gap-3 mt-6 shrink-0 max-w-md mx-auto w-full">
                        {isChanging && (
                            <Button
                                onClick={() => router.back()}
                                className="flex-1 py-6 text-sm font-bold bg-white/10 hover:bg-white/20 text-white border border-white/10"
                            >
                                CANCELAR
                            </Button>
                        )}
                        <Button
                            onClick={handleConfirmClick}
                            disabled={!selected || isLoading}
                            className={cn(
                                "bg-yellow-400 hover:bg-yellow-500 text-[#00377B] font-black py-6 text-lg disabled:opacity-50 transition-all active:scale-95 shadow-lg shadow-yellow-400/20",
                                isChanging ? "flex-1" : "w-full"
                            )}
                        >
                            {isLoading ? 'GUARDANDO...' : 'CONFIRMAR SELECCIÓN'}
                        </Button>
                    </div>
                )}
            </Card>
        </div>
    );
}
