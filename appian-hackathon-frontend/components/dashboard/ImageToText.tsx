import {
  Upload,
  CloudIcon,
  CircleAlertIcon,
  CheckCircleIcon,
  Loader2,
  FileUp,
  ScanText,
  Volume2,
} from "lucide-react";
import React, { useState, useRef, ChangeEvent, DragEvent } from "react";
import { TextSection } from "../text-section";
import { Button } from "../ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "../ui/card";
import { backendApi } from "@/lib/utils"; // Assuming this is where your axios instance is
import { Progress } from "../ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Toaster, toast } from "react-hot-toast";
import Image from "next/image";

interface ExtractedTextResponse {
  text: string;
  confidence: number;
  explanation: string;
  audio_path: string;
}

type ExtractionMethod = "tesseract" | "gemini";

const ImageToText: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [extractedText, setExtractedText] = useState<string>("");
  const [confidence, setConfidence] = useState<number>(0);
  const [explanation, setExplanation] = useState<string>("");
  const [audioPath, setAudioPath] = useState<string>("");
  const [method, setMethod] = useState<ExtractionMethod>("tesseract");
  const [dragActive, setDragActive] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    // Check if file is an image
    if (!file.type.match("image.*")) {
      toast.error(
        "Invalid file type. Please select an image file (JPEG, PNG, etc.)."
      );
      setFile(null);
      return;
    }

    // Create preview URL
    const reader = new FileReader();
    reader.onload = (e: ProgressEvent<FileReader>) => {
      if (e.target?.result) {
        setPreview(e.target.result as string);
      }
    };
    reader.readAsDataURL(file);

    setFile(file);
    // Reset previous results
    setExtractedText("");
    setConfidence(0);
    setExplanation("");
    setAudioPath("");
  };

  const handleButtonClick = (): void => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleExtract = async (): Promise<void> => {
    if (!file) return;

    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("method", method);

      const response = await backendApi.post<ExtractedTextResponse>(
        "/image-to-text",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      const { text, confidence, explanation, audio_path } = response.data;

      setExtractedText(text);
      setConfidence(confidence * 100 || 0);
      setExplanation(explanation || "");
      setAudioPath(audio_path || "");

      toast.success(
        `Text extraction complete with ${
          method === "tesseract" ? "Tesseract OCR" : "Gemini AI"
        }`
      );
    } catch (error) {
      console.error("Error extracting text:", error);
      toast.error(
        "Error extracting text. Please check the file format and try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleReadText = (): void => {
    // if already playing, stop it
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
      return;
    }

    if (audioPath) {
      // Play the audio if available
      const audio = new Audio(audioPath);
      audio.onerror = () => {
        toast.error("Error playing audio. Please try again.");
      };
      audio.play();
    } else if (extractedText) {
      // Use browser's TTS if no audio path
      const utterance = new SpeechSynthesisUtterance(extractedText);
      window.speechSynthesis.speak(utterance);
      toast.error("No audio available. Using browser's text-to-speech.");
    }
  };

  const clearAll = (): void => {
    setFile(null);
    setPreview(null);
    setExtractedText("");
    setConfidence(0);
    setExplanation("");
    setAudioPath("");
  };

  return (
    <Card>
      <CardHeader>
        <TextSection>
          <CardTitle className="text-2xl">Image to Text</CardTitle>
          <CardDescription className="text-base">
            Upload an image containing text to extract and convert it to
            readable text.
          </CardDescription>
        </TextSection>
      </CardHeader>
      <CardContent className="space-y-6">
        <Tabs
          defaultValue="tesseract"
          onValueChange={(value) => setMethod(value as ExtractionMethod)}
        >
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="tesseract">Tesseract OCR</TabsTrigger>
            <TabsTrigger value="gemini">Gemini AI</TabsTrigger>
          </TabsList>
          <TabsContent value="tesseract">
            <p className="text-sm text-muted-foreground mb-4">
              Tesseract is an open-source OCR engine that works best with clear,
              high-contrast images.
            </p>
          </TabsContent>
          <TabsContent value="gemini">
            <p className="text-sm text-muted-foreground mb-4">
              Gemini AI uses advanced machine learning to extract text from
              images with higher accuracy, especially for complex layouts or
              handwriting.
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
            accept="image/*"
            className="hidden"
            onChange={handleChange}
          />

          {!preview ? (
            <>
              <div className="flex flex-col items-center justify-center space-y-4">
                <Upload className="h-12 w-12 text-muted-foreground" />
                <TextSection>
                  <h3 className="text-lg font-medium">
                    Drag and drop your image here
                  </h3>
                  <p className="text-muted-foreground mt-2 mb-4">
                    Supports JPG, PNG, GIF (under 5MB)
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
              <div className="relative w-full flex justify-center">
                <div className="relative inline-block">
                  <Image
                    src={preview}
                    alt="Preview"
                    className="rounded-md shadow-md object-contain max-h-64 w-auto"
                    height={512}
                    width={512}
                    style={{ maxWidth: "100%" }}
                  />
                  <Button
                    variant="secondary"
                    size="sm"
                    className="absolute -top-4 -right-4 h-8 w-8 p-0 rounded-full bg-gray-800/30 hover:bg-gray-800/70 text-white cursor-pointer"
                    onClick={clearAll}
                  >
                    ✕
                  </Button>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                {file?.name} ({Math.round((file?.size || 1024) / 1024)} KB)
              </p>
            </div>
          )}
        </div>

        {file && (
          <div className="space-y-4">
            <div className="flex justify-between flex-wrap gap-2">
              <Button
                disabled={isLoading || !file}
                className="group flex items-center cursor-pointer"
                onClick={handleExtract}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <ScanText className="w-4 h-4 mr-2" />
                    Extract Text
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                disabled={!extractedText}
                className="group flex items-center cursor-pointer"
                onClick={handleReadText}
              >
                Read Extracted Text
                {audioPath && <Volume2 className="w-4 h-4 ml-2 text-black" />}
              </Button>
            </div>

            {isLoading && (
              <div className="space-y-2">
                <Progress value={45} className="h-2" />
                <p className="text-sm text-center text-muted-foreground">
                  Processing image...
                </p>
              </div>
            )}

            {extractedText && (
              <div className="border rounded-md p-4 bg-muted/30">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium">Extracted Text</h3>
                  {confidence > 0 && (
                    <div className="flex items-center text-sm">
                      <div
                        className={`mr-2 ${
                          confidence > 80
                            ? "text-green-500"
                            : confidence > 50
                            ? "text-yellow-500"
                            : "text-red-500"
                        }`}
                      >
                        {confidence > 80 ? (
                          <CheckCircleIcon className="h-4 w-4" />
                        ) : confidence > 50 ? (
                          <CircleAlertIcon className="h-4 w-4" />
                        ) : (
                          <CircleAlertIcon className="h-4 w-4" />
                        )}
                      </div>
                      Confidence: {Math.round(confidence)}%
                    </div>
                  )}
                </div>
                <div className="bg-card p-3 rounded border whitespace-pre-wrap max-h-64 overflow-y-auto">
                  {extractedText || "No text extracted"}
                </div>
                {explanation && (
                  <p className="text-sm text-muted-foreground mt-2">
                    {explanation}
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

export default ImageToText;
