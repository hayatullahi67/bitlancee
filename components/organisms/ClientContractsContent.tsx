"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Button from "@/components/atoms/Button";
import DashboardMetricCard from "@/components/molecules/DashboardMetricCard";
import ClientContractCard from "@/components/molecules/ClientContractCard";
import { firebaseAuth, firebaseDb } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  increment,
  limit,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";

type ContractStatus = "Active" | "Review" | "Completed";

type Contract = {
  id: string;
  title: string;
  freelancer: string;
  freelancerId?: string;
  clientId?: string;
  clientName?: string;
  jobId?: string;
  contractType?: "Fixed Price" | "Hourly";
  progress: number;
  nextMilestone: string;
  status: ContractStatus;
  budget: string;
  startDate: string;
  dueDate: string;
  description: string;
  paymentStatus?: "unfunded" | "invoice_created" | "funded" | "released" | "expired";
  paymentInstallments?: number;
  paymentCurrentInstallment?: number;
  paymentReleasedInstallments?: number;
  paymentTotalAmountSats?: number;
  paymentPaidAmountSats?: number;
  workStatus?: "not_started" | "in_progress" | "submitted" | "changes_requested" | "approved" | "completed";
  submissionMessage?: string;
  submissionLink?: string;
  submissionAttachment?: {
    name?: string;
    url?: string;
  } | null;
  submissionReviewDueAt?: any;
  revisionMessage?: string;
  scopeItems?: string[];
  milestones?: Array<{
    name: string;
    amount: string;
    deadline: string;
    status: "Pending" | "In Progress" | "Approved";
  }>;
  createdAt?: any;
  updatedAt?: any;
};

