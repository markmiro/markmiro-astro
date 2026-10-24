import { ClerkProvider, useAuth, useClerk, useUser } from "@clerk/react";
import { useConvexAuth, useMutation, useQuery } from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import type { FunctionReturnType } from "convex/server";
import { ConvexError } from "convex/values";
import { formatDistanceToNow } from "date-fns";
import { useState, type ReactNode, type SubmitEvent } from "react";
import { api } from "@/convex/_generated/api";
import { useConvexClient } from "@/lib/convex";

type Props = { slug: string; postTitle: string };

/**
 * Loaded with `client:visible`, so Clerk and Convex only load once the reader
 * scrolls down here. Nothing above the comments depends on auth.
 */
export default function Comments({ slug, postTitle }: Props) {
  const client = useConvexClient();
  if (!client) return <Section />;
  return (
    <ClerkProvider
      publishableKey={import.meta.env.PUBLIC_CLERK_PUBLISHABLE_KEY}
    >
      <ConvexProviderWithClerk client={client} useAuth={useAuth}>
        <LiveComments slug={slug} postTitle={postTitle} />
      </ConvexProviderWithClerk>
    </ClerkProvider>
  );
}

function Section({ count, children }: { count?: number; children?: ReactNode }) {
  return (
    <section aria-labelledby="comments-heading" className="min-h-40">
      <h2 id="comments-heading" className="mb-4 text-lg font-bold">
        Comments
        {!!count && " "}
        {!!count && (
          <span className="ml-2 font-normal text-gray-400 dark:text-gray-500">
            {count}
          </span>
        )}
      </h2>
      {children}
    </section>
  );
}

function LiveComments({ slug, postTitle }: Props) {
  const comments = useQuery(api.comments.list, { slug });
  const published = comments?.filter(
    (c) => c.status === "approved" || c.status === "collapsed",
  );

  return (
    <Section count={published?.length}>
      {comments && comments.length === 0 && (
        <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
          No comments yet.
        </p>
      )}
      {comments && comments.length > 0 && (
        <ul className="mb-8 space-y-6">
          {comments.map((comment) => (
            <Comment key={comment._id} comment={comment} />
          ))}
        </ul>
      )}
      <CommentForm slug={slug} postTitle={postTitle} />
    </Section>
  );
}

type CommentData = FunctionReturnType<typeof api.comments.list>[number];

const OWN_STATUS: Partial<Record<CommentData["status"], string>> = {
  pending: "Checking…",
  held: "Awaiting review. Only you can see this.",
  rejected: "Not published. Only you can see this.",
};

function Comment({ comment }: { comment: CommentData }) {
  const remove = useMutation(api.comments.remove);
  const body = (
    <p className="mt-1 whitespace-pre-wrap break-words text-sm">
      {comment.body}
    </p>
  );
  const ownStatus = comment.isOwn ? OWN_STATUS[comment.status] : undefined;

  return (
    <li className={`flex gap-3 ${ownStatus ? "opacity-60" : ""}`}>
      <Avatar name={comment.authorName} image={comment.authorImage} />
      <div className="min-w-0 flex-1">
        <div className="text-sm">
          <span className="font-medium">{comment.authorName}</span>{" "}
          <span className="text-gray-400 dark:text-gray-500">
            {formatDistanceToNow(comment._creationTime, { addSuffix: true })}
          </span>
        </div>
        {comment.status === "collapsed" ? (
          <details>
            <summary className="mt-1 cursor-pointer text-sm text-gray-500 dark:text-gray-400">
              Hidden because it may be sarcastic or negative. Show comment
            </summary>
            {body}
          </details>
        ) : (
          body
        )}
        {comment.isOwn && (
          <div className="mt-1 flex gap-3 text-xs text-gray-400 dark:text-gray-500">
            {ownStatus && <span>{ownStatus}</span>}
            <button
              type="button"
              className="underline hover:text-gray-600 dark:hover:text-gray-300"
              onClick={() => {
                if (confirm("Delete your comment?")) {
                  remove({ commentId: comment._id });
                }
              }}
            >
              Delete
            </button>
          </div>
        )}
      </div>
    </li>
  );
}

function Avatar({ name, image }: { name: string; image?: string }) {
  if (image) {
    return (
      <img src={image} alt="" className="size-8 shrink-0 rounded-full" />
    );
  }
  return (
    <div
      aria-hidden="true"
      className="grid size-8 shrink-0 place-items-center rounded-full bg-gray-200 text-sm text-gray-600 dark:bg-gray-800 dark:text-gray-300"
    >
      {name.charAt(0).toUpperCase()}
    </div>
  );
}

const buttonClass =
  "rounded-md bg-gray-900 px-3 py-1.5 text-sm text-white transition-opacity hover:opacity-80 disabled:opacity-50 dark:bg-gray-100 dark:text-gray-900";

const outlineButtonClass =
  "rounded-md border border-gray-300 px-3 py-1.5 text-sm transition-colors hover:bg-black/5 dark:border-gray-700 dark:hover:bg-white/10";

function CommentForm({ slug, postTitle }: Props) {
  const { isLoading, isAuthenticated } = useConvexAuth();
  const { isSignedIn, user } = useUser();
  const clerk = useClerk();
  const add = useMutation(api.comments.add);
  const [body, setBody] = useState("");
  const [error, setError] = useState<string>();
  const [sending, setSending] = useState(false);

  // Same height as the form, so loading auth doesn't move anything.
  if (isLoading) return <div className="h-32" />;

  if (!isAuthenticated) {
    return (
      <div className="h-32">
        <button type="button" className={outlineButtonClass} onClick={() => clerk.openSignIn()}>
          Sign in to comment
        </button>
        {isSignedIn && (
          <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            You're signed in, but comments couldn't verify your account.{" "}
            <button type="button" className="underline" onClick={() => clerk.signOut()}>
              Sign out
            </button>
          </p>
        )}
      </div>
    );
  }

  async function submit(event?: SubmitEvent) {
    event?.preventDefault();
    if (!body.trim() || sending) return;
    setSending(true);
    setError(undefined);
    try {
      await add({ slug, postTitle, body });
      setBody("");
    } catch (err) {
      setError(
        err instanceof ConvexError
          ? String(err.data)
          : "Couldn't post your comment. Try again.",
      );
    } finally {
      setSending(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-2">
      <label htmlFor="comment-body" className="sr-only">
        Comment
      </label>
      <textarea
        id="comment-body"
        value={body}
        onChange={(e) => setBody(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) submit();
        }}
        maxLength={2000}
        rows={3}
        placeholder="Add a comment"
        className="block w-full rounded-md border border-gray-300 bg-white p-2 text-sm focus:border-gray-500 focus:outline-none dark:border-gray-700 dark:bg-gray-950 dark:focus:border-gray-400"
      />
      <div className="flex items-center justify-between gap-4">
        <span className="text-xs text-gray-400 dark:text-gray-500">
          Commenting as {user?.fullName ?? user?.username ?? "you"} ·{" "}
          <button type="button" className="underline" onClick={() => clerk.signOut()}>
            Sign out
          </button>
        </span>
        <button type="submit" className={buttonClass} disabled={sending || !body.trim()}>
          {sending ? "Posting…" : "Post"}
        </button>
      </div>
      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
    </form>
  );
}
