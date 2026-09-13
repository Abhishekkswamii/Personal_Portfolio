import Image from "next/image";
import type { ImageRef, Project } from "@/lib/content/types";
import { hasImage } from "@/lib/content/types";
import { ProjectVisual } from "./ProjectVisual";

/**
 * Resolves what to show in a project plate, in order of preference:
 *
 *   1. an uploaded image
 *   2. the project's drafted schematic
 *   3. a designed placeholder
 *
 * Nothing here is hardcoded per project — the data decides. Uploading a hero
 * image from the admin replaces the drawing with no code change, and a project
 * with neither still renders something deliberate rather than a broken frame.
 */

function Placeholder({ label }: { label: string }) {
  return (
    <div className="flex size-full items-center justify-center">
      <div className="relative flex aspect-[16/11] w-full max-w-[38rem] items-center justify-center">
        {/* Same registration marks as the schematics, so it belongs. */}
        <span aria-hidden="true" className="absolute left-0 top-0 size-5 border-l border-t border-ink/20" />
        <span aria-hidden="true" className="absolute right-0 top-0 size-5 border-r border-t border-ink/20" />
        <span aria-hidden="true" className="absolute bottom-0 left-0 size-5 border-b border-l border-ink/20" />
        <span aria-hidden="true" className="absolute bottom-0 right-0 size-5 border-b border-r border-ink/20" />
        <p className="label text-center text-ink/30">{label}</p>
      </div>
    </div>
  );
}

export function ProjectMedia({
  project,
  variant = "card",
  priority = false,
  className = "",
}: {
  project: Project;
  /** "card" in the index, "plate" on a case-study page. */
  variant?: "card" | "plate";
  priority?: boolean;
  className?: string;
}) {
  const image: ImageRef | null =
    variant === "plate"
      ? (project.images.hero ?? project.images.thumbnail)
      : (project.images.thumbnail ?? project.images.hero);

  if (hasImage(image)) {
    return (
      <Image
        src={image.url}
        alt={image.alt || `${project.title} — ${project.subtitle}`}
        width={image.width}
        height={image.height}
        priority={priority}
        loading={priority ? undefined : "lazy"}
        sizes={
          variant === "plate"
            ? "(max-width: 767px) 92vw, 80vw"
            : "(max-width: 767px) 92vw, 56vw"
        }
        className={`size-full object-cover ${className}`}
      />
    );
  }

  if (project.diagram) {
    return (
      <div className={`flex size-full items-center justify-center p-6 md:p-10 ${className}`}>
        <ProjectVisual variant={project.diagram} size={variant} />
      </div>
    );
  }

  return (
    <div className={`p-6 md:p-10 ${className}`}>
      <Placeholder label={`${project.title} — image coming soon`} />
    </div>
  );
}

/** A gallery figure. Hidden entirely by the caller when the list is empty. */
export function GalleryImage({ image, index }: { image: ImageRef; index: number }) {
  return (
    <figure className="bg-paper-warm">
      <Image
        src={image.url}
        alt={image.alt}
        width={image.width}
        height={image.height}
        loading="lazy"
        sizes="(max-width: 767px) 92vw, 45vw"
        className="h-auto w-full object-cover"
      />
      {image.alt ? (
        <figcaption className="label mt-3 text-gray-light">
          {String(index + 1).padStart(2, "0")} — {image.alt}
        </figcaption>
      ) : null}
    </figure>
  );
}
