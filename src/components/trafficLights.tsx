import { PinOff } from "lucide-react";
import type { FC } from "react";
import { useEffect } from "react";
import { useLocalStorage } from "../hooks/core/useLocalStorage";
import {
    closeWindow,
    minimizeWindow,
    setWindowAlwaysOnTop,
    toggleMaximizeWindow,
} from "../services/core/windowService";

export const TrafficLights: FC = () => {
    const [isPinned, setIsPinned] = useLocalStorage<boolean>(
        "window-pinned",
        false,
    );

    useEffect(() => {
        setWindowAlwaysOnTop(isPinned);
    }, [isPinned]);

    const togglePinning = async () => {
        await setWindowAlwaysOnTop(!isPinned);
        setIsPinned(!isPinned);
    };

    return (
        <div className="z-50 flex items-center gap-2 px-3">
            <button
                type="button"
                onClick={closeWindow}
                className="group relative h-3 w-3 rounded-full bg-[#FF5F57] transition-all focus:outline-none"
            >
                <div className="pointer-events-none absolute inset-0 rounded-full bg-[#450C0A] opacity-0 transition-opacity group-hover:opacity-10" />
                <svg
                    width="12"
                    height="12"
                    viewBox="0 0 12 12"
                    className="pointer-events-none absolute inset-0 scale-0 transition-transform group-hover:scale-100"
                >
                    <title>Close window</title>
                    <path
                        d="M 3,3 L 9,9 M 9,3 L 3,9"
                        stroke="#730A07"
                        strokeWidth="1.1"
                        fill="none"
                    />
                </svg>
            </button>
            <button
                type="button"
                onClick={minimizeWindow}
                className="group relative h-3 w-3 rounded-full bg-[#FFBD2E] transition-all focus:outline-none"
            >
                <div className="pointer-events-none absolute inset-0 rounded-full bg-[#9B6A0D] opacity-0 transition-opacity group-hover:opacity-10" />
                <svg
                    width="12"
                    height="12"
                    viewBox="0 0 12 12"
                    className="pointer-events-none absolute inset-0 scale-0 transition-transform group-hover:scale-100"
                >
                    <title>Minimize window</title>
                    <path
                        d="M 3,6 L 9,6"
                        stroke="#AD7C14"
                        strokeWidth="1.1"
                        fill="none"
                    />
                </svg>
            </button>
            <button
                type="button"
                onClick={toggleMaximizeWindow}
                className="group relative h-3 w-3 rounded-full bg-[#28C940] transition-all focus:outline-none"
            >
                <div className="pointer-events-none absolute inset-0 rounded-full bg-[#0B4F15] opacity-0 transition-opacity group-hover:opacity-10" />
                <svg
                    width="12"
                    height="12"
                    viewBox="0 0 12 12"
                    className="pointer-events-none absolute inset-0 scale-0 transition-transform group-hover:scale-100"
                >
                    <title>Maximize window</title>
                    <path
                        d="M 3.5,3.5 L 8.5,3.5 L 8.5,8.5 L 3.5,8.5 Z"
                        stroke="#0F6A1D"
                        strokeWidth="1.1"
                        fill="none"
                    />
                </svg>
            </button>
            <button
                type="button"
                onClick={togglePinning}
                className={`group relative h-3 w-3 rounded-full transition-all focus:outline-none ${
                    isPinned
                        ? "bg-accent"
                        : "border-2 border-accent/70 bg-transparent"
                }`}
            >
                <div
                    className={`absolute inset-0 rounded-full ${
                        isPinned
                            ? "bg-accent"
                            : "bg-accent/20 opacity-0 group-hover:opacity-100"
                    }`}
                />
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                    {isPinned ? (
                        <PinOff
                            size={8}
                            className="text-ctp-mantle opacity-0 group-hover:opacity-100 rotate-0 group-hover:rotate-45 transition-all duration-200"
                        />
                    ) : null}
                </div>
            </button>
        </div>
    );
};
