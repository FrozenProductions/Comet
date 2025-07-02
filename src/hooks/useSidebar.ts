import { useContext } from "react";
import { SidebarContext } from "../contexts/sidebar/sidebarContextType";

export const useSidebar = () => {
	const context = useContext(SidebarContext);
	if (!context)
		throw new Error("useSidebar must be used within SidebarProvider");
	return context;
};
