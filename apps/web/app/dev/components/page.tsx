import { notFound } from "next/navigation";
import ComponentShowcase from "@/components/dev/ComponentShowcase";

export default function ComponentsPage() {
  if (process.env.NODE_ENV === "production") notFound();
  return <ComponentShowcase />;
}
