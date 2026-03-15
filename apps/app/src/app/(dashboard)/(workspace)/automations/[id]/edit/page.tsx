"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  getAutomation,
  updateAutomation,
  deleteAutomation,
} from "@/actions/automations";
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
import { CalendarIcon, ArrowLeft, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@pilot/ui/lib/utils";
import { toast } from "sonner";
import type { Automation } from "@/actions/automations";
import { getAutomationPostId } from "@/actions/automations";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@pilot/ui/components/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@pilot/ui/components/select";
import {
  getInstagramPostById,
  getRecentInstagramPosts,
} from "@/actions/instagram";
import { PostPicker } from "@/components/automations/post-picker";
import { GenericTemplateBuilder } from "@/components/automations/generic-template-builder";
import { DEFAULT_PUBLIC_COMMENT_REPLY } from "@pilot/core/automation/constants";

type EditAutomationFormData = {
  title: string;
  description: string;
  triggerWord: string;
  responseType: "fixed" | "ai_prompt" | "generic_template";
  responseContent: string;
  isActive: boolean;
  hasExpiration: boolean;
  expiresAt: Date | undefined;
  triggerScope: "dm" | "comment" | "both";
  postId: string;
  commentReplyText: string;
};

async function loadAutomationData(
  automationId: string,
  router: { push: (url: string) => void },
  setAutomation: (data: Automation | null) => void,
  setFormData: (
    val:
      | EditAutomationFormData
      | ((prev: EditAutomationFormData) => EditAutomationFormData),
  ) => void,
  setIsLoading: (v: boolean) => void,
  setRecentPosts: (
    posts: Array<{
      id: string;
      caption?: string;
      media_url?: string;
      media_type?: string;
      thumbnail_url?: string;
    }>,
  ) => void,
  setSelectedPost: (
    post: {
      id: string;
      caption?: string;
      media_url?: string;
      media_type?: string;
      thumbnail_url?: string;
    } | null,
  ) => void,
) {
  try {
    const data = await getAutomation(automationId);
    if (!data) {
      toast.error("Automation not found");
      router.push("/automations");
      return;
    }

    setAutomation(data);
    setFormData({
      title: data.title,
      description: data.description || "",
      triggerWord: data.triggerWord,
      responseType: data.responseType as
        | "fixed"
        | "ai_prompt"
        | "generic_template",
      responseContent: data.responseContent,
      isActive: data.isActive || false,
      hasExpiration: !!data.expiresAt,
      expiresAt: data.expiresAt ? new Date(data.expiresAt) : undefined,
      triggerScope: (data as Automation).triggerScope || "dm",
      postId: "",
      commentReplyText:
        typeof data.commentReplyText === "string" && data.commentReplyText
          ? data.commentReplyText
          : DEFAULT_PUBLIC_COMMENT_REPLY,
    });
    try {
      const existingPostId = await getAutomationPostId(automationId);
      if (existingPostId) {
        setFormData((prev) => ({ ...prev, postId: existingPostId }));
        const [posts, selectedPost] = await Promise.all([
          getRecentInstagramPosts(12).catch(() => []),
          getInstagramPostById(existingPostId).catch(() => null),
        ]);
        setRecentPosts(posts);
        setSelectedPost(selectedPost);
      } else {
        const posts = await getRecentInstagramPosts(12).catch(() => []);
        setRecentPosts(posts);
        setSelectedPost(null);
      }
    } catch {
      const posts = await getRecentInstagramPosts(12).catch(() => []);
      setRecentPosts(posts);
      setSelectedPost(null);
    }
  } catch {
    toast.error("Couldn't load automation. Try again?");
    router.push("/automations");
  } finally {
    setIsLoading(false);
  }
}

async function handleSubmitAction(
  automationId: string,
  formData: EditAutomationFormData,
  setIsSubmitting: (v: boolean) => void,
  router: { push: (url: string) => void },
) {
  setIsSubmitting(true);
  try {
    await updateAutomation(automationId, {
      title: formData.title,
      description: formData.description || undefined,
      triggerWord: formData.triggerWord,
      responseType: formData.responseType,
      responseContent: formData.responseContent,
      isActive: formData.isActive,
      expiresAt: formData.hasExpiration ? formData.expiresAt : undefined,
      triggerScope: formData.triggerScope,
      postId:
        formData.triggerScope === "dm" ? undefined : formData.postId.trim(),
      commentReplyText:
        formData.triggerScope === "dm"
          ? undefined
          : formData.commentReplyText || DEFAULT_PUBLIC_COMMENT_REPLY,
    });

    toast.success("Automation updated! Your changes are live.");
    router.push("/automations");
  } catch (error) {
    toast.error(
      error instanceof Error ? error.message : "Failed to update automation",
    );
  } finally {
    setIsSubmitting(false);
  }
}

async function handleDeleteAction(
  automationId: string,
  setIsDeleting: (v: boolean) => void,
  router: { push: (url: string) => void },
) {
  setIsDeleting(true);
  try {
    await deleteAutomation(automationId);
    toast.success("Automation deleted! It's gone for good.");
    router.push("/automations");
  } catch (error) {
    toast.error(
      error instanceof Error ? error.message : "Failed to delete automation",
    );
  } finally {
    setIsDeleting(false);
  }
}

export default function EditAutomationPage() {
  const router = useRouter();
  const params = useParams();
  const automationId = params.id as string;

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [automation, setAutomation] = useState<Automation | null>(null);
  const [recentPosts, setRecentPosts] = useState<
    Array<{
      id: string;
      caption?: string;
      media_url?: string;
      media_type?: string;
      thumbnail_url?: string;
    }>
  >([]);
  const [selectedPost, setSelectedPost] = useState<{
    id: string;
    caption?: string;
    media_url?: string;
    media_type?: string;
    thumbnail_url?: string;
  } | null>(null);

  const [formData, setFormData] = useState<EditAutomationFormData>({
    title: "",
    description: "",
    triggerWord: "",
    responseType: "fixed" as "fixed" | "ai_prompt" | "generic_template",
    responseContent: "",
    isActive: true,
    hasExpiration: false,
    expiresAt: undefined as Date | undefined,
    triggerScope: "dm" as "dm" | "comment" | "both",
    postId: "",
    commentReplyText: DEFAULT_PUBLIC_COMMENT_REPLY,
  });

  useEffect(() => {
    loadAutomationData(
      automationId,
      router,
      setAutomation,
      setFormData,
      setIsLoading,
      setRecentPosts,
      setSelectedPost,
    );
  }, [automationId, router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSubmitAction(automationId, formData, setIsSubmitting, router);
  };

  const handleDelete = () =>
    handleDeleteAction(automationId, setIsDeleting, router);

  const handleInputChange = <K extends keyof EditAutomationFormData>(
    field: K,
    value: EditAutomationFormData[K],
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div>Loading your automation...</div>
      </div>
    );
  }

  if (!automation) {
    return (
      <div className="flex items-center justify-center py-12">
        <div>Automation not found</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div>
            <h1 className="text-3xl font-bold font-heading">Edit Automation</h1>
            <p className="text-muted-foreground">
              Update your automation settings
            </p>
          </div>
        </div>
        <div className="flex flex-row gap-4 mt-auto">
          <Button onClick={() => router.back()} className="ml-auto mt-auto">
            <ArrowLeft className="size-4" />
            Back
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" disabled={isDeleting}>
                <Trash2 className="size-4" />
                {isDeleting ? "Deleting..." : "Delete"}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete automation?</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete this automation? This action
                  cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete}>
                  Confirm
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Basics</CardTitle>
            <CardDescription>
              Keep the name clear so it is easy to find.
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
            <CardTitle>Trigger</CardTitle>
            <CardDescription>
              Set the trigger word and scope that will activate this automation.
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
                placeholder="e.g., hello, price, help"
                required
              />
              <p className="text-sm text-muted-foreground">
                This runs when a message includes this word.
              </p>
            </div>

            <div className="space-y-2">
              <Label>Trigger Scope</Label>
              <Select
                value={formData.triggerScope}
                onValueChange={(v) =>
                  handleInputChange(
                    "triggerScope",
                    v as "dm" | "comment" | "both",
                  )
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select scope" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dm">DM only</SelectItem>
                  <SelectItem value="comment">Comments only</SelectItem>
                  <SelectItem value="both">Both</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                Choose where this applies. Comments can also use private
                replies.
              </p>
            </div>

            {formData.triggerScope !== "dm" && (
              <PostPicker
                value={formData.postId}
                onChange={(v) => handleInputChange("postId", v)}
                posts={recentPosts}
                selectedPost={selectedPost}
              />
            )}

            {formData.triggerScope !== "dm" && (
              <div className="space-y-2">
                <Label htmlFor="commentReplyText">
                  Public Reply Text (optional)
                </Label>
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
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Reply Method</CardTitle>
            <CardDescription>Choose how replies are generated.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <RadioGroup
              value={formData.responseType}
              onValueChange={(value) =>
                handleInputChange(
                  "responseType",
                  value as "fixed" | "ai_prompt" | "generic_template",
                )
              }
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="fixed" id="fixed" />
                <Label htmlFor="fixed">Fixed Message</Label>
              </div>
              <p className="text-sm text-muted-foreground ml-6">
                Send the same reply every time.
              </p>

              <div className="flex items-center space-x-2">
                <RadioGroupItem value="ai_prompt" id="ai_prompt" />
                <Label htmlFor="ai_prompt">AI Prompt</Label>
              </div>
              <p className="text-sm text-muted-foreground ml-6">
                AI writes a reply based on your instructions.
              </p>

              <div className="flex items-center space-x-2">
                <RadioGroupItem
                  value="generic_template"
                  id="generic_template"
                />
                <Label htmlFor="generic_template">
                  Generic Template (Comments)
                </Label>
              </div>
              <p className="text-sm text-muted-foreground ml-6">
                Build image-and-button replies for comment flows.
              </p>
            </RadioGroup>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Reply Content</CardTitle>
            <CardDescription>
              {formData.responseType === "fixed"
                ? "Write the exact message."
                : formData.responseType === "ai_prompt"
                  ? "Write the instructions for AI replies."
                  : "Build your rich template for comment replies."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="responseContent">
                {formData.responseType === "fixed"
                  ? "Message"
                  : formData.responseType === "ai_prompt"
                    ? "AI Prompt"
                    : "Generic Template Elements"}{" "}
                *
              </Label>
              {formData.responseType === "generic_template" ? (
                <GenericTemplateBuilder
                  value={formData.responseContent}
                  onChange={(next) =>
                    handleInputChange("responseContent", next)
                  }
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
                      ? "Thanks for your interest! How can I help you today?"
                      : "Help the user find their ideal gym routine. Ask about their fitness goals, experience level, and available time."
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
            <CardTitle>Status And Expiration</CardTitle>
            <CardDescription>
              Turn this on or off, and set an optional end date.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) =>
                  handleInputChange("isActive", checked === true)
                }
              />
              <Label htmlFor="isActive">Automation is active</Label>
            </div>

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
                        !formData.expiresAt && "text-muted-foreground",
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
          {isSubmitting ? "Saving..." : "Save Changes"}
        </Button>
      </form>
    </div>
  );
}
