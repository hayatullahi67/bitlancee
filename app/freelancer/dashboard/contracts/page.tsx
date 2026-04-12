import FreelancerSidebar from "@/components/molecules/FreelancerSidebar";
import FreelancerContractsContent from "@/components/organisms/FreelancerContractsContent";

export default function FreelancerContractsPage() {
  return (
    <div className="min-h-screen bg-[#FCF9F7]">
      <main>
        <div className="w-full">
          <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8">
            <FreelancerSidebar active="/freelancer/dashboard/contracts" />
            <section className="px-4 pb-10 pt-[79px] sm:px-6 lg:px-8 md:pt-6">
              <FreelancerContractsContent />
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
