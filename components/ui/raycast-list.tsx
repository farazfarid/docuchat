import { forwardRef, HTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface RaycastListItemProps extends HTMLAttributes<HTMLDivElement> {
    active?: boolean;
    icon?: React.ReactNode;
    title: string;
    subtitle?: string;
    meta?: string;
    onSelect?: () => void;
}

export const RaycastListItem = forwardRef<HTMLDivElement, RaycastListItemProps>(
    ({ className, active, icon, title, subtitle, meta, onSelect, ...props }, ref) => {
        return (
            <div
                ref={ref}
                onClick={onSelect}
                className={cn(
                    "relative flex items-center h-10 px-3 mx-2 rounded-md cursor-pointer transition-colors group",
                    active ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-secondary/50",
                    className
                )}
                {...props}
            >
                {active && (
                    <motion.div
                        layoutId="active-item"
                        className="absolute inset-0 bg-[#353535] border-l-2 border-primary rounded-r-md -z-10" // Raycast style: dark grey bg with accent line
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                )}

                <div className={cn("flex items-center gap-3 flex-1 overflow-hidden", active ? "text-primary-foreground" : "")}>
                    {icon && <span className={cn("w-5 h-5 flex items-center justify-center opacity-70", active ? "text-white" : "text-muted-foreground")}>{icon}</span>}
                    <div className="flex items-baseline gap-2 overflow-hidden truncate">
                        <span className="font-medium truncate">{title}</span>
                        {subtitle && <span className={cn("text-xs truncate opacity-60", active ? "text-white/80" : "text-muted-foreground")}>{subtitle}</span>}
                    </div>
                </div>

                {meta && (
                    <span className={cn("text-xs ml-4 flex-shrink-0 font-medium", active ? "text-white/60" : "text-muted-foreground/40")}>
                        {meta}
                    </span>
                )}
            </div>
        );
    }
);

RaycastListItem.displayName = "RaycastListItem";
