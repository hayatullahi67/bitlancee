"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/atoms/Button";
import DashboardMetricCard from "@/components/molecules/DashboardMetricCard";
import ClientContractCard from "@/components/molecules/ClientContractCard";
import { firebaseAuth, firebaseDb } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  where,
} from "firebase/firestore";

type ContractStatus = "Active" | "Review" | "Completed";

type Contract = {
  id: string;
  title: string;
  freelancer: string;
  freelancerId?: string;
  clientId?: string;
  jobId?: string;
  contractType?: "Fixed Price" | "Hourly";
  progress: number;
  nextMilestone: string;
  status: ContractStatus;
  budget: string;
  startDate: string;
  dueDate: string;
  description: string;
  scopeItems?: string[];
  milestones?: Array<{
    name: string;
    amount: string;
    deadline: string;
    status: "Pending" | "In Progress" | "Approved";
  }>;
};

const formatDate = (value: any) => {
  if (!value) return "-";
  if (typeof value === "string") return value;
  const date = value?.seconds ? new Date(value.seconds * 1000) : new Date(value);
  return date.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
};

const formatSats = (value: string) => {
  const safeValue = String(value ?? "").trim();
  if (!safeValue) return "0 sats";
  return safeValue.toLowerCase().includes("sats") ? safeValue : `${safeValue} sats`;
};

const parseSats = (value: string) => {
  const cleaned = String(value ?? "").replace(/[^0-9.]/g, "");
  return cleaned ? Number(cleaned) : 0;
};

