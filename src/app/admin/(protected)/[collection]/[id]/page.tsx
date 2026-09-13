import { notFound } from "next/navigation";
import { collectionByRoute, getRow } from "@/lib/admin/data";
import { PageHeader } from "@/components/admin/PageHeader";
import { RecordForm } from "@/components/admin/RecordForm";
import type { Field } from "@/lib/admin/schema";

/** Sensible starting values, so a new record opens with the right field types. */
function blankRecord(fields: Field[]) {
  const record: Record<string, unknown> = { published: false };
  for (const f of fields) {
    record[f.name] =
      f.type === "boolean"
        ? false
        : f.type === "list" || f.type === "paragraphs" || f.type === "steps"
          ? []
          : f.type === "gallery"
            ? { thumbnail: null, hero: null, architecture: null, gallery: [] }
            : f.type === "richtext"
              ? { github: null, live: null }
              : f.type === "image"
                ? null
                : f.type === "number"
                  ? 0
                  : "";
  }
  return record;
}

export default async function RecordPage(
  props: PageProps<"/admin/[collection]/[id]">,
) {
  const { collection: route, id } = await props.params;
  const collection = collectionByRoute(route);
  if (!collection) notFound();

  const isNew = id === "new";
  const row = isNew ? null : await getRow(collection.table, id);
  if (!isNew && !row) notFound();

  // A Redis document already carries every field — including `images`,
  // inline, in exactly the shape the gallery editor expects — so there is no
  // separate fetch or reshaping step the way a normalised SQL table needed.
  const initial: Record<string, unknown> = row ? { ...row } : blankRecord(collection.fields);

  const title = isNew
    ? `New ${collection.singular.toLowerCase()}`
    : String(row?.[collection.titleField] ?? collection.singular);

  // Project uploads land in their own directory, so the tree stays legible on
  // disk and a deleted project's files are easy to find.
  const uploadFolder =
    collection.key === "projects" && row?.slug
      ? `projects/${String(row.slug)}`
      : collection.route;

  return (
    <>
      <PageHeader
        title={title}
        breadcrumb={[
          { label: "Dashboard", href: "/admin" },
          { label: collection.plural, href: `/admin/${collection.route}` },
        ]}
      />

      <RecordForm
        table={collection.table}
        id={isNew ? null : id}
        fields={collection.fields}
        initial={initial}
        backHref={`/admin/${collection.route}`}
        publishable={collection.publishable}
        deletable={!isNew}
        title={title}
        uploadFolder={uploadFolder}
      />
    </>
  );
}
