import { FC } from "react";
import { motion } from "framer-motion";
import { LANDING_CONTENT } from "../constants/landingContent";

const TechStackSection: FC = () => {
    return (
        <section className="py-16 md:py-24">
            <div className="w-full max-w-[1100px] mx-auto px-4">
                <motion.div
                    className="text-center mb-12"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    viewport={{ once: true }}
                >
                    <h2 className="text-2xl lg:text-3xl font-semibold text-theme-bright mb-3">
                        Built With Modern Tech
                    </h2>
                    <p className="text-theme-subtle text-base max-w-lg mx-auto">
                        Leveraging the best tools for performance and developer
                        experience
                    </p>
                </motion.div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                    {LANDING_CONTENT.TECH_STACK.map((tech, index) => (
                        <motion.div
                            key={tech.name}
                            className="flex flex-col items-center p-6 bg-theme-surface/30 rounded-lg"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{
                                duration: 0.3,
                                delay: index * 0.1,
                            }}
                            viewport={{ once: true }}
                            whileHover={{ y: -5 }}
                        >
                            <div className="w-16 h-16 mb-4 flex items-center justify-center bg-theme-accent/10 rounded-full">
                                <img
                                    src={`https://raw.githubusercontent.com/devicons/devicon/refs/heads/master/icons/${tech.name.toLowerCase()}/${tech.name.toLowerCase()}-original.svg`}
                                    alt={tech.name}
                                    className="w-10 h-10 object-contain"
                                />
                            </div>
                            <h3 className="text-theme-bright font-medium text-sm mb-1">
                                {tech.name}
                            </h3>
                            <p className="text-theme-subtle text-xs text-center">
                                {tech.description}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default TechStackSection;
