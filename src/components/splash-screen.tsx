"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";

export default function SplashScreen({ children }: { children: React.ReactNode }) {
  const [phase, setPhase] = useState<"splash" | "fading" | "done">("splash");
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    setTimeout(() => {
      setPhase("fading");

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
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white overflow-hidden"
        >
          {/* Center content */}
          <div
            style={{
              transform: phase === "fading" ? "scale(0.95)" : "scale(1)",
              opacity: phase === "fading" ? 0 : 1,
              transition: "all 700ms ease-out",
            }}
            className="relative flex flex-col items-center"
          >
            <Image
              src="/r_logo.png"
              alt="Reportage"
              width={510}
              height={310}
              priority
              className="object-contain"
            />
          </div>

          {/* Bottom section */}
          <div className="absolute bottom-6 flex flex-col items-center">
            <Image
              src="/reportage_logo.png"
              alt="Reportage"
              width={230}
              height={45}
              className="object-contain opacity-40 -mb-10"
            />
            <p className="text-[11px] text-gray-400 tracking-wide">
              Copyright &copy; 2026 Reportage Group. All rights reserved
            </p>
          </div>
        </div>
      )}
    </>
  );
}
