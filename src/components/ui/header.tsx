import { FC } from "react";
import { HeaderProps } from "../../types/ui";

export const Header: FC<HeaderProps> = ({
    title,
    description,
    icon,
    actions,
}) => {
    return (
        <div className="flex h-14 items-center justify-between border-b border-white/5 bg-ctp-mantle px-4">
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                    {icon}
                    <h1 className="text-sm font-medium">{title}</h1>
                </div>
                {description && (
                    <div className="rounded-md border border-white/5 bg-white/5 px-2 py-1 text-xs text-ctp-subtext0">
                        {description}
                    </div>
                )}
            </div>
            {actions && (
                <div className="flex items-center gap-2">{actions}</div>
            )}
        </div>
    );
};
