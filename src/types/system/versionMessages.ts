export type VersionMessage = {
	message: string;
	nfu: boolean;
	imageUrl?: string;
};

export type VersionMessages = {
	messages: Record<string, VersionMessage>;
};

export type MessageModalProps = {
	currentVersion: string;
};
