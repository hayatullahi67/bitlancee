const BLINK_GRAPHQL_URL = "https://api.blink.sv/graphql";

const CHECK_LIGHTNING_INVOICE = `
  query LnInvoicePaymentStatusByPaymentRequest($input: LnInvoicePaymentStatusByPaymentRequestInput!) {
    lnInvoicePaymentStatusByPaymentRequest(input: $input) {
      paymentHash
      paymentPreimage
      paymentRequest
      status
    }
  }
`;

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { paymentRequest?: string };
    const paymentRequest = body.paymentRequest?.trim();

    if (!paymentRequest) {
      return Response.json(
        { error: "paymentRequest is required." },
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

    const response = await fetch(BLINK_GRAPHQL_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-KEY": apiKey,
      },
      body: JSON.stringify({
        query: CHECK_LIGHTNING_INVOICE,
        variables: {
          input: {
            paymentRequest,
          },
        },
      }),
      cache: "no-store",
    });

    const data = await response.json();

    if (!response.ok) {
      return Response.json(
        { error: "Blink API request failed.", details: data },
        { status: response.status }
      );
    }

    return Response.json(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to check invoice.";
    return Response.json({ error: message }, { status: 500 });
  }
}
