import type { FC } from "react";
import type { TechStackItemProps } from "../../types/core/settings";

export const TechStackItem: FC<TechStackItemProps> = ({
    name,
    description,
    href,
    icon,
    invertIcon,
}) => (
    <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-4 rounded-lg bg-ctp-surface0/50 p-4 transition-colors hover:bg-ctp-surface0"
    >
        <img
            src={icon}
            alt={name}
            className={`h-8 w-8 ${invertIcon ? "invert" : ""}`}
        />
        <div>
            <div className="text-sm font-medium text-ctp-text">{name}</div>
            <div className="select-none text-xs text-ctp-subtext0">
                {description}
            </div>
        </div>
    </a>
);
