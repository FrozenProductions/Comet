import { FC } from "react";
import { Flag } from "lucide-react";
import { Header } from "../ui/Header";

export const FastFlags: FC = () => {
    return (
        <div className="h-full flex flex-col bg-ctp-base">
            <Header
                title="Fast Flags"
                icon={<Flag size={16} className="text-accent" />}
                description="Manage roblox fast flags"
            />

            <div className="flex-1 flex items-center justify-center">
                <div className="text-center space-y-6">
                    <div className="w-24 h-24 mx-auto rounded-xl bg-ctp-mantle flex items-center justify-center">
                        <Flag size={48} className="text-ctp-yellow" />
                    </div>
                    <div>
                        <div className="text-lg font-medium text-ctp-text">
                            Work in Progress
                        </div>
                        <div className="text-sm text-ctp-subtext0">
                            Fast flags management coming soon
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
