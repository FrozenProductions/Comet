import { AnimatePresence, motion } from "framer-motion";
import { ReactNode } from "react";
import { Button } from "./button";

export interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    description?: string;
    children?: ReactNode;
    footer?: ReactNode;
    onConfirm?: () => void;
    confirmText?: string;
    confirmVariant?: "destructive" | "primary" | "secondary";
}

export const Modal = ({
    isOpen,
    onClose,
    title,
    description,
    children,
    footer,
    onConfirm,
    confirmText = "Confirm",
    confirmVariant = "primary",
}: ModalProps) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
                    onClick={(e) => {
                        if (e.target === e.currentTarget) {
                            onClose();
                        }
                    }}
                >
                    <motion.div
                        initial={{ scale: 0.95, y: 20 }}
                        animate={{ scale: 1, y: 0 }}
                        exit={{ scale: 0.95, y: 20 }}
                        className="bg-ctp-mantle rounded-xl p-6 max-w-md w-full mx-4 shadow-xl border border-white/5"
                    >
                        <h3 className="text-base font-medium text-ctp-text mb-2">
                            {title}
                        </h3>
                        {description && (
                            <p className="text-sm text-ctp-subtext0 mb-4">
                                {description}
                            </p>
                        )}

                        {children}

                        {(footer || onConfirm) && (
                            <div className="flex justify-end gap-3 mt-4">
                                <Button
                                    onClick={onClose}
                                    variant="secondary"
                                    size="sm"
                                    className="bg-white/5 hover:bg-white/10"
                                >
                                    Cancel
                                </Button>
                                {onConfirm && (
                                    <Button
                                        onClick={onConfirm}
                                        variant={confirmVariant}
                                        size="sm"
                                        className={
                                            confirmVariant === "destructive"
                                                ? "bg-ctp-red hover:bg-ctp-red/90"
                                                : "bg-accent hover:bg-accent/90"
                                        }
                                    >
                                        {confirmText}
                                    </Button>
                                )}
                                {footer}
                            </div>
                        )}
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
