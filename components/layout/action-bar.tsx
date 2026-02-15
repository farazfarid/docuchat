import { cn } from "@/lib/utils";

interface ActionItem {
    label: string;
    shortcut?: string[]; // e.g. ['⌘', 'K']
    primary?: boolean;
}

interface ActionBarProps {
    actions: ActionItem[];
    className?: string;
}

export function ActionBar({ actions, className }: ActionBarProps) {
    return (
        <div className={cn(
            "flex min-h-11 items-center justify-between gap-3 border-t soft-divider bg-card/30 px-4 py-2 backdrop-blur-xl select-none sm:px-5",
            className
        )}>
            <div className="flex items-center gap-2 text-[11px] font-medium text-muted-foreground">
                <div className="flex h-5 w-5 items-center justify-center rounded bg-secondary/70 ring-1 ring-border/70">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary/85" />
                </div>
                <span className="hidden sm:inline">Ready</span>
            </div>

            <div className="no-scrollbar flex items-center gap-2 overflow-x-auto">
                {actions.map((action, index) => (
                    <div key={index} className="flex items-center gap-2">
                        {index > 0 && <div className="h-3 w-[1px] bg-border/75" />}
                        <div className="flex items-center gap-1.5 whitespace-nowrap rounded-md border border-border/70 bg-card/45 px-2 py-1">
                            <span className={cn("text-xs", action.primary ? "font-semibold text-foreground" : "font-medium text-muted-foreground")}>
                                {action.label}
                            </span>
                            {action.shortcut && (
                                <div className="hidden gap-1 sm:flex">
                                    {action.shortcut.map((key, kIndex) => (
                                        <div
                                            key={kIndex}
                                            className="flex h-5 min-w-[20px] items-center justify-center rounded-[4px] border border-border/70 bg-secondary/85 px-1.5 text-[10px] font-bold text-foreground"
                                        >
                                            {key}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
