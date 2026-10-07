import DashboardLayout from "./DashboardLayout";

const NAV_ITEMS = [
  { to: "/dashboard/donor", label: "Overview", icon: "🏠", end: true },
  { to: "/dashboard/donor/donations", label: "My Donations", icon: "🧾" },
  { to: "/dashboard/donor/campaigns", label: "Supported Campaigns", icon: "✦" },
  { to: "/dashboard/donor/notifications", label: "Notifications", icon: "🔔" },
  { to: "/dashboard/donor/profile", label: "Profile", icon: "⚙" },
];

function DonorDashboardLayout() {
  return <DashboardLayout navItems={NAV_ITEMS} roleLabel="Donor" />;
}

export default DonorDashboardLayout;
