import { FC } from "react";
import { SettingGroupProps } from "../../types/settings";

export const SettingGroup: FC<SettingGroupProps> = ({
	title,
	description,
	icon,
	children,
}) => (
	<div className="space-y-4 rounded-xl bg-ctp-mantle p-4">
		<div className="flex items-start justify-between border-b border-ctp-surface0 pb-2">
			<div className="min-w-0 flex-1">
				<div className="flex items-center gap-2">
					{icon && (
						<div className="flex h-6 w-6 items-center justify-center rounded bg-accent/10">
							{icon}
						</div>
					)}
					<div className="text-sm font-medium text-ctp-text">{title}</div>
				</div>
				{description && (
					<div className="mt-1.5 select-none text-xs text-ctp-subtext0">
						{description}
					</div>
				)}
			</div>
		</div>
		<div className="space-y-3">{children}</div>
	</div>
);
