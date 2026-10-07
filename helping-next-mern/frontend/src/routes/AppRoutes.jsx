import { Routes, Route } from "react-router-dom";

import ProtectedRoute from "../components/ProtectedRoute";
import PublicLayout from "../layouts/PublicLayout";
import DonorDashboardLayout from "../layouts/DonorDashboardLayout";
import VolunteerDashboardLayout from "../layouts/VolunteerDashboardLayout";
import AdminDashboardLayout from "../layouts/AdminDashboardLayout";

// Public pages
import Home from "../pages/public/Home";
import About from "../pages/public/About";
import OurWork from "../pages/public/OurWork";
import Campaigns from "../pages/public/Campaigns";
import CampaignDetail from "../pages/public/CampaignDetail";
import Projects from "../pages/public/Projects";
import ProjectDetail from "../pages/public/ProjectDetail";
import Donate from "../pages/public/Donate";
import Volunteer from "../pages/public/Volunteer";
import Events from "../pages/public/Events";
import Gallery from "../pages/public/Gallery";
import Blog from "../pages/public/Blog";
import BlogDetail from "../pages/public/BlogDetail";
import Transparency from "../pages/public/Transparency";
import Contact from "../pages/public/Contact";
import Privacy from "../pages/public/Privacy";
import Terms from "../pages/public/Terms";

// Auth pages
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import ForgotPassword from "../pages/auth/ForgotPassword";
import ResetPassword from "../pages/auth/ResetPassword";

// Donor dashboard
import DonorOverview from "../pages/donor/DonorOverview";
import DonorDonations from "../pages/donor/DonorDonations";
import DonorCampaigns from "../pages/donor/DonorCampaigns";
import DonorProfile from "../pages/donor/DonorProfile";
import DonorNotifications from "../pages/donor/DonorNotifications";

// Volunteer dashboard
import VolunteerOverview from "../pages/volunteer/VolunteerOverview";
import VolunteerApplications from "../pages/volunteer/VolunteerApplications";
import VolunteerEvents from "../pages/volunteer/VolunteerEvents";
import VolunteerCertificates from "../pages/volunteer/VolunteerCertificates";
import VolunteerNotifications from "../pages/volunteer/VolunteerNotifications";
import VolunteerProfile from "../pages/volunteer/VolunteerProfile";

// Admin dashboard
import AdminOverview from "../pages/admin/AdminOverview";
import AdminDonations from "../pages/admin/AdminDonations";
import AdminDonors from "../pages/admin/AdminDonors";
import AdminCampaigns from "../pages/admin/AdminCampaigns";
import AdminProjects from "../pages/admin/AdminProjects";
import AdminBeneficiaries from "../pages/admin/AdminBeneficiaries";
import AdminVolunteers from "../pages/admin/AdminVolunteers";
import AdminEvents from "../pages/admin/AdminEvents";
import AdminGallery from "../pages/admin/AdminGallery";
import AdminBlog from "../pages/admin/AdminBlog";
import AdminTestimonials from "../pages/admin/AdminTestimonials";
import AdminMessages from "../pages/admin/AdminMessages";
import AdminDocuments from "../pages/admin/AdminDocuments";
import AdminReports from "../pages/admin/AdminReports";
import AdminUsers from "../pages/admin/AdminUsers";
import AdminNotifications from "../pages/admin/AdminNotifications";
import AdminSettings from "../pages/admin/AdminSettings";
import AdminActivityLogs from "../pages/admin/AdminActivityLogs";

function NotFound() {
  return (
    <div
      style={{
        minHeight: "60vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
        padding: "40px",
        textAlign: "center",
      }}
    >
      <h1>404</h1>
      <p>The page you're looking for doesn't exist.</p>
    </div>
  );
}

function AppRoutes() {
  return (
    <Routes>

      {/* Public site */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/our-work" element={<OurWork />} />

        <Route path="/campaigns" element={<Campaigns />} />
        <Route path="/campaigns/:id" element={<CampaignDetail />} />

        <Route path="/projects" element={<Projects />} />
        <Route path="/projects/:id" element={<ProjectDetail />} />

        <Route path="/donate" element={<Donate />} />
        <Route path="/volunteer" element={<Volunteer />} />
        <Route path="/events" element={<Events />} />
        <Route path="/gallery" element={<Gallery />} />

        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:id" element={<BlogDetail />} />

        <Route path="/transparency" element={<Transparency />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />
      </Route>

      {/* Auth (no navbar/footer shell) */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* Donor dashboard */}
      <Route
        path="/dashboard/donor"
        element={
          <ProtectedRoute allowedRoles={["donor"]}>
            <DonorDashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DonorOverview />} />
        <Route path="donations" element={<DonorDonations />} />
        <Route path="campaigns" element={<DonorCampaigns />} />
        <Route path="notifications" element={<DonorNotifications />} />
        <Route path="profile" element={<DonorProfile />} />
      </Route>

      {/* Volunteer dashboard */}
      <Route
        path="/dashboard/volunteer"
        element={
          <ProtectedRoute allowedRoles={["volunteer"]}>
            <VolunteerDashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<VolunteerOverview />} />
        <Route path="applications" element={<VolunteerApplications />} />
        <Route path="events" element={<VolunteerEvents />} />
        <Route path="certificates" element={<VolunteerCertificates />} />
        <Route path="notifications" element={<VolunteerNotifications />} />
        <Route path="profile" element={<VolunteerProfile />} />
      </Route>

      {/* Admin dashboard */}
      <Route
        path="/dashboard/admin"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminDashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminOverview />} />
        <Route path="donations" element={<AdminDonations />} />
        <Route path="donors" element={<AdminDonors />} />
        <Route path="campaigns" element={<AdminCampaigns />} />
        <Route path="projects" element={<AdminProjects />} />
        <Route path="beneficiaries" element={<AdminBeneficiaries />} />
        <Route path="volunteers" element={<AdminVolunteers />} />
        <Route path="events" element={<AdminEvents />} />
        <Route path="gallery" element={<AdminGallery />} />
        <Route path="blog" element={<AdminBlog />} />
        <Route path="testimonials" element={<AdminTestimonials />} />
        <Route path="messages" element={<AdminMessages />} />
        <Route path="documents" element={<AdminDocuments />} />
        <Route path="reports" element={<AdminReports />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="notifications" element={<AdminNotifications />} />
        <Route path="settings" element={<AdminSettings />} />
        <Route path="activity-logs" element={<AdminActivityLogs />} />
      </Route>

      <Route path="*" element={<NotFound />} />

    </Routes>
  );
}

export default AppRoutes;
