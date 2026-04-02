'use client';

import React, { useState, useMemo } from 'react';
import {
  CircleDollarSign,
  TrendingUp,
  Calendar,
  Download,
  CreditCard,
  Banknote,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  DollarSign,
  Search
} from 'lucide-react';
import FreelancerSidebar from '@/components/molecules/FreelancerSidebar';

// Mock data for earnings
const EARNINGS_STATS = {
  totalEarned: '2.45 BTC',
  thisMonth: '0.85 BTC',
  pending: '0.12 BTC',
  available: '2.33 BTC',
  monthlyGrowth: '+12.5%'
};

const ALL_TRANSACTIONS = [
  {
    id: 1,
    project: 'Lightning Network Integration',
    client: 'SatoshiLab',
    amount: '0.45 BTC',
    status: 'Completed',
    date: '2024-01-15',
    type: 'Payment'
  },
  {
    id: 2,
    project: 'UI/UX Wallet Design',
    client: 'BitFlow',
    amount: '0.32 BTC',
    status: 'Completed',
    date: '2024-01-12',
    type: 'Payment'
  },
  {
    id: 3,
    project: 'Smart Contract Audit',
    client: 'BlockSecure',
    amount: '0.28 BTC',
    status: 'Pending',
    date: '2024-01-10',
    type: 'Payment'
  },
  {
    id: 4,
    project: 'Platform Fee',
    client: 'Bitlance',
    amount: '-0.002 BTC',
    status: 'Completed',
    date: '2024-01-08',
    type: 'Fee'
  },
  {
    id: 5,
    project: 'Mobile App Development',
    client: 'CryptoWallet Inc',
    amount: '0.67 BTC',
    status: 'Completed',
    date: '2024-01-05',
    type: 'Payment'
  },
  {
    id: 6,
    project: 'Bitcoin Mining Optimization',
    client: 'HashPower Ltd',
    amount: '0.89 BTC',
    status: 'Completed',
    date: '2024-01-03',
    type: 'Payment'
  },
  {
    id: 7,
    project: 'DeFi Protocol Review',
    client: 'DeFiChain',
    amount: '0.54 BTC',
    status: 'Completed',
    date: '2024-01-01',
    type: 'Payment'
  },
  {
    id: 8,
    project: 'NFT Marketplace',
    client: 'RareBits',
    amount: '0.76 BTC',
    status: 'Pending',
    date: '2023-12-28',
    type: 'Payment'
  }
];

