import { NextResponse } from "next/server";
import { v2 as cloudinary, type UploadApiResponse } from "cloudinary";
import { Readable } from "node:stream";
import { randomUUID } from "node:crypto";

export const runtime = "nodejs";

const ALLOWED_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_FILE_SIZE_BYTES = 4 * 1024 * 1024;
const DEFAULT_FIREBASE_WEB_API_KEY = "AIzaSyCr_rWHnm0w79J63dm69DEMkjawulE5Ovk";

function unauthorized(message: string) {
  return NextResponse.json({ error: message }, { status: 401 });
}

async function getUidFromIdToken(authHeader: string | null): Promise<string | null> {
  if (!authHeader?.startsWith("Bearer ")) return null;
  const idToken = authHeader.slice("Bearer ".length).trim();
  if (!idToken) return null;

  const firebaseApiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY || DEFAULT_FIREBASE_WEB_API_KEY;
  const verifyResponse = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${firebaseApiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken }),
    },
  );

  if (!verifyResponse.ok) return null;

  const verifyData = (await verifyResponse.json()) as {
    users?: Array<{ localId?: string }>;
  };
  return verifyData.users?.[0]?.localId ?? null;
}

export async function POST(request: Request) {
  try {
    const uid = await getUidFromIdToken(request.headers.get("authorization"));
    if (!uid) return unauthorized("Unauthorized upload request.");

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;
    if (!cloudName || !apiKey || !apiSecret) {
      return NextResponse.json(
        { error: "Cloudinary environment variables are missing." },
        { status: 500 },
      );
    }

    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
      secure: true,
    });

    const formData = await request.formData();
    const file = formData.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file attached." }, { status: 400 });
    }

    if (!ALLOWED_MIME_TYPES.has(file.type)) {
      return NextResponse.json({ error: "Unsupported image format." }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json({ error: "Image is larger than 4MB." }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const imageBuffer = Buffer.from(arrayBuffer);

    const uploadResult = await new Promise<UploadApiResponse>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: `bitlance/portfolio/${uid}`,
          public_id: randomUUID(),
          overwrite: false,
          resource_type: "image",
          transformation: [
            {
              width: 1600,
              height: 1200,
              crop: "limit",
              quality: "auto",
              fetch_format: "auto",
            },
          ],
        },
        (error, result) => {
          if (error || !result) {
            reject(error ?? new Error("Upload failed."));
            return;
          }
          resolve(result);
        },
      );

      Readable.from(imageBuffer).pipe(uploadStream);
    });

    return NextResponse.json({
      imageUrl: uploadResult.secure_url,
      imagePublicId: uploadResult.public_id,
    });
  } catch (error) {
    console.error("Portfolio upload error:", error);
    return NextResponse.json({ error: "Failed to upload portfolio image." }, { status: 500 });
  }
}
