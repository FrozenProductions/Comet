import type { ReactNode } from "react";

export type CommandItem = {
	id: string;
	title: string;
	description: string;
	icon: ReactNode;
	action: () => void;
};

export type CommandPaletteProps = {
	isOpen: boolean;
	onClose: () => void;
	onFloatToggle: () => void;
};
