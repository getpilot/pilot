"use client";

import { Card, CardContent } from "@pilot/ui/components/card";
import { Label } from "@pilot/ui/components/label";
import { RadioGroup, RadioGroupItem } from "@pilot/ui/components/radio-group";
import { cn } from "@pilot/ui/lib/utils";
import Image from "next/image";
import { useMemo } from "react";

export type InstagramPostOption = {
  id: string;
  caption?: string;
  media_url?: string;
  media_type?: string;
  thumbnail_url?: string;
};

type PostPickerProps = {
  label?: string;
  helperText?: string;
  value: string;
  onChange: (value: string) => void;
  posts: InstagramPostOption[];
  selectedPost?: InstagramPostOption | null;
};

export function PostPicker({
  label = "Select Post *",
  helperText = "One post is required for comment/both scopes.",
  value,
  onChange,
  posts,
  selectedPost,
}: PostPickerProps) {
  const visiblePosts = useMemo(() => {
    if (
      selectedPost &&
      !posts.some((post) => post.id === selectedPost.id)
    ) {
      return [selectedPost, ...posts];
    }

    return posts;
  }, [posts, selectedPost]);

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <RadioGroup value={value} onValueChange={onChange}>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {visiblePosts.map((p) => {
            const isPinnedSelection =
              selectedPost?.id === p.id &&
              !posts.some((post) => post.id === p.id);

            return (
              <label
                key={p.id}
                htmlFor={`post-${p.id}`}
                className="cursor-pointer"
              >
                <Card
                  className={cn(
                    "overflow-hidden transition-shadow py-0",
                    value === p.id ? "ring-2 ring-primary" : "hover:shadow"
                  )}
                >
                  <CardContent className="p-0">
                    {p.media_type === "VIDEO" && p.thumbnail_url ? (
                      <Image
                        src={p.thumbnail_url}
                        alt={p.caption || p.id}
                        className="h-36 w-full object-cover"
                        loading="lazy"
                        width={100}
                        height={100}
                      />
                    ) : p.media_url ? (
                      <Image
                        src={p.media_url}
                        alt={p.caption || p.id}
                        className="h-36 w-full object-cover"
                        loading="lazy"
                        width={100}
                        height={100}
                      />
                    ) : (
                      <div className="flex h-36 w-full items-center justify-center text-sm text-muted-foreground">
                        no preview
                      </div>
                    )}
                    <div className="p-2 text-xs text-muted-foreground line-clamp-2">
                      {(p.caption || p.id)?.slice(0, 70)}...
                    </div>
                    {isPinnedSelection ? (
                      <div className="border-t px-2 py-1 text-[11px] font-medium text-primary">
                        Selected post kept visible
                      </div>
                    ) : null}
                  </CardContent>
                </Card>
                <div className="sr-only">
                  <RadioGroupItem id={`post-${p.id}`} value={p.id} />
                </div>
              </label>
            );
          })}
        </div>
      </RadioGroup>
      {helperText ? (
        <p className="text-sm text-muted-foreground">{helperText}</p>
      ) : null}
    </div>
  );
}

export default PostPicker;
