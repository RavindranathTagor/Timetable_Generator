import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import Layout from "@/components/layout/layout";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/Dashboard";
import Generate from "@/pages/Generate";
import Constraints from "@/pages/Constraints";
import Settings from "@/pages/Settings";
import Schedules from "@/pages/Schedules";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/generate" component={Generate} />
      <Route path="/constraints" component={Constraints} />
      <Route path="/schedules" component={Schedules} />
      <Route path="/settings" component={Settings} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Layout>
        <Router />
      </Layout>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
