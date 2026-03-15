"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createAutomation } from "@/actions/automations";
import { Button } from "@pilot/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@pilot/ui/components/card";
import { Input } from "@pilot/ui/components/input";
import { Label } from "@pilot/ui/components/label";
import { Textarea } from "@pilot/ui/components/textarea";
import { RadioGroup, RadioGroupItem } from "@pilot/ui/components/radio-group";
import { Checkbox } from "@pilot/ui/components/checkbox";
import { Calendar } from "@pilot/ui/components/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@pilot/ui/components/popover";
import { CalendarIcon, ArrowLeft } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@pilot/ui/lib/utils";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@pilot/ui/components/select";
import { getRecentInstagramPosts } from "@/actions/instagram";
import { DEFAULT_PUBLIC_COMMENT_REPLY } from "@pilot/core/automation/constants";
import { PostPicker } from "@/components/automations/post-picker";
import { GenericTemplateBuilder } from "@/components/automations/generic-template-builder";

type NewAutomationFormData = {
  title: string;
  description: string;
  triggerWord: string;
  responseType: "fixed" | "ai_prompt" | "generic_template";
  responseContent: string;
  hasExpiration: boolean;
  expiresAt: Date | undefined;
  triggerScope: "dm" | "comment" | "both";
  postId: string;
  commentReplyText: string;
  hrnEnforced: boolean;
};

async function handleSubmitAction(
  formData: NewAutomationFormData,
  setIsSubmitting: (v: boolean) => void,
  router: { push: (url: string) => void }
) {
  setIsSubmitting(true);
  try {
    await createAutomation({
      title: formData.title,
      description: formData.description || undefined,
      triggerWord: formData.triggerWord,
      responseType: formData.responseType,
      responseContent: formData.responseContent,
      expiresAt: formData.hasExpiration ? formData.expiresAt : undefined,
      triggerScope: formData.triggerScope,
      postId:
        formData.triggerScope === "dm" ? undefined : formData.postId.trim(),
      commentReplyText:
        formData.triggerScope === "dm"
          ? undefined
          : (formData.commentReplyText || DEFAULT_PUBLIC_COMMENT_REPLY),
      hrnEnforced: formData.hrnEnforced,
    });

    toast.success("Automation created! It's ready to work for you.");
    router.push("/automations");
  } catch (error) {
    toast.error(
      error instanceof Error ? error.message : "Failed to create automation"
    );
  } finally {
    setIsSubmitting(false);
  }
}