export default function ClientContractsContent() {
  const router = useRouter();
  const [view, setView] = useState<"active" | "ongoing">("active");
  const [selectedId, setSelectedId] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const createConversationId = (jobId: string, freelancerId: string) => `${jobId}_${freelancerId}`;
  const freelancerNameCache = useRef<Record<string, string>>({});
  const clientNameCache = useRef<Record<string, string>>({});
  const freelancerAvatarCache = useRef<Record<string, string>>({});
  const clientAvatarCache = useRef<Record<string, string>>({});

  const resolveFreelancerName = async (freelancerId: string, fallbackName: string) => {
    const initialFallback = fallbackName?.trim() || "";
    if (!freelancerId) return initialFallback || "Freelancer";
    if (freelancerNameCache.current[freelancerId]) return freelancerNameCache.current[freelancerId];

    let resolvedName = initialFallback;

    try {
      const allUsersSnap = await getDoc(doc(firebaseDb, "all_users", freelancerId));
      if (allUsersSnap.exists()) {
        const data = allUsersSnap.data() as any;
        resolvedName = data.fullName ?? data.name ?? data.email ?? resolvedName;
      }
    } catch {
      // Continue with freelancers collection lookup.
    }

    if (!resolvedName) {
      try {
        const freelancerDocSnap = await getDoc(doc(firebaseDb, "freelancers", freelancerId));
        if (freelancerDocSnap.exists()) {
          const data = freelancerDocSnap.data() as any;
          const composedName = `${data.firstName ?? ""} ${data.lastName ?? ""}`.trim();
          resolvedName = data.fullName || composedName || data.name || resolvedName;
        }
      } catch {
        // Continue with UID-based lookup.
      }
    }

    if (!resolvedName) {
      try {
        const freelancersByUidQuery = query(
          collection(firebaseDb, "freelancers"),
          where("uid", "==", freelancerId),
          limit(1)
        );
        const freelancersByUidSnap = await getDocs(freelancersByUidQuery);
        if (!freelancersByUidSnap.empty) {
          const data = freelancersByUidSnap.docs[0].data() as any;
          const composedName = `${data.firstName ?? ""} ${data.lastName ?? ""}`.trim();
          resolvedName = data.fullName || composedName || data.name || resolvedName;
        }
      } catch {
        // Keep fallback below.
      }
    }

    const finalName = resolvedName || "Freelancer";
    freelancerNameCache.current[freelancerId] = finalName;
    return finalName;
  };

  const resolveClientName = async (clientId: string, fallbackName: string) => {
    const initialFallback = fallbackName?.trim() || "";
    if (!clientId) return initialFallback || "Client";
    if (clientNameCache.current[clientId]) return clientNameCache.current[clientId];

    let resolvedName = initialFallback;

    try {
      const clientDocSnap = await getDoc(doc(firebaseDb, "clients", clientId));
      if (clientDocSnap.exists()) {
        const data = clientDocSnap.data() as any;
        resolvedName = data.fullName ?? data.firstName ?? data.name ?? resolvedName;
      }
    } catch {
      // Continue with UID-based lookup.
    }

    if (!resolvedName) {
      try {
        const clientsByUidQuery = query(
          collection(firebaseDb, "clients"),
          where("uid", "==", clientId),
          limit(1)
        );
        const clientsByUidSnap = await getDocs(clientsByUidQuery);
        if (!clientsByUidSnap.empty) {
          const data = clientsByUidSnap.docs[0].data() as any;
          resolvedName = data.fullName ?? data.firstName ?? data.name ?? resolvedName;
        }
      } catch {
        // Continue with all_users fallback.
      }
    }

    if (!resolvedName) {
      try {
        const allUsersSnap = await getDoc(doc(firebaseDb, "all_users", clientId));
        if (allUsersSnap.exists()) {
          const data = allUsersSnap.data() as any;
          resolvedName = data.fullName ?? data.name ?? data.email ?? resolvedName;
        }
      } catch {
        // Keep fallback below.
      }
    }

    const finalName = resolvedName || "Client";
    clientNameCache.current[clientId] = finalName;
    return finalName;
  };

  const resolveClientAvatar = async (clientId: string) => {
    if (!clientId) return "";
    if (clientAvatarCache.current[clientId] !== undefined) return clientAvatarCache.current[clientId];

    let avatarUrl = "";
    try {
      const [clientSnap, allUsersSnap] = await Promise.all([
        getDoc(doc(firebaseDb, "clients", clientId)),
        getDoc(doc(firebaseDb, "all_users", clientId)),
      ]);
      const c = clientSnap.exists() ? (clientSnap.data() as any) : {};
      const a = allUsersSnap.exists() ? (allUsersSnap.data() as any) : {};
      avatarUrl = c.avatarUrl ?? a.avatarUrl ?? "";
    } catch {
      avatarUrl = "";
    }

    clientAvatarCache.current[clientId] = avatarUrl;
    return avatarUrl;
  };

  const resolveFreelancerAvatar = async (freelancerId: string) => {
    if (!freelancerId) return "";
    if (freelancerAvatarCache.current[freelancerId] !== undefined) {
      return freelancerAvatarCache.current[freelancerId];
    }

    let avatarUrl = "";
    try {
      const [freelancerSnap, allUsersSnap] = await Promise.all([
        getDoc(doc(firebaseDb, "freelancers", freelancerId)),
        getDoc(doc(firebaseDb, "all_users", freelancerId)),
      ]);
      const f = freelancerSnap.exists() ? (freelancerSnap.data() as any) : {};
      const a = allUsersSnap.exists() ? (allUsersSnap.data() as any) : {};
      avatarUrl = f.avatarUrl ?? a.avatarUrl ?? "";
    } catch {
      avatarUrl = "";
    }

    freelancerAvatarCache.current[freelancerId] = avatarUrl;
    return avatarUrl;
  };

  useEffect(() => {
    let unsubscribeContracts: (() => void) | undefined;
    let isActive = true;

    const unsubscribeAuth = onAuthStateChanged(firebaseAuth, (user) => {
      if (!user) {
        if (unsubscribeContracts) unsubscribeContracts();
        setContracts([]);
        setSelectedId("");
        setLoading(false);
        setErrorMessage("Please log in to view contracts.");
        return;
      }

      setLoading(true);
      setErrorMessage("");
      const contractsQuery = query(
        collection(firebaseDb, "contracts"),
        where("clientId", "==", user.uid)
      );

      unsubscribeContracts = onSnapshot(
        contractsQuery,
        (snapshot) => {
          const hydrateContracts = async () => {
            const items = await Promise.all(
              snapshot.docs.map(async (docSnap) => {
                const data = docSnap.data() as any;
                const freelancerId = data.freelancerId ?? "";
                const freelancer = await resolveFreelancerName(
                  freelancerId,
                  data.freelancerName ?? ""
                );

                return {
                  id: docSnap.id,
                  title: data.title ?? "Contract",
                  freelancer,
                  freelancerId,
                  clientId: data.clientId ?? "",
                  jobId: data.jobId ?? "",
                  contractType: data.contractType ?? data.jobType ?? "Fixed Price",
                  progress: typeof data.progress === "number" ? data.progress : 0,
                  nextMilestone: data.nextMilestone ?? "-",
                  status: (data.status as ContractStatus) ?? "Active",
                  budget: formatSats(data.budget ?? "0"),
                  startDate: formatDate(data.startDate),
                  dueDate: formatDate(data.dueDate),
                  description: data.description ?? "-",
                  scopeItems: Array.isArray(data.scopeItems) ? data.scopeItems : [],
                  milestones: Array.isArray(data.milestones) ? data.milestones : [],
                } satisfies Contract;
              })
            );

            if (!isActive) return;
            setContracts(items);
            setLoading(false);
            setSelectedId((prev) => (prev || !items.length ? prev : items[0].id));
          };

          hydrateContracts();
        },
        () => {
          if (!isActive) return;
          setLoading(false);
          setErrorMessage("Unable to load contracts.");
        }
      );
    });

    return () => {
      isActive = false;
      unsubscribeAuth();
      if (unsubscribeContracts) unsubscribeContracts();
    };
  }, []);

  const activeContracts = useMemo(
    () => contracts.filter((c) => c.status === "Active"),
    [contracts]
  );
  const ongoingContracts = useMemo(
    () => contracts.filter((c) => c.status === "Review" || c.status === "Completed"),
    [contracts]
  );

  const visibleContracts = view === "active" ? activeContracts : ongoingContracts;
  const selectedContract = contracts.find((c) => c.id === selectedId) ?? visibleContracts[0];

  const totalSpend = contracts.reduce((acc, c) => acc + parseSats(c.budget), 0);
  const inReviewCount = contracts.filter((c) => c.status === "Review").length;

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
        <DashboardMetricCard
          label="Active Contracts"
          value={`${activeContracts.length}`}
          change="Live"
          tone="up"
        />
        <DashboardMetricCard
          label="In Review"
          value={`${inReviewCount}`}
          change="Needs approval"
          tone="neutral"
        />
        <DashboardMetricCard
          label="Milestones Due"
          value="0"
          change="Next 7 days"
          tone="down"
        />
        <DashboardMetricCard
          label="Total Spend"
          value={`${totalSpend.toLocaleString()} sats`}
          change="All time"
          tone="up"
        />
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
            {loading ? (
              <div className="rounded-[12px] border border-[#EAE7E2] bg-white p-4 text-[12px] text-[#6b6762]">
                Loading contracts...
              </div>
            ) : errorMessage ? (
              <div className="rounded-[12px] border border-[#EAE7E2] bg-[#FFF6F2] p-4 text-[12px] text-[#8C4F00]">
                {errorMessage}
              </div>
            ) : visibleContracts.length ? (
              visibleContracts.map((contract) => (
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
              ))
            ) : (
              <div className="rounded-[12px] border border-[#EAE7E2] bg-white p-4 text-[12px] text-[#6b6762]">
                No contracts in this view yet.
              </div>
            )}
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
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
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
                  Freelancer: {selectedContract.freelancer} | {selectedContract.status}
                </div>
              </div>
            </div>

            <div className="mt-4 text-[12px] leading-[1.7] text-[#6b6762]">
              {selectedContract.description}
            </div>

            <div className="mt-5 rounded-[12px] border border-[#EAE7E2] bg-[#FAF8F5] p-4">
              <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#8C4F00]">
                Contract Overview
              </div>
              <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 text-[11px] text-[#6b6762]">
                <div className="rounded-[10px] border border-[#EFECE7] bg-white px-3 py-2">
                  <div className="uppercase tracking-[0.12em] text-[#9e9690]">Project</div>
                  <div className="mt-1 font-semibold text-[#1a1a1a]">{selectedContract.title}</div>
                </div>
                <div className="rounded-[10px] border border-[#EFECE7] bg-white px-3 py-2">
                  <div className="uppercase tracking-[0.12em] text-[#9e9690]">Freelancer</div>
                  <div className="mt-1 font-semibold text-[#1a1a1a]">{selectedContract.freelancer}</div>
                </div>
                <div className="rounded-[10px] border border-[#EFECE7] bg-white px-3 py-2">
                  <div className="uppercase tracking-[0.12em] text-[#9e9690]">Contract Type</div>
                  <div className="mt-1 font-semibold text-[#1a1a1a]">
                    {selectedContract.contractType ?? "Fixed Price"}
                  </div>
                </div>
                <div className="rounded-[10px] border border-[#EFECE7] bg-white px-3 py-2">
                  <div className="uppercase tracking-[0.12em] text-[#9e9690]">Status</div>
                  <div className="mt-1 font-semibold text-[#1a1a1a]">{selectedContract.status}</div>
                </div>
                <div className="rounded-[10px] border border-[#EFECE7] bg-white px-3 py-2">
                  <div className="uppercase tracking-[0.12em] text-[#9e9690]">Start Date</div>
                  <div className="mt-1 font-semibold text-[#1a1a1a]">{selectedContract.startDate}</div>
                </div>
                <div className="rounded-[10px] border border-[#EFECE7] bg-white px-3 py-2">
                  <div className="uppercase tracking-[0.12em] text-[#9e9690]">Budget</div>
                  <div className="mt-1 font-semibold text-[#1a1a1a]">{selectedContract.budget}</div>
                </div>
              </div>
            </div>

            <div className="mt-5 rounded-[12px] border border-[#EAE7E2] bg-white p-4">
              <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#8C4F00]">
                Scope Of Work
              </div>
              {selectedContract.scopeItems?.length ? (
                <ul className="mt-3 grid grid-cols-1 gap-2 text-[12px] text-[#6b6762]">
                  {selectedContract.scopeItems.map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <span className="mt-1 h-1.5 w-1.5 rounded-full bg-[#F7931A]" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-3 text-[12px] text-[#6b6762]">
                  Define the deliverables and features for this contract.
                </p>
              )}
            </div>

            {selectedContract.contractType === "Fixed Price" ? (
              <div className="mt-5 rounded-[12px] border border-[#EAE7E2] bg-[#FAF8F5] p-4">
                <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#8C4F00]">
                  Milestones
                </div>
                {selectedContract.milestones?.length ? (
                  <div className="mt-3 space-y-3">
                    {selectedContract.milestones.map((milestone) => (
                      <div
                        key={milestone.name}
                        className="flex flex-wrap items-center justify-between gap-3 rounded-[10px] border border-[#EFECE7] bg-white px-3 py-2 text-[11px]"
                      >
                        <div>
                          <div className="font-semibold text-[#1a1a1a]">{milestone.name}</div>
                          <div className="text-[#9e9690]">{milestone.deadline}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-[#8C4F00]">{milestone.amount}</div>
                          <div className="text-[10px] uppercase tracking-[0.12em] text-[#6b6762]">
                            {milestone.status}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="mt-3 text-[12px] text-[#6b6762]">
                    Milestones will appear here once defined.
                  </p>
                )}
              </div>
            ) : null}

            <div className="mt-5 rounded-[12px] border border-[#EAE7E2] bg-white p-4">
              <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#8C4F00]">
                Payment Details
              </div>
              <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 text-[11px] text-[#6b6762]">
                <div className="rounded-[10px] border border-[#EFECE7] bg-[#FAF8F5] px-3 py-2">
                  <div className="uppercase tracking-[0.12em] text-[#9e9690]">Total Value</div>
                  <div className="mt-1 font-semibold text-[#1a1a1a]">{selectedContract.budget}</div>
                </div>
                <div className="rounded-[10px] border border-[#EFECE7] bg-[#FAF8F5] px-3 py-2">
                  <div className="uppercase tracking-[0.12em] text-[#9e9690]">Paid</div>
                  <div className="mt-1 font-semibold text-[#1a1a1a]">0 sats</div>
                </div>
                <div className="rounded-[10px] border border-[#EFECE7] bg-[#FAF8F5] px-3 py-2">
                  <div className="uppercase tracking-[0.12em] text-[#9e9690]">Escrow</div>
                  <div className="mt-1 font-semibold text-[#1a1a1a]">0 sats</div>
                </div>
                <div className="rounded-[10px] border border-[#EFECE7] bg-[#FAF8F5] px-3 py-2">
                  <div className="uppercase tracking-[0.12em] text-[#9e9690]">Pending</div>
                  <div className="mt-1 font-semibold text-[#1a1a1a]">0 sats</div>
                </div>
              </div>
              <p className="mt-3 text-[11px] text-[#9e9690]">
                Payments are placeholders until escrow is implemented.
              </p>
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
              <Button
                size="sm"
                variant="outline"
                className="rounded-full"
                onClick={async () => {
                  if (!selectedContract?.jobId || !selectedContract?.freelancerId) return;
                  const clientId = firebaseAuth.currentUser?.uid ?? selectedContract.clientId ?? "";
                  if (!clientId) return;

                  let clientName = await resolveClientName(clientId, "");
                  let freelancerName = await resolveFreelancerName(
                    selectedContract.freelancerId,
                    selectedContract.freelancer ?? ""
                  );
                  const [clientAvatarUrl, freelancerAvatarUrl] = await Promise.all([
                    resolveClientAvatar(clientId),
                    resolveFreelancerAvatar(selectedContract.freelancerId),
                  ]);
                  if (!clientName) clientName = "Client";
                  if (!freelancerName) freelancerName = "Freelancer";

                  const conversationId = createConversationId(
                    selectedContract.jobId,
                    selectedContract.freelancerId
                  );

                  await setDoc(
                    doc(firebaseDb, "conversations", conversationId),
                    {
                      jobId: selectedContract.jobId,
                      jobTitle: selectedContract.title,
                      proposalId: "",
                      clientId,
                      clientName,
                      freelancerId: selectedContract.freelancerId,
                      freelancerName,
                      clientAvatarUrl,
                      freelancerAvatarUrl,
                      createdBy: "system",
                      canFreelancerMessage: true,
                      unread: {
                        [clientId]: 0,
                        [selectedContract.freelancerId]: 0,
                      },
                      updatedAt: serverTimestamp(),
                      createdAt: serverTimestamp(),
                    },
                    { merge: true }
                  );

                  router.push(`/client/dashboard/messages?chat=${conversationId}`);
                }}
              >
                Message Freelancer
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
