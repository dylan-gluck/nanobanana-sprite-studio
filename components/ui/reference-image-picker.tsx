"use client";

import { Check, FolderOpen, Image, Film, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";
import type { Asset } from "@/lib/store";

type ReferenceImagePickerProps = {
	projectId: string;
	value: string[];
	onChange: (assetIds: string[]) => void;
	className?: string;
	disabled?: boolean;
};

type GroupedAssets = {
	references: Asset[];
	characters: Asset[];
	frames: Asset[];
};

export function ReferenceImagePicker({
	projectId,
	value,
	onChange,
	className,
	disabled = false,
}: ReferenceImagePickerProps) {
	const [assets, setAssets] = useState<GroupedAssets>({
		references: [],
		characters: [],
		frames: [],
	});
	const [loading, setLoading] = useState(true);

	const fetchAssets = async () => {
		setLoading(true);
		try {
			const res = await fetch(`/api/projects/${projectId}/assets`);
			const data = await res.json();
			const allAssets: Asset[] = data.assets || [];

			setAssets({
				references: allAssets.filter((a) => a.type === "reference"),
				characters: allAssets.filter((a) => a.type === "character"),
				frames: allAssets.filter((a) => a.type === "frame"),
			});
		} catch (error) {
			console.error("Failed to fetch project assets:", error);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		if (projectId) {
			fetchAssets();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [projectId]);

	const handleToggle = (assetId: string) => {
		if (disabled) return;

		if (value.includes(assetId)) {
			onChange(value.filter((id) => id !== assetId));
		} else {
			onChange([...value, assetId]);
		}
	};

	if (loading) {
		return (
			<div
				className={cn(
					"flex flex-col items-center justify-center h-28 text-muted-foreground rounded-xl bg-muted/20 border border-border/30",
					className
				)}
			>
				<RefreshCw className="w-4 h-4 animate-spin mb-2" />
				<span className="text-xs">Loading assets...</span>
			</div>
		);
	}

	const totalAssets =
		assets.references.length + assets.characters.length + assets.frames.length;

	if (totalAssets === 0) {
		return (
			<div
				className={cn(
					"flex flex-col items-center justify-center h-28 text-muted-foreground rounded-xl bg-muted/20 border border-dashed border-border/50",
					className
				)}
			>
				<div className="w-8 h-8 rounded-lg bg-muted/50 flex items-center justify-center mb-2">
					<FolderOpen className="w-4 h-4" />
				</div>
				<p className="text-xs">No assets available</p>
				<Button
					variant="ghost"
					size="sm"
					onClick={fetchAssets}
					className="mt-1 h-6 text-xs"
				>
					<RefreshCw className="w-3 h-3 mr-1" />
					Refresh
				</Button>
			</div>
		);
	}

	const folders = [
		{
			id: "references",
			label: "References",
			icon: FolderOpen,
			assets: assets.references,
		},
		{
			id: "characters",
			label: "Characters",
			icon: Image,
			assets: assets.characters,
		},
		{ id: "frames", label: "Frames", icon: Film, assets: assets.frames },
	];

	return (
		<div className={cn(disabled && "opacity-50 pointer-events-none", className)}>
			<div className="flex items-center justify-between mb-2">
				<span className="text-xs text-muted-foreground">
					{value.length > 0
						? `${value.length} selected`
						: `${totalAssets} available`}
				</span>
				<Button
					variant="ghost"
					size="sm"
					onClick={fetchAssets}
					className="h-5 w-5 p-0 text-muted-foreground hover:text-foreground"
					disabled={disabled}
				>
					<RefreshCw className="w-3 h-3" />
				</Button>
			</div>

			<Accordion
				type="multiple"
				defaultValue={["references"]}
				className="border rounded-lg"
			>
				{folders.map((folder) => (
					<AccordionItem key={folder.id} value={folder.id} className="px-3">
						<AccordionTrigger className="py-2 hover:no-underline">
							<div className="flex items-center gap-2">
								<folder.icon className="w-4 h-4 text-muted-foreground" />
								<span className="text-sm">{folder.label}</span>
							</div>
						</AccordionTrigger>
						<AccordionContent>
							{folder.assets.length === 0 ? (
								<div className="flex items-center justify-center py-4 text-xs text-muted-foreground">
									No {folder.label.toLowerCase()} available
								</div>
							) : (
								<AssetGrid
									assets={folder.assets}
									selected={value}
									onToggle={handleToggle}
									disabled={disabled}
								/>
							)}
						</AccordionContent>
					</AccordionItem>
				))}
			</Accordion>
		</div>
	);
}

function AssetGrid({
	assets,
	selected,
	onToggle,
	disabled,
}: {
	assets: Asset[];
	selected: string[];
	onToggle: (id: string) => void;
	disabled: boolean;
}) {
	return (
		<div className="grid grid-cols-4 gap-1.5">
			{assets.map((asset) => {
				const isSelected = selected.includes(asset.id);
				return (
					<button
						type="button"
						key={asset.id}
						onClick={() => onToggle(asset.id)}
						disabled={disabled}
						className={cn(
							"group relative aspect-square rounded-lg overflow-hidden transition-all duration-150",
							isSelected
								? "ring-2 ring-primary ring-offset-1 ring-offset-background"
								: "hover:ring-1 hover:ring-border"
						)}
					>
						<div className="absolute inset-0 checkerboard" />
						<img
							src={asset.filePath}
							alt={`Asset ${asset.id}`}
							className="relative w-full h-full object-contain"
						/>
						{isSelected && (
							<div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
								<div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center shadow-lg">
									<Check className="w-3 h-3 text-primary-foreground" />
								</div>
							</div>
						)}
						{!isSelected && (
							<div className="absolute inset-0 bg-background/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
								<div className="w-5 h-5 rounded-full bg-muted border border-border flex items-center justify-center">
									<Check className="w-2.5 h-2.5 text-muted-foreground" />
								</div>
							</div>
						)}
					</button>
				);
			})}
		</div>
	);
}
