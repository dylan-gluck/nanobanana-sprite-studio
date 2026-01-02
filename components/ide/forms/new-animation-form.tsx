"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useAppStore } from "@/lib/store";

interface NewAnimationFormProps {
	projectId: string;
	characterId?: string;
}

export function NewAnimationForm({
	projectId,
	characterId: initialCharacterId,
}: NewAnimationFormProps) {
	const { currentProject, clearActionContext, refreshCurrentProject } = useAppStore();
	const [name, setName] = useState("");
	const [description, setDescription] = useState("");
	const [characterId, setCharacterId] = useState(initialCharacterId || "");
	const [frameCount, setFrameCount] = useState("4");
	const [isLoading, setIsLoading] = useState(false);

	const characters = currentProject?.characters || [];

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!name.trim()) {
			toast.error("Please enter an animation name");
			return;
		}

		if (!characterId) {
			toast.error("Please select a character");
			return;
		}

		setIsLoading(true);

		try {
			const res = await fetch("/api/animations", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					name: name.trim(),
					characterId,
					description: description.trim() || null,
					frameCount: parseInt(frameCount, 10),
				}),
			});

			if (!res.ok) {
				const data = await res.json();
				throw new Error(data.error || "Failed to create animation");
			}

			toast.success(`Animation "${name}" created`);
			clearActionContext();
			await refreshCurrentProject();
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Failed to create animation");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<form onSubmit={handleSubmit} className="space-y-4">
			<div className="space-y-2">
				<Label htmlFor="character">Character</Label>
				<Select value={characterId} onValueChange={setCharacterId}>
					<SelectTrigger id="character" disabled={isLoading}>
						<SelectValue placeholder="Select a character" />
					</SelectTrigger>
					<SelectContent>
						{characters.length === 0 ? (
							<SelectItem value="" disabled>
								No characters available
							</SelectItem>
						) : (
							characters.map((char) => (
								<SelectItem key={char.id} value={char.id}>
									{char.name}
								</SelectItem>
							))
						)}
					</SelectContent>
				</Select>
			</div>

			<div className="space-y-2">
				<Label htmlFor="name">Animation Name</Label>
				<Input
					id="name"
					placeholder="e.g., Walk, Run, Attack"
					value={name}
					onChange={(e) => setName(e.target.value)}
					disabled={isLoading}
				/>
			</div>

			<div className="space-y-2">
				<Label htmlFor="description">Description</Label>
				<Textarea
					id="description"
					placeholder="Describe the animation sequence..."
					value={description}
					onChange={(e) => setDescription(e.target.value)}
					rows={3}
					disabled={isLoading}
				/>
			</div>

			<div className="space-y-2">
				<Label htmlFor="frameCount">Frame Count</Label>
				<Select value={frameCount} onValueChange={setFrameCount}>
					<SelectTrigger id="frameCount" disabled={isLoading}>
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						{[2, 4, 6, 8, 10, 12].map((count) => (
							<SelectItem key={count} value={String(count)}>
								{count} frames
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>

			<div className="flex gap-2 pt-2">
				<Button
					type="button"
					variant="outline"
					className="flex-1"
					onClick={clearActionContext}
					disabled={isLoading}
				>
					Cancel
				</Button>
				<Button
					type="submit"
					className="flex-1"
					disabled={isLoading || characters.length === 0}
				>
					{isLoading ? (
						<>
							<Loader2 className="h-4 w-4 mr-2 animate-spin" />
							Creating...
						</>
					) : (
						"Create Animation"
					)}
				</Button>
			</div>
		</form>
	);
}
