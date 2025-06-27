import React from "react";
import { mergeClasses } from "../../utils/clsx";
import { ButtonProps } from "../../types/ui";

export const Button: React.FC<ButtonProps> = ({
	children,
	className,
	variant = "primary",
	size = "md",
	...props
}) => {
	const baseStyles =
		"rounded font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2";

	const variantStyles = {
		primary: "bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500",
		secondary: "bg-gray-600 hover:bg-gray-700 text-white focus:ring-gray-500",
		destructive: "bg-red-600 hover:bg-red-700 text-white focus:ring-red-500",
	};

	const sizeStyles = {
		sm: "px-2 py-1 text-sm",
		md: "px-4 py-2",
		lg: "px-6 py-3 text-lg",
	};

	return (
		<button
			className={mergeClasses(
				baseStyles,
				variantStyles[variant],
				sizeStyles[size],
				className,
			)}
			{...props}
		>
			{children}
		</button>
	);
};
