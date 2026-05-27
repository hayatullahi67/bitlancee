const BLINK_GRAPHQL_URL = "https://api.blink.sv/graphql";

const PAY_INVOICE = `
  mutation LnAddressPaymentSend($input: LnAddressPaymentSendInput!) {
    lnAddressPaymentSend(input: $input) {
      status
      errors {
        message
      }
    }
  }
`;

const GET_WALLETS = `
  query Me {
    me {
      defaultAccount {
        wallets {
          id
          walletCurrency
        }
      }
    }
  }
`;

type BlinkWallet = {
  id?: string;
  walletCurrency?: string;
};

async function blinkGraphql(apiKey: string, query: string, variables?: Record<string, unknown>) {
  const response = await fetch(BLINK_GRAPHQL_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-API-KEY": apiKey,
    },
    body: JSON.stringify({ query, variables }),
    cache: "no-store",
  });

  const text = await response.text();
  let data: any = null;
  try {
    data = JSON.parse(text);
  } catch {
    data = null;
  }

  if (!response.ok) {
    const message =
      data?.errors?.[0]?.message ?? data?.error ??
      (typeof text === "string" && text.trim() ? text.trim().slice(0, 512) : "Blink API request failed.");
    throw new Error(message);
  }

  if (!data) {
    throw new Error("Blink API returned invalid JSON.");
  }

  return data;
}

async function resolveLightningAddress(address: string) {
  // Parse Lightning address (user@domain.com)
  const [user, domain] = address.split('@');
  if (!user || !domain) {
    throw new Error('Invalid Lightning address format');
  }

  // Fetch LNURL from .well-known endpoint
  const lnurlResponse = await fetch(`https://${domain}/.well-known/lnurlp/${user}`);
  if (!lnurlResponse.ok) {
    throw new Error('Failed to resolve Lightning address');
  }

  const lnurlData = await lnurlResponse.json();
  return lnurlData;
}

async function getInvoiceFromLnurl(lnurl: string, amount: number, memo?: string) {
  // LNURL pay request
  const url = new URL(lnurl);
  url.searchParams.set('amount', (amount * 1000).toString()); // Convert to millisats
  if (memo) {
    url.searchParams.set('comment', memo);
  }

  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error('Failed to get invoice from LNURL');
  }

  const data = await response.json();
  return data;
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      lightningAddress?: string;
      amount?: number;
      memo?: string;
    };
    const { lightningAddress, amount, memo } = body;

    if (!lightningAddress || !amount) {
      return Response.json(
        { error: "lightningAddress and amount are required." },
        { status: 400 }
      );
    }

    if (amount <= 0) {
      return Response.json(
        { error: "Amount must be greater than 0." },
        { status: 400 }
      );
    }

    const lnAddress = lightningAddress.trim();
    if (!lnAddress.includes('@')) {
      return Response.json(
        { error: "Lightning address must be a user@domain address." },
        { status: 400 }
      );
    }

    const apiKey = process.env.BLINK_API_KEY;

    if (!apiKey || apiKey === "blink_xxxxxxxxxxxxx") {
      return Response.json(
        { error: "BLINK_API_KEY is not configured." },
        { status: 500 }
      );
    }

    // Get wallet ID for BTC wallet
    const walletResponse = await blinkGraphql(apiKey, GET_WALLETS);
    const wallets = walletResponse?.data?.me?.defaultAccount?.wallets as BlinkWallet[];
    const btcWallet = wallets?.find((w) => w.walletCurrency === "BTC");

    if (!btcWallet?.id) {
      return Response.json(
        { error: "BTC wallet not found in Blink account." },
        { status: 500 }
      );
    }

    // Pay the invoice using GraphQL
    const paymentResponse = await blinkGraphql(apiKey, PAY_INVOICE, {
      input: {
        walletId: btcWallet.id,
        lnAddress,
        amount: amount,
      },
    });

    const paymentData = paymentResponse?.data?.lnAddressPaymentSend;

    const errors = paymentData?.errors ?? [];
    if (errors.length) {
      return Response.json(
        { error: errors[0]?.message ?? "Payment failed." },
        { status: 400 }
      );
    }

    if (paymentData?.status !== "SUCCESS" && paymentData?.status !== "PAID") {
      return Response.json(
        { error: `Payment failed with status: ${paymentData?.status ?? 'unknown'}` },
        { status: 400 }
      );
    }

    return Response.json({
      success: true,
      status: paymentData.status,
    });
  } catch (error) {
    console.error("Error sending payment:", error);
    return Response.json(
      { error: error instanceof Error ? error.message : "Internal server error." },
      { status: 500 }
    );
  }
}