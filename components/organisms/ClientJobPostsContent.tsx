 "use client";

import { useMemo, useState } from "react";
import Button from "@/components/atoms/Button";
import ClientJobPostCard from "@/components/molecules/ClientJobPostCard";
import ClientProposalCard from "@/components/molecules/ClientProposalCard";

const JOB_POSTS = [
  {
    id: "job-1",
    title: "Lightning Node Observability Suite",
    status: "Open" as const,
    budget: "450,000 sats",
    proposals: 18,
    tags: ["Lightning", "Rust", "Monitoring"],
  },
  {
    id: "job-2",
    title: "Bitcoin Treasury Reporting Dashboard",
    status: "In Review" as const,
    budget: "320,000 sats",
    proposals: 9,
    tags: ["Analytics", "Accounting", "React"],
  },
  {
    id: "job-3",
    title: "Merchant Payment Routing Revamp",
    status: "Paused" as const,
    budget: "280,000 sats",
    proposals: 5,
    tags: ["Payments", "APIs", "Node"],
  },
  {
    id: "job-4",
    title: "Multi-sig Vault Monitoring",
    status: "Open" as const,
    budget: "390,000 sats",
    proposals: 12,
    tags: ["Security", "Ops", "Alerts"],
  },
  {
    id: "job-5",
    title: "Lightning Liquidity Strategy",
    status: "Open" as const,
    budget: "210,000 sats",
    proposals: 7,
    tags: ["Liquidity", "Strategy", "Research"],
  },
  {
    id: "job-6",
    title: "Merchant API Documentation Sprint",
    status: "In Review" as const,
    budget: "160,000 sats",
    proposals: 4,
    tags: ["Docs", "API", "DX"],
  },
];

const PROPOSALS: Record<string, Array<{ id: string; name: string; title: string; rate: string; cover: string; rating: number; availability: string }>> =
  {
    "job-1": [
      {
        id: "p-1",
        name: "Satoshi Nakamoto",
        title: "Senior Rust & Lightning Engineer",
        rate: "150,000 sats/hr",
        cover:
          "I’ve built high-availability Lightning monitoring stacks for exchanges. I can ship the observability suite with real-time alerts and metrics dashboards.",
        rating: 5,
        availability: "30 hrs/week",
      },
      {
        id: "p-2",
        name: "Nadia K.",
        title: "Systems Architect",
        rate: "120,000 sats/hr",
        cover:
          "I’ll deliver a metrics pipeline with distributed tracing and an incident response playbook for your ops team.",
        rating: 4.8,
        availability: "25 hrs/week",
      },
    ],
    "job-2": [
      {
        id: "p-3",
        name: "Solomon P.",
        title: "Product Analytics Lead",
        rate: "95,000 sats/hr",
        cover:
          "I can build a treasury dashboard with clear reporting, data exports, and executive summaries.",
        rating: 4.9,
        availability: "20 hrs/week",
      },
    ],
    "job-3": [
      {
        id: "p-4",
        name: "Amina T.",
        title: "Payments Engineer",
        rate: "110,000 sats/hr",
        cover:
          "I’ll refactor routing logic and improve merchant onboarding flows while keeping latency low.",
        rating: 4.7,
        availability: "15 hrs/week",
      },
    ],
    "job-4": [
      {
        id: "p-5",
        name: "Eli J.",
        title: "Infrastructure Engineer",
        rate: "105,000 sats/hr",
        cover:
          "I can build a monitoring system with alerting for multi-sig vault anomalies and balance drift.",
        rating: 4.6,
        availability: "20 hrs/week",
      },
    ],
    "job-5": [
      {
        id: "p-6",
        name: "Priya V.",
        title: "Lightning Liquidity Strategist",
        rate: "98,000 sats/hr",
        cover:
          "I’ll develop a data-driven liquidity plan and rebalance strategy to improve routing revenue.",
        rating: 4.8,
        availability: "10 hrs/week",
      },
    ],
    "job-6": [
      {
        id: "p-7",
        name: "Marcus B.",
        title: "Technical Writer",
        rate: "70,000 sats/hr",
        cover:
          "I’ll produce clear, developer-first API docs with examples and onboarding guides.",
        rating: 4.9,
        availability: "15 hrs/week",
      },
    ],
  };

