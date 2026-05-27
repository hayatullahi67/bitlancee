const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-3.5-flash";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

type ChatMessage = {
  role?: string;
  content?: string;
};

const APP_KNOWLEDGE = `
Bitlance is a Bitcoin freelance marketplace with client and freelancer dashboards.

Client dashboard:
- Overview: Shows active contracts, open job posts, total spend, total jobs posted, latest active contracts, and latest job posts. Clients can open contract/job detail modals and jump to posting a new job.
- Job Posts: Clients create jobs with title, category, budget, duration, company logo, job type, description, skills, and urgent flag. They can filter jobs by status, open job details, review proposals, edit jobs, and publish new jobs.
- Proposals: Clients review all proposals tied to jobs they posted. They can filter by job or proposal status, inspect a freelancer proposal, view the related job, message the freelancer, accept the proposal to create a contract and conversation, or reject the proposal.
- Contracts: Clients view active, ongoing, and finished contracts. They review submitted work, approve submissions, request changes, update contract/milestone state, and release payments when work is approved.
- Messages: Clients chat with freelancers, share files, see online presence, create Lightning escrow invoices for full funding or per milestone funding, verify invoices, and update contracts/escrows/conversations after funding.
- Payments: Clients see invoice/payment records from conversations, including invoice created, funded, and released states, escrow balance, pending approvals, month spend, and transaction details.
- Profile: Clients edit personal/company profile fields, company overview, contact details, website, location, industry, team size, about text, and avatar.
- Settings: Clients update company name, billing email, timezone, notification preferences, privacy profile visibility, password reset, and account deletion request.
- Help: Explains how the dashboard works and opens this AI support chat.

Freelancer dashboard:
- Overview: Shows freelancer welcome, recent proposal/application activity, pending proposals, proposals sent, approved count, and a Find New Gigs button.
- Job Feed: Freelancers browse all jobs, search/filter by category, view job details, save/unsave jobs, and apply to jobs.
- Proposals: Freelancers track submitted proposals by all, pending, accepted, and rejected. They can open proposal details and see linked job/client information.
- Contracts: Freelancers view active, ongoing, and finished contracts, submit completed milestone/work with message/link/file attachment, update submissions, see submitted jobs, revision requests, payment status, escrow/milestone information, and message clients.
- Messages: Freelancers chat with clients, share files, see online presence, view payment/work status, and submit or coordinate work from conversations.
- Earnings: Freelancers see total earnings, escrow locked, available balance, monthly performance, transaction history, contract financial detail, fees, and milestone status.
- Profile: Freelancers manage public profile data, avatar, title, location, hourly rate, bio, skills, availability, response time, and portfolio items with uploads.
- Settings: Freelancers manage email/project notifications, privacy profile visibility, Lightning address for payouts, password reset, and account deletion.

Payment and escrow basics:
- Clients create Lightning invoices from Messages to fund escrow.
- Funding can be full escrow or per milestone.
- Funded milestones move work into progress; submitted work goes to client review.
- Clients approve work or request changes.
- Released milestones count as freelancer earnings.

Support rules:
- Answer as the Bitlance dashboard assistant.
- Keep replies short, clear, and practical.
- Explain where to click and what page to use.
- If the user asks about account-specific data, say you cannot see their private account data and tell them where to check.
- If the user asks for legal, tax, financial, or irreversible account deletion advice, give cautious guidance and suggest contacting support.
- Do not invent unavailable features.
`;

const sanitizeMessages = (messages: ChatMessage[]) =>
  messages
    .slice(-8)
    .map((message) => ({
      role: message.role === "assistant" ? "model" : "user",
      parts: [{ text: String(message.content || "").slice(0, 1200) }],
    }))
    .filter((message) => message.parts[0].text.trim().length > 0);

const extractText = (payload: any) =>
  payload?.candidates?.[0]?.content?.parts
    ?.map((part: any) => part?.text || "")
    .join("")
    .trim();

export async function POST(req: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return Response.json({ error: "GEMINI_API_KEY is not configured." }, { status: 500 });
    }

    const body = (await req.json()) as { messages?: ChatMessage[] };
    const contents = sanitizeMessages(Array.isArray(body.messages) ? body.messages : []);

    if (!contents.length) {
      return Response.json({ error: "Message is required." }, { status: 400 });
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000);

    let response: Response;
    try {
      response = await fetch(GEMINI_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },
        body: JSON.stringify({
          system_instruction: {
            parts: [{ text: APP_KNOWLEDGE }],
          },
          contents,
          generationConfig: {
            maxOutputTokens: 500,
          },
        }),
        cache: "no-store",
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timeout);
    }

    const data = await response.json();

    if (!response.ok) {
      return Response.json(
        { error: data?.error?.message || "Gemini support request failed." },
        { status: response.status }
      );
    }

    const reply = extractText(data);

    if (!reply) {
      return Response.json({ error: "Gemini did not return a support reply." }, { status: 502 });
    }

    return Response.json({ reply });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to contact AI support.";
    return Response.json({ error: message }, { status: 500 });
  }
}
