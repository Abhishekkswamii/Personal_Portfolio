import { getSiteContent } from "@/lib/content/repository";
import { Hero } from "@/sections/Hero";
import { SelectedWork } from "@/sections/SelectedWork";
import { Services } from "@/sections/Services";
import { Experience } from "@/sections/Experience";
import { About } from "@/sections/About";
import { Skills } from "@/sections/Skills";
import { Patent } from "@/sections/Patent";
import { Contact } from "@/sections/Contact";

export default async function Home() {
  const content = await getSiteContent();

  // Defensible from the supplied timeline — never a padded years claim.
  const earliest = content.experiences.at(-1)?.period.match(/\d{4}/)?.[0];
  const experienceNote = earliest
    ? `Building since ${earliest} · Engineering roles`
    : undefined;

  return (
    <>
      <Hero profile={content.profile} socials={content.socials} />
      <Experience experiences={content.experiences} note={experienceNote} />
      <SelectedWork projects={content.projects} />
      <Services services={content.services} />
      <About profile={content.profile} education={content.education} />
      <Skills categories={content.skillCategories} />
      <Patent patent={content.patent} />
      <Contact
        profile={content.profile}
        settings={content.settings}
        socials={content.socials}
      />
    </>
  );
}
