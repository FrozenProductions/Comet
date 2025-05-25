import { FC, useState, useEffect } from "react";
import HeroSection from "../sections/HeroSection";
import FeaturesSection from "../sections/FeaturesSection";
import TechStackSection from "../sections/TechStackSection";
import InstallationSection from "../sections/InstallationSection";
import Footer from "../components/Footer";

const Landing: FC = () => {
    const [hasScrolled, setHasScrolled] = useState(false);

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

    const handleScroll = () => {
        if (window.scrollY > 50) {
            setHasScrolled(true);
        } else {
            setHasScrolled(false);
        }
    };

    useEffect(() => {
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <div className="min-h-screen bg-theme-base text-theme-text selection:bg-theme-accent/20 flex flex-col">
            <HeroSection />

            <div
                className={`transition-opacity duration-500 ${
                    hasScrolled ? "opacity-100" : "opacity-0"
                }`}
            >
                <FeaturesSection />
                <TechStackSection />
                <InstallationSection />
                <Footer
                    onGithubClick={handleGithub}
                    onDocsClick={handleDocs}
                    onHydrogenClick={handleHydrogen}
                />
            </div>
        </div>
    );
};

export default Landing;
