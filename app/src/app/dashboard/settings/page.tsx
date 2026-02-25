import { redirect } from "next/navigation";

/**
 * Root settings page - redirects to team management tab
 * This ensures /dashboard/settings is accessible and defaults to the first tab
 */
export default function SettingsPage() {
  redirect("/dashboard/settings/team");
}
