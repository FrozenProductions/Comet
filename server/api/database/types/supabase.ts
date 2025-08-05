import type { FileObject } from "@supabase/storage-js";

export type StorageFile = FileObject;

export type UploadResponse = {
    data: {
        path: string;
    } | null;
    error: Error | null;
};

export type DownloadResponse = {
    data: Blob | null;
    error: Error | null;
};

export type ListResponse = {
    data: StorageFile[] | null;
    error: Error | null;
};

export type DeleteResponse = {
    data: StorageFile | null;
    error: Error | null;
};
