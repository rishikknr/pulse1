import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import DashboardLayout from "./components/DashboardLayout";
import Home from "./pages/Home";
import Targets from "./pages/Targets";
import Incidents from "./pages/Incidents";
import Settings from "./pages/Settings";

function Router() {
  return (
    <Switch>
      <Route path={"/404"} component={NotFound} />
      <Route path={"/:rest*"} component={DashboardWrapper} />
    </Switch>
  );
}

function DashboardWrapper() {
  return (
    <DashboardLayout>
      <Switch>
        <Route path={"/"} component={Home} />
        <Route path={"/targets"} component={Targets} />
        <Route path={"/incidents"} component={Incidents} />
        <Route path={"/settings"} component={Settings} />
        <Route component={NotFound} />
      </Switch>
    </DashboardLayout>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
      >
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
