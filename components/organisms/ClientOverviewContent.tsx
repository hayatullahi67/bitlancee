"use client";

import { useEffect, useMemo, useState } from "react";
import Button from "@/components/atoms/Button";
import DashboardMetricCard from "@/components/molecules/DashboardMetricCard";
import ClientJobPostCard from "@/components/molecules/ClientJobPostCard";
import ClientContractCard from "@/components/molecules/ClientContractCard";
import ClientProposalCard from "@/components/molecules/ClientProposalCard";
import { firebaseAuth, firebaseDb } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { collection, onSnapshot, query, where } from "firebase/firestore";

const METRICS = [
  { label: "Active Contracts", value: "7", change: "+2 this month", tone: "up" as const },
  { label: "Open Job Posts", value: "4", change: "1 in review", tone: "neutral" as const },
  { label: "Total Spend", value: "3.4M sats", change: "+18% QoQ", tone: "up" as const },
  { label: "Response Rate", value: "98%", change: "Top percentile", tone: "neutral" as const },
];

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
];

type ProposalItem = {
  id: string;
  name: string;
  title: string;
  rate: string;
  cover: string;
  rating: number;
  availability: string;
};
type JobStatus = "Open" | "In Review" | "Paused";

type JobPost = {
  id: string;
  title: string;
  status: JobStatus;
  budget: string;
  proposals: number;
  tags: string[];
  description?: string;
  urgent?: boolean;
  jobType?: string;
  createdAt?: any;
};

const PROPOSALS: { [key: string]: ProposalItem[] } = {
  "job-1": [
    {
      id: "p-1",
      name: "Satoshi Nakamoto",
      title: "Senior Rust & Lightning Engineer",
      rate: "150,000 sats/hr",
      cover:
        "I've built high-availability Lightning monitoring stacks for exchanges. I can ship the observability suite with real-time alerts and metrics dashboards.",
      rating: 5,
      availability: "30 hrs/week",
    },
  ],
  "job-2": [
    {
      id: "p-2",
      name: "Solomon P.",
      title: "Product Analytics Lead",
      rate: "95,000 sats/hr",
      cover:
        "I can build a treasury dashboard with clear reporting, data exports, and executive summaries.",
      rating: 4.9,
      availability: "20 hrs/week",
    },
  ],
};

