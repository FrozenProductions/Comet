import { Toaster as HotToaster } from "react-hot-toast";

export const Toaster = () => {
    return (
        <HotToaster
            position="bottom-center"
            gutter={8}
            containerStyle={{
                bottom: 24,
            }}
            toastOptions={{
                className:
                    "!bg-ctp-mantle !text-ctp-text !border !border-white/5 !shadow-xl !rounded-xl !py-3 !pl-4 !pr-16",
                duration: 4000,
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
                    className:
                        "!bg-ctp-mantle !text-ctp-text !border !border-white/5 !shadow-xl !rounded-xl !py-3 !pl-4 !pr-16",
                },
                error: {
                    iconTheme: {
                        primary: "rgb(243, 139, 168)",
                        secondary: "rgb(30, 30, 46)",
                    },
                    className:
                        "!bg-ctp-mantle !text-ctp-text !border !border-white/5 !shadow-xl !rounded-xl !py-3 !pl-4 !pr-16",
                },
            }}
        />
    );
};
