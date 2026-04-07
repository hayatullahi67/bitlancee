 "use client";

import { useMemo, useState } from "react";
import Button from "@/components/atoms/Button";
import DashboardMetricCard from "@/components/molecules/DashboardMetricCard";
import ClientContractCard from "@/components/molecules/ClientContractCard";

const CONTRACTS = [
  {
    id: "c-1",
    title: "Payment Routing Optimizer",
    freelancer: "Nadia K.",
    progress: 68,
    nextMilestone: "Delivery of routing API v2",
    status: "Active" as const,
    budget: "820,000 sats",
    startDate: "Mar 12, 2026",
    dueDate: "May 02, 2026",
    description:
      "Build a routing engine that improves payment success rates with real-time channel scoring.",
  },
  {
    id: "c-2",
    title: "Security Audit for LDK Gateway",
    freelancer: "Solomon P.",
    progress: 92,
    nextMilestone: "Final audit report",
    status: "Review" as const,
    budget: "640,000 sats",
    startDate: "Feb 18, 2026",
    dueDate: "Apr 11, 2026",
    description:
      "Comprehensive audit of gateway and LDK integration with threat model and mitigations.",
  },
  {
    id: "c-3",
    title: "Merchant Onboarding Flow",
    freelancer: "Amina T.",
    progress: 100,
    nextMilestone: "Archive + final payout",
    status: "Completed" as const,
    budget: "260,000 sats",
    startDate: "Jan 08, 2026",
    dueDate: "Mar 20, 2026",
    description:
      "Design and implement an onboarding flow for new merchants with KYB checks and milestones.",
  },
];

export default function ClientContractsContent() {
  const [view, setView] = useState<"active" | "ongoing">("active");
  const [selectedId, setSelectedId] = useState(CONTRACTS[0]?.id ?? "");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const activeContracts = useMemo(
    () => CONTRACTS.filter((c) => c.status === "Active"),
    []
  );
  const ongoingContracts = useMemo(
    () => CONTRACTS.filter((c) => c.status === "Review" || c.status === "Completed"),
    []
  );

  const visibleContracts = view === "active" ? activeContracts : ongoingContracts;
  const selectedContract =
    CONTRACTS.find((c) => c.id === selectedId) ?? visibleContracts[0] ?? CONTRACTS[0];

  return (
    <section className="w-full">
      <div className="rounded-[12px] border border-[#EAE7E2] bg-white p-6 shadow-[0_8px_22px_rgba(0,0,0,0.05)]">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#8C4F00]">
              Contracts
            </div>
            <h1 className="mt-2 text-[24px] font-semibold tracking-[-0.02em] text-[#1a1a1a]">
              Active engagements
            </h1>
            <p className="mt-2 text-[12px] leading-[1.7] text-[#6b6762]">
              Monitor delivery progress, approve milestones, and keep timelines tight.
            </p>
          </div>
          <Button size="sm" variant="outline" className="rounded-full">
            View All Contracts
          </Button>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <DashboardMetricCard label="Active Contracts" value="7" change="+2 this month" tone="up" />
        <DashboardMetricCard label="In Review" value="3" change="Needs approval" tone="neutral" />
        <DashboardMetricCard label="Milestones Due" value="4" change="Next 7 days" tone="down" />
        <DashboardMetricCard label="Total Spend" value="3.4M sats" change="+18% QoQ" tone="up" />
      </div>

      <div className="mt-8">
        <div className="rounded-[12px] border border-[#EAE7E2] bg-[#F9F6F2] p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#F5A623]">
                Contracts
              </div>
              <div className="text-[12px] text-[#6b6762]">Switch between active and ongoing work.</div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setView("active")}
                className={`rounded-full px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.08em] ${
                  view === "active"
                    ? "bg-white text-[#1a1a1a] shadow-sm"
                    : "bg-transparent text-[#6b6762] border border-[#EAE7E2]"
                }`}
              >
                Active
              </button>
              <button
                type="button"
                onClick={() => setView("ongoing")}
                className={`rounded-full px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.08em] ${
                  view === "ongoing"
                    ? "bg-white text-[#1a1a1a] shadow-sm"
                    : "bg-transparent text-[#6b6762] border border-[#EAE7E2]"
                }`}
              >
                Ongoing
              </button>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-1 gap-4">
            {visibleContracts.map((contract) => (
              <button
                key={contract.id}
                type="button"
                onClick={() => {
                  setSelectedId(contract.id);
                  setIsModalOpen(true);
                }}
                className="text-left"
              >
                <ClientContractCard {...contract} />
              </button>
            ))}
          </div>
        </div>
      </div>

      {isModalOpen && selectedContract ? (
        <div className="fixed inset-0 z-[80] flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setIsModalOpen(false)}
          />
          <div className="relative z-[81] w-full max-w-3xl max-h-[85vh] overflow-y-auto rounded-[16px] border border-[#EAE7E2] bg-white p-6 shadow-[0_20px_50px_rgba(0,0,0,0.2)]">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              aria-label="Close"
              className="absolute right-4 top-4 rounded-full border border-[#EAE7E2] bg-white p-2 text-[#6b6762] hover:bg-[#F7F4F0]"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#8C4F00]">
                  Contract Details
                </div>
                <div className="mt-2 text-[18px] font-semibold text-[#1a1a1a]">
                  {selectedContract.title}
                </div>
                <div className="text-[12px] text-[#9e9690]">
                  Freelancer: {selectedContract.freelancer} • {selectedContract.status}
                </div>
              </div>
            </div>

            <div className="mt-4 text-[12px] leading-[1.7] text-[#6b6762]">
              {selectedContract.description}
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3 text-[11px] text-[#6b6762]">
              <div className="rounded-[10px] border border-[#EFECE7] bg-[#FAF8F5] px-3 py-2">
                <div className="uppercase tracking-[0.12em] text-[#9e9690]">Budget</div>
                <div className="mt-1 font-semibold text-[#1a1a1a]">{selectedContract.budget}</div>
              </div>
              <div className="rounded-[10px] border border-[#EFECE7] bg-[#FAF8F5] px-3 py-2">
                <div className="uppercase tracking-[0.12em] text-[#9e9690]">Progress</div>
                <div className="mt-1 font-semibold text-[#1a1a1a]">{selectedContract.progress}%</div>
              </div>
              <div className="rounded-[10px] border border-[#EFECE7] bg-[#FAF8F5] px-3 py-2">
                <div className="uppercase tracking-[0.12em] text-[#9e9690]">Start</div>
                <div className="mt-1 font-semibold text-[#1a1a1a]">{selectedContract.startDate}</div>
              </div>
              <div className="rounded-[10px] border border-[#EFECE7] bg-[#FAF8F5] px-3 py-2">
                <div className="uppercase tracking-[0.12em] text-[#9e9690]">Due</div>
                <div className="mt-1 font-semibold text-[#1a1a1a]">{selectedContract.dueDate}</div>
              </div>
            </div>

            <div className="mt-4 rounded-[10px] border border-[#EFECE7] bg-[#FAF8F5] px-4 py-3">
              <div className="text-[10px] uppercase tracking-[0.12em] text-[#9e9690]">
                Next Milestone
              </div>
              <div className="mt-2 text-[12px] font-semibold text-[#1a1a1a]">
                {selectedContract.nextMilestone}
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              <Button size="sm" variant="outline" className="rounded-full">
                View Contract
              </Button>
              <Button size="sm" className="rounded-full">
                Approve Milestone
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
