import { FC } from "react";
import { motion } from "framer-motion";
import { Github, ExternalLink, Code, Zap } from "lucide-react";
import ActionButton from "../components/buttons/actionButton";
import GallerySection from "../components/gallery/gallerySection";
import { GALLERY_IMAGES, LANDING_CONTENT } from "../constants/landingContent";

const HeroSection: FC = () => {
    const handleGithub = () => {
        window.open("https://github.com/FrozenProductions/Comet", "_blank");
    };

    const handleDocs = () => {
        window.open(
            "https://github.com/FrozenProductions/Comet/blob/main/docs/documentation.md",
            "_blank"
        );
    };

    const handleHydrogen = () => {
        window.open("https://www.hydrogen.lat/", "_blank");
    };

    return (
        <main className="relative flex items-center justify-center min-h-[90vh] lg:min-h-screen py-16 lg:py-0">
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 left-0 w-full h-full bg-theme-accent/[0.01]" />
            </div>

            <div className="w-full max-w-[1000px] mx-auto px-4 sm:px-6">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
                    <motion.div
                        className="space-y-8 lg:col-span-5 text-center lg:text-left order-2 lg:order-1"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4 }}
                    >
                        <div className="space-y-6">
                            <div>
                                <motion.div
                                    className="inline-flex items-center gap-1.5 px-2 py-1 bg-theme-surface/40 text-theme-subtle rounded-full text-xs font-medium mb-4"
                                    initial={{ opacity: 0, y: -5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 }}
                                >
                                    <Code size={12} />
                                    <span>Modern Executor Interface</span>
                                </motion.div>

                                <div className="flex items-center gap-3 mb-3 justify-center lg:justify-start">
                                    <img
                                        src="https://github.com/FrozenProductions/Comet/blob/main/public/Icon-tray.png?raw=true"
                                        alt="Comet Logo"
                                        className="w-10 h-10"
                                    />
                                    <span className="font-semibold text-theme-bright text-3xl lg:text-4xl tracking-tight">
                                        Comet
                                    </span>
                                </div>

                                <p className="text-theme-subtle text-base lg:text-lg max-w-lg mx-auto lg:mx-0 leading-relaxed">
                                    {LANDING_CONTENT.DESCRIPTION}
                                </p>
                            </div>

                            <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
                                <ActionButton
                                    label="GitHub"
                                    icon={<Github size={16} />}
                                    onClick={handleGithub}
                                    variant="secondary"
                                />
                                <ActionButton
                                    label="Docs"
                                    icon={<ExternalLink size={16} />}
                                    onClick={handleDocs}
                                    variant="primary"
                                />
                                <ActionButton
                                    label="Hydrogen"
                                    icon={<Zap size={16} />}
                                    onClick={handleHydrogen}
                                    variant="secondary"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="p-3 bg-theme-surface/30 rounded-lg">
                                <h3 className="text-theme-bright font-medium mb-1 text-sm">
                                    Modern UI
                                </h3>
                                <p className="text-theme-subtle text-xs">
                                    Clean, intuitive interface
                                </p>
                            </div>
                            <div className="p-3 bg-theme-surface/30 rounded-lg">
                                <h3 className="text-theme-bright font-medium mb-1 text-sm">
                                    Performance
                                </h3>
                                <p className="text-theme-subtle text-xs">
                                    Optimized for speed
                                </p>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4, delay: 0.1 }}
                        className="lg:col-span-7 order-1 lg:order-2"
                    >
                        <div className="max-w-[600px] mx-auto">
                            <GallerySection images={GALLERY_IMAGES} />
                        </div>
                    </motion.div>
                </div>
            </div>
        </main>
    );
};

export default HeroSection;
