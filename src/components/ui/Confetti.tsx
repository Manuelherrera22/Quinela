"use client";

import { useEffect, useState } from "react";

const COLORS = ["#facc15", "#22c55e", "#3b82f6", "#ef4444", "#a855f7", "#ec4899", "#f97316"];

interface ConfettiProps {
    active: boolean;
    duration?: number;
}

export function Confetti({ active, duration = 3000 }: ConfettiProps) {
    const [particles, setParticles] = useState<Array<{ id: number; left: string; delay: string; color: string; size: number }>>([]);

    useEffect(() => {
        if (active) {
            const newParticles = Array.from({ length: 50 }, (_, i) => ({
                id: i,
                left: `${Math.random() * 100}%`,
                delay: `${Math.random() * 1}s`,
                color: COLORS[Math.floor(Math.random() * COLORS.length)],
                size: Math.random() * 8 + 6,
            }));
            setParticles(newParticles);

            const timer = setTimeout(() => setParticles([]), duration);
            return () => clearTimeout(timer);
        }
    }, [active, duration]);

    if (particles.length === 0) return null;

    return (
        <div className="confetti-container">
            {particles.map(p => (
                <div
                    key={p.id}
                    className="confetti-particle"
                    style={{
                        left: p.left,
                        animationDelay: p.delay,
                        backgroundColor: p.color,
                        width: `${p.size}px`,
                        height: `${p.size}px`,
                        borderRadius: Math.random() > 0.5 ? "50%" : "2px",
                    }}
                />
            ))}
        </div>
    );
}
