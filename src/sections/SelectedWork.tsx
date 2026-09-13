import type { Project } from "@/lib/content/types";
import { ProjectCard } from "@/components/ProjectCard";
import { SectionHeading } from "@/components/SectionHeading";

export function SelectedWork({ projects }: { projects: Project[] }) {
  // No published projects — the section simply doesn't exist.
  if (!projects.length) return null;

  return (
    <section id="work" className="shell section-gap scroll-mt-(--nav-h)">
      <SectionHeading
        label="Selected work"
        note={`${projects.length} ${projects.length === 1 ? "project" : "projects"}`}
        intro="A few systems I've designed, engineered and shipped."
      />

      <div className="mt-10 md:mt-14">
        {projects.map((project, i) => (
          <ProjectCard key={project.id} project={project} index={i} />
        ))}
        <div className="border-t border-rule" />
      </div>
    </section>
  );
}
