import DashboardHeader from '@/app/ui/sections/DashboardHeader/DashboardHeader';
import { DashboardFooter } from '@/app/ui/sections/Footer/DashboardFooter';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <DashboardHeader />
      {children}
      <DashboardFooter />
    </div>
  );
}
