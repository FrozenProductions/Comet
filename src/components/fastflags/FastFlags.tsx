import React, { useState, useEffect } from "react";
import { useFastFlags } from "../../contexts/fastFlagsContext";
import { FlagValidationService } from "../../services/flagValidationService";
import {
    Flag,
    Plus,
    Trash2,
    Check,
    AlertCircle,
    Loader2,
    ToggleLeft,
    ListChecks,
} from "lucide-react";
import { Header } from "../ui/header";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { toast } from "react-hot-toast";
import { motion } from "framer-motion";
import { FastFlagManager } from "./fastFlagManager";
import { Tooltip } from "react-tooltip";
import { Modal } from "../ui/modal";

export const FastFlags: React.FC = () => {
    const {
        state: { profiles, activeProfileId, isLoading, error },
        createProfile,
        deleteProfile,
        activateProfile,
        updateFlagValue,
    } = useFastFlags();

    const [newProfileName, setNewProfileName] = useState("");
    const [selectedProfileId, setSelectedProfileId] = useState<string | null>(
        null
    );
    const [isCreatingProfile, setIsCreatingProfile] = useState(false);
    const [invalidFlags, setInvalidFlags] = useState<string[]>([]);
    const [profileToDelete, setProfileToDelete] = useState<{
        id: string;
        name: string;
    } | null>(null);

    const selectedProfile = profiles.find((p) => p.id === selectedProfileId);

    useEffect(() => {
        validateSelectedProfileFlags();
    }, [selectedProfileId, profiles]);

    const validateSelectedProfileFlags = async () => {
        if (!selectedProfile) {
            setInvalidFlags([]);
            return;
        }

        try {
            const flags = Object.keys(selectedProfile.flags);
            const invalidFlags = await FlagValidationService.validateFlags(
                flags
            );
            setInvalidFlags(invalidFlags);
        } catch (error) {
            console.error("Failed to validate flags:", error);
        }
    };

    const handleCreateProfile = async () => {
        if (newProfileName.trim() === "") {
            toast.error("Profile name cannot be empty");
            return;
        }

        try {
            await createProfile(newProfileName);
            setNewProfileName("");
            setIsCreatingProfile(false);
            toast.success("Profile created successfully");
        } catch (error) {
            toast.error("Failed to create profile");
        }
    };

    const handleDeleteProfile = async (profileId: string) => {
        try {
            await deleteProfile(profileId);
            if (selectedProfileId === profileId) {
                setSelectedProfileId(null);
            }
            setProfileToDelete(null);
            toast.success("Profile deleted successfully");
        } catch (error) {
            toast.error("Failed to delete profile");
        }
    };

    const handleActivateProfile = async (profileId: string) => {
        try {
            await activateProfile(profileId);
            toast.success("Profile activated successfully");
        } catch (error) {
            toast.error("Failed to activate profile");
        }
    };

    const handleUpdateFlag = async (
        profileId: string,
        key: string,
        value: string | null
    ) => {
        try {
            await updateFlagValue(profileId, key, value);
            return Promise.resolve();
        } catch (error) {
            return Promise.reject(error);
        }
    };

    if (isLoading) {
        return (
            <div className="h-full flex flex-col bg-ctp-base">
                <Header
                    title="Fast Flags"
                    icon={<ToggleLeft size={16} className="text-accent" />}
                    description="Manage roblox fast flags"
                />
                <div className="flex-1 flex items-center justify-center">
                    <Loader2
                        size={24}
                        className="animate-spin text-accent stroke-[2]"
                    />
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="h-full flex flex-col bg-ctp-base">
                <Header
                    title="Fast Flags"
                    icon={<ToggleLeft size={16} className="text-accent" />}
                    description="Manage fast flags and variables"
                />
                <div className="flex-1 flex items-center justify-center text-ctp-red">
                    <div className="flex flex-col items-center text-center">
                        <AlertCircle size={32} className="mb-4 stroke-[2]" />
                        <div className="text-sm font-medium">
                            Error loading profiles
                        </div>
                        <div className="text-xs mt-1 text-ctp-subtext0">
                            {error}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col bg-ctp-base">
            <Header
                title="Fast Flags"
                icon={<ToggleLeft size={16} className="text-accent" />}
                description="Manage roblox fast flags"
            />

            <div className="flex-1 flex overflow-hidden">
                <div className="w-56 border-r border-white/5 bg-ctp-mantle flex flex-col">
                    <div className="p-3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <ListChecks size={16} className="text-white/50" />
                            <span className="text-sm font-medium">
                                Profiles
                            </span>
                        </div>
                        <Button
                            onClick={() => setIsCreatingProfile(true)}
                            size="sm"
                            data-tooltip-id="fastflags-tooltip"
                            data-tooltip-content="New Profile"
                            className="inline-flex items-center justify-center w-7 h-7 bg-white/10 hover:bg-white/20 group"
                        >
                            <Plus
                                size={14}
                                className="stroke-[2.5] transition-transform duration-200 group-hover:scale-110"
                            />
                        </Button>
                    </div>

                    <div className="flex-1 overflow-y-auto px-1.5 pb-2 space-y-1">
                        {profiles.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-32 text-ctp-subtext0">
                                <AlertCircle
                                    size={20}
                                    className="stroke-[2] mb-2"
                                />
                                <div className="text-sm">No profiles found</div>
                                <div className="text-xs mt-1">
                                    Create a new profile to get started
                                </div>
                            </div>
                        ) : (
                            profiles.map((profile) => (
                                <motion.button
                                    key={profile.id}
                                    onClick={() =>
                                        setSelectedProfileId(profile.id)
                                    }
                                    className={`
                                        group relative w-full flex items-center gap-1.5 p-1.5 rounded-lg cursor-pointer transition-all duration-200 text-left
                                        ${
                                            selectedProfileId === profile.id
                                                ? "bg-ctp-surface0"
                                                : "hover:bg-ctp-surface0/50"
                                        }
                                        ${
                                            activeProfileId === profile.id
                                                ? "border border-accent/50 shadow-[0_0_10px_-5px] shadow-accent/20"
                                                : "border border-transparent"
                                        }
                                    `}
                                >
                                    {activeProfileId === profile.id && (
                                        <motion.div
                                            layoutId="activeProfileIndicator"
                                            className="absolute left-0 w-0.5 h-4 bg-accent rounded-full"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            transition={{ duration: 0.2 }}
                                        />
                                    )}
                                    <Flag
                                        size={14}
                                        className={`stroke-[2.5] shrink-0 ${
                                            activeProfileId === profile.id
                                                ? "text-accent"
                                                : "text-white/50"
                                        }`}
                                    />
                                    <span
                                        className={`truncate text-xs text-left flex-1 ${
                                            activeProfileId === profile.id
                                                ? "text-accent font-medium"
                                                : ""
                                        }`}
                                    >
                                        {profile.name}
                                    </span>
                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleActivateProfile(
                                                    profile.id
                                                );
                                            }}
                                            size="sm"
                                            data-tooltip-id="fastflags-tooltip"
                                            data-tooltip-content={
                                                activeProfileId === profile.id
                                                    ? "Active Profile"
                                                    : "Set Active"
                                            }
                                            className={`inline-flex items-center justify-center h-5 w-5 p-0 ${
                                                activeProfileId === profile.id
                                                    ? "bg-accent hover:bg-accent/90"
                                                    : "bg-white/5 hover:bg-white/10"
                                            }`}
                                        >
                                            <Check
                                                size={10}
                                                className="stroke-[2.5]"
                                            />
                                        </Button>
                                        <Button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setProfileToDelete({
                                                    id: profile.id,
                                                    name: profile.name,
                                                });
                                            }}
                                            variant="destructive"
                                            size="sm"
                                            data-tooltip-id="fastflags-tooltip"
                                            data-tooltip-content="Delete Profile"
                                            className={`
                                                inline-flex items-center justify-center
                                                opacity-0 group-hover:opacity-100 transition-opacity
                                                ${
                                                    selectedProfileId ===
                                                    profile.id
                                                        ? "!opacity-100"
                                                        : ""
                                                }
                                                bg-ctp-red/10 hover:bg-ctp-red/20 text-ctp-red h-5 w-5 p-0
                                            `}
                                        >
                                            <Trash2
                                                size={10}
                                                className="stroke-[2.5]"
                                            />
                                        </Button>
                                    </div>
                                </motion.button>
                            ))
                        )}
                    </div>
                </div>

                {selectedProfile ? (
                    <FastFlagManager
                        profile={selectedProfile}
                        onUpdateFlag={(key, value) =>
                            handleUpdateFlag(selectedProfile.id, key, value)
                        }
                        invalidFlags={invalidFlags}
                    />
                ) : (
                    <div className="flex-1 flex items-center justify-center text-ctp-subtext0">
                        <div className="text-center">
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="w-16 h-16 rounded-xl bg-ctp-mantle flex items-center justify-center mb-4 mx-auto"
                            >
                                <Flag size={32} className="text-white/50" />
                            </motion.div>
                            <motion.div
                                initial={{ y: 10, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.1 }}
                                className="text-sm font-medium text-ctp-text"
                            >
                                No Profile Selected
                            </motion.div>
                            <motion.div
                                initial={{ y: 10, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.2 }}
                                className="text-xs mt-1"
                            >
                                Select a profile from the sidebar to manage
                                flags
                            </motion.div>
                        </div>
                    </div>
                )}
            </div>

            <Modal
                isOpen={isCreatingProfile}
                onClose={() => {
                    setNewProfileName("");
                    setIsCreatingProfile(false);
                }}
                title="Create Profile"
                description="Enter a name for your new fast flags profile."
            >
                <div className="space-y-4">
                    <Input
                        placeholder="Profile name"
                        value={newProfileName}
                        onChange={(e) => setNewProfileName(e.target.value)}
                        onKeyDown={(e) =>
                            e.key === "Enter" && handleCreateProfile()
                        }
                        className="w-full bg-ctp-surface0 border-white/5 focus:border-accent focus:ring-accent"
                        autoFocus
                    />
                </div>
                <div className="flex justify-end gap-3 mt-4">
                    <Button
                        onClick={() => {
                            setNewProfileName("");
                            setIsCreatingProfile(false);
                        }}
                        variant="secondary"
                        size="sm"
                        className="bg-white/5 hover:bg-white/10"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleCreateProfile}
                        size="sm"
                        className="bg-accent hover:bg-accent/90"
                    >
                        Create
                    </Button>
                </div>
            </Modal>

            <Modal
                isOpen={!!profileToDelete}
                onClose={() => setProfileToDelete(null)}
                title="Delete Profile"
                description={`Are you sure you want to delete "${profileToDelete?.name}"? This action cannot be undone.`}
                onConfirm={() => handleDeleteProfile(profileToDelete!.id)}
                confirmText="Delete"
                confirmVariant="destructive"
            />

            <Tooltip
                id="fastflags-tooltip"
                className="!bg-ctp-mantle !px-2.5 !py-1.5 !rounded-lg !text-xs !font-medium !border !border-white/5 !shadow-lg !z-50"
                classNameArrow="!hidden"
                delayShow={50}
                delayHide={0}
            />
        </div>
    );
};
