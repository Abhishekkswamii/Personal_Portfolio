import Link from "next/link";
import type { Profile, SiteSettings, SocialLink } from "@/lib/content/types";

export function Footer({
  profile,
  settings,
  socials,
}: {
  profile: Profile;
  settings: SiteSettings;
  socials: SocialLink[];
}) {
  return (
    <footer className="border-t border-rule">
      <div className="shell grid grid-cols-1 items-center gap-6 py-9 md:grid-cols-3 md:gap-4 md:py-7">
        <div>
          <Link
            href="/"
            data-cursor="link"
            className="text-[0.9375rem] font-medium tracking-[-0.02em]"
          >
            {profile.name}
          </Link>
          {settings.footerText ? (
            <p className="label mt-2 text-gray-light">{settings.footerText}</p>
          ) : null}
        </div>

        <ul className="flex flex-wrap items-center gap-x-7 gap-y-2 md:justify-center">
          {socials.map((s) => (
            <li key={s.id}>
              <a
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                data-cursor="link"
                className="label text-gray transition-colors duration-300 hover:text-ink"
              >
                {s.label}
              </a>
            </li>
          ))}
          <li>
            <a
              href={`mailto:${profile.email}`}
              data-cursor="link"
              className="label text-gray transition-colors duration-300 hover:text-ink"
            >
              Email
            </a>
          </li>
        </ul>

        <p className="label text-gray-light md:text-right">
          &copy; {new Date().getFullYear()} {profile.name}
        </p>
      </div>
    </footer>
  );
}
