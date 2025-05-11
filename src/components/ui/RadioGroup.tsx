import { motion } from "framer-motion";

interface Option<T extends string> {
    value: T;
    label: string;
}

interface RadioGroupProps<T extends string> {
    value: T;
    options: Option<T>[];
    onChange: (value: T) => void;
    label?: string;
    description?: string;
}

export const RadioGroup = <T extends string>({
    value,
    options,
    onChange,
    label,
    description,
}: RadioGroupProps<T>) => {
    return (
        <div className="space-y-2">
            {label && <div className="text-sm text-ctp-text">{label}</div>}
            {description && (
                <div className="text-xs text-ctp-subtext0 mb-3">
                    {description}
                </div>
            )}
            <div className="flex gap-3">
                {options.map((option) => (
                    <motion.button
                        key={option.value}
                        onClick={() => onChange(option.value)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={`
              flex-1 px-4 py-3 rounded-xl border transition-all duration-200
              ${
                  value === option.value
                      ? "bg-accent-gradient text-ctp-base border-transparent shadow-lg shadow-white/5"
                      : "border-white/5 hover:bg-white/5"
              }
            `}
                    >
                        <div className="flex items-center gap-2">
                            <div
                                className={`
                w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors duration-200
                ${
                    value === option.value
                        ? "border-ctp-base"
                        : "border-accent-light"
                }
              `}
                            >
                                {value === option.value && (
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        className="w-2 h-2 rounded-full bg-ctp-base"
                                    />
                                )}
                            </div>
                            <div className="text-sm font-medium">
                                {option.label}
                            </div>
                        </div>
                    </motion.button>
                ))}
            </div>
        </div>
    );
};
