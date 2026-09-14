import DashboardLayout from "@/app/Superadmin/dashboard/layouts/DashboardLayout";

export default function SuperadminLayout({
    children,
  }: {
    children: React.ReactNode;
  }) {
    return <DashboardLayout>{children}</DashboardLayout>;
  }