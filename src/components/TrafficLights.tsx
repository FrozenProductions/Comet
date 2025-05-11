import { FC } from "react";
import { invoke } from "@tauri-apps/api/tauri";

export const TrafficLights: FC = () => {
    const handleClose = async () => {
        await invoke("close_window");
    };

    const handleMinimize = async () => {
        await invoke("minimize_window");
    };

    const handleMaximize = async () => {
        await invoke("toggle_maximize_window");
    };

    return (
        <div className="flex items-center gap-2 px-3 z-50">
            <button
                onClick={handleClose}
                className="relative w-3 h-3 rounded-full bg-[#FF5F57] transition-all group focus:outline-none"
            >
                <div className="absolute inset-0 rounded-full bg-[#450C0A] opacity-0 group-hover:opacity-10 transition-opacity pointer-events-none" />
                <svg
                    width="12"
                    height="12"
                    viewBox="0 0 12 12"
                    className="absolute inset-0 scale-0 group-hover:scale-100 transition-transform pointer-events-none"
                >
                    <path
                        d="M 3,3 L 9,9 M 9,3 L 3,9"
                        stroke="#730A07"
                        strokeWidth="1.1"
                        fill="none"
                    />
                </svg>
            </button>
            <button
                onClick={handleMinimize}
                className="relative w-3 h-3 rounded-full bg-[#FFBD2E] transition-all group focus:outline-none"
            >
                <div className="absolute inset-0 rounded-full bg-[#9B6A0D] opacity-0 group-hover:opacity-10 transition-opacity pointer-events-none" />
                <svg
                    width="12"
                    height="12"
                    viewBox="0 0 12 12"
                    className="absolute inset-0 scale-0 group-hover:scale-100 transition-transform pointer-events-none"
                >
                    <path
                        d="M 3,6 L 9,6"
                        stroke="#AD7C14"
                        strokeWidth="1.1"
                        fill="none"
                    />
                </svg>
            </button>
            <button
                onClick={handleMaximize}
                className="relative w-3 h-3 rounded-full bg-[#28C940] transition-all group focus:outline-none"
            >
                <div className="absolute inset-0 rounded-full bg-[#0B4F15] opacity-0 group-hover:opacity-10 transition-opacity pointer-events-none" />
                <svg
                    width="12"
                    height="12"
                    viewBox="0 0 12 12"
                    className="absolute inset-0 scale-0 group-hover:scale-100 transition-transform pointer-events-none"
                >
                    <path
                        d="M 3.5,3.5 L 8.5,3.5 L 8.5,8.5 L 3.5,8.5 Z"
                        stroke="#0F6A1D"
                        strokeWidth="1.1"
                        fill="none"
                    />
                </svg>
            </button>
        </div>
    );
};
