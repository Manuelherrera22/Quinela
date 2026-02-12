"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import bcrypt from 'bcryptjs';

export function LoginForm() {
    const router = useRouter();
    const loginUser = useStore((state) => state.loginUser);
    const users = useStore((state) => state.users);

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!email || !password) {
            setError("Por favor completa todos los campos");
            return;
        }

        setIsLoading(true);

        try {
            const user = users.find(u => u.email === email);

            if (!user) {
                setError("No encontramos una cuenta con este correo.");
                setIsLoading(false);
                return;
            }

            if (!user.password) {
                setError("Contraseña incorrecta.");
                setIsLoading(false);
                return;
            }

            // Support both hashed (bcrypt) and legacy plaintext passwords
            const isHashed = user.password.startsWith('$2');
            let passwordValid = false;

            if (isHashed) {
                passwordValid = await bcrypt.compare(password, user.password);
            } else {
                passwordValid = user.password === password;
            }

            if (!passwordValid) {
                setError("Contraseña incorrecta.");
                setIsLoading(false);
                return;
            }

            await loginUser(email);
            router.push("/dashboard");
        } catch {
            setError("Error al iniciar sesión. Intenta de nuevo.");
            setIsLoading(false);
        }
    };

    return (
        <Card className="w-full max-w-md p-6 bg-white/90 backdrop-blur-sm shadow-xl border-0">
            <h2 className="text-2xl font-bold text-center text-[#00377B] mb-6">INICIAR SESIÓN</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
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
                        autoComplete="current-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="********"
                        className="border-gray-300 focus:border-[#00377B] focus:ring-[#00377B]"
                    />
                </div>

                {error && <p className="text-red-500 text-sm font-medium">{error}</p>}

                <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-[#00377B] hover:bg-[#002a5e] text-white font-bold py-6 text-lg mt-4 disabled:opacity-50"
                >
                    {isLoading ? 'CARGANDO...' : 'ENTRAR'}
                </Button>

                <div className="text-center mt-4 text-sm text-gray-600">
                    ¿No tienes cuenta?{" "}
                    <button
                        type="button"
                        onClick={() => router.push("/register")}
                        className="text-[#00377B] font-bold hover:underline"
                    >
                        Regístrate aquí
                    </button>
                </div>
            </form>
        </Card>
    );
}
