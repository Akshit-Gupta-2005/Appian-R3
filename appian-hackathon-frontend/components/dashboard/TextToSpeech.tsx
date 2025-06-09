import { Headphones, Download } from "lucide-react";
import React, { useState, useEffect, useRef } from "react";
import { TextSection } from "../text-section";
import { Button } from "../ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "../ui/card";
import { backendApi } from "@/lib/utils";
import { Toaster, toast } from "react-hot-toast";

const TextToSpeech = () => {
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(
    null
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [text, setText] = useState("");
  const audioInitialized = useRef(false);

  // Create the audio element once on component mount
  useEffect(() => {
    // Only initialize audio when needed
    const audio = new Audio();
    audio.onplay = () => setIsPlaying(true);
    audio.onpause = () => setIsPlaying(false);
    audio.onended = () => setIsPlaying(false);
    audio.onerror = (e) => {
      // Only show error if we're actually trying to play something
      if (audioInitialized.current) {
        console.error("Audio error:", e);
        toast.error("Error playing audio. Please try again.");
      }
      setIsPlaying(false);
    };
    setAudioElement(audio);

    // Cleanup
    return () => {
      if (audio) {
        audio.pause();
        audio.src = "";
      }
    };
  }, []);

  const handleTextToSpeech = async () => {
    if (!text.trim()) {
      toast.error("Please enter some text to read aloud.");
      return;
    }

    audioInitialized.current = true;
    setIsLoading(true);

    try {
      const { data } = await backendApi.post("/text-to-speech", { text });

      console.log("Received audio URL:", data);

      if (data.success && data.audio_url && audioElement) {
        // Set the new URL and play
        setAudioUrl(data.audio_url);

        // Use a timestamp to prevent caching issues
        const urlWithTimestamp = `${data.audio_url}${
          data.audio_url.includes("?") ? "&" : "?"
        }_t=${Date.now()}`;

        audioElement.src = urlWithTimestamp;

        // Explicitly wait for audio to load before playing
        audioElement.oncanplaythrough = () => {
          const playPromise = audioElement.play();
          if (playPromise !== undefined) {
            playPromise
              .then(() => {
                console.log("Audio started playing successfully");
              })
              .catch((error) => {
                console.error("Error playing audio:", error);
                toast.error("Playback failed. Check browser permissions.");
              });
          }
        };

        audioElement.load();
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (error) {
      console.error("Error processing text:", error);
      toast.error("Server error. Falling back to browser TTS.");

      // Fallback to browser's built-in TTS
      if (window.speechSynthesis) {
        const speech = new SpeechSynthesisUtterance(text);
        speech.lang = "en-US";
        window.speechSynthesis.speak(speech);
      } else {
        toast.error("Text-to-speech is not supported in your browser.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadAudio = () => {
    if (!audioUrl) {
      toast.error("No audio available to download. Generate audio first.");
      return;
    }

    // Create a temporary anchor element
    const a = document.createElement("a");
    a.href = audioUrl;
    a.target = "_blank"; // Open in a new tab
    a.rel = "noopener noreferrer"; // Security best practice
    a.download = `tts-audio-${Date.now()}.mp3`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    toast.success("Audio download started!");
  };

  const togglePlayPause = () => {
    if (!audioElement) return;

    audioInitialized.current = true;

    if (isPlaying) {
      audioElement.pause();
    } else if (audioUrl) {
      audioElement.play().catch((error) => {
        console.error("Play error:", error);
        toast.error("Playback error. Try generating audio again.");
      });
    } else {
      handleTextToSpeech();
    }
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <TextSection>
          <CardTitle className="text-2xl font-bold text-slate-800">
            Text to Speech
          </CardTitle>
          <CardDescription className="text-base text-slate-600">
            Enter or paste text below and click the play button to hear it read
            aloud.
          </CardDescription>
        </TextSection>
      </CardHeader>
      <CardContent className="space-y-4 p-6">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="w-full min-h-[200px] p-4 rounded-md border border-slate-300 text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
          placeholder="Enter or paste your text here..."
        ></textarea>

        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <Button
            onClick={togglePlayPause}
            className={`flex items-center justify-center gap-2 py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors ${
              isLoading ? "cursor-not-allowed opacity-70" : "cursor-pointer"
            }`}
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="animate-spin h-5 w-5 border-4 border-t-transparent rounded-full border-white"></div>
            ) : (
              <Headphones className="h-5 w-5" />
            )}
            <span>
              {isLoading
                ? "Processing..."
                : isPlaying
                ? "Pause"
                : audioUrl
                ? "Resume"
                : "Read Aloud"}
            </span>
          </Button>

          <Button
            onClick={handleDownloadAudio}
            variant="outline"
            className={`flex items-center justify-center gap-2 py-2 px-4 border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-md transition-colors disabled:cursor-not-allowed ${
              !audioUrl ? "cursor-not-allowed opacity-50" : "cursor-pointer"
            }`}
            disabled={!audioUrl || isLoading}
          >
            <Download className="h-5 w-5" />
            <span>Download Audio</span>
          </Button>
        </div>

        {audioUrl && (
          <div className="mt-4 p-3 bg-slate-100 rounded-md text-sm text-slate-600">
            Audio ready! You can play it again or download the file.
          </div>
        )}
      </CardContent>
      <Toaster position="bottom-right" />
    </Card>
  );
};

export default TextToSpeech;
