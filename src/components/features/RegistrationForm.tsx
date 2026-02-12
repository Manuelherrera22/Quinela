"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { REGISTRATION_COUNTRIES, COUNTRY_FLAG_MAP } from "@/lib/constants";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import Image from "next/image";

export function RegistrationForm() {
    const router = useRouter();
    const registerUser = useStore((state) => state.registerUser);
    const users = useStore((state) => state.users);

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

        // Email duplicate validation
        const emailExists = users.some(u => u.email === email);
        if (emailExists) {
            setError("Ya existe una cuenta con este correo electrónico.");
            return;
        }

        // Password confirmation
        if (password !== confirmPassword) {
            setError("Las contraseñas no coinciden.");
            return;
        }

        if (password.length < 4) {
            setError("La contraseña debe tener al menos 4 caracteres.");
            return;
        }

        setIsLoading(true);
        try {
            await registerUser(name, country, email, password);
            router.push("/champion");
        } catch {
            setError("Error al registrar. Intenta de nuevo.");
            setIsLoading(false);
        }
    };

    return (
        <Card className="w-full max-w-md p-6 bg-white/90 backdrop-blur-sm shadow-xl border-0">
            <h2 className="text-2xl font-bold text-center text-[#00377B] mb-6">REGISTROS</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        NOMBRE:
                    </label>
                    <Input
                        type="text"
                        name="name"
                        autoComplete="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Tu nombre completo"
                        className="border-gray-300 focus:border-[#00377B] focus:ring-[#00377B]"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        PAÍS:
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
                            className="flex h-10 w-full rounded-md border border-gray-300 bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00377B] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {REGISTRATION_COUNTRIES.map((c) => (
                                <option key={c} value={c}>
                                    {c}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        CORREO:
                    </label>
                    <Input
                        type="email"
                        name="email"
                        autoComplete="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="tucorreo@ejemplo.com"
                        className="border-gray-300 focus:border-[#00377B] focus:ring-[#00377B]"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        CONTRASEÑA:
                    </label>
                    <Input
                        type="password"
                        name="password"
                        autoComplete="new-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Mínimo 4 caracteres"
                        className="border-gray-300 focus:border-[#00377B] focus:ring-[#00377B]"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        CONFIRMAR CONTRASEÑA:
                    </label>
                    <Input
                        type="password"
                        name="confirmPassword"
                        autoComplete="new-password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Repite tu contraseña"
                        className="border-gray-300 focus:border-[#00377B] focus:ring-[#00377B]"
                    />
                </div>

                {error && <p className="text-red-500 text-sm font-medium">{error}</p>}

                <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-[#00377B] hover:bg-[#002a5e] text-white font-bold py-6 text-lg mt-4 disabled:opacity-50"
                >
                    {isLoading ? 'REGISTRANDO...' : 'REGISTRARSE'}
                </Button>

                <div className="text-center mt-4 text-sm text-gray-600">
                    ¿Ya tienes cuenta?{" "}
                    <button
                        type="button"
                        onClick={() => router.push("/login")}
                        className="text-[#00377B] font-bold hover:underline"
                    >
                        Inicia sesión
                    </button>
                </div>
            </form>
        </Card>
    );
}
