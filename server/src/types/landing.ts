export type ActionButtonProps = {
	label: string;
	icon: React.ReactNode;
	onClick: () => void;
	variant?: "primary" | "secondary";
	className?: string;
};
