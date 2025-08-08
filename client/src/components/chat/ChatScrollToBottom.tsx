import { ArrowBigDownIcon } from "lucide-react";

interface ChatScrollToBottomProps {
  onClick: () => void;
}

export function ChatScrollToBottom({ onClick }: ChatScrollToBottomProps) {
  return (
    <div className="absolute bottom-4 right-4 mr-1 mb-0">
      <button
        type="button"
        className="rounded-full bg-background/80 shadow-md p-2 flex items-center justify-center bg-primary/20 hover:bg-primary/40 transition-colors cursor-pointer"
        onClick={onClick}
        aria-label="Scroll to bottom"
      >
        <ArrowBigDownIcon
          size={28}
          className="text-muted-foreground hover:text-primary transition-colors"
        />
      </button>
    </div>
  );
}
