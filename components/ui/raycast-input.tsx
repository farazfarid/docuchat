import { Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { InputHTMLAttributes, forwardRef } from "react";

interface RaycastInputProps extends InputHTMLAttributes<HTMLInputElement> {
    loading?: boolean;
}

export const RaycastInput = forwardRef<HTMLInputElement, RaycastInputProps>(
    ({ className, loading, ...props }, ref) => {
        return (
            <div className="flex h-16 w-full shrink-0 items-center gap-3 border-b soft-divider bg-transparent px-4 sm:h-[68px] sm:px-6">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-border/70 bg-secondary/70">
                    <Search className={cn("h-[18px] w-[18px] text-muted-foreground", loading && "animate-pulse text-primary")} />
                </div>
                <input
                    ref={ref}
                    className={cn(
                        "h-full w-full flex-1 border-none bg-transparent text-base text-foreground outline-none placeholder:text-muted-foreground sm:text-[17px]",
                        className
                    )}
                    autoFocus
                    {...props}
                />
                <div className="hidden items-center gap-2 sm:flex">
                    <div className="flex h-7 items-center gap-2 rounded-md border border-border/70 bg-card/45 px-2.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-primary/90" />
                        <span className="text-[11px] font-semibold tracking-[0.08em] text-foreground">DOCUCHAT</span>
                    </div>
                    <div className="flex h-7 items-center rounded-md border border-border/70 bg-card/45 px-2 text-[11px] font-medium text-muted-foreground">
                        ⌘K
                    </div>
                </div>
            </div>
        );
    }
);

RaycastInput.displayName = "RaycastInput";
