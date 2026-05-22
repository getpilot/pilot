import { getInstagramIntegration } from "@/actions/instagram";
import { fetchContacts } from "@/actions/contacts";
import ContactsTable from "@/components/contacts/contacts-table";
import { LockKeyhole } from "lucide-react";

export const dynamic = "force-dynamic";

function InstagramLockedContacts() {
  return (
    <div className="rounded-lg border bg-muted/30 p-8 text-center">
      <LockKeyhole
        className="mx-auto mb-3 size-8 text-muted-foreground"
        aria-hidden="true"
      />
      <h2 className="text-balance text-lg font-semibold">
        Contacts are locked
      </h2>
      <p className="mx-auto mt-2 max-w-2xl text-pretty text-sm text-muted-foreground">
        Once Instagram is connected, Pilot can safely fetch synced contacts,
        notes, tags, and follow-up state.
      </p>
    </div>
  );
}

export default async function ContactsPage() {
  const instagram = await getInstagramIntegration();

  let contacts = null;
  let hasError = false;

  if (instagram.connected) {
    try {
      contacts = await fetchContacts();
    } catch (error) {
      console.error("Error in ContactsPage:", error);
      hasError = true;
    }
  }

  if (hasError) {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold font-heading tracking-tight">
            Contacts
          </h1>
          <p className="text-destructive">
            Failed to load contacts. Please try again later.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold font-heading tracking-tight">
          Contacts
        </h1>
        <p className="text-pretty text-muted-foreground">
          Keep your leads, notes, tags, and follow-ups in one view.
        </p>
      </div>

      {instagram.connected ? (
        <ContactsTable contacts={contacts!} />
      ) : (
        <InstagramLockedContacts />
      )}
    </div>
  );
}
