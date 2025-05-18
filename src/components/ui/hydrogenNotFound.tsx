import { FC, useState } from "react";
import { AlertTriangle, Copy, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

export const HydrogenNotFound: FC = () => {
    const [copied, setCopied] = useState(false);
    const installCommand =
        'bash -c "$(curl -fsSL https://www.hydrogen.lat/install)"';

    const handleCopy = async () => {
        await navigator.clipboard.writeText(installCommand);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="h-screen w-screen flex items-center justify-center bg-ctp-base">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center space-y-6 max-w-2xl px-6"
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="w-20 h-20 rounded-2xl bg-ctp-mantle flex items-center justify-center mx-auto"
                >
                    <AlertTriangle size={40} className="text-ctp-red" />
                </motion.div>
                <div className="space-y-2">
                    <h1 className="text-2xl font-medium text-ctp-text">
                        Hydrogen Not Found
                    </h1>
                    <p className="text-sm text-ctp-subtext0">
                        Hydrogen installation was not detected. Please run the
                        following command in your terminal to install Hydrogen:
                    </p>
                </div>
                <div
                    className="bg-ctp-mantle rounded-lg p-3 flex items-center gap-2 group relative cursor-pointer w-fit mx-auto"
                    onClick={handleCopy}
                >
                    <code className="text-sm font-mono text-ctp-text whitespace-nowrap">
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
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="p-1.5 rounded-md bg-ctp-surface0 hover:bg-ctp-surface1 transition-colors flex-shrink-0"
                    >
                        {copied ? (
                            <CheckCircle2
                                size={16}
                                className="text-ctp-green"
                            />
                        ) : (
                            <Copy size={16} className="text-ctp-subtext0" />
                        )}
                    </motion.button>
                </div>
                <p className="text-xs text-ctp-subtext0 max-w-sm mx-auto">
                    After installation is complete, please restart Comet to
                    continue.
                </p>
            </motion.div>
        </div>
    );
};