export default function EarningsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDate, setFilterDate] = useState('');

  const filteredTransactions = useMemo(() => {
    return ALL_TRANSACTIONS.filter((transaction) => {
      const matchesSearch =
        transaction.project.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.client.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDate = !filterDate || transaction.date === filterDate;
      return matchesSearch && matchesDate;
    });
  }, [searchTerm, filterDate]);

  return (
    <div className="min-h-screen bg-[#FCF9F7]">
      <main className="">
        <div className="w-full">
          <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-4 sm:gap-6 lg:gap-8">
            <FreelancerSidebar active="/freelancer/dashboard/earnings" />

            <section className="w-full mt-16 sm:mt-0">
              <div className="bg-[#FCF9F7] py-6 sm:py-10 md:py-16">
                <div className="mx-auto w-full max-w-7xl px-2 sm:px-4 md:px-6 lg:px-8">

                  {/* HEADER SECTION */}
                  <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6 mb-6 md:mb-10">
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-[#F7931A]/10 rounded-xl">
                          <CircleDollarSign className="w-6 h-6 text-[#F7931A]" />
                        </div>
                        <h1 className="text-3xl font-extrabold text-[#1a1a1a] tracking-tight">Earnings</h1>
                      </div>
                      <p className="text-[#6b6560] text-sm md:text-base font-medium">Track your Bitcoin earnings and manage payments.</p>
                    </div>

                    <div className="flex gap-3">
                      <button className="flex items-center justify-center gap-2 bg-white border border-[#ece7df] px-6 py-4 rounded-2xl font-bold text-sm text-[#1a1a1a] hover:bg-[#F7931A]/5 transition-all shadow-sm">
                        <Download className="w-4 h-4 text-[#F7931A]" />
                        Export
                      </button>
                      <button className="flex items-center justify-center gap-2 bg-gradient-to-r from-orange-600 to-orange-400 text-white px-8 py-4 rounded-2xl font-bold text-sm hover:shadow-[0_8px_20px_-6px_rgba(249,115,22,0.6)] transition-all active:scale-95 group">
                        <Banknote className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" />
                        Withdraw
                      </button>
                    </div>
                  </header>

                  {/* EARNINGS STATS GRID */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8 md:mb-10">
                    <StatCard
                      title="Total Earned"
                      value={EARNINGS_STATS.totalEarned}
                      subtext={EARNINGS_STATS.monthlyGrowth}
                      icon={<CircleDollarSign className="w-6 h-6" />}
                      trend="up"
                    //   variant="primary"
                    />
                    <StatCard
                      title="This Month"
                      value={EARNINGS_STATS.thisMonth}
                      subtext="Active earnings"
                      icon={<TrendingUp className="w-6 h-6" />}
                      trend="up"
                      variant="secondary"
                    />
                    <StatCard
                      title="Pending"
                      value={EARNINGS_STATS.pending}
                      subtext="In escrow"
                      icon={<Clock className="w-6 h-6" />}
                      trend="neutral"
                      variant="secondary"
                    />
                    <StatCard
                      title="Available"
                      value={EARNINGS_STATS.available}
                      subtext="Ready to withdraw"
                      icon={<Banknote className="w-6 h-6" />}
                      trend="up"
                      variant="secondary"
                    />
                  </div>

                  {/* ALL TRANSACTIONS - FULL WIDTH */}
                  <div className="bg-white rounded-2xl sm:rounded-3xl border border-[#ece7df] p-3 sm:p-6 md:p-8 shadow-sm">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-4 mb-4 md:mb-8">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className="w-1 h-4 sm:w-1.5 sm:h-6 bg-[#F7931A] rounded-full"></div>
                        <h2 className="text-lg sm:text-xl font-bold text-[#1a1a1a]">All Transactions</h2>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                        <div className="relative w-full sm:w-auto">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6b6560]" />
                          <input
                            type="text"
                            placeholder="Search by project or client..."
                            className="w-full sm:w-auto rounded-full border border-[#ece7df] pl-9 pr-4 py-2 text-sm text-[#333] bg-[#FCF9F7] focus:border-[#F7931A] outline-none"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                          />
                        </div>
                        <input
                          type="date"
                          className="rounded-full border border-[#ece7df] px-4 py-2 text-sm text-[#333] bg-[#FCF9F7] focus:border-[#F7931A] outline-none w-full sm:w-auto"
                          value={filterDate}
                          onChange={e => setFilterDate(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="flex flex-col gap-3 sm:gap-4">
                      {filteredTransactions.length > 0 ? (
                        filteredTransactions.map((transaction) => (
                          <TransactionCard key={transaction.id} transaction={transaction} />
                        ))
                      ) : (
                        <div className="text-center text-[#888] py-8">No transactions found.</div>
                      )}
                    </div>
                  </div>

                </div>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}

// SUB-COMPONENTS

function StatCard({ title, value, sub, icon, variant }: any) {
  const isPrimary = variant === 'primary';
  return (
    <div className={`p-6 rounded-[28px] border transition-all hover:translate-y-[-2px] ${
      isPrimary ? 'bg-gradient-to-br from-[#F7931A] to-[#8C4F00] text-white border-[#F7931A]' : 'bg-white border-[#ece7df] shadow-sm'
    }`}>
      <div className="flex items-center justify-between mb-4">
        <div className={`p-2 rounded-lg ${isPrimary ? 'bg-white/20 text-white' : 'bg-[#F7931A]/10 text-[#F7931A]'}`}>
          {React.cloneElement(icon, { size: 18 })}
        </div>
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isPrimary ? 'bg-white/20 text-white' : 'bg-green-50 text-green-600'}`}>
          {sub}
        </span>
      </div>
      <p className={`text-xs font-medium mb-1 ${isPrimary ? 'text-white/80' : 'text-[#6b6560]'}`}>{title}</p>
      <h3 className="text-xl font-black tracking-tight">{value}</h3>
    </div>
  );
}

function TransactionCard({ transaction }: { transaction: any }) {
  const isPayment = transaction.type === 'Payment';
  const isCompleted = transaction.status === 'Completed';

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 sm:p-4 bg-[#FCF9F7] rounded-xl sm:rounded-2xl border border-[#ece7df]">
      <div className="flex items-center gap-2 sm:gap-4">
        <div className={`p-2 rounded-lg ${isPayment ? 'bg-[#F7931A]/10 text-[#F7931A]' : 'bg-gray-100 text-gray-500'}`}>
          {isPayment ? <ArrowDownRight className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
        </div>
        <div>
          <div className="font-bold text-[#1a1a1a] text-sm sm:text-base">{transaction.project}</div>
          <div className="text-xs text-[#6b6560]">{transaction.client} • {transaction.date}</div>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        <div className="text-right">
          <div className={`font-mono text-xs sm:text-sm font-bold ${isPayment ? 'text-[#8C4F00]' : 'text-gray-500'}`}>
            {transaction.amount}
          </div>
          <div className="flex items-center gap-1 justify-end">
            {isCompleted ? (
              <CheckCircle2 className="w-3 h-3 text-green-500" />
            ) : (
              <Clock className="w-3 h-3 text-orange-500" />
            )}
            <span className={`text-[10px] font-bold ${isCompleted ? 'text-green-600' : 'text-orange-600'}`}>
              {transaction.status}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
