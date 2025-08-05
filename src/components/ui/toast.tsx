import { Toaster as HotToaster } from "react-hot-toast";
import { useSettings } from "../../hooks/core/useSettings";
import type { ToastPosition } from "../../types/ui/toast";

const BASE_TOAST_STYLE =
    "!bg-ctp-surface1/80 !text-accent !border !border-ctp-surface2 !shadow-lg !rounded-xl !py-2 !px-3 !flex !items-center !gap-2.5 !text-sm !leading-5 !font-medium !backdrop-blur-md";

const getPositionStyles = (position: ToastPosition) => {
    const styles: Record<string, string | number> = {
        position: "fixed",
        maxWidth: "calc(100% - 32px)",
    };

    switch (position) {
        case "top-left":
            return { ...styles, top: 16, left: 16 };
        case "top-center":
            return {
                ...styles,
                top: 16,
                left: "50%",
                transform: "translateX(-50%)",
            };
        case "top-right":
            return { ...styles, top: 16, right: 16 };
        case "bottom-left":
            return { ...styles, bottom: 16, left: 16 };
        case "bottom-center":
            return {
                ...styles,
                bottom: 16,
                left: "50%",
                transform: "translateX(-50%)",
            };
        case "bottom-right":
            return { ...styles, bottom: 16, right: 16 };
        default:
            return {
                ...styles,
                bottom: 16,
                left: "50%",
                transform: "translateX(-50%)",
            };
    }
};

export const Toaster = () => {
    const { settings } = useSettings();

    if (settings.interface.disableToasts) {
        return null;
    }

    const position = settings.interface.toastPosition || "bottom-center";

    return (
        <HotToaster
            position={position}
            gutter={8}
            containerStyle={getPositionStyles(position)}
            toastOptions={{
                className: BASE_TOAST_STYLE,
                duration: 4000,
                style: {
                    width: "fit-content",
                    minWidth: "auto",
                    maxWidth: "420px",
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word",
                    backgroundColor: "rgba(24, 24, 37, 0.8)",
                },
                loading: {
                    iconTheme: {
                        primary: "rgb(137, 180, 250)",
                        secondary: "rgba(24, 24, 37, 0.8)",
                    },
                },
                success: {
                    iconTheme: {
                        primary: "rgb(166, 227, 161)",
                        secondary: "rgba(24, 24, 37, 0.8)",
                    },
                    className: BASE_TOAST_STYLE,
                },
                error: {
                    iconTheme: {
                        primary: "rgb(243, 139, 168)",
                        secondary: "rgba(24, 24, 37, 0.8)",
                    },
                    className: BASE_TOAST_STYLE,
                },
            }}
        />
    );
};