export default function NewAutomationPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [recentPosts, setRecentPosts] = useState<Array<{ id: string; caption?: string; media_url?: string; media_type?: string; thumbnail_url?: string }>>([]);
  const [formData, setFormData] = useState<NewAutomationFormData>({
    title: "",
    description: "",
    triggerWord: "",
    responseType: "fixed",
    responseContent: "",
    hasExpiration: false,
    expiresAt: undefined,
    triggerScope: "dm",
    postId: "",
    commentReplyText: DEFAULT_PUBLIC_COMMENT_REPLY,
    hrnEnforced: false,
  });

  useEffect(() => {
    (async () => {
      try {
        const posts = await getRecentInstagramPosts(12);
        setRecentPosts(posts);
      } catch {
        // ignore if not connected
      }
    })();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSubmitAction(formData, setIsSubmitting, router);
  };

  const handleInputChange = <K extends keyof NewAutomationFormData>(
    field: K,
    value: NewAutomationFormData[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center space-x-4">
        <div>
          <h1 className="text-3xl font-bold font-heading">New Automation</h1>
          <p className="text-muted-foreground">
            Set up when this runs and what it says.
          </p>
        </div>
        <Button onClick={() => router.back()} className="ml-auto mt-auto">
          <ArrowLeft className="size-4" />
          Back
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Basics</CardTitle>
            <CardDescription>
              Give this automation a clear name.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                placeholder="e.g., Pricing replies"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  handleInputChange("description", e.target.value)
                }
                placeholder="What this automation is for"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>When Should This Fire?</CardTitle>
            <CardDescription>
              Choose the trigger and where it should run.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="triggerWord">Trigger Word *</Label>
              <Input
                id="triggerWord"
                value={formData.triggerWord}
                onChange={(e) =>
                  handleInputChange("triggerWord", e.target.value.toLowerCase())
                }
                placeholder="e.g., price, help, interested"
                required
              />
              <p className="text-sm text-muted-foreground">
                This runs when a message includes this word.
              </p>
            </div>

            <div className="space-y-2">
              <Label>Where Should This Work?</Label>
              <Select
                value={formData.triggerScope}
                onValueChange={(v) =>
                  handleInputChange("triggerScope", v as "dm" | "comment" | "both")
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Pick where this should work" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dm">DMs only</SelectItem>
                  <SelectItem value="comment">Comments only</SelectItem>
                  <SelectItem value="both">Both DMs and comments</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                DMs send direct replies. Comment triggers can also send private replies.
              </p>
            </div>

            {formData.triggerScope !== "dm" && (
              <PostPicker
                value={formData.postId}
                onChange={(v) => handleInputChange("postId", v)}
                posts={recentPosts}
              />
            )}

            {formData.triggerScope !== "dm" && (
              <div className="space-y-2">
                <Label htmlFor="commentReplyText">Public Reply Text (optional)</Label>
                <Input
                  id="commentReplyText"
                  value={formData.commentReplyText}
                  onChange={(e) =>
                    handleInputChange("commentReplyText", e.target.value)
                  }
                  placeholder=""
                />
                <p className="text-sm text-muted-foreground">
                  If filled, this also posts as a public comment reply.
                </p>
              </div>
            )}
            <div className="flex items-start gap-3 rounded-md border p-3">
              <Checkbox
                id="hrnEnforced"
                checked={formData.hrnEnforced}
                onCheckedChange={(checked) =>
                  handleInputChange("hrnEnforced", checked === true)
                }
              />
              <div className="space-y-1">
                <Label htmlFor="hrnEnforced">Pause auto-replies and route to a human</Label>
                <p className="text-sm text-muted-foreground">
                  Use this for sensitive topics like refunds, legal issues, or VIP requests.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>How Should It Respond?</CardTitle>
            <CardDescription>
              Choose how replies are generated.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <RadioGroup
              value={formData.responseType}
              onValueChange={(value) =>
                handleInputChange(
                  "responseType",
                  value as "fixed" | "ai_prompt" | "generic_template"
                )
              }
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="fixed" id="fixed" />
                <Label htmlFor="fixed">Same Message Every Time</Label>
              </div>
              <p className="text-sm text-muted-foreground ml-6">
                Best for simple, consistent replies.
              </p>

              <div className="flex items-center space-x-2">
                <RadioGroupItem value="ai_prompt" id="ai_prompt" />
                <Label htmlFor="ai_prompt">AI-Generated Response</Label>
              </div>
              <p className="text-sm text-muted-foreground ml-6">
                AI writes a reply based on your instructions.
              </p>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="generic_template" id="generic_template" />
                <Label htmlFor="generic_template">Rich Template (Comments Only)</Label>
              </div>
              <p className="text-sm text-muted-foreground ml-6">
                Build image-and-button replies for comment flows.
              </p>
            </RadioGroup>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>What Should It Say?</CardTitle>
            <CardDescription>
              {formData.responseType === "fixed"
                ? "Write the exact message to send every time"
                : formData.responseType === "ai_prompt"
                  ? "Tell the AI what kind of response you want"
                  : "Build your rich template with images and buttons (comments only)"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="responseContent">
                {formData.responseType === "fixed"
                  ? "Your Message"
                  : formData.responseType === "ai_prompt"
                    ? "AI Instructions"
                    : "Template Builder"} *
              </Label>
              {formData.responseType === "generic_template" ? (
                <GenericTemplateBuilder
                  value={formData.responseContent}
                  onChange={(next) => handleInputChange("responseContent", next)}
                />
              ) : (
                <Textarea
                  id="responseContent"
                  value={formData.responseContent}
                  onChange={(e) =>
                    handleInputChange("responseContent", e.target.value)
                  }
                  placeholder={
                    formData.responseType === "fixed"
                      ? "Hey! Thanks for reaching out. What can I help you with?"
                      : "Help them find the perfect solution. Ask about their goals, budget, and timeline."
                  }
                  rows={4}
                  required
                />
              )}
              {formData.responseType === "ai_prompt" && (
                <p className="text-sm text-muted-foreground">
                  The AI uses these instructions plus the incoming message.
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Expiration (Optional)</CardTitle>
            <CardDescription>
              Set when this automation should automatically disable
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="hasExpiration"
                checked={formData.hasExpiration}
                onCheckedChange={(checked) =>
                  handleInputChange("hasExpiration", checked === true)
                }
              />
              <Label htmlFor="hasExpiration">Set expiration date</Label>
            </div>

            {formData.hasExpiration && (
              <div className="space-y-2">
                <Label>Expiration Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !formData.expiresAt && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="size-4" />
                      {formData.expiresAt
                        ? format(formData.expiresAt, "PPP")
                        : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={formData.expiresAt}
                      onSelect={(date) => handleInputChange("expiresAt", date)}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            )}
          </CardContent>
        </Card>

        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? "Creating..." : "Create Automation"}
        </Button>
      </form>
    </div>
  );
}
