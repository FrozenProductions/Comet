export type VersionMessage = {
    message: string;
    nfu: boolean;
    image_url?: string;
};

export type BranchMessages = {
    messages: Record<string, VersionMessage>;
};

export type VersionMessages = {
    messages: Record<string, VersionMessage>;
};

export type AllVersionMessages = {
    comet: BranchMessages;
    hydrogen: BranchMessages;
    ronix: BranchMessages;
};

export type MessageModalProps = {
    currentVersion: string;
};
