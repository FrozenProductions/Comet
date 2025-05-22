import { FC } from "react";
import { TechStackItemProps } from "../../types/settings";

export const TechStackItem: FC<TechStackItemProps> = ({
    name,
    description,
    href,
    icon,
    invertIcon = false,
}) => {
    return (
        <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="group rounded-lg bg-ctp-surface0/50 p-4 transition-colors hover:bg-ctp-surface0/70"
        >
            <div className="mb-2 flex items-center gap-2 text-sm font-medium text-ctp-text">
                <img
                    src={icon}
                    className={`h-5 w-5 transition-transform group-hover:scale-110 ${invertIcon ? "invert" : ""}`}
                    alt={name}
                />
                {name}
            </div>
            <div className="select-none text-xs leading-relaxed text-ctp-subtext0">
                {description}
            </div>
        </a>
    );
};
