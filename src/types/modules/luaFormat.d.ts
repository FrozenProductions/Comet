declare module "lua-format" {
	export function Beautify(
		code: string,
		options: {
			SolveMath?: boolean;
			Indentation?: string;
		},
	): string;
}
