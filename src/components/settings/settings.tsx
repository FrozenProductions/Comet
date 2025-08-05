import { ChevronRight, Search, Settings as SettingsIcon } from "lucide-react";
import { motion } from "motion/react";
import { type FC, useState } from "react";
import { SETTINGS_SECTIONS } from "../../constants/core/settings";
import { Header } from "../ui/header";
import { ApplicationSection } from "./sections/applicationSection";
import { EditorSection } from "./sections/editorSection";
import { InterfaceSection } from "./sections/interfaceSection";
import { KeybindsSection } from "./sections/keybindsSection";
import { TraySection } from "./sections/traySection";

export const Settings: FC = () => {
    const [activeSection, setActiveSection] = useState("editor");
    const [searchQuery, setSearchQuery] = useState("");

    const renderSectionContent = () => {
        switch (activeSection) {
            case "editor":
                return <EditorSection />;
            case "interface":
                return <InterfaceSection />;
            case "keybinds":
                return <KeybindsSection />;
            case "application":
                return <ApplicationSection />;
            case "tray":
                return <TraySection />;
            default:
                return null;
        }
    };

    return (
        <div className="flex h-full flex-col bg-ctp-base">
            <Header
                title="Settings"
                icon={<SettingsIcon size={16} className="text-accent" />}
                description="Changes are saved automatically"
            />

            <div className="flex flex-1 overflow-hidden">
                <div className="flex w-64 flex-col border-r border-white/5 bg-ctp-mantle">
                    <div className="p-2">
                        <div className="relative">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) =>
                                    setSearchQuery(e.target.value.toLowerCase())
                                }
                                placeholder="Search settings..."
                                className="h-9 w-full rounded-lg bg-white/5 pl-9 pr-3 text-sm text-ctp-text placeholder-ctp-subtext0 focus:outline-none focus:ring-2 focus:ring-accent/50"
                            />
                            <Search
                                size={16}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-accent"
                            />
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto">
                        {SETTINGS_SECTIONS.filter(
                            (section) =>
                                section.title
                                    .toLowerCase()
                                    .includes(searchQuery) ||
                                section.description
                                    .toLowerCase()
                                    .includes(searchQuery),
                        ).map((section) => (
                            <motion.button
                                key={section.id}
                                onClick={() => setActiveSection(section.id)}
                                className={`group relative w-full px-4 py-3 text-left transition-colors hover:bg-ctp-surface0 ${activeSection === section.id ? "bg-ctp-surface0" : ""} `}
                                initial={false}
                                animate={{
                                    backgroundColor:
                                        activeSection === section.id
                                            ? "var(--ctp-surface0)"
                                            : "transparent",
                                }}
                                transition={{
                                    type: "spring",
                                    stiffness: 500,
                                    damping: 30,
                                }}
                            >
                                <div className="flex items-center gap-3">
                                    <section.icon
                                        size={18}
                                        className={` ${
                                            activeSection === section.id
                                                ? "text-accent"
                                                : "text-ctp-subtext0"
                                        } transition-colors group-hover:text-accent`}
                                    />
                                    <div>
                                        <div className="text-sm font-medium text-ctp-text">
                                            {section.title}
                                        </div>
                                        <div className="select-none text-xs text-ctp-subtext0">
                                            {section.description}
                                        </div>
                                    </div>
                                    <ChevronRight
                                        size={16}
                                        className={`ml-auto opacity-0 transition-all group-hover:opacity-100 ${
                                            activeSection === section.id
                                                ? "text-accent opacity-100"
                                                : "text-ctp-subtext0"
                                        } `}
                                    />
                                </div>
                                {activeSection === section.id && (
                                    <motion.div
                                        layoutId="active-indicator"
                                        className="absolute bottom-0 left-0 top-0 w-0.5 bg-accent-gradient"
                                    />
                                )}
                            </motion.button>
                        ))}
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                    <div className="mx-auto max-w-3xl space-y-8 p-8">
                        <motion.div
                            key={activeSection}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{
                                duration: 0.2,
                                type: "spring",
                                stiffness: 300,
                                damping: 30,
                            }}
                        >
                            {renderSectionContent()}
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    );
};
