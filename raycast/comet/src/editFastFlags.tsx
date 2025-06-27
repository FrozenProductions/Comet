import {
	ActionPanel,
	Action,
	Form,
	Toast,
	showToast,
	Icon,
	List,
	useNavigation,
	Color,
} from "@raycast/api";
import { useState, useEffect } from "react";
import fs from "fs";
import path from "path";

const FAST_FLAGS_PATH =
	"/Applications/Roblox.app/Contents/MacOS/ClientSettings/ClientAppSettings.json";

type FastFlag = {
	name: string;
	value: boolean | string | number;
	type: "boolean" | "string" | "number";
};

type AddFormValues = {
	flagName: string;
	flagType: "boolean" | "string" | "number";
	flagValue: string;
};

export default function Command() {
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [flags, setFlags] = useState<FastFlag[]>([]);
	const [filteredFlags, setFilteredFlags] = useState<FastFlag[]>([]);
	const [searchText, setSearchText] = useState("");
	const { push } = useNavigation();
	const [dropdownValue, setDropdownValue] = useState<string | null>(null);

	useEffect(() => {
		loadFastFlags();
	}, []);

	useEffect(() => {
		if (searchText) {
			setFilteredFlags(
				flags.filter((flag) =>
					flag.name.toLowerCase().includes(searchText.toLowerCase()),
				),
			);
		} else {
			setFilteredFlags(flags);
		}
	}, [searchText, flags]);

	async function loadFastFlags() {
		setIsLoading(true);
		setError(null);

		try {
			if (!fs.existsSync(FAST_FLAGS_PATH)) {
				throw new Error(
					`Roblox fast flags file not found at: ${FAST_FLAGS_PATH}`,
				);
			}

			const fileContent = fs.readFileSync(FAST_FLAGS_PATH, "utf8");
			const jsonData = JSON.parse(fileContent);

			const extractedFlags: FastFlag[] = [];

			Object.entries(jsonData).forEach(([key, value]) => {
				let type: "boolean" | "string" | "number";

				if (typeof value === "boolean") {
					type = "boolean";
				} else if (typeof value === "string") {
					type = "string";
				} else if (typeof value === "number") {
					type = "number";
				} else {
					return;
				}

				extractedFlags.push({
					name: key,
					value: value as boolean | string | number,
					type,
				});
			});

			setFlags(extractedFlags);
			setFilteredFlags(extractedFlags);
		} catch (err) {
			setError(err instanceof Error ? err.message : String(err));
		} finally {
			setIsLoading(false);
		}
	}

	function handleSearchTextChange(text: string) {
		setSearchText(text);
	}

	return (
		<List
			isLoading={isLoading}
			searchBarPlaceholder="Search fast flags..."
			onSearchTextChange={handleSearchTextChange}
			throttle
			searchBarAccessory={
				<List.Dropdown
					tooltip="Actions"
					storeValue={false}
					value={dropdownValue || ""}
					onChange={(id) => {
						if (id === "add") {
							push(<AddFlagScreen onFlagAdded={loadFastFlags} />);
						} else if (id === "refresh") {
							loadFastFlags();
						}
						setDropdownValue(null);
					}}
				>
					<List.Dropdown.Section title="Actions">
						<List.Dropdown.Item
							title="Select Action..."
							icon={Icon.Dot}
							value=""
						/>
						<List.Dropdown.Item
							title="Add New Flag"
							icon={Icon.Plus}
							value="add"
						/>
						<List.Dropdown.Item
							title="Refresh Flags"
							icon={Icon.RotateClockwise}
							value="refresh"
						/>
					</List.Dropdown.Section>
				</List.Dropdown>
			}
		>
			{error ? (
				<List.EmptyView
					title="Error Loading Fast Flags"
					description={error}
					icon={{ source: Icon.ExclamationMark, tintColor: "#FF0000" }}
					actions={
						<ActionPanel>
							<Action
								title="Retry"
								onAction={loadFastFlags}
								icon={Icon.RotateClockwise}
							/>
							<Action
								title="Add New Flag"
								icon={Icon.Plus}
								onAction={() =>
									push(<AddFlagScreen onFlagAdded={loadFastFlags} />)
								}
							/>
						</ActionPanel>
					}
				/>
			) : filteredFlags.length === 0 ? (
				<List.EmptyView
					title={searchText ? "No Matching Fast Flags" : "No Fast Flags Found"}
					icon={Icon.MagnifyingGlass}
					actions={
						<ActionPanel>
							<Action
								title="Add New Flag"
								icon={Icon.Plus}
								onAction={() =>
									push(<AddFlagScreen onFlagAdded={loadFastFlags} />)
								}
							/>
						</ActionPanel>
					}
				/>
			) : (
				filteredFlags.map((flag) => (
					<List.Item
						key={flag.name}
						title={flag.name}
						subtitle={String(flag.value)}
						accessories={[{ text: flag.type }]}
						actions={
							<ActionPanel>
								<ActionPanel.Section title="Flag Actions">
									<Action
										title="Edit Flag"
										icon={Icon.Pencil}
										onAction={() =>
											push(
												<EditFlagScreen
													flag={flag}
													onFlagUpdated={loadFastFlags}
												/>,
											)
										}
									/>
									<Action
										title="Delete Flag"
										icon={{ source: Icon.Trash, tintColor: Color.Red }}
										onAction={() => handleDeleteFlag(flag.name, loadFastFlags)}
										shortcut={{ modifiers: ["cmd"], key: "backspace" }}
									/>
								</ActionPanel.Section>
								<ActionPanel.Section title="Global Actions">
									<Action
										title="Add New Flag"
										icon={Icon.Plus}
										onAction={() =>
											push(<AddFlagScreen onFlagAdded={loadFastFlags} />)
										}
										shortcut={{ modifiers: ["cmd"], key: "n" }}
									/>
									<Action
										title="Refresh Flags"
										icon={Icon.RotateClockwise}
										onAction={loadFastFlags}
										shortcut={{ modifiers: ["cmd"], key: "r" }}
									/>
								</ActionPanel.Section>
							</ActionPanel>
						}
					/>
				))
			)}
		</List>
	);
}

