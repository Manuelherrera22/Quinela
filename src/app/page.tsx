"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";

export default function Home() {
  const router = useRouter();
  const user = useStore((state) => state.user);
  const isLoading = useStore((state) => state.isLoading);

  useEffect(() => {
    if (isLoading) return; // Wait for initial data and session restoration

    if (user) {
      if (!user.selectedChampion) {
        router.push("/champion");
      } else {
        router.push("/dashboard");
      }
    } else {
      router.push("/register");
    }
  }, [user, router, isLoading]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#00377B]">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
    </div>
  );
}
