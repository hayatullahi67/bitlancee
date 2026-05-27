import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const url = searchParams.get("url");
  const name = searchParams.get("name") || "file";

  if (!url) return new Response("No URL", { status: 400 });

  try {
    // 🛡️ Use a standard browser-like fetch to bypass CDN blocks
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
      cache: 'no-store' // Critical: don't let Node cache the response
    });

    if (!response.ok) {
      // If the proxy still fails, redirect as a final hope (though this leads to the browser viewer)
      return NextResponse.redirect(url);
    }

    const data = await response.arrayBuffer();
    
    // ⬇️ This is the "Force Download" header set. 
    // By serving it from OUR domain, the browser MUST obey the download instruction.
    return new Response(data, {
      headers: {
        "Content-Type": "application/octet-stream",
        "Content-Disposition": `attachment; filename="${name.replace(/[^\x20-\x7E]/g, '')}"`,
        "Content-Length": data.byteLength.toString(),
        "Cache-Control": "no-cache",
      },
    });
  } catch (error) {
    console.error("[Download Proxy] Error:", error);
    return NextResponse.redirect(url);
  }
}
