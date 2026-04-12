"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/atoms/Button";
import { firebaseAuth, firebaseDb } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { collection, doc, getDoc, onSnapshot, query, serverTimestamp, setDoc, where } from "firebase/firestore";

type ContractStatus = "Active" | "Review" | "Completed";

type Contract = {
  id: string;
  title: string;
  clientName: string;
  clientId?: string;
  freelancerId?: string;
  jobId?: string;
  status: ContractStatus;
  budget: string;
  progress: number;
  nextMilestone: string;
  startDate: string;
  dueDate: string;
  description: string;
};

const formatDate = (value: any) => {
  if (!value) return "—";
  if (typeof value === "string") return value;
  const date = value?.seconds ? new Date(value.seconds * 1000) : new Date(value);
  return date.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
};

const formatSats = (value: string) =>
  value.toLowerCase().includes("sats") ? value : `${value} sats`;

export default function FreelancerContractsContent() {
  const router = useRouter();
  const [view, setView] = useState<"active" | "ongoing">("active");
  const [selectedId, setSelectedId] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const createConversationId = (jobId: string, freelancerId: string) => `${jobId}_${freelancerId}`;

  useEffect(() => {
    let unsubscribeContracts: (() => void) | undefined;
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
              clientName: data.clientName ?? "Client",
              clientId: data.clientId ?? "",
              freelancerId: data.freelancerId ?? "",
              jobId: data.jobId ?? "",
              status: (data.status as ContractStatus) ?? "Active",
              budget: formatSats(data.budget ?? "0"),
              progress: typeof data.progress === "number" ? data.progress : 0,
              nextMilestone: data.nextMilestone ?? "—",
              startDate: formatDate(data.startDate),
              dueDate: formatDate(data.dueDate),
              description: data.description ?? "—",
            };
          });
          setContracts(items);
          setLoading(false);
          if (!selectedId && items.length) setSelectedId(items[0].id);
        },
        () => {
          setLoading(false);
          setErrorMessage("Unable to load contracts.");
        }
      );
    });
    return () => {
      unsubscribeAuth();
      if (unsubscribeContracts) unsubscribeContracts();
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
                className="text-left rounded-[12px] border border-[#EAE7E2] bg-white p-4 shadow-[0_6px_16px_rgba(0,0,0,0.04)]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-[14px] font-semibold text-[#1a1a1a]">{contract.title}</div>
                    <div className="text-[12px] text-[#9e9690]">Client: {contract.clientName}</div>
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
                  Client: {selectedContract.clientName} • {selectedContract.status}
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
                  let clientName = selectedContract.clientName ?? "Client";
                  try {
                    const allUsersSnap = await getDoc(doc(firebaseDb, "all_users", freelancerId));
                    if (allUsersSnap.exists()) {
                      const d = allUsersSnap.data() as any;
                      freelancerName = d.fullName ?? d.name ?? d.email ?? "Freelancer";
                    }
                  } catch {
                    freelancerName = "Freelancer";
                  }
                  if (!clientName || clientName === "Client") {
                    try {
                      const allUsersSnap = await getDoc(doc(firebaseDb, "all_users", clientId));
                      if (allUsersSnap.exists()) {
                        const d = allUsersSnap.data() as any;
                        clientName = d.fullName ?? d.name ?? d.email ?? "Client";
                      }
                    } catch {
                      clientName = "Client";
                    }
                  }
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
