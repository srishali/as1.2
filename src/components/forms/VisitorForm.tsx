import { useCallback, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Download,
  FileImage,
  FileText,
  Loader2,
  RotateCcw,
} from "lucide-react";
import { Button } from "../Button";
import {
  PersonalFields,
  validatePersonal,
  personalValid,
  type PersonalState,
  type PersonalTouched,
} from "./PersonalFields";
import {
  LocationFields,
  validateLocation,
  locationValid,
  type LocationState,
  type LocationTouched,
} from "./LocationFields";
import {
  generateQRDataUrl,
  renderPassToCanvasDataUrl,
  downloadDataUrl,
  downloadPdf,
} from "../../lib/passGenerator";
import {
  submitRegistration,
  type VisitorPassRecord,
} from "../../lib/submissions";
import { EVENT } from "../../config/site.config";
import { VisitorPassCard, type PassData } from "../templates/VisitorPass";

const PERSONAL_INIT: PersonalState = {
  fullName: "",
  email: "",
  phone: "",
  gender: "",
  dob: "",
};

const PERSONAL_TOUCHED_INIT: PersonalTouched = {
  fullName: false,
  email: false,
  phone: false,
  gender: false,
  dob: false,
};

const LOCATION_INIT: LocationState = {
  city: "",
  pincode: "",
  district: "",
  state: "",
};

const LOCATION_TOUCHED_INIT: LocationTouched = {
  city: false,
  pincode: false,
  district: false,
  state: false,
};

type Step =
  | "form"
  | "generating"
  | "alreadyRegistered"
  | "done";

type PassSource = {
  id: string;
  fullName: string;
  phone: string;
  gender: string;
  dob: string;
  issuedAt: string;
};

