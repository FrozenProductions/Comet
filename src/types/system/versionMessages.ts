export type VersionMessage = {
    message: string;
    nfu: boolean;
    image_url?: string;
};

export type VersionMessages = {
    messages: Record<string, VersionMessage>;
};

export type MessageModalProps = {
    currentVersion: string;
};
