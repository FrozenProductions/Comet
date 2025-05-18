import { Toaster as HotToaster } from "react-hot-toast";

const baseToastStyle =
    "!bg-ctp-mantle !text-ctp-text !border !border-white/5 !shadow-xl !rounded-xl !py-3 !px-4 !whitespace-normal !w-auto !min-w-[240px] !max-w-[420px] !break-words";

export const Toaster = () => {
    return (
        <HotToaster
            position="bottom-center"
            gutter={8}
            containerStyle={{
                bottom: 24,
                left: "50%",
                transform: "translateX(-50%)",
                maxWidth: "calc(100% - 32px)",
            }}
            toastOptions={{
                className: baseToastStyle,
                duration: 4000,
                style: {
                    width: "fit-content",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    paddingRight: "12px",
                },
                loading: {
                    iconTheme: {
                        primary: "rgb(193, 199, 230)",
                        secondary: "rgb(30, 30, 46)",
                    },
                },
                success: {
                    iconTheme: {
                        primary: "rgb(166, 227, 161)",
                        secondary: "rgb(30, 30, 46)",
                    },
                    className: baseToastStyle,
                },
                error: {
                    iconTheme: {
                        primary: "rgb(243, 139, 168)",
                        secondary: "rgb(30, 30, 46)",
                    },
                    className: baseToastStyle,
                },
            }}
        />
    );
};
