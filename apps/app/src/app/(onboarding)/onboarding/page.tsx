"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch, type UseFormReturn } from "react-hook-form";
import { toast } from "sonner";
import {
  ArrowRight,
  CheckCircle2,
  Loader2,
  MessageCircleMore,
  Sparkles,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@pilot/ui/components/card";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@pilot/ui/components/alert";
import { Badge } from "@pilot/ui/components/badge";
import { Button } from "@pilot/ui/components/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@pilot/ui/components/form";
import { Input } from "@pilot/ui/components/input";
import { RadioGroup, RadioGroupItem } from "@pilot/ui/components/radio-group";
import { Skeleton } from "@pilot/ui/components/skeleton";
import {
  Stepper,
  StepperIndicator,
  StepperItem,
  StepperSeparator,
  StepperTitle,
  StepperTrigger,
} from "@pilot/ui/components/stepper";
import { Checkbox } from "@pilot/ui/components/checkbox";

import { StepButtons } from "@/components/step-buttons";
import {
  active_platforms_options,
  business_type_options,
  current_tracking_options,
  gender_options,
  leads_per_month_options,
  pilot_goal_options,
  steps,
  use_case_options,
} from "@/lib/constants/onboarding";
import {
  checkOnboardingStatus,
  completeOnboarding,
  getInstagramOnboardingState,
  getUserData,
  prepareInstagramPreview,
  updateOnboardingStep,
} from "@/actions/onboarding";
import { optionToValue } from "@/lib/utils";
import { authClient } from "@/lib/auth-client";

const onboardingSteps = [
  { id: 0, name: "Instagram" },
  { id: 1, name: "Preview" },
  ...steps.map((step, index) => ({
    id: index + 2,
    name: step.name,
  })),
];

const setupProgressCopy = [
  "Pulling your last 10-20 DMs",
  "Mapping the basic metadata",
  "Drafting your first Sidekick reply",
] as const;

type InstagramConnectionState = {
  connected: boolean;
  error?: string;
  username?: string;
};

type InstagramPreviewState = {
  accountUsername: string;
  conversationCount: number;
  previewMessages: Array<{
    direction: "incoming" | "outgoing";
    sender: string;
    text: string;
    timestamp: string;
  }>;
  previewTarget: string;
  pulledDmCount: number;
  replyPreview: string;
  source: "live" | "starter";
};

const step0Schema = z.object({
  name: z.string().min(1, { message: "Please enter your name" }),
  gender: z.string().min(1, { message: "Please select your gender" }),
});

const step1Schema = z.object({
  use_case: z
    .array(z.string())
    .min(1, { message: "Please select at least one use case" }),
  other_use_case: z.string().optional(),
  leads_per_month: z.string().min(1, { message: "Please select an option" }),
  active_platforms: z
    .array(z.string())
    .min(1, { message: "Please select at least one platform" }),
  other_platform: z.string().optional(),
});

const step2Schema = z.object({
  business_type: z
    .string()
    .min(1, { message: "Please select a business type" }),
  other_business_type: z.string().optional(),
  pilot_goal: z
    .array(z.string())
    .min(1, { message: "Please select at least one goal" }),
  current_tracking: z
    .array(z.string())
    .min(1, { message: "Please select at least one tracking method" }),
  other_tracking: z.string().optional(),
});

type Step0FormValues = z.infer<typeof step0Schema>;
type Step1FormValues = z.infer<typeof step1Schema>;
type Step2FormValues = z.infer<typeof step2Schema>;

async function checkOnboardingStatusAndPrefill(
  router: { replace: (url: string) => void },
  step0Form: UseFormReturn<Step0FormValues>,
  step1Form: UseFormReturn<Step1FormValues>,
  step2Form: UseFormReturn<Step2FormValues>,
  setStepValidationState: React.Dispatch<
    React.SetStateAction<Record<number, boolean>>
  >,
  setIsInitializing: (value: boolean) => void,
) {
  try {
    const status = await checkOnboardingStatus();
    if (status.onboarding_complete) {
      router.replace("/");
    }

    const userDataResult = await getUserData();
    if (!userDataResult.success || !userDataResult.userData) {
      return;
    }

    if (userDataResult.userData.name) {
      step0Form.setValue("name", userDataResult.userData.name);
    }
    if (userDataResult.userData.gender) {
      step0Form.setValue("gender", userDataResult.userData.gender);
    }

    if (userDataResult.userData.use_case) {
      step1Form.setValue("use_case", userDataResult.userData.use_case);
    }
    if (userDataResult.userData.other_use_case) {
      step1Form.setValue(
        "other_use_case",
        userDataResult.userData.other_use_case,
      );
    }
    if (userDataResult.userData.leads_per_month) {
      step1Form.setValue(
        "leads_per_month",
        userDataResult.userData.leads_per_month,
      );
    }
    if (userDataResult.userData.active_platforms) {
      step1Form.setValue(
        "active_platforms",
        userDataResult.userData.active_platforms,
      );
    }
    if (userDataResult.userData.other_platform) {
      step1Form.setValue(
        "other_platform",
        userDataResult.userData.other_platform,
      );
    }

    if (userDataResult.userData.business_type) {
      step2Form.setValue(
        "business_type",
        userDataResult.userData.business_type,
      );
    }
    if (userDataResult.userData.other_business_type) {
      step2Form.setValue(
        "other_business_type",
        userDataResult.userData.other_business_type,
      );
    }
    if (userDataResult.userData.pilot_goal) {
      step2Form.setValue("pilot_goal", userDataResult.userData.pilot_goal);
    }
    if (userDataResult.userData.current_tracking) {
      step2Form.setValue(
        "current_tracking",
        userDataResult.userData.current_tracking,
      );
    }
    if (userDataResult.userData.other_tracking) {
      step2Form.setValue(
        "other_tracking",
        userDataResult.userData.other_tracking,
      );
    }

    setStepValidationState((previousState) => ({
      ...previousState,
      2: !!userDataResult.userData.name && !!userDataResult.userData.gender,
      3:
        !!userDataResult.userData.use_case?.length &&
        !!userDataResult.userData.leads_per_month &&
        !!userDataResult.userData.active_platforms?.length,
      4:
        !!userDataResult.userData.business_type &&
        !!userDataResult.userData.pilot_goal?.length &&
        !!userDataResult.userData.current_tracking?.length,
    }));
  } catch (error) {
    console.error("Error checking onboarding status:", error);
  } finally {
    setIsInitializing(false);
  }
}

async function checkInstagramConnectionAction(
  setInstagramConnection: React.Dispatch<
    React.SetStateAction<InstagramConnectionState>
  >,
  setStepValidationState: React.Dispatch<
    React.SetStateAction<Record<number, boolean>>
  >,
  setActiveStep: React.Dispatch<React.SetStateAction<number>>,
) {
  try {
    const result = await getInstagramOnboardingState();
    setInstagramConnection(result);
    setStepValidationState((previousState) => ({
      ...previousState,
      0: result.connected,
    }));

    if (result.connected) {
      setActiveStep((currentStep) => Math.max(currentStep, 1));
    }
  } catch (error) {
    console.error("Error checking Instagram connection:", error);
    setInstagramConnection({
      connected: false,
      error: "Failed to check Instagram connection",
    });
  }
}

async function submitStep0Action(
  values: Step0FormValues,
  setIsLoading: (value: boolean) => void,
  setStepValidationState: React.Dispatch<
    React.SetStateAction<Record<number, boolean>>
  >,
  onSuccess: () => void,
) {
  try {
    setIsLoading(true);
    const result = await updateOnboardingStep(values);

    if (!result.success) {
      toast.error(result.error || "Oops! Couldn't save your info. Try again?");
      return;
    }

    setStepValidationState((previousState) => ({ ...previousState, 2: true }));
    onSuccess();
    toast.success("Saved. Next step.");
  } catch (error) {
    console.error("Error submitting step 0:", error);
    toast.error("Hmm, something's not right. Give it another shot?");
  } finally {
    setIsLoading(false);
  }
}

async function submitStep1Action(
  values: Step1FormValues,
  setIsLoading: (value: boolean) => void,
  setStepValidationState: React.Dispatch<
    React.SetStateAction<Record<number, boolean>>
  >,
  onSuccess: () => void,
) {
  try {
    setIsLoading(true);
    const result = await updateOnboardingStep(values);

    if (!result.success) {
      toast.error(
        result.error ||
          "Failed to save your usage preferences. Please try again.",
      );
      return;
    }

    setStepValidationState((previousState) => ({ ...previousState, 3: true }));
    onSuccess();
    toast.success("Saved. One more step.");
  } catch (error) {
    console.error("Error submitting step 1:", error);
    toast.error("Hmm, something's not right. Give it another shot?");
  } finally {
    setIsLoading(false);
  }
}

async function submitStep2Action(
  values: Step2FormValues,
  setIsLoading: (value: boolean) => void,
  setStepValidationState: React.Dispatch<
    React.SetStateAction<Record<number, boolean>>
  >,
  router: { push: (url: string) => void },
) {
  try {
    setIsLoading(true);
    const updateResult = await updateOnboardingStep(values);

    if (!updateResult.success) {
      toast.error(
        updateResult.error ||
          "Failed to save your business details. Please try again.",
      );
      return;
    }

    setStepValidationState((previousState) => ({ ...previousState, 4: true }));

    const completeResult = await completeOnboarding();
    if (!completeResult.success) {
      toast.error(
        completeResult.error ||
          "Failed to complete onboarding. Please try again.",
      );
      return;
    }

    toast.success("Quick setup complete. Next up: Sidekick.");
    router.push("/sidekick-onboarding");
  } catch (error) {
    console.error("Error submitting step 2:", error);
    toast.error("Hmm, something's not right. Give it another shot?");
  } finally {
    setIsLoading(false);
  }
}

function formatPreviewTimestamp(timestamp: string) {
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) {
    return "Now";
  }

  return date.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
}

function OnboardingPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeStep, setActiveStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isConnectingInstagram, setIsConnectingInstagram] = useState(false);
  const [isPreparingPreview, setIsPreparingPreview] = useState(false);
  const [previewProgress, setPreviewProgress] = useState(0);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [instagramConnection, setInstagramConnection] =
    useState<InstagramConnectionState>({
      connected: false,
    });
  const [instagramPreview, setInstagramPreview] =
    useState<InstagramPreviewState | null>(null);
  const [stepValidationState, setStepValidationState] = useState<
    Record<number, boolean>
  >({
    0: false,
    1: false,
    2: false,
    3: false,
    4: false,
  });

  const session = authClient.useSession();
  const userData = {
    email: session?.data?.user?.email || "",
  };

  const step0Form = useForm<Step0FormValues>({
    resolver: zodResolver(step0Schema),
    defaultValues: {
      name: "",
      gender: "",
    },
  });

  const step1Form = useForm<Step1FormValues>({
    resolver: zodResolver(step1Schema),
    defaultValues: {
      use_case: [],
      other_use_case: "",
      leads_per_month: "",
      active_platforms: [],
      other_platform: "",
    },
  });

  const step2Form = useForm<Step2FormValues>({
    resolver: zodResolver(step2Schema),
    defaultValues: {
      business_type: "",
      other_business_type: "",
      pilot_goal: [],
      current_tracking: [],
      other_tracking: "",
    },
  });

  const watchedUseCase = useWatch({
    control: step1Form.control,
    name: "use_case",
  });
  const watchedActivePlatforms = useWatch({
    control: step1Form.control,
    name: "active_platforms",
  });
  const watchedBusinessType = useWatch({
    control: step2Form.control,
    name: "business_type",
  });
  const watchedCurrentTracking = useWatch({
    control: step2Form.control,
    name: "current_tracking",
  });

  useEffect(() => {
    checkOnboardingStatusAndPrefill(
      router,
      step0Form,
      step1Form,
      step2Form,
      setStepValidationState,
      setIsInitializing,
    );
    checkInstagramConnectionAction(
      setInstagramConnection,
      setStepValidationState,
      setActiveStep,
    );
  }, []);

  useEffect(() => {
    const success = searchParams.get("success");
    const error = searchParams.get("error");

    if (success === "instagram_connected") {
      toast.success("Instagram connected.");
      checkInstagramConnectionAction(
        setInstagramConnection,
        setStepValidationState,
        setActiveStep,
      );
    }

    if (error) {
      toast.error(`Instagram connection failed: ${error}`);
    }
  }, [searchParams]);

  useEffect(() => {
    if (!isPreparingPreview) {
      return;
    }

    const timers = [
      window.setTimeout(() => setPreviewProgress(1), 700),
      window.setTimeout(() => setPreviewProgress(2), 1400),
    ];

    return () => {
      timers.forEach((timer) => window.clearTimeout(timer));
    };
  }, [isPreparingPreview]);

  useEffect(() => {
    if (
      activeStep !== 1 ||
      !instagramConnection.connected ||
      instagramPreview ||
      isPreparingPreview
    ) {
      return;
    }

    async function loadPreview() {
      setPreviewError(null);
      setPreviewProgress(0);
      setStepValidationState((previousState) => ({
        ...previousState,
        1: false,
      }));
      setIsPreparingPreview(true);
      const result = await prepareInstagramPreview().catch((error) => {
        console.error("Error preparing onboarding preview:", error);
        return null;
      });

      if (!result || !result.success || !result.connected || !result.data) {
        setPreviewError(
          result?.error || "We couldn't prepare your preview yet.",
        );
        setIsPreparingPreview(false);
        return;
      }

      setInstagramPreview(result.data);
      setStepValidationState((previousState) => ({
        ...previousState,
        1: true,
      }));
      setIsPreparingPreview(false);
    }

    loadPreview();
  }, [
    activeStep,
    instagramConnection.connected,
    instagramPreview,
    isPreparingPreview,
  ]);

  const handleStep0Submit = (values: Step0FormValues) =>
    submitStep0Action(values, setIsLoading, setStepValidationState, () => {
      setActiveStep(3);
    });

  const handleStep1Submit = (values: Step1FormValues) =>
    submitStep1Action(values, setIsLoading, setStepValidationState, () => {
      setActiveStep(4);
    });

  const handleStep2Submit = (values: Step2FormValues) =>
    submitStep2Action(values, setIsLoading, setStepValidationState, router);

  const handleBack = () => {
    setActiveStep((previousStep) => previousStep - 1);
  };

  const handleInstagramConnect = () => {
    setIsConnectingInstagram(true);
    window.location.href = "/api/auth/instagram?returnTo=/onboarding";
  };

  const handleRefreshPreview = async () => {
    setInstagramPreview(null);
    setPreviewError(null);
    setPreviewProgress(0);
    setStepValidationState((previousState) => ({
      ...previousState,
      1: false,
    }));
    setIsPreparingPreview(true);
    const result = await prepareInstagramPreview().catch((error) => {
      console.error("Error refreshing onboarding preview:", error);
      return null;
    });

    if (!result || !result.success || !result.connected || !result.data) {
      setPreviewError(result?.error || "We couldn't prepare your preview yet.");
      setIsPreparingPreview(false);
      return;
    }

    setInstagramPreview(result.data);
    setStepValidationState((previousState) => ({
      ...previousState,
      1: true,
    }));
    setIsPreparingPreview(false);
  };

  if (isInitializing) {
    return (
      <div className="flex h-full items-center justify-center">
        <p>Loading your setup...</p>
      </div>
    );
  }

  return (
    <section className="w-full max-w-5xl overflow-y-auto px-4 py-6">
      <Card className="border-border shadow-md">
        <CardContent className="space-y-6 pt-6">
          <Stepper
            value={activeStep}
            onValueChange={(newStep) => {
              if (newStep < activeStep) {
                setActiveStep(newStep);
                return;
              }

              if (
                newStep === activeStep + 1 &&
                stepValidationState[activeStep]
              ) {
                setActiveStep(newStep);
              }
            }}
            className="px-2 py-2 sm:px-6"
          >
            {onboardingSteps.map((step, index) => (
              <StepperItem
                key={step.id}
                step={step.id}
                disabled={
                  step.id > activeStep + 1 ||
                  (step.id > activeStep && !stepValidationState[activeStep])
                }
                completed={activeStep > step.id}
                loading={
                  (isLoading && step.id >= 2 && step.id === activeStep) ||
                  (isPreparingPreview && step.id === 1)
                }
                className="relative flex-1 !flex-col"
              >
                <StepperTrigger className="flex-col gap-3">
                  <StepperIndicator />
                  <div className="px-2">
                    <StepperTitle>{step.name}</StepperTitle>
                  </div>
                </StepperTrigger>
                {index < onboardingSteps.length - 1 ? (
                  <StepperSeparator className="absolute inset-x-0 top-6 -order-1 m-0 left-[calc(50%+0.75rem+0.750rem)] -translate-y-1/2 group-data-[orientation=horizontal]/stepper:w-[calc(100%-3rem)] group-data-[orientation=horizontal]/stepper:flex-none" />
                ) : null}
              </StepperItem>
            ))}
          </Stepper>

          {activeStep === 0 ? (
            <Card className="overflow-hidden border-border bg-card text-card-foreground shadow-none">
              <div className="grid gap-8 p-6 md:grid-cols-[1.2fr_0.8fr] md:p-8">
                <div className="flex flex-col gap-3">
                  <h2 className="max-w-lg text-3xl font-semibold font-heading leading-tight">
                    Turn your next DM into revenue in 2 minutes.
                  </h2>
                  <p className="max-w-md text-sm text-muted-foreground">
                    Connect Instagram first so Pilot can show you what the
                    product feels like before asking for setup details.
                  </p>
                </div>

                <div className="flex flex-col justify-center gap-4 rounded-xl border bg-muted/40 p-6">
                  {instagramConnection.error ? (
                    <Alert>
                      <Sparkles data-icon="inline-start" />
                      <AlertTitle>Connection issue</AlertTitle>
                      <AlertDescription>
                        {instagramConnection.error}
                      </AlertDescription>
                    </Alert>
                  ) : null}

                  <Button
                    type="button"
                    size="lg"
                    className="h-12 w-full"
                    disabled={isConnectingInstagram}
                    onClick={handleInstagramConnect}
                  >
                    {isConnectingInstagram ? (
                      <Loader2
                        className="animate-spin"
                        data-icon="inline-start"
                      />
                    ) : null}
                    Connect Instagram
                  </Button>

                  <p className="text-center text-sm text-muted-foreground">
                    We&apos;ll only read DMs to train your AI.
                  </p>
                </div>
              </div>
            </Card>
          ) : null}

          {activeStep === 1 ? (
            <Card className="border-border/80 shadow-none">
              <CardHeader className="gap-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex flex-col gap-2">
                    <CardTitle className="text-2xl font-heading">
                      Setting things up...
                    </CardTitle>
                    <CardDescription>
                      We&apos;re pulling recent Instagram context and showing
                      you how Sidekick would jump into a real thread.
                    </CardDescription>
                  </div>
                  {instagramConnection.username ? (
                    <Badge variant="secondary">
                      @{instagramConnection.username}
                    </Badge>
                  ) : null}
                </div>
              </CardHeader>
              <CardContent className="flex flex-col gap-6">
                {isPreparingPreview ? (
                  <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
                    <div className="flex flex-col gap-3 rounded-xl border bg-muted/40 p-4">
                      {setupProgressCopy.map((copy, index) => (
                        <div
                          key={copy}
                          className="flex items-center gap-3 rounded-lg border border-border/60 bg-background/70 px-3 py-3"
                        >
                          {previewProgress > index ? (
                            <CheckCircle2 className="text-primary" />
                          ) : (
                            <Loader2 className="animate-spin text-muted-foreground" />
                          )}
                          <div className="flex flex-col gap-1">
                            <p className="text-sm font-medium">{copy}</p>
                            <p className="text-xs text-muted-foreground">
                              {index === 0
                                ? "Recent threads"
                                : index === 1
                                  ? "Timestamps and participants"
                                  : "1-2 sentence reply preview"}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="flex flex-col gap-4 rounded-xl border p-4">
                      <div className="flex items-center justify-between">
                        <Skeleton className="h-5 w-28" />
                        <Skeleton className="h-5 w-20" />
                      </div>
                      <div className="flex flex-col gap-3">
                        <Skeleton className="h-16 w-4/5 self-start rounded-2xl" />
                        <Skeleton className="h-14 w-3/5 self-end rounded-2xl" />
                        <Skeleton className="h-16 w-2/3 self-start rounded-2xl" />
                      </div>
                      <Skeleton className="h-px w-full" />
                      <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4">
                        <Skeleton className="h-4 w-28" />
                        <Skeleton className="mt-3 h-12 w-full" />
                      </div>
                    </div>
                  </div>
                ) : null}

                {!isPreparingPreview && previewError ? (
                  <Alert>
                    <MessageCircleMore data-icon="inline-start" />
                    <AlertTitle>Preview not ready yet</AlertTitle>
                    <AlertDescription>
                      <p>{previewError}</p>
                      <Button
                        type="button"
                        variant="link"
                        className="mt-1 h-auto px-0"
                        onClick={handleRefreshPreview}
                      >
                        Try again
                      </Button>
                    </AlertDescription>
                  </Alert>
                ) : null}

                {!isPreparingPreview && instagramPreview ? (
                  <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
                    <div className="flex flex-col gap-4">
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="rounded-xl border bg-muted/40 p-4">
                          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                            Recent DMs
                          </p>
                          <p className="mt-2 text-3xl font-semibold">
                            {instagramPreview.pulledDmCount}
                          </p>
                        </div>
                        <div className="rounded-xl border bg-muted/40 p-4">
                          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                            Conversations
                          </p>
                          <p className="mt-2 text-3xl font-semibold">
                            {instagramPreview.conversationCount}
                          </p>
                        </div>
                      </div>

                      <div className="rounded-xl border p-4">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="text-sm font-medium">
                              Here&apos;s how Sidekick would reply to this
                              message.
                            </p>
                            <p className="text-sm text-muted-foreground">
                              First preview for @
                              {instagramPreview.accountUsername}
                            </p>
                          </div>
                          {instagramPreview.source === "starter" ? (
                            <Badge variant="outline">Starter preview</Badge>
                          ) : (
                            <Badge variant="secondary">Live preview</Badge>
                          )}
                        </div>
                      </div>

                      {instagramPreview.source === "starter" ? (
                        <Alert>
                          <Sparkles data-icon="inline-start" />
                          <AlertTitle>Starter preview</AlertTitle>
                          <AlertDescription>
                            We&apos;ll swap this for live thread data as more
                            DMs sync in.
                          </AlertDescription>
                        </Alert>
                      ) : null}
                    </div>

                    <div className="flex flex-col gap-4 rounded-xl border p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">
                            DM with {instagramPreview.previewTarget}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Pilot previews the thread, then drafts the reply.
                          </p>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={handleRefreshPreview}
                        >
                          Refresh
                        </Button>
                      </div>

                      <div className="flex flex-col gap-3 rounded-xl bg-muted/40 p-3">
                        {instagramPreview.previewMessages.map((message) => (
                          <div
                            key={`${message.timestamp}-${message.sender}-${message.text}`}
                            className={`flex ${
                              message.direction === "outgoing"
                                ? "justify-end"
                                : "justify-start"
                            }`}
                          >
                            <div
                              className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                                message.direction === "outgoing"
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-background text-foreground"
                              }`}
                            >
                              <p className="mt-1 text-sm leading-relaxed">
                                {message.text}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4">
                        <div className="flex items-center gap-2">
                          <Sparkles className="text-primary" />
                          <p className="text-sm font-medium">Reply preview</p>
                        </div>
                        <p className="mt-3 text-sm leading-relaxed">
                          {instagramPreview.replyPreview}
                        </p>
                      </div>

                      <div className="flex justify-end">
                        <Button type="button" onClick={() => setActiveStep(2)}>
                          Continue
                          <ArrowRight data-icon="inline-end" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : null}
              </CardContent>
            </Card>
          ) : null}

          {activeStep === 2 ? (
            <div className="rounded-xl border border-border p-6 shadow-sm">
              <Form {...step0Form}>
                <form
                  onSubmit={step0Form.handleSubmit(handleStep0Submit)}
                  className="space-y-6"
                >
                  <h2 className="font-heading text-xl font-semibold">
                    Tell Us About You
                  </h2>

                  <FormField
                    control={step0Form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormDescription>
                          You can edit this later in Settings.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input value={userData.email} disabled />
                    </FormControl>
                  </FormItem>

                  <FormField
                    control={step0Form.control}
                    name="gender"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel>Gender</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            value={field.value}
                            className="grid grid-cols-2 gap-3 sm:grid-cols-4"
                          >
                            {gender_options.map((option) => (
                              <FormItem
                                key={option}
                                className="flex items-center space-x-1 space-y-0"
                              >
                                <FormControl>
                                  <RadioGroupItem
                                    value={option}
                                    id={`gender-${option}`}
                                    className="sr-only"
                                  />
                                </FormControl>
                                <FormLabel
                                  htmlFor={`gender-${option}`}
                                  className={`flex w-full cursor-pointer items-center gap-2 rounded-lg border p-3 transition-all ${
                                    field.value === option
                                      ? "border-primary bg-primary/10"
                                      : "border-border hover:border-muted-foreground"
                                  }`}
                                >
                                  <div
                                    className={`size-4 rounded-full border ${
                                      field.value === option
                                        ? "border-4 border-primary"
                                        : "border border-muted-foreground"
                                    }`}
                                  />
                                  <span>{option}</span>
                                </FormLabel>
                              </FormItem>
                            ))}
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <StepButtons showBack={false} isLoading={isLoading} />
                </form>
              </Form>
            </div>
          ) : null}

          {activeStep === 3 ? (
            <div className="rounded-xl border border-border p-6 shadow-sm">
              <Form {...step1Form}>
                <form
                  onSubmit={step1Form.handleSubmit(handleStep1Submit)}
                  className="space-y-6"
                >
                  <h2 className="font-heading text-xl font-semibold">
                    How You Use Pilot
                  </h2>

                  <FormField
                    control={step1Form.control}
                    name="use_case"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel>What will you use Pilot for?</FormLabel>
                        <div className="flex flex-col gap-2">
                          {use_case_options.map((option) => {
                            const value = optionToValue(option);

                            return (
                              <FormItem
                                key={value}
                                className="flex flex-row items-start space-x-3 space-y-0"
                              >
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(value)}
                                    onCheckedChange={(checked) => {
                                      const updatedValue = checked
                                        ? [...field.value, value]
                                        : field.value.filter(
                                            (currentValue) =>
                                              currentValue !== value,
                                          );
                                      field.onChange(updatedValue);
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  {option}
                                </FormLabel>
                              </FormItem>
                            );
                          })}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {watchedUseCase?.includes("other") ? (
                    <FormField
                      control={step1Form.control}
                      name="other_use_case"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tell us your use case</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  ) : null}

                  <FormField
                    control={step1Form.control}
                    name="leads_per_month"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel>
                          How many leads do you expect per month?
                        </FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            value={field.value}
                            className="grid grid-cols-2 gap-3 sm:grid-cols-4"
                          >
                            {leads_per_month_options.map((option) => (
                              <FormItem
                                key={option}
                                className="flex items-center space-x-1 space-y-0"
                              >
                                <FormControl>
                                  <RadioGroupItem
                                    value={option}
                                    id={`leads-${option}`}
                                    className="sr-only"
                                  />
                                </FormControl>
                                <FormLabel
                                  htmlFor={`leads-${option}`}
                                  className={`flex w-full cursor-pointer items-center justify-center rounded-lg border p-3 text-center transition-all ${
                                    field.value === option
                                      ? "border-primary bg-primary/10"
                                      : "border-border hover:border-muted-foreground"
                                  }`}
                                >
                                  {option}
                                </FormLabel>
                              </FormItem>
                            ))}
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={step1Form.control}
                    name="active_platforms"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel>Where are you active?</FormLabel>
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                          {active_platforms_options.map((option) => {
                            const value = optionToValue(option);

                            return (
                              <FormItem
                                key={value}
                                className="flex flex-row items-start space-x-3 space-y-0 rounded-lg border p-3"
                              >
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(value)}
                                    onCheckedChange={(checked) => {
                                      const updatedValue = checked
                                        ? [...field.value, value]
                                        : field.value.filter(
                                            (currentValue) =>
                                              currentValue !== value,
                                          );
                                      field.onChange(updatedValue);
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  {option}
                                </FormLabel>
                              </FormItem>
                            );
                          })}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {watchedActivePlatforms?.includes("other") ? (
                    <FormField
                      control={step1Form.control}
                      name="other_platform"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Which platform should we know about?
                          </FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  ) : null}

                  <StepButtons onBack={handleBack} isLoading={isLoading} />
                </form>
              </Form>
            </div>
          ) : null}

          {activeStep === 4 ? (
            <div className="rounded-xl border border-border p-6 shadow-sm">
              <Form {...step2Form}>
                <form
                  onSubmit={step2Form.handleSubmit(handleStep2Submit)}
                  className="space-y-6"
                >
                  <h2 className="font-heading text-xl font-semibold">
                    Business And Goals
                  </h2>

                  <FormField
                    control={step2Form.control}
                    name="business_type"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel>
                          What best describes your business?
                        </FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            value={field.value}
                            className="grid grid-cols-2 gap-3 sm:grid-cols-3"
                          >
                            {business_type_options.map((option) => (
                              <FormItem
                                key={option}
                                className="flex items-center space-x-1 space-y-0"
                              >
                                <FormControl>
                                  <RadioGroupItem
                                    value={option}
                                    id={`business-${option}`}
                                    className="sr-only"
                                  />
                                </FormControl>
                                <FormLabel
                                  htmlFor={`business-${option}`}
                                  className={`flex w-full cursor-pointer items-center justify-center rounded-lg border p-3 text-center transition-all ${
                                    field.value === option
                                      ? "border-primary bg-primary/10"
                                      : "border-border hover:border-muted-foreground"
                                  }`}
                                >
                                  {option}
                                </FormLabel>
                              </FormItem>
                            ))}
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {watchedBusinessType === "Other" ? (
                    <FormField
                      control={step2Form.control}
                      name="other_business_type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Tell us about your business type
                          </FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  ) : null}

                  <FormField
                    control={step2Form.control}
                    name="pilot_goal"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel>
                          What do you want Pilot to help with?
                        </FormLabel>
                        <div className="flex flex-col gap-2">
                          {pilot_goal_options.map((option) => {
                            const value = optionToValue(option);

                            return (
                              <FormItem
                                key={value}
                                className="flex flex-row items-start space-x-3 space-y-0"
                              >
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(value)}
                                    onCheckedChange={(checked) => {
                                      const updatedValue = checked
                                        ? [...field.value, value]
                                        : field.value.filter(
                                            (currentValue) =>
                                              currentValue !== value,
                                          );
                                      field.onChange(updatedValue);
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  {option}
                                </FormLabel>
                              </FormItem>
                            );
                          })}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={step2Form.control}
                    name="current_tracking"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel>
                          How are you tracking leads right now?
                        </FormLabel>
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                          {current_tracking_options.map((option) => {
                            const value = optionToValue(option);

                            return (
                              <FormItem
                                key={value}
                                className="flex flex-row items-start space-x-3 space-y-0 rounded-lg border p-3"
                              >
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(value)}
                                    onCheckedChange={(checked) => {
                                      const updatedValue = checked
                                        ? [...field.value, value]
                                        : field.value.filter(
                                            (currentValue) =>
                                              currentValue !== value,
                                          );
                                      field.onChange(updatedValue);
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  {option}
                                </FormLabel>
                              </FormItem>
                            );
                          })}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {watchedCurrentTracking?.includes("other") ? (
                    <FormField
                      control={step2Form.control}
                      name="other_tracking"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>What are you using today?</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  ) : null}

                  <StepButtons
                    onBack={handleBack}
                    submitLabel="Continue To Sidekick"
                    isLoading={isLoading}
                  />
                </form>
              </Form>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </section>
  );
}

export default function OnboardingPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-full items-center justify-center">
          <p>Loading your setup...</p>
        </div>
      }
    >
      <OnboardingPageContent />
    </Suspense>
  );
}
