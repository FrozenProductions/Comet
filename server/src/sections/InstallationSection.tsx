import { FC, useState } from "react";
import { motion } from "framer-motion";
import { FileCode, Copy, Check } from "lucide-react";
import { LANDING_CONTENT } from "../constants/landingContent";

const InstallationSection: FC = () => {
    const [showInstallCommand, setShowInstallCommand] = useState(false);

    const handleCopyInstall = () => {
        navigator.clipboard.writeText(
            "curl -s https://www.comet-ui.fun/api/v1/installer | bash"
        );
        setShowInstallCommand(true);
        setTimeout(() => setShowInstallCommand(false), 2000);
    };

    return (
        <section className="py-16 md:py-24 bg-theme-surface/30">
            <div className="w-full max-w-[1100px] mx-auto px-4">
                <motion.div
                    className="text-center mb-12"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    viewport={{ once: true }}
                >
                    <h2 className="text-2xl lg:text-3xl font-semibold text-theme-bright mb-3">
                        Getting Started
                    </h2>
                    <p className="text-theme-subtle text-base max-w-lg mx-auto">
                        Install Comet and start using it in minutes
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                    <motion.div
                        className="space-y-4"
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5 }}
                        viewport={{ once: true }}
                    >
                        <h3 className="text-lg font-medium text-theme-bright">
                            One-line Installation
                        </h3>
                        <div className="relative bg-theme-surface/70 rounded-lg overflow-hidden">
                            <div className="flex items-center">
                                <div className="flex-1 p-4 font-mono text-sm text-theme-subtle overflow-x-auto">
                                    {LANDING_CONTENT.INSTALLATION.ONE_LINE}
                                </div>
                                <div className="flex items-center h-full pr-4">
                                    <motion.button
                                        onClick={handleCopyInstall}
                                        className="flex items-center justify-center text-theme-subtle hover:text-theme-bright transition-colors"
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        {showInstallCommand ? (
                                            <Check
                                                size={16}
                                                className="text-theme-accent"
                                            />
                                        ) : (
                                            <Copy size={16} />
                                        )}
                                    </motion.button>
                                </div>
                            </div>
                        </div>
                        <p className="text-sm text-theme-subtle">
                            This will download and install the latest version of
                            Comet on your system.
                        </p>
                    </motion.div>

                    <motion.div
                        className="space-y-4 bg-theme-surface/20 p-6 rounded-lg"
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5 }}
                        viewport={{ once: true }}
                    >
                        <h3 className="text-lg font-medium text-theme-bright flex items-center gap-2">
                            <FileCode size={16} className="text-theme-accent" />
                            Build from Source
                        </h3>
                        <div className="space-y-3">
                            {LANDING_CONTENT.INSTALLATION.STEPS.map(
                                (step, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center gap-2"
                                    >
                                        <span className="text-theme-accent font-mono min-w-[12px] text-center">
                                            {">"}
                                        </span>
                                        <code className="text-sm text-theme-subtle font-mono">
                                            {step}
                                        </code>
                                    </div>
                                )
                            )}
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
};

export default InstallationSection;