async function handleDeleteFlag(flagName: string, onDeleted: () => void) {
	const toast = await showToast({
		style: Toast.Style.Animated,
		title: `Deleting Flag ${flagName}...`,
	});

	try {
		const fileContent = fs.readFileSync(FAST_FLAGS_PATH, "utf8");
		const jsonData = JSON.parse(fileContent);

		const backupPath = path.join(
			path.dirname(FAST_FLAGS_PATH),
			"ClientAppSettings.backup.json",
		);
		fs.writeFileSync(backupPath, fileContent);

		if (!(flagName in jsonData)) {
			toast.style = Toast.Style.Failure;
			toast.title = "Flag Not Found";
			toast.message = `Flag ${flagName} does not exist in configuration`;
			return;
		}

		delete jsonData[flagName];

		fs.writeFileSync(FAST_FLAGS_PATH, JSON.stringify(jsonData, null, 2));

		toast.style = Toast.Style.Success;
		toast.title = "Flag Deleted";
		toast.message = `Removed ${flagName} from configuration`;

		onDeleted();
	} catch (error) {
		toast.style = Toast.Style.Failure;
		toast.title = "Failed to Delete Flag";
		toast.message = error instanceof Error ? error.message : String(error);
	}
}

function AddFlagScreen({ onFlagAdded }: { onFlagAdded: () => void }) {
	const { pop } = useNavigation();
	const [errorMessages, setErrorMessages] = useState<{
		[key: string]: string | undefined;
	}>({});

	async function handleSubmit(values: AddFormValues) {
		const errors: { [key: string]: string } = {};

		if (!values.flagName || values.flagName.trim() === "") {
			errors.flagName = "Flag name is required";
		}

		if (values.flagType === "number" && isNaN(Number(values.flagValue))) {
			errors.flagValue = "Must be a valid number";
		}

		if (Object.keys(errors).length > 0) {
			setErrorMessages(errors);
			return;
		}

		const toast = await showToast({
			style: Toast.Style.Animated,
			title: "Adding New Flag...",
		});

		try {
			const fileContent = fs.readFileSync(FAST_FLAGS_PATH, "utf8");
			const jsonData = JSON.parse(fileContent);

			if (values.flagName in jsonData) {
				toast.style = Toast.Style.Failure;
				toast.title = "Flag Already Exists";
				toast.message = `Flag ${values.flagName} already exists. Edit it instead.`;
				return;
			}

			const backupPath = path.join(
				path.dirname(FAST_FLAGS_PATH),
				"ClientAppSettings.backup.json",
			);
			fs.writeFileSync(backupPath, fileContent);

			let typedValue: boolean | string | number = values.flagValue;
			if (values.flagType === "boolean") {
				typedValue = values.flagValue === "true";
			} else if (values.flagType === "number") {
				typedValue = Number(values.flagValue);
			}

			jsonData[values.flagName] = typedValue;

			fs.writeFileSync(FAST_FLAGS_PATH, JSON.stringify(jsonData, null, 2));

			toast.style = Toast.Style.Success;
			toast.title = "Flag Added";
			toast.message = `Added ${values.flagName} with value ${values.flagValue}`;

			onFlagAdded();
			pop();
		} catch (error) {
			toast.style = Toast.Style.Failure;
			toast.title = "Failed to Add Flag";
			toast.message = error instanceof Error ? error.message : String(error);
		}
	}

	return (
		<Form
			actions={
				<ActionPanel>
					<Action.SubmitForm
						title="Add Flag"
						icon={Icon.Plus}
						onSubmit={handleSubmit}
					/>
					<Action title="Cancel" icon={Icon.XmarkCircle} onAction={pop} />
				</ActionPanel>
			}
		>
			<Form.TextField
				id="flagName"
				title="Flag Name"
				placeholder="Enter flag name"
				error={errorMessages.flagName}
				onChange={() => {
					if (errorMessages.flagName) {
						setErrorMessages({ ...errorMessages, flagName: undefined });
					}
				}}
			/>

			<Form.Dropdown id="flagType" title="Flag Type" defaultValue="boolean">
				<Form.Dropdown.Item value="boolean" title="Boolean" />
				<Form.Dropdown.Item value="string" title="String" />
				<Form.Dropdown.Item value="number" title="Number" />
			</Form.Dropdown>

			<Form.TextField
				id="flagValue"
				title="Flag Value"
				placeholder="Enter flag value"
				error={errorMessages.flagValue}
				onChange={() => {
					if (errorMessages.flagValue) {
						setErrorMessages({ ...errorMessages, flagValue: undefined });
					}
				}}
			/>

			<Form.Description
				title="Default Values"
				text="For boolean flags: 'true' or 'false'\nFor number flags: enter a valid number\nFor string flags: enter any text"
			/>
		</Form>
	);
}

