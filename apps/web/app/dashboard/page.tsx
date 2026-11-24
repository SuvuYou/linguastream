import { redirect } from "next/navigation";

// The shared (Jellyfin) library was removed in Foundation card [3];
// the personal library is the only library now.
export default function Library() {
  redirect("/dashboard/personal");
}
