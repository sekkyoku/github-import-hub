import { useState } from "react";
import streamvisionLogo from "@/assets/streamvision-logo.png";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HomeViewProps {
  onStartChat: (initialPrompt?: string) => void;
}

const SUGGESTED_PROMPTS = [
  "Show me the ingested files",
  "¿Cuál es el inventario disponible para CTV?",
  "Who's VW sales rep in 2025?",
  "Find Q2 New Sponsorships",
  "Dime la lista de contactos del equipo de ventas",
];

const HomeView = ({ onStartChat }: HomeViewProps) => {
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-80px)] px-4 animate-fade-in">
      <div className="max-w-2xl w-full mx-auto mt-16">
        {/* Logo and Title */}
        <div className="flex flex-col items-center text-center mb-12">
          <img src={streamvisionLogo} alt="StreamVision Media" className="h-16 object-contain mb-6" />
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="h-8 w-8 text-streamvision-coral" />
            <h1 className="text-5xl font-bold text-streamvision-navy">Visionary</h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-md">
            Ask about files, sheets, CPMs, contacts — en inglés o en español.
          </p>
        </div>

        {/* Suggested Prompts */}
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          {SUGGESTED_PROMPTS.map((prompt, index) => (
            <button
              key={index}
              onClick={() => onStartChat(prompt)}
              className="px-5 py-2.5 rounded-full border-2 border-streamvision-coral text-streamvision-coral font-medium hover:bg-streamvision-coral hover:text-white transition-all duration-200 transform hover:scale-105"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Start Chat Button */}
        <div className="flex justify-center">
          <Button
            onClick={() => onStartChat()}
            size="lg"
            className="bg-streamvision-coral hover:bg-streamvision-coral/90 text-white px-12 py-6 text-lg rounded-full shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
          >
            Start a Chat
          </Button>
        </div>
      </div>
    </div>
  );
};

export default HomeView;
