"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/utils";
import { COUNTRIES, COUNTRY_FLAG_MAP } from "@/lib/constants";
import Image from "next/image";

export function ChampionSelector() {
    const router = useRouter();
    const user = useStore((state) => state.user);
    const setChampion = useStore((state) => state.setChampion);
    const [selected, setSelected] = useState<string | null>(user?.selectedChampion || null);
    const [searchTerm, setSearchTerm] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const isChanging = !!user?.selectedChampion;

    const handleConfirm = async () => {
        if (selected) {
            setIsLoading(true);
            await setChampion(selected);
            router.push("/dashboard");
        }
    };

    const filteredOne = useMemo(() => {
        return COUNTRIES.filter((c) =>
            c.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [searchTerm]);

    return (
        <div className="w-full max-w-md space-y-6 flex flex-col h-[80vh]">
            <Card className="flex-1 flex flex-col p-6 bg-white/95 backdrop-blur shadow-xl border-none overflow-hidden">
                <h2 className="text-xl font-bold text-center text-[#00377B] mb-2 uppercase">
                    {isChanging ? 'Cambiar Campeón' : 'Tu Candidato'}
                </h2>
                <p className="text-center text-gray-600 mb-4 text-sm">
                    {isChanging ? (
                        <>Tu selección actual: <span className="font-bold text-[#00377B]">{user?.selectedChampion}</span></>
                    ) : (
                        <>Selecciona quién crees que será el<br />
                            <span className="font-bold">CAMPEÓN DEL MUNDO 2026</span></>
                    )}
                </p>

                <Input
                    placeholder="Buscar país..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="mb-4"
                />

                <div className="grid grid-cols-3 gap-3 overflow-y-auto pr-2 flex-1 content-start">
                    {filteredOne.map((country) => (
                        <button
                            key={country}
                            onClick={() => setSelected(country)}
                            className={cn(
                                "flex flex-col items-center justify-center p-3 rounded-lg transition-all border-2 h-24",
                                selected === country
                                    ? "border-[#00377B] bg-blue-50 scale-105 shadow-md"
                                    : "border-transparent hover:bg-gray-50 hover:scale-105"
                            )}
                        >
                            <div className="relative w-12 h-8 mb-2 shadow-sm">
                                {COUNTRY_FLAG_MAP[country] ? (
                                    <Image
                                        src={`https://flagcdn.com/w160/${COUNTRY_FLAG_MAP[country]}.png`}
                                        alt={country}
                                        fill
                                        className="object-cover rounded-[2px]"
                                    />
                                ) : <span className="text-4xl">🏳️</span>}
                            </div>
                            <span className="text-xs font-bold text-gray-700 truncate w-full text-center">
                                {country}
                            </span>
                        </button>
                    ))}
                    {filteredOne.length === 0 && (
                        <div className="col-span-3 text-center text-gray-500 py-10">
                            No se encontraron países
                        </div>
                    )}
                </div>

                <div className="flex gap-3 mt-4 shrink-0">
                    {isChanging && (
                        <Button
                            onClick={() => router.back()}
                            variant="outline"
                            className="flex-1 py-4 text-lg"
                        >
                            CANCELAR
                        </Button>
                    )}
                    <Button
                        onClick={handleConfirm}
                        disabled={!selected || isLoading}
                        className={cn(
                            "bg-[#00377B] hover:bg-[#002a5e] text-white py-4 text-lg disabled:opacity-50",
                            isChanging ? "flex-1" : "w-full"
                        )}
                    >
                        {isLoading ? 'GUARDANDO...' : 'CONFIRMAR SELECCIÓN'}
                    </Button>
                </div>
            </Card>
        </div>
    );
}
