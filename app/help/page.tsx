"use client";

import FreelancerSidebar from "@/components/molecules/FreelancerSidebar";

const QUICK_TILES = [
  {
    title: "Account & Profile",
    desc: "Edit your profile, verify identity, and manage visibility.",
  },
  {
    title: "Payments & Payouts",
    desc: "Understand escrow, invoices, and satoshi payouts.",
  },
  {
    title: "Jobs & Contracts",
    desc: "Create proposals, manage milestones, and track progress.",
  },
  {
    title: "Safety & Trust",
    desc: "Report issues, resolve disputes, and stay secure.",
  },
];

const FAQS = [
  {
    q: "How do I get verified on Bitlance?",
    a: "Go to Settings and complete identity verification. Verification improves trust and boosts discoverability.",
  },
  {
    q: "When are payouts released?",
    a: "Payouts are released once a milestone is approved. You can review each release in Earnings.",
  },
  {
    q: "Can I pause my availability?",
    a: "Yes. In Settings, toggle Profile Visibility to pause public discovery while keeping your account active.",
  },
  {
    q: "What happens if there is a dispute?",
    a: "Open a dispute from the contract page. Our team reviews evidence and provides a resolution.",
  },
];

export default function HelpCenterPage() {
  return (
    <div className="min-h-screen bg-[#F7F6F3] font-sans">
      <div className="flex">
        <FreelancerSidebar active="/help" />

        <div className="flex-1 lg:ml-0">
          <div className="min-h-screen overflow-y-auto max-md:pt-[50px] pt-4 md:pt-0">
            <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
              <div className="mb-8">
                <div className="inline-flex items-center rounded-full border border-[#E6E2DD] bg-white px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#8C4F00]">
                  Support Hub
                </div>
                <h1 className="mt-4 text-[28px] font-semibold tracking-[-0.02em] text-[#1a1a1a] sm:text-[34px]">
                  Help Center
                </h1>
                <p className="mt-2 max-w-2xl text-[13px] leading-[1.8] text-[#6a6763]">
                  Find answers fast, learn how Bitlance works, and get support for your account,
                  payouts, and contracts.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                {QUICK_TILES.map((tile) => (
                  <div
                    key={tile.title}
                    className="rounded-[12px] border border-[#EAE7E2] bg-white p-4 shadow-[0_6px_18px_rgba(0,0,0,0.05)]"
                  >
                    <div className="text-[12px] font-semibold uppercase tracking-[0.1em] text-[#F5A623]">
                      {tile.title}
                    </div>
                    <p className="mt-2 text-[12px] leading-[1.7] text-[#6b6762]">
                      {tile.desc}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-[2fr_1fr]">
                <div className="rounded-[12px] border border-[#EAE7E2] bg-white p-5">
                  <div className="mb-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#F5A623]">
                    Frequently Asked
                  </div>
                  <div className="flex flex-col gap-4">
                    {FAQS.map((faq) => (
                      <div key={faq.q} className="rounded-[10px] border border-[#EFECE7] bg-[#FAF8F5] p-4">
                        <div className="text-[13px] font-semibold text-[#1a1a1a]">{faq.q}</div>
                        <div className="mt-2 text-[12px] leading-[1.7] text-[#6b6762]">
                          {faq.a}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-[12px] border border-[#EAE7E2] bg-gradient-to-br from-[#1a1a1a] to-[#2d2d2d] p-5 text-white">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#F5A623]">
                    Contact Support
                  </div>
                  <p className="mt-3 text-[13px] leading-[1.7] text-[#d9d3cc]">
                    Need a human? Our support crew is available 24/7 for verified freelancers and
                    priority contracts.
                  </p>
                  <div className="mt-4 flex flex-col gap-2">
                    <button className="w-full rounded-lg bg-gradient-to-r from-orange-600 to-orange-400 px-4 py-3 text-[12px] font-semibold uppercase tracking-[0.08em] text-white hover:opacity-90">
                      Start Live Chat
                    </button>
                    <button className="w-full rounded-lg border border-[#3d3a36] bg-transparent px-4 py-3 text-[12px] font-semibold uppercase tracking-[0.08em] text-[#f1ece6] hover:bg-white/10">
                      Email Support
                    </button>
                  </div>
                  <div className="mt-5 rounded-[10px] border border-[#3d3a36] bg-[#232323] p-3">
                    <div className="text-[10px] uppercase tracking-[0.14em] text-[#9e9690]">
                      Status
                    </div>
                    <div className="mt-1 text-[12px] text-[#f5f0eb]">
                      Average response time: under 2 hours
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 rounded-[12px] border border-[#EAE7E2] bg-white p-5">
                <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#F5A623]">
                  Popular Articles
                </div>
                <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
                  {[
                    "How escrow protects your payments",
                    "Writing proposals that win",
                    "Best practices for Lightning invoices",
                    "Avoiding common contract pitfalls",
                  ].map((title) => (
                    <div
                      key={title}
                      className="flex items-center justify-between rounded-[10px] border border-[#EFECE7] bg-[#FAF8F5] px-4 py-3"
                    >
                      <span className="text-[12px] font-medium text-[#1a1a1a]">{title}</span>
                      <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#8C4F00]">
                        Read
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
