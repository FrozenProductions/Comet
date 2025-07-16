import { listen } from "@tauri-apps/api/event";
import { invoke } from "@tauri-apps/api/tauri";
import { Shield } from "lucide-react";
import { useEffect, useState } from "react";
import type {
	PathPermissionStatus,
	PermissionsCheckResult,
} from "../../types/ui/permissions";
import { BaseMessageModal } from "./messageModal";

export const PermissionsModal = () => {
	const [isVisible, setIsVisible] = useState(false);
	const [paths, setPaths] = useState<PathPermissionStatus[]>([]);

	useEffect(() => {
		const checkPermissions = async () => {
			try {
				const result =
					await invoke<PermissionsCheckResult>("check_permissions");
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

		checkPermissions();

		return () => {
			unlisten.then((unsubscribe) => unsubscribe());
		};
	}, []);

	const handleFixPermissions = async () => {
		for (const path of paths) {
			if (!path.has_permission) {
				await invoke("fix_path_permissions", { path: path.path });
			}
		}

		const result = await invoke<PermissionsCheckResult>("check_permissions");
		if (result.all_permitted) {
			setIsVisible(false);
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
