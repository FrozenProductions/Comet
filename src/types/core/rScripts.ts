export interface RScriptSearchParams {
	page?: number;
	orderBy?: "date" | "views" | "likes" | "dislikes";
	sort?: "asc" | "desc";
	q?: string;
	noKeySystem?: boolean;
	mobileOnly?: boolean;
	notPaid?: boolean;
	unpatched?: boolean;
	verifiedOnly?: boolean;
	username?: string;
}

export interface RScriptExecutor {
	_id: string;
	title: string;
	image: string;
	creator: string;
	discord_url: string;
	downloads: number;
	platforms: string[];
	download_url: string;
}

export interface RScriptDetail {
	_id: string;
	title: string;
	views: number;
	private: boolean;
	likes: number;
	dislikes: number;
	keySystem: boolean;
	mobileReady: boolean;
	lastUpdated: string;
	createdAt: string;
	paid: boolean;
	description: string | null;
	image: string;
	rawScript: string;
	testedExecutors: RScriptExecutor[];
}

export interface RScriptUser {
	_id: string;
	username: string;
	image: string | null;
	discord?: {
		id: string;
		username: string;
	};
	verified?: boolean;
	bio?: string;
	lastActive: string;
}

export interface RScriptGame {
	_id?: string;
	title?: string;
	placeId?: string;
	imgurl?: string;
	last_updated?: string;
	gameLink?: string;
}

export interface RScript extends RScriptDetail {
	user: RScriptUser;
	game: RScriptGame;
}

export interface RScriptSearchResponse {
	info: {
		currentPage: number;
		maxPages: number;
	};
	scripts: RScript[];
}

export interface RScriptDetailResponse {
	script: RScript[];
}

export interface ScriptCardProps {
	script: RScript;
	onSelect: (script: RScript) => void;
}

export type FilterOption = {
	label: string;
	value: string;
	icon: React.ReactNode;
};
