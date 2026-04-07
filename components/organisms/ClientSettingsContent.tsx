"use client";

import { useState } from "react";
import Button from "@/components/atoms/Button";

export default function ClientSettingsContent() {
  const [form, setForm] = useState({
    company: "Atlas Ventures",
    contact: "ops@atlasventures.com",
    billingEmail: "finance@atlasventures.com",
    timezone: "UTC+1",
    notifications: true,
  });

  return (
    <section className="w-full">
      <div className="rounded-[12px] border border-[#EAE7E2] bg-white p-6 shadow-[0_8px_22px_rgba(0,0,0,0.05)]">
        <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#8C4F00]">
          Settings
        </div>
        <h1 className="mt-2 text-[24px] font-semibold tracking-[-0.02em] text-[#1a1a1a]">
          Client workspace preferences
        </h1>
        <p className="mt-2 text-[12px] leading-[1.7] text-[#6b6762]">
          Update company details, billing contacts, and notification preferences.
        </p>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1.2fr_1fr]">
        <div className="rounded-[12px] border border-[#EAE7E2] bg-white p-5">
          <div className="mb-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#F5A623]">
            Organization Details
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <label className="text-[11px] uppercase tracking-[0.14em] text-[#9e9690]">Company Name</label>
              <input
                value={form.company}
                onChange={(e) => setForm((prev) => ({ ...prev, company: e.target.value }))}
                className="rounded-lg border border-[#EAE7E2] px-3 py-2 text-[12px] text-[#1a1a1a] focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[11px] uppercase tracking-[0.14em] text-[#9e9690]">Primary Contact</label>
              <input
                value={form.contact}
                onChange={(e) => setForm((prev) => ({ ...prev, contact: e.target.value }))}
                className="rounded-lg border border-[#EAE7E2] px-3 py-2 text-[12px] text-[#1a1a1a] focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[11px] uppercase tracking-[0.14em] text-[#9e9690]">Billing Email</label>
              <input
                value={form.billingEmail}
                onChange={(e) => setForm((prev) => ({ ...prev, billingEmail: e.target.value }))}
                className="rounded-lg border border-[#EAE7E2] px-3 py-2 text-[12px] text-[#1a1a1a] focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[11px] uppercase tracking-[0.14em] text-[#9e9690]">Timezone</label>
              <input
                value={form.timezone}
                onChange={(e) => setForm((prev) => ({ ...prev, timezone: e.target.value }))}
                className="rounded-lg border border-[#EAE7E2] px-3 py-2 text-[12px] text-[#1a1a1a] focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>
          </div>
        </div>

        <div className="rounded-[12px] border border-[#EAE7E2] bg-white p-5">
          <div className="mb-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#F5A623]">
            Notifications
          </div>
          <div className="flex items-center justify-between rounded-[10px] border border-[#EFECE7] bg-[#FAF8F5] px-4 py-3">
            <div>
              <div className="text-[12px] font-semibold text-[#1a1a1a]">Hiring Updates</div>
              <div className="text-[11px] text-[#6b6762]">Receive proposal and contract alerts.</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={form.notifications}
                onChange={(e) => setForm((prev) => ({ ...prev, notifications: e.target.checked }))}
                className="sr-only peer"
              />
              <div className="w-12 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-orange-300 rounded-full peer peer-checked:bg-orange-600 transition-all"></div>
              <span className="absolute left-1 top-[3px] h-5 w-5 bg-white rounded-full transition-transform peer-checked:translate-x-6 border border-gray-200"></span>
            </label>
          </div>
          <div className="mt-6 flex items-center gap-3">
            <Button size="sm" variant="outline" className="rounded-full">
              Discard
            </Button>
            <Button size="sm" className="rounded-full">
              Save Changes
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
