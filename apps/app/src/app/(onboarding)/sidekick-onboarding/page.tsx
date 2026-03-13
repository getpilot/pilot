"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";

import { Card, CardContent } from "@pilot/ui/components/card";
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
import { Textarea } from "@pilot/ui/components/textarea";
import {
  Stepper,
  StepperIndicator,
  StepperItem,
  StepperSeparator,
  StepperTitle,
  StepperTrigger,
} from "@pilot/ui/components/stepper";
import { StepButtons } from "@/components/step-buttons";
import { Button } from "@pilot/ui/components/button";

import {
  sidekickSteps,
  tone_options,
} from "@/lib/constants/sidekick-onboarding";
import {
  completeSidekickOnboarding,
  getSidekickOfferLinks,
  getSidekickOffers,
  getSidekickToneProfile,
  getSidekickFaqs,
  checkSidekickOnboardingStatus,
  updateSidekickOnboardingData,
  deleteOffer,
  deleteFaq,
  getSidekickMainOffering,
  SidekickOnboardingData,
} from "@/actions/sidekick/onboarding";

const step0Schema = z.object({
  primaryOfferUrl: z
    .string()
    .url({ message: "That doesn't look like a valid URL" }),
  calendarLink: z
    .string()
    .url({ message: "That doesn't look like a valid URL" })
    .optional()
    .or(z.literal("")),
  additionalInfoUrl: z
    .string()
    .url({ message: "That doesn't look like a valid URL" })
    .optional()
    .or(z.literal("")),
});

const step1Schema = z.object({
  offerName: z.string().min(1, { message: "What should we call this offer?" }),
  offerContent: z
    .string()
    .min(1, { message: "Tell us what this offer includes" }),
  offerValue: z.string().optional(),
});

const step2Schema = z.object({
  sellDescription: z.string().min(1, { message: "Tell us what you sell" }),
});

const step3Schema = z.object({
  question: z
    .string()
    .min(1, { message: "What question do people always ask?" }),
  answer: z.string().optional(),
});

const step4Schema = z.object({
  toneType: z.string().min(1, { message: "Pick how Sidekick should sound" }),
  customTone: z.string().optional(),
  sampleMessages: z.string().optional(),
});

type step0FormValues = z.infer<typeof step0Schema>;
type step1FormValues = z.infer<typeof step1Schema>;
type step2FormValues = z.infer<typeof step2Schema>;
type step3FormValues = z.infer<typeof step3Schema>;
type step4FormValues = z.infer<typeof step4Schema>;

type OfferItem = { id?: string; name: string; content: string; value?: number };
type FaqItem = { id?: string; question: string; answer?: string };

async function submitSidekickStep0Action(
  values: step0FormValues,
  setIsLoading: (v: boolean) => void,
  setStepValidationState: React.Dispatch<
    React.SetStateAction<Record<number, boolean>>
  >,
  onSuccess: () => void,
) {
  try {
    setIsLoading(true);

    const offerLinks = [];
    offerLinks.push({ type: "primary", url: values.primaryOfferUrl });
    if (values.calendarLink) {
      offerLinks.push({ type: "calendar", url: values.calendarLink });
    }
    if (values.additionalInfoUrl) {
      offerLinks.push({ type: "website", url: values.additionalInfoUrl });
    }

    const result = await updateSidekickOnboardingData({
      offerLinks: offerLinks as SidekickOnboardingData["offerLinks"],
    });

    if (!result.success) {
      toast.error(result.error || "Couldn't save your links. Try again?");
      return;
    }

    setStepValidationState((prevState) => ({ ...prevState, 0: true }));
    onSuccess();
    toast.success("Links saved. Next step.");
  } catch (error) {
    console.error("Error submitting step 0:", error);
    toast.error("Hmm, something's not right. Give it another shot?");
  } finally {
    setIsLoading(false);
  }
}

