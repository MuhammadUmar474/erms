"use client";

import { useState, useEffect, useRef } from "react";

export default function SplashScreen({ children }: { children: React.ReactNode }) {
  const [phase, setPhase] = useState<"splash" | "fading" | "done">("splash");
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    // Hold splash for 2.5 seconds
    setTimeout(() => {
      setPhase("fading");

      // Then fade out over 600ms
      setTimeout(() => {
        setPhase("done");
      }, 600);
    }, 2500);
  }, []);

  return (
    <>
      {/* Children always mounted, hidden behind splash */}
      <div
        style={{
          opacity: phase === "done" ? 1 : 0,
          pointerEvents: phase === "done" ? "auto" : "none",
          transition: "opacity 300ms ease-in",
        }}
      >
        {children}
      </div>

      {/* Splash overlay */}
      {phase !== "done" && (
        <div
          style={{
            opacity: phase === "fading" ? 0 : 1,
            transition: "opacity 600ms ease-out",
          }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black"
        >
          <div
            style={{
              transform: phase === "fading" ? "scale(0.95)" : "scale(1)",
              opacity: phase === "fading" ? 0 : 1,
              transition: "all 700ms ease-out",
            }}
            className="flex flex-col items-center"
          >
            <div className="w-16 h-16 bg-primary rounded-xl flex items-center justify-center text-black font-bold text-2xl mb-6 shadow-lg shadow-primary/20">
              R.
            </div>
            <h1 className="text-2xl font-bold tracking-wider uppercase text-white mb-1">
              Reportage
            </h1>
            <p className="text-[11px] tracking-[0.3em] uppercase text-primary font-medium">
              Properties
            </p>
          </div>

          <div className="mt-10 w-32 h-0.5 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-primary rounded-full animate-[splash-bar_2.5s_ease-in-out_forwards]" />
          </div>

          <p className="mt-6 text-[10px] text-white/30 tracking-wide">
            Estate Management System
          </p>
        </div>
      )}
    </>
  );
}
