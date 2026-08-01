import { FORM_URLS } from "../config/site.config";

export type FormType = "exhibitor" | "visitor" | "contact";

export type VisitorPassRecord = {
  id: string;
  fullName: string;
  phone: string;
  gender: string;
  dob: string;
  issuedAt: string;
};

export type RegistrationPayload = {
  type: FormType;
  action?: "register" | "reissue" | "send_pass";
  id?: string;
  personal: Record<string, string>;
  company?: Record<string, string>;
  interest?: string;
  message?: string;
  passImage?: string;
  passPdf?: string;
  attachImage?: boolean;
  attachPdf?: boolean;
  attachments?: { url: string; name: string }[];
};

export type SubmissionResult = {
  ok: boolean;
  id?: string;
  issuedAt?: string;
  offline?: boolean;
  status?: number;
  error?: string;
  alreadyRegistered?: boolean;
  pass?: VisitorPassRecord;
  downloads?: number;
  lastDownloadedAt?: string;
  reissued?: number;
  notFound?: boolean;     // phone not registered at all
  dobMismatch?: boolean;  // phone found but DOB wrong
};

type ApiResponse = {
  ok?: boolean;
  id?: string;
  issuedAt?: string;
  error?: string;
  alreadyRegistered?: boolean;
  pass?: VisitorPassRecord;
  downloads?: number;
  lastDownloadedAt?: string;
  reissued?: number;
  notFound?: boolean;
  dobMismatch?: boolean;
};

export async function submitRegistration(
  payload: RegistrationPayload
): Promise<SubmissionResult> {
  const formUrls: Record<string, string> = FORM_URLS;
  const url = formUrls[payload.type] || "";

  if (!url) {
    console.info("[Registration backend disabled]", payload);
    return { ok: true, offline: true };
  }

  try {
    const res = await fetch(url, {
      method: "POST",
      redirect: "follow",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload),
    });

    const responseText = await res.text();
    let data: ApiResponse;

    try {
      data = JSON.parse(responseText);
    } catch {
      console.error("[Backend Non-JSON Response Raw Text]:", responseText);
      return {
        ok: false,
        status: res.status,
        error: `Invalid server response (HTTP ${res.status}).`,
      };
    }

    return {
      ok: res.ok && data.ok === true,
      id: data.id,
      issuedAt: data.issuedAt,
      status: res.status,
      error: data.error,
      alreadyRegistered: data.alreadyRegistered,
      pass: data.pass,
      downloads: data.downloads,
      lastDownloadedAt: data.lastDownloadedAt,
      reissued: data.reissued,
      notFound: data.notFound,
      dobMismatch: data.dobMismatch,
    };
  } catch (err) {
    console.error("[Submission Failed]", err);
    return { ok: false, error: String(err) };
  }
}
