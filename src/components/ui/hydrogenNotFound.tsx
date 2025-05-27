import { FC, useState, useEffect } from "react";
import {
    AlertTriangle,
    Copy,
    CheckCircle2,
    Download,
    Loader2,
} from "lucide-react";
import { motion } from "framer-motion";
import { invoke } from "@tauri-apps/api/tauri";
import { listen } from "@tauri-apps/api/event";
import toast from "react-hot-toast";
import { InstallProgress } from "../../types/ui";

const LoadingDots = () => {
    return (
        <motion.div className="inline-flex items-center gap-0.5">
            {[0, 1, 2].map((i) => (
                <motion.span
                    key={i}
                    className="h-1 w-1 rounded-full bg-current"
                    initial={{ opacity: 0.4, scale: 0.7 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{
                        duration: 0.5,
                        repeat: Infinity,
                        repeatType: "reverse",
                        delay: i * 0.2,
                    }}
                />
            ))}
        </motion.div>
    );
};

export const HydrogenNotFound: FC = () => {
    const [copied, setCopied] = useState(false);
    const [isInstalling, setIsInstalling] = useState(false);
    const [installState, setInstallState] = useState<string>("");
    const installCommand =
        'bash -c "$(curl -fsSL https://www.hydrogen.lat/install)"';

    useEffect(() => {
        const unlisten = listen<InstallProgress>(
            "hydrogen-progress",
            (event) => {
                const { state } = event.payload;
                setInstallState(state);

                const getStatusMessage = () => {
                    switch (state) {
                        case "installing":
                            return "Installing Hydrogen...";
                        case "error":
                            return "Installation failed!";
                        case "completed":
                            return "Installation complete!";
                        default:
                            return "Preparing installation...";
                    }
                };

                if (state === "error") {
                    toast.error(getStatusMessage(), {
                        id: "hydrogen-progress",
                    });
                    setIsInstalling(false);
                } else if (state === "completed") {
                    toast.success(getStatusMessage(), {
                        id: "hydrogen-progress",
                        duration: 3000,
                    });
                    setIsInstalling(false);
                } else {
                    toast.loading(getStatusMessage(), {
                        id: "hydrogen-progress",
                    });
                }
            },
        );

        return () => {
            unlisten.then((fn) => fn());
        };
    }, []);

    const handleCopy = async () => {
        await navigator.clipboard.writeText(installCommand);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleInstall = async () => {
        if (isInstalling) return;
        setIsInstalling(true);

        try {
            await invoke("install_hydrogen");
        } catch (error) {
            console.error("Failed to install Hydrogen:", error);
            toast.error("Failed to install Hydrogen");
            setIsInstalling(false);
        }
    };

    return (
        <div className="flex h-screen w-screen items-center justify-center bg-ctp-base">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-2xl space-y-8 px-6 py-8"
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="flex flex-col items-center gap-4"
                >
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-ctp-mantle">
                        <AlertTriangle
                            size={32}
                            className="stroke-[2] text-ctp-red"
                        />
                    </div>
                    <div className="space-y-2 text-center">
                        <h1 className="text-2xl font-medium text-ctp-text">
                            Hydrogen Not Found
                        </h1>
                        <p className="text-sm text-ctp-subtext0">
                            Hydrogen installation was not detected. Click the
                            button below to install Hydrogen automatically:
                        </p>
                    </div>
                </motion.div>

                <div className="flex flex-col items-center gap-6">
                    <div className="flex flex-col items-center gap-2">
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={handleInstall}
                            disabled={isInstalling}
                            className={`flex items-center gap-2 rounded-lg px-6 py-2.5 text-sm font-medium transition-colors ${
                                isInstalling
                                    ? "cursor-not-allowed bg-ctp-surface1"
                                    : "cursor-pointer bg-white/10 hover:bg-white/20"
                            } `}
                        >
                            {isInstalling ? (
                                <Loader2 size={16} className="animate-spin" />
                            ) : (
                                <Download size={16} className="stroke-[2.5]" />
                            )}
                            <span className="flex items-center gap-1.5">
                                {isInstalling ? (
                                    <>
                                        Installing
                                        <LoadingDots />
                                    </>
                                ) : (
                                    "Install Hydrogen"
                                )}
                            </span>
                        </motion.button>
                        {isInstalling && (
                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-xs text-ctp-subtext0"
                            >
                                This might take a while, please be patient
                            </motion.p>
                        )}
                    </div>

                    {isInstalling && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex flex-col items-center gap-3"
                        >
                            <div className="relative h-20 w-20">
                                <motion.div
                                    className="absolute inset-0 rounded-lg bg-white/5"
                                    animate={{
                                        opacity: [0.05, 0.1, 0.05],
                                    }}
                                    transition={{
                                        duration: 1.5,
                                        repeat: Infinity,
                                        ease: "easeInOut",
                                    }}
                                />
                                <motion.div
                                    className="absolute inset-0 flex items-center justify-center"
                                    animate={{
                                        rotate: 360,
                                    }}
                                    transition={{
                                        duration: 2,
                                        repeat: Infinity,
                                        ease: "linear",
                                    }}
                                >
                                    <div className="absolute top-1 h-1.5 w-1.5 rounded-full bg-white/20" />
                                </motion.div>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <motion.div
                                        animate={{
                                            scale: [0.95, 1.05, 0.95],
                                        }}
                                        transition={{
                                            duration: 2,
                                            repeat: Infinity,
                                            ease: "easeInOut",
                                        }}
                                    >
                                        <Download
                                            size={24}
                                            className="stroke-[1.5] text-white/60"
                                        />
                                    </motion.div>
                                </div>
                            </div>
                            <motion.div
                                className="text-sm text-ctp-subtext0"
                                animate={{
                                    opacity: [0.5, 1, 0.5],
                                }}
                                transition={{
                                    duration: 2,
                                    repeat: Infinity,
                                    ease: "easeInOut",
                                }}
                            >
                                {installState === "preparing"
                                    ? "Preparing installation..."
                                    : "Installing Hydrogen..."}
                            </motion.div>
                        </motion.div>
                    )}

                    <div className="flex flex-col items-center gap-2">
                        <div className="text-xs text-ctp-subtext0">
                            Or copy the command to install manually:
                        </div>
                        <motion.div
                            whileHover={{ scale: 1.01 }}
                            onClick={handleCopy}
                            className="group flex cursor-pointer items-center gap-3 rounded-lg bg-ctp-mantle p-3 transition-colors hover:bg-ctp-surface0"
                        >
                            <code className="font-mono text-sm">
                                <span className="text-ctp-mauve">bash</span>
                                <span className="text-ctp-text"> -c </span>
                                <span className="text-ctp-green">"$(</span>
                                <span className="text-ctp-blue">curl</span>
                                <span className="text-ctp-text"> -fsSL </span>
                                <span className="text-ctp-yellow">
                                    https://www.hydrogen.lat/install
                                </span>
                                <span className="text-ctp-green">)"</span>
                            </code>
                            <motion.div
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                className="rounded-md bg-ctp-surface0 p-1.5 transition-colors group-hover:bg-ctp-surface1"
                            >
                                {copied ? (
                                    <CheckCircle2
                                        size={16}
                                        className="stroke-[2.5] text-ctp-green"
                                    />
                                ) : (
                                    <Copy
                                        size={16}
                                        className="stroke-[2.5] text-ctp-subtext0"
                                    />
                                )}
                            </motion.div>
                        </motion.div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};
