import { Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { InputHTMLAttributes, forwardRef } from "react";

interface RaycastInputProps extends InputHTMLAttributes<HTMLInputElement> {
    loading?: boolean;
}

export const RaycastInput = forwardRef<HTMLInputElement, RaycastInputProps>(
    ({ className, loading, ...props }, ref) => {
        return (
            <div className="h-14 border-b border-border flex items-center px-4 gap-3 bg-transparent shrink-0 w-full">
                <Search className={cn("w-5 h-5 text-muted-foreground", loading && "animate-pulse text-primary")} />
                <input
                    ref={ref}
                    className={cn(
                        "flex-1 bg-transparent border-none outline-none text-lg placeholder:text-muted-foreground h-full w-full",
                        className
                    )}
                    autoFocus // Raycast always focuses input
                    {...props}
                />
                <div className="flex items-center gap-2">
                    <div className="h-6 px-2 bg-[#2C2C2C] rounded-[4px] flex items-center gap-1.5 border border-white/5 shadow-sm">
                        <span className="text-[10px] font-medium text-muted-foreground/80">DOCUCHAT</span>
                        <div className="w-3 h-3 flex items-center justify-center bg-white/10 rounded-sm">
                            <span className="text-[8px] text-white">📖</span>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
);

RaycastInput.displayName = "RaycastInput";
