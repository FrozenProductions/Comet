import { FC } from "react";
import { Check } from "lucide-react";
import { motion } from "framer-motion";

interface CheckboxProps {
    checked: boolean;
    onChange: () => void;
    label: string;
    description?: string;
}

export const Checkbox: FC<CheckboxProps> = ({
    checked,
    onChange,
    label,
    description,
}) => (
    <motion.div
        className="group flex gap-3 py-2 px-1 -mx-1 rounded-lg hover:bg-white/5 cursor-pointer transition-colors duration-200"
        onClick={onChange}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
    >
        <div className="flex items-center">
            <div
                className={`
          w-5 h-5 rounded-md flex items-center justify-center shrink-0 transition-all duration-200 border
          ${
              checked
                  ? "bg-accent-gradient border-transparent shadow-lg shadow-white/5"
                  : "bg-transparent border-white/5 group-hover:bg-white/5"
          }
        `}
            >
                {checked && (
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                    >
                        <Check size={14} className="text-ctp-base" />
                    </motion.div>
                )}
            </div>
        </div>
        <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-ctp-text truncate">
                {label}
            </div>
            {description && (
                <div className="text-xs text-ctp-subtext0 line-clamp-2 mt-0.5">
                    {description}
                </div>
            )}
        </div>
    </motion.div>
);