async function submitSidekickStep1Action(
  values: step1FormValues,
  currentOffers: OfferItem[],
  step1Form: { reset: (values: step1FormValues) => void },
  setOffers: React.Dispatch<React.SetStateAction<OfferItem[]>>,
  setIsLoading: (v: boolean) => void,
  setStepValidationState: React.Dispatch<
    React.SetStateAction<Record<number, boolean>>
  >,
) {
  try {
    setIsLoading(true);

    const newOffer = {
      name: values.offerName,
      content: values.offerContent,
      value: values.offerValue
        ? isNaN(parseInt(values.offerValue))
          ? undefined
          : parseInt(values.offerValue)
        : undefined,
    };

    const result = await updateSidekickOnboardingData({
      offers: [newOffer],
    });

    if (!result.success) {
      toast.error(result.error || "Couldn't save your offer. Try again?");
      return;
    }

    setOffers([...currentOffers, newOffer]);
    step1Form.reset({ offerName: "", offerContent: "", offerValue: "" });
    setStepValidationState((prevState) => ({ ...prevState, 1: true }));
    toast.success("Offer added.");
  } catch (error) {
    console.error("Error submitting step 1:", error);
    toast.error("Hmm, something's not right. Give it another shot?");
  } finally {
    setIsLoading(false);
  }
}

async function submitSidekickStep2Action(
  values: step2FormValues,
  setIsLoading: (v: boolean) => void,
  setStepValidationState: React.Dispatch<
    React.SetStateAction<Record<number, boolean>>
  >,
  onSuccess: () => void,
) {
  try {
    setIsLoading(true);

    const result = await updateSidekickOnboardingData({
      mainOffering: values.sellDescription,
    });

    if (!result.success) {
      toast.error(result.error || "Couldn't save your offering. Try again?");
      return;
    }

    setStepValidationState((prevState) => ({ ...prevState, 1: true }));
    onSuccess();
    toast.success("Saved. Almost done.");
  } catch (error) {
    console.error("Error submitting step 2:", error);
    toast.error("Hmm, something's not right. Give it another shot?");
  } finally {
    setIsLoading(false);
  }
}

async function submitSidekickStep3Action(
  values: step3FormValues,
  currentFaqs: FaqItem[],
  step3Form: { reset: (values: step3FormValues) => void },
  setFaqs: React.Dispatch<React.SetStateAction<FaqItem[]>>,
  setIsLoading: (v: boolean) => void,
  setStepValidationState: React.Dispatch<
    React.SetStateAction<Record<number, boolean>>
  >,
) {
  try {
    setIsLoading(true);

    const isDuplicate = currentFaqs.some(
      (faq) => faq.question.toLowerCase() === values.question.toLowerCase(),
    );

    if (isDuplicate) {
      toast.error("You have already added this question.");
      return;
    }

    const result = await updateSidekickOnboardingData({
      faqs: [{ question: values.question, answer: values.answer }],
    });

    if (!result.success) {
      toast.error(result.error || "Couldn't save your FAQ. Try again?");
      return;
    }

    setFaqs([
      ...currentFaqs,
      { question: values.question, answer: values.answer },
    ]);
    step3Form.reset({ question: "", answer: "" });
    setStepValidationState((prevState) => ({ ...prevState, 2: true }));
    toast.success("FAQ saved successfully!");
  } catch (error) {
    console.error("Error submitting step 3:", error);
    toast.error("Hmm, something's not right. Give it another shot?");
  } finally {
    setIsLoading(false);
  }
}

async function submitSidekickStep4Action(
  values: step4FormValues,
  setIsLoading: (v: boolean) => void,
  setStepValidationState: React.Dispatch<
    React.SetStateAction<Record<number, boolean>>
  >,
  router: { push: (url: string) => void },
) {
  try {
    setIsLoading(true);

    let toneType: "friendly" | "direct" | "like_me" | "custom";
    switch (values.toneType) {
      case "Friendly":
        toneType = "friendly";
        break;
      case "Direct":
        toneType = "direct";
        break;
      case "Like Me":
        toneType = "like_me";
        break;
      case "Custom":
        toneType = "custom";
        break;
      default:
        toneType = "friendly";
    }

    let sampleText: string[] = [];
    if (toneType === "like_me" && values.sampleMessages) {
      sampleText = values.sampleMessages
        .split("\n")
        .filter((line) => line.trim() !== "");
    } else if (toneType === "custom" && values.customTone) {
      sampleText = [values.customTone];
    }

    const result = await updateSidekickOnboardingData({
      toneProfile: {
        toneType,
        sampleText: sampleText.length > 0 ? sampleText : undefined,
      },
    });

    if (!result.success) {
      toast.error(result.error || "Couldn't save your tone. Try again?");
      return;
    }

    const completeResult = await completeSidekickOnboarding();
    if (!completeResult.success) {
      toast.error(completeResult.error || "Couldn't finish setup. Try again?");
      return;
    }

    setStepValidationState((prevState) => ({ ...prevState, 3: true }));
    toast.success("Sidekick is ready.");
    router.push("/");
  } catch (error) {
    console.error("Error submitting step 4:", error);
    toast.error("Hmm, something's not right. Give it another shot?");
  } finally {
    setIsLoading(false);
  }
}

