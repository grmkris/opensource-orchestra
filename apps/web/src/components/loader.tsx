import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function Loader(props: { className?: string }) {
	return (
		<div className="flex h-full items-center justify-center pt-8">
			<Loader2 className={cn("animate-spin", props.className)} />
		</div>
	);
}
