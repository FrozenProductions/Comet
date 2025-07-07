export interface SearchResult {
	tab_id: string;
	title: string;
	line_number: number;
	line_content: string;
	column_start: number;
	column_end: number;
	context?: {
		before: string[];
		after: string[];
	};
}

export interface WorkspaceSearchProps {
	isOpen: boolean;
	onClose: () => void;
}
