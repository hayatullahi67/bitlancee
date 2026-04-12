"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowUpRight, Briefcase, Search } from "lucide-react";
import { firebaseAuth, firebaseDb } from "@/lib/firebase";
import { collection, doc, getDoc, onSnapshot, query, where } from "firebase/firestore";

type Proposal = {
  id: string;
  jobTitle: string;
  clientName: string;
  clientId?: string;
  rate: string;
  status: string;
  hoursPerWeek: string;
  pricingType: string;
  cover: string;
  jobId?: string;
  jobDescription?: string;
  jobCategory?: string;
  createdAt?: any;
};

const formatSats = (value: string) =>
  value?.trim()
    ? value.toLowerCase().includes("sats")
      ? value
      : `${value} sats`
    : "";

const formatStatus = (value: string) => {
  if (value === "accepted") return "Accepted";
  if (value === "rejected") return "Rejected";
  return "Pending";
};

const cleanText = (text: string) =>
  text?.replace(/\s{2,}/g, " ").trim() ?? "";

const isPlaceholderClientName = (value: string) =>
  !value || value.trim().toLowerCase() === "client";

export default function FreelancerProposalsContent() {
  const [view, setView] = useState<"all" | "accepted" | "pending" | "rejected">("all");
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const clientNameCache = useRef<Record<string, string>>({});

  useEffect(() => {
    const unsubscribeAuth = firebaseAuth.onAuthStateChanged((user) => {
      if (!user) {
        setProposals([]);
        setLoading(false);
        setErrorMessage("Please log in to view proposals.");
        return;
      }
      setLoading(true);
      setErrorMessage("");
      const proposalsQuery = query(
        collection(firebaseDb, "proposals"),
        where("freelancerId", "==", user.uid)
      );
      const unsubscribe = onSnapshot(
        proposalsQuery,
        (snapshot) => {
          const hydrate = async () => {
            const items = await Promise.all(
              snapshot.docs.map(async (docSnap) => {
                const data = docSnap.data() as any;
                let clientId = data.clientId ?? "";
                let clientName = data.clientName ?? "";
                const jobId = data.jobId ?? "";
                let jobTitle = data.jobTitle ?? "Job Proposal";
                let jobDescription = "";
                let jobCategory = "";

                // Always fetch job to get latest title, description, category, and clientId
                if (jobId) {
                  try {
                    const jobSnap = await getDoc(doc(firebaseDb, "jobs", jobId));
                    if (jobSnap.exists()) {
                      const jobData = jobSnap.data() as any;
                      if (!clientId) clientId = jobData.clientId ?? "";
                      const jobClientName = jobData.clientName ?? jobData.clientCompany ?? "";
                      if (isPlaceholderClientName(clientName) && jobClientName) {
                        clientName = jobClientName;
                      }
                      jobTitle = jobData.title ?? jobTitle;
                      jobDescription = cleanText(jobData.description ?? "");
                      jobCategory = jobData.category ?? "";
                    }
                  } catch {
                    // ignore
                  }
                }

                // If we still don't have a name, look it up from all_users
                if (isPlaceholderClientName(clientName) && clientId) {
                  if (clientNameCache.current[clientId]) {
                    clientName = clientNameCache.current[clientId];
                  } else {
                    try {
                      // Try all_users first
                      const allUsersSnap = await getDoc(doc(firebaseDb, "all_users", clientId));
                      if (allUsersSnap.exists()) {
                        const d = allUsersSnap.data() as any;
                        clientName = d.fullName ?? d.name ?? d.email ?? "";
                      }
                      // Fallback to clients collection
                      if (!clientName) {
                        const clientsSnap = await getDoc(doc(firebaseDb, "clients", clientId));
                        if (clientsSnap.exists()) {
                          const d = clientsSnap.data() as any;
                          clientName = d.companyName ?? d.fullName ?? d.name ?? "";
                        }
                      }
                      clientNameCache.current[clientId] = clientName || "Client";
                    } catch {
                      clientName = "Client";
                    }
                  }
                }

                return {
                  id: docSnap.id,
                  jobTitle,
                  clientName: clientName || "Client",
                  clientId,
                  rate: formatSats(data.rate ?? "0"),
                  status: data.status ?? "submitted",
                  hoursPerWeek: data.hoursPerWeek ?? "",
                  pricingType: data.pricingType ?? "Fixed Price",
                  cover: cleanText(data.cover ?? ""),
                  jobId,
                  jobDescription,
                  jobCategory,
                  createdAt: data.createdAt,
                };
              })
            );
            setProposals(items);
            setLoading(false);
          };
          hydrate();
        },
        () => {
          setLoading(false);
          setErrorMessage("Unable to load proposals.");
        }
      );
      return () => unsubscribe();
    });
    return () => unsubscribeAuth();
  }, []);

  const filtered = useMemo(() => {
    if (view === "accepted") return proposals.filter((p) => p.status === "accepted");
    if (view === "rejected") return proposals.filter((p) => p.status === "rejected");
    if (view === "pending") return proposals.filter((p) => p.status === "submitted");
    return proposals;
  }, [view, proposals]);

  const openDetails = async (proposal: Proposal) => {
    setSelectedProposal(proposal);
    setSelectedJob(null);
    setIsModalOpen(true);
    if (!proposal.jobId) return;
    const snap = await getDoc(doc(firebaseDb, "jobs", proposal.jobId));
    if (snap.exists()) {
      setSelectedJob({ id: snap.id, ...snap.data() });
    }
  };

  return (
    <section className="w-full">
      <div className="rounded-[12px] border border-[#EAE7E2] bg-white p-6 shadow-[0_8px_22px_rgba(0,0,0,0.05)]">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#8C4F00]">
              Proposals
            </div>
            <h1 className="mt-2 text-[24px] font-semibold tracking-[-0.02em] text-[#1a1a1a]">
              Your submitted proposals
            </h1>
            <p className="mt-2 text-[12px] leading-[1.7] text-[#6b6762]">
              Track your bids, client responses, and next steps.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-[12px] border border-[#EAE7E2] bg-[#F9F6F2] p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#F5A623]">
              Filters
            </div>
            <div className="text-[12px] text-[#6b6762]">View by proposal status.</div>
          </div>
          <div className="flex items-center gap-2">
            {[
              { id: "all", label: "All" },
              { id: "pending", label: "Pending" },
              { id: "accepted", label: "Accepted" },
              { id: "rejected", label: "Rejected" },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setView(tab.id as any)}
                className={`rounded-full px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.08em] ${
                  view === tab.id
                    ? "bg-white text-[#1a1a1a] shadow-sm"
                    : "bg-transparent text-[#6b6762] border border-[#EAE7E2]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4 space-y-4">
          {loading ? (
            <div className="bg-white rounded-3xl border border-[#ece7df] p-10 text-center text-[#6b6762]">
              Loading proposals...
            </div>
          ) : errorMessage ? (
            <div className="bg-white rounded-3xl border border-[#F7931A]/20 p-10 text-center text-[#8C4F00]">
              {errorMessage}
            </div>
          ) : filtered.length ? (
            filtered.map((proposal) => (
              <ProposalCard
                key={proposal.id}
                proposal={proposal}
                onClick={() => openDetails(proposal)}
              />
            ))
          ) : (
            <div className="bg-white rounded-3xl border border-[#F7931A]/20 border-dashed p-10 text-center">
              <Search className="w-12 h-12 text-[#F7931A]/30 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-[#1a1a1a]">No proposals found</h3>
              <p className="text-[#6b6560] text-sm">You haven't submitted any proposals yet.</p>
            </div>
          )}
        </div>
      </div>

      {isModalOpen && selectedProposal ? (
        <div className="fixed inset-0 z-[80] flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setIsModalOpen(false)}
          />
          <div className="relative z-[81] w-full max-w-4xl max-h-[85vh] overflow-y-auto rounded-[16px] border border-[#EAE7E2] bg-white p-6 shadow-[0_20px_50px_rgba(0,0,0,0.2)]">
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

            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#8C4F00]">
                  Proposal Details
                </div>
                <div className="mt-2 text-[20px] font-semibold text-[#1a1a1a] break-words">
                  {selectedProposal.jobTitle}
                </div>
                <div className="text-[12px] text-[#9e9690]">
                  Client: {selectedProposal.clientName} • {formatStatus(selectedProposal.status)}
                </div>
              </div>
              <div className="text-right shrink-0">
                <div className="text-[12px] font-semibold text-[#8C4F00]">
                  {selectedProposal.rate}
                </div>
                <div className="text-[10px] text-[#9e9690]">
                  {selectedProposal.pricingType} • {selectedProposal.hoursPerWeek || "—"} hrs/week
                </div>
              </div>
            </div>

            <div className="mt-4 rounded-[10px] border border-[#EFECE7] bg-[#FAF8F5] px-4 py-3 text-[12px] leading-[1.7] text-[#6b6762] break-words">
              {selectedProposal.cover}
            </div>

            {selectedJob ? (
              <div className="mt-6 rounded-[12px] border border-[#EAE7E2] bg-white p-4">
                <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#F5A623]">
                  Job Details
                </div>
                <div className="mt-2 text-[13px] text-[#6b6762] break-all whitespace-pre-wrap overflow-hidden">
                  {cleanText(selectedJob.description ?? "") || "No description provided."}
                </div>
              </div>
            ) : (
              <div className="mt-6 text-[12px] text-[#9e9690]">Loading job details...</div>
            )}
          </div>
        </div>
      ) : null}
    </section>
  );
}

function ProposalCard({
  proposal,
  onClick,
}: {
  proposal: Proposal;
  onClick: () => void;
}) {
  const displayText = proposal.jobDescription || proposal.cover;

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-3xl border border-[#ece7df] p-6 shadow-sm transition-all hover:shadow-xl hover:border-[#F7931A]/30 group overflow-hidden cursor-pointer"
    >
      {/* Top row: status badge + pricing type */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span
            className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest ${
              proposal.status === "accepted"
                ? "bg-[#E6F4EA] text-[#2E7D32]"
                : proposal.status === "rejected"
                ? "bg-[#FDECEA] text-[#C62828]"
                : "bg-[#FCF9F7] text-[#8C4F00]"
            }`}
          >
            {formatStatus(proposal.status)}
          </span>
          <span className="text-xs text-[#6b6560] font-medium">{proposal.pricingType}</span>
        </div>
        {proposal.rate ? (
          <span className="text-[15px] font-bold text-[#8C4F00] whitespace-nowrap shrink-0">
            {proposal.rate}
          </span>
        ) : null}
      </div>

      {/* Title */}
      <div className="flex items-start justify-between gap-4 mb-3">
        <h3 className="text-lg font-bold text-[#1a1a1a] flex-1 break-words min-w-0">
          {proposal.jobTitle}
        </h3>
      </div>

      {/* Client + meta */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <Briefcase className="w-4 h-4 text-[#6b6560] shrink-0" />
        <span className="text-sm font-medium text-[#6b6560] truncate">{proposal.clientName}</span>
        <span className="text-xs text-[#6b6560]">•</span>
        <span className="text-xs text-[#6b6560] whitespace-nowrap">
          {proposal.hoursPerWeek || "—"} hrs/week
        </span>
        {proposal.jobCategory ? (
          <>
            <span className="text-xs text-[#6b6560]">•</span>
            <span className="text-xs text-[#6b6560]">{proposal.jobCategory}</span>
          </>
        ) : null}
      </div>

      {/* Description — 2 line clamp, break-all for unspaced strings */}
      {displayText ? (
        <p
          className="text-sm text-[#6b6560] leading-relaxed mb-4 overflow-hidden break-all"
          style={{
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {displayText}
        </p>
      ) : null}

      {/* View details */}
      <div className="flex justify-end">
        <span className="flex items-center gap-1 text-xs font-bold text-[#8C4F00] group-hover:underline">
          View Details
          <ArrowUpRight className="w-3 h-3" />
        </span>
      </div>
    </div>
  );
}
