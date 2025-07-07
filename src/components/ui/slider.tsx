import { motion } from "motion/react";
import { type FC, useState } from "react";
import type { SliderProps } from "../../types/ui/ui";

export const Slider: FC<SliderProps> = ({
	value,
	onChange,
	min,
	max,
	step = 1,
	label,
	description,
	unit,
}) => {
	const [localValue, setLocalValue] = useState(value);
	const [isDragging, setIsDragging] = useState(false);

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const newValue = Number(e.target.value);
		setLocalValue(newValue);
	};

	const handleChangeEnd = () => {
		onChange(localValue);
		setIsDragging(false);
	};

	const percentage = ((localValue - min) / (max - min)) * 100;

	return (
		<div className="space-y-2 py-2">
			<div className="flex items-baseline justify-between">
				<div>
					<div className="text-sm font-medium text-ctp-text">{label}</div>
					{description && (
						<div className="text-xs text-ctp-subtext0">{description}</div>
					)}
				</div>
				<motion.div
					className="text-sm font-medium tabular-nums"
					initial={false}
					animate={
						isDragging
							? {
									scale: 1.1,
									background: "var(--tw-gradient-accent)",
									backgroundClip: "text",
								}
							: {
									scale: 1,
									color: "#cdd6f4",
								}
					}
					transition={{ type: "spring", stiffness: 400, damping: 25 }}
					style={
						{
							"--tw-gradient-accent":
								"linear-gradient(to bottom right, #c1c7e6, #a5aed4)",
						} as any
					}
				>
					{localValue}
					{unit}
				</motion.div>
			</div>
			<div className="relative flex h-6 items-center">
				<div className="absolute inset-x-0 h-1 rounded-full bg-white/5" />
				<motion.div
					className="absolute left-0 h-1 rounded-full bg-accent-gradient-r"
					style={{ width: `${percentage}%` }}
					initial={false}
					animate={isDragging ? { height: "6px" } : { height: "4px" }}
					transition={{ type: "spring", stiffness: 300, damping: 30 }}
				/>
				<input
					type="range"
					min={min}
					max={max}
					step={step}
					value={localValue}
					onChange={handleChange}
					onMouseDown={() => setIsDragging(true)}
					onTouchStart={() => setIsDragging(true)}
					onMouseUp={handleChangeEnd}
					onTouchEnd={handleChangeEnd}
					className="absolute inset-0 w-full cursor-pointer appearance-none bg-transparent [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-accent-gradient [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:shadow-white/10 [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:hover:scale-110 [&::-webkit-slider-thumb]:active:scale-95"
				/>
			</div>
		</div>
	);
};
