// Root page - redirect to login or dashboard handled by middleware
// The (dashboard) route group serves the main dashboard at "/"
// This file must exist to prevent build errors, but (dashboard)/page.tsx takes precedence
// Actually, we need to choose one. Let's keep this as the entry point.

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function RootPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Authenticated users see the dashboard
  // We re-export the dashboard content here to avoid route conflicts
  redirect("/dashboard");
}
