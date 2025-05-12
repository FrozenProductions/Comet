import { FC } from "react";
import { Construction, User } from "lucide-react";
import { Header } from "../ui/Header";

export const Profile: FC = () => {
    return (
        <div className="h-full flex flex-col bg-ctp-base">
            <Header
                title="Profile"
                icon={<User size={16} className="text-accent" />}
                description="View your profile statistics"
            />

            <div className="flex-1 flex items-center justify-center">
                <div className="text-center space-y-6">
                    <div className="w-24 h-24 mx-auto rounded-xl bg-ctp-mantle flex items-center justify-center">
                        <Construction size={48} className="text-ctp-yellow" />
                    </div>
                    <div>
                        <div className="text-lg font-medium text-ctp-text">
                            Work in Progress
                        </div>
                        <div className="text-sm text-ctp-subtext0">
                            This feature is currently under development
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
