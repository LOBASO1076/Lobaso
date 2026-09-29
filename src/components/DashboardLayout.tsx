import { useAuth } from "@/_core/hooks/useAuth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { startLogin } from "@/const";
import { useIsMobile } from "@/hooks/useMobile";
import {
  BarChart3,
  Boxes,
  ClipboardList,
  ChevronRight,
  CircleDollarSign,
  LayoutDashboard,
  LogOut,
  PanelLeft,
  Settings2,
  ShieldCheck,
  ShoppingCart,
  Sparkles,
  Waves,
} from "lucide-react";
import { CSSProperties, useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import { DashboardLayoutSkeleton } from "./DashboardLayoutSkeleton";

const menuItems = [
  { icon: LayoutDashboard, label: "Visão geral", path: "/" },
  { icon: ShoppingCart, label: "Novo pedido", path: "/checkout" },
  { icon: ClipboardList, label: "Operação", path: "/operacao" },
  { icon: Boxes, label: "Estoque", path: "/estoque" },
  { icon: ShoppingCart, label: "Vendas", path: "/vendas" },
  { icon: Sparkles, label: "Inteligência", path: "/inteligencia" },
];

const SIDEBAR_WIDTH_KEY = "seafoods-sidebar-width";

export default function DashboardLayout({
  children,
  demoMode = false,
}: {
  children: React.ReactNode;
  demoMode?: boolean;
}) {
  const [sidebarWidth, setSidebarWidth] = useState(() => {
    const saved = localStorage.getItem(SIDEBAR_WIDTH_KEY);
    return saved ? parseInt(saved, 10) : 272;
  });
  const { loading, user } = useAuth();

  useEffect(() => {
    localStorage.setItem(SIDEBAR_WIDTH_KEY, sidebarWidth.toString());
  }, [sidebarWidth]);

  if (loading) return <DashboardLayoutSkeleton />;
  if (!user && !demoMode) {
    return (
      <div className="min-h-screen bg-[#071923] flex items-center justify-center p-6 text-white">
        <div className="w-full max-w-md rounded-[28px] border border-white/10 bg-white/[0.06] p-8 text-center shadow-2xl">
          <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#c8f36b] text-[#071923]"><Waves className="h-7 w-7" /></div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.22em] text-[#c8f36b]">Seafoods Premium OS</p>
          <h1 className="text-2xl font-semibold tracking-tight">Entre para operar com clareza.</h1>
          <p className="mt-3 text-sm leading-6 text-white/60">Dashboard, estoque e vendas protegidos por autenticação.</p>
          <Button onClick={() => startLogin()} className="mt-7 h-11 w-full bg-[#c8f36b] text-[#071923] hover:bg-[#d8fb8d]">Acessar conta <ChevronRight className="h-4 w-4" /></Button>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider style={{ "--sidebar-width": `${sidebarWidth}px` } as CSSProperties}>
      <DashboardLayoutContent user={user} demoMode={demoMode} setSidebarWidth={setSidebarWidth}>{children}</DashboardLayoutContent>
    </SidebarProvider>
  );
}

function DashboardLayoutContent({
  children,
  user,
  demoMode,
  setSidebarWidth,
}: {
  children: React.ReactNode;
  user: ReturnType<typeof useAuth>["user"];
  demoMode: boolean;
  setSidebarWidth: (width: number) => void;
}) {
  const [location, setLocation] = useLocation();
  const { state, toggleSidebar } = useSidebar();
  const { logout } = useAuth();
  const isCollapsed = state === "collapsed";
  const isMobile = useIsMobile();
  const [isResizing, setIsResizing] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const activeMenuItem = menuItems.find((item) => item.path === location);

  useEffect(() => {
    const move = (event: MouseEvent) => {
      if (!isResizing) return;
      const left = sidebarRef.current?.getBoundingClientRect().left ?? 0;
      const width = event.clientX - left;
      if (width >= 220 && width <= 400) setSidebarWidth(width);
    };
    const up = () => setIsResizing(false);
    if (isResizing) {
      document.addEventListener("mousemove", move);
      document.addEventListener("mouseup", up);
      document.body.style.cursor = "col-resize";
    }
    return () => {
      document.removeEventListener("mousemove", move);
      document.removeEventListener("mouseup", up);
      document.body.style.cursor = "";
    };
  }, [isResizing, setSidebarWidth]);

  return (
    <>
      <div ref={sidebarRef} className="relative">
        <Sidebar collapsible="icon" className="border-r border-[#153542] bg-[#081d28] text-white" disableTransition={isResizing}>
          <SidebarHeader className="h-[76px] justify-center border-b border-white/10 px-4">
            <div className="flex items-center gap-3">
              <button onClick={toggleSidebar} className="relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-[#d8ad55]/40 bg-[#071923] transition-transform active:scale-95" aria-label="Recolher menu" title="Seafoods Premium">
                <img src="/seafoods-premium-logo.png" alt="Seafoods Premium" className="h-full w-full object-cover object-top" />
              </button>
              {!isCollapsed && <div className="min-w-0"><p className="truncate text-[13px] font-semibold tracking-tight text-[#e9c66d]">Seafoods Premium</p><p className="truncate text-[10px] uppercase tracking-[0.18em] text-white/40">SaaS · ERP</p></div>}
            </div>
          </SidebarHeader>
          <SidebarContent className="px-3 py-5">
            <div className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/35">Workspace</div>
            <SidebarMenu>
              {menuItems.map((item) => {
                const active = item.path === location || (item.path === "/" && location === "/");
                return <SidebarMenuItem key={item.path}><SidebarMenuButton isActive={active} onClick={() => setLocation(item.path)} tooltip={item.label} className={`h-11 rounded-xl font-medium transition-all ${active ? "bg-[#173a42] text-[#c8f36b] hover:bg-[#173a42] hover:text-[#c8f36b]" : "text-white/60 hover:bg-white/[0.06] hover:text-white"}`}><item.icon className="h-[17px] w-[17px]" /><span>{item.label}</span>{active && !isCollapsed && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-[#c8f36b]" />}</SidebarMenuButton></SidebarMenuItem>;
              })}
            </SidebarMenu>
            <div className="my-6 h-px bg-white/10" />
            <div className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/35">Governança</div>
            <SidebarMenu>
              <SidebarMenuItem><SidebarMenuButton onClick={() => setLocation("/seguranca")} tooltip="Segurança" className="h-11 rounded-xl text-white/60 hover:bg-white/[0.06] hover:text-white"><ShieldCheck className="h-[17px] w-[17px]" /><span>Segurança</span></SidebarMenuButton></SidebarMenuItem>
              <SidebarMenuItem><SidebarMenuButton onClick={() => setLocation("/configuracoes")} tooltip="Configurações" className="h-11 rounded-xl text-white/60 hover:bg-white/[0.06] hover:text-white"><Settings2 className="h-[17px] w-[17px]" /><span>Configurações</span></SidebarMenuButton></SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter className="border-t border-white/10 p-3">
            <div className="mb-3 rounded-xl bg-[#102c36] p-3 group-data-[collapsible=icon]:hidden"><div className="flex items-center gap-2 text-[#c8f36b]"><CircleDollarSign className="h-4 w-4" /><span className="text-xs font-semibold">Modo margem</span></div><p className="mt-1 text-[11px] leading-4 text-white/45">Proteja lucro em cada pedido.</p></div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild><button className="flex w-full items-center gap-3 rounded-xl p-2 text-left transition-colors hover:bg-white/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c8f36b]"><Avatar className="h-9 w-9 border border-white/10 bg-[#c8f36b] text-[#071923]"><AvatarFallback className="bg-[#c8f36b] text-xs font-bold text-[#071923]">{user?.name?.charAt(0).toUpperCase() || "D"}</AvatarFallback></Avatar><div className="min-w-0 flex-1 group-data-[collapsible=icon]:hidden"><p className="truncate text-xs font-semibold">{user?.name || "Demo workspace"}</p><p className="truncate text-[10px] text-white/40">{demoMode ? "Visualização demo" : user?.email || "Conta protegida"}</p></div></button></DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52"><DropdownMenuItem onClick={logout} className="cursor-pointer text-destructive focus:text-destructive"><LogOut className="mr-2 h-4 w-4" />Sair da conta</DropdownMenuItem></DropdownMenuContent>
            </DropdownMenu>
          </SidebarFooter>
        </Sidebar>
        <div className={`absolute right-0 top-0 z-50 h-full w-1 cursor-col-resize hover:bg-[#c8f36b]/30 ${isCollapsed ? "hidden" : ""}`} onMouseDown={() => setIsResizing(true)} />
      </div>
      <SidebarInset className="bg-[#f4f6f1]">
        {isMobile && <div className="sticky top-0 z-40 flex h-14 items-center gap-2 border-b border-[#dbe4df] bg-[#f4f6f1]/95 px-3 backdrop-blur"><SidebarTrigger className="h-9 w-9 rounded-lg" /><span className="text-sm font-semibold text-[#102c36]">{activeMenuItem?.label ?? "Workspace"}</span></div>}
        <main className="min-h-screen">{children}</main>
      </SidebarInset>
    </>
  );
}
