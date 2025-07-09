import { motion } from "motion/react";
import type { FC } from "react";
import { LANDING_CONTENT } from "../constants/landingContent";

const TechStackSection: FC = () => {
	return (
		<section className="py-12 sm:py-16 md:py-20 lg:py-24">
			<div className="mx-auto w-full max-w-[1100px] px-4 sm:px-6">
				<motion.div
					className="mb-8 text-center sm:mb-12"
					initial={{ opacity: 0, y: 20 }}
					whileInView={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5 }}
					viewport={{ once: true }}
				>
					<h2 className="text-theme-bright mb-2 text-xl font-semibold sm:mb-3 sm:text-2xl lg:text-3xl">
						Built With Modern Tech
					</h2>
					<p className="text-theme-subtle mx-auto max-w-lg text-sm sm:text-base">
						Leveraging the best tools for performance and developer experience
					</p>
				</motion.div>

				<div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-5 lg:gap-6">
					{LANDING_CONTENT.TECH_STACK.map((tech, index) => (
						<motion.div
							key={tech.name}
							className="bg-theme-surface/30 hover:bg-theme-surface/40 flex flex-col items-center rounded-lg p-4 transition-colors duration-200 sm:p-5 lg:p-6"
							initial={{ opacity: 0, y: 20 }}
							whileInView={{ opacity: 1, y: 0 }}
							transition={{
								duration: 0.3,
								delay: index * 0.1,
							}}
							viewport={{ once: true }}
							whileHover={{ y: -5 }}
						>
							<div className="bg-theme-accent/10 mb-3 flex h-12 w-12 items-center justify-center rounded-full sm:mb-4 sm:h-14 sm:w-14 lg:h-16 lg:w-16">
								<img
									src={`https://raw.githubusercontent.com/devicons/devicon/refs/heads/master/icons/${tech.name.toLowerCase()}/${tech.name.toLowerCase()}-original.svg`}
									alt={tech.name}
									className="h-7 w-7 object-contain sm:h-8 sm:w-8 lg:h-10 lg:w-10"
								/>
							</div>
							<h3 className="text-theme-bright mb-1 text-xs font-medium sm:text-sm">
								{tech.name}
							</h3>
							<p className="text-theme-subtle text-center text-[10px] sm:text-xs">
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
