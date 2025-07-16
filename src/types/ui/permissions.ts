export type PathPermissionStatus = {
	path: string;
	has_permission: boolean;
};

export type PermissionsCheckResult = {
	paths: PathPermissionStatus[];
	all_permitted: boolean;
};
