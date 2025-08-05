import { Brush, Settings, Terminal } from "lucide-react";
import { motion } from "motion/react";
import type { FC } from "react";
import { LANDING_CONTENT } from "../constants/landingContent";

const FeaturesSection: FC = () => {
    return (
        <section className="bg-theme-surface/30 py-12 sm:py-16 md:py-20">
            <div className="mx-auto w-full max-w-[1000px] px-4 sm:px-6">
                <motion.div
                    className="mb-8 text-center sm:mb-12"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <h2 className="text-theme-bright mb-2 text-xl font-semibold sm:mb-3 sm:text-2xl lg:text-3xl">
                        Key Features
                    </h2>
                    <p className="text-theme-subtle mx-auto max-w-lg text-sm sm:text-base">
                        Designed with performance and user experience in mind
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 md:grid-cols-3 lg:gap-6">
                    {LANDING_CONTENT.FEATURES.map((feature, index) => (
                        <motion.div
                            key={feature.title}
                            className="bg-theme-surface/50 hover:bg-theme-surface/60 rounded-lg p-4 transition-colors duration-200 sm:p-5 lg:p-6"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{
                                duration: 0.5,
                                delay: index * 0.1,
                            }}
                        >
                            <div className="mb-2.5 flex items-center gap-2.5 sm:mb-3 sm:gap-3">
                                <div className="bg-theme-accent/10 rounded-md p-1.5 sm:p-2">
                                    {index === 0 && (
                                        <Terminal className="text-theme-accent h-4 w-4 sm:h-[18px] sm:w-[18px]" />
                                    )}
                                    {index === 1 && (
                                        <Brush className="text-theme-accent h-4 w-4 sm:h-[18px] sm:w-[18px]" />
                                    )}
                                    {index === 2 && (
                                        <Settings className="text-theme-accent h-4 w-4 sm:h-[18px] sm:w-[18px]" />
                                    )}
                                </div>
                                <h3 className="text-theme-bright text-sm font-medium sm:text-base">
                                    {feature.title}
                                </h3>
                            </div>
                            <p className="text-theme-subtle text-xs leading-relaxed sm:text-sm">
                                {feature.description}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default FeaturesSection;
