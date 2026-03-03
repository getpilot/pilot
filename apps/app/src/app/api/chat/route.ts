import {
  streamText,
  convertToModelMessages,
  smoothStream,
  stepCountIs,
  tool,
  UIMessage,
} from "ai";
import { geminiModel } from "@pilot/core/ai/model";
import { z } from "zod";
import { DEFAULT_SIDEKICK_PROMPT } from "@pilot/core/sidekick/personalization";
import {
  getUserProfile,
  updateUserProfile,
} from "@/actions/sidekick/ai-tools/user-profile";
import {
  listUserOffers,
  createUserOffer,
  updateUserOffer,
  deleteUserOffer,
  listUserOfferLinks,
  addUserOfferLink,
} from "@/actions/sidekick/ai-tools/offers";
import {
  getToneProfile,
  updateToneProfile,
  addToneSample,
} from "@/actions/sidekick/ai-tools/tone-profile";
import {
  listFaqs,
  addFaq,
  updateFaq,
  deleteFaq,
} from "@/actions/sidekick/ai-tools/faqs";
import {
  getSidekickSettings,
  updateSystemPrompt,
} from "@/actions/sidekick/settings";
import {
  getActionLog,
  listActionLogs,
} from "@/actions/sidekick/ai-tools/actions";
import {
  listContacts,
  getContact,
  updateContact,
  addContactTag,
  removeContactTag,
  getContactTags,
  searchContacts,
} from "@/actions/sidekick/ai-tools/contacts";
import { loadChatSession } from "@/lib/chat-store";
import { getUser } from "@/lib/auth-utils";
import { BillingLimitError, assertBillingAllowed } from "@/lib/billing/enforce";
import { recordSidekickChatPromptUsage } from "@/lib/billing/usage";

export const maxDuration = 40;

