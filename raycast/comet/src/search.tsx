import {
	ActionPanel,
	Action,
	List,
	showToast,
	Toast,
	Icon,
	Color,
	LocalStorage,
} from "@raycast/api";
import { useState, useEffect } from "react";

interface Script {
	title: string;
	game: {
		name: string;
		imageUrl: string;
	};
	script: string;
	views: number;
	verified: boolean;
	working: boolean;
	id?: string;
}

interface ScriptBloxResponse {
	result: {
		scripts: Script[];
	};
}

type FavoriteScripts = Record<string, Script>;
const FAVORITES_KEY = "favorite-scripts";

export default function Command() {
	const [searchText, setSearchText] = useState("");
	const [scripts, setScripts] = useState<Script[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [favorites, setFavorites] = useState<FavoriteScripts>({});
	const [showFavorites, setShowFavorites] = useState(false);
	const [selectedGame, setSelectedGame] = useState<string | null>(null);
	const [games, setGames] = useState<Set<string>>(new Set());

	useEffect(() => {
		async function loadFavorites() {
			try {
				const storedFavorites =
					await LocalStorage.getItem<string>(FAVORITES_KEY);
				if (storedFavorites) {
					setFavorites(JSON.parse(storedFavorites));
				}
			} catch (error) {
				showToast({
					style: Toast.Style.Failure,
					title: "Failed to load favorites",
					message: error instanceof Error ? error.message : String(error),
				});
			}
		}

		loadFavorites();
	}, []);

	async function searchScripts(query: string) {
		if (!query) return;

		setIsLoading(true);
		try {
			const url = new URL("https://scriptblox.com/api/script/search");
			url.searchParams.append("q", query);
			url.searchParams.append("page", "1");
			url.searchParams.append("max", "20");
			url.searchParams.append("mode", "free");
			url.searchParams.append("order", "desc");

			const response = await fetch(url.toString(), {
				method: "GET",
				headers: {
					Accept: "application/json",
					"User-Agent": "Raycast Extension",
				},
			});

			if (!response.ok) {
				const errorText = await response.text();
				throw new Error(`HTTP ${response.status}: ${errorText}`);
			}

			const data = (await response.json()) as ScriptBloxResponse;

			const processedScripts = data.result.scripts.map((script) => {
				const id = `${script.title}-${script.game.name}-${Date.now()}`
					.replace(/\s+/g, "-")
					.toLowerCase();
				return { ...script, id };
			});

			setScripts(processedScripts);

			const gameSet = new Set<string>();
			processedScripts.forEach((script) => {
				gameSet.add(script.game.name);
			});
			setGames(gameSet);
		} catch (error) {
			showToast({
				style: Toast.Style.Failure,
				title: "Failed to search scripts",
				message: error instanceof Error ? error.message : String(error),
			});
			setScripts([]);
		} finally {
			setIsLoading(false);
		}
	}

	useEffect(() => {
		const debounceTimeout = setTimeout(() => {
			if (searchText && !showFavorites) {
				searchScripts(searchText);
			} else if (!searchText && !showFavorites) {
				setScripts([]);
			}
		}, 300);

		return () => clearTimeout(debounceTimeout);
	}, [searchText, showFavorites]);

	async function copyScript(script: Script) {
		try {
			await showToast({
				style: Toast.Style.Success,
				title: "Script Copied",
				message: "Ready to paste in the executor",
			});
			return script.script;
		} catch (error) {
			showToast({
				style: Toast.Style.Failure,
				title: "Failed to copy script",
				message: error instanceof Error ? error.message : String(error),
			});
		}
	}

	async function toggleFavorite(script: Script) {
		try {
			if (!script.id) {
				script.id = `${script.title}-${script.game.name}-${Date.now()}`
					.replace(/\s+/g, "-")
					.toLowerCase();
			}

			const newFavorites = { ...favorites };

			if (newFavorites[script.id]) {
				delete newFavorites[script.id];
				await showToast({
					style: Toast.Style.Success,
					title: "Removed from Favorites",
				});
			} else {
				newFavorites[script.id] = script;
				await showToast({
					style: Toast.Style.Success,
					title: "Added to Favorites",
				});
			}

			setFavorites(newFavorites);
			await LocalStorage.setItem(FAVORITES_KEY, JSON.stringify(newFavorites));
		} catch (error) {
			showToast({
				style: Toast.Style.Failure,
				title: "Failed to update favorites",
				message: error instanceof Error ? error.message : String(error),
			});
		}
	}

	const displayScripts = showFavorites
		? Object.values(favorites)
		: selectedGame
			? scripts.filter((script) => script.game.name === selectedGame)
			: scripts;

	const isFavorite = (script: Script) => {
		if (!script.id) return false;
		return !!favorites[script.id];
	};

	return (
		<List
			isLoading={isLoading}
			onSearchTextChange={setSearchText}
			searchBarPlaceholder={
				showFavorites ? "Search your favorites..." : "Search for scripts..."
			}
			throttle
			navigationTitle={showFavorites ? "Favorite Scripts" : "Search Scripts"}
			searchBarAccessory={
				<List.Dropdown
					tooltip="Filter by Game"
					onChange={setSelectedGame}
					value={selectedGame || ""}
				>
					<List.Dropdown.Item title="All Games" value="" />
					{Array.from(games).map((game, index) => (
						<List.Dropdown.Item key={index} title={game} value={game} />
					))}
				</List.Dropdown>
			}
		>
			<List.Section title="Options">
				<List.Item
					title={showFavorites ? "Show Search Results" : "Show Favorites"}
					icon={showFavorites ? Icon.MagnifyingGlass : Icon.Star}
					actions={
						<ActionPanel>
							<Action
								title={showFavorites ? "Show Search Results" : "Show Favorites"}
								onAction={() => setShowFavorites(!showFavorites)}
							/>
						</ActionPanel>
					}
				/>
			</List.Section>

			<List.Section
				title={showFavorites ? "Favorite Scripts" : "Search Results"}
			>
				{displayScripts.length === 0 ? (
					<List.EmptyView
						title={showFavorites ? "No Favorites" : "No Results"}
						description={
							showFavorites
								? "Add scripts to your favorites"
								: "Try a different search term"
						}
						icon={showFavorites ? Icon.Star : Icon.MagnifyingGlass}
					/>
				) : (
					displayScripts.map((script, index) => (
						<List.Item
							key={index}
							title={script.title}
							subtitle={script.game.name}
							icon={script.game.imageUrl}
							accessories={[
								{
									icon: isFavorite(script)
										? { source: Icon.Star, tintColor: Color.Yellow }
										: undefined,
								},
								{ text: `${script.views} views` },
								{ icon: script.verified ? Icon.CheckCircle : undefined },
								{
									icon: script.working
										? { source: Icon.Play, tintColor: Color.Green }
										: { source: Icon.XmarkCircle, tintColor: Color.Red },
								},
							]}
							actions={
								<ActionPanel>
									<Action
										title="Execute Script"
										icon={{ source: Icon.Play, tintColor: Color.Green }}
										onAction={() => copyScript(script)}
										shortcut={{ modifiers: [], key: "enter" }}
									/>
									<Action
										title={
											isFavorite(script)
												? "Remove from Favorites"
												: "Add to Favorites"
										}
										icon={
											isFavorite(script)
												? { source: Icon.StarDisabled, tintColor: Color.Yellow }
												: Icon.Star
										}
										onAction={() => toggleFavorite(script)}
										shortcut={{ modifiers: ["cmd"], key: "enter" }}
									/>
									<Action.CopyToClipboard
										title="Copy Script"
										content={script.script}
										onCopy={() => copyScript(script)}
										shortcut={{ modifiers: ["cmd", "shift"], key: "enter" }}
									/>
									<Action.Push
										title="View Details"
										target={
											<List.Item
												title={script.title}
												subtitle={script.game.name}
												detail={
													<List.Item.Detail
														markdown={`# ${script.title}\n\n## Game\n${script.game.name}\n\n## Script\n\`\`\`lua\n${script.script}\n\`\`\``}
														metadata={
															<List.Item.Detail.Metadata>
																<List.Item.Detail.Metadata.Label
																	title="Views"
																	text={String(script.views)}
																/>
																<List.Item.Detail.Metadata.Label
																	title="Verified"
																	text={script.verified ? "Yes" : "No"}
																/>
																<List.Item.Detail.Metadata.Label
																	title="Working"
																	text={script.working ? "Yes" : "No"}
																/>
															</List.Item.Detail.Metadata>
														}
													/>
												}
											/>
										}
									/>
								</ActionPanel>
							}
						/>
					))
				)}
			</List.Section>
		</List>
	);
}
