import { FC, ReactNode, useState, useEffect } from "react";
import { SidebarContext } from "./sidebarContextType";
import { SIDEBAR_STORAGE_KEY } from "../../constants/sidebar";

export const SidebarProvider: FC<{ children: ReactNode }> = ({ children }) => {
	const [isVisible, setIsVisible] = useState(() => {
		const stored = localStorage.getItem(SIDEBAR_STORAGE_KEY);
		return stored ? JSON.parse(stored) : true;
	});

	const toggleSidebar = () => setIsVisible((prev: boolean) => !prev);

	useEffect(() => {
		localStorage.setItem(SIDEBAR_STORAGE_KEY, JSON.stringify(isVisible));
	}, [isVisible]);

	const value = {
		isVisible,
		toggleSidebar,
	};

	return (
		<SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>
	);
};
