import { motion } from "motion/react";
import type { FC } from "react";
import type { ActionButtonProps } from "../../types/landing";

const ActionButton: FC<ActionButtonProps> = ({
    label,
    icon,
    onClick,
    variant = "primary",
    className = "",
}) => {
    const baseStyles =
        "inline-flex items-center gap-2.5 px-5 py-2.5 rounded-lg text-sm font-medium tracking-wide transition-all duration-200";
    const variantStyles = {
        primary:
            "bg-theme-accent text-theme-base hover:opacity-90 hover:shadow-button-glow",
        secondary:
            "bg-theme-surface/50 text-theme-text hover:bg-theme-surface/80 hover:shadow-inner-border",
    } as const;

    return (
        <motion.button
            onClick={onClick}
            className={`${baseStyles} ${variantStyles[variant]} ${className}`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
        >
            <span className="relative z-10 text-[15px]">{label}</span>
            <span className="relative z-10 opacity-80">{icon}</span>
        </motion.button>
    );
};

export default ActionButton;
