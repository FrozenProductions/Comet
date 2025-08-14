import { Code, ExternalLink, Github, Zap } from "lucide-react";
import type { FC } from "react";
import { Tooltip } from "react-tooltip";
import type { FooterProps } from "../types/footer";

const Footer: FC<FooterProps> = ({
    onGithubClick,
    onDocsClick,
    onHydrogenClick,
    onRonixClick,
}) => {
    return (
        <footer className="py-8 md:py-12 bg-theme-surface/50">
            <div className="w-full max-w-[1100px] mx-auto px-4">
                <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="text-center md:text-left">
                        <p className="text-theme-subtle text-sm">
                            © {new Date().getFullYear()} Comet UI. MIT License.
                        </p>
                        <p className="text-theme-subtle/70 text-xs mt-2">
                            <span className="text-theme-accent/80">
                                Caution:
                            </span>{" "}
                            Using Roblox executors may result in your account
                            being banned. Use at your own risk. The developers
                            are not responsible for any consequences.
                        </p>
                    </div>
                    <div className="flex gap-4">
                        <button
                            type="button"
                            onClick={onGithubClick}
                            className="p-2 text-theme-subtle hover:text-theme-bright transition-colors"
                            data-tooltip-id="footer-tooltip"
                            data-tooltip-content="View on GitHub"
                        >
                            <Github size={16} />
                        </button>
                        <button
                            type="button"
                            onClick={onDocsClick}
                            className="p-2 text-theme-subtle hover:text-theme-bright transition-colors"
                            data-tooltip-id="footer-tooltip"
                            data-tooltip-content="Documentation"
                        >
                            <ExternalLink size={16} />
                        </button>
                        <button
                            type="button"
                            onClick={onHydrogenClick}
                            className="p-2 text-theme-subtle hover:text-theme-bright transition-colors"
                            data-tooltip-id="footer-tooltip"
                            data-tooltip-content="Visit Hydrogen"
                        >
                            <Zap size={16} />
                        </button>
                        <button
                            type="button"
                            onClick={onRonixClick}
                            className="p-2 text-theme-subtle hover:text-theme-bright transition-colors"
                            data-tooltip-id="footer-tooltip"
                            data-tooltip-content="Visit Ronix"
                        >
                            <Code size={16} />
                        </button>
                    </div>
                </div>
            </div>
            <Tooltip
                id="footer-tooltip"
                className="z-50"
                place="top"
                delayShow={200}
            />
        </footer>
    );
};

export default Footer;
