import { useState } from "react";
import streamvisionLogo from "@/assets/streamvision-logo.png";
import visionaryLogo from "@/assets/visionary-logo-transparent.png";
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
          <img src={visionaryLogo} alt="Visionary" className="h-20 object-contain mb-8" />
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
              className="px-5 py-2.5 rounded-full border-2 border-accent/80 bg-accent/10 text-accent font-medium hover:bg-accent hover:text-white hover:border-accent transition-all duration-200 transform hover:scale-105"
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
            className="bg-accent hover:bg-accent/90 text-white px-12 py-6 text-lg rounded-full shadow-lg shadow-accent/20 hover:shadow-xl hover:shadow-accent/30 transition-all duration-200 transform hover:scale-105"
          >
            Start a Chat
          </Button>
        </div>
      </div>
    </div>
  );
};

export default HomeView;
