"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useAppStore } from "@/lib/store";

interface NewCharacterFormProps {
	projectId: string;
}

export function NewCharacterForm({ projectId }: NewCharacterFormProps) {
	const { clearActionContext, refreshCurrentProject } = useAppStore();
	const [name, setName] = useState("");
	const [prompt, setPrompt] = useState("");
	const [isLoading, setIsLoading] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!name.trim()) {
			toast.error("Please enter a character name");
			return;
		}

		setIsLoading(true);

		try {
			const res = await fetch("/api/characters", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					name: name.trim(),
					projectId,
					userPrompt: prompt.trim() || null,
				}),
			});

			if (!res.ok) {
				const data = await res.json();
				throw new Error(data.error || "Failed to create character");
			}

			toast.success(`Character "${name}" created`);
			clearActionContext();
			await refreshCurrentProject();
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Failed to create character");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<form onSubmit={handleSubmit} className="space-y-4">
			<div className="space-y-2">
				<Label htmlFor="name">Name</Label>
				<Input
					id="name"
					placeholder="e.g., Knight, Wizard, Dragon"
					value={name}
					onChange={(e) => setName(e.target.value)}
					disabled={isLoading}
				/>
			</div>

			<div className="space-y-2">
				<Label htmlFor="prompt">Description</Label>
				<Textarea
					id="prompt"
					placeholder="Describe your character's appearance, style, colors..."
					value={prompt}
					onChange={(e) => setPrompt(e.target.value)}
					rows={4}
					disabled={isLoading}
				/>
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
				<Button type="submit" className="flex-1" disabled={isLoading}>
					{isLoading ? (
						<>
							<Loader2 className="h-4 w-4 mr-2 animate-spin" />
							Creating...
						</>
					) : (
						"Create Character"
					)}
				</Button>
			</div>
		</form>
	);
}