export default function ClientOverviewContent() {
  const [contractModalOpen, setContractModalOpen] = useState(false);
  const [jobModalOpen, setJobModalOpen] = useState(false);
  const [selectedContractId, setSelectedContractId] = useState(CONTRACTS[0]?.id ?? "");
  const [selectedJobId, setSelectedJobId] = useState("");
  const [selectedProposals, setSelectedProposals] = useState<Record<string, boolean>>({});
  const [jobs, setJobs] = useState<JobPost[]>([]);
  const [jobsLoading, setJobsLoading] = useState(true);
  const [jobsError, setJobsError] = useState("");

  const selectedContract = useMemo(
    () => CONTRACTS.find((c) => c.id === selectedContractId) ?? CONTRACTS[0],
    [selectedContractId]
  );

  const latestJobs = useMemo(() => {
    const sorted = [...jobs].sort((a, b) => {
      const aTime = a.createdAt?.seconds ? a.createdAt.seconds : 0;
      const bTime = b.createdAt?.seconds ? b.createdAt.seconds : 0;
      return bTime - aTime;
    });
    return sorted.slice(0, 2);
  }, [jobs]);

  const selectedJob = useMemo(
    () => latestJobs.find((j) => j.id === selectedJobId) ?? latestJobs[0],
    [selectedJobId, latestJobs]
  );

  const proposals = useMemo(() => PROPOSALS[selectedJobId] ?? [], [selectedJobId]);

  const formatBudget = (value: string) =>
    value?.trim()
      ? value.toLowerCase().includes("sats")
        ? value
        : `${value} sats`
      : null;

  useEffect(() => {
    let unsubscribeJobs: (() => void) | undefined;
    const unsubscribeAuth = onAuthStateChanged(firebaseAuth, (user) => {
      if (!user) {
        if (unsubscribeJobs) unsubscribeJobs();
        setJobs([]);
        setSelectedJobId("");
        setJobsLoading(false);
        setJobsError("Please log in to view your job posts.");
        return;
      }

      setJobsLoading(true);
      setJobsError("");

      const jobsQuery = query(
        collection(firebaseDb, "jobs"),
        where("clientId", "==", user.uid)
      );

      unsubscribeJobs = onSnapshot(
        jobsQuery,
        (snapshot) => {
          const items: JobPost[] = snapshot.docs.map((docSnap) => {
            const data = docSnap.data() as any;
            return {
              id: docSnap.id,
              title: data.title ?? "",
              status: (data.status as JobStatus) ?? "Open",
              budget: data.budget ?? "",
              proposals: data.proposals ?? 0,
              tags: Array.isArray(data.skills) ? data.skills : [],
              description: data.description ?? "",
              urgent: !!data.urgent,
              jobType: data.jobType ?? "",
              createdAt: data.createdAt,
            };
          });
          setJobs(items);
          setJobsLoading(false);
          if (items.length) {
            const latest = [...items].sort((a, b) => {
              const aTime = a.createdAt?.seconds ? a.createdAt.seconds : 0;
              const bTime = b.createdAt?.seconds ? b.createdAt.seconds : 0;
              return bTime - aTime;
            })[0];
            if (latest?.id) {
              setSelectedJobId((current) => current || latest.id);
            }
          }
        },
        () => {
          setJobsLoading(false);
          setJobsError("Unable to load latest job posts.");
        }
      );
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeJobs) unsubscribeJobs();
    };
  }, []);

  return (
    <section className="w-full">
      <div className="rounded-[16px] border border-[#EAE7E2] bg-white p-6 shadow-[0_8px_22px_rgba(0,0,0,0.05)]">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#8C4F00]">
              Client Dashboard
            </div>
            <h1 className="mt-2 text-[26px] font-semibold tracking-[-0.02em] text-[#1a1a1a]">
              Welcome back, Atlas Ventures
            </h1>
            <p className="mt-2 text-[12px] leading-[1.7] text-[#6b6762]">
              Track hiring momentum, manage contracts, and keep your Bitcoin initiatives moving.
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
            <Button size="sm" variant="outline" className="rounded-full w-full sm:w-auto">
              View Reports
            </Button>
            <Button size="sm" className="rounded-full w-full sm:w-auto">
              Post New Job
            </Button>
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {METRICS.map((metric) => (
          <DashboardMetricCard
            key={metric.label}
            label={metric.label}
            value={metric.value}
            change={metric.change}
            tone={metric.tone}
          />
        ))}
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-[1.1fr_1fr]">
        <div className="rounded-[12px] border border-[#EAE7E2] bg-white p-5">
          <div className="flex items-center justify-between">
            <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#F5A623]">
              Latest Active Contracts
            </div>
            <span className="text-[11px] text-[#9e9690]">Updated today</span>
          </div>
          <div className="mt-4 flex flex-col gap-3">
            {CONTRACTS.filter((c) => c.status === "Active").map((contract) => (
              <button
                key={contract.id}
                type="button"
                onClick={() => {
                  setSelectedContractId(contract.id);
                  setContractModalOpen(true);
                }}
                className="text-left"
              >
                <ClientContractCard {...contract} showDetailsHint={false} />
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-[12px] border border-[#EAE7E2] bg-white p-5 overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#F5A623]">
              Latest Job Posts
            </div>
            <span className="text-[11px] text-[#9e9690]">New this week</span>
          </div>
          <div className="mt-4 flex flex-col gap-3">
            {jobsLoading ? (
              <div className="rounded-[12px] border border-[#EAE7E2] bg-[#FAF8F5] p-4 text-[12px] text-[#6b6762]">
                Loading latest jobs...
              </div>
            ) : jobsError ? (
              <div className="rounded-[12px] border border-[#EAE7E2] bg-[#FFF6F2] p-4 text-[12px] text-[#8C4F00]">
                {jobsError}
              </div>
            ) : latestJobs.length ? (
              latestJobs.map((job) => (
                <ClientJobPostCard
                  key={job.id}
                  {...job}
                  showDetailsHint={false}
                  onSelect={() => {
                    setSelectedJobId(job.id);
                    setJobModalOpen(true);
                  }}
                />
              ))
            ) : (
              <div className="rounded-[12px] border border-[#EAE7E2] bg-[#FAF8F5] p-4 text-[12px] text-[#6b6762]">
                No job posts yet.
              </div>
            )}
          </div>
        </div>
      </div>

      {contractModalOpen && selectedContract ? (
        <div className="fixed inset-0 z-[80] flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setContractModalOpen(false)}
          />
          <div className="relative z-[81] w-full max-w-3xl max-h-[85vh] overflow-y-auto rounded-[16px] border border-[#EAE7E2] bg-white p-6 shadow-[0_20px_50px_rgba(0,0,0,0.2)]">
            <button
              type="button"
              onClick={() => setContractModalOpen(false)}
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
            <div className="mt-4 mb-4 text-[12px] leading-[1.7] text-[#6b6762]">
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

      {jobModalOpen && selectedJob ? (
        <div className="fixed inset-0 z-[80] flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setJobModalOpen(false)}
          />
          <div className="relative z-[81] w-full max-w-3xl max-h-[85vh] overflow-y-auto rounded-[16px] border border-[#EAE7E2] bg-white p-6 shadow-[0_20px_50px_rgba(0,0,0,0.2)]">
            <button
              type="button"
              onClick={() => setJobModalOpen(false)}
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
                  {selectedJob.status}
                  {formatBudget(selectedJob.budget) ? ` • ${formatBudget(selectedJob.budget)}` : ""}
                  {" "}• {selectedJob.proposals} proposal{selectedJob.proposals !== 1 ? "s" : ""}
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {selectedJob.tags.map((tag) => (
                    <span key={tag} className="inline-flex rounded-full bg-[#F6F3F1] px-3 py-1 text-[10px] font-semibold uppercase text-[#666]">
                      {tag}
                    </span>
                  ))}
                </div>
                {selectedJob.urgent ? (
                  <div className="mt-3 inline-flex items-center rounded-full bg-[#FFF0E6] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#B45309]">
                    Urgent
                  </div>
                ) : null}
                {selectedJob.jobType ? (
                  <div className="mt-2 text-[11px] text-[#6b6762]">
                    Type: {selectedJob.jobType}
                  </div>
                ) : null}
              </div>
            </div>

            {/* ✅ Description is cleaned and truncated — no raw error logs shown */}
            {selectedJob.description?.trim() ? (
              <div className="mt-4 rounded-[10px] border border-[#EFECE7] bg-[#FAF8F5] px-4 py-3 text-[12px] leading-[1.7] text-[#6b6762] line-clamp-4 overflow-y-auto break-words">
                {selectedJob.description.replace(/\s{2,}/g, " ").trim()}
              </div>
            ) : null}

            <div className="mt-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="text-[11px] text-[#6b6762]">
                Review candidates and select the freelancers you want to hire.
              </div>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-2">
                <span className="text-[11px] text-[#9e9690]">
                  {Object.values(selectedProposals).filter(Boolean).length} selected
                </span>
                <Button size="sm" variant="outline" className="rounded-full w-full sm:w-auto">
                  View Details
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
    </section>
  );
}