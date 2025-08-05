import { useContext } from "react";
import { SidebarContext } from "../../contexts/sidebar/sidebarContextType";

/**
 * Hook for accessing sidebar state and functionality
 * Must be used within a SidebarProvider component
 * Returns sidebar context containing state and methods for sidebar manipulation
 */
export const useSidebar = () => {
    const context = useContext(SidebarContext);
    if (!context)
        throw new Error("useSidebar must be used within SidebarProvider");
    return context;
};
