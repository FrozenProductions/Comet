import { Toaster as HotToaster } from "react-hot-toast";

const BASE_TOAST_STYLE =
	"!bg-ctp-mantle !text-ctp-text !border !border-white/5 !shadow-xl !rounded-xl !py-2.5 !px-3 !flex !items-center !gap-2 !text-sm !leading-5";

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
				className: BASE_TOAST_STYLE,
				duration: 4000,
				style: {
					width: "fit-content",
					minWidth: "auto",
					maxWidth: "420px",
					whiteSpace: "pre-wrap",
					wordBreak: "break-word",
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
					className: BASE_TOAST_STYLE,
				},
				error: {
					iconTheme: {
						primary: "rgb(243, 139, 168)",
						secondary: "rgb(30, 30, 46)",
					},
					className: BASE_TOAST_STYLE,
				},
			}}
		/>
	);
};
