import { notFound } from "next/navigation";
import { collectionByRoute, listRows } from "@/lib/admin/data";
import { PageHeader } from "@/components/admin/PageHeader";
import { CollectionList, type ListRow } from "@/components/admin/CollectionList";

export default async function CollectionPage(
  props: PageProps<"/admin/[collection]">,
) {
  const { collection: route } = await props.params;
  const collection = collectionByRoute(route);
  if (!collection) notFound();

  const rows = await listRows(collection.table);

  const list: ListRow[] = rows.map((r) => ({
    id: String(r.id),
    title: String(r[collection.titleField] ?? ""),
    subtitle: collection.subtitleField
      ? String(r[collection.subtitleField] ?? "")
      : undefined,
    published: Boolean(r.published),
    href: `/admin/${collection.route}/${r.id}`,
  }));

  return (
    <>
      <PageHeader
        title={collection.plural}
        description={collection.description}
        breadcrumb={[{ label: "Dashboard", href: "/admin" }]}
        action={{ label: `New ${collection.singular.toLowerCase()}`, href: `/admin/${collection.route}/new` }}
      />

      <CollectionList
        table={collection.table}
        rows={list}
        orderable={collection.orderable}
        publishable={collection.publishable}
        duplicable={collection.key === "projects"}
        emptyLabel={`No ${collection.plural.toLowerCase()} yet. Create the first one.`}
      />
    </>
  );
}
