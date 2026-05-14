"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Button from "@/components/atoms/Button";
import DashboardMetricCard from "@/components/molecules/DashboardMetricCard";
import ClientContractCard from "@/components/molecules/ClientContractCard";
import { Briefcase, ClipboardCheck, FileText } from "lucide-react";
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
  paymentTotalChargedSats?: number;
  paymentPaidAmountSats?: number;
  platformFeeSats?: number;
  platformFeePercent?: number;
  escrowFundedTotalSats?: number;
  escrowReleasedSats?: number;
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
    index?: number;
    name: string;
    title?: string;
    amount: string;
    freelancerAmountSats?: number;
    platformFeeSats?: number;
    totalClientPaysSats?: number;
    fundedSats?: number;
    releasedSats?: number;
    deadline: string;
    status: "Pending" | "In Progress" | "Approved" | "pending" | "funded" | "submitted" | "approved" | "released";
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
  revisionMessage?: string;
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
  const [view, setView] = useState<"active" | "ongoing" | "finished">("active");
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
  const [selectedSubmissionId, setSelectedSubmissionId] = useState<string | null>(null);
  const [pendingChangeJobId, setPendingChangeJobId] = useState<string | null>(null);
  const [changeRequestNote, setChangeRequestNote] = useState("");
  const [changeRequestError, setChangeRequestError] = useState("");
  const [isRequestingChanges, setIsRequestingChanges] = useState(false);
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
              paymentReleasedInstallments: Number(data.paymentReleasedInstallments ?? 0),
              paymentTotalAmountSats: Number(data.paymentTotalAmountSats ?? parseSats(data.budget) ?? 0),
              paymentTotalChargedSats: Number(data.paymentTotalChargedSats ?? 0),
              paymentPaidAmountSats: Number(data.paymentPaidAmountSats ?? 0),
              platformFeeSats: Number(data.platformFeeSats ?? 0),
              platformFeePercent: Number(data.platformFeePercent ?? 5),
              escrowFundedTotalSats: Number(data.escrowFundedTotalSats ?? 0),
              escrowReleasedSats: Number(data.escrowReleasedSats ?? 0),
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

      const submittedQuery = query(
        collection(firebaseDb, "submitted_jobs"),
        where("clientId", "==", user.uid)
      );
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
              revisionMessage: data.revisionMessage ?? "",
            };
          });
          items.sort((a, b) => b.submittedAt.getTime() - a.submittedAt.getTime());
          setSubmittedJobs(items);
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

  const isFinishedContract = (contract: Contract) =>
    contract.status === "Completed" ||
    contract.paymentStatus === "released" ||
    contract.workStatus === "approved" ||
    contract.workStatus === "completed";

  const isEscrowContract = (contract: Contract) =>
    !isFinishedContract(contract) &&
    (contract.paymentStatus === "funded" ||
      (contract.escrowFundedTotalSats ?? 0) > 0 ||
      contract.workStatus === "in_progress" ||
      contract.workStatus === "submitted" ||
      contract.workStatus === "changes_requested");

  const activeContracts = useMemo(
    () => contracts.filter((contract) => !isFinishedContract(contract) && !isEscrowContract(contract)),
    [contracts]
  );
  const ongoingContracts = useMemo(
    () => contracts.filter((contract) => isEscrowContract(contract)),
    [contracts]
  );
  const finishedContracts = useMemo(
    () => contracts.filter((contract) => isFinishedContract(contract)),
    [contracts]
  );

  const visibleContracts =
    view === "active" ? activeContracts : view === "ongoing" ? ongoingContracts : finishedContracts;
  const selectedContract =
    contracts.find((c) => c.id === selectedId) ?? visibleContracts[0];
  const selectedSubmission = selectedSubmissionId
    ? submittedJobs.find((job) => job.id === selectedSubmissionId) ?? null
    : null;
  const selectedSubmissionContract = selectedSubmission
    ? contracts.find((contract) => contract.id === selectedSubmission.contractId) ?? null
    : null;
  const pendingChangeJob = pendingChangeJobId
    ? submittedJobs.find((job) => job.id === pendingChangeJobId) ?? null
    : null;
  const pendingChangeContract = pendingChangeJob
    ? contracts.find((contract) => contract.id === pendingChangeJob.contractId) ?? null
    : null;
  const contractStatusFilters: Array<{ id: typeof view; label: string; count: number }> = [
    { id: "active", label: "Active", count: activeContracts.length },
    { id: "ongoing", label: "Ongoing", count: ongoingContracts.length },
    { id: "finished", label: "Finished jobs", count: finishedContracts.length },
  ];

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
    const milestone = contract.milestones?.find((item: any, index) => Number(item.index ?? index + 1) === nextMilestoneIndex);
    const totalAmount = contract.paymentTotalAmountSats || parseSats(contract.budget) || 0;
    const milestoneAmount = Number((milestone as any)?.freelancerAmountSats ?? calculateInstallmentAmount(totalAmount, totalInstallments, nextMilestoneIndex));
    const milestoneFundedSats = milestone ? Number((milestone as any).fundedSats ?? 0) : milestoneAmount;
    const milestoneReleasedSats = milestone ? Number((milestone as any).releasedSats ?? 0) : 0;
    const remainingMilestoneEscrow = Math.max(0, milestoneFundedSats - milestoneReleasedSats);
    const canRelease =
      fundedInstallments >= nextMilestoneIndex &&
      (paymentStatus === "funded" || paymentStatus === "released") &&
      remainingMilestoneEscrow >= milestoneAmount;

    if (!canRelease) {
      const shortfall = Math.max(0, milestoneAmount - remainingMilestoneEscrow);
      setApprovalErrorMessage(
        shortfall > 0
          ? `You need to fund ${shortfall.toLocaleString()} sats more in escrow before approving this milestone.`
          : "This milestone is not funded yet. Fund escrow before approving work."
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
      const updatedMilestones = (contract.milestones ?? []).map((item, index) => {
        const itemIndex = Number(item.index ?? index + 1);
        if (itemIndex !== nextMilestoneIndex) return item;
        return {
          ...item,
          releasedSats: Number(item.releasedSats ?? 0) + milestoneAmount,
          status: "released",
          releasedAt: new Date().toISOString(),
        };
      });
      const contractUpdate = {
        workStatus: isFinalRelease ? "approved" : "in_progress",
        paymentReleasedInstallments: nextReleasedCount,
        escrowReleasedSats: (contract.escrowReleasedSats ?? 0) + milestoneAmount,
        milestones: updatedMilestones,
        paymentStatus: isFinalRelease ? "released" : "funded",
        updatedAt: serverTimestamp(),
      };

      await setDoc(doc(firebaseDb, "contracts", job.contractId), contractUpdate, { merge: true });
      await setDoc(
        doc(firebaseDb, "escrows", job.contractId),
        {
          totalReleasedToFreelancerSats: contractUpdate.escrowReleasedSats,
          releasedMilestoneCount: nextReleasedCount,
          milestones: updatedMilestones,
          status: isFinalRelease ? "released" : "funded",
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );

      try {
        const conversationDoc = await getConversationForContract(contract);
        if (conversationDoc) {
          await updateDoc(conversationDoc.ref, {
            workStatus: contractUpdate.workStatus,
            paymentStatus: contractUpdate.paymentStatus,
            escrowReleasedSats: contractUpdate.escrowReleasedSats,
            milestones: updatedMilestones,
            updatedAt: serverTimestamp(),
            "lastMessage.text": `Milestone ${nextMilestoneIndex}${milestone?.title || milestone?.name ? `: ${milestone?.title || milestone?.name}` : ""} approved and payment of ${milestoneAmount} sats sent to freelancer.`,
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

  const openChangeRequest = (jobId: string) => {
    const job = submittedJobs.find((item) => item.id === jobId);
    const contract = job ? contracts.find((item) => item.id === job.contractId) : null;
    setPendingChangeJobId(jobId);
    setChangeRequestNote(job?.revisionMessage || contract?.revisionMessage || "");
    setChangeRequestError("");
  };

  const handleRejectSubmission = async () => {
    if (!pendingChangeJobId) return;
    const note = changeRequestNote.trim();
    if (!note) {
      setChangeRequestError("Write a short note so the freelancer knows what to adjust.");
      return;
    }

    const job = submittedJobs.find((item) => item.id === pendingChangeJobId);
    const contract = job ? contracts.find((item) => item.id === job.contractId) : null;
    if (!job || !contract) {
      setChangeRequestError("Unable to find this submitted work.");
      return;
    }

    setIsRequestingChanges(true);
    setChangeRequestError("");

    try {
      const nextMilestoneIndex = (contract.paymentReleasedInstallments ?? 0) + 1;
      const updatedMilestones = (contract.milestones ?? []).map((item: any, index) => {
        const itemIndex = Number(item.index ?? index + 1);
        if (itemIndex !== nextMilestoneIndex) return item;
        return {
          ...item,
          status: "funded",
          revisionMessage: note,
          changesRequestedAt: new Date().toISOString(),
        };
      });
      const messageText = `Work returned for adjustments on "${contract.title}". Note: ${note}`;
      const conversationId =
        contract.jobId && contract.freelancerId
          ? createConversationId(contract.jobId, contract.freelancerId)
          : contract.id;

      await Promise.all([
        updateDoc(doc(firebaseDb, "submitted_jobs", pendingChangeJobId), {
        status: "rejected",
          revisionMessage: note,
          reviewedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        }),
        setDoc(doc(firebaseDb, "contracts", job.contractId), {
          workStatus: "changes_requested",
          revisionMessage: note,
          milestones: updatedMilestones,
          unreadByFreelancer: true,
          updatedAt: serverTimestamp(),
        }, { merge: true }),
        setDoc(
          doc(firebaseDb, "conversations", conversationId),
          {
            workStatus: "changes_requested",
            revisionMessage: note,
            milestones: updatedMilestones,
            "lastMessage.text": messageText,
            "lastMessage.senderId": "system",
            "lastMessage.createdAt": serverTimestamp(),
            [`unread.${contract.freelancerId}`]: increment(1),
            updatedAt: serverTimestamp(),
          },
          { merge: true }
        ),
        addDoc(collection(firebaseDb, "conversations", conversationId, "messages"), {
          senderId: "system",
          senderRole: "system",
          text: messageText,
          messageType: "changes_requested",
          createdAt: serverTimestamp(),
        }),
      ]);

      setPendingChangeJobId(null);
      setChangeRequestNote("");
      setSelectedSubmissionId(pendingChangeJobId);
    } catch (error) {
      console.error("Error rejecting submission:", error);
      setChangeRequestError("Unable to send the adjustment request. Please try again.");
    } finally {
      setIsRequestingChanges(false);
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
      <div className="flex items-center gap-6 px-2">
        {[
          { id: "contracts", label: "Contracts" },
          { id: "submitted", label: "Submitted jobs" },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id as "contracts" | "submitted")}
            className={`relative py-3 text-[13px] font-medium transition ${
              activeTab === tab.id ? "text-[#1a1a1a]" : "text-[#8f8780] hover:text-[#1a1a1a]"
            }`}
          >
            {tab.label}
            {activeTab === tab.id ? (
              <span className="absolute bottom-[-1px] left-0 h-[2px] w-full rounded-full bg-[#F7931A]" />
            ) : null}
          </button>
        ))}
      </div>

      <div className="mt-2 rounded-[14px] border border-[#EAE7E2] bg-white p-3 shadow-[0_8px_22px_rgba(0,0,0,0.04)]">
        {activeTab === 'contracts' && (
          <>
            <div className="grid gap-2">
              <div className="grid gap-2 sm:grid-cols-3">
                {contractStatusFilters.map((filter) => (
                  <button
                    key={filter.id}
                    type="button"
                    onClick={() => setView(filter.id)}
                    className={`flex h-10 items-center justify-between rounded-[10px] border px-4 text-left text-[12px] font-semibold transition ${
                      view === filter.id
                        ? "border-[#F7931A] bg-[#FFF4E6] text-[#8C4F00]"
                        : "border-[#EFECE7] bg-[#FAF8F5] text-[#4E4B48] hover:border-[#F2D8AA]"
                    }`}
                  >
                    <span>{filter.label}</span>
                    <span className="rounded-full bg-white px-2 py-0.5 text-[10px] text-[#8f8780]">
                      {filter.count}
                    </span>
                  </button>
                ))}
              </div>
            </div>
            <div className="mt-4 grid grid-cols-1 gap-4">
              {loading ? (
                <div className="rounded-[12px] border border-[#EAE7E2] bg-white p-6 text-center text-[12px] text-[#6b6762]">
                  Loading contracts...
                </div>
              ) : errorMessage ? (
                <div className="rounded-[12px] border border-[#EAE7E2] bg-[#FFF6F2] p-4 text-[12px] text-[#8C4F00]">
                  {errorMessage}
                </div>
              ) : visibleContracts.length ? (
                <div className="overflow-hidden rounded-[12px] border border-[#EAE7E2] bg-white">
                  <div className="hidden grid-cols-[1.4fr_1fr_0.9fr_1.2fr_auto] gap-3 border-b border-[#EFECE7] bg-[#FAF8F5] px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#9e9690] md:grid">
                    <span>Project</span>
                    <span>Freelancer</span>
                    <span>Escrow</span>
                    <span>Next milestone</span>
                    <span></span>
                  </div>
                  {visibleContracts.map((contract) => {
                    const escrowLabel =
                      isFinishedContract(contract)
                        ? "Finished"
                        : isEscrowContract(contract)
                          ? "Funded"
                          : contract.paymentStatus === "invoice_created"
                            ? "Invoice sent"
                            : "Not funded";
                    return (
                      <button
                        key={contract.id}
                        type="button"
                        onClick={() => {
                          setSelectedId(contract.id);
                          setIsModalOpen(true);
                        }}
                        className="grid w-full gap-3 border-b border-[#F1EEE9] px-4 py-4 text-left transition last:border-b-0 hover:bg-[#FFF9F0] md:grid-cols-[1.4fr_1fr_0.9fr_1.2fr_auto] md:items-center"
                      >
                        <div className="min-w-0">
                          <div className="truncate text-[14px] font-semibold text-[#1a1a1a]">{contract.title}</div>
                          <div className="mt-1 text-[11px] text-[#9e9690] md:hidden">Freelancer: {contract.freelancer}</div>
                        </div>
                        <div className="hidden truncate text-[12px] text-[#6b6762] md:block">{contract.freelancer}</div>
                        <div>
                          <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] ${
                            escrowLabel === "Funded"
                              ? "bg-[#E6F4EA] text-[#2E7D32]"
                              : escrowLabel === "Finished"
                                ? "bg-[#F5EFE8] text-[#8C4F00]"
                                : "bg-[#FFF4E6] text-[#8C4F00]"
                          }`}>
                            {escrowLabel}
                          </span>
                        </div>
                        <div className="min-w-0 break-words text-[12px] text-[#6b6762] [overflow-wrap:anywhere]">
                          <span className="md:hidden font-semibold text-[#9e9690]">Next: </span>
                          {contract.nextMilestone}
                        </div>
                        <div className="flex items-center justify-between gap-3 md:justify-end">
                          <span className="text-[12px] font-semibold text-[#8C4F00]">{contract.budget}</span>
                          <span className="text-[11px] font-semibold text-[#1a1a1a]">Open</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="flex min-h-[172px] flex-col items-center justify-center rounded-[12px] bg-white px-5 py-10 text-center">
                  <FileText className="h-11 w-11 text-[#F7931A]" />
                  <div className="mt-3 text-[15px] font-semibold text-[#1a1a1a]">No {view === "finished" ? "finished jobs" : `${view} contracts`} yet</div>
                  <Button
                    size="sm"
                    className="mt-4 rounded-full bg-[#F7931A] text-[#1a1a1a] hover:bg-[#E9850F]"
                    onClick={() => router.push("/client/dashboard/job-posts")}
                  >
                    <Briefcase className="mr-2 h-4 w-4" />
                    Post a Job
                  </Button>
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
                  className="w-full min-w-0 rounded-[12px] border border-[#EAE7E2] bg-white p-3 shadow-[0_6px_16px_rgba(0,0,0,0.04)] transition hover:border-[#F2D8AA] sm:p-4"
                >
                  <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="break-words text-[13px] font-semibold leading-5 text-[#1a1a1a] [overflow-wrap:anywhere] sm:text-[14px]">{job.description}</div>
                      <div className="mt-1 break-words text-[12px] text-[#9e9690] [overflow-wrap:anywhere]">
                        Contract: {contracts.find(c => c.id === job.contractId)?.title || 'Unknown'}
                      </div>
                      {job.link && (
                        <div className="mt-2 max-w-full text-[12px] leading-5 text-[#6b6762]">
                          <span className="font-semibold text-[#9e9690]">Link: </span>
                          <a href={job.link} target="_blank" rel="noopener noreferrer" className="text-[#8C4F00] underline break-all [overflow-wrap:anywhere]">{job.link}</a>
                        </div>
                      )}
                      {job.attachment && (
                        <div className="mt-2 max-w-full text-[12px] leading-5 text-[#6b6762]">
                          <span className="font-semibold text-[#9e9690]">Attachment: </span>
                          <a href={job.attachment.url} target="_blank" rel="noopener noreferrer" className="text-[#8C4F00] underline break-all [overflow-wrap:anywhere]">{job.attachment.name}</a>
                        </div>
                      )}
                    </div>
                    <div className="flex w-full flex-col gap-2 sm:w-auto sm:min-w-[124px] sm:items-end sm:text-right">
                      <div className={`inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.1em] sm:justify-end ${
                        job.status === 'approved' ? 'text-green-600' : job.status === 'rejected' ? 'text-red-600' : 'text-[#F5A623]'
                      }`}>
                        {job.status === 'rejected' ? (
                          <span className="inline-flex h-2 w-2 rounded-full bg-[#F7931A]" />
                        ) : null}
                        {job.status}
                      </div>
                      <div className="text-[10px] text-[#6b6762]">
                        {job.submittedAt.toLocaleDateString()}
                      </div>
                      <button
                        type="button"
                        onClick={() => setSelectedSubmissionId(job.id)}
                        className="w-full rounded-full border border-[#EAE7E2] px-3 py-2 text-[10px] font-semibold text-[#6b6762] transition hover:bg-[#F7F4F0] sm:w-auto sm:py-1"
                      >
                        View Details
                      </button>
                      {job.status === 'pending' && (
                        <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto">
                          <button
                            onClick={() => handleApproveSubmission(job.id)}
                            className="rounded-full bg-green-600 px-3 py-2 text-[10px] font-semibold text-white sm:py-1"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => openChangeRequest(job.id)}
                            className="rounded-full bg-red-600 px-3 py-2 text-[10px] font-semibold text-white sm:py-1"
                          >
                            Changes
                          </button>
                        </div>
                      )}
                      {job.status === 'rejected' && (
                        <button
                          type="button"
                          onClick={() => openChangeRequest(job.id)}
                          className="w-full rounded-full bg-[#FFF4E6] px-3 py-2 text-[10px] font-semibold text-[#8C4F00] sm:w-auto sm:py-1"
                        >
                          Edit Note
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex min-h-[172px] flex-col items-center justify-center rounded-[12px] bg-white px-5 py-10 text-center">
                <ClipboardCheck className="h-10 w-10 text-[#F7931A]" />
                <div className="mt-3 text-[15px] font-semibold text-[#1a1a1a]">No submitted jobs yet</div>
              </div>
            )}
          </div>
        )}
      </div>

      {isModalOpen && selectedContract && (
        <div className="fixed inset-0 z-[80] flex items-end justify-center px-2 py-2 sm:items-center sm:px-4 sm:py-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setIsModalOpen(false)}
          />
          <div className="relative z-[81] max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-[14px] border border-[#EAE7E2] bg-[#FCF9F7] p-4 shadow-[0_20px_50px_rgba(0,0,0,0.2)] sm:rounded-[16px] sm:p-5">
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
            <div className="rounded-[14px] border border-[#EAE7E2] bg-white p-5">
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#8C4F00]">
                  Contract Details
                </div>
                <div className="mt-2 break-words text-[16px] font-semibold leading-6 text-[#1a1a1a] [overflow-wrap:anywhere] sm:text-[18px]">
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
            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="min-w-0 rounded-[12px] border border-[#EFECE7] bg-[#FAF8F5] px-3 py-3 sm:px-4">
                <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#9e9690]">Budget</div>
                <div className="mt-1 text-[14px] font-semibold text-[#1a1a1a]">{selectedContract.budget}</div>
              </div>
              <div className="min-w-0 rounded-[12px] border border-[#EFECE7] bg-[#FAF8F5] px-3 py-3 sm:px-4">
                <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#9e9690]">Work Status</div>
                <div className="mt-1 text-[14px] font-semibold capitalize text-[#1a1a1a]">
                  {selectedContract.workStatus?.replace(/_/g, " ") ?? "Not started"}
                </div>
              </div>
              <div className="min-w-0 rounded-[12px] border border-[#EFECE7] bg-[#FAF8F5] px-3 py-3 sm:px-4">
                <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#9e9690]">Next</div>
                <div className="mt-1 truncate text-[14px] font-semibold text-[#1a1a1a]">{selectedContract.nextMilestone}</div>
              </div>
            </div>
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
                          <div className="font-semibold text-[#1a1a1a]">{milestone.title || milestone.name}</div>
                          <div className="text-[#9e9690]">{milestone.deadline}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-[#8C4F00]">
                            {milestone.freelancerAmountSats ? `${milestone.freelancerAmountSats.toLocaleString()} sats` : milestone.amount}
                          </div>
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
              {(() => {
                const jobAmount = selectedContract.paymentTotalAmountSats || parseSats(selectedContract.budget) || 0;
                const platformFee = selectedContract.platformFeeSats || Math.ceil(jobAmount * ((selectedContract.platformFeePercent ?? 5) / 100));
                const clientTotal = selectedContract.paymentTotalChargedSats || jobAmount + platformFee;
                const released = selectedContract.escrowReleasedSats ?? 0;
                const funded = selectedContract.escrowFundedTotalSats ?? 0;
                const remainingFunded = Math.max(0, funded - platformFee - released);
                return (
              <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 text-[11px] text-[#6b6762]">
                <div className="rounded-[10px] border border-[#EFECE7] bg-[#FAF8F5] px-3 py-2">
                  <div className="uppercase tracking-[0.12em] text-[#9e9690]">Total Value</div>
                  <div className="mt-1 font-semibold text-[#1a1a1a]">{jobAmount.toLocaleString()} sats</div>
                </div>
                <div className="rounded-[10px] border border-[#EFECE7] bg-[#FAF8F5] px-3 py-2">
                  <div className="uppercase tracking-[0.12em] text-[#9e9690]">Client Pays With Fee</div>
                  <div className="mt-1 font-semibold text-[#1a1a1a]">{clientTotal.toLocaleString()} sats</div>
                </div>
                <div className="rounded-[10px] border border-[#EFECE7] bg-[#FAF8F5] px-3 py-2">
                  <div className="uppercase tracking-[0.12em] text-[#9e9690]">Funded Escrow</div>
                  <div className="mt-1 font-semibold text-[#1a1a1a]">{funded.toLocaleString()} sats</div>
                </div>
                <div className="rounded-[10px] border border-[#EFECE7] bg-[#FAF8F5] px-3 py-2">
                  <div className="uppercase tracking-[0.12em] text-[#9e9690]">Available To Release</div>
                  <div className="mt-1 font-semibold text-[#1a1a1a]">{remainingFunded.toLocaleString()} sats</div>
                </div>
                <div className="rounded-[10px] border border-[#EFECE7] bg-[#FAF8F5] px-3 py-2">
                  <div className="uppercase tracking-[0.12em] text-[#9e9690]">Platform Fee</div>
                  <div className="mt-1 font-semibold text-[#1a1a1a]">{platformFee.toLocaleString()} sats</div>
                </div>
                <div className="rounded-[10px] border border-[#EFECE7] bg-[#FAF8F5] px-3 py-2">
                  <div className="uppercase tracking-[0.12em] text-[#9e9690]">Released</div>
                  <div className="mt-1 font-semibold text-[#1a1a1a]">{released.toLocaleString()} sats</div>
                </div>
              </div>
                );
              })()}
              <p className="mt-3 text-[11px] text-[#9e9690]">
                The 5% platform fee is included in the client invoice. Freelancer payouts are released per approved milestone.
              </p>
            </div>

            {/* ── Budget / Progress / Dates grid ── */}
            <div className="mt-5 grid grid-cols-1 gap-3 text-[11px] text-[#6b6762] sm:grid-cols-2">
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

      {selectedSubmission && (
        <div className="fixed inset-0 z-[95] flex items-end justify-center px-2 py-2 sm:items-center sm:px-4 sm:py-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setSelectedSubmissionId(null)}
          />
          <div className="relative z-[96] max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-[14px] border border-[#EAE7E2] bg-white p-4 shadow-[0_20px_50px_rgba(0,0,0,0.2)] sm:rounded-[16px] sm:p-5">
            <button
              type="button"
              onClick={() => setSelectedSubmissionId(null)}
              aria-label="Close"
              className="absolute right-4 top-4 rounded-full border border-[#EAE7E2] bg-white p-2 text-[#6b6762] hover:bg-[#F7F4F0]"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>

            <div className="pr-10">
              <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#8C4F00]">
                Submitted Work
              </div>
              <div className="mt-2 break-words text-[16px] font-semibold leading-6 text-[#1a1a1a] [overflow-wrap:anywhere] sm:text-[18px]">
                {selectedSubmissionContract?.title || "Contract submission"}
              </div>
              <div className="mt-1 text-[12px] capitalize text-[#6b6762]">
                Status: {selectedSubmission.status === "rejected" ? "Changes requested" : selectedSubmission.status}
              </div>
            </div>

            <div className="mt-5 rounded-[12px] border border-[#EFECE7] bg-[#FAF8F5] p-4">
              <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#9e9690]">
                Freelancer Message
              </div>
              <p className="mt-2 text-[13px] leading-6 text-[#1a1a1a]">
                {selectedSubmission.description || "Work submitted for review."}
              </p>
              {selectedSubmission.link ? (
                <p className="mt-3 break-all text-[12px] leading-5 text-[#6b6762] [overflow-wrap:anywhere]">
                  Link: <a href={selectedSubmission.link} target="_blank" rel="noreferrer" className="text-[#8C4F00] underline">{selectedSubmission.link}</a>
                </p>
              ) : null}
              {selectedSubmission.attachment ? (
                <p className="mt-2 break-all text-[12px] leading-5 text-[#6b6762] [overflow-wrap:anywhere]">
                  Attachment: <a href={selectedSubmission.attachment.url} target="_blank" rel="noreferrer" className="text-[#8C4F00] underline">{selectedSubmission.attachment.name}</a>
                </p>
              ) : null}
            </div>

            {selectedSubmission.revisionMessage ? (
              <div className="mt-4 rounded-[12px] border border-[#F8D7DA] bg-[#FFF5F5] p-4">
                <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#B42318]">
                  Adjustment Note
                </div>
                <p className="mt-2 text-[13px] leading-6 text-[#7F1D1D]">{selectedSubmission.revisionMessage}</p>
              </div>
            ) : null}

            <div className="mt-5 grid grid-cols-1 gap-2 sm:flex sm:flex-wrap sm:justify-end">
              {selectedSubmission.status === "pending" ? (
                <>
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full rounded-full sm:w-auto"
                    onClick={() => openChangeRequest(selectedSubmission.id)}
                  >
                    Request Changes
                  </Button>
                  <Button
                    size="sm"
                    className="w-full rounded-full sm:w-auto"
                    onClick={() => handleApproveSubmission(selectedSubmission.id)}
                  >
                    Approve & Pay
                  </Button>
                </>
              ) : null}
              {selectedSubmission.status === "rejected" ? (
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full rounded-full sm:w-auto"
                  onClick={() => openChangeRequest(selectedSubmission.id)}
                >
                  Edit Adjustment Note
                </Button>
              ) : null}
            </div>
          </div>
        </div>
      )}

      {pendingChangeJob && (
        <div className="fixed inset-0 z-[105] flex items-end justify-center px-2 py-2 sm:items-center sm:px-4 sm:py-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => {
              if (!isRequestingChanges) setPendingChangeJobId(null);
            }}
          />
          <div className="relative z-[106] max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-[14px] border border-[#EAE7E2] bg-white p-4 shadow-[0_20px_50px_rgba(0,0,0,0.2)] sm:rounded-[16px] sm:p-5">
            <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#8C4F00]">
              Request Adjustments
            </div>
            <div className="mt-2 break-words text-[16px] font-semibold leading-6 text-[#1a1a1a] [overflow-wrap:anywhere] sm:text-[18px]">
              {pendingChangeContract?.title || "Submitted work"}
            </div>
            <p className="mt-2 text-[13px] leading-6 text-[#6b6762]">
              Tell the freelancer exactly what needs to change. This note will appear in their contracts page and in the chat.
            </p>
            <textarea
              value={changeRequestNote}
              onChange={(event) => setChangeRequestNote(event.target.value)}
              rows={5}
              placeholder="Example: Please adjust the homepage spacing and add the missing mobile menu before resubmitting."
              className="mt-4 w-full rounded-[10px] border border-[#EAE7E2] bg-[#FAF8F5] px-3 py-2 text-[13px] text-[#1a1a1a] outline-none focus:ring-2 focus:ring-orange-400/20"
            />
            {changeRequestError ? (
              <p className="mt-3 rounded-[10px] border border-red-100 bg-red-50 px-3 py-2 text-[12px] text-red-700">
                {changeRequestError}
              </p>
            ) : null}
            <div className="mt-5 grid grid-cols-1 gap-2 sm:flex sm:justify-end">
              <Button
                size="sm"
                variant="outline"
                className="w-full rounded-full sm:w-auto"
                onClick={() => setPendingChangeJobId(null)}
                disabled={isRequestingChanges}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                className="w-full rounded-full sm:w-auto"
                onClick={() => void handleRejectSubmission()}
                disabled={isRequestingChanges}
              >
                {isRequestingChanges ? "Sending..." : pendingChangeJob.status === "rejected" ? "Update Note" : "Send Request"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Confirmation Modal */}
      {showPaymentModal && pendingApprovalJobId && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black bg-opacity-50 px-2 py-2 sm:items-center sm:px-4 sm:py-4">
          <div className="relative max-h-[92vh] w-full max-w-md overflow-y-auto rounded-[14px] border border-[#EAE7E2] bg-white p-4 shadow-[0_20px_50px_rgba(0,0,0,0.2)] sm:rounded-[16px] sm:p-6">
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
              const milestone = contract?.milestones?.find((item: any, index) => Number(item.index ?? index + 1) === nextMilestoneIndex);
              const milestoneAmountSats = Number((milestone as any)?.freelancerAmountSats ?? calculateInstallmentAmount(contract?.paymentTotalAmountSats || parseSats(contract?.budget ?? "0"), contract?.paymentInstallments ?? 1, nextMilestoneIndex));
              const milestoneAmount = `${milestoneAmountSats.toLocaleString()} sats`;
              const milestoneFundedSats = milestone ? Number((milestone as any).fundedSats ?? 0) : milestoneAmountSats;
              const milestoneReleasedSats = milestone ? Number((milestone as any).releasedSats ?? 0) : 0;
              const milestoneLabel = milestone?.title || milestone?.name || `Milestone ${nextMilestoneIndex}`;
              const isMilestoneFunded =
                contract &&
                (contract.paymentStatus === "funded" || contract.paymentStatus === "released") &&
                (contract.paymentCurrentInstallment ?? 0) >= nextMilestoneIndex &&
                milestoneFundedSats - milestoneReleasedSats >= milestoneAmountSats;
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

                  <div className="grid grid-cols-1 gap-3 sm:flex">
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
