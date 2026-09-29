import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Checkout from "./pages/Checkout";
import CommercialIntelligence from "./pages/CommercialIntelligence";
import DemoShowcase from "./pages/DemoShowcase";
import Home from "./pages/Home";
import PitchDashboard from "./pages/PitchDashboard";
import OperationsHub from "./pages/OperationsHub";
import OrderQueueApp from "./pages/OrderQueueApp";
import { useEffect, useState } from "react";

function Router() {
  return <Switch><Route path="/" component={Home} /><Route path="/demo" component={DemoShowcase} /><Route path="/pitch" component={PitchDashboard} /><Route path="/checkout" component={Checkout} /><Route path="/inteligencia" component={CommercialIntelligence} /><Route path="/operacao" component={OperationsHub} /><Route path="/fila" component={OrderQueueApp} /><Route path="/404" component={NotFound} /><Route component={NotFound} /></Switch>;
}

export default function App() {
  const [booting, setBooting] = useState(true);
  useEffect(() => {
    const timer = window.setTimeout(() => setBooting(false), 720);
    return () => window.clearTimeout(timer);
  }, []);
  return <ErrorBoundary><ThemeProvider defaultTheme="light"><TooltipProvider><Toaster />{booting && <div className="fixed inset-0 z-[100] grid place-items-center bg-[#102c36] text-white" role="status" aria-label="Carregando Seafoods Premium"><div className="flex flex-col items-center gap-5"><div className="relative grid h-16 w-16 place-items-center rounded-[22px] bg-[#c8f36b] text-[#173c2d] shadow-[0_0_0_10px_rgba(200,243,107,0.08)]"><span className="absolute inset-0 animate-ping rounded-[22px] bg-[#c8f36b]/20" /><span className="relative text-xl font-bold">S</span></div><div className="text-center"><p className="text-sm font-semibold tracking-tight">Seafoods Premium</p><p className="mt-1 text-[10px] font-bold uppercase tracking-[0.2em] text-white/45">Preparando sua experiência</p></div><div className="h-1 w-28 overflow-hidden rounded-full bg-white/10"><div className="h-full w-1/2 animate-pulse rounded-full bg-[#c8f36b]" /></div></div></div>}<Router /></TooltipProvider></ThemeProvider></ErrorBoundary>;
}