async function deleteFaqAction(
  faqId: string,
  currentFaqs: FaqItem[],
  setFaqs: React.Dispatch<React.SetStateAction<FaqItem[]>>,
  setIsLoading: (v: boolean) => void,
) {
  try {
    setIsLoading(true);
    const result = await deleteFaq(faqId);
    if (result.success) {
      setFaqs(currentFaqs.filter((faq) => faq.id !== faqId));
      toast.success("FAQ deleted!");
    } else {
      toast.error(result.error || "Couldn't delete FAQ. Try again?");
    }
  } catch (error) {
    console.error("Error deleting FAQ:", error);
    toast.error("Hmm, something's not right. Give it another shot?");
  } finally {
    setIsLoading(false);
  }
}

async function deleteOfferAction(
  offerId: string | undefined,
  index: number,
  currentOffers: OfferItem[],
  setOffers: React.Dispatch<React.SetStateAction<OfferItem[]>>,
  setIsLoading: (v: boolean) => void,
) {
  try {
    setIsLoading(true);
    if (offerId) {
      const result = await deleteOffer(offerId);
      if (!result.success) {
        toast.error(result.error || "Couldn't delete offer. Try again?");
        return;
      }
    }
    setOffers(currentOffers.filter((_, i) => i !== index));
    toast.success("Offer deleted successfully!");
  } catch (error) {
    console.error("Error deleting offer:", error);
    toast.error("Hmm, something's not right. Give it another shot?");
  } finally {
    setIsLoading(false);
  }
}

