import { FC } from "react";
import { motion } from "framer-motion";
import { Terminal, Brush, Settings } from "lucide-react";
import { LANDING_CONTENT } from "../constants/landingContent";

const FeaturesSection: FC = () => {
    return (
        <section className="py-16 md:py-20 bg-theme-surface/30">
            <div className="w-full max-w-[1000px] mx-auto px-4 sm:px-6">
                <motion.div
                    className="text-center mb-12"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    viewport={{ once: true }}
                >
                    <h2 className="text-2xl lg:text-3xl font-semibold text-theme-bright mb-3">
                        Key Features
                    </h2>
                    <p className="text-theme-subtle text-base max-w-lg mx-auto">
                        Designed with performance and user experience in mind
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 lg:gap-6">
                    {LANDING_CONTENT.FEATURES.map((feature, index) => (
                        <motion.div
                            key={feature.title}
                            className="p-6 bg-theme-surface/50 rounded-lg"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{
                                duration: 0.5,
                                delay: index * 0.1,
                            }}
                            viewport={{ once: true }}
                        >
                            <div className="flex items-center gap-3 mb-3">
                                <div className="p-2 bg-theme-accent/10 rounded-md">
                                    {index === 0 && (
                                        <Terminal
                                            size={18}
                                            className="text-theme-accent"
                                        />
                                    )}
                                    {index === 1 && (
                                        <Brush
                                            size={18}
                                            className="text-theme-accent"
                                        />
                                    )}
                                    {index === 2 && (
                                        <Settings
                                            size={18}
                                            className="text-theme-accent"
                                        />
                                    )}
                                </div>
                                <h3 className="text-theme-bright font-medium">
                                    {feature.title}
                                </h3>
                            </div>
                            <p className="text-theme-subtle text-sm">
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
