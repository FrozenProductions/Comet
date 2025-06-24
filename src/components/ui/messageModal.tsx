import { useEffect, useState } from "react";
import { X, AlertTriangle } from "lucide-react";
import type {
    MessageModalProps,
    VersionMessage,
} from "../../types/versionMessages";
import { fetchVersionMessage } from "../../services/versionMessagesService";

export const MessageModal = ({ currentVersion }: MessageModalProps) => {
    const [isVisible, setIsVisible] = useState(false);
    const [versionData, setVersionData] = useState<VersionMessage | null>(null);

    useEffect(() => {
        const fetchMessage = async () => {
            const versionMessage = await fetchVersionMessage(currentVersion);
            if (versionMessage) {
                setVersionData(versionMessage);
                setIsVisible(true);
            }
        };

        fetchMessage();
    }, [currentVersion]);

    if (!isVisible || !versionData) {
        return null;
    }

    const handleClose = () => {
        if (!versionData.nfu) {
            setIsVisible(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="w-full max-w-md rounded-xl border border-white/5 bg-ctp-mantle p-6">
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <div className="flex items-center gap-2">
                            <h2 className="text-lg font-medium text-ctp-text">
                                Version {currentVersion}
                            </h2>
                            {versionData.nfu && (
                                <div className="flex items-center gap-1.5 rounded-lg bg-ctp-red/10 px-2 py-1">
                                    <AlertTriangle
                                        size={14}
                                        className="text-ctp-red"
                                    />
                                    <span className="text-xs font-medium text-ctp-red">
                                        Update Required
                                    </span>
                                </div>
                            )}
                        </div>
                        <p className="mt-1 text-sm text-ctp-subtext0">
                            {versionData.message}
                        </p>
                    </div>
                    {!versionData.nfu && (
                        <button
                            onClick={handleClose}
                            className="rounded-lg p-1 text-ctp-subtext0 hover:bg-white/5 hover:text-ctp-text"
                        >
                            <X size={18} className="stroke-[2.5]" />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};
