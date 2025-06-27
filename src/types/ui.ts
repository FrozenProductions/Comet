import { ReactNode } from "react";

export interface ButtonProps
	extends React.ButtonHTMLAttributes<HTMLButtonElement> {
	variant?: "primary" | "secondary" | "destructive";
	size?: "sm" | "md" | "lg";
}

export interface CheckboxProps {
	checked: boolean;
	onChange: () => void;
	label: string;
	description?: string;
}

export type ContextMenuItem = {
	type?: "separator";
	label?: string;
	icon?: ReactNode;
	onClick?: () => void;
	danger?: boolean;
	disabled?: boolean;
	submenu?: ContextMenuItem[];
};

export type Position = {
	x: number;
	y: number;
};

export type ContextMenuProps = {
	items: ContextMenuItem[];
	position: Position | null;
	onClose: () => void;
};

export interface HeaderProps {
	title: string;
	description?: string;
	icon?: ReactNode;
	actions?: ReactNode;
}

export interface InstallProgress {
	state: string;
}

export interface ModalProps {
	isOpen: boolean;
	onClose: () => void;
	title: string;
	description?: string;
	children?: ReactNode;
	footer?: ReactNode;
	onConfirm?: () => void;
	confirmText?: string;
	confirmVariant?: "destructive" | "primary" | "secondary";
}

export interface Option<T extends string> {
	value: T;
	label: string;
}

export interface RadioGroupProps<T extends string> {
	value: T;
	options: Option<T>[];
	onChange: (value: T) => void;
	label?: string;
	description?: string;
}

export interface RecentSearchesDropdownProps {
	recentSearches: string[];
	onSelect: (search: string) => void;
	onClear: () => void;
	visible: boolean;
}

export interface SliderProps {
	value: number;
	onChange: (value: number) => void;
	min: number;
	max: number;
	step?: number;
	label: string;
	description?: string;
	unit?: string;
}
