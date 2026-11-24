"use client";

import { Badge } from "@/components/ui/badge";
import { Empty, EmptyTitle } from "@/components/ui/empty";
import { Field, FieldLabel } from "@/components/ui/field";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { OctagonXIcon } from "lucide-react";
import { YOUTUBE_CONTENT_TYPE, UPLOAD_CONTENT_TYPE } from "@/helpers/const";

interface Props {
  type: {
    value: "all" | typeof YOUTUBE_CONTENT_TYPE | typeof UPLOAD_CONTENT_TYPE;
    onChange?: (
      value: "all" | typeof YOUTUBE_CONTENT_TYPE | typeof UPLOAD_CONTENT_TYPE,
    ) => void;
    disabled?: boolean;
    label?: string;
  };

  isLoading?: boolean;
  isError?: boolean;
}

export default function SourceUploadFilter({
  type,
  isLoading = false,
  isError = false,
}: Props) {
  if (isLoading) {
    return (
      <div
        className="flex items-center gap-3 px-4 h-full"
        role="status"
        aria-label="Loading languages"
      >
        <Skeleton className="h-9 w-46" />
      </div>
    );
  }

  if (isError) {
    return (
      <Empty className="flex flex-row justify-start p-0">
        <Badge variant="destructive">
          <OctagonXIcon className="size-4" />
          <EmptyTitle className="text-sm">Failed to load</EmptyTitle>
        </Badge>
      </Empty>
    );
  }

  return (
    <div className="flex items-center h-full">
      <Field orientation="horizontal" className="px-1 w-auto h-full">
        <Select
          value={type.value}
          onValueChange={type.onChange}
          disabled={type.disabled}
        >
          <SelectTrigger
            id="source-language"
            size="default"
            className="*:text-sm min-h-auto h-full"
          >
            <FieldLabel
              htmlFor="source-language"
              className="text-foreground/60 font-bold pr-1 cursor-pointer"
            >
              {type.label ?? "Source"}:
            </FieldLabel>

            <SelectValue />
          </SelectTrigger>

          <SelectContent position="popper">
            <SelectItem value={"all"}>All</SelectItem>
            <SelectItem value={YOUTUBE_CONTENT_TYPE}>YouTube</SelectItem>
            <SelectItem value={UPLOAD_CONTENT_TYPE}>Uploads</SelectItem>
          </SelectContent>
        </Select>
      </Field>
    </div>
  );
}
