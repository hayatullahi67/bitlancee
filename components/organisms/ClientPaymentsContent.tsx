"use client";

import { useMemo, useState, useEffect } from "react";
import Button from "@/components/atoms/Button";
import DashboardMetricCard from "@/components/molecules/DashboardMetricCard";
import { firebaseAuth, firebaseDb } from "@/lib/firebase";
import { collection, query, where, onSnapshot, orderBy } from "firebase/firestore";

// Fallback data
const FALLBACK_PAYMENTS: any[] = [];

export default function ClientPaymentsContent() {
  const [selectedId, setSelectedId] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [payments, setPayments] = useState(FALLBACK_PAYMENTS);
  const [loading, setLoading] = useState(true);
  const selectedPayment = useMemo(
    () => payments.find((payment) => payment.id === selectedId) ?? payments[0],
    [selectedId, payments]
  );

  useEffect(() => {
    const unsubscribeAuth = firebaseAuth.onAuthStateChanged((user) => {
      if (!user) {
        setPayments(FALLBACK_PAYMENTS);
        setLoading(false);
        return;
      }

      // Load conversations with payment data for client
      const conversationsQuery = query(
        collection(firebaseDb, 'conversations'),
        where('clientId', '==', user.uid),
        orderBy('updatedAt', 'desc')
      );

      const unsubscribe = onSnapshot(conversationsQuery, (snapshot) => {
        const conversations = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        // Process payments from conversations
        const processedPayments: any[] = [];

        conversations.forEach((conv: any) => {
          const paymentStatus = conv.paymentStatus;
          const amount = conv.paymentAmountSats || 0;
          const currentInstallment = conv.paymentCurrentInstallment || 1;
          const installments = conv.paymentInstallments || 1;

          // Only show payments that have invoices created or are funded
          if ((paymentStatus === 'invoice_created' || paymentStatus === 'funded' || paymentStatus === 'released') && amount > 0) {
            let status = "Pending";
            let method = "Lightning Invoice";
            let txRef = `LN-${conv.id.slice(-8).toUpperCase()}`;

            if (paymentStatus === 'released') {
              status = "Released";
              method = "Escrow Release";
              txRef = `ESC-${conv.id.slice(-8).toUpperCase()}`;
            } else if (paymentStatus === 'funded') {
              status = "Funded";
            } else if (paymentStatus === 'invoice_created') {
              status = "Invoice Created";
            }

            const paymentDate = conv.paymentReceivedAt || conv.updatedAt;
            const date = paymentDate ? 
              (paymentDate.toDate ? paymentDate.toDate() : new Date(paymentDate)) : 
              new Date();

            processedPayments.push({
              id: `INV-${conv.id.slice(-6).toUpperCase()}-${currentInstallment}`,
              freelancer: conv.freelancerName || conv.freelancer || "Freelancer",
              amount: `${amount.toLocaleString()} sats`,
              status,
              date: date.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
              method,
              contract: conv.jobTitle || conv.title || "Project",
              memo: `Milestone ${currentInstallment} of ${installments}`,
              txRef,
            });
          }
        });

        // Sort by date (newest first)
        processedPayments.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        setPayments(processedPayments);
        if (processedPayments.length > 0 && !selectedId) {
          setSelectedId(processedPayments[0].id);
        }
        setLoading(false);
      });

      return () => unsubscribe();
    });

    return () => unsubscribeAuth();
  }, [selectedId]);

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
        <DashboardMetricCard 
          label="Escrow Balance" 
          value={`${payments.filter(p => p.status === 'Funded').reduce((sum, p) => sum + parseInt(p.amount.replace(/[^0-9]/g, '')), 0).toLocaleString()} sats`} 
          change={`${payments.filter(p => p.status === 'Funded').length} active milestones`} 
          tone="neutral" 
        />
        <DashboardMetricCard 
          label="Pending Approvals" 
          value={payments.filter(p => p.status === 'Funded').length.toString()} 
          change="Review today" 
          tone="down" 
        />
        <DashboardMetricCard 
          label="Month Spend" 
          value={`${payments.filter(p => p.status === 'Released').reduce((sum, p) => sum + parseInt(p.amount.replace(/[^0-9]/g, '')), 0).toLocaleString()} sats`} 
          change="+12% vs Mar" 
          tone="up" 
        />
      </div>

      <div className="mt-8 rounded-[12px] border border-[#EAE7E2] bg-white p-5">
        <div className="mb-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#F5A623]">
          Recent Invoices
        </div>
        <div className="flex flex-col gap-3">
          {loading ? (
            <div className="text-center py-8 text-[#6b6762]">Loading payments...</div>
          ) : payments.length > 0 ? (
            payments.map((payment) => (
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
          ))
          ) : (
            <div className="text-center py-8 text-[#6b6762]">No payments found.</div>
          )}
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
