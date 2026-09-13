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
    if (project.id === "sehatconnect") {
      // Custom premium composite mockup for SehatConnect in both card and plate views.
      return (
        <div className={`flex size-full items-center justify-center gap-3 md:gap-6 overflow-hidden bg-[#EAEAEA] p-6 md:p-10 ${className}`}>
          <Image
            src="/images/sehatconnect/sehat2.webp"
            alt="SehatConnect Consultation"
            width={876}
            height={1795}
            className="w-[28%] md:w-[22%] h-auto rounded-[1rem] sm:rounded-[1.5rem] md:rounded-[2rem] shadow-xl transform rotate-[-4deg] translate-y-6 opacity-90 transition-transform duration-[900ms] group-hover:rotate-[-6deg] group-hover:translate-y-8"
          />
          <Image
            src="/images/sehatconnect/sehat1.webp"
            alt="SehatConnect Home"
            width={893}
            height={1761}
            priority={priority}
            className="w-[32%] md:w-[26%] h-auto rounded-[1rem] sm:rounded-[1.5rem] md:rounded-[2rem] shadow-2xl z-10 transition-transform duration-[900ms] group-hover:scale-[1.02]"
          />
          <Image
            src="/images/sehatconnect/sehat3.webp"
            alt="SehatConnect Doctors"
            width={888}
            height={1771}
            className="w-[28%] md:w-[22%] h-auto rounded-[1rem] sm:rounded-[1.5rem] md:rounded-[2rem] shadow-xl transform rotate-[4deg] translate-y-6 opacity-90 transition-transform duration-[900ms] group-hover:rotate-[6deg] group-hover:translate-y-8"
          />
        </div>
      );
    }

    if (project.id === "vyapariq") {
      // Custom premium composite mockup for VyaparIQ desktop app
      return (
        <div className={`relative flex size-full items-center justify-center overflow-hidden bg-[#E8E8E8] ${className}`}>
          <Image
            src="/images/vyapariq/vyapariq2.webp"
            alt="VyaparIQ Products"
            width={2940}
            height={1452}
            className="absolute left-[-10%] top-[10%] w-[70%] h-auto rounded-[0.5rem] md:rounded-[0.75rem] shadow-xl opacity-60 transition-all duration-[900ms] ease-out group-hover:left-[-12%] group-hover:top-[8%] group-hover:opacity-50"
          />
          <Image
            src="/images/vyapariq/vyapariq3.webp"
            alt="VyaparIQ Chatbot"
            width={2940}
            height={1448}
            className="absolute right-[-10%] bottom-[10%] w-[70%] h-auto rounded-[0.5rem] md:rounded-[0.75rem] shadow-xl opacity-60 transition-all duration-[900ms] ease-out group-hover:right-[-12%] group-hover:bottom-[8%] group-hover:opacity-50"
          />
          <Image
            src="/images/vyapariq/vyapariq1.webp"
            alt="VyaparIQ Main"
            width={2936}
            height={1442}
            priority={priority}
            className="relative z-10 w-[85%] h-auto rounded-[0.5rem] md:rounded-[0.75rem] shadow-2xl border border-white/20 transition-transform duration-[900ms] ease-out group-hover:scale-[1.03]"
          />
        </div>
      );
    }

    if (project.id === "file-intelligence") {
      // Custom premium composite mockup for File Intelligence desktop app
      return (
        <div className={`relative flex size-full items-center justify-center overflow-hidden bg-[#E2E8F0] ${className}`}>
          <Image
            src="/images/fileint/fileint2.webp"
            alt="File Intelligence Interface"
            width={2794}
            height={1674}
            className="absolute left-[-10%] top-[10%] w-[70%] h-auto rounded-[0.5rem] md:rounded-[0.75rem] shadow-xl opacity-60 transition-all duration-[900ms] ease-out group-hover:left-[-12%] group-hover:top-[8%] group-hover:opacity-50"
          />
          <Image
            src="/images/fileint/fileint4.webp"
            alt="File Intelligence Analysis"
            width={2790}
            height={1676}
            className="absolute right-[-10%] bottom-[10%] w-[70%] h-auto rounded-[0.5rem] md:rounded-[0.75rem] shadow-xl opacity-60 transition-all duration-[900ms] ease-out group-hover:right-[-12%] group-hover:bottom-[8%] group-hover:opacity-50"
          />
          <Image
            src="/images/fileint/fileint1.webp"
            alt="File Intelligence Main"
            width={2792}
            height={1670}
            priority={priority}
            className="relative z-10 w-[85%] h-auto rounded-[0.5rem] md:rounded-[0.75rem] shadow-2xl border border-white/20 transition-transform duration-[900ms] ease-out group-hover:scale-[1.03]"
          />
        </div>
      );
    }

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
