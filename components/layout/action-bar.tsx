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
            "h-10 border-t border-white/10 flex items-center px-4 justify-between bg-[#1f1f1f]/95 backdrop-blur-md rounded-b-xl select-none",
            className
        )}>
            <div className="flex items-center gap-2 text-[11px] font-medium text-muted-foreground/50">
                <div className="w-5 h-5 rounded bg-white/10 flex items-center justify-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-white/20" />
                </div>
            </div>

            <div className="flex items-center gap-4">
                {actions.map((action, index) => (
                    <div key={index} className="flex items-center gap-3">
                        {index > 0 && <div className="w-[1px] h-3 bg-white/10" />}
                        <div className="flex items-center gap-2">
                            <span className={cn("text-xs font-medium", action.primary ? "text-foreground" : "text-muted-foreground")}>
                                {action.label}
                            </span>
                            {action.shortcut && (
                                <div className="flex gap-1">
                                    {action.shortcut.map((key, kIndex) => (
                                        <div
                                            key={kIndex}
                                            className="h-5 min-w-[20px] px-1.5 flex items-center justify-center rounded-[4px] bg-[#3a3a3a] text-white/90 text-[10px] font-bold shadow-sm border-b border-black/20"
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
