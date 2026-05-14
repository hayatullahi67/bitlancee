"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/atoms/Button";
import { Briefcase, ClipboardCheck, FileText } from "lucide-react";
import { firebaseAuth, firebaseDb } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { addDoc, collection, doc, getDoc, getDocs, increment, limit, onSnapshot, query, serverTimestamp, setDoc, updateDoc, where } from "firebase/firestore";

type ContractStatus = "Active" | "Review" | "Completed";

type Contract = {
  id: string;
  title: string;
  clientName: string;
  clientId?: string;
  freelancerId?: string;
  jobId?: string;
  contractType?: "Fixed Price" | "Hourly";
  status: ContractStatus;
  budget: string;
  progress: number;
  nextMilestone: string;
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

const formatSats = (value: string) =>
  value.toLowerCase().includes("sats") ? value : `${value} sats`;

const parseSats = (value: unknown) => {
  if (typeof value === "number") return value;
  const cleaned = String(value ?? "").replace(/[^0-9]/g, "");
  return cleaned ? Number(cleaned) : 0;
};

const calculateInstallmentAmount = (total: number, installments: number, installment: number) => {
  const safeTotal = Math.max(0, Math.trunc(total));
  const safeInstallments = Math.max(1, Math.min(3, Math.trunc(installments)));
  const safeInstallment = Math.max(1, Math.min(safeInstallments, Math.trunc(installment)));
  const base = Math.floor(safeTotal / safeInstallments);
  const remainder = safeTotal % safeInstallments;
  return base + (safeInstallment <= remainder ? 1 : 0);
};

export default function FreelancerContractsContent() {
  const router = useRouter();
  const [view, setView] = useState<"active" | "ongoing" | "finished">("active");
  const [selectedId, setSelectedId] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [workMessage, setWorkMessage] = useState("");
  const [workLink, setWorkLink] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState("");
  const [submissionError, setSubmissionError] = useState("");
  const [activeTab, setActiveTab] = useState<'contracts' | 'submitted'>('contracts');
  const [submittedJobs, setSubmittedJobs] = useState<SubmittedJob[]>([]);
  const [selectedSubmissionId, setSelectedSubmissionId] = useState<string | null>(null);
  const [editingSubmissionId, setEditingSubmissionId] = useState<string | null>(null);
  const [editWorkMessage, setEditWorkMessage] = useState("");
  const [editWorkLink, setEditWorkLink] = useState("");
  const [editSelectedFile, setEditSelectedFile] = useState<File | null>(null);
  const [editSubmissionError, setEditSubmissionError] = useState("");
  const [editSubmissionSuccess, setEditSubmissionSuccess] = useState("");
  const [isUpdatingSubmission, setIsUpdatingSubmission] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const editFileInputRef = useRef<HTMLInputElement>(null);
  const createConversationId = (jobId: string, freelancerId: string) => `${jobId}_${freelancerId}`;
  const clientNameCache = useRef<Record<string, string>>({});
  const clientAvatarCache = useRef<Record<string, string>>({});
  const freelancerAvatarCache = useRef<Record<string, string>>({});

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

  const uploadContractFile = async (file: File) => {
    const idToken = await firebaseAuth.currentUser?.getIdToken();
    if (!idToken) throw new Error("Please log in before uploading files.");
    const formData = new FormData();
    formData.append("file", file);
    const uploadResponse = await fetch("/api/chat/upload", {
      method: "POST",
      headers: { Authorization: `Bearer ${idToken}` },
      body: formData,
    });
    const uploadPayload = (await uploadResponse.json()) as any;
    if (!uploadResponse.ok || !uploadPayload?.url) {
      throw new Error(uploadPayload?.error || "Failed to upload attachment.");
    }
    return {
      url: uploadPayload.url,
      name: uploadPayload.name ?? file.name,
      bytes: uploadPayload.bytes ?? file.size,
      size: uploadPayload.size ?? file.size,
      mimeType: uploadPayload.mimeType ?? file.type,
      resourceType: uploadPayload.resourceType ?? "auto",
      publicId: uploadPayload.publicId ?? "",
    };
  };

  const handleSubmitWork = async () => {
    if (!selectedContract || !selectedContract.clientId || !selectedContract.freelancerId) return;
    const nextMilestoneIndex = (selectedContract.paymentReleasedInstallments ?? 0) + 1;
    const milestone = selectedContract.milestones?.find((item: any, index) => Number(item.index ?? index + 1) === nextMilestoneIndex);
    const milestoneAmount = Number((milestone as any)?.freelancerAmountSats ?? calculateInstallmentAmount(selectedContract.paymentTotalAmountSats || parseSats(selectedContract.budget), selectedContract.paymentInstallments ?? 1, nextMilestoneIndex));
    const fundedForMilestone = milestone
      ? Number((milestone as any).fundedSats ?? 0) - Number((milestone as any).releasedSats ?? 0)
      : milestoneAmount;
    if (selectedContract.paymentStatus !== "funded" && selectedContract.paymentStatus !== "released") {
      setSubmissionError("Escrow is not funded for this milestone yet.");
      return;
    }
    if (fundedForMilestone < milestoneAmount) {
      setSubmissionError(`Milestone escrow is short by ${(milestoneAmount - fundedForMilestone).toLocaleString()} sats. Ask the client to fund escrow before submitting.`);
      return;
    }
    setIsSubmitting(true);
    setSubmissionError("");
    setSubmissionSuccess("");

    try {
      const attachment = selectedFile ? await uploadContractFile(selectedFile) : null;
      const contractUrl = `/client/dashboard/contracts?contract=${selectedContract.id}`;
      const notificationText = `Work for "${selectedContract.title}" has been submitted for review. [Check it out](${contractUrl})`;
      const messageText = notificationText;

      // Add to submitted_jobs collection
      const submissionData = {
        contractId: selectedContract.id,
        clientId: selectedContract.clientId,
        freelancerId: selectedContract.freelancerId,
        contractTitle: selectedContract.title,
        description: workMessage || "Work submitted for review.",
        link: workLink || "",
        attachment: attachment,
        submittedAt: serverTimestamp(),
        status: "pending",
      };

      // Update contract workStatus
      const nextMilestoneIndex = (selectedContract.paymentReleasedInstallments ?? 0) + 1;
      const updatedMilestones = (selectedContract.milestones ?? []).map((item: any, index) => {
        const itemIndex = Number(item.index ?? index + 1);
        if (itemIndex !== nextMilestoneIndex) return item;
        return {
          ...item,
          status: "submitted",
          submittedAt: new Date().toISOString(),
        };
      });
      const contractUpdate = {
        workStatus: "submitted",
        milestones: updatedMilestones,
        updatedAt: serverTimestamp(),
      };

      const conversationId =
        selectedContract.jobId && selectedContract.freelancerId
          ? `${selectedContract.jobId}_${selectedContract.freelancerId}`
          : selectedContract.id;

      await Promise.all([
        addDoc(collection(firebaseDb, "submitted_jobs"), submissionData),
        setDoc(doc(firebaseDb, "contracts", selectedContract.id), contractUpdate, { merge: true }),
        setDoc(
          doc(firebaseDb, "conversations", conversationId),
          {
            milestones: updatedMilestones,
            workStatus: "submitted",
            "lastMessage.text": notificationText,
            "lastMessage.senderId": selectedContract.freelancerId,
            "lastMessage.createdAt": serverTimestamp(),
            [`unread.${selectedContract.clientId}`]: increment(1),
            [`unread.${selectedContract.freelancerId}`]: 0,
            updatedAt: serverTimestamp(),
          },
          { merge: true }
        ),
        addDoc(collection(firebaseDb, "conversations", conversationId, "messages"), {
          senderId: selectedContract.freelancerId,
          senderRole: "freelancer",
          text: messageText,
          messageType: "work_submission",
          createdAt: serverTimestamp(),
        }),
      ]);

      setSubmissionSuccess("Work submitted for review.");
      setWorkMessage("");
      setWorkLink("");
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (error) {
      setSubmissionError("Unable to submit work. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    let unsubscribeContracts: (() => void) | undefined;
    let unsubscribeSubmitted: (() => void) | undefined;
    const unsubscribeAuth = onAuthStateChanged(firebaseAuth, (user) => {
      if (!user) {
        if (unsubscribeContracts) unsubscribeContracts();
        if (unsubscribeSubmitted) unsubscribeSubmitted();
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
        where("freelancerId", "==", user.uid)
      );
      unsubscribeContracts = onSnapshot(
        contractsQuery,
        (snapshot) => {
          const items: Contract[] = snapshot.docs.map((docSnap) => {
            const data = docSnap.data() as any;
            return {
              id: docSnap.id,
              title: data.title ?? "Contract",
              clientName: data.clientName ?? "",
              clientId: data.clientId ?? "",
              freelancerId: data.freelancerId ?? "",
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
              createdAt: data.createdAt,
              updatedAt: data.updatedAt,
            };
          });
          const hydrateClientNames = async () => {
            const hydrated = await Promise.all(
              items.map(async (contract) => ({
                ...contract,
                clientName: await resolveClientName(
                  contract.clientId ?? "",
                  contract.clientName ?? ""
                ),
              }))
            );
            // Sort by latest first (assuming updatedAt or createdAt exists)
            hydrated.sort((a, b) => {
              const aDate = a.updatedAt || a.createdAt || 0;
              const bDate = b.updatedAt || b.createdAt || 0;
              return bDate - aDate;
            });
            setContracts(hydrated);
            setLoading(false);
            if (!selectedId && hydrated.length) setSelectedId(hydrated[0].id);
          };
          hydrateClientNames();
        },
        () => {
          setLoading(false);
          setErrorMessage("Unable to load contracts.");
        }
      );

      // Load submitted jobs
      const submittedQuery = query(
        collection(firebaseDb, "submitted_jobs"),
        where("freelancerId", "==", user.uid)
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
          // Sort by latest first
          items.sort((a, b) => b.submittedAt.getTime() - a.submittedAt.getTime());
          setSubmittedJobs(items);
        },
        () => {
          // Handle error if needed
        }
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
  const editingSubmission = editingSubmissionId
    ? submittedJobs.find((job) => job.id === editingSubmissionId) ?? null
    : null;
  const editingSubmissionContract = editingSubmission
    ? contracts.find((contract) => contract.id === editingSubmission.contractId) ?? null
    : null;
  const contractStatusFilters: Array<{ id: typeof view; label: string; count: number }> = [
    { id: "active", label: "Active", count: activeContracts.length },
    { id: "ongoing", label: "Ongoing", count: ongoingContracts.length },
    { id: "finished", label: "Finished jobs", count: finishedContracts.length },
  ];
  const needsAttentionCount = submittedJobs.filter((job) => job.status === "rejected").length;

  const openEditSubmission = (job: SubmittedJob) => {
    setEditingSubmissionId(job.id);
    setEditWorkMessage(job.description || "");
    setEditWorkLink(job.link || "");
    setEditSelectedFile(null);
    setEditSubmissionError("");
    setEditSubmissionSuccess("");
    if (editFileInputRef.current) editFileInputRef.current.value = "";
  };

  const handleUpdateSubmission = async () => {
    if (!editingSubmission || !editingSubmissionContract) return;
    const description = editWorkMessage.trim();
    const link = editWorkLink.trim();

    if (!description && !link && !editSelectedFile && !editingSubmission.attachment) {
      setEditSubmissionError("Add a note, link, or file before saving the submission.");
      return;
    }

    setIsUpdatingSubmission(true);
    setEditSubmissionError("");
    setEditSubmissionSuccess("");

    try {
      const attachment = editSelectedFile
        ? await uploadContractFile(editSelectedFile)
        : editingSubmission.attachment ?? null;
      const nextMilestoneIndex = (editingSubmissionContract.paymentReleasedInstallments ?? 0) + 1;
      const updatedMilestones = (editingSubmissionContract.milestones ?? []).map((item: any, index) => {
        const itemIndex = Number(item.index ?? index + 1);
        if (itemIndex !== nextMilestoneIndex) return item;
        return {
          ...item,
          status: "submitted",
          resubmittedAt: new Date().toISOString(),
        };
      });
      const conversationId =
        editingSubmissionContract.jobId && editingSubmissionContract.freelancerId
          ? `${editingSubmissionContract.jobId}_${editingSubmissionContract.freelancerId}`
          : editingSubmissionContract.id;
      const messageText =
        editingSubmission.status === "rejected"
          ? `Updated work for "${editingSubmissionContract.title}" has been resubmitted after requested adjustments.`
          : `Submitted work for "${editingSubmissionContract.title}" was updated.`;

      await Promise.all([
        updateDoc(doc(firebaseDb, "submitted_jobs", editingSubmission.id), {
          description: description || "Work submitted for review.",
          link,
          attachment,
          status: "pending",
          updatedAt: serverTimestamp(),
          resubmittedAt: serverTimestamp(),
        }),
        setDoc(doc(firebaseDb, "contracts", editingSubmission.contractId), {
          workStatus: "submitted",
          milestones: updatedMilestones,
          unreadByClient: true,
          unreadByFreelancer: false,
          updatedAt: serverTimestamp(),
        }, { merge: true }),
        setDoc(
          doc(firebaseDb, "conversations", conversationId),
          {
            workStatus: "submitted",
            milestones: updatedMilestones,
            "lastMessage.text": messageText,
            "lastMessage.senderId": editingSubmissionContract.freelancerId,
            "lastMessage.createdAt": serverTimestamp(),
            [`unread.${editingSubmissionContract.clientId}`]: increment(1),
            [`unread.${editingSubmissionContract.freelancerId}`]: 0,
            updatedAt: serverTimestamp(),
          },
          { merge: true }
        ),
        addDoc(collection(firebaseDb, "conversations", conversationId, "messages"), {
          senderId: editingSubmissionContract.freelancerId,
          senderRole: "freelancer",
          text: messageText,
          messageType: "work_resubmission",
          createdAt: serverTimestamp(),
        }),
      ]);

      setEditSubmissionSuccess("Submission updated and sent back to the client.");
      setEditingSubmissionId(null);
      setSelectedSubmissionId(editingSubmission.id);
      setEditSelectedFile(null);
      if (editFileInputRef.current) editFileInputRef.current.value = "";
    } catch {
      setEditSubmissionError("Unable to update the submission. Please try again.");
    } finally {
      setIsUpdatingSubmission(false);
    }
  };

  return (
    <section className="w-full">
      <div className="flex items-center gap-6 px-2">
        {[
          { id: "contracts", label: "Contracts", alert: false },
          { id: "submitted", label: "Submitted jobs", alert: needsAttentionCount > 0 },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id as "contracts" | "submitted")}
            className={`relative py-3 text-[13px] font-medium transition ${
              activeTab === tab.id ? "text-[#1a1a1a]" : "text-[#8f8780] hover:text-[#1a1a1a]"
            }`}
          >
            <span className="inline-flex items-center gap-2">
              {tab.label}
              {tab.alert ? (
                <span className="inline-flex h-2 w-2 rounded-full bg-[#F7931A]" />
              ) : null}
            </span>
            {activeTab === tab.id ? (
              <span className="absolute bottom-[-1px] left-0 h-[2px] w-full rounded-full bg-[#F7931A]" />
            ) : null}
          </button>
        ))}
      </div>

      <div className="mt-2 rounded-[14px] border border-[#EAE7E2] bg-white p-3 shadow-[0_8px_22px_rgba(0,0,0,0.04)]">
        {activeTab === 'contracts' && (
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
        )}
        <div className="mt-4 grid grid-cols-1 gap-4">
          {activeTab === 'contracts' ? (
            <>
              {loading ? (
                <div className="rounded-[12px] border border-[#EAE7E2] bg-white p-4 text-[12px] text-[#6b6762]">
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
                    <span>Client</span>
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
                          <div className="mt-1 text-[11px] text-[#9e9690] md:hidden">Client: {contract.clientName}</div>
                        </div>
                        <div className="hidden truncate text-[12px] text-[#6b6762] md:block">{contract.clientName}</div>
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
                    onClick={() => router.push("/freelancer/dashboard/job-feed")}
                  >
                    <Briefcase className="mr-2 h-4 w-4" />
                    Find Tasks
                  </Button>
                </div>
              )}
            </>
          ) : (
            <>
              {submittedJobs.length ? (
                submittedJobs.map((job) => (
                  // <div
                  //   key={job.id}
                  //   className="rounded-[12px] break-words break-all border border-[#EAE7E2] bg-white p-4 shadow-[0_6px_16px_rgba(0,0,0,0.04)]"
                  // >
                  //   <div className="flex items-start justify-between gap-3">
                  //     <div>
                  //       <div className="text-[14px] font-semibold text-[#1a1a1a]">{job.description}</div>
                  //       <div className="text-[12px] text-[#9e9690]">
                  //         Contract: {contracts.find(c => c.id === job.contractId)?.title || 'Unknown'}
                  //       </div>
                  //       {job.link && (
                  //         <div className="mt-2 text-[12px] text-[#6b6762] break-words  break-all">
                  //           Link: <a href={job.link} target="_blank" rel="noopener noreferrer" className="text-[#8C4F00] underline">{job.link}</a>
                  //         </div>
                  //       )}
                  //       {job.attachment && (
                  //         <div className="mt-2 text-[12px] text-[#6b6762] break-all">
                  //           Attachment: <a href={job.attachment.url} target="_blank" rel="noopener noreferrer" className="text-[#8C4F00] underline">{job.attachment.name}</a>
                  //         </div>
                  //       )}
                  //     </div>
                  //     <div className="text-right">
                  //       <div className={`text-[10px] uppercase tracking-[0.1em] font-semibold ${
                  //         job.status === 'approved' ? 'text-green-600' : job.status === 'rejected' ? 'text-red-600' : 'text-[#F5A623]'
                  //       }`}>
                  //         {job.status}
                  //       </div>
                  //       <div className="mt-2 text-[10px] text-[#6b6762]">
                  //         {job.submittedAt.toLocaleDateString()}
                  //       </div>
                  //     </div>
                  //   </div>
                  // </div>
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
                    <div className="flex w-full flex-col gap-2 sm:w-auto sm:min-w-[104px] sm:items-end sm:text-right">
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
                      <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto sm:flex-col">
                        <button
                          type="button"
                          onClick={() => setSelectedSubmissionId(job.id)}
                          className="rounded-full border border-[#EAE7E2] px-3 py-2 text-[10px] font-semibold text-[#6b6762] transition hover:bg-[#F7F4F0] sm:py-1"
                        >
                          View Details
                        </button>
                        {job.status !== 'approved' ? (
                        <button
                          type="button"
                          onClick={() => openEditSubmission(job)}
                          className="rounded-full bg-[#FFF4E6] px-3 py-2 text-[10px] font-semibold text-[#8C4F00] sm:py-1"
                        >
                          {job.status === 'rejected' ? 'Adjust' : 'Edit'}
                        </button>
                        ) : null}
                      </div>
                       
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
            </>
          )}
        </div>
      </div>

      {selectedSubmission && (
        <div className="fixed inset-0 z-[75] flex items-end justify-center px-2 py-2 sm:items-center sm:px-4 sm:py-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setSelectedSubmissionId(null)}
          />
          <div className="relative z-[76] max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-[14px] border border-[#EAE7E2] bg-white p-4 shadow-[0_20px_50px_rgba(0,0,0,0.2)] sm:rounded-[16px] sm:p-5">
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
                Your Submission
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

            {selectedSubmission.status === "rejected" ? (
              <div className="mt-4 rounded-[12px] border border-[#F8D7DA] bg-[#FFF5F5] p-4">
                <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#B42318]">
                  Client Requested Adjustments
                </div>
                <p className="mt-2 text-[13px] leading-6 text-[#7F1D1D]">
                  {selectedSubmission.revisionMessage || selectedSubmissionContract?.revisionMessage || "The client requested updates before approval."}
                </p>
              </div>
            ) : null}

            <div className="mt-5 grid grid-cols-1 gap-2 sm:flex sm:flex-wrap sm:justify-end">
              {selectedSubmission.status !== "approved" ? (
                <Button
                  size="sm"
                  className="w-full rounded-full sm:w-auto"
                  onClick={() => {
                    openEditSubmission(selectedSubmission);
                    setSelectedSubmissionId(null);
                  }}
                >
                  {selectedSubmission.status === "rejected" ? "Adjust And Resubmit" : "Edit Submission"}
                </Button>
              ) : null}
              {selectedSubmissionContract ? (
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full rounded-full sm:w-auto"
                  onClick={() => {
                    setSelectedId(selectedSubmissionContract.id);
                    setActiveTab("contracts");
                    setIsModalOpen(true);
                    setSelectedSubmissionId(null);
                  }}
                >
                  View Contract
                </Button>
              ) : null}
            </div>
          </div>
        </div>
      )}

      {editingSubmission && (
        <div className="fixed inset-0 z-[78] flex items-end justify-center px-2 py-2 sm:items-center sm:px-4 sm:py-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => {
              if (!isUpdatingSubmission) setEditingSubmissionId(null);
            }}
          />
          <div className="relative z-[79] max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-[14px] border border-[#EAE7E2] bg-white p-4 shadow-[0_20px_50px_rgba(0,0,0,0.2)] sm:rounded-[16px] sm:p-5">
            <button
              type="button"
              onClick={() => setEditingSubmissionId(null)}
              aria-label="Close"
              className="absolute right-4 top-4 rounded-full border border-[#EAE7E2] bg-white p-2 text-[#6b6762] hover:bg-[#F7F4F0]"
              disabled={isUpdatingSubmission}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>

            <div className="pr-10">
              <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#8C4F00]">
                {editingSubmission.status === "rejected" ? "Adjust Submission" : "Edit Submission"}
              </div>
              <div className="mt-2 break-words text-[16px] font-semibold leading-6 text-[#1a1a1a] [overflow-wrap:anywhere] sm:text-[18px]">
                {editingSubmissionContract?.title || "Submitted work"}
              </div>
              <p className="mt-2 text-[13px] leading-6 text-[#6b6762]">
                Update the work message, link, or attachment. Saving sends the latest version back to the client for review.
              </p>
            </div>

            {editingSubmission.status === "rejected" && (editingSubmission.revisionMessage || editingSubmissionContract?.revisionMessage) ? (
              <div className="mt-4 rounded-[12px] border border-[#F8D7DA] bg-[#FFF5F5] p-4">
                <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#B42318]">
                  Client Note
                </div>
                <p className="mt-2 text-[13px] leading-6 text-[#7F1D1D]">
                  {editingSubmission.revisionMessage || editingSubmissionContract?.revisionMessage}
                </p>
              </div>
            ) : null}

            <div className="mt-4 space-y-3">
              <textarea
                value={editWorkMessage}
                onChange={(event) => setEditWorkMessage(event.target.value)}
                placeholder="Describe the updated work"
                rows={4}
                className="w-full rounded-[10px] border border-[#EAE7E7] bg-[#FAF8F5] px-3 py-2 text-[13px] text-[#1a1a1a] outline-none focus:ring-2 focus:ring-orange-400/20"
              />
              <input
                value={editWorkLink}
                onChange={(event) => setEditWorkLink(event.target.value)}
                placeholder="Paste an updated deliverable, preview, or repository link"
                className="w-full rounded-[10px] border border-[#EAE7E7] bg-[#FAF8F5] px-3 py-2 text-[13px] text-[#1a1a1a] outline-none focus:ring-2 focus:ring-orange-400/20"
              />
              <input
                ref={editFileInputRef}
                type="file"
                className="hidden"
                onChange={(event) => setEditSelectedFile(event.target.files?.[0] ?? null)}
              />
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-full"
                  onClick={() => editFileInputRef.current?.click()}
                  disabled={isUpdatingSubmission}
                >
                  {editSelectedFile ? editSelectedFile.name : editingSubmission.attachment ? "Replace File" : "Attach File"}
                </Button>
                {editingSubmission.attachment && !editSelectedFile ? (
                  <span className="text-[11px] text-[#6b6762]">
                    Current file: {editingSubmission.attachment.name}
                  </span>
                ) : null}
                {editSelectedFile ? (
                  <button
                    type="button"
                    onClick={() => {
                      setEditSelectedFile(null);
                      if (editFileInputRef.current) editFileInputRef.current.value = "";
                    }}
                    className="text-[11px] font-semibold text-[#6b6762]"
                    disabled={isUpdatingSubmission}
                  >
                    Remove
                  </button>
                ) : null}
              </div>
            </div>

            {editSubmissionError ? (
              <p className="mt-3 rounded-[10px] border border-red-100 bg-red-50 px-3 py-2 text-[12px] text-red-700">
                {editSubmissionError}
              </p>
            ) : null}
            {editSubmissionSuccess ? (
              <p className="mt-3 rounded-[10px] border border-green-100 bg-green-50 px-3 py-2 text-[12px] text-green-700">
                {editSubmissionSuccess}
              </p>
            ) : null}

            <div className="mt-5 grid grid-cols-1 gap-2 sm:flex sm:justify-end">
              <Button
                size="sm"
                variant="outline"
                className="w-full rounded-full sm:w-auto"
                onClick={() => setEditingSubmissionId(null)}
                disabled={isUpdatingSubmission}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                className="w-full rounded-full sm:w-auto"
                onClick={() => void handleUpdateSubmission()}
                disabled={isUpdatingSubmission}
              >
                {isUpdatingSubmission ? "Saving..." : editingSubmission.status === "rejected" ? "Resubmit Work" : "Save Changes"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {isModalOpen && selectedContract ? (
        <div className="fixed inset-0 z-[80] flex items-end justify-center px-2 py-2 sm:items-center sm:px-4 sm:py-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setIsModalOpen(false)}
          />
          <div className="relative z-[81] max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-[14px] border border-[#EAE7E2] bg-[#FCF9F7] p-4 shadow-[0_20px_50px_rgba(0,0,0,0.2)] sm:rounded-[16px] sm:p-5">
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
                  Client: {selectedContract.clientName} • {selectedContract.status}
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
                  <div className="uppercase tracking-[0.12em] text-[#9e9690]">Client</div>
                  <div className="mt-1 font-semibold text-[#1a1a1a]">{selectedContract.clientName}</div>
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
                  <div className="uppercase tracking-[0.12em] text-[#9e9690]">Client Paid With Fee</div>
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
                Freelancer payouts are released only after the client approves each funded milestone.
              </p>
            </div>

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

            <div className="mt-4 rounded-[10px] border border-[#EFECE7] bg-[#FAF8F5] px-4 py-3">
              <div className="text-[10px] uppercase tracking-[0.12em] text-[#9e9690]">
                Next Milestone
              </div>
              <div className="mt-2 text-[12px] font-semibold text-[#1a1a1a]">
                {selectedContract.nextMilestone}
              </div>
            </div>

            {selectedContract.workStatus === "changes_requested" || selectedContract.revisionMessage ? (
              <div className="mt-5 rounded-[12px] border border-[#F8D7DA] bg-[#FFF5F5] p-4">
                <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#B42318]">
                  Client Requested Adjustments
                </div>
                <p className="mt-2 text-[12px] leading-6 text-[#7F1D1D]">
                  {selectedContract.revisionMessage || "The client requested changes before approval. Update the work and submit it again."}
                </p>
              </div>
            ) : null}

            <div className="mt-5 rounded-[12px] border border-[#EAE7E2] bg-[#FAF8F5] p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#8C4F00]">
                    Submit work
                  </div>
                  <p className="mt-2 text-[12px] text-[#6b6762]">
                    Use the contract page to upload your deliverable and share a link for client review.
                  </p>
                </div>
              </div>
             
              <div className="mt-4 space-y-3">
                <textarea
                  value={workMessage}
                  onChange={(e) => setWorkMessage(e.target.value)}
                  placeholder="Describe the completed work"
                  rows={3}
                  className="w-full rounded-[10px] border border-[#EAE7E7] bg-white px-3 py-2 text-[12px] text-[#1a1a1a] outline-none focus:ring-2 focus:ring-orange-400/20"
                />
                <input
                  value={workLink}
                  onChange={(e) => setWorkLink(e.target.value)}
                  placeholder="Paste a link to deliverable, preview, or repository"
                  className="w-full rounded-[10px] border border-[#EAE7E7] bg-white px-3 py-2 text-[12px] text-[#1a1a1a] outline-none focus:ring-2 focus:ring-orange-400/20"
                />
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)}
                />
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="rounded-full"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {selectedFile ? selectedFile.name : "Attach File"}
                  </Button>
                  {selectedFile ? (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedFile(null);
                        if (fileInputRef.current) fileInputRef.current.value = "";
                      }}
                      className="text-[11px] font-semibold text-[#6b6762]"
                    >
                      Remove
                    </button>
                  ) : null}
                  <Button
                    size="sm"
                    className="rounded-full"
                    onClick={() => void handleSubmitWork()}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Submitting..." : "Submit Work"}
                  </Button>
                </div>
                {submissionSuccess ? (
                  <p className="text-[12px] text-[#2F855A]">{submissionSuccess}</p>
                ) : null}
                {submissionError ? (
                  <p className="text-[12px] text-[#C53030]">{submissionError}</p>
                ) : null}
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              <Button
                size="sm"
                variant="outline"
                className="rounded-full"
                onClick={async () => {
                  if (!selectedContract?.jobId || !selectedContract?.freelancerId) return;
                  const clientId = selectedContract.clientId ?? "";
                  if (!clientId) return;
                  const freelancerId =
                    firebaseAuth.currentUser?.uid ?? selectedContract.freelancerId ?? "";
                  if (!freelancerId) return;
                  let freelancerName = "Freelancer";
                  let clientName = await resolveClientName(
                    clientId,
                    selectedContract.clientName ?? ""
                  );
                  const [clientAvatarUrl, freelancerAvatarUrl] = await Promise.all([
                    resolveClientAvatar(clientId),
                    resolveFreelancerAvatar(freelancerId),
                  ]);
                  try {
                    const allUsersSnap = await getDoc(doc(firebaseDb, "all_users", freelancerId));
                    if (allUsersSnap.exists()) {
                      const d = allUsersSnap.data() as any;
                      freelancerName = d.fullName ?? d.name ?? d.email ?? "Freelancer";
                    }
                  } catch {
                    freelancerName = "Freelancer";
                  }
                  if (!clientName) clientName = "Client";
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
                      paymentTotalAmountSats: parseSats(selectedContract.budget),
                      paymentStatus: "unfunded",
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
                  router.push(`/freelancer/dashboard/messages?chat=${conversationId}`);
                }}
              >
                Message Client
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
