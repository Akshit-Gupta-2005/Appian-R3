import React, { useState } from "react";
import { TextSection } from "../text-section";
import { Button } from "../ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "../ui/card";
import { Loader2, RotateCcw, SpellCheck2 } from "lucide-react";
import { toast, Toaster } from "react-hot-toast";
import { backendApi } from "@/lib/utils"; // Adjust the import based on your project structure

const SpellingHelper = () => {
  const [userText, setUserText] = useState("");
  const [correctedText, setCorrectedText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Handle text input changes
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setUserText(e.target.value);
    // Reset correction when input changes
    if (correctedText) {
      setCorrectedText("");
    }
    if (error) {
      setError(null);
    }
  };

  // Check spelling and grammar
  const handleSpellCheck = async () => {
    if (!userText.trim()) {
      setError("Please enter some text to check spelling and grammar.");
      toast.error("Please enter some text to check spelling and grammar.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await backendApi.post("/spell-correct", {
        text: userText,
      });

      setCorrectedText(response.data.corrected_text);
      toast.success("Text has been checked for spelling and grammar errors.");
    } catch (err) {
      console.error("Error checking spelling:", err);
      setError("Failed to check spelling. Please try again later.");

      toast.error("Failed to check spelling. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  // Apply corrections
  const applyCorrections = () => {
    if (correctedText) {
      setUserText(correctedText);
      setCorrectedText("");
      setError(null);
      // Show toast notification on success
      toast.success("Spelling and grammar corrections have been applied!");
    }
  };

  // Reset everything
  const handleReset = () => {
    setUserText("");
    setCorrectedText("");
    setError(null);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <TextSection>
          <CardTitle className="text-2xl">Spell Checker</CardTitle>
          <CardDescription className="text-base text-spacing">
            Enter text to get spelling and grammar corrections.
          </CardDescription>
        </TextSection>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative">
          <textarea
            className="w-full min-h-[200px] p-4 rounded-md border text-spacing text-lg"
            placeholder="Enter your text here for spelling and grammar suggestions..."
            value={userText}
            onChange={handleTextChange}
            disabled={isLoading}
          ></textarea>

          {correctedText && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-md">
              <h3 className="font-medium mb-2 text-green-800">
                Corrected Text:
              </h3>
              <div className="text-spacing text-lg">{correctedText}</div>
            </div>
          )}

          {error && <div className="mt-2 text-red-500 text-sm">{error}</div>}
        </div>

        <div className="flex flex-wrap gap-2 justify-between">
          <div className="flex gap-2">
            <Button
              className="group flex items-center cursor-pointer"
              onClick={handleSpellCheck}
              disabled={isLoading || !userText.trim()}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Checking...
                </>
              ) : (
                <>
                  <SpellCheck2 className="mr-2 h-4 w-4" />
                  Check Spelling
                </>
              )}
            </Button>

            {correctedText && (
              <Button
                variant="secondary"
                className="group flex items-center"
                onClick={applyCorrections}
              >
                Apply Corrections
              </Button>
            )}
          </div>

          <div>
            <Button
              variant="outline"
              className="group flex items-center cursor-pointer"
              onClick={handleReset}
              disabled={isLoading}
            >
              Reset
              <RotateCcw className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>

      <Toaster
        position="bottom-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: "#333",
            color: "#fff",
          },
        }}
      />
    </Card>
  );
};

export default SpellingHelper;
