import * as React from "react";
import { cn } from "@/lib/utils";

interface TabsProps {
    tabs: { id: string; label: string }[];
    activeTab: string;
    onTabChange: (id: string) => void;
    className?: string;
}

export function Tabs({ tabs, activeTab, onTabChange, className }: TabsProps) {
    return (
        <div className={cn("inline-flex space-x-1 bg-white/10 p-1 rounded-full", className)}>
            {tabs.map((tab) => (
                <button
                    key={tab.id}
                    onClick={() => onTabChange(tab.id)}
                    className={cn(
                        "px-6 py-2 rounded-full text-sm font-bold uppercase transition-all",
                        activeTab === tab.id
                            ? "bg-[#FFD700] text-[#00377B] shadow-md" // Yellow bg, Blue text for active
                            : "text-white hover:bg-white/10"
                    )}
                >
                    {tab.label}
                </button>
            ))}
        </div>
    );
}
