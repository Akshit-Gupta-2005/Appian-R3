import type React from "react";
import { TextToSpeechButton } from "@/components/text-to-speech-button";
import { cn } from "@/lib/utils";

interface TextSectionProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export function TextSection({ title, children, className }: TextSectionProps) {
  // Combine all text content for the text-to-speech
  const extractText = (node: React.ReactNode): string => {
    if (typeof node === "string") return node;
    if (typeof node === "number") return String(node);
    if (!node) return "";

    if (Array.isArray(node)) {
      return node.map(extractText).join(" ");
    }

    if (typeof node === "object" && "props" in node) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { children } = node.props as any;
      return extractText(children);
    }

    return "";
  };

  const allText = (title ? title + ". " : "") + extractText(children);

  return (
    <div className={cn("group relative", className)}>
      {title && (
        <h2 className="text-3xl md:text-4xl font-bold tracking-wide mb-4">
          {title}
        </h2>
      )}
      <div className="relative">
        {children}
        <div className="absolute top-0 right-0">
          <TextToSpeechButton
            text={allText}
            showOnHover
            className="opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          />
        </div>
      </div>
    </div>
  );
}
