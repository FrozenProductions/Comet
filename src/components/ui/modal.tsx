import { AnimatePresence, motion } from "framer-motion";
import { Button } from "./button";
import { ModalProps } from "../../types/ui";

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
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
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
                        className="mx-4 w-full max-w-md rounded-xl border border-white/5 bg-ctp-mantle p-6 shadow-xl"
                    >
                        <h3 className="mb-2 text-base font-medium text-ctp-text">
                            {title}
                        </h3>
                        {description && (
                            <p className="mb-4 text-sm text-ctp-subtext0">
                                {description}
                            </p>
                        )}

                        {children}

                        {(footer || onConfirm) && (
                            <div className="mt-4 flex justify-end gap-3">
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
