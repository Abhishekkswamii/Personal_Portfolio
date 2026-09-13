import { getSiteContent } from "@/lib/content/repository";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { CustomCursor } from "@/components/CustomCursor";
import { ContactFormProvider } from "@/components/ContactFormProvider";

/**
 * The public site's furniture. Used by the (site) group layout and by the
 * root not-found, which sits outside that group but must still look like the
 * site rather than a bare error page.
 */
export async function SiteChrome({ children }: { children: React.ReactNode }) {
  const { profile, settings, socials } = await getSiteContent();

  return (
    <ContactFormProvider
      config={{
        formUrl: settings.contactFormUrl,
        heading: settings.contactFormHeading,
        blurb: settings.contactFormBlurb,
        email: profile.email,
      }}
    >
      <CustomCursor />
      <Navbar profile={profile} socials={socials} />
      <main id="main" className="flex-1">
        {children}
      </main>
      <Footer profile={profile} settings={settings} socials={socials} />
    </ContactFormProvider>
  );
}
