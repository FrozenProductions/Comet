import React, { useState, useEffect, useCallback } from "react";
import { useFastFlags } from "../../hooks/useFastFlags";
import { FlagValidationService } from "../../services/flagValidationService";
import {
    Flag,
    Plus,
    Trash2,
    Check,
    AlertCircle,
    Loader2,
    User,
    Users,
    FolderOpen,
    Settings,
    Edit2,
    Download,
    Upload,
} from "lucide-react";
import { Header } from "../ui/header";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { toast } from "react-hot-toast";
import { motion } from "framer-motion";
import { FastFlagManager } from "./fastFlagManager";
import { EasyMode } from "./easyMode";
import { Tooltip } from "react-tooltip";
import { Modal } from "../ui/modal";
import { FastFlagsProfileService } from "../../services/fastFlagsProfileService";
import {
    cleanupFastFlags,
    openFastFlagsDirectory,
} from "../../services/fastFlagsService";

export const FastFlags: React.FC = () => {
    const {
        state: { profiles, activeProfileId, isLoading, error },
        createProfile,
        deleteProfile,
        activateProfile,
        updateFlagValue,
        renameProfile,
        loadProfiles,
    } = useFastFlags();

    const [newProfileName, setNewProfileName] = useState("");
    const [selectedProfileId, setSelectedProfileId] = useState<string | null>(
        null,
    );
    const [isCreatingProfile, setIsCreatingProfile] = useState(false);
    const [invalidFlags, setInvalidFlags] = useState<string[]>([]);
    const [validationError, setValidationError] = useState<string | null>(null);
    const [profileToDelete, setProfileToDelete] = useState<{
        id: string;
        name: string;
    } | null>(null);
    const [profileToRename, setProfileToRename] = useState<{
        id: string;
        name: string;
    } | null>(null);
    const [newName, setNewName] = useState("");
    const [isAdvancedMode, setIsAdvancedMode] = useState(false);

    useEffect(() => {
        if (activeProfileId && !selectedProfileId) {
            setSelectedProfileId(activeProfileId);
        }
    }, [activeProfileId, selectedProfileId]);

    useEffect(() => {
        if (
            !isLoading &&
            profiles.length > 0 &&
            !selectedProfileId &&
            !activeProfileId
        ) {
            setSelectedProfileId(profiles[0].id);
        }
    }, [isLoading, profiles, selectedProfileId, activeProfileId]);

    const selectedProfile = profiles.find((p) => p.id === selectedProfileId);

    const validateSelectedProfileFlags = useCallback(async () => {
        if (!selectedProfile) {
            setInvalidFlags([]);
            setValidationError(null);
            return;
        }

        try {
            const flags = Object.keys(selectedProfile.flags);
            const invalidFlags =
                await FlagValidationService.validateFlags(flags);
            setInvalidFlags(invalidFlags);
            setValidationError(null);
        } catch (error) {
            console.error("Failed to validate flags:", error);
            setValidationError("Could not fetch valid fast flags list");
            setInvalidFlags([]);
        }
    }, [selectedProfile]);

    useEffect(() => {
        validateSelectedProfileFlags();
    }, [validateSelectedProfileFlags]);

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
            console.error("Failed to create profile:", error);
            toast.error("Failed to create profile");
        }
    };

    const handleDeleteProfile = async (profileId: string) => {
        try {
            await deleteProfile(profileId);
            if (selectedProfileId === profileId) {
                setSelectedProfileId(null);
            }
            if (activeProfileId === profileId) {
                try {
                    const response = await cleanupFastFlags();
                    if (response.success) {
                        toast.success("Fast flags file cleaned up");
                    } else {
                        throw new Error(response.error || "Unknown error");
                    }
                } catch (error) {
                    console.error("Failed to clean up fast flags file:", error);
                    toast.error("Failed to clean up fast flags file");
                }
            }
            setProfileToDelete(null);
            toast.success("Profile deleted successfully");
        } catch (error) {
            toast.error("Failed to delete profile");
            console.error("Failed to delete profile:", error);
        }
    };

    const handleActivateProfile = async (profileId: string) => {
        try {
            await activateProfile(profileId);
            toast.success("Profile activated successfully");
        } catch (error) {
            toast.error("Failed to activate profile");
            console.error("Failed to activate profile:", error);
        }
    };

    const handleUpdateFlag = async (
        profileId: string,
        keyOrUpdates: string | Record<string, string | null>,
        value?: string | null,
    ): Promise<void> => {
        try {
            await updateFlagValue(profileId, keyOrUpdates, value);
        } catch (error) {
            console.error("Failed to update flag(s):", error);
            throw error;
        }
    };

    const handleOpenDirectory = async () => {
        try {
            await openFastFlagsDirectory();
        } catch (error) {
            console.error("Failed to open directory:", error);
            toast.error("Failed to open directory");
        }
    };

    const handleRenameProfile = async () => {
        if (!profileToRename || newName.trim() === "") {
            toast.error("Profile name cannot be empty");
            return;
        }

        try {
            await renameProfile(profileToRename.id, newName);
            setProfileToRename(null);
            setNewName("");
            toast.success("Profile renamed successfully");
        } catch (error) {
            console.error("Failed to rename profile:", error);
            toast.error("Failed to rename profile");
        }
    };

    const handleImport = async () => {
        try {
            await FastFlagsProfileService.importFromFile();
            await loadProfiles();
            toast.success("Profiles imported successfully");
        } catch (error) {
            console.error("Failed to import profiles:", error);
            toast.error("Failed to import profiles");
        }
    };

    if (isLoading) {
        return (
            <div className="flex h-full flex-col bg-ctp-base">
                <Header
                    title="Fast Flags"
                    icon={<Flag size={16} className="text-accent" />}
                    description="Manage Roblox fast flags"
                />
                <div className="flex flex-1 items-center justify-center">
                    <Loader2
                        size={24}
                        className="animate-spin stroke-[2] text-accent"
                    />
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex h-full flex-col bg-ctp-base">
                <Header
                    title="Fast Flags"
                    icon={<Flag size={16} className="text-accent" />}
                    description="Manage fast flags and variables"
                />
                <div className="flex flex-1 items-center justify-center text-ctp-red">
                    <div className="flex flex-col items-center text-center">
                        <AlertCircle size={32} className="mb-4 stroke-[2]" />
                        <div className="text-sm font-medium">
                            Error loading profiles
                        </div>
                        <div className="mt-1 text-xs text-ctp-subtext0">
                            {error}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-full flex-col bg-ctp-base">
            <Header
                title="Fast Flags"
                icon={<Flag size={16} className="text-accent" />}
                description="Manage Roblox fast flags"
                actions={
                    <div className="flex items-center gap-2">
                        <Button
                            onClick={handleOpenDirectory}
                            size="sm"
                            data-tooltip-id="fastflags-tooltip"
                            data-tooltip-content="Open Directory"
                            className="inline-flex h-8 items-center gap-2 bg-white/5 px-3 hover:bg-white/10"
                        >
                            <FolderOpen size={14} className="stroke-[2.5]" />
                        </Button>
                        <Button
                            onClick={() => setIsAdvancedMode(!isAdvancedMode)}
                            size="sm"
                            data-tooltip-id="fastflags-tooltip"
                            data-tooltip-content={`${isAdvancedMode ? "Easy" : "Advanced"} Mode`}
                            className="inline-flex h-8 items-center gap-2 bg-white/5 px-3 hover:bg-white/10"
                        >
                            <Settings
                                size={14}
                                className={`stroke-[2.5] transition-transform duration-200 ${
                                    isAdvancedMode ? "rotate-90" : ""
                                }`}
                            />
                        </Button>
                        <div className="h-4 w-px bg-white/5" />
                        <Button
                            onClick={async () => {
                                try {
                                    await FastFlagsProfileService.exportToFile();
                                    toast.success(
                                        "Profiles exported successfully",
                                    );
                                } catch (error) {
                                    console.error(
                                        "Failed to export profiles:",
                                        error,
                                    );
                                    toast.error("Failed to export profiles");
                                }
                            }}
                            size="sm"
                            data-tooltip-id="fastflags-tooltip"
                            data-tooltip-content="Export Profiles"
                            className="inline-flex h-8 items-center gap-2 bg-white/5 px-3 hover:bg-white/10"
                        >
                            <Download size={14} className="stroke-[2.5]" />
                        </Button>
                        <Button
                            onClick={handleImport}
                            size="sm"
                            data-tooltip-id="fastflags-tooltip"
                            data-tooltip-content="Import Profiles"
                            className="inline-flex h-8 items-center gap-2 bg-white/5 px-3 hover:bg-white/10"
                        >
                            <Upload size={14} className="stroke-[2.5]" />
                        </Button>
                    </div>
                }
            />

            <div className="flex flex-1 overflow-hidden">
                <div className="flex w-56 flex-col border-r border-white/5 bg-ctp-mantle">
                    <div className="flex items-center justify-between p-3">
                        <div className="flex items-center gap-2">
                            <Users size={16} className="text-white/50" />
                            <span className="text-sm font-medium">
                                Profiles
                            </span>
                        </div>
                        <Button
                            onClick={() => setIsCreatingProfile(true)}
                            size="sm"
                            data-tooltip-id="fastflags-tooltip"
                            data-tooltip-content="New Profile"
                            className="group inline-flex h-7 w-7 items-center justify-center bg-white/10 hover:bg-white/20"
                        >
                            <Plus
                                size={14}
                                className="stroke-[2.5] transition-transform duration-200 group-hover:scale-110"
                            />
                        </Button>
                    </div>

                    <div className="flex-1 space-y-1 overflow-y-auto px-1.5 pb-2">
                        {profiles.length === 0 ? (
                            <div className="flex h-full flex-col items-center justify-center text-ctp-subtext0">
                                <AlertCircle
                                    size={20}
                                    className="mb-2 stroke-[2]"
                                />
                                <div className="text-sm">No profiles found</div>
                                <div className="mt-1 text-xs">
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
                                    className={`group relative flex w-full cursor-pointer items-center gap-1.5 rounded-lg p-1.5 text-left transition-all duration-200 ${
                                        selectedProfileId === profile.id
                                            ? "bg-ctp-surface0"
                                            : "hover:bg-ctp-surface0/50"
                                    } ${
                                        activeProfileId === profile.id
                                            ? "border border-accent/50 shadow-[0_0_10px_-5px] shadow-accent/20"
                                            : "border border-transparent"
                                    } `}
                                >
                                    {activeProfileId === profile.id && (
                                        <motion.div
                                            layoutId="activeProfileIndicator"
                                            className="absolute left-0 h-4 w-0.5 rounded-full bg-accent"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            transition={{ duration: 0.2 }}
                                        />
                                    )}
                                    <User
                                        size={14}
                                        className={`ml-1 shrink-0 stroke-[2.5] ${
                                            activeProfileId === profile.id
                                                ? "text-accent"
                                                : "text-white/50"
                                        }`}
                                    />
                                    <span
                                        className={`flex-1 truncate text-left text-xs ${
                                            activeProfileId === profile.id
                                                ? "font-medium text-accent"
                                                : ""
                                        }`}
                                    >
                                        {profile.name}
                                    </span>
                                    <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                                        <Button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setProfileToRename({
                                                    id: profile.id,
                                                    name: profile.name,
                                                });
                                                setNewName(profile.name);
                                            }}
                                            size="sm"
                                            data-tooltip-id="fastflags-tooltip"
                                            data-tooltip-content="Rename Profile"
                                            className="inline-flex h-5 w-5 items-center justify-center bg-white/5 p-0 hover:bg-white/10"
                                        >
                                            <Edit2
                                                size={10}
                                                className="stroke-[2.5]"
                                            />
                                        </Button>
                                        <Button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleActivateProfile(
                                                    profile.id,
                                                );
                                            }}
                                            size="sm"
                                            data-tooltip-id="fastflags-tooltip"
                                            data-tooltip-content={
                                                activeProfileId === profile.id
                                                    ? "Active Profile"
                                                    : "Set Active"
                                            }
                                            className={`inline-flex h-5 w-5 items-center justify-center p-0 ${
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
                                            className={`inline-flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100 ${
                                                selectedProfileId === profile.id
                                                    ? "!opacity-100"
                                                    : ""
                                            } h-5 w-5 bg-ctp-red/10 p-0 text-ctp-red hover:bg-ctp-red/20`}
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
                    isAdvancedMode ? (
                        <FastFlagManager
                            profile={selectedProfile}
                            onUpdateFlag={(key, value) =>
                                handleUpdateFlag(selectedProfile.id, key, value)
                            }
                            invalidFlags={invalidFlags}
                            validationError={validationError}
                            validateSelectedProfileFlags={
                                validateSelectedProfileFlags
                            }
                        />
                    ) : (
                        <EasyMode
                            profile={selectedProfile}
                            onUpdateFlag={(key, value) =>
                                handleUpdateFlag(selectedProfile.id, key, value)
                            }
                            invalidFlags={invalidFlags}
                            validationError={validationError}
                        />
                    )
                ) : (
                    <div className="flex flex-1 items-center justify-center text-ctp-subtext0">
                        <div className="text-center">
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-xl bg-ctp-mantle"
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
                                className="mt-1 text-xs"
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
                        className="w-full border-white/5 bg-ctp-surface0 focus:border-accent focus:ring-accent"
                        autoFocus
                    />
                </div>
                <div className="mt-4 flex justify-end gap-3">
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

            <Modal
                isOpen={!!profileToRename}
                onClose={() => {
                    setProfileToRename(null);
                    setNewName("");
                }}
                title="Rename Profile"
                description="Enter a new name for the profile."
            >
                <div className="space-y-4">
                    <Input
                        placeholder="Profile name"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        onKeyDown={(e) =>
                            e.key === "Enter" && handleRenameProfile()
                        }
                        className="w-full border-white/5 bg-ctp-surface0 focus:border-accent focus:ring-accent"
                        autoFocus
                    />
                </div>
                <div className="mt-4 flex justify-end gap-3">
                    <Button
                        onClick={() => {
                            setProfileToRename(null);
                            setNewName("");
                        }}
                        variant="secondary"
                        size="sm"
                        className="bg-white/5 hover:bg-white/10"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleRenameProfile}
                        size="sm"
                        className="bg-accent hover:bg-accent/90"
                    >
                        Rename
                    </Button>
                </div>
            </Modal>

            <Tooltip
                id="fastflags-tooltip"
                className="!z-50 !rounded-lg !border !border-white/5 !bg-ctp-mantle !px-2.5 !py-1.5 !text-xs !font-medium !shadow-lg"
                classNameArrow="!hidden"
                delayShow={50}
                delayHide={0}
            />
        </div>
    );
};