type SubmittedJob = {
  id: string;
  contractId: string;
  description: string;
  link?: string;
  attachment?: {
    name: string;
    url: string;
  };
  submittedAt: Date;
  status: "pending" | "approved" | "rejected";
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

const calculateInstallmentAmount = (total: number, installments: number, installment: number) => {
  const safeTotal = Math.max(0, Math.trunc(total));
  const safeInstallments = Math.max(1, Math.trunc(installments));
  const safeInstallment = Math.max(1, Math.min(safeInstallments, Math.trunc(installment)));
  const base = Math.floor(safeTotal / safeInstallments);
  const remainder = safeTotal % safeInstallments;
  return base + (safeInstallment <= remainder ? 1 : 0);
};

const clampInstallments = (installments: number) => Math.max(1, Math.min(10, Math.trunc(installments)));

export default function ClientContractsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [view, setView] = useState<"active" | "ongoing">("active");
  const [selectedId, setSelectedId] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [reviewNote, setReviewNote] = useState("");
  const [isReviewing, setIsReviewing] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState("");
  const [hasOpenedFromParam, setHasOpenedFromParam] = useState(false);
  const [activeTab, setActiveTab] = useState<'contracts' | 'submitted'>('contracts');
  const [submittedJobs, setSubmittedJobs] = useState<SubmittedJob[]>([]);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [pendingApprovalJobId, setPendingApprovalJobId] = useState<string | null>(null);
  const [approvalErrorMessage, setApprovalErrorMessage] = useState<string>("");
  const [freelancerData, setFreelancerData] = useState<any>(null);
  const [loadingFreelancer, setLoadingFreelancer] = useState(false);
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
        // Ignore errors.
      }
    }

    freelancerNameCache.current[freelancerId] = resolvedName || "Freelancer";
    return freelancerNameCache.current[freelancerId];
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
        // Ignore errors.
      }
    }

    clientNameCache.current[clientId] = resolvedName || "Client";
    return clientNameCache.current[clientId];
  };

  const getConversationForContract = async (contract: Contract) => {
    if (!contract.jobId || !contract.freelancerId) return null;
    const conversationQuery = query(
      collection(firebaseDb, "conversations"),
      where("jobId", "==", contract.jobId),
      where("freelancerId", "==", contract.freelancerId),
      limit(1)
    );
    const conversationSnap = await getDocs(conversationQuery);
    return conversationSnap.empty ? null : conversationSnap.docs[0];
  };

  useEffect(() => {
    let unsubscribeContracts: (() => void) | undefined;
    let unsubscribeSubmitted: (() => void) | undefined;
    const unsubscribeAuth = onAuthStateChanged(firebaseAuth, (user) => {
      if (!user) {
        if (unsubscribeContracts) unsubscribeContracts();
        if (unsubscribeSubmitted) unsubscribeSubmitted();
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
          const items: Contract[] = snapshot.docs.map((docSnap) => {
            const data = docSnap.data() as any;
            return {
              id: docSnap.id,
              title: data.title ?? "Contract",
              freelancer: data.freelancer ?? "",
              freelancerId: data.freelancerId ?? "",
              clientId: data.clientId ?? "",
              clientName: data.clientName ?? "",
              jobId: data.jobId ?? "",
              contractType: data.contractType ?? data.jobType ?? "Fixed Price",
              status: (data.status as ContractStatus) ?? "Active",
              budget: formatSats(data.budget ?? "0"),
              progress: typeof data.progress === "number" ? data.progress : 0,
              nextMilestone: data.nextMilestone ?? "-",
              startDate: formatDate(data.startDate),
              dueDate: formatDate(data.dueDate),
              description: data.description ?? "-",
              paymentStatus: data.paymentStatus ?? "unfunded",
              paymentInstallments: Number(data.paymentInstallments ?? 1),
              paymentCurrentInstallment: Number(data.paymentCurrentInstallment ?? 1),
              workStatus: data.workStatus ?? "not_started",
              submissionMessage: data.submissionMessage ?? "",
              submissionLink: data.submissionLink ?? "",
              submissionAttachment: data.submissionAttachment ?? null,
              submissionReviewDueAt: data.submissionReviewDueAt,
              revisionMessage: data.revisionMessage ?? "",
              scopeItems: Array.isArray(data.scopeItems) ? data.scopeItems : [],
              milestones: Array.isArray(data.milestones) ? data.milestones : [],
            };
          });

          const hydrateFreelancerNames = async () => {
            const hydrated = await Promise.all(
              items.map(async (contract) => ({
                ...contract,
                freelancer: await resolveFreelancerName(
                  contract.freelancerId ?? "",
                  contract.freelancer ?? ""
                ),
              }))
            );
            hydrated.sort((a, b) => {
              const aDate = a.updatedAt || a.createdAt || 0;
              const bDate = b.updatedAt || b.createdAt || 0;
              return bDate - aDate;
            });
            setContracts(hydrated);
            setLoading(false);
            if (!selectedId && hydrated.length) setSelectedId(hydrated[0].id);
          };
          hydrateFreelancerNames();
        },
        () => {
          setLoading(false);
          setErrorMessage("Unable to load contracts.");
        }
      );

      const submittedQuery = query(collection(firebaseDb, "submitted_jobs"));
      unsubscribeSubmitted = onSnapshot(
        submittedQuery,
        (snapshot) => {
          const items: SubmittedJob[] = snapshot.docs.map((docSnap) => {
            const data = docSnap.data() as any;
            return {
              id: docSnap.id,
              contractId: data.contractId ?? "",
              description: data.description ?? "",
              link: data.link ?? "",
              attachment: data.attachment ?? null,
              submittedAt: data.submittedAt?.toDate() ?? new Date(),
              status: data.status ?? "pending",
            };
          });
          const clientContractIds = contracts.map(c => c.id);
          const filtered = items.filter(job => clientContractIds.includes(job.contractId));
          filtered.sort((a, b) => b.submittedAt.getTime() - a.submittedAt.getTime());
          setSubmittedJobs(filtered);
        },
        () => {}
      );
    });
    return () => {
      unsubscribeAuth();
      if (unsubscribeContracts) unsubscribeContracts();
      if (unsubscribeSubmitted) unsubscribeSubmitted();
    };
  }, [selectedId]);

  const activeContracts = useMemo(
    () => contracts.filter((c) => c.status === "Active"),
    [contracts]
  );
  const ongoingContracts = useMemo(
    () => contracts.filter((c) => c.status === "Review" || c.status === "Completed"),
    [contracts]
  );

  const visibleContracts = view === "active" ? activeContracts : ongoingContracts;
  const selectedContract =
    contracts.find((c) => c.id === selectedId) ?? visibleContracts[0];

  const handleApproveSubmission = async (jobId: string) => {
    setApprovalErrorMessage("");
    setPendingApprovalJobId(jobId);
    setShowPaymentModal(true);
  };

  const confirmApproveWithPayment = async () => {
    if (!pendingApprovalJobId) return;

    const job = submittedJobs.find((j) => j.id === pendingApprovalJobId);
    const contract = job ? contracts.find((c) => c.id === job.contractId) : null;

    if (!job || !contract) {
      setApprovalErrorMessage("Unable to find the contract for this submission.");
      return;
    }

    const paymentStatus = contract.paymentStatus ?? "unfunded";
    const fundedInstallments = contract.paymentCurrentInstallment ?? 0;
    const totalInstallments = contract.paymentInstallments ?? 1;
    const releasedInstallments = contract.paymentReleasedInstallments ?? 0;
    const nextMilestoneIndex = releasedInstallments + 1;
    const canRelease = fundedInstallments >= nextMilestoneIndex && (paymentStatus === "funded" || paymentStatus === "released");

    if (!canRelease) {
      setApprovalErrorMessage(
        "This milestone is not funded yet. You need to fund escrow for the next milestone before approving work."
      );
      return;
    }

    // Get freelancer's Lightning address
    const lightningAddress = freelancerData?.settings?.payment?.lightningAddress;
    if (!lightningAddress) {
      setApprovalErrorMessage("Freelancer has not set up a Lightning address. Payment cannot be processed.");
      return;
    }

    try {
      // Calculate milestone amount
      const totalAmount = contract.paymentTotalAmountSats || parseSats(contract.budget) || 0;
      const milestoneAmount = calculateInstallmentAmount(totalAmount, totalInstallments, nextMilestoneIndex);

      if (milestoneAmount <= 0) {
        setApprovalErrorMessage("Unable to calculate milestone amount.");
        return;
      }

      // Send payment to freelancer
      const paymentResponse = await fetch("/api/send-payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          lightningAddress,
          amount: milestoneAmount,
          memo: `Milestone ${nextMilestoneIndex} payment for contract: ${contract.title}`,
        }),
      });

      const rawPaymentResponse = await paymentResponse.text();
      let paymentData: any = null;
      try {
        paymentData = rawPaymentResponse ? JSON.parse(rawPaymentResponse) : null;
      } catch (parseError) {
        throw new Error(`Failed to parse payment response: ${rawPaymentResponse}`);
      }

      if (!paymentResponse.ok) {
        throw new Error(paymentData?.error ?? `Failed to send payment to freelancer: ${rawPaymentResponse}`);
      }

      // Update submitted job status
      await updateDoc(doc(firebaseDb, "submitted_jobs", pendingApprovalJobId), {
        status: "approved",
        updatedAt: serverTimestamp(),
      });

      const nextReleasedCount = releasedInstallments + 1;
      const isFinalRelease = nextReleasedCount >= totalInstallments;
      const contractUpdate = {
        workStatus: isFinalRelease ? "approved" : "in_progress",
        paymentReleasedInstallments: nextReleasedCount,
        paymentStatus: isFinalRelease ? "released" : "funded",
        updatedAt: serverTimestamp(),
      };

      await setDoc(doc(firebaseDb, "contracts", job.contractId), contractUpdate, { merge: true });

      try {
        const conversationDoc = await getConversationForContract(contract);
        if (conversationDoc) {
          await updateDoc(conversationDoc.ref, {
            workStatus: contractUpdate.workStatus,
            paymentStatus: contractUpdate.paymentStatus,
            updatedAt: serverTimestamp(),
            "lastMessage.text": `Milestone ${nextMilestoneIndex} approved and payment of ${milestoneAmount} sats sent to freelancer.`,
            "lastMessage.senderId": "system",
            "lastMessage.createdAt": serverTimestamp(),
            [`unread.${contract.freelancerId}`]: increment(1),
          });
        }
      } catch (conversationError) {
        console.error("Error updating conversation payment status:", conversationError);
      }

      setShowPaymentModal(false);
      setPendingApprovalJobId(null);
      setApprovalErrorMessage("");
    } catch (error) {
      console.error("Error approving submission:", error);
      setApprovalErrorMessage(
        error instanceof Error
          ? error.message
          : "Failed to approve the submission and send payment. Please try again."
      );
    }
  };

  const handleRejectSubmission = async (jobId: string) => {
    try {
      await updateDoc(doc(firebaseDb, "submitted_jobs", jobId), {
        status: "rejected",
        updatedAt: serverTimestamp(),
      });
      const job = submittedJobs.find(j => j.id === jobId);
      if (job) {
        await setDoc(doc(firebaseDb, "contracts", job.contractId), {
          workStatus: "changes_requested",
          revisionMessage: reviewNote || "Please make the requested changes.",
          updatedAt: serverTimestamp(),
        }, { merge: true });
      }
    } catch (error) {
      console.error("Error rejecting submission:", error);
    }
  };

  useEffect(() => {
    const fetchFreelancerPaymentData = async () => {
      if (!pendingApprovalJobId) {
        setFreelancerData(null);
        setLoadingFreelancer(false);
        return;
      }

      const job = submittedJobs.find((j) => j.id === pendingApprovalJobId);
      const contract = job ? contracts.find((c) => c.id === job.contractId) : null;
      let freelancerId = contract?.freelancerId;

      if (!freelancerId && contract?.id) {
        try {
          const contractSnap = await getDoc(doc(firebaseDb, "contracts", contract.id));
          if (contractSnap.exists()) {
            const contractData = contractSnap.data() as any;
            freelancerId = contractData.freelancerId || contractData.freelancerId;
          }
        } catch (error) {
          console.error("Error loading contract data for freelancer id fallback:", error);
        }
      }

      if (!freelancerId) {
        setFreelancerData(null);
        setLoadingFreelancer(false);
        return;
      }

      setLoadingFreelancer(true);
      try {
        const freelancerDocSnap = await getDoc(doc(firebaseDb, "freelancers", freelancerId));
        if (freelancerDocSnap.exists()) {
          setFreelancerData(freelancerDocSnap.data());
        } else {
          const freelancersByUidQuery = query(
            collection(firebaseDb, "freelancers"),
            where("uid", "==", freelancerId),
            limit(1)
          );
          const freelancersByUidSnap = await getDocs(freelancersByUidQuery);
          if (!freelancersByUidSnap.empty) {
            setFreelancerData(freelancersByUidSnap.docs[0].data());
          } else {
            setFreelancerData(null);
          }
        }
      } catch (error) {
        console.error("Error loading freelancer payment data:", error);
        setFreelancerData(null);
      } finally {
        setLoadingFreelancer(false);
      }
    };

    fetchFreelancerPaymentData();
  }, [pendingApprovalJobId, submittedJobs, contracts]);

  return (
    <section className="w-full">
      <div className="rounded-[12px] border border-[#EAE7E2] bg-white p-6 shadow-[0_8px_22px_rgba(0,0,0,0.05)]">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#8C4F00]">
              Contracts
            </div>
            <h1 className="mt-2 text-[24px] font-semibold tracking-[-0.02em] text-[#1a1a1a]">
              Your engagements
            </h1>
            <p className="mt-2 text-[12px] leading-[1.7] text-[#6b6762]">
              Track milestones, deliverables, and active client work.
            </p>
          </div>
          <Button size="sm" variant="outline" className="rounded-full">
            View All Contracts
          </Button>
        </div>
      </div>

      <div className="mt-6 rounded-[12px] border border-[#EAE7E2] bg-[#F9F6F2] p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#F5A623]">
              {activeTab === 'contracts' ? 'Contracts' : 'Submitted Jobs'}
            </div>
            <div className="text-[12px] text-[#6b6762]">
              {activeTab === 'contracts' ? 'Switch between active and ongoing work.' : 'Review submitted work from freelancers.'}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('contracts')}
              className={`rounded-full px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.08em] ${
                activeTab === 'contracts'
                  ? "bg-white text-[#1a1a1a] shadow-sm"
                  : "bg-transparent text-[#6b6762] border border-[#EAE7E2]"
              }`}
            >
              Contracts
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('submitted')}
              className={`rounded-full px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.08em] ${
                activeTab === 'submitted'
                  ? "bg-white text-[#1a1a1a] shadow-sm"
                  : "bg-transparent text-[#6b6762] border border-[#EAE7E2]"
              }`}
            >
              Submitted Jobs
            </button>
          </div>
        </div>
        {activeTab === 'contracts' && (
          <>
            <div className="mt-4 flex items-center gap-2">
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
                    className="text-left rounded-[12px] border border-[#EAE7E2] bg-white p-4 shadow-[0_6px_16px_rgba(0,0,0,0.04)]"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-[14px] font-semibold text-[#1a1a1a]">{contract.title}</div>
                        <div className="text-[12px] text-[#9e9690]">Freelancer: {contract.freelancer}</div>
                        <div className="mt-2 text-[11px] text-[#6b6762]">{contract.nextMilestone}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-[12px] font-semibold text-[#8C4F00]">{contract.budget}</div>
                        <div className="mt-2 text-[10px] uppercase tracking-[0.1em] text-[#6b6762]">
                          {contract.status}
                        </div>
                      </div>
                    </div>
                  </button>
                ))
              ) : (
                <div className="rounded-[12px] border border-[#EAE7E2] bg-white p-4 text-[12px] text-[#6b6762]">
                  No contracts in this view yet.
                </div>
              )}
            </div>
          </>
        )}
        {activeTab === 'submitted' && (
          <div className="mt-4 grid grid-cols-1 gap-4">
            {submittedJobs.length ? (
              submittedJobs.map((job) => (
                <div
                  key={job.id}
                  className="rounded-[12px] border border-[#EAE7E2] bg-white p-4 shadow-[0_6px_16px_rgba(0,0,0,0.04)]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-[14px] font-semibold text-[#1a1a1a] break-words">{job.description}</div>
                      <div className="text-[12px] text-[#9e9690] break-words">
                        Contract: {contracts.find(c => c.id === job.contractId)?.title || 'Unknown'}
                      </div>
                      {job.link && (
                        <div className="mt-2 text-[12px] text-[#6b6762] break-all">
                          Link: <a href={job.link} target="_blank" rel="noopener noreferrer" className="text-[#8C4F00] underline break-all">{job.link}</a>
                        </div>
                      )}
                      {job.attachment && (
                        <div className="mt-2 text-[12px] text-[#6b6762] break-all">
                          Attachment: <a href={job.attachment.url} target="_blank" rel="noopener noreferrer" className="text-[#8C4F00] underline break-all">{job.attachment.name}</a>
                        </div>
                      )}
                    </div>
                    <div className="text-right flex flex-col gap-2">
                      <div className={`text-[10px] uppercase tracking-[0.1em] font-semibold ${
                        job.status === 'approved' ? 'text-green-600' : job.status === 'rejected' ? 'text-red-600' : 'text-[#F5A623]'
                      }`}>
                        {job.status}
                      </div>
                      <div className="text-[10px] text-[#6b6762]">
                        {job.submittedAt.toLocaleDateString()}
                      </div>
                      {job.status === 'pending' && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleApproveSubmission(job.id)}
                            className="text-[10px] bg-green-600 text-white px-2 py-1 rounded"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleRejectSubmission(job.id)}
                            className="text-[10px] bg-red-600 text-white px-2 py-1 rounded"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-[12px] border border-[#EAE7E2] bg-white p-4 text-[12px] text-[#6b6762]">
                No submitted jobs found.
              </div>
            )}
          </div>
        )}
      </div>

      {isModalOpen && selectedContract && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setIsModalOpen(false)}
          />
          <div className="relative z-[81] w-full max-w-3xl max-h-[85vh] overflow-y-auto rounded-[16px] border border-[#EAE7E2] bg-white p-6 shadow-[0_20px_50px_rgba(0,0,0,0.2)]">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="absolute right-4 top-4 z-[82] rounded-full border border-[#EAE7E2] bg-white p-2 text-[#6b6762] transition hover:bg-[#F7F4F0]"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>

            {/* ── Header ── */}
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

            {/* ── Contract Overview grid (matches freelancer modal) ── */}
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
                  <div className="mt-1 font-semibold text-[#1a1a1a]">{selectedContract.contractType ?? "Fixed Price"}</div>
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

            {/* ── Scope of Work ── */}
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

            {/* ── Milestones (Fixed Price only) ── */}
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

            {/* ── Payment Details ── */}
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

            {/* ── Budget / Progress / Dates grid ── */}
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

            {/* ── Next Milestone highlight ── */}
            <div className="mt-4 rounded-[10px] border border-[#EFECE7] bg-[#FAF8F5] px-4 py-3">
              <div className="text-[10px] uppercase tracking-[0.12em] text-[#9e9690]">
                Next Milestone
              </div>
              <div className="mt-2 text-[12px] font-semibold text-[#1a1a1a]">
                {selectedContract.nextMilestone}
              </div>
            </div>

            {/* ── Job / Contract IDs ── */}
            <div className="mt-5 rounded-[12px] border border-[#EAE7E2] bg-white p-4">
              <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#8C4F00]">
                Job Details
              </div>
              <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 text-[11px] text-[#6b6762]">
                <div className="rounded-[10px] border border-[#EFECE7] bg-[#FAF8F5] px-3 py-2">
                  <div className="uppercase tracking-[0.12em] text-[#9e9690]">Contract ID</div>
                  <div className="mt-1 font-semibold text-[#1a1a1a] break-all">{selectedContract.id}</div>
                </div>
                {selectedContract.jobId ? (
                  <div className="rounded-[10px] border border-[#EFECE7] bg-[#FAF8F5] px-3 py-2">
                    <div className="uppercase tracking-[0.12em] text-[#9e9690]">Job Reference</div>
                    <div className="mt-1 font-semibold text-[#1a1a1a] break-all">{selectedContract.jobId}</div>
                  </div>
                ) : null}
                <div className="rounded-[10px] border border-[#EFECE7] bg-[#FAF8F5] px-3 py-2">
                  <div className="uppercase tracking-[0.12em] text-[#9e9690]">Client</div>
                  <div className="mt-1 font-semibold text-[#1a1a1a]">{selectedContract.clientName}</div>
                </div>
                <div className="rounded-[10px] border border-[#EFECE7] bg-[#FAF8F5] px-3 py-2">
                  <div className="uppercase tracking-[0.12em] text-[#9e9690]">Work Status</div>
                  <div className="mt-1 font-semibold text-[#1a1a1a] capitalize">
                    {selectedContract.workStatus?.replace(/_/g, " ") ?? "Not started"}
                  </div>
                </div>
              </div>
            </div>

            {/* ── Related Submissions ── */}
            <div className="mt-5 rounded-[12px] border border-[#EAE7E2] bg-white p-4">
              <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#8C4F00]">
                Related Submissions
              </div>
              {submittedJobs.filter((job) => job.contractId === selectedContract.id).length ? (
                <div className="mt-3 space-y-3">
                  {submittedJobs
                    .filter((job) => job.contractId === selectedContract.id)
                    .map((job) => (
                      <div key={job.id} className="rounded-[10px] border border-[#F0ECE6] bg-[#FAF8F5] p-4">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <div className="text-[13px] font-semibold text-[#1a1a1a]">{job.description || 'Submitted work'}</div>
                            <div className="mt-1 text-[11px] text-[#6b6762]">{job.submittedAt.toLocaleDateString()}</div>
                          </div>
                          <span className={`rounded-full px-3 py-1 text-[10px] font-semibold uppercase ${
                            job.status === 'approved' ? 'bg-[#EDF7ED] text-[#2F855A]' : job.status === 'rejected' ? 'bg-[#FDE8E8] text-[#C53030]' : 'bg-[#FEF3C7] text-[#B7791F]'
                          }`}>
                            {job.status}
                          </span>
                        </div>
                        {job.link ? (
                          <div className="mt-3 text-[12px] text-[#4E4B48]">
                            Link: <a href={job.link} target="_blank" rel="noreferrer" className="text-[#8C4F00] underline">View submission</a>
                          </div>
                        ) : null}
                        {job.attachment ? (
                          <div className="mt-2 text-[12px] text-[#4E4B48]">
                            Attachment: <a href={job.attachment.url} target="_blank" rel="noreferrer" className="text-[#8C4F00] underline">{job.attachment.name}</a>
                          </div>
                        ) : null}
                      </div>
                    ))}
                </div>
              ) : (
                <p className="mt-3 text-[12px] text-[#6b6762]">
                  No submissions are available for this contract yet.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Payment Confirmation Modal */}
      {showPaymentModal && pendingApprovalJobId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-50">
          <div className="relative w-full max-w-md rounded-[16px] border border-[#EAE7E2] bg-white p-6 shadow-[0_20px_50px_rgba(0,0,0,0.2)]">
            <button
              type="button"
              onClick={() => {
                setShowPaymentModal(false);
                setPendingApprovalJobId(null);
              }}
              className="absolute right-4 top-4 rounded-full border border-[#EAE7E2] bg-white p-2 text-[#6b6762] transition hover:bg-[#F7F4F0]"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>

            <div className="text-center">
              <div className="text-[18px] font-semibold text-[#1a1a1a]">Confirm Payment</div>
              <div className="mt-2 text-[14px] text-[#6b6762]">
                Approving this work will trigger a milestone payment to the freelancer.
              </div>
            </div>

            {(() => {
              const job = submittedJobs.find((j) => j.id === pendingApprovalJobId);
              const contract = job ? contracts.find((c) => c.id === job.contractId) : null;
              // const lightningAddress = freelancerData?.payment?.lightningAddress;
              // CORRECT - matches your Firebase structure: settings > payment > lightningAddress
               const lightningAddress = freelancerData?.settings?.payment?.lightningAddress;
              const releasedInstallments = contract?.paymentReleasedInstallments ?? 0;
              const nextMilestoneIndex = releasedInstallments + 1;
              const milestone = contract?.milestones?.[nextMilestoneIndex - 1];
              const milestoneAmount = milestone?.amount || contract?.budget || "0 sats";
              const milestoneLabel = milestone?.name || `Milestone ${nextMilestoneIndex}`;
              const isMilestoneFunded =
                contract &&
                (contract.paymentStatus === "funded" || contract.paymentStatus === "released") &&
                (contract.paymentCurrentInstallment ?? 0) >= nextMilestoneIndex;
              const canApprove = isMilestoneFunded && !loadingFreelancer;

              return (
                <div className="mt-6 space-y-4">
                  <div className="rounded-[12px] border border-[#EAE7E2] bg-[#FAF8F5] p-4">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#8C4F00]">Payment Details</div>
                    <div className="mt-2 space-y-2 text-[12px] text-[#6b6762]">
                      <div className="flex justify-between">
                        <span>Freelancer:</span>
                        <span className="font-semibold text-[#1a1a1a]">{contract?.freelancer || 'Unknown'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>{milestoneLabel}:</span>
                        <span className="font-semibold text-[#1a1a1a]">{milestoneAmount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Lightning Address:</span>
                        <span className="font-semibold text-[#1a1a1a] break-all">
                          {loadingFreelancer ? 'Loading...' : (lightningAddress || 'Not set')}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Funded milestone</span>
                        <span className="font-semibold text-[#1a1a1a]">
                          {isMilestoneFunded ? `Yes (${nextMilestoneIndex})` : 'No'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {approvalErrorMessage ? (
                    <div className="rounded-[12px] border border-[#FAD1D4] bg-[#FFF1F2] p-4 text-[12px] text-[#C53030]">
                      {approvalErrorMessage}
                    </div>
                  ) : null}

                  <div className="text-[12px] text-[#9e9690] text-center">
                    By approving this work, you confirm that the milestone payment will be processed to the freelancer's Lightning wallet.
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setShowPaymentModal(false);
                        setPendingApprovalJobId(null);
                        setApprovalErrorMessage("");
                      }}
                      className="flex-1 rounded-[8px] border border-[#EAE7E2] bg-white py-3 text-[12px] font-semibold text-[#6b6762] transition hover:bg-[#F7F4F0]"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={confirmApproveWithPayment}
                      disabled={!canApprove}
                      className="flex-1 rounded-[8px] bg-[#8C4F00] py-3 text-[12px] font-semibold text-white transition hover:bg-[#6B3D00] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {canApprove ? 'Approve & Pay' : 'Fund Escrow First'}
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </section>
  );
}