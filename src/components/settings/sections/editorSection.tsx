import { Code2, Monitor, MousePointer2, Sparkles, Type } from "lucide-react";
import type { FC } from "react";
import { useSettings } from "../../../hooks/core/useSettings";
import type { SettingsKey } from "../../../types/core/settings";
import { Checkbox } from "../../ui/checkbox";
import { RadioGroup } from "../../ui/radioGroup";
import { Slider } from "../../ui/slider";
import { SettingGroup } from "../settingGroup";

export const EditorSection: FC = () => {
	const { settings, updateSettings } = useSettings();

	const handleSliderChange = (
		key: SettingsKey,
		subKey: string,
		value: number,
	) => {
		const currentSettings = settings[key] as Record<string, unknown>;
		updateSettings({
			[key]: {
				...currentSettings,
				[subKey]: value,
			},
		});
	};

	return (
		<>
			<div className="mb-4 space-y-2">
				<h2 className="flex items-center gap-2 text-xl font-medium text-ctp-text">
					<Code2 size={20} className="text-accent" />
					Editor Settings
				</h2>
				<p className="-mt-1 select-none text-sm text-ctp-subtext0">
					Customize your code editor preferences and behavior
				</p>
			</div>

			<div className="space-y-6">
				<SettingGroup
					title="Display"
					description="Visual editor preferences"
					icon={<Monitor size={14} className="text-accent" />}
				>
					<Checkbox
						checked={settings.display.showLineNumbers}
						onChange={() => {
							updateSettings({
								display: {
									...settings.display,
									showLineNumbers: !settings.display.showLineNumbers,
								},
							});
						}}
						label="Show line numbers"
						description="Display line numbers in the gutter"
					/>
					<Checkbox
						checked={settings.display.wordWrap}
						onChange={() => {
							updateSettings({
								display: {
									...settings.display,
									wordWrap: !settings.display.wordWrap,
								},
							});
						}}
						label="Word wrap"
						description="Wrap long lines to fit editor width"
					/>
				</SettingGroup>

				<SettingGroup
					title="Text"
					description="Font and spacing preferences"
					icon={<Type size={14} className="text-accent" />}
				>
					<Slider
						value={settings.text.fontSize}
						onChange={(value) => handleSliderChange("text", "fontSize", value)}
						min={8}
						max={32}
						label="Font size"
						description="Adjust the editor font size"
						unit="px"
					/>
					<Slider
						value={settings.text.tabSize}
						onChange={(value) => handleSliderChange("text", "tabSize", value)}
						min={2}
						max={8}
						label="Tab size"
						description="Number of spaces for indentation"
						unit=" spaces"
					/>
					<Slider
						value={settings.text.lineHeight}
						onChange={(value) =>
							handleSliderChange("text", "lineHeight", value)
						}
						min={1}
						max={2}
						step={0.1}
						label="Line height"
						description="Space between lines"
						unit="x"
					/>
				</SettingGroup>

				<SettingGroup
					title="Cursor"
					description="Cursor appearance and behavior"
					icon={<MousePointer2 size={14} className="text-accent" />}
				>
					<RadioGroup
						value={settings.cursor.style}
						onChange={(value) => {
							updateSettings({
								cursor: {
									...settings.cursor,
									style: value,
								},
							});
						}}
						options={[
							{ value: "line", label: "Line" },
							{ value: "block", label: "Block" },
							{ value: "underline", label: "Underline" },
						]}
						label="Cursor Style"
						description="Choose how the cursor appears"
					/>
					<RadioGroup
						value={settings.cursor.blinking}
						onChange={(value) => {
							updateSettings({
								cursor: {
									...settings.cursor,
									blinking: value,
								},
							});
						}}
						options={[
							{ value: "blink", label: "Blink" },
							{ value: "smooth", label: "Smooth" },
							{ value: "phase", label: "Phase" },
							{ value: "expand", label: "Expand" },
							{ value: "solid", label: "Solid" },
						]}
						label="Cursor Animation"
						description="Choose how the cursor animates"
					/>
					<Checkbox
						checked={settings.cursor.smoothCaret}
						onChange={() => {
							updateSettings({
								cursor: {
									...settings.cursor,
									smoothCaret: !settings.cursor.smoothCaret,
								},
							});
						}}
						label="Smooth Caret Movement"
						description="Enable smooth cursor animations when moving"
					/>
				</SettingGroup>

				<SettingGroup
					title="IntelliSense"
					description="Code completion and suggestions"
					icon={<Sparkles size={14} className="text-accent" />}
				>
					<Checkbox
						checked={settings.intellisense.enabled}
						onChange={() => {
							updateSettings({
								intellisense: {
									...settings.intellisense,
									enabled: !settings.intellisense.enabled,
								},
							});
						}}
						label="Enable IntelliSense"
						description="Show code suggestions while typing"
					/>
					<Checkbox
						checked={settings.intellisense.compactMode}
						onChange={() => {
							updateSettings({
								intellisense: {
									...settings.intellisense,
									compactMode: !settings.intellisense.compactMode,
								},
							});
						}}
						label="Compact Mode"
						description="Hide suggestion details and documentation"
					/>
					<RadioGroup
						value={settings.intellisense.acceptSuggestionKey}
						onChange={(value) => {
							updateSettings({
								intellisense: {
									...settings.intellisense,
									acceptSuggestionKey: value as "Tab" | "Enter",
								},
							});
						}}
						options={[
							{ value: "Tab", label: "Tab" },
							{ value: "Enter", label: "Enter" },
						]}
						label="Accept Suggestion Key"
						description="Choose which key accepts the selected suggestion"
					/>
					<Slider
						value={settings.intellisense.maxSuggestions}
						onChange={(value) =>
							handleSliderChange("intellisense", "maxSuggestions", value)
						}
						min={5}
						max={10}
						label="Maximum suggestions"
						description="Number of suggestions to show at once"
					/>
				</SettingGroup>
			</div>
		</>
	);
};
