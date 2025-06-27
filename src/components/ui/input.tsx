import React from "react";
import { mergeClasses } from "../../utils/clsx";

export const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = ({
	className,
	...props
}) => {
	return (
		<input
			className={mergeClasses(
				"rounded border border-gray-700 bg-gray-800 px-3 py-2 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500",
				className,
			)}
			{...props}
		/>
	);
};
