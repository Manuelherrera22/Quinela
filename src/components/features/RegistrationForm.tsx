"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { REGISTRATION_COUNTRIES, COUNTRY_FLAG_MAP } from "@/lib/constants";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import Image from "next/image";
import { AppState } from "@/lib/store/types";

export function RegistrationForm() {
    const router = useRouter();
    const registerUser = useStore((state: AppState) => state.registerUser);

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [country, setCountry] = useState<string>(REGISTRATION_COUNTRIES[0]);
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!name || !email || !password || !confirmPassword) {
            setError("Por favor completa todos los campos");
            return;
        }

        if (password !== confirmPassword) {
            setError("Las contraseñas no coinciden.");
            return;
        }

        if (password.length < 6) {
            setError("La contraseña debe tener al menos 6 caracteres.");
            return;
        }

        setIsLoading(true);
        try {
            await registerUser(name, country, email, password);
            router.push("/champion");
        } catch (err: any) {
            console.error('Registration error:', err);
            setError(err.message || "Error al registrar. Intenta de nuevo.");
            setIsLoading(false);
        }
    };

    return (
        <Card className="w-full max-w-md p-6 glass backdrop-blur shadow-2xl border-0 animate-fade-in mb-20">
            <h2 className="text-2xl font-bold text-center text-white mb-6 uppercase tracking-widest">
                Crear Cuenta
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-xs font-bold text-gray-300 mb-1 tracking-tighter">
                        NOMBRE COMPLETO
                    </label>
                    <Input
                        type="text"
                        name="name"
                        autoComplete="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Tu nombre completo"
                        className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-accent focus:ring-accent"
                    />
                </div>

                <div>
                    <label className="block text-xs font-bold text-gray-300 mb-1 tracking-tighter">
                        PAÍS DE ORIGEN
                    </label>
                    <div className="flex items-center gap-3">
                        <div className="relative w-8 h-5 shrink-0 shadow-sm rounded-sm overflow-hidden">
                            {COUNTRY_FLAG_MAP[country] ? (
                                <Image
                                    src={`https://flagcdn.com/w80/${COUNTRY_FLAG_MAP[country]}.png`}
                                    alt={country}
                                    fill
                                    sizes="32px"
                                    className="object-cover"
                                />
                            ) : <span>🏳️</span>}
                        </div>
                        <select
                            value={country}
                            name="country"
                            autoComplete="country-name"
                            onChange={(e) => setCountry(e.target.value)}
                            className="flex h-10 w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-primary disabled:cursor-not-allowed disabled:opacity-50 transition-all"
                        >
                            {REGISTRATION_COUNTRIES.map((c) => (
                                <option key={c} value={c} className="bg-[#002a5e]">
                                    {c}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-bold text-gray-300 mb-1 tracking-tighter">
                        CORREO INSTITUCIONAL
                    </label>
                    <Input
                        type="email"
                        name="email"
                        autoComplete="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="tucorreo@ejemplo.com"
                        className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-accent focus:ring-accent"
                    />
                </div>

                <div>
                    <label className="block text-xs font-bold text-gray-300 mb-1 tracking-tighter">
                        CONTRASEÑA
                    </label>
                    <Input
                        type="password"
                        name="password"
                        autoComplete="new-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Mínimo 6 caracteres"
                        className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-accent focus:ring-accent"
                    />
                </div>

                <div>
                    <label className="block text-xs font-bold text-gray-300 mb-1 tracking-tighter">
                        CONFIRMAR CONTRASEÑA
                    </label>
                    <Input
                        type="password"
                        name="confirmPassword"
                        autoComplete="new-password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Repite tu contraseña"
                        className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-accent focus:ring-accent"
                    />
                </div>

                {error && <p className="text-red-400 text-sm font-medium animate-pulse">{error}</p>}

                <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-accent hover:bg-yellow-500 text-primary font-black py-6 text-lg mt-4 disabled:opacity-50 transition-all active:scale-95 shadow-[0_0_20px_rgba(250,204,21,0.3)]"
                >
                    {isLoading ? 'REGISTRANDO...' : 'REGISTRARSE'}
                </Button>

                <div className="text-center mt-6 text-sm text-gray-400">
                    ¿Ya tienes cuenta?{" "}
                    <button
                        type="button"
                        onClick={() => router.push("/login")}
                        className="text-accent font-bold hover:underline"
                    >
                        Inicia sesión
                    </button>
                </div>
            </form>
        </Card>
    );
}
