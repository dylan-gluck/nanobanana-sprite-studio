"use client";

import { useEffect, useState, useRef } from "react";
import {
	Film,
	Play,
	Pause,
	Plus,
	Edit,
	Calendar,
	Loader2,
	RotateCcw,
	Trash2,
	ChevronLeft,
	ChevronRight,
	X,
	Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";
import {
	useAppStore,
	type AnimationWithFrames,
	type FrameWithAsset,
	type Character,
	type Project,
	type Asset,
} from "@/lib/store";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

interface AnimationWithDetails extends AnimationWithFrames {
	project: Project;
	character: Character & { primaryAsset: Asset | null };
}

interface AnimationViewProps {
	animationId: string;
}

export function AnimationView({ animationId }: AnimationViewProps) {
	const { openTab, setActionContext } = useAppStore();
	const [animation, setAnimation] = useState<AnimationWithDetails | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [isPlaying, setIsPlaying] = useState(false);
	const [currentFrame, setCurrentFrame] = useState(0);
	const [fps, setFps] = useState(8);
	const intervalRef = useRef<NodeJS.Timeout | null>(null);

	useEffect(() => {
		fetchAnimation();
	}, [animationId]);

	useEffect(() => {
		if (isPlaying && animation && animation.frames.length > 0) {
			intervalRef.current = setInterval(() => {
				setCurrentFrame((prev) => (prev + 1) % animation.frames.length);
			}, 1000 / fps);
		} else if (intervalRef.current) {
			clearInterval(intervalRef.current);
			intervalRef.current = null;
		}

		return () => {
			if (intervalRef.current) {
				clearInterval(intervalRef.current);
			}
		};
	}, [isPlaying, fps, animation?.frames.length]);

	const fetchAnimation = async () => {
		setIsLoading(true);
		try {
			const res = await fetch(`/api/animations/${animationId}`);
			if (res.ok) {
				const data = await res.json();
				setAnimation(data);
			}
		} catch (error) {
			console.error("Failed to fetch animation:", error);
		} finally {
			setIsLoading(false);
		}
	};

	const togglePlayback = () => {
		setIsPlaying((prev) => !prev);
	};

	const goToFrame = (index: number) => {
		setIsPlaying(false);
		setCurrentFrame(index);
	};

	const prevFrame = () => {
		if (animation) {
			setIsPlaying(false);
			setCurrentFrame(
				(prev) => (prev - 1 + animation.frames.length) % animation.frames.length,
			);
		}
	};

	const nextFrame = () => {
		if (animation) {
			setIsPlaying(false);
			setCurrentFrame((prev) => (prev + 1) % animation.frames.length);
		}
	};

	const handleDeleteFrame = async (frameId: string) => {
		try {
			const res = await fetch(`/api/frames/${frameId}`, { method: "DELETE" });
			if (res.ok) {
				toast.success("Frame deleted");
				await fetchAnimation();
				// Adjust current frame if needed
				if (animation && currentFrame >= animation.frames.length - 1) {
					setCurrentFrame(Math.max(0, animation.frames.length - 2));
				}
			} else {
				toast.error("Failed to delete frame");
			}
		} catch {
			toast.error("Failed to delete frame");
		}
	};

	if (isLoading) {
		return (
			<div className="h-full flex items-center justify-center">
				<Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
			</div>
		);
	}

	if (!animation) {
		return (
			<div className="h-full flex items-center justify-center">
				<p className="text-muted-foreground">Animation not found</p>
			</div>
		);
	}

	const currentFrameData = animation.frames[currentFrame];
	const hasFrames = animation.frames.length > 0;

	return (
		<ScrollArea className="h-full">
			<div className="p-6 max-w-5xl mx-auto space-y-6">
				{/* Header */}
				<div className="flex items-start justify-between">
					<div className="space-y-1">
						<h1 className="text-2xl font-bold text-foreground">
							{animation.name}
						</h1>
						<p className="text-sm text-muted-foreground">
							<button
								type="button"
								className="hover:underline"
								onClick={() =>
									openTab(
										"character",
										animation.character.id,
										animation.character.name,
									)
								}
							>
								{animation.character.name}
							</button>
							{" · "}
							{animation.project.name}
						</p>
						{animation.description && (
							<p className="text-sm text-muted-foreground">
								{animation.description}
							</p>
						)}
						<div className="flex items-center gap-4 text-sm text-muted-foreground pt-1">
							<span className="flex items-center gap-1">
								<Calendar className="h-4 w-4" />
								Created{" "}
								{formatDistanceToNow(new Date(animation.createdAt), {
									addSuffix: true,
								})}
							</span>
							<span>{animation.frames.length} frames</span>
						</div>
					</div>
					<div className="flex gap-2">
						<Button
							variant="outline"
							size="sm"
							onClick={() =>
								setActionContext({
									type: "generate-frames",
									animation: animation,
								})
							}
						>
							<Plus className="h-4 w-4 mr-1" />
							Generate Frames
						</Button>
						<Button
							variant="outline"
							size="sm"
							onClick={() =>
								setActionContext({
									type: "edit-animation",
									animation: animation,
								})
							}
						>
							<Edit className="h-4 w-4 mr-1" />
							Edit
						</Button>
					</div>
				</div>

				{/* Preview Player */}
				<section className="space-y-4">
					<div className="rounded-lg border border-border bg-card overflow-hidden">
						{/* Preview Area */}
						<div className="aspect-square max-w-md mx-auto bg-muted/50 relative">
							{hasFrames && currentFrameData ? (
								<img
									src={currentFrameData.asset.filePath}
									alt={`Frame ${currentFrame + 1}`}
									className="w-full h-full object-contain"
								/>
							) : (
								<div className="w-full h-full flex items-center justify-center">
									<div className="text-center">
										<Film className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
										<p className="text-sm text-muted-foreground">
											No frames generated
										</p>
									</div>
								</div>
							)}

							{/* Frame counter */}
							{hasFrames && (
								<div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
									{currentFrame + 1} / {animation.frames.length}
								</div>
							)}
						</div>

						{/* Playback Controls */}
						{hasFrames && (
							<div className="p-4 border-t border-border space-y-4">
								{/* Control buttons */}
								<div className="flex items-center justify-center gap-2">
									<Button variant="outline" size="icon" onClick={prevFrame}>
										<ChevronLeft className="h-4 w-4" />
									</Button>
									<Button
										variant="outline"
										size="icon"
										className="h-10 w-10"
										onClick={togglePlayback}
									>
										{isPlaying ? (
											<Pause className="h-5 w-5" />
										) : (
											<Play className="h-5 w-5" />
										)}
									</Button>
									<Button variant="outline" size="icon" onClick={nextFrame}>
										<ChevronRight className="h-4 w-4" />
									</Button>
									<Button
										variant="outline"
										size="icon"
										onClick={() => {
											setIsPlaying(false);
											setCurrentFrame(0);
										}}
									>
										<RotateCcw className="h-4 w-4" />
									</Button>
								</div>

								{/* FPS slider */}
								<div className="flex items-center gap-4 max-w-xs mx-auto">
									<span className="text-xs text-muted-foreground w-8">
										{fps} fps
									</span>
									<Slider
										value={[fps]}
										onValueChange={([value]) => setFps(value)}
										min={1}
										max={24}
										step={1}
										className="flex-1"
									/>
								</div>
							</div>
						)}
					</div>
				</section>

				{/* Frame Timeline */}
				<section className="space-y-4">
					<div className="flex items-center justify-between">
						<h2 className="text-lg font-semibold">Frames</h2>
						<Button
							size="sm"
							variant="outline"
							onClick={() =>
								setActionContext({
									type: "generate-frames",
									animation: animation,
								})
							}
						>
							<Plus className="h-4 w-4 mr-1" />
							Add Frame
						</Button>
					</div>

					{!hasFrames ? (
						<div className="rounded-lg border border-dashed border-border bg-muted/30 p-8 text-center">
							<div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center mx-auto mb-3">
								<Film className="h-6 w-6 text-muted-foreground" />
							</div>
							<h3 className="text-sm font-medium text-foreground mb-1">
								No frames yet
							</h3>
							<p className="text-sm text-muted-foreground mb-4">
								Generate frames for this animation sequence
							</p>
							<Button
								size="sm"
								variant="outline"
								onClick={() =>
									setActionContext({
										type: "generate-frames",
										animation: animation,
									})
								}
							>
								<Plus className="h-4 w-4 mr-1" />
								Generate Frames
							</Button>
						</div>
					) : (
						<div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
							{animation.frames.map((frame, index) => (
								<FrameCard
									key={frame.id}
									frame={frame}
									index={index}
									isActive={index === currentFrame}
									onClick={() => goToFrame(index)}
									onDelete={() => handleDeleteFrame(frame.id)}
								/>
							))}
						</div>
					)}
				</section>
			</div>
		</ScrollArea>
	);
}

function FrameCard({
	frame,
	index,
	isActive,
	onClick,
	onDelete,
}: {
	frame: FrameWithAsset;
	index: number;
	isActive: boolean;
	onClick: () => void;
	onDelete: () => Promise<void>;
}) {
	const [confirmDelete, setConfirmDelete] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);

	const handleDelete = async () => {
		setIsDeleting(true);
		await onDelete();
		setIsDeleting(false);
		setConfirmDelete(false);
	};

	return (
		<div
			className={cn(
				"group relative aspect-square rounded-lg border overflow-hidden cursor-pointer transition-all",
				isActive
					? "border-primary ring-2 ring-primary/20"
					: "border-border hover:border-primary/50",
			)}
			onClick={onClick}
			onKeyDown={(e) => {
				if (e.key === "Enter" || e.key === " ") onClick();
			}}
		>
			<img
				src={frame.asset.filePath}
				alt={`Frame ${index + 1}`}
				className="w-full h-full object-cover"
			/>
			<div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-1">
				<span className="text-[10px] text-white font-medium">{index + 1}</span>
			</div>

			{/* Hover actions */}
			<div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
				{confirmDelete ? (
					<div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
						<Button
							variant="destructive"
							size="icon"
							className="h-6 w-6"
							onClick={handleDelete}
							disabled={isDeleting}
						>
							{isDeleting ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
						</Button>
						<Button
							variant="secondary"
							size="icon"
							className="h-6 w-6"
							onClick={() => setConfirmDelete(false)}
							disabled={isDeleting}
						>
							<X className="h-3 w-3" />
						</Button>
					</div>
				) : (
					<Button
						variant="secondary"
						size="icon"
						className="h-6 w-6"
						onClick={(e) => {
							e.stopPropagation();
							setConfirmDelete(true);
						}}
					>
						<Trash2 className="h-3 w-3" />
					</Button>
				)}
			</div>
		</div>
	);
}
