import Button from "@/components/atoms/Button";

const TOPICS = [
  { title: "Hiring Workflow", desc: "Create job posts, shortlist, and onboard talent." },
  { title: "Payments & Escrow", desc: "Secure milestones and release payouts with confidence." },
  { title: "Contracts", desc: "Manage deliverables and approve milestones." },
  { title: "Security", desc: "Protect your organization with best practices." },
];

const FAQS = [
  {
    q: "How do I move a freelancer to contract?",
    a: "Open the job post, review candidates, and click “Offer Contract” for the chosen freelancer.",
  },
  {
    q: "Can I change a milestone after it’s created?",
    a: "Yes. Edit milestones from the contract overview before the freelancer starts work.",
  },
  {
    q: "Where do I see all invoices?",
    a: "All invoices live in the Payments tab with status, amount, and release history.",
  },
];

export default function ClientHelpContent() {
  return (
    <section className="w-full">
      <div className="rounded-[12px] border border-[#EAE7E2] bg-white p-6 shadow-[0_8px_22px_rgba(0,0,0,0.05)]">
        <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#8C4F00]">
          Help Center
        </div>
        <h1 className="mt-2 text-[24px] font-semibold tracking-[-0.02em] text-[#1a1a1a]">
          Support for client teams
        </h1>
        <p className="mt-2 text-[12px] leading-[1.7] text-[#6b6762]">
          Find answers quickly or reach out to the Bitlance client success crew.
        </p>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {TOPICS.map((topic) => (
          <div
            key={topic.title}
            className="rounded-[12px] border border-[#EAE7E2] bg-white p-4 shadow-[0_6px_16px_rgba(0,0,0,0.04)]"
          >
            <div className="text-[12px] font-semibold uppercase tracking-[0.1em] text-[#F5A623]">
              {topic.title}
            </div>
            <p className="mt-2 text-[12px] leading-[1.7] text-[#6b6762]">{topic.desc}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="rounded-[12px] border border-[#EAE7E2] bg-white p-5">
          <div className="mb-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#F5A623]">
            Frequently Asked
          </div>
          <div className="flex flex-col gap-3">
            {FAQS.map((faq) => (
              <div key={faq.q} className="rounded-[10px] border border-[#EFECE7] bg-[#FAF8F5] p-4">
                <div className="text-[13px] font-semibold text-[#1a1a1a]">{faq.q}</div>
                <div className="mt-2 text-[12px] leading-[1.7] text-[#6b6762]">{faq.a}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-[12px] border border-[#EAE7E2] bg-gradient-to-br from-[#1a1a1a] to-[#2d2d2d] p-5 text-white">
          <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#F5A623]">
            Need a human?
          </div>
          <p className="mt-3 text-[13px] leading-[1.7] text-[#d9d3cc]">
            Our client success team responds within two business hours for priority contracts.
          </p>
          <div className="mt-4 flex flex-col gap-2">
            <Button size="sm" className="rounded-full">
              Start Live Chat
            </Button>
            <Button size="sm" variant="outline" className="rounded-full text-white border-white/30 hover:text-white">
              Email Support
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
