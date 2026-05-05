import { CompareTable } from "../../components/ui";

/** CompareTable demo: 3-OS comparison across kernel/filesystem/shell with diff highlighting. */
export function CompareTableDemo() {
	return (
		<CompareTable
			highlightDifferences
			subjects={[
				{ id: "linux", label: "Linux" },
				{ id: "mac", label: "Mac" },
				{ id: "win", label: "Windows" },
			]}
			attributes={[
				{
					id: "kernel",
					label: "Kernel",
					values: { linux: "Linux", mac: "Darwin", win: "NT" },
				},
				{
					id: "fs",
					label: "Default FS",
					values: { linux: "ext4", mac: "APFS", win: "NTFS" },
				},
				{
					id: "shell",
					label: "Default shell",
					values: { linux: "bash", mac: "zsh", win: "PowerShell" },
				},
			]}
		/>
	);
}
