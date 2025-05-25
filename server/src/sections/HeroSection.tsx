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
            "_blank",
        );
    };

    const handleHydrogen = () => {
        window.open("https://www.hydrogen.lat/", "_blank");
    };

    return (
        <main className="relative flex min-h-[90vh] items-center justify-center py-8 lg:min-h-screen lg:py-16">
            <div className="pointer-events-none absolute inset-0">
                <div className="bg-theme-accent/[0.01] absolute left-0 top-0 h-full w-full" />
            </div>

            <div className="mx-auto w-full max-w-[1200px] px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12 lg:gap-12">
                    <motion.div
                        className="order-2 space-y-6 text-center lg:order-1 lg:col-span-5 lg:space-y-8 lg:text-left"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4 }}
                    >
                        <div className="space-y-6">
                            <div>
                                <motion.div
                                    className="bg-theme-surface/40 text-theme-subtle mb-4 inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-xs font-medium"
                                    initial={{ opacity: 0, y: -5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 }}
                                >
                                    <Code size={12} />
                                    <span>Modern Executor Interface</span>
                                </motion.div>

                                <div className="mb-4 flex items-center justify-center gap-3 lg:justify-start">
                                    <img
                                        src="https://github.com/FrozenProductions/Comet/blob/main/public/Icon-tray.png?raw=true"
                                        alt="Comet Logo"
                                        className="h-12 w-12 lg:h-14 lg:w-14"
                                    />
                                    <span className="text-theme-bright text-3xl font-semibold tracking-tight lg:text-4xl xl:text-5xl">
                                        Comet
                                    </span>
                                </div>

                                <p className="text-theme-subtle mx-auto max-w-xl text-base leading-relaxed lg:mx-0 lg:text-lg xl:text-xl">
                                    {LANDING_CONTENT.DESCRIPTION}
                                </p>
                            </div>

                            <div className="flex flex-wrap justify-center gap-3 lg:justify-start">
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

                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-theme-surface/30 rounded-lg p-4">
                                <h3 className="text-theme-bright mb-2 text-sm font-medium lg:text-base">
                                    Modern UI
                                </h3>
                                <p className="text-theme-subtle text-xs lg:text-sm">
                                    Clean, intuitive interface
                                </p>
                            </div>
                            <div className="bg-theme-surface/30 rounded-lg p-4">
                                <h3 className="text-theme-bright mb-2 text-sm font-medium lg:text-base">
                                    Performance
                                </h3>
                                <p className="text-theme-subtle text-xs lg:text-sm">
                                    Optimized for speed
                                </p>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4, delay: 0.1 }}
                        className="order-1 lg:order-2 lg:col-span-7"
                    >
                        <div className="mx-auto w-full max-w-[800px]">
                            <GallerySection images={GALLERY_IMAGES} />
                        </div>
                    </motion.div>
                </div>
            </div>
        </main>
    );
};

export default HeroSection;
