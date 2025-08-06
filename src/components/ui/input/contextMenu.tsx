import { ChevronRight } from "lucide-react";
import { motion } from "motion/react";
import { type FC, useEffect, useRef, useState } from "react";
import type { ContextMenuItem, ContextMenuProps } from "../../../types/ui/ui";

export const ContextMenu: FC<ContextMenuProps> = ({
    items,
    position,
    onClose,
}) => {
    const menuRef = useRef<HTMLDivElement>(null);
    const [activeSubmenu, setActiveSubmenu] = useState<number | null>(null);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (
                menuRef.current &&
                !menuRef.current.contains(e.target as Node)
            ) {
                onClose();
            }
        };

        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                onClose();
            }
        };

        if (position) {
            document.addEventListener("mousedown", handleClickOutside);
            document.addEventListener("keydown", handleEscape);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            document.removeEventListener("keydown", handleEscape);
        };
    }, [onClose, position]);

    if (!position) return null;

    const renderSubmenu = (submenuItems: ContextMenuItem[], index: number) => {
        if (activeSubmenu !== index) return null;

        return (
            <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.15 }}
                className="absolute left-full top-0 ml-0.5"
            >
                <div className="w-48 overflow-hidden rounded-lg border border-ctp-surface2 bg-ctp-surface0 shadow-lg">
                    {submenuItems.map((item, idx) => {
                        const itemKey =
                            item.type === "separator"
                                ? `submenu-separator-${idx}`
                                : `submenu-item-${item.label}-${idx}`;

                        if (item.type === "separator") {
                            return (
                                <div
                                    key={itemKey}
                                    className="my-1 h-px bg-ctp-surface2"
                                />
                            );
                        }

                        return (
                            <button
                                type="button"
                                key={itemKey}
                                onClick={() => {
                                    item.onClick?.();
                                    onClose();
                                }}
                                disabled={item.disabled}
                                className={`flex w-full items-center gap-2 px-3 py-1.5 text-left text-xs transition-colors ${
                                    item.disabled
                                        ? "cursor-not-allowed opacity-50"
                                        : item.danger
                                          ? "text-ctp-red hover:bg-red-500/10"
                                          : "text-ctp-text hover:bg-ctp-surface1"
                                }`}
                            >
                                {item.icon && (
                                    <span className="h-4 w-4 text-accent">
                                        {item.icon}
                                    </span>
                                )}
                                <span className="flex-1">{item.label}</span>
                            </button>
                        );
                    })}
                </div>
            </motion.div>
        );
    };

    return (
        <div
            ref={menuRef}
            style={{
                position: "fixed",
                left: position.x,
                top: position.y,
                zIndex: 100,
            }}
        >
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.15 }}
                className="w-32 overflow-hidden rounded-lg border border-ctp-surface2 bg-ctp-surface0 shadow-lg"
            >
                {items.map((item, index) => {
                    const itemKey =
                        item.type === "separator"
                            ? `menu-separator-${index}`
                            : `menu-item-${item.label}-${index}`;

                    if (item.type === "separator") {
                        return (
                            <div
                                key={itemKey}
                                className="my-1 h-px bg-ctp-surface2"
                            />
                        );
                    }

                    return (
                        <button
                            type="button"
                            key={itemKey}
                            onClick={() => {
                                if (!item.submenu && item.onClick) {
                                    item.onClick();
                                    onClose();
                                }
                            }}
                            onMouseEnter={() =>
                                setActiveSubmenu(item.submenu ? index : null)
                            }
                            disabled={item.disabled}
                            className={`flex w-full items-center gap-2 px-3 py-1.5 text-left text-xs transition-colors ${
                                item.disabled
                                    ? "cursor-not-allowed opacity-50"
                                    : item.danger
                                      ? "text-ctp-red hover:bg-red-500/10"
                                      : "text-ctp-text hover:bg-ctp-surface1"
                            }`}
                        >
                            {item.icon && (
                                <span className="h-4 w-4 text-accent">
                                    {item.icon}
                                </span>
                            )}
                            <span className="flex-1">{item.label}</span>
                            {item.submenu && (
                                <ChevronRight
                                    size={12}
                                    className="stroke-[2.5] text-accent opacity-75"
                                />
                            )}
                            {item.submenu && renderSubmenu(item.submenu, index)}
                        </button>
                    );
                })}
            </motion.div>
        </div>
    );
};
