"use client";

import { useMemo, useState } from "react";
import Button from "@/components/atoms/Button";
import DashboardMetricCard from "@/components/molecules/DashboardMetricCard";

const PAYMENTS = [
  {
    id: "INV-1042",
    freelancer: "Nadia K.",
    amount: "120,000 sats",
    status: "Released",
    date: "Apr 04, 2026",
    method: "Lightning Invoice",
    contract: "Payment Routing Optimizer",
    memo: "Milestone 2 payout",
    txRef: "LN-7G4K-88A2",
  },
  {
    id: "INV-1039",
    freelancer: "Solomon P.",
    amount: "220,000 sats",
    status: "Pending",
    date: "Apr 01, 2026",
    method: "Escrow Release",
    contract: "Security Audit for LDK Gateway",
    memo: "Final report approval",
    txRef: "ESC-3F1Q-19H2",
  },
  {
    id: "INV-1034",
    freelancer: "Amina T.",
    amount: "85,000 sats",
    status: "Released",
    date: "Mar 28, 2026",
    method: "Lightning Invoice",
    contract: "Merchant Onboarding Flow",
    memo: "QA completion",
    txRef: "LN-9P2M-44Z1",
  },
];

export default function ClientPaymentsContent() {
  const [selectedId, setSelectedId] = useState(PAYMENTS[0]?.id ?? "");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const selectedPayment = useMemo(
    () => PAYMENTS.find((payment) => payment.id === selectedId) ?? PAYMENTS[0],
    [selectedId]
  );

  return (
    <section className="w-full">
      <div className="rounded-[12px] border border-[#EAE7E2] bg-white p-6 shadow-[0_8px_22px_rgba(0,0,0,0.05)]">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#8C4F00]">
              Payments
            </div>
            <h1 className="mt-2 text-[24px] font-semibold tracking-[-0.02em] text-[#1a1a1a]">
              Manage payouts and invoices
            </h1>
            <p className="mt-2 text-[12px] leading-[1.7] text-[#6b6762]">
              Track escrow releases, upcoming invoices, and payout history.
            </p>
          </div>
          <Button size="sm" className="rounded-full">
            Add Payment Method
          </Button>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <DashboardMetricCard label="Escrow Balance" value="640,000 sats" change="2 active milestones" tone="neutral" />
        <DashboardMetricCard label="Pending Approvals" value="2" change="Review today" tone="down" />
        <DashboardMetricCard label="Month Spend" value="1.1M sats" change="+12% vs Mar" tone="up" />
      </div>

      <div className="mt-8 rounded-[12px] border border-[#EAE7E2] bg-white p-5">
        <div className="mb-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#F5A623]">
          Recent Invoices
        </div>
        <div className="flex flex-col gap-3">
          {PAYMENTS.map((payment) => (
            <button
              key={payment.id}
              type="button"
              onClick={() => {
                setSelectedId(payment.id);
                setIsModalOpen(true);
              }}
              className="text-left flex flex-col gap-2 rounded-[10px] border border-[#EFECE7] bg-[#FAF8F5] px-4 py-3 transition-all md:flex-row md:items-center md:justify-between hover:border-[#F2D8AA]"
            >
              <div>
                <div className="text-[12px] font-semibold text-[#1a1a1a]">{payment.id}</div>
                <div className="text-[11px] text-[#6b6762]">Freelancer: {payment.freelancer}</div>
              </div>
              <div className="text-[11px] text-[#9e9690]">{payment.date}</div>
              <div className="text-[12px] font-semibold text-[#8C4F00]">{payment.amount}</div>
              <div className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#1a1a1a]">
                {payment.status}
              </div>
            </button>
          ))}
        </div>
      </div>

      {isModalOpen && selectedPayment ? (
        <div className="fixed inset-0 z-[80] flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setIsModalOpen(false)}
          />
          <div className="relative z-[81] w-full max-w-2xl rounded-[16px] border border-[#EAE7E2] bg-white p-6 shadow-[0_20px_50px_rgba(0,0,0,0.2)]">
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
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#8C4F00]">
                  Transaction Details
                </div>
                <div className="mt-2 text-[18px] font-semibold text-[#1a1a1a]">
                  {selectedPayment.id}
                </div>
                <div className="text-[12px] text-[#9e9690]">
                  {selectedPayment.date} • {selectedPayment.status}
                </div>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3 text-[11px] text-[#6b6762]">
              <div className="rounded-[10px] border border-[#EFECE7] bg-[#FAF8F5] px-3 py-2">
                <div className="uppercase tracking-[0.12em] text-[#9e9690]">Amount</div>
                <div className="mt-1 font-semibold text-[#1a1a1a]">{selectedPayment.amount}</div>
              </div>
              <div className="rounded-[10px] border border-[#EFECE7] bg-[#FAF8F5] px-3 py-2">
                <div className="uppercase tracking-[0.12em] text-[#9e9690]">Method</div>
                <div className="mt-1 font-semibold text-[#1a1a1a]">{selectedPayment.method}</div>
              </div>
              <div className="rounded-[10px] border border-[#EFECE7] bg-[#FAF8F5] px-3 py-2">
                <div className="uppercase tracking-[0.12em] text-[#9e9690]">Contract</div>
                <div className="mt-1 font-semibold text-[#1a1a1a]">{selectedPayment.contract}</div>
              </div>
              <div className="rounded-[10px] border border-[#EFECE7] bg-[#FAF8F5] px-3 py-2">
                <div className="uppercase tracking-[0.12em] text-[#9e9690]">Reference</div>
                <div className="mt-1 font-semibold text-[#1a1a1a]">{selectedPayment.txRef}</div>
              </div>
            </div>

            <div className="mt-4 rounded-[10px] border border-[#EFECE7] bg-[#FAF8F5] px-4 py-3">
              <div className="text-[10px] uppercase tracking-[0.12em] text-[#9e9690]">Memo</div>
              <div className="mt-2 text-[12px] text-[#1a1a1a]">{selectedPayment.memo}</div>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              <Button size="sm" variant="outline" className="rounded-full">
                Download Receipt
              </Button>
              <Button size="sm" className="rounded-full">
                View Invoice
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
