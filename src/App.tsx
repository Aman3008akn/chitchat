import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./components/ThemeProvider";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Intro from "./components/Intro";
import { Maintenance } from "./components/Maintenance";
import { configService } from "./services/configService";

const queryClient = new QueryClient();

const App = () => {
  const [showIntro, setShowIntro] = useState(true);
  const [introVisible, setIntroVisible] = useState(true);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [maintenanceMessage, setMaintenanceMessage] = useState('');

  useEffect(() => {
    // Start UI config auto-refresh
    configService.startAutoRefresh();

    // Fetch maintenance status from public/maintenance.json
    fetch('/maintenance.json')
      .then(res => res.json())
      .then(data => {
        setMaintenanceMode(data.isMaintenance);
        setMaintenanceMessage(data.message);
      })
      .catch(error => console.error('Error fetching maintenance status:', error));

    const fadeTimer = setTimeout(() => {
      setShowIntro(false);
    }, 5000);

    const removeTimer = setTimeout(() => {
      setIntroVisible(false);
    }, 6000); // 1s for fade-out transition

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
  }, []);

  if (maintenanceMode) {
    return <Maintenance message={maintenanceMessage} />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster />
          <Sonner />
          {introVisible && <Intro show={showIntro} />}
          {!introVisible && (
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          )}
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
