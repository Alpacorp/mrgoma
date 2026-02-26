import dynamic from 'next/dynamic';

const DashboardTable = dynamic(() => import('@/app/ui/components/DashboardTable/DashboardTable'), {
  ssr: false,
});

const DashboardTableContainer = () => {
  return (
    <div>
      <DashboardTable />
    </div>
  );
};

export default DashboardTableContainer;
