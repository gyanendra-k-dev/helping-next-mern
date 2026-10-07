import DashboardLayout from "./DashboardLayout";

const NAV_ITEMS = [
  { to: "/dashboard/volunteer", label: "Overview", icon: "🏠", end: true },
  { to: "/dashboard/volunteer/applications", label: "Applications", icon: "📋" },
  { to: "/dashboard/volunteer/events", label: "Events", icon: "🎟" },
  { to: "/dashboard/volunteer/certificates", label: "Hours & Certificates", icon: "🏅" },
  { to: "/dashboard/volunteer/notifications", label: "Notifications", icon: "🔔" },
  { to: "/dashboard/volunteer/profile", label: "Profile", icon: "⚙" },
];

function VolunteerDashboardLayout() {
  return <DashboardLayout navItems={NAV_ITEMS} roleLabel="Volunteer" />;
}

export default VolunteerDashboardLayout;
