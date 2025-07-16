import { listen } from "@tauri-apps/api/event";
import { Shield } from "lucide-react";
import { useEffect, useState } from "react";
import {
	checkPermissions,
	fixAllPermissions,
} from "../../services/system/permissionsService";
import type { PathPermissionStatus } from "../../types/ui/permissions";
import { BaseMessageModal } from "./messageModal";

export const PermissionsModal = () => {
	const [isVisible, setIsVisible] = useState(false);
	const [paths, setPaths] = useState<PathPermissionStatus[]>([]);

	useEffect(() => {
		const checkAppPermissions = async () => {
			try {
				const result = await checkPermissions();
				if (!result.all_permitted) {
					setPaths(result.paths);
					setIsVisible(true);
				}
			} catch (error) {
				console.error("Failed to check permissions:", error);
			}
		};

		const unlisten = listen<PathPermissionStatus[]>(
			"show-permissions-modal",
			(event) => {
				setPaths(event.payload);
				setIsVisible(true);
			},
		);

		checkAppPermissions();

		return () => {
			unlisten.then((unsubscribe) => unsubscribe());
		};
	}, []);

	const handleFixPermissions = async () => {
		try {
			await fixAllPermissions(paths);
			const result = await checkPermissions();
			if (result.all_permitted) {
				setIsVisible(false);
			} else {
				setPaths(result.paths);
			}
		} catch (error) {
			console.error("Failed to fix permissions:", error);
		}
	};

	return (
		<BaseMessageModal
			isOpen={isVisible}
			onClose={() => setIsVisible(false)}
			title="Permissions Required"
			message="Comet needs permissions to access the following directories:"
			icon={<Shield size={14} className="text-yellow-500" />}
			variant="warning"
			primaryAction={{
				label: "Grant Permissions",
				onClick: handleFixPermissions,
			}}
		>
			<div className="mt-4 space-y-2">
				{paths.map((path) => (
					<div
						key={path.path}
						className={`rounded-lg border ${
							path.has_permission
								? "border-green-500/30 bg-green-500/10"
								: "border-yellow-500/30 bg-yellow-500/10"
						} p-2 text-xs`}
					>
						<p
							className={
								path.has_permission ? "text-green-500" : "text-yellow-500"
							}
						>
							{path.path}
						</p>
					</div>
				))}
			</div>
		</BaseMessageModal>
	);
};
