import { FC, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { ContextMenuItem, ContextMenuProps } from "../../types/ui";

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
                exit={{ opacity: 0, x: -10 }}
                className="absolute left-full top-0 ml-0.5"
            >
                <div className="w-48 overflow-hidden rounded-lg border border-white/5 bg-ctp-mantle py-1.5 shadow-xl">
                    {submenuItems.map((item, idx) => {
                        if (item.type === "separator") {
                            return (
                                <div
                                    key={idx}
                                    className="my-1.5 h-px bg-white/5"
                                />
                            );
                        }

                        const isFirstItem = idx === 0;
                        const nonSeparatorItems = submenuItems.filter(
                            (i) => i.type !== "separator",
                        );
                        const isLastNonSeparator =
                            idx === nonSeparatorItems.length - 1;

                        return (
                            <button
                                key={idx}
                                onClick={() => {
                                    item.onClick?.();
                                    onClose();
                                }}
                                disabled={item.disabled}
                                className={`flex w-full items-center gap-2 px-3 py-1.5 text-left text-xs transition-colors ${isFirstItem ? "-mt-1.5" : ""} ${isLastNonSeparator ? "-mb-1.5" : ""} ${
                                    item.disabled
                                        ? "cursor-not-allowed opacity-50"
                                        : item.danger
                                          ? "text-ctp-red hover:bg-ctp-red/10"
                                          : "text-ctp-text hover:bg-ctp-surface0"
                                } `}
                            >
                                {item.icon && (
                                    <span className="h-4 w-4">{item.icon}</span>
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
        <AnimatePresence>
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
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    className="w-48 overflow-hidden rounded-lg border border-white/5 bg-ctp-mantle py-1.5 shadow-xl"
                >
                    {items.map((item, index) => {
                        if (item.type === "separator") {
                            return (
                                <div
                                    key={index}
                                    className="my-1.5 h-px bg-white/5"
                                />
                            );
                        }

                        const isFirstItem = index === 0;
                        const nonSeparatorItems = items.filter(
                            (i) => i.type !== "separator",
                        );
                        const isLastNonSeparator =
                            nonSeparatorItems.indexOf(item) ===
                            nonSeparatorItems.length - 1;

                        return (
                            <button
                                key={index}
                                onClick={() => {
                                    if (!item.submenu && item.onClick) {
                                        item.onClick();
                                        onClose();
                                    }
                                }}
                                onMouseEnter={() =>
                                    setActiveSubmenu(
                                        item.submenu ? index : null,
                                    )
                                }
                                disabled={item.disabled}
                                className={`relative flex w-full items-center gap-2 px-3 py-1.5 text-left text-xs transition-colors ${isFirstItem ? "-mt-1.5" : ""} ${isLastNonSeparator ? "-mb-1.5" : ""} ${
                                    item.disabled
                                        ? "cursor-not-allowed opacity-50"
                                        : item.danger
                                          ? "text-ctp-red hover:bg-ctp-red/10"
                                          : "text-ctp-text hover:bg-ctp-surface0"
                                } `}
                            >
                                {item.icon && (
                                    <span className="h-4 w-4">{item.icon}</span>
                                )}
                                <span className="flex-1">{item.label}</span>
                                {item.submenu && (
                                    <ChevronRight
                                        size={12}
                                        className="stroke-[2.5] opacity-75"
                                    />
                                )}
                                {item.submenu &&
                                    renderSubmenu(item.submenu, index)}
                            </button>
                        );
                    })}
                </motion.div>
            </div>
        </AnimatePresence>
    );
};