function EditFlagScreen({
	flag,
	onFlagUpdated,
}: {
	flag: FastFlag;
	onFlagUpdated: () => void;
}) {
	const { pop } = useNavigation();
	const [errorMessages, setErrorMessages] = useState<{
		[key: string]: string | undefined;
	}>({});

	async function handleSubmit(
		values: Record<string, string | boolean | number>,
	) {
		const errors: { [key: string]: string } = {};

		if (flag.type === "number" && isNaN(Number(values.value))) {
			errors.value = "Must be a valid number";
			setErrorMessages(errors);
			return;
		}

		const toast = await showToast({
			style: Toast.Style.Animated,
			title: "Updating Fast Flag...",
		});

		try {
			const fileContent = fs.readFileSync(FAST_FLAGS_PATH, "utf8");
			const jsonData = JSON.parse(fileContent);

			const backupPath = path.join(
				path.dirname(FAST_FLAGS_PATH),
				"ClientAppSettings.backup.json",
			);
			fs.writeFileSync(backupPath, fileContent);

			let newValue: string | boolean | number = values.value as string;
			if (flag.type === "boolean") {
				newValue = values.value === "true";
			} else if (flag.type === "number") {
				newValue = Number(values.value);
			}

			jsonData[flag.name] = newValue;

			fs.writeFileSync(FAST_FLAGS_PATH, JSON.stringify(jsonData, null, 2));

			toast.style = Toast.Style.Success;
			toast.title = "Fast Flag Updated";
			toast.message = `${flag.name} set to ${newValue}`;

			onFlagUpdated();
			pop();
		} catch (error) {
			toast.style = Toast.Style.Failure;
			toast.title = "Failed to Update";
			toast.message = error instanceof Error ? error.message : String(error);
		}
	}

	return (
		<Form
			actions={
				<ActionPanel>
					<Action.SubmitForm
						title="Save Changes"
						icon={Icon.SaveDocument}
						onSubmit={handleSubmit}
					/>
					<Action title="Cancel" icon={Icon.XmarkCircle} onAction={pop} />
				</ActionPanel>
			}
		>
			<Form.Description title="Flag Name" text={flag.name} />
			<Form.Description title="Type" text={flag.type} />

			{flag.type === "boolean" ? (
				<Form.Dropdown
					id="value"
					title="Value"
					defaultValue={String(flag.value)}
				>
					<Form.Dropdown.Item value="true" title="true" />
					<Form.Dropdown.Item value="false" title="false" />
				</Form.Dropdown>
			) : flag.type === "number" ? (
				<Form.TextField
					id="value"
					title="Value"
					placeholder="Enter numeric value"
					defaultValue={String(flag.value)}
					error={errorMessages.value}
					onChange={() => {
						if (errorMessages.value) {
							setErrorMessages({ ...errorMessages, value: undefined });
						}
					}}
				/>
			) : (
				<Form.TextField
					id="value"
					title="Value"
					placeholder="Enter string value"
					defaultValue={String(flag.value)}
				/>
			)}
		</Form>
	);
}
