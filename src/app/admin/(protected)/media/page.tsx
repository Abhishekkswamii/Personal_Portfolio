import { listMedia, referencedImageUrls } from "@/lib/admin/data";
import { PageHeader } from "@/components/admin/PageHeader";
import { MediaLibrary } from "@/components/admin/MediaLibrary";

export default async function MediaPage() {
  const [rows, referenced] = await Promise.all([
    listMedia(),
    referencedImageUrls(),
  ]);

  const items = rows.map((r) => ({
    id: String(r.id),
    path: String(r.path),
    url: String(r.url),
    alt: String(r.alt ?? ""),
    width: Number(r.width) || 0,
    height: Number(r.height) || 0,
    size: Number(r.sizeBytes) || 0,
    used: referenced.has(String(r.url)),
  }));

  return (
    <>
      <PageHeader
        title="Media"
        description="Everything uploaded from the admin. Files marked Unused aren't referenced by any project or the profile — replacing an image leaves the old one here, and deleting it reclaims the space."
        breadcrumb={[{ label: "Dashboard", href: "/admin" }]}
      />
      <MediaLibrary items={items} />
    </>
  );
}
