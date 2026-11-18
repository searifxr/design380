import { createFileRoute } from "@tanstack/react-router";
import { Toaster } from "@/components/ui/sonner";
import { Studio } from "@/components/studio/Studio";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [
    { title: "Design 380 — Car Interior Studio" },
    { name: "description", content: "Design your car interior: drag accessories into a to-scale cabin and see an estimated cost." },
    { property: "og:title", content: "Design 380 — Car Interior Studio" },
    { property: "og:description", content: "Drag accessories into a to-scale cabin and see an estimated cost." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: () => (
    <div className="dark min-h-dvh bg-background text-foreground">
      <header className="flex h-16 items-center border-b border-border px-6 font-display text-lg tracking-wide">DESIGN <span className="ml-1 text-primary">380</span></header>
      <Studio />
      <Toaster />
    </div>
  ),
});