export default function ClientJobPostsContent() {
  const [selectedJobId, setSelectedJobId] = useState(JOB_POSTS[0]?.id ?? "");
  const [selectedProposals, setSelectedProposals] = useState<Record<string, boolean>>({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"active" | "review" | "paused">("active");
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);

  const proposals = useMemo(() => PROPOSALS[selectedJobId] ?? [], [selectedJobId]);

  const selectedCount = Object.values(selectedProposals).filter(Boolean).length;
  const selectedJob = JOB_POSTS.find((job) => job.id === selectedJobId) ?? JOB_POSTS[0];

  return (
    <section className="w-full">
      <div className="rounded-[12px] border border-[#EAE7E2] bg-white p-6 shadow-[0_8px_22px_rgba(0,0,0,0.05)]">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#8C4F00]">
              Job Posts
            </div>
            <h1 className="mt-2 text-[24px] font-semibold tracking-[-0.02em] text-[#1a1a1a]">
              Manage your open roles
            </h1>
            <p className="mt-2 text-[12px] leading-[1.7] text-[#6b6762]">
              Track proposals, adjust budgets, and keep candidates moving through your pipeline.
            </p>
          </div>
          <Button size="sm" className="rounded-full" onClick={() => setIsPostModalOpen(true)}>
            Post New Job
          </Button>
        </div>
      </div>

      <div className="mt-6 rounded-[12px] border border-[#EAE7E2] bg-white p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#F5A623]">
              Job Status
            </div>
            <div className="text-[12px] text-[#6b6762]">Switch between job states.</div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setActiveTab("active")}
              className={`rounded-full px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.08em] ${
                activeTab === "active"
                  ? "bg-[#F7F4F0] text-[#1a1a1a] border border-[#EAE7E2]"
                  : "text-[#6b6762] border border-[#EAE7E2] hover:bg-[#F7F4F0]"
              }`}
            >
              Active
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("review")}
              className={`rounded-full px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.08em] ${
                activeTab === "review"
                  ? "bg-[#F7F4F0] text-[#1a1a1a] border border-[#EAE7E2]"
                  : "text-[#6b6762] border border-[#EAE7E2] hover:bg-[#F7F4F0]"
              }`}
            >
              Ongoing
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("paused")}
              className={`rounded-full px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.08em] ${
                activeTab === "paused"
                  ? "bg-[#F7F4F0] text-[#1a1a1a] border border-[#EAE7E2]"
                  : "text-[#6b6762] border border-[#EAE7E2] hover:bg-[#F7F4F0]"
              }`}
            >
              Paused
            </button>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 lg:grid-cols-2">
          {JOB_POSTS.filter((job) => {
            if (activeTab === "active") return job.status === "Open";
            if (activeTab === "review") return job.status === "In Review";
            return job.status === "Paused";
          }).map((job) => (
            <ClientJobPostCard
              key={job.id}
              {...job}
              isSelected={job.id === selectedJobId}
              onSelect={() => {
                setSelectedJobId(job.id);
                setIsModalOpen(true);
              }}
            />
          ))}
        </div>
      </div>

      {isModalOpen && selectedJob ? (
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
                  Job Post Details
                </div>
                <div className="mt-2 text-[18px] font-semibold text-[#1a1a1a]">
                  {selectedJob.title}
                </div>
                <div className="mt-1 text-[12px] text-[#9e9690]">
                  {selectedJob.status} • {selectedJob.budget} • {selectedJob.proposals} proposals
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {selectedJob.tags.map((tag) => (
                    <span key={tag} className="inline-flex rounded-full bg-[#F6F3F1] px-3 py-1 text-[10px] font-semibold uppercase text-[#666]">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="text-[11px] text-[#6b6762]">
                Review candidates and select the freelancers you want to hire.
              </div>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-2">
                <span className="text-[11px] text-[#9e9690]">{selectedCount} selected</span>
                <Button size="sm" variant="outline" className="rounded-full w-full sm:w-auto">
                  Compare
                </Button>
              </div>
            </div>

            <div className="mt-4 flex flex-col gap-3">
              {proposals.map((proposal) => (
                <ClientProposalCard
                  key={proposal.id}
                  {...proposal}
                  isSelected={!!selectedProposals[proposal.id]}
                  onToggle={() =>
                    setSelectedProposals((prev) => ({
                      ...prev,
                      [proposal.id]: !prev[proposal.id],
                    }))
                  }
                />
              ))}
            </div>
          </div>
        </div>
      ) : null}

      {isPostModalOpen ? (
        <div className="fixed inset-0 z-[80] flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setIsPostModalOpen(false)}
          />
          <div className="relative z-[81] w-full max-w-3xl max-h-[85vh] overflow-y-auto rounded-[16px] border border-[#EAE7E2] bg-white p-6 shadow-[0_20px_50px_rgba(0,0,0,0.2)]">
            <button
              type="button"
              onClick={() => setIsPostModalOpen(false)}
              aria-label="Close"
              className="absolute right-4 top-4 rounded-full border border-[#EAE7E2] bg-white p-2 text-[#6b6762] hover:bg-[#F7F4F0]"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>

            <div className="mb-5">
              <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#8C4F00]">
                Post a Job
              </div>
              <h2 className="mt-2 text-[20px] font-semibold text-[#1a1a1a]">Create a new job post</h2>
              <p className="mt-1 text-[12px] text-[#6b6762]">
                Share the role details and the right freelancers will apply.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="flex flex-col gap-2 md:col-span-2">
                <label className="text-[11px] uppercase tracking-[0.12em] text-[#9e9690]">Job Title</label>
                <input className="rounded-lg border border-[#EAE7E2] px-3 py-2 text-[12px] focus:outline-none focus:ring-2 focus:ring-orange-400" placeholder="e.g. Lightning Node Observability Suite" />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[11px] uppercase tracking-[0.12em] text-[#9e9690]">Budget</label>
                <input className="rounded-lg border border-[#EAE7E2] px-3 py-2 text-[12px] focus:outline-none focus:ring-2 focus:ring-orange-400" placeholder="450,000 sats" />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[11px] uppercase tracking-[0.12em] text-[#9e9690]">Job Type</label>
                <select className="rounded-lg border border-[#EAE7E2] px-3 py-2 text-[12px] focus:outline-none focus:ring-2 focus:ring-orange-400">
                  <option>Fixed Price</option>
                  <option>Hourly</option>
                </select>
              </div>
              <div className="flex flex-col gap-2 md:col-span-2">
                <label className="text-[11px] uppercase tracking-[0.12em] text-[#9e9690]">Description</label>
                <textarea rows={4} className="rounded-lg border border-[#EAE7E2] px-3 py-2 text-[12px] focus:outline-none focus:ring-2 focus:ring-orange-400" placeholder="Describe the scope, goals, and deliverables." />
              </div>
              <div className="flex flex-col gap-2 md:col-span-2">
                <label className="text-[11px] uppercase tracking-[0.12em] text-[#9e9690]">Skills</label>
                <input className="rounded-lg border border-[#EAE7E2] px-3 py-2 text-[12px] focus:outline-none focus:ring-2 focus:ring-orange-400" placeholder="Rust, Lightning, Monitoring" />
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-end">
              <Button size="sm" variant="outline" className="rounded-full w-full sm:w-auto">
                Save Draft
              </Button>
              <Button size="sm" className="rounded-full w-full sm:w-auto">
                Publish Job
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
