export type VersionMessage = {
	message: string;
	nfu: boolean;
};

export type VersionMessages = {
	messages: Record<string, VersionMessage>;
};

export type MessageModalProps = {
	currentVersion: string;
};