function formatIssuedAtNow() {
  return new Date().toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function VisitorForm() {
  const [personal, setPersonal] = useState<PersonalState>(PERSONAL_INIT);
  const [pTouched, setPTouched] = useState<PersonalTouched>(
    PERSONAL_TOUCHED_INIT
  );

  const [location, setLocation] = useState<LocationState>(LOCATION_INIT);
  const [lTouched, setLTouched] = useState<LocationTouched>(
    LOCATION_TOUCHED_INIT
  );

  const [step, setStep] = useState<Step>("form");
  const [passData, setPassData] = useState<PassData | null>(null);
  const [passPng, setPassPng] = useState("");

  const [formError, setFormError] = useState("");
  const [reissueError, setReissueError] = useState("");
  const [isReissuing, setIsReissuing] = useState(false);
  const [wasReissued, setWasReissued] = useState(false);

  const personalResults = validatePersonal(personal);
  const locationResults = validateLocation(location);

  const allValid =
    personalValid(personalResults) &&
    locationValid(locationResults);

  const touchAll = useCallback(() => {
    setPTouched({
      fullName: true,
      email: true,
      phone: true,
      gender: true,
      dob: true,
    });

    setLTouched({
      city: true,
      pincode: true,
      district: true,
      state: true,
    });
  }, []);

  const handleLocationAutoFill = useCallback(
    (data: { city: string; district: string; state: string }) => {
      setLocation((current) => ({
        ...current,
        city: data.city || current.city,
        district: data.district || current.district,
        state: data.state || current.state,
      }));
    },
    []
  );

  /*
   * This is the only pass-generation function.
   *
   * For a new registration:
   * - source values come from current form values.
   *
   * For a reissue:
   * - source values come only from the existing Sheet record.
   */
  async function generateAndShowPass(source: PassSource) {
    const qrText = `${source.id}|${source.fullName}|${source.phone}`;

    const qrDataUrl = await generateQRDataUrl(qrText);

    const finalPass: PassData = {
      id: source.id,
      fullName: source.fullName,
      gender: source.gender,
      dob: source.dob,
      qrDataUrl,
      issuedAt: source.issuedAt || formatIssuedAtNow(),
    };

    const png = await renderPassToCanvasDataUrl(finalPass);

    setPassData(finalPass);
    setPassPng(png);
  }

  function handleDownloadImage() {
    if (!passPng || !passData) return;

    downloadDataUrl(
      passPng,
      `${EVENT.name} - Visitor Pass - ${passData.id}.png`
    );
  }

  function handleDownloadPdf() {
    if (!passPng || !passData) return;

    downloadPdf(
      passPng,
      `${EVENT.name} - Visitor Pass - ${passData.id}.pdf`
    );
  }

  /* ── NEW REGISTRATION OR DUPLICATE CHECK ───────────────────── */

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    touchAll();
    setFormError("");
    setReissueError("");

    if (!allValid) return;

    setStep("generating");

    try {
      /*
       * register action is atomic:
       * - checks duplicate mobile number
       * - verifies DOB for existing records
       * - creates the new row only if no mobile exists
       * - generates official ID only for a new registration
       */
      const result = await submitRegistration({
        type: "visitor",
        action: "register",
        personal: {
          ...personal,
          ...location,
          interest: "Visitor Registration",
        },
      });

      /*
       * Existing visitor with matching Phone + DOB.
       * The backend intentionally does not return their ID/data here.
       */
      if (result.ok && result.alreadyRegistered) {
        setStep("alreadyRegistered");
        return;
      }

      /*
       * New registrations must receive a real Apps Script generated ID.
       * We deliberately do not generate a local fallback ID.
       */
      if (!result.ok || !result.id) {
        throw new Error(
          result.error ||
            "Registration could not be completed. Please try again."
        );
      }

      await generateAndShowPass({
        id: result.id,
        fullName: personal.fullName,
        phone: personal.phone,
        gender: personal.gender,
        dob: personal.dob,
        issuedAt: result.issuedAt || formatIssuedAtNow(),
      });

      setWasReissued(false);
      setStep("done");

    } catch (err) {
      console.error("Visitor registration error:", err);

      setFormError(
        err instanceof Error
          ? err.message
          : "Registration could not be completed. Please try again."
      );

      setStep("form");
    }
  }

  /* ── RETRIEVE / REISSUE EXISTING PASS ───────────────────────── */

  async function handleDownloadExistingPass() {
    setIsReissuing(true);
    setReissueError("");

    try {
      /*
       * Only phone + DOB are sent for reissue.
       * Other values currently typed in the form are ignored.
       */
      const result = await submitRegistration({
        type: "visitor",
        action: "reissue",
        personal: {
          phone: personal.phone,
          dob: personal.dob,
        },
      });

      if (!result.ok || !result.pass) {
        throw new Error(
          result.error ||
            "We could not retrieve your existing pass. Please try again."
        );
      }

      /*
       * These values are returned from the existing sheet row.
       * This guarantees the regenerated pass uses original registration data.
       */
      const existingPass: VisitorPassRecord = result.pass;

      await generateAndShowPass({
        id: existingPass.id,
        fullName: existingPass.fullName,
        phone: existingPass.phone,
        gender: existingPass.gender,
        dob: existingPass.dob,
        issuedAt: existingPass.issuedAt,
      });

      setWasReissued(true);
      setStep("done");

    } catch (err) {
      console.error("Pass reissue error:", err);

      setReissueError(
        err instanceof Error
          ? err.message
          : "We could not retrieve your existing pass. Please try again."
      );

    } finally {
      setIsReissuing(false);
    }
  }

  function reset() {
    setPersonal(PERSONAL_INIT);
    setPTouched(PERSONAL_TOUCHED_INIT);

    setLocation(LOCATION_INIT);
    setLTouched(LOCATION_TOUCHED_INIT);

    setPassData(null);
    setPassPng("");

    setFormError("");
    setReissueError("");
    setIsReissuing(false);
    setWasReissued(false);

    setStep("form");
  }

  /* ── ALREADY REGISTERED SCREEN ─────────────────────────────── */

  if (step === "alreadyRegistered") {
    return (
      <div className="space-y-6">
        <div className="flex flex-col items-center rounded-2xl border border-amber-200 bg-amber-50 px-6 py-8 text-center">
          <AlertTriangle className="h-12 w-12 text-amber-600" />

          <h3 className="mt-3 font-display text-xl font-bold text-slate-900">
            Visitor Already Registered
          </h3>

          <p className="mt-2 max-w-md text-sm text-slate-600">
            This mobile number is already registered for the event.
          </p>

          <p className="mt-1 max-w-md text-sm text-slate-600">
            You can securely retrieve your existing Visitor Pass below.
          </p>

          {reissueError && (
            <div className="mt-5 w-full max-w-md rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-left">
              <p className="text-sm font-medium text-red-700">
                {reissueError}
              </p>
            </div>
          )}

          <Button
            variant="accent"
            size="lg"
            className="mt-6 w-full max-w-sm shadow-lg"
            onClick={handleDownloadExistingPass}
            disabled={isReissuing}
          >
            {isReissuing ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Retrieving Pass…
              </>
            ) : (
              <>
                <Download className="h-5 w-5" />
                Download Existing Pass
              </>
            )}
          </Button>

          <p className="mt-3 text-xs text-slate-500">
            Your pass will be recreated from your original registration details.
          </p>
        </div>

        <button
          type="button"
          onClick={reset}
          className="flex w-full items-center justify-center gap-2 text-sm font-semibold text-brand-700 hover:text-brand-800"
        >
          <RotateCcw className="h-4 w-4" />
          Go back to form
        </button>
      </div>
    );
  }

  /* ── SUCCESS / PASS SCREEN ─────────────────────────────────── */

  if (step === "done" && passData) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col items-center rounded-2xl border border-emerald-200 bg-emerald-50 px-6 py-8 text-center">
          <CheckCircle2 className="h-12 w-12 text-emerald-600" />

          <h3 className="mt-3 font-display text-xl font-bold text-slate-900">
            {wasReissued
              ? "Existing Visitor Pass Ready!"
              : "Registration Successful!"}
          </h3>

          <p className="mt-1 text-sm text-slate-600">
            {wasReissued
              ? "Your original Visitor Pass has been recreated."
              : "Your Visitor Pass is ready. Download it below."}
          </p>

          <div className="mt-3 inline-flex items-center rounded-full bg-brand-50 px-4 py-1.5">
            <span className="font-mono text-sm font-bold tracking-widest text-brand-700">
              {passData.id}
            </span>
          </div>
        </div>

        <div className="flex justify-center overflow-x-auto rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <VisitorPassCard data={passData} />
        </div>

        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-center">
          <p className="text-sm font-semibold text-amber-900">
            Save your pass now
          </p>

          <p className="mt-1 text-xs text-amber-800">
            Visitor passes are not emailed. Please download the PNG or PDF before leaving this page.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <Button
            variant="primary"
            size="lg"
            className="w-full shadow-lg"
            onClick={handleDownloadImage}
          >
            <FileImage className="h-5 w-5" />
            Download as Image (PNG)
          </Button>

          <Button
            variant="accent"
            size="lg"
            className="w-full shadow-lg"
            onClick={handleDownloadPdf}
          >
            <FileText className="h-5 w-5" />
            Download as PDF
          </Button>
        </div>

        <button
          type="button"
          onClick={reset}
          className="flex w-full items-center justify-center gap-2 text-sm font-semibold text-brand-700 hover:text-brand-800"
        >
          <RotateCcw className="h-4 w-4" />
          Register another visitor
        </button>
      </div>
    );
  }

  /* ── LOADING SCREEN ────────────────────────────────────────── */

  if (step === "generating") {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-16">
        <Loader2 className="h-10 w-10 animate-spin text-brand-700" />

        <p className="font-display text-base font-bold text-slate-700">
          Registering and generating your Visitor Pass…
        </p>

        <p className="text-xs text-slate-400">
          Please wait — this takes a few seconds.
        </p>
      </div>
    );
  }

  /* ── FORM ──────────────────────────────────────────────────── */

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <h3 className="font-display text-base font-bold text-slate-900">
        Personal Details
      </h3>

      {formError && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />

          <p className="text-sm font-medium text-red-700">
            {formError}
          </p>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <PersonalFields
          state={personal}
          touched={pTouched}
          results={personalResults}
          onChange={(field, value) =>
            setPersonal((current) => ({
              ...current,
              [field]: value,
            }))
          }
          onBlur={(field) =>
            setPTouched((current) => ({
              ...current,
              [field]: true,
            }))
          }
        />

        <LocationFields
          state={location}
          touched={lTouched}
          results={locationResults}
          onChange={(field, value) =>
            setLocation((current) => ({
              ...current,
              [field]: value,
            }))
          }
          onBlur={(field) =>
            setLTouched((current) => ({
              ...current,
              [field]: true,
            }))
          }
          onAutoFill={handleLocationAutoFill}
        />
      </div>

      <Button
        type="submit"
        variant="primary"
        size="lg"
        disabled={!allValid}
        className={`w-full transition-opacity ${
          allValid ? "opacity-100" : "cursor-not-allowed opacity-50"
        }`}
      >
        Register and Download Pass
      </Button>
    </form>
  );
}