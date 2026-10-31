import { ConvexProvider, useMutation, useQuery } from "convex/react";
import { useState } from "react";
import { api } from "@/convex/_generated/api";
import { useConvexClient } from "@/lib/convex";
import { getVisitorId } from "@/lib/visitor";

export default function PostStats({ slug }: { slug: string }) {
  const client = useConvexClient();
  if (!client) return <Row />;
  return (
    <ConvexProvider client={client}>
      <LiveRow slug={slug} />
    </ConvexProvider>
  );
}

function LiveRow({ slug }: { slug: string }) {
  const [visitorId] = useState(getVisitorId);
  const args = { slug, visitorId };
  const stats = useQuery(api.stats.get, args);
  const toggleLike = useMutation(api.stats.toggleLike).withOptimisticUpdate(
    (store) => {
      const current = store.getQuery(api.stats.get, args);
      if (!current) return;
      store.setQuery(api.stats.get, args, {
        ...current,
        liked: !current.liked,
        likes: current.likes + (current.liked ? -1 : 1),
      });
    },
  );
  return <Row stats={stats} onLike={() => toggleLike(args)} />;
}

type Stats = { views: number; likes: number; liked: boolean };

// Keeps the same size while loading, so nothing below it moves.
function Row({ stats, onLike }: { stats?: Stats; onLike?: () => void }) {
  return (
    <div
      className={`flex h-6 items-center justify-center gap-2 text-xs text-c45 transition-opacity ${stats ? "opacity-100" : "opacity-0"}`}
    >
      <span>
        {stats?.views ?? 0} {stats?.views === 1 ? "view" : "views"}
      </span>
      <span aria-hidden="true">·</span>
      <button
        type="button"
        onClick={onLike}
        disabled={!stats}
        aria-pressed={stats?.liked ?? false}
        aria-label={stats?.liked ? "Unlike this post" : "Like this post"}
        className={`inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 transition-colors hover:bg-c8 ${stats?.liked ? "text-red" : ""}`}
      >
        <svg
          viewBox="0 0 24 24"
          className="size-3.5"
          fill={stats?.liked ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M19.5 12.572l-7.5 7.428l-7.5 -7.428a5 5 0 1 1 7.5 -6.566a5 5 0 1 1 7.5 6.572" />
        </svg>
        {stats?.likes ?? 0}
      </button>
    </div>
  );
}