export default function SidekickOnboardingPage() {
  const router = useRouter();
  const [activeStep, setActiveStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [hasStoredMainOffering, setHasStoredMainOffering] = useState(false);
  const [offers, setOffers] = useState<
    Array<{ id?: string; name: string; content: string; value?: number }>
  >([]);
  const [stepValidationState, setStepValidationState] = useState<
    Record<number, boolean>
  >({
    0: false,
    1: false,
    2: false,
    3: false,
  });

  const [faqs, setFaqs] = useState<
    Array<{ id?: string; question: string; answer?: string }>
  >([]);

  const step0Form = useForm<step0FormValues>({
    resolver: zodResolver(step0Schema),
    defaultValues: {
      primaryOfferUrl: "",
      calendarLink: "",
      additionalInfoUrl: "",
    },
  });

  const step1Form = useForm<step1FormValues>({
    resolver: zodResolver(step1Schema),
    defaultValues: {
      offerName: "",
      offerContent: "",
      offerValue: "",
    },
  });

  const step2Form = useForm<step2FormValues>({
    resolver: zodResolver(step2Schema),
    defaultValues: {
      sellDescription: "",
    },
  });

  const step3Form = useForm<step3FormValues>({
    resolver: zodResolver(step3Schema),
    defaultValues: {
      question: "",
      answer: "",
    },
  });

  const step4Form = useForm<step4FormValues>({
    resolver: zodResolver(step4Schema),
    defaultValues: {
      toneType: "",
      customTone: "",
      sampleMessages: "",
    },
  });

  useEffect(() => {
    let isMounted = true;

    async function initializeSidekickOnboarding() {
      setIsInitializing(true);

      const status = await checkSidekickOnboardingStatus().catch((error) => {
        console.error("Error checking sidekick onboarding status:", error);
        return null;
      });

      if (!status) {
        if (isMounted) {
          setIsInitializing(false);
        }
        return;
      }

      if (status.sidekick_onboarding_complete) {
        router.replace("/");
        if (isMounted) {
          setIsInitializing(false);
        }
        return;
      }

      const [
        offerLinksResult,
        offersResult,
        mainOfferingResult,
        faqsResult,
        toneProfileResult,
      ] = await Promise.all([
        getSidekickOfferLinks().catch((error) => {
          console.error("Error fetching offer links:", error);
          return null;
        }),
        getSidekickOffers().catch((error) => {
          console.error("Error fetching offers:", error);
          return null;
        }),
        getSidekickMainOffering().catch((error) => {
          console.error("Error fetching main offering:", error);
          return null;
        }),
        getSidekickFaqs().catch((error) => {
          console.error("Error fetching FAQs:", error);
          return null;
        }),
        getSidekickToneProfile().catch((error) => {
          console.error("Error fetching tone profile:", error);
          return null;
        }),
      ]);

      if (!isMounted) {
        return;
      }

      if (offerLinksResult?.success && offerLinksResult.data) {
        step0Form.setValue(
          "primaryOfferUrl",
          offerLinksResult.data.primaryOfferUrl || "",
        );
        step0Form.setValue(
          "calendarLink",
          offerLinksResult.data.calendarLink || "",
        );
        step0Form.setValue(
          "additionalInfoUrl",
          offerLinksResult.data.additionalInfoUrl || "",
        );
      }

      const initialOffers =
        offersResult?.success && offersResult.data
          ? offersResult.data.map((offer) => ({
              id: offer.id,
              name: offer.name,
              content: offer.content,
              value: offer.value || undefined,
            }))
          : [];
      setOffers(initialOffers);

      const storedMainOffering =
        mainOfferingResult?.success &&
        typeof mainOfferingResult.data === "string"
          ? mainOfferingResult.data
          : null;
      if (storedMainOffering) {
        step2Form.setValue("sellDescription", storedMainOffering);
      }
      setHasStoredMainOffering(!!storedMainOffering);

      const initialFaqs =
        faqsResult?.success && faqsResult.data
          ? faqsResult.data.map((faq) => ({
              id: faq.id,
              question: faq.question,
              answer: faq.answer || undefined,
            }))
          : [];
      setFaqs(initialFaqs);

      if (toneProfileResult?.success && toneProfileResult.data) {
        step4Form.setValue("toneType", toneProfileResult.data.toneType || "");
        step4Form.setValue(
          "customTone",
          toneProfileResult.data.customTone || "",
        );
        step4Form.setValue(
          "sampleMessages",
          toneProfileResult.data.sampleMessages || "",
        );
      }

      setStepValidationState({
        0:
          !!offerLinksResult?.success &&
          !!offerLinksResult.data?.primaryOfferUrl,
        1: initialOffers.length > 0 && !!storedMainOffering,
        2: initialFaqs.length > 0,
        3: !!toneProfileResult?.success && !!toneProfileResult.data?.toneType,
      });
      setIsInitializing(false);
    }

    initializeSidekickOnboarding();

    return () => {
      isMounted = false;
    };
  }, [router, step0Form, step2Form, step4Form]);

  const handleStep0Submit = () =>
    submitSidekickStep0Action(
      step0Form.getValues(),
      setIsLoading,
      setStepValidationState,
      handleNext,
    );

  const handleStep1Submit = (values: step1FormValues) =>
    submitSidekickStep1Action(
      values,
      offers,
      step1Form,
      setOffers,
      setIsLoading,
      setStepValidationState,
    );

  const handleStep2Submit = (values: step2FormValues) =>
    submitSidekickStep2Action(
      values,
      setIsLoading,
      setStepValidationState,
      () => {
        setHasStoredMainOffering(true);
        handleNext();
      },
    );

  const handleStep3Submit = (values: step3FormValues) =>
    submitSidekickStep3Action(
      values,
      faqs,
      step3Form,
      setFaqs,
      setIsLoading,
      setStepValidationState,
    );

  const handleStep4Submit = (values: step4FormValues) =>
    submitSidekickStep4Action(
      values,
      setIsLoading,
      setStepValidationState,
      router,
    );

  const handleDeleteFaq = (faqId: string) =>
    deleteFaqAction(faqId, faqs, setFaqs, setIsLoading);

  const watchedSellDescription = useWatch({
    control: step2Form.control,
    name: "sellDescription",
  });
  const watchedToneType = useWatch({
    control: step4Form.control,
    name: "toneType",
  });

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleNext = () => {
    setActiveStep((prev) => prev + 1);
  };

  const isStepValid = (step: number) => {
    if (step === 1) {
      return offers.length > 0 && hasStoredMainOffering;
    }

    return stepValidationState[step];
  };

  if (isInitializing) {
    return (
      <div className="flex items-center justify-center h-full">
        <p>Loading Sidekick setup...</p>
      </div>
    );
  }

  return (
    <section className="w-full max-w-5xl px-4 py-6 overflow-y-auto">
      <Card className="shadow-md border-border">
        <CardContent className="space-y-6 pt-6">
          <Stepper
            value={activeStep}
            onValueChange={(newStep) => {
              if (newStep < activeStep) {
                setActiveStep(newStep);
                return;
              }

              if (newStep === activeStep + 1) {
                const isValid = isStepValid(activeStep);
                if (isValid) {
                  setActiveStep(newStep);
                }
              }
            }}
            className="px-2 sm:px-6 py-2"
          >
            {sidekickSteps.map((step, index) => (
              <StepperItem
                key={step.id}
                step={step.id}
                disabled={
                  step.id > activeStep + 1 ||
                  (step.id > activeStep && !isStepValid(activeStep))
                }
                completed={activeStep > step.id}
                loading={isLoading && step.id === activeStep}
                className="relative flex-1 !flex-col"
              >
                <StepperTrigger className="flex-col gap-3">
                  <StepperIndicator />
                  <div className="space-y-0.5 px-2">
                    <StepperTitle>{step.name}</StepperTitle>
                  </div>
                </StepperTrigger>
                {index < sidekickSteps.length - 1 && (
                  <StepperSeparator className="absolute inset-x-0 left-[calc(50%+0.75rem+0.750rem)] top-6 -order-1 m-0 -translate-y-1/2 group-data-[orientation=horizontal]/stepper:w-[calc(100%-3rem)] group-data-[orientation=horizontal]/stepper:flex-none" />
                )}
              </StepperItem>
            ))}
          </Stepper>

          <div className="border border-border p-6 rounded-xl shadow-sm">
            {activeStep === 0 && (
              <Form {...step0Form}>
                <form
                  onSubmit={step0Form.handleSubmit(handleStep0Submit)}
                  className="space-y-6"
                >
                  <h2 className="text-xl font-semibold font-heading">
                    Offer Links
                  </h2>

                  <p className="text-muted-foreground">
                    Add links so Sidekick can learn your offer details.
                  </p>

                  <FormField
                    control={step0Form.control}
                    name="primaryOfferUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Main Offer Page (required)</FormLabel>
                        <FormControl>
                          <Input placeholder="https://" {...field} />
                        </FormControl>
                        <FormDescription>
                          The page that explains your main offer.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={step0Form.control}
                    name="calendarLink"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Booking Link (optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="https://" {...field} />
                        </FormControl>
                        <FormDescription>
                          Your booking or calendar link.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={step0Form.control}
                    name="additionalInfoUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Extra Info Link (optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="https://" {...field} />
                        </FormControl>
                        <FormDescription>
                          Notion, website, or other resource with additional
                          information.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <StepButtons showBack={false} isLoading={isLoading} />
                </form>
              </Form>
            )}

            {activeStep === 1 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold font-heading">
                    What You Sell
                  </h2>
                  <p className="text-muted-foreground">
                    Add your offers and explain the main offer so Sidekick can
                    reply with the right details.
                  </p>
                </div>

                {offers.length > 0 && (
                  <div className="border rounded-lg p-4 space-y-3">
                    <h3 className="font-medium">Your Offers</h3>
                    <div className="space-y-2">
                      {offers.map((offer, index) => (
                        <div
                          key={offer.id || index}
                          className="border rounded p-3 flex justify-between items-center"
                        >
                          <div>
                            <p className="font-medium">{offer.name}</p>
                            <p className="text-sm text-muted-foreground truncate max-w-md">
                              {offer.content}
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            {offer.value ? (
                              <p className="font-medium">${offer.value}</p>
                            ) : null}
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="text-destructive hover:text-destructive hover:bg-destructive/10"
                              onClick={() =>
                                deleteOfferAction(
                                  offer.id,
                                  index,
                                  offers,
                                  setOffers,
                                  setIsLoading,
                                )
                              }
                            >
                              Delete
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <Form {...step1Form}>
                  <form
                    onSubmit={step1Form.handleSubmit(handleStep1Submit)}
                    className="space-y-4 rounded-lg border p-4"
                  >
                    <div>
                      <h3 className="font-medium">Add an offer</h3>
                      <p className="text-sm text-muted-foreground">
                        Keep this tight. One offer is enough to continue.
                      </p>
                    </div>

                    <FormField
                      control={step1Form.control}
                      name="offerName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Offer Name</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="e.g., Basic Package"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={step1Form.control}
                      name="offerContent"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Offer Description</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Brief description of what's included"
                              {...field}
                              rows={3}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={step1Form.control}
                      name="offerValue"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Value ($)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="e.g., 997"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex justify-end">
                      <Button type="submit" disabled={isLoading}>
                        {isLoading ? "Adding..." : "Add Offer"}
                      </Button>
                    </div>
                  </form>
                </Form>

                <Form {...step2Form}>
                  <form
                    onSubmit={step2Form.handleSubmit(handleStep2Submit)}
                    className="space-y-6"
                  >
                    <FormField
                      control={step2Form.control}
                      name="sellDescription"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Your Offering</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="e.g., 8-week cohort-based course for SaaS founders on monetization"
                              {...field}
                              rows={4}
                            />
                          </FormControl>
                          <FormDescription>
                            More detail here means better replies later.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex justify-between">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleBack}
                        disabled={isLoading}
                      >
                        Back
                      </Button>
                      <Button
                        type="submit"
                        disabled={
                          isLoading ||
                          offers.length === 0 ||
                          !watchedSellDescription?.trim()
                        }
                      >
                        Next
                      </Button>
                    </div>
                  </form>
                </Form>
              </div>
            )}

            {activeStep === 2 && (
              <div className="space-y-6">
                <div className="mb-4">
                  <h3 className="text-lg font-medium">
                    Questions You Get All The Time
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Add common questions so Sidekick can answer them fast.
                  </p>
                </div>

                {faqs.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Saved FAQs:</h4>
                    <div className="space-y-3">
                      {faqs.map((faq, index) => (
                        <div
                          key={faq.id || index}
                          className="p-3 border rounded-md space-y-2"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{faq.question}</span>
                            {faq.id && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteFaq(faq.id!)}
                                disabled={isLoading}
                              >
                                Remove
                              </Button>
                            )}
                          </div>
                          {faq.answer && (
                            <p className="text-sm">{faq.answer}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <Form {...step3Form}>
                  <form
                    onSubmit={step3Form.handleSubmit(handleStep3Submit)}
                    className="space-y-4"
                  >
                    <FormField
                      control={step3Form.control}
                      name="question"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Question</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="E.g., What platform is this on?"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={step3Form.control}
                      name="answer"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Answer</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Your answer to this question"
                              className="resize-none"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex justify-between">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => handleBack()}
                      >
                        Back
                      </Button>
                      <div className="flex space-x-2">
                        <Button
                          type="submit"
                          disabled={!step3Form.formState.isValid || isLoading}
                        >
                          Add FAQ
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => handleNext()}
                          disabled={isLoading}
                        >
                          Next Step
                        </Button>
                      </div>
                    </div>
                  </form>
                </Form>
              </div>
            )}

            {activeStep === 3 && (
              <Form {...step4Form}>
                <form
                  onSubmit={step4Form.handleSubmit(handleStep4Submit)}
                  className="space-y-6"
                >
                  <h2 className="text-xl font-semibold font-heading">
                    Set Sidekick&apos;s Tone
                  </h2>

                  <p className="text-muted-foreground">
                    Pick how Sidekick should sound in your DMs.
                  </p>

                  <FormField
                    control={step4Form.control}
                    name="toneType"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel>Tone</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            value={field.value}
                            className="grid grid-cols-1 sm:grid-cols-2 gap-3"
                          >
                            {tone_options.map((option) => (
                              <FormItem
                                key={option}
                                className="flex items-center space-x-1 space-y-0"
                              >
                                <FormControl>
                                  <RadioGroupItem
                                    value={option}
                                    id={`tone-${option}`}
                                    className="sr-only"
                                  />
                                </FormControl>
                                <FormLabel
                                  htmlFor={`tone-${option}`}
                                  className={`border rounded-lg p-3 w-full flex items-center gap-2 cursor-pointer transition-all ${
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
                                  ></div>
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

                  {watchedToneType === "Custom" && (
                    <FormField
                      control={step4Form.control}
                      name="customTone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Custom Tone</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Describe how you want Sidekick to sound"
                              {...field}
                              rows={3}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  {watchedToneType === "Like Me" && (
                    <FormField
                      control={step4Form.control}
                      name="sampleMessages"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Sample Messages</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Paste 3-5 example messages that show your tone."
                              {...field}
                              rows={5}
                            />
                          </FormControl>
                          <FormDescription>
                            Paste a few messages that demonstrate your typical
                            communication style. Separate with new lines.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  <StepButtons
                    onBack={handleBack}
                    submitLabel="Finish Setup"
                    isLoading={isLoading}
                  />
                </form>
              </Form>
            )}
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
