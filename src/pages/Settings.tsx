import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { api } from "@/lib/api";
import { ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import streamvisionLogo from "@/assets/streamvision-logo.png";

const Settings = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [healthStatus, setHealthStatus] = useState<"loading" | "online" | "offline">("loading");
  const [rulesSummary, setRulesSummary] = useState<any>(null);

  useEffect(() => {
    // Check health status
    api.getHealth()
      .then(() => setHealthStatus("online"))
      .catch(() => setHealthStatus("offline"));

    // Get rules summary
    api.getRulesSummary()
      .then(setRulesSummary)
      .catch(() => {});
  }, []);

  const handleClearChat = () => {
    localStorage.removeItem("visionary_sessions");
    localStorage.removeItem("visionary_current_session");
    toast({
      title: "Chat cleared",
      description: "Your chat history has been cleared. Please refresh the page.",
    });
    // Redirect to home after a brief delay
    setTimeout(() => {
      navigate("/");
      window.location.reload();
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-card/80 backdrop-blur-lg border-b border-border shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <img src={streamvisionLogo} alt="StreamVision Media" className="h-10 object-contain" />
          <h1 className="text-xl font-semibold">Settings</h1>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-8 max-w-2xl space-y-6">
        {/* Rules Summary */}
        {rulesSummary && (
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Keyword Rules</h2>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Total rules: <span className="font-medium text-foreground">{rulesSummary.total_rules}</span>
              </p>
              {rulesSummary.groups && rulesSummary.groups.length > 0 && (
                <div className="mt-3 space-y-2">
                  <p className="text-sm font-medium">Rule Groups:</p>
                  {rulesSummary.groups.map((group: any, index: number) => (
                    <div key={index} className="text-sm text-muted-foreground pl-4">
                      • {group.name}: {group.keyword_count} keywords
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Actions */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Actions</h2>
          <div className="space-y-3">
            <Button
              variant="outline"
              onClick={handleClearChat}
              className="w-full justify-start"
            >
              Clear chat history
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate("/")}
              className="w-full justify-start"
            >
              Return to chat
            </Button>
          </div>
        </Card>
      </main>
    </div>
  );
};

export default Settings;
