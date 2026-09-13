import { SiteChrome } from "@/components/SiteChrome";
import { NotFoundContent } from "@/components/NotFoundContent";

/**
 * Global 404 for URLs that match no route at all. It sits outside the (site)
 * group, so it brings the chrome itself rather than dropping the visitor onto
 * a page with no way back.
 */
export default function GlobalNotFound() {
  return (
    <SiteChrome>
      <NotFoundContent />
    </SiteChrome>
  );
}
