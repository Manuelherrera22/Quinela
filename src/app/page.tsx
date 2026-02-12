"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";

export default function Home() {
  const router = useRouter();
  const user = useStore((state) => state.user);

  useEffect(() => {
    // If user is already registered, go to dashboard (or champion selection if not selected)
    // For now, let's say if user exists, go to Dashboard.
    // If not, go to Register.
    if (user) {
      if (!user.selectedChampion) {
        router.push("/champion");
      } else {
        router.push("/dashboard");
      }
    } else {
      router.push("/register");
    }
  }, [user, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#00377B]">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
    </div>
  );
}
