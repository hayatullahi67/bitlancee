"use client";

import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";

export default function PaymentPage() {
  const [invoice, setInvoice] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const createInvoice = async () => {
    setLoading(true);
    setErrorMessage("");
    setInvoice("");

    try {
      const res = await fetch("/api/create-invoice", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ amount: 10 }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error ?? "Unable to generate invoice.");
      }

      const errors = data?.data?.lnInvoiceCreate?.errors ?? [];
      if (errors.length) {
        throw new Error(errors[0]?.message ?? "Blink could not create the invoice.");
      }

      const paymentRequest = data?.data?.lnInvoiceCreate?.invoice?.paymentRequest;
      if (!paymentRequest) {
        throw new Error("Blink did not return a payment request.");
      }

      setInvoice(paymentRequest);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to generate invoice.";
      setErrorMessage(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#F7F6F3] px-6 py-12 text-[#1a1a1a]">
      <section className="mx-auto flex w-full max-w-xl flex-col items-center rounded-[12px] border border-[#EAE7E2] bg-white p-8 text-center shadow-[0_8px_22px_rgba(0,0,0,0.05)]">
        <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#8C4F00]">
          Lightning Payment
        </div>
        <h1 className="mt-3 text-3xl font-extrabold">Pay with Bitcoin</h1>
        <p className="mt-3 max-w-md text-sm leading-6 text-[#6b6762]">
          Generate a Blink Lightning invoice from the backend and scan it with any Lightning wallet.
        </p>

        <button
          type="button"
          onClick={createInvoice}
          disabled={loading}
          className="mt-7 rounded-full bg-[#1a1a1a] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#333] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Generating..." : "Generate Invoice"}
        </button>

        {errorMessage ? (
          <p className="mt-5 rounded-[10px] border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
            {errorMessage}
          </p>
        ) : null}

        {invoice ? (
          <div className="mt-8 w-full">
            <h2 className="text-base font-bold">Scan to Pay</h2>
            <div className="mx-auto mt-4 flex h-[252px] w-[252px] items-center justify-center rounded-[12px] border border-[#EAE7E2] bg-white">
              <QRCodeSVG value={`lightning:${invoice}`} size={220} />
            </div>
            <p className="mt-5 break-all rounded-[10px] bg-[#F7F6F3] px-4 py-3 text-xs leading-5 text-[#6b6762]">
              {invoice}
            </p>
          </div>
        ) : null}
      </section>
    </main>
  );
}
