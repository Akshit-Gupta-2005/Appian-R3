"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Volume2, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface TextToSpeechButtonProps {
  text: string;
  className?: string;
  size?: "default" | "sm" | "lg" | "icon";
  variant?: "default" | "outline" | "ghost";
  showOnHover?: boolean;
}

export function TextToSpeechButton({
  text,
  className,
  size = "icon",
  variant = "ghost",
  showOnHover = false,
}: TextToSpeechButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);

  const handleTextToSpeech = async () => {
    // Disable the button while loading
    if (isLoading) return;

    if (isPlaying && audio) {
      audio.pause();
      setIsPlaying(false);
      return;
    }

    setIsLoading(true);

    // This is a mock implementation - in a real app, you would call your API
    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // In a real implementation, you would:
      // 1. Call your text-to-speech API
      // 2. Get back a URL to the audio file
      // 3. Play that audio file

      // For demo purposes, we're using the browser's built-in speech synthesis
      if ("speechSynthesis" in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.9; // Slightly slower rate for better comprehension

        utterance.onend = () => {
          setIsPlaying(false);
        };

        window.speechSynthesis.cancel(); // Cancel any ongoing speech
        window.speechSynthesis.speak(utterance);
        setIsPlaying(true);
      }
    } catch (error) {
      console.error("Error converting text to speech:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      className={cn(
        "relative",
        showOnHover &&
          "opacity-0 group-hover:opacity-100 transition-opacity duration-200",
        className
      )}
      onClick={handleTextToSpeech}
      aria-label={isPlaying ? "Stop speaking" : "Read text aloud"}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Volume2 className={cn("h-4 w-4", isPlaying && "text-primary")} />
      )}
    </Button>
  );
}
