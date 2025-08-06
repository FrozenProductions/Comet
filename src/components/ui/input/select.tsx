import { ChevronDown } from "lucide-react";
import { type FC, useEffect, useRef, useState } from "react";
import type { SelectProps } from "../../../types/ui/select";

export const Select: FC<SelectProps> = ({
    value,
    onChange,
    options,
    className = "",
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const selectRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                selectRef.current &&
                !selectRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const selectedOption = options.find((option) => option.value === value);

    return (
        <div className="relative" ref={selectRef}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`flex h-8 items-center justify-between gap-2 rounded-lg border border-white/5 bg-ctp-surface1 px-2 text-sm text-ctp-text transition-colors hover:bg-ctp-surface2 ${className}`}
            >
                <span>{selectedOption?.label}</span>
                <ChevronDown
                    size={14}
                    className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                />
            </button>
            {isOpen && (
                <div className="absolute right-0 top-full z-50 mt-1 min-w-[120px] overflow-hidden rounded-lg border border-ctp-surface2 bg-ctp-mantle shadow-lg">
                    {options.map((option) => (
                        <button
                            key={option.value}
                            type="button"
                            onClick={() => {
                                onChange(option.value);
                                setIsOpen(false);
                            }}
                            className={`w-full px-3 py-2 text-left text-sm transition-colors hover:bg-ctp-surface0 ${
                                option.value === value
                                    ? "bg-ctp-surface0 text-accent"
                                    : "text-ctp-text"
                            }`}
                        >
                            {option.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};
