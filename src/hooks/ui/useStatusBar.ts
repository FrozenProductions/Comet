import { useCallback, useEffect, useState } from "react";
import { STATUS_BAR_DEFAULT_CONFIG } from "../../constants/ui/statusBar";
import type { StatusBarConfig, StatusBarItem } from "../../types/ui/statusBar";

/**
 * Hook for managing status bar configuration and item ordering
 * Handles persistence of status bar item positions in localStorage
 */
export const useStatusBar = () => {
    const [config, setConfig] = useState<StatusBarConfig>(
        STATUS_BAR_DEFAULT_CONFIG,
    );

    useEffect(() => {
        const savedConfig = localStorage.getItem("status-bar-config");
        if (savedConfig) {
            try {
                setConfig(JSON.parse(savedConfig));
            } catch {
                setConfig(STATUS_BAR_DEFAULT_CONFIG);
            }
        }
    }, []);

    /**
     * Updates the order of status bar items and persists to localStorage
     * @param newOrder New order of status bar items
     */
    const updateOrder = useCallback(
        (newOrder: StatusBarItem[]) => {
            const newConfig = { ...config, order: newOrder };
            setConfig(newConfig);
            localStorage.setItem(
                "status-bar-config",
                JSON.stringify(newConfig),
            );
        },
        [config],
    );

    /**
     * Gets all status bar items for a specific group (left or right)
     * @param group Group to filter items by
     * @returns Array of status bar items in the specified group
     */
    const getItemsForGroup = useCallback(
        (group: "left" | "right") => {
            return config.order.filter((item) => item.group === group);
        },
        [config.order],
    );

    /**
     * Moves a status bar item from one position to another
     * @param fromIndex Original position of the item
     * @param toIndex New position for the item
     */
    const moveItem = useCallback(
        (fromIndex: number, toIndex: number) => {
            const newOrder = [...config.order];
            const [movedItem] = newOrder.splice(fromIndex, 1);
            newOrder.splice(toIndex, 0, movedItem);
            updateOrder(newOrder);
        },
        [config.order, updateOrder],
    );

    return {
        config,
        getItemsForGroup,
        moveItem,
    };
};
