import { motion } from "framer-motion";
import type { RadioGroupProps } from "../../types/ui/ui";

export const RadioGroup = <T extends string>({
	value,
	options,
	onChange,
	label,
	description,
}: RadioGroupProps<T>) => {
	return (
		<div className="space-y-2">
			{label && <div className="text-sm text-ctp-text">{label}</div>}
			{description && (
				<div className="mb-3 text-xs text-ctp-subtext0">{description}</div>
			)}
			<div className="flex gap-3">
				{options.map((option) => (
					<motion.button
						key={option.value}
						onClick={() => onChange(option.value)}
						whileHover={{ scale: 1.02 }}
						whileTap={{ scale: 0.98 }}
						className={`flex-1 rounded-xl border px-4 py-3 transition-all duration-200 ${
							value === option.value
								? "border-transparent bg-accent-gradient text-ctp-base shadow-lg shadow-white/5"
								: "border-white/5 hover:bg-white/5"
						} `}
					>
						<div className="flex items-center gap-2">
							<div
								className={`flex h-4 w-4 items-center justify-center rounded-full border-2 transition-colors duration-200 ${
									value === option.value
										? "border-ctp-base"
										: "border-accent-light"
								} `}
							>
								{value === option.value && (
									<motion.div
										initial={{ scale: 0 }}
										animate={{ scale: 1 }}
										className="h-2 w-2 rounded-full bg-ctp-base"
									/>
								)}
							</div>
							<div className="text-sm font-medium">{option.label}</div>
						</div>
					</motion.button>
				))}
			</div>
		</div>
	);
};
