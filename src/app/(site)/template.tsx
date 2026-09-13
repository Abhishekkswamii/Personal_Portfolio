import { PageTransition } from "@/components/PageTransition";

/** A template re-mounts on every navigation, which is what drives the settle. */
export default function Template({ children }: { children: React.ReactNode }) {
  return <PageTransition>{children}</PageTransition>;
}
