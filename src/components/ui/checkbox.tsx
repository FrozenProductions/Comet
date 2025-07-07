import { Check } from "lucide-react";
import { motion } from "motion/react";
import type { FC } from "react";
import type { CheckboxProps } from "../../types/ui/ui";

export const Checkbox: FC<CheckboxProps> = ({
	checked,
	onChange,
	label,
	description,
}) => (
	<motion.div
		className="group -mx-1 flex cursor-pointer gap-3 rounded-lg px-1 py-2 transition-colors duration-200 hover:bg-white/5"
		onClick={onChange}
		initial={false}
		whileHover={{ scale: 1.01 }}
		whileTap={{ scale: 0.99 }}
	>
		<div className="flex items-center">
			<div
				className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-all duration-200 ${
					checked
						? "border-transparent bg-accent-gradient shadow-lg shadow-white/5"
						: "border-white/5 bg-transparent group-hover:bg-white/5"
				} `}
			>
				{checked && (
					<motion.div
						initial={{ scale: 0 }}
						animate={{ scale: 1 }}
						transition={{ type: "spring", stiffness: 400, damping: 25 }}
					>
						<Check size={14} className="text-ctp-base" />
					</motion.div>
				)}
			</div>
		</div>
		<div className="min-w-0 flex-1">
			<div className="truncate text-sm font-medium text-ctp-text">{label}</div>
			{description && (
				<div className="mt-0.5 line-clamp-2 text-xs text-ctp-subtext0">
					{description}
				</div>
			)}
		</div>
	</motion.div>
);
