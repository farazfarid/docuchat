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
                    "group relative mx-2 flex h-12 cursor-pointer items-center rounded-xl px-3.5 transition-colors sm:mx-3 sm:h-11 sm:px-4",
                    active ? "text-foreground" : "text-foreground hover:bg-card/60",
                    className
                )}
                {...props}
            >
                {active && (
                    <motion.div
                        layoutId="active-item"
                        className="absolute inset-0 -z-10 rounded-xl border border-primary/35 bg-gradient-to-r from-primary/22 to-primary/6 shadow-[0_8px_24px_rgba(38,176,104,0.24)]"
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                )}

                <div className="flex flex-1 items-center gap-3 overflow-hidden">
                    {icon && (
                        <span
                            className={cn(
                                "flex h-8 w-8 items-center justify-center rounded-lg border border-border/65 bg-card/45 text-muted-foreground",
                                active && "bg-primary/12 text-primary ring-primary/35"
                            )}
                        >
                            {icon}
                        </span>
                    )}
                    <div className="flex items-baseline gap-2 overflow-hidden truncate">
                        <span className="truncate text-[14px] font-medium">{title}</span>
                        {subtitle && (
                            <span className={cn("truncate text-xs", active ? "text-foreground" : "text-muted-foreground")}>
                                {subtitle}
                            </span>
                        )}
                    </div>
                </div>

                {meta && (
                    <span className={cn("ml-4 shrink-0 text-xs font-medium", active ? "text-foreground" : "text-muted-foreground")}>
                        {meta}
                    </span>
                )}
            </div>
        );
    }
);

RaycastListItem.displayName = "RaycastListItem";
