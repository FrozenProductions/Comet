import { FC, useState } from "react";
import { motion } from "framer-motion";

interface SliderProps {
    value: number;
    onChange: (value: number) => void;
    min: number;
    max: number;
    step?: number;
    label: string;
    description?: string;
    unit?: string;
}

export const Slider: FC<SliderProps> = ({
    value,
    onChange,
    min,
    max,
    step = 1,
    label,
    description,
    unit,
}) => {
    const [localValue, setLocalValue] = useState(value);
    const [isDragging, setIsDragging] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = Number(e.target.value);
        setLocalValue(newValue);
    };

    const handleChangeEnd = () => {
        onChange(localValue);
        setIsDragging(false);
    };

    const percentage = ((localValue - min) / (max - min)) * 100;

    return (
        <div className="space-y-2 py-2">
            <div className="flex items-baseline justify-between">
                <div>
                    <div className="text-sm font-medium text-ctp-text">
                        {label}
                    </div>
                    {description && (
                        <div className="text-xs text-ctp-subtext0">
                            {description}
                        </div>
                    )}
                </div>
                <motion.div
                    className="text-sm tabular-nums font-medium"
                    animate={
                        isDragging
                            ? {
                                  scale: 1.1,
                                  background: "var(--tw-gradient-accent)",
                                  backgroundClip: "text",
                                  WebkitBackgroundClip: "text",
                                  WebkitTextFillColor: "transparent",
                              }
                            : {
                                  scale: 1,
                                  color: "#cdd6f4",
                              }
                    }
                    style={
                        {
                            "--tw-gradient-accent":
                                "linear-gradient(to bottom right, #c1c7e6, #a5aed4)",
                        } as any
                    }
                >
                    {localValue}
                    {unit}
                </motion.div>
            </div>
            <div className="relative h-6 flex items-center">
                <div className="absolute inset-x-0 h-1 bg-white/5 rounded-full" />
                <motion.div
                    className="absolute left-0 h-1 bg-accent-gradient-r rounded-full"
                    style={{ width: `${percentage}%` }}
                    animate={isDragging ? { height: "6px" } : { height: "4px" }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
                <input
                    type="range"
                    min={min}
                    max={max}
                    step={step}
                    value={localValue}
                    onChange={handleChange}
                    onMouseDown={() => setIsDragging(true)}
                    onTouchStart={() => setIsDragging(true)}
                    onMouseUp={handleChangeEnd}
                    onTouchEnd={handleChangeEnd}
                    className="absolute inset-0 w-full appearance-none cursor-pointer bg-transparent 
            [&::-webkit-slider-thumb]:appearance-none 
            [&::-webkit-slider-thumb]:w-4 
            [&::-webkit-slider-thumb]:h-4 
            [&::-webkit-slider-thumb]:rounded-full 
            [&::-webkit-slider-thumb]:bg-accent-gradient
            [&::-webkit-slider-thumb]:shadow-lg 
            [&::-webkit-slider-thumb]:shadow-white/10 
            [&::-webkit-slider-thumb]:transition-transform 
            [&::-webkit-slider-thumb]:hover:scale-110
            [&::-webkit-slider-thumb]:active:scale-95"
                />
            </div>
        </div>
    );
};
