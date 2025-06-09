"use client";

import { Button } from "@/components/ui/button";
import { TextToSpeechButton } from "@/components/text-to-speech-button";
import { FeatureCard } from "@/components/feature-card";
import { TextSection } from "@/components/text-section";
import { MobileNav } from "@/components/mobile-nav";
import {
  FileText,
  Image,
  MessageSquare,
  Headphones,
  BookOpen,
  ArrowRight,
  Flame,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useRef } from "react";

export default function Home() {
  // Navigation items
  const navItems = [
    { href: "#features", label: "Features" },
    { href: "#how-it-works", label: "How It Works" },
    { href: "#get-started", label: "Get Started" },
  ];

  // Refs for scroll functionality
  const featuresRef = useRef<HTMLElement>(null);
  const howItWorksRef = useRef<HTMLElement>(null);
  const getStartedRef = useRef<HTMLElement>(null);

  // Handle smooth scrolling for anchor links
  useEffect(() => {
    const handleAnchorClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest("a");

      if (!anchor) return;

      const href = anchor.getAttribute("href");
      if (!href?.startsWith("#")) return;

      e.preventDefault();

      let targetElement: HTMLElement | null = null;

      switch (href) {
        case "#features":
          targetElement = featuresRef.current;
          break;
        case "#how-it-works":
          targetElement = howItWorksRef.current;
          break;
        case "#get-started":
          targetElement = getStartedRef.current;
          break;
      }

      if (targetElement) {
        targetElement.scrollIntoView({ behavior: "smooth" });
      }
    };

    document.addEventListener("click", handleAnchorClick);

    return () => {
      document.removeEventListener("click", handleAnchorClick);
    };
  }, []);

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold group flex items-center">
              ReadEase
              <TextToSpeechButton
                text="ReadEase"
                className="ml-1"
                showOnHover
              />
            </span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-lg font-medium transition-colors hover:text-primary group flex items-center"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Mobile Navigation */}
          <MobileNav items={navItems} />

          <div className="hidden md:flex items-center gap-4">
            <Button asChild>
              <Link href="/dashboard" className="group flex items-center">
                Start Using ReadEase
                <ArrowRight className="h-4 w-4 text-white" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-20 md:py-28 bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-background">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center text-center space-y-8">
              <TextSection className="space-y-4 max-w-3xl">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-wide text-spacing">
                  Reading Tools for Dyslexic Users
                </h1>
                <p className="text-xl md:text-2xl text-muted-foreground text-spacing">
                  Text-to-speech, PDF reading, image-to-text, and spelling tools
                  designed for dyslexic users.
                </p>
              </TextSection>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" asChild>
                  <Link href="/dashboard" className="group flex items-center">
                    Get Started
                    <Flame className="h-4 w-4 text-white group-hover:text-red-400 transition-colors duration-200" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="#features" className="group flex items-center">
                    Learn More
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section ref={featuresRef} id="features" className="py-16 md:py-24">
          <div className="container px-4 md:px-6">
            <TextSection
              title="Our Features"
              className="flex flex-col items-center text-center space-y-4 mb-12"
            >
              <p className="text-xl text-muted-foreground max-w-3xl text-spacing">
                Tools designed to make reading and writing easier for people
                with dyslexia.
              </p>
            </TextSection>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <FeatureCard
                title="Text to Speech"
                description="Convert any text to speech with a single click. Listen to articles, books, or any text content."
                icon={Headphones}
              />
              <FeatureCard
                title="PDF Reader"
                description="Upload PDF files and have them read aloud to you. Download audio versions for later listening."
                icon={FileText}
              />
              <FeatureCard
                title="Image to Text"
                description="Extract text from images and photos. Convert printed materials into digital text that can be read aloud."
                icon={Image}
              />
              <FeatureCard
                title="Spell Checker"
                description="Get spelling corrections and text improvements. Enhance your writing with smart suggestions."
                icon={MessageSquare}
              />
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section
          ref={howItWorksRef}
          id="how-it-works"
          className="py-16 md:py-24 bg-muted"
        >
          <div className="container px-4 md:px-6">
            <TextSection
              title="How It Works"
              className="flex flex-col items-center text-center space-y-4 mb-12"
            >
              <p className="text-xl text-muted-foreground max-w-3xl text-spacing">
                Simple steps to start using our tools and make reading easier.
              </p>
            </TextSection>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <div className="flex flex-col items-center text-center space-y-4 group relative">
                <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-2xl font-bold">
                  1
                </div>
                <TextSection>
                  <h3 className="text-xl font-bold">Choose a Tool</h3>
                  <p className="text-spacing">
                    Select from our range of tools designed for dyslexic
                    readers.
                  </p>
                </TextSection>
              </div>
              <div className="flex flex-col items-center text-center space-y-4 group relative">
                <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-2xl font-bold">
                  2
                </div>
                <TextSection>
                  <h3 className="text-xl font-bold">Upload or Enter Text</h3>
                  <p className="text-spacing">
                    Upload a PDF, image, or enter text directly into the tool.
                  </p>
                </TextSection>
              </div>
              <div className="flex flex-col items-center text-center space-y-4 group relative">
                <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-2xl font-bold">
                  3
                </div>
                <TextSection>
                  <h3 className="text-xl font-bold">Listen or Download</h3>
                  <p className="text-spacing">
                    Listen to the text being read aloud or download for later
                    use.
                  </p>
                </TextSection>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section
          ref={getStartedRef}
          id="get-started"
          className="py-16 md:py-24"
        >
          <div className="container px-4 md:px-6">
            <TextSection className="flex flex-col items-center text-center space-y-8 max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold tracking-wide mb-6">
                Ready to Make Reading Easier?
              </h2>
              <p className="text-xl text-muted-foreground text-spacing mb-6">
                Start using our tools today and experience the difference they
                can make in your reading and writing.
              </p>
              <Button
                size="lg"
                className="text-lg px-8 group flex items-center"
                asChild
              >
                <Link href="/dashboard">Get Started Now</Link>
              </Button>
            </TextSection>
          </div>
        </section>
      </main>

      <footer className="border-t py-6 md:py-8">
        <div className="container flex flex-col md:flex-row items-center justify-between gap-4 px-4 md:px-6">
          <div className="flex items-center gap-2 group">
            <BookOpen className="h-5 w-5 text-primary" />
            <span className="font-bold">ReadEase</span>
          </div>
          <p
            className="text-sm text-muted-foreground text-center md:text-left group relative"
            suppressHydrationWarning
          >
            © {new Date().getFullYear()} ReadEase. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <Link
              href="/privacy"
              className="text-sm text-muted-foreground hover:text-foreground group flex items-center"
            >
              Privacy
            </Link>
            <Link
              href="/terms"
              className="text-sm text-muted-foreground hover:text-foreground group flex items-center"
            >
              Terms
            </Link>
            <Link
              href="/contact"
              className="text-sm text-muted-foreground hover:text-foreground group flex items-center"
            >
              Contact
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
