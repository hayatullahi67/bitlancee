import FreelancerSidebar from '@/components/molecules/FreelancerSidebar';
import JobFeedContent from '@/components/organisms/JobFeedContent';

export default function JobFeedPage() {
  return (
    <div className="min-h-screen bg-[#FCF9F7]">
      <main className="">
        <div className=" w-full ">
          <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8">
            {/* Active state set to the job feed route */}
            <FreelancerSidebar active="/freelancer/dashboard/job-feed" />

            <section className="">
              <JobFeedContent />
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
