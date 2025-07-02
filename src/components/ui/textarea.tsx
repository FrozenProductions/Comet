import React from "react";
import { mergeClasses } from "../../utils/clsx";

export interface TextareaProps
	extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
	({ className, ...props }, ref) => {
		return (
			<textarea
				className={mergeClasses(
					"flex min-h-[80px] w-full rounded-lg border border-white/5 bg-transparent px-3 py-2 text-sm placeholder:text-white/30 focus:border-accent focus:outline-none focus:ring-0",
					className,
				)}
				ref={ref}
				{...props}
			/>
		);
	},
);

Textarea.displayName = "Textarea";

export { Textarea };
