import { notFound } from "next/navigation";
import { SINGLETONS, isSingletonKey } from "@/lib/admin/schema";
import { getSingleton } from "@/lib/admin/data";
import { PageHeader } from "@/components/admin/PageHeader";
import { RecordForm } from "@/components/admin/RecordForm";

export default async function SingletonPage(
  props: PageProps<"/admin/single/[key]">,
) {
  const { key } = await props.params;
  if (!isSingletonKey(key)) notFound();

  const definition = SINGLETONS[key];
  const row = await getSingleton(key);

  const initial: Record<string, unknown> =
    (row ? { ...row } : null) ??
    Object.fromEntries(
      definition.fields.map((f) => [
        f.name,
        f.type === "boolean"
          ? true
          : f.type === "list" || f.type === "paragraphs"
            ? []
            : f.type === "image"
              ? null
              : "",
      ]),
    );

  return (
    <>
      <PageHeader
        title={definition.title}
        description={definition.description}
        breadcrumb={[{ label: "Dashboard", href: "/admin" }]}
      />

      <RecordForm
        table={key}
        id={row ? String(row.id) : null}
        fields={definition.fields}
        initial={initial}
        backHref="/admin"
        title={definition.title}
        uploadFolder={key === "profile" ? "profile" : "media"}
      />
    </>
  );
}
