import {
  Upload,
  CloudIcon,
  CheckCircleIcon,
  Loader2,
  FileUp,
  Video,
  Languages,
  FileText,
  Download,
  Play,
  Pause,
  Volume2,
  VolumeX,
} from "lucide-react";
import React, {
  useState,
  useRef,
  ChangeEvent,
  DragEvent,
  useEffect,
} from "react";
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
import { Progress } from "../ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Toaster, toast } from "react-hot-toast";
import { Badge } from "../ui/badge";
import Markdown from "react-markdown";

interface ProcessingResponse {
  task_id: string;
  message: string;
  file_path: string;
}

interface ProcessingResult {
  task_id: string;
  status: string;
  result?: {
    text?: string;
    segments?: Array<{
      start: number;
      end: number;
      text: string;
    }>;
    language?: string;
    confidence?: number;
    summary?: string;
    translation?: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any;
  };
  error?: string;
}

type ProcessingType = "transcription" | "translation" | "summarization";

const VideoSummarization: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [processType, setProcessType] =
    useState<ProcessingType>("summarization");
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [taskId, setTaskId] = useState<string>("");
  const [result, setResult] = useState<ProcessingResult | null>(null);
  console.log(result);
  const [progress, setProgress] = useState<number>(0);
  const [isPolling, setIsPolling] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const processTypeConfig = {
    transcription: {
      title: "Video Transcription",
      description: "Extract speech from video files and convert to text",
      icon: Video,
      acceptedFormats: "MP4, AVI, MOV, MKV, WebM",
    },
    translation: {
      title: "Video Translation",
      description: "Translate speech in video files to English text",
      icon: Languages,
      acceptedFormats: "MP4, AVI, MOV, MKV, WebM",
    },
    summarization: {
      title: "Video Summarization",
      description: "Generate concise summaries from video content",
      icon: FileText,
      acceptedFormats: "MP4, AVI, MOV, MKV, WebM",
    },
  };

  const currentConfig = processTypeConfig[processType];
  const IconComponent = currentConfig.icon;

  const handleDrag = (e: DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    e.stopPropagation();

    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>): void => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file: File): void => {
    // Check if file is video
    const videoTypes = [
      "video/mp4",
      "video/avi",
      "video/mov",
      "video/quicktime",
      "video/x-msvideo",
      "video/mkv",
      "video/webm",
    ];
    const isVideoFile =
      videoTypes.some((type) => file.type.includes(type)) ||
      /\.(mp4|avi|mov|mkv|webm)$/i.test(file.name);

    if (!isVideoFile) {
      toast.error(
        "Invalid file type. Please select a video file (MP4, AVI, MOV, MKV, WebM)."
      );
      return;
    }

    // Check file size (limit to 100MB for example)
    const maxSize = 100 * 1024 * 1024; // 100MB
    if (file.size > maxSize) {
      toast.error("File too large. Please select a video under 100MB.");
      return;
    }

    setFile(file);

    // Create video URL for preview
    const url = URL.createObjectURL(file);
    setVideoUrl(url);

    // Reset previous results
    setResult(null);
    setTaskId("");
    setProgress(0);
    setCurrentTime(0);
    setDuration(0);
  };

  const handleButtonClick = (): void => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const togglePlayPause = (): void => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = (): void => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleVideoTimeUpdate = (): void => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleVideoLoadedMetadata = (): void => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const formatTime = (time: number): string => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const pollTaskStatus = async (taskId: string) => {
    try {
      const response = await backendApi.get<ProcessingResult>(
        `/process/${taskId}`
      );
      const taskResult = response.data;

      setResult(taskResult);

      if (taskResult.status === "completed") {
        setIsPolling(false);
        setIsLoading(false);
        setProgress(100);
        toast.success(
          `${
            processType.charAt(0).toUpperCase() + processType.slice(1)
          } completed successfully!`
        );
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
        }
      } else if (taskResult.status === "failed") {
        setIsPolling(false);
        setIsLoading(false);
        toast.error(
          `${
            processType.charAt(0).toUpperCase() + processType.slice(1)
          } failed: ${taskResult.error}`
        );
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
        }
      } else if (taskResult.status === "processing") {
        // Update progress (simulate progress based on time)
        setProgress((prev) => Math.min(prev + 3, 90));
      }
    } catch (error) {
      console.error("Error polling task status:", error);
      toast.error("Error checking task status");
      setIsPolling(false);
      setIsLoading(false);
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    }
  };

  const handleProcess = async (): Promise<void> => {
    if (!file) return;

    setIsLoading(true);
    setIsPolling(true);
    setProgress(10);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await backendApi.post<ProcessingResponse>(
        `/process/${processType}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setTaskId(response.data.task_id);
      setProgress(20);

      toast.success(
        `${
          processType.charAt(0).toUpperCase() + processType.slice(1)
        } started. Processing in background...`
      );

      // Start polling for results
      pollingIntervalRef.current = setInterval(() => {
        pollTaskStatus(response.data.task_id);
      }, 3000); // Poll every 3 seconds for video processing
    } catch (error) {
      console.error(`Error starting ${processType}:`, error);
      toast.error(`Error starting ${processType}. Please try again.`);
      setIsLoading(false);
      setIsPolling(false);
    }
  };

  const downloadResult = (): void => {
    if (result?.result) {
      const text =
        result.result.text ||
        result.result.summary ||
        result.result.translation ||
        "";
      const blob = new Blob([text], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${processType}_result.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const clearAll = (): void => {
    setFile(null);
    if (videoUrl) {
      URL.revokeObjectURL(videoUrl);
      setVideoUrl(null);
    }
    setResult(null);
    setTaskId("");
    setProgress(0);
    setIsLoading(false);
    setIsPolling(false);
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
      if (videoUrl) {
        URL.revokeObjectURL(videoUrl);
      }
    };
  }, [videoUrl]);

  return (
    <Card>
      <CardHeader>
        <TextSection>
          <CardTitle className="text-2xl flex items-center gap-2">
            <IconComponent className="h-6 w-6" />
            {currentConfig.title}
          </CardTitle>
          <CardDescription className="text-base">
            {currentConfig.description}
          </CardDescription>
        </TextSection>
      </CardHeader>
      <CardContent className="space-y-6">
        <Tabs
          value={processType}
          onValueChange={(value) => setProcessType(value as ProcessingType)}
        >
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="transcription">Transcription</TabsTrigger>
            <TabsTrigger value="translation">Translation</TabsTrigger>
            <TabsTrigger value="summarization">Summarization</TabsTrigger>
          </TabsList>
          <TabsContent value="transcription">
            <p className="text-sm text-muted-foreground mb-4">
              Extract speech from video files and convert to accurate text
              transcriptions using Whisper AI.
            </p>
          </TabsContent>
          <TabsContent value="translation">
            <p className="text-sm text-muted-foreground mb-4">
              Translate speech from any language in video files to English text
              automatically.
            </p>
          </TabsContent>
          <TabsContent value="summarization">
            <p className="text-sm text-muted-foreground mb-4">
              Generate concise summaries from video content by analyzing the
              audio track.
            </p>
          </TabsContent>
        </Tabs>

        <div
          className={`relative border-2 ${
            dragActive ? "border-primary" : "border-dashed"
          } rounded-md p-8 text-center transition-colors ${
            dragActive ? "bg-primary/5" : ""
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="video/*"
            className="hidden"
            onChange={handleChange}
          />

          {!file ? (
            <>
              <div className="flex flex-col items-center justify-center space-y-4">
                <Upload className="h-12 w-12 text-muted-foreground" />
                <TextSection>
                  <h3 className="text-lg font-medium">
                    Drag and drop your video file here
                  </h3>
                  <p className="text-muted-foreground mt-2 mb-4">
                    Supports {currentConfig.acceptedFormats} (under 100MB)
                  </p>
                </TextSection>
                <div className="flex flex-wrap gap-3 justify-center">
                  <Button
                    onClick={handleButtonClick}
                    className="group flex items-center cursor-pointer gap-2"
                  >
                    <FileUp className="h-4 w-4" />
                    Browse Files
                  </Button>
                  <Button
                    variant="outline"
                    className="flex items-center cursor-pointer gap-2"
                  >
                    <CloudIcon className="h-4 w-4" />
                    Import from Cloud
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="space-y-4">
              <div className="relative w-full max-w-2xl mx-auto">
                <video
                  ref={videoRef}
                  src={videoUrl || undefined}
                  className="w-full rounded-lg shadow-lg"
                  onTimeUpdate={handleVideoTimeUpdate}
                  onLoadedMetadata={handleVideoLoadedMetadata}
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                />

                {/* Video Controls */}
                <div className="absolute bottom-4 left-4 right-4 bg-black/50 rounded-lg p-3">
                  <div className="flex items-center gap-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={togglePlayPause}
                      className="text-white hover:bg-white/20"
                    >
                      {isPlaying ? (
                        <Pause className="h-4 w-4" />
                      ) : (
                        <Play className="h-4 w-4" />
                      )}
                    </Button>

                    <div className="flex-1 flex items-center gap-2 text-white text-sm">
                      <span>{formatTime(currentTime)}</span>
                      <div className="flex-1 h-1 bg-white/30 rounded">
                        <div
                          className="h-full bg-white rounded transition-all"
                          style={{
                            width: `${
                              duration > 0 ? (currentTime / duration) * 100 : 0
                            }%`,
                          }}
                        />
                      </div>
                      <span>{formatTime(duration)}</span>
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={toggleMute}
                      className="text-white hover:bg-white/20"
                    >
                      {isMuted ? (
                        <VolumeX className="h-4 w-4" />
                      ) : (
                        <Volume2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <Button
                  variant="secondary"
                  size="sm"
                  className="absolute -top-4 -right-4 h-8 w-8 p-0 rounded-full bg-gray-800/70 hover:bg-gray-800/90 text-white cursor-pointer"
                  onClick={clearAll}
                >
                  ✕
                </Button>
              </div>

              <div className="text-center">
                <p className="font-medium">{file.name}</p>
                <p className="text-sm text-muted-foreground">
                  {Math.round(file.size / (1024 * 1024))} MB
                </p>
              </div>
            </div>
          )}
        </div>

        {file && (
          <div className="space-y-4">
            <div className="flex justify-between flex-wrap gap-2">
              <Button
                disabled={isLoading || !file}
                className="group flex items-center cursor-pointer"
                onClick={handleProcess}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <IconComponent className="w-4 h-4 mr-2" />
                    Start{" "}
                    {processType.charAt(0).toUpperCase() + processType.slice(1)}
                  </>
                )}
              </Button>

              {result?.result && (
                <Button
                  variant="outline"
                  className="group flex items-center cursor-pointer"
                  onClick={downloadResult}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download Result
                </Button>
              )}
            </div>

            {taskId && (
              <div className="text-sm text-muted-foreground">
                <span className="font-medium">Task ID:</span> {taskId}
              </div>
            )}

            {(isLoading || isPolling) && (
              <div className="space-y-2">
                <Progress value={progress} className="h-2" />
                <p className="text-sm text-center text-muted-foreground">
                  {result?.status === "processing"
                    ? "Processing video content..."
                    : "Uploading and initializing..."}
                </p>
              </div>
            )}

            {result && (
              <div className="border rounded-md p-4 bg-muted/30">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium">Transcription Result</h3>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={
                        result.status === "completed"
                          ? "default"
                          : result.status === "failed"
                          ? "destructive"
                          : "secondary"
                      }
                    >
                      {result.status}
                    </Badge>
                    {result.result?.confidence && (
                      <div className="flex items-center text-sm">
                        <CheckCircleIcon className="h-4 w-4 mr-1 text-green-500" />
                        {Math.round(result.result.confidence * 100)}%
                      </div>
                    )}
                  </div>
                </div>

                {result.status === "completed" && result.result && (
                  <div className="bg-card p-3 rounded border whitespace-pre-wrap max-h-64 overflow-y-auto">
                    {result.result.transcript || "No content generated"}
                  </div>
                )}

                {/* summary or translation */}
                {result.status === "completed" && result.result && (
                  <>
                    <div className="flex items-center justify-between mt-4">
                      <h3 className="font-medium">
                        {processType.charAt(0).toUpperCase() +
                          processType.slice(1)}{" "}
                        Result
                      </h3>
                      <Badge variant="default">
                        {result.result?.language || "Unknown"}
                      </Badge>
                    </div>
                    <div className="bg-card p-3 rounded border whitespace-pre-wrap max-h-64 overflow-y-auto my-4">
                      <Markdown>
                        {result.result.summary ||
                          result.result.translation ||
                          "No content generated"}
                      </Markdown>
                    </div>
                  </>
                )}
                {result.status === "failed" && result.error && (
                  <div className="bg-destructive/10 text-destructive p-3 rounded border">
                    Error: {result.error}
                  </div>
                )}

                {result.result?.language && (
                  <p className="text-sm text-muted-foreground mt-2">
                    Detected language: {result.result.language}
                  </p>
                )}

                {result.result?.segments && (
                  <p className="text-sm text-muted-foreground mt-2">
                    {result.result.segments.length} segments processed
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </CardContent>
      <Toaster position="bottom-right" />
    </Card>
  );
};

export default VideoSummarization;
