import DashboardLayout from "./DashboardLayout";

const NAV_ITEMS = [
  { to: "/dashboard/admin", label: "Dashboard", icon: "🏠", end: true },
  { to: "/dashboard/admin/donations", label: "Donations", icon: "₹" },
  { to: "/dashboard/admin/donors", label: "Donors", icon: "👥" },
  { to: "/dashboard/admin/campaigns", label: "Campaigns", icon: "✦" },
  { to: "/dashboard/admin/projects", label: "Projects", icon: "🗂" },
  { to: "/dashboard/admin/beneficiaries", label: "Beneficiaries", icon: "🤝" },
  { to: "/dashboard/admin/volunteers", label: "Volunteers", icon: "🙋" },
  { to: "/dashboard/admin/events", label: "Events", icon: "🎟" },
  { to: "/dashboard/admin/gallery", label: "Gallery", icon: "🖼" },
  { to: "/dashboard/admin/blog", label: "Blog", icon: "📝" },
  { to: "/dashboard/admin/testimonials", label: "Testimonials", icon: "💬" },
  { to: "/dashboard/admin/messages", label: "Messages", icon: "✉" },
  { to: "/dashboard/admin/documents", label: "Documents", icon: "📄" },
  { to: "/dashboard/admin/reports", label: "Reports", icon: "📊" },
  { to: "/dashboard/admin/users", label: "Users & Roles", icon: "🛡" },
  { to: "/dashboard/admin/notifications", label: "Notifications", icon: "🔔" },
  { to: "/dashboard/admin/settings", label: "Settings", icon: "⚙" },
  { to: "/dashboard/admin/activity-logs", label: "Activity Logs", icon: "🕒" },
];

function AdminDashboardLayout() {
  return <DashboardLayout navItems={NAV_ITEMS} roleLabel="Admin" />;
}

export default AdminDashboardLayout;
