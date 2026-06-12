import { BrowserRouter, Route, Routes } from "react-router-dom";
import { ScrollToTop } from "./components/ScrollToTop";

import Index from "./pages/Index";
import LoginPage from "./pages/LoginPage";
import { AppLayout } from "./pages/app/AppLayout";
import AppDashboard from "./pages/app/AppDashboard";
import AppSearch from "./pages/app/AppSearch";
import AppCollections from "./pages/app/AppCollections";
import AppCollectionDetail from "./pages/app/AppCollectionDetail";
import AppBookmarkDetail from "./pages/app/AppBookmarkDetail";
import AppNew from "./pages/app/AppNew";
import AppImport from "./pages/app/AppImport";
import AppSettings from "./pages/app/AppSettings";
import PublicProfile from "./pages/p/PublicProfile";
import { RequireAuth } from "./components/pinstr/RequireAuth";
import { NIP19Page } from "./pages/NIP19Page";
import NotFound from "./pages/NotFound";

export function AppRouter() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Index />} />
        <Route path="/login" element={<LoginPage />} />

        {/* Public Nostr profile pages */}
        <Route path="/p/:npub" element={<PublicProfile />} />

        {/* Protected app routes */}
        <Route
          path="/app"
          element={
            <RequireAuth>
              <AppLayout />
            </RequireAuth>
          }
        >
          <Route index element={<AppDashboard />} />
          <Route path="search" element={<AppSearch />} />
          <Route path="collections" element={<AppCollections />} />
          <Route path="collections/:id" element={<AppCollectionDetail />} />
          <Route path="bookmark/:id" element={<AppBookmarkDetail />} />
          <Route path="new" element={<AppNew />} />
          <Route path="import" element={<AppImport />} />
          <Route path="settings" element={<AppSettings />} />
        </Route>

        {/* NIP-19 route for npub1, note1, naddr1, nevent1, nprofile1 */}
        <Route path="/:nip19" element={<NIP19Page />} />

        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
export default AppRouter;
