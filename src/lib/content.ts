import raw from "@/content/site.json";

/**
 * Everything editable on the site lives in `src/content/site.json`.
 * It is imported (not read from disk) so the static export can inline it at
 * build time, and so a malformed edit fails `tsc` instead of shipping.
 *
 * The dev-only admin panel at /admin writes this same file — see
 * `src/lib/admin/`. After saving there, commit the change to publish it.
 */

export type SiteLink = {
  label: string;
  url: string;
};

export type Profile = {
  name: string;
  /** Short mark shown in the navbar, e.g. "SF". */
  initials: string;
  tagline: string;
  bio: string;
  location: string;
};

export type Contact = {
  email: string;
  phone: string;
  links: SiteLink[];
};

export type Resume = {
  /** Path under `public/`, e.g. "/Resume.pdf". */
  file: string;
  label: string;
  /** ISO date (YYYY-MM-DD) the file was last replaced. */
  updated: string;
};

/** A captioned image inside a project section. */
export type Figure = {
  /** Absolute URL or a path under `public/`. */
  src: string;
  alt: string;
  caption: string;
};

/** A headed run of paragraphs, optionally illustrated. */
export type Section = {
  heading: string;
  body: string[];
  figures: Figure[];
};

/** One headline number, e.g. value "28.4 km", label "Burst altitude". */
export type Stat = {
  label: string;
  value: string;
};

/**
 * Attribution for a project that is not solely the site owner's work. Rendered
 * before the body so it cannot be missed.
 */
export type Credit = {
  text: string;
  links: SiteLink[];
};

export type Project = {
  slug: string;
  title: string;
  summary: string;
  /** Absolute URL or a path under `public/`. Empty means "no image". */
  image: string;
  /** When set, the project links straight out to this URL in a new tab. */
  externalUrl: string;
  tags: string[];
  published: boolean;
  /** Featured projects appear in the home page carousel. */
  featured: boolean;
  /** Paragraphs rendered on the project's own page. */
  body: string[];
  links: SiteLink[];
  /**
   * The three fields below are for long-form write-ups. All are optional: a
   * short project just sets `body` and stops, and omits these keys entirely.
   */
  stats?: Stat[];
  credit?: Credit;
  /** Headed sections, rendered after `body`. */
  sections?: Section[];
};

export type SiteContent = {
  profile: Profile;
  contact: Contact;
  resume: Resume;
  projects: Project[];
};

export const site: SiteContent = raw;

/** Projects visible to the public, in authoring order. */
export function publishedProjects(content: SiteContent = site): Project[] {
  return content.projects.filter((project) => project.published);
}

/** Published projects that should appear in the home page carousel. */
export function featuredProjects(content: SiteContent = site): Project[] {
  const featured = publishedProjects(content).filter((p) => p.featured);
  // Never leave the carousel empty just because nothing is flagged featured.
  return featured.length > 0 ? featured : publishedProjects(content);
}

/**
 * Projects that get their own generated page. External projects link straight
 * out, so they get no page of their own (and no dead internal route).
 */
export function internalProjects(content: SiteContent = site): Project[] {
  return publishedProjects(content).filter((project) => !project.externalUrl);
}

export function findProject(
  slug: string,
  content: SiteContent = site,
): Project | undefined {
  return internalProjects(content).find((project) => project.slug === slug);
}

export function isExternal(project: Project): boolean {
  return project.externalUrl.length > 0;
}

/** Where a project card or carousel slide should point. */
export function projectHref(project: Project): string {
  return isExternal(project) ? project.externalUrl : `/projects/${project.slug}/`;
}
