import FreelancerSidebar from '@/components/molecules/FreelancerSidebar';
import OverviewContent from '@/components/organisms/OverviewContent';

export default function FreelancerDashboardPage() {
  return (
    <div className="min-h-screen bg-[#FCF9F7]">
      <main className="">
        <div className=" w-full ">
          <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8">
            <FreelancerSidebar active="/freelancer/dashboard" />

            <section className="">
              <OverviewContent />
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
