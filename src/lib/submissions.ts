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

  /*
   * Retained only to avoid breaking other existing form flows.
   * Visitor registration no longer sends these values.
   */
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
  reissued?: number;
  notFound?: boolean;      // phone not registered
  dobMismatch?: boolean;   // phone found, DOB wrong
};

type ApiResponse = {
  ok?: boolean;
  id?: string;
  issuedAt?: string;
  error?: string;
  alreadyRegistered?: boolean;
  pass?: VisitorPassRecord;
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

    /*
     * Kept compatible with your old helper.
     * VisitorForm checks for a real backend-issued ID,
     * so it will not issue an unrecorded local pass.
     */
    return {
      ok: true,
      offline: true,
    };
  }

  try {
    const res = await fetch(url, {
      method: "POST",
      redirect: "follow",
      headers: {
        "Content-Type": "text/plain;charset=utf-8",
      },
      body: JSON.stringify(payload),
    });

    let data: ApiResponse;

    try {
      data = await res.json();
    } catch {
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
      reissued: data.reissued,
    };

  } catch (err) {
    console.error("[Submission Failed]", err);

    return {
      ok: false,
      error: String(err),
    };
  }
}
