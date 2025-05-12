import { FC, ReactNode } from "react";

interface HeaderProps {
    title: string;
    description?: string;
    icon?: ReactNode;
    actions?: ReactNode;
}

export const Header: FC<HeaderProps> = ({
    title,
    description,
    icon,
    actions,
}) => {
    return (
        <div className="h-14 flex items-center justify-between px-4 bg-ctp-mantle border-b border-white/5">
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                    {icon}
                    <h1 className="text-sm font-medium">{title}</h1>
                </div>
                {description && (
                    <div className="px-2 py-1 text-xs text-ctp-subtext0 bg-white/5 rounded-md border border-white/5">
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