export async function POST(req: Request) {
  const { message, id } = await req.json();
  const user = await getUser();

  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await assertBillingAllowed(user.id, "sidekick:chat");
  } catch (error) {
    if (error instanceof BillingLimitError) {
      return Response.json(
        {
          code: error.code,
          error: error.message,
        },
        { status: 403 },
      );
    }

    throw error;
  }

  await recordSidekickChatPromptUsage(user.id, id);
  console.log("Chat API called with:", {
    messageId: message.id,
    sessionId: id,
  });

  let previousMessages: UIMessage[] = [];
  if (id) {
    try {
      previousMessages = await loadChatSession(id);
      console.log(
        `Loaded ${previousMessages.length} previous messages for session ${id}`,
      );
    } catch {
      console.log("Session not found, starting with empty messages");
      previousMessages = [];
    }
  }

  const messages = [...previousMessages, message];
  console.log(`Processing ${messages.length} total messages`);

  const system = `${DEFAULT_SIDEKICK_PROMPT} If a request is unrelated to Sidekick or this app, briefly refuse and mention supported Sidekick tasks.`;

  const tools = {
    // user profile tools
    getUserProfile: tool({
      description:
        "Get the user's profile information including name, email, gender, use case, business type, and main offering",
      inputSchema: z.object({}),
      async execute() {
        return await getUserProfile();
      },
    }),
    updateUserProfile: tool({
      description: "Update the user's profile information",
      inputSchema: z.object({
        name: z.string().optional(),
        gender: z.string().optional(),
        use_case: z.array(z.string()).optional(),
        business_type: z.string().optional(),
        main_offering: z.string().optional(),
      }),
      async execute(fields) {
        return await updateUserProfile(fields);
      },
    }),

    // offers tools
    listUserOffers: tool({
      description: "List all user offers",
      inputSchema: z.object({}),
      async execute() {
        return await listUserOffers();
      },
    }),
    createUserOffer: tool({
      description: "Create a new user offer",
      inputSchema: z.object({
        name: z.string().describe("The name of the offer"),
        content: z.string().describe("The content/description of the offer"),
        value: z.number().optional().describe("The value/price of the offer"),
      }),
      async execute({ name, content, value }) {
        return await createUserOffer(name, content, value);
      },
    }),
    updateUserOffer: tool({
      description: "Update an existing user offer",
      inputSchema: z.object({
        offerId: z.string().describe("The ID of the offer to update"),
        name: z.string().optional(),
        content: z.string().optional(),
        value: z.number().optional(),
      }),
      async execute({ offerId, ...fields }) {
        return await updateUserOffer(offerId, fields);
      },
    }),
    deleteUserOffer: tool({
      description: "Delete a user offer",
      inputSchema: z.object({
        offerId: z.string().describe("The ID of the offer to delete"),
      }),
      async execute({ offerId }) {
        return await deleteUserOffer(offerId);
      },
    }),
    listUserOfferLinks: tool({
      description: "List all user offer links",
      inputSchema: z.object({}),
      async execute() {
        return await listUserOfferLinks();
      },
    }),
    addUserOfferLink: tool({
      description: "Add a new user offer link",
      inputSchema: z.object({
        type: z
          .enum(["primary", "calendar", "notion", "website"])
          .describe("The type of link"),
        url: z.string().describe("The URL of the link"),
      }),
      async execute({ type, url }) {
        return await addUserOfferLink(type, url);
      },
    }),

    // tone & training tools
    getToneProfile: tool({
      description:
        "Get the user's tone profile including tone type, sample text, and files",
      inputSchema: z.object({}),
      async execute() {
        return await getToneProfile();
      },
    }),
    updateToneProfile: tool({
      description: "Update the user's tone profile",
      inputSchema: z.object({
        toneType: z
          .enum(["friendly", "direct", "like_me", "custom"])
          .optional(),
        sampleText: z.array(z.string()).optional(),
        sampleFiles: z.array(z.string()).optional(),
        trainedEmbeddingId: z.string().optional(),
      }),
      async execute(fields) {
        return await updateToneProfile(fields);
      },
    }),
    addToneSample: tool({
      description: "Add a sample text to the user's tone profile",
      inputSchema: z.object({
        text: z.string().describe("The sample text to add"),
      }),
      async execute({ text }) {
        return await addToneSample(text);
      },
    }),

    // faqs tools
    listFaqs: tool({
      description: "List all user FAQs",
      inputSchema: z.object({}),
      async execute() {
        return await listFaqs();
      },
    }),
    addFaq: tool({
      description: "Add a new FAQ",
      inputSchema: z.object({
        question: z.string().describe("The FAQ question"),
        answer: z.string().optional().describe("The FAQ answer"),
      }),
      async execute({ question, answer }) {
        return await addFaq(question, answer);
      },
    }),
    updateFaq: tool({
      description: "Update an existing FAQ",
      inputSchema: z.object({
        faqId: z.string().describe("The ID of the FAQ to update"),
        question: z.string().optional(),
        answer: z.string().optional(),
      }),
      async execute({ faqId, ...fields }) {
        return await updateFaq(faqId, fields);
      },
    }),
    deleteFaq: tool({
      description: "Delete an FAQ",
      inputSchema: z.object({
        faqId: z.string().describe("The ID of the FAQ to delete"),
      }),
      async execute({ faqId }) {
        return await deleteFaq(faqId);
      },
    }),

    // sidekick settings tools
    getSidekickSettings: tool({
      description: "Get the user's sidekick settings including system prompt",
      inputSchema: z.object({}),
      async execute() {
        return await getSidekickSettings();
      },
    }),
    updateSidekickSettings: tool({
      description: "Update the user's sidekick settings",
      inputSchema: z.object({
        systemPrompt: z.string().describe("The new system prompt"),
      }),
      async execute({ systemPrompt }) {
        return await updateSystemPrompt(systemPrompt);
      },
    }),

    // action logs tools
    listActionLogs: tool({
      description: "List recent action logs for the user",
      inputSchema: z.object({
        limit: z
          .number()
          .optional()
          .default(20)
          .describe("Number of logs to return"),
      }),
      async execute({ limit }) {
        return await listActionLogs(limit);
      },
    }),
    getActionLog: tool({
      description: "Get a specific action log by ID",
      inputSchema: z.object({
        actionId: z.string().describe("The ID of the action log"),
      }),
      async execute({ actionId }) {
        return await getActionLog(actionId);
      },
    }),

    // contacts tools
    listContacts: tool({
      description: "List all contacts with filtering and sorting options",
      inputSchema: z.object({
        stage: z.enum(["new", "lead", "follow-up", "ghosted"]).optional(),
        sentiment: z
          .enum(["hot", "warm", "cold", "ghosted", "neutral"])
          .optional(),
        limit: z.number().optional().default(50),
        sortBy: z
          .enum(["createdAt", "lastMessageAt", "leadScore"])
          .optional()
          .default("createdAt"),
      }),
      async execute({ stage, sentiment, limit, sortBy }) {
        return await listContacts(stage, sentiment, limit, sortBy);
      },
    }),
    getContact: tool({
      description: "Get a specific contact by ID",
      inputSchema: z.object({
        contactId: z.string().describe("The ID of the contact"),
      }),
      async execute({ contactId }) {
        return await getContact(contactId);
      },
    }),
    updateContact: tool({
      description: "Update contact information",
      inputSchema: z.object({
        contactId: z.string().describe("The ID of the contact to update"),
        stage: z.enum(["new", "lead", "follow-up", "ghosted"]).optional(),
        sentiment: z
          .enum(["hot", "warm", "cold", "ghosted", "neutral"])
          .optional(),
        leadScore: z.number().optional(),
        nextAction: z.string().optional(),
        leadValue: z.number().optional(),
        notes: z.string().optional(),
      }),
      async execute({ contactId, ...fields }) {
        return await updateContact(contactId, fields);
      },
    }),
    addContactTag: tool({
      description: "Add a tag to a contact",
      inputSchema: z.object({
        contactId: z.string().describe("The ID of the contact"),
        tag: z.string().describe("The tag to add"),
      }),
      async execute({ contactId, tag }) {
        return await addContactTag(contactId, tag);
      },
    }),
    removeContactTag: tool({
      description: "Remove a tag from a contact",
      inputSchema: z.object({
        contactId: z.string().describe("The ID of the contact"),
        tag: z.string().describe("The tag to remove"),
      }),
      async execute({ contactId, tag }) {
        return await removeContactTag(contactId, tag);
      },
    }),
    getContactTags: tool({
      description: "Get all tags for a contact",
      inputSchema: z.object({
        contactId: z.string().describe("The ID of the contact"),
      }),
      async execute({ contactId }) {
        return await getContactTags(contactId);
      },
    }),
    searchContacts: tool({
      description: "Search contacts by username or notes",
      inputSchema: z.object({
        query: z.string().describe("Search query"),
        limit: z.number().optional().default(20),
      }),
      async execute({ query, limit }) {
        return await searchContacts(query, limit);
      },
    }),
  };

  const result = streamText({
    model: geminiModel,
    messages: convertToModelMessages(messages),
    system,
    tools,
    stopWhen: stepCountIs(5),
    experimental_transform: smoothStream({
      delayInMs: 20,
      chunking: "word",
    }),
  });

  return result.toUIMessageStreamResponse({
    originalMessages: messages,
    onFinish: async ({ messages }) => {
      if (!id) {
        return;
      }

      try {
        const { saveChatSession } = await import("@/lib/chat-store");
        await saveChatSession({ sessionId: id, messages });
        console.log(`Saved ${messages.length} messages to session ${id}`);
      } catch (error) {
        console.error("Failed to save chat session:", error);
      }
    },
  });
}
