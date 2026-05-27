const BLINK_GRAPHQL_URL = "https://api.blink.sv/graphql";

const CREATE_LIGHTNING_INVOICE = `
  mutation LnInvoiceCreate($input: LnInvoiceCreateInput!) {
    lnInvoiceCreate(input: $input) {
      invoice {
        paymentRequest
        paymentHash
        satoshis
      }
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
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.errors?.[0]?.message ?? data?.error ?? "Blink API request failed.");
  }

  return data;
}

async function getBtcWalletId(apiKey: string) {
  const configuredWalletId = process.env.BLINK_BTC_WALLET_ID?.trim();
  const data = await blinkGraphql(apiKey, GET_WALLETS);
  const wallets = (data?.data?.me?.defaultAccount?.wallets ?? []) as BlinkWallet[];
  const btcWallet = wallets.find((wallet) => wallet.walletCurrency === "BTC");

  if (!btcWallet?.id) {
    throw new Error("No BTC wallet was found for this Blink API key.");
  }

  const configuredWallet = wallets.find((wallet) => wallet.id === configuredWalletId);
  if (configuredWalletId && configuredWallet?.walletCurrency === "BTC") {
    return configuredWalletId;
  }

  return btcWallet.id;
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { amount?: number };
    const amount = Number(body.amount);

    if (!Number.isInteger(amount) || amount <= 0) {
      return Response.json(
        { error: "Amount must be a positive number of sats." },
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

    if (!apiKey.startsWith("blink_") && !apiKey.startsWith("galoy_staging_")) {
      return Response.json(
        {
          error:
            "This does not look like a Blink Bitcoin API key. Use the API key from dashboard.blink.sv, not a blink.new workspace key.",
        },
        { status: 500 }
      );
    }

    const walletId = await getBtcWalletId(apiKey);
    const data = await blinkGraphql(apiKey, CREATE_LIGHTNING_INVOICE, {
      input: {
        walletId,
        amount,
        memo: "Bitlance Payment",
      },
    });

    const errors = data?.data?.lnInvoiceCreate?.errors ?? [];
    if (errors.length) {
      return Response.json(
        {
          error: errors[0]?.message ?? "Blink could not create the invoice.",
          details: data,
        },
        { status: 400 }
      );
    }

    return Response.json(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to create invoice.";
    return Response.json({ error: message }, { status: 500 });
  }
}
