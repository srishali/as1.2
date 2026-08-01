import { useCallback, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Download,
  FileImage,
  FileText,
  Loader2,
  RotateCcw,
  ShieldCheck,
  UserPlus,
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
  | "form"              // Step 1: Registration Form
  | "generating"        // Loading indicator
  | "alreadyRegistered" // Step 4: Phone exists warning + Verify Button
  | "verifyDob"         // Step 5: Only DOB Input Field
  | "verifyFailed"      // Step 6: Verification Failed options
  | "done";             // Step 3 & 5: Pass generated/download screen

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
  const [pTouched, setPTouched] = useState<PersonalTouched>(PERSONAL_TOUCHED_INIT);

  const [location, setLocation] = useState<LocationState>(LOCATION_INIT);
  const [lTouched, setLTouched] = useState<LocationTouched>(LOCATION_TOUCHED_INIT);

  const [verifyDobValue, setVerifyDobValue] = useState("");
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

  /* ── STEP 1 & 2: SUBMIT REGISTRATION (CHECK PHONE EXISTING) ── */

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    touchAll();
    setFormError("");
    setReissueError("");

    if (!allValid) return;

    setStep("generating");

    try {
      const result = await submitRegistration({
        type: "visitor",
        action: "register",
        personal: {
          ...personal,
          ...location,
          interest: "Visitor Registration",
        },
      });

      // Step 4: Phone exists in records -> show already registered screen
      if (result.ok && result.alreadyRegistered) {
        setStep("alreadyRegistered");
        return;
      }

      if (!result.ok || !result.id) {
        throw new Error(
          result.error || "Registration could not be completed. Please try again."
        );
      }

      // Step 3: Phone does not exist -> generate new pass directly
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

  /* ── STEP 5: VERIFY DOB & REISSUE PASS ──────────────────────── */

  async function handleVerifySubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!verifyDobValue) return;

    setIsReissuing(true);
    setReissueError("");

    try {
      const result = await submitRegistration({
        type: "visitor",
        action: "reissue",
        personal: {
          phone: personal.phone,
          dob: verifyDobValue,
        },
      });

      // Step 6: DOB mismatch or verification failed
      if (!result.ok || !result.pass) {
        setReissueError(
          result.error || "Your details are not verified."
        );
        setStep("verifyFailed");
        return;
      }

      // Step 5 Match: Regenerate original pass
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
          : "Verification failed. Please try again."
      );
      setStep("verifyFailed");
    } finally {
      setIsReissuing(false);
    }
  }

  /* Reset back to Step 1 */
  function resetToStep1() {
    setPersonal(PERSONAL_INIT);
    setPTouched(PERSONAL_TOUCHED_INIT);

    setLocation(LOCATION_INIT);
    setLTouched(LOCATION_TOUCHED_INIT);

    setVerifyDobValue("");
    setPassData(null);
    setPassPng("");

    setFormError("");
    setReissueError("");
    setIsReissuing(false);
    setWasReissued(false);

    setStep("form");
  }

  /* ── STEP 4: ALREADY REGISTERED SCREEN ─────────────────────── */

  if (step === "alreadyRegistered") {
    return (
      <div className="space-y-6">
        <div className="flex flex-col items-center rounded-2xl border border-amber-200 bg-amber-50 px-6 py-8 text-center">
          <AlertTriangle className="h-12 w-12 text-amber-600" />

          <h3 className="mt-3 font-display text-xl font-bold text-slate-900">
            Phone Number Already Registered
          </h3>

          <p className="mt-2 max-w-md text-sm text-slate-600">
            Your phone number is already registered, kindly verify your details to download the pass.
          </p>

          <Button
            variant="accent"
            size="lg"
            className="mt-6 w-full max-w-sm shadow-lg"
            onClick={() => {
              setVerifyDobValue(personal.dob || "");
              setStep("verifyDob");
            }}
          >
            <ShieldCheck className="h-5 w-5" />
            Verify
          </Button>
        </div>
      </div>
    );
  }

  /* ── STEP 5: DOB VERIFICATION FIELD SCREEN ──────────────────── */

  if (step === "verifyDob") {
    return (
      <form onSubmit={handleVerifySubmit} className="space-y-6">
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-center">
          <h3 className="font-display text-lg font-bold text-slate-900">
            Verify Your Details
          </h3>
          <p className="mt-1 text-xs text-slate-500">
            Enter your Date of Birth registered with mobile number{" "}
            <span className="font-semibold text-slate-800">{personal.phone}</span>
          </p>

          <div className="mt-6 text-left">
            <label className="block text-xs font-semibold text-slate-700">
              Date of Birth <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              required
              value={verifyDobValue}
              onChange={(e) => setVerifyDobValue(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-900 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            disabled={!verifyDobValue || isReissuing}
            className="mt-6 w-full shadow-lg"
          >
            {isReissuing ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Verifying Details…
              </>
            ) : (
              "Submit & Download Pass"
            )}
          </Button>
        </div>
      </form>
    );
  }

  /* ── STEP 6: VERIFICATION FAILED SCREEN ─────────────────────── */

  if (step === "verifyFailed") {
    return (
      <div className="space-y-6">
        <div className="flex flex-col items-center rounded-2xl border border-red-200 bg-red-50 px-6 py-8 text-center">
          <AlertTriangle className="h-12 w-12 text-red-600" />

          <h3 className="mt-3 font-display text-xl font-bold text-slate-900">
            Verification Failed
          </h3>

          <p className="mt-2 max-w-md text-sm text-red-700">
            Your details are not verified, kindly provide the actual data while you registered or you can register with fresh phone number.
          </p>

          {reissueError && (
            <p className="mt-2 text-xs font-semibold text-red-600">
              {reissueError}
            </p>
          )}

          <div className="mt-6 grid w-full max-w-md gap-3 sm:grid-cols-2">
            {/* Step 7: Retry button repeats Step 5 */}
            <Button
              variant="outline"
              size="lg"
              className="w-full bg-white shadow-sm"
              onClick={() => {
                setReissueError("");
                setStep("verifyDob");
              }}
            >
              <RotateCcw className="h-4 w-4" />
              Retry
            </Button>

            {/* Step 8: Visitor Registration resets to Step 1 */}
            <Button
              variant="primary"
              size="lg"
              className="w-full shadow-lg"
              onClick={resetToStep1}
            >
              <UserPlus className="h-4 w-4" />
              Visitor Registration
            </Button>
          </div>
        </div>
      </div>
    );
  }

  /* ── STEP 3 & 5 MATCH: SUCCESS / PASS SCREEN ───────────────── */

  if (step === "done" && passData) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col items-center rounded-2xl border border-emerald-200 bg-emerald-50 px-6 py-8 text-center">
          <CheckCircle2 className="h-12 w-12 text-emerald-600" />

          <h3 className="mt-3 font-display text-xl font-bold text-slate-900">
            {wasReissued
              ? "Existing Visitor Pass Verified!"
              : "Registration Successful!"}
          </h3>

          <p className="mt-1 text-sm text-slate-600">
            {wasReissued
              ? "Your original Visitor Pass has been retrieved."
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
          onClick={resetToStep1}
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

  /* ── STEP 1: FORM ──────────────────────────────────────────── */

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <h3 className="font-display text-base font-bold text-slate-900">
        Personal Details
      </h3>

      {formError && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
          <p className="text-sm font-medium text-red-700">{formError}</p>
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
