import type {
  Contact,
  Credit,
  Figure,
  Profile,
  Project,
  Resume,
  Section,
  SiteContent,
  SiteLink,
  Stat,
} from "@/lib/content";

/**
 * Hand-written structural validation for content coming out of the admin
 * editor. The editor is the only writer, but a bad save would corrupt the file
 * the whole site builds from, so every field is checked before it lands.
 */

export class ValidationError extends Error {
  constructor(public readonly issues: string[]) {
    super(issues.join(" | "));
    this.name = "ValidationError";
  }
}

const SLUG_PATTERN = /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/;
const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PUBLIC_PATH_PATTERN = /^\/[A-Za-z0-9._\-/]*$/;

type Bag = Record<string, unknown>;

class Checker {
  readonly issues: string[] = [];

  fail(field: string, message: string): void {
    this.issues.push(`${field}: ${message}`);
  }

  object(value: unknown, field: string): Bag {
    if (typeof value !== "object" || value === null || Array.isArray(value)) {
      this.fail(field, "must be an object");
      return {};
    }
    return value as Bag;
  }

  text(
    value: unknown,
    field: string,
    { max, required = false }: { max: number; required?: boolean },
  ): string {
    if (typeof value !== "string") {
      this.fail(field, "must be a string");
      return "";
    }
    const trimmed = value.trim();
    if (required && trimmed.length === 0) {
      this.fail(field, "is required");
    }
    if (value.length > max) {
      this.fail(field, `must be ${max} characters or fewer`);
      return value.slice(0, max);
    }
    return value;
  }

  bool(value: unknown, field: string): boolean {
    if (typeof value !== "boolean") {
      this.fail(field, "must be true or false");
      return false;
    }
    return value;
  }

  array(value: unknown, field: string, max: number): unknown[] {
    if (!Array.isArray(value)) {
      this.fail(field, "must be a list");
      return [];
    }
    if (value.length > max) {
      this.fail(field, `must have ${max} items or fewer`);
      return value.slice(0, max);
    }
    return value;
  }

  /** Absolute http(s) URL, or empty when the field is optional. */
  webUrl(value: unknown, field: string, { required = false } = {}): string {
    const text = this.text(value, field, { max: 500, required });
    if (text.trim().length === 0) return "";
    try {
      const url = new URL(text);
      if (url.protocol !== "http:" && url.protocol !== "https:") {
        this.fail(field, "must start with http:// or https://");
      }
    } catch {
      this.fail(field, "must be a valid URL");
    }
    return text.trim();
  }

  /** An http(s) URL or a path inside `public/`. */
  imageRef(value: unknown, field: string): string {
    const text = this.text(value, field, { max: 500 });
    const trimmed = text.trim();
    if (trimmed.length === 0) return "";
    if (trimmed.startsWith("/")) {
      if (!PUBLIC_PATH_PATTERN.test(trimmed) || trimmed.includes("..")) {
        this.fail(field, "is not a valid path under public/");
      }
      return trimmed;
    }
    return this.webUrl(trimmed, field);
  }

  /** A list of paragraphs, with blank ones dropped. */
  paragraphs(value: unknown, field: string, max = 60): string[] {
    return this.array(value ?? [], field, max)
      .map((paragraph, i) =>
        this.text(paragraph, `${field}[${i}]`, { max: 5000 }).trim(),
      )
      .filter((paragraph) => paragraph.length > 0);
  }

  links(value: unknown, field: string, max = 12): SiteLink[] {
    return this.array(value, field, max).map((raw, index) => {
      const bag = this.object(raw, `${field}[${index}]`);
      return {
        label: this.text(bag.label, `${field}[${index}].label`, {
          max: 60,
          required: true,
        }).trim(),
        url: this.webUrl(bag.url, `${field}[${index}].url`, { required: true }),
      };
    });
  }
}

function validateProfile(check: Checker, value: unknown): Profile {
  const bag = check.object(value, "profile");
  return {
    name: check.text(bag.name, "profile.name", { max: 120, required: true }).trim(),
    initials: check
      .text(bag.initials, "profile.initials", { max: 6, required: true })
      .trim(),
    tagline: check.text(bag.tagline, "profile.tagline", { max: 200 }).trim(),
    bio: check.text(bag.bio, "profile.bio", { max: 4000 }).trim(),
    location: check.text(bag.location, "profile.location", { max: 120 }).trim(),
  };
}

function validateContact(check: Checker, value: unknown): Contact {
  const bag = check.object(value, "contact");
  const email = check.text(bag.email, "contact.email", { max: 200 }).trim();
  if (email.length > 0 && !EMAIL_PATTERN.test(email)) {
    check.fail("contact.email", "must be a valid email address");
  }

  return {
    email,
    phone: check.text(bag.phone, "contact.phone", { max: 40 }).trim(),
    links: check.links(bag.links ?? [], "contact.links"),
  };
}

function validateResume(check: Checker, value: unknown): Resume {
  const bag = check.object(value, "resume");
  const file = check
    .text(bag.file, "resume.file", { max: 200, required: true })
    .trim();
  if (
    !file.startsWith("/") ||
    file.includes("..") ||
    !PUBLIC_PATH_PATTERN.test(file) ||
    !file.toLowerCase().endsWith(".pdf")
  ) {
    check.fail("resume.file", "must be a .pdf path under public/, e.g. /Resume.pdf");
  }

  const updated = check
    .text(bag.updated, "resume.updated", { max: 10 })
    .trim();
  if (updated.length > 0 && !ISO_DATE_PATTERN.test(updated)) {
    check.fail("resume.updated", "must be a date like 2026-07-26");
  }

  return {
    file,
    label: check
      .text(bag.label, "resume.label", { max: 40, required: true })
      .trim(),
    updated,
  };
}

/**
 * Long-form write-up fields (`stats`, `credit`, `sections`) have no controls in
 * the admin editor yet — they are authored by hand in `site.json`. They are
 * still validated here because this function's return value is what gets
 * written back on save: anything it fails to carry over is silently deleted.
 */

function validateFigures(check: Checker, value: unknown, at: string): Figure[] {
  return check.array(value ?? [], at, 6).map((raw, index) => {
    const bag = check.object(raw, `${at}[${index}]`);
    const src = check.imageRef(bag.src, `${at}[${index}].src`);
    if (src.length === 0) {
      check.fail(`${at}[${index}].src`, "is required");
    }

    return {
      src,
      // Decorative-only figures are not a thing here: every one carries data.
      alt: check
        .text(bag.alt, `${at}[${index}].alt`, { max: 250, required: true })
        .trim(),
      caption: check
        .text(bag.caption ?? "", `${at}[${index}].caption`, { max: 700 })
        .trim(),
    };
  });
}

function validateSections(check: Checker, value: unknown, at: string): Section[] {
  return check.array(value ?? [], at, 40).map((raw, index) => {
    const bag = check.object(raw, `${at}[${index}]`);
    return {
      heading: check
        .text(bag.heading, `${at}[${index}].heading`, {
          max: 160,
          required: true,
        })
        .trim(),
      body: check.paragraphs(bag.body, `${at}[${index}].body`),
      figures: validateFigures(check, bag.figures, `${at}[${index}].figures`),
    };
  });
}

function validateStats(check: Checker, value: unknown, at: string): Stat[] {
  return check.array(value ?? [], at, 8).map((raw, index) => {
    const bag = check.object(raw, `${at}[${index}]`);
    return {
      value: check
        .text(bag.value, `${at}[${index}].value`, { max: 40, required: true })
        .trim(),
      label: check
        .text(bag.label, `${at}[${index}].label`, { max: 60, required: true })
        .trim(),
    };
  });
}

function validateCredit(
  check: Checker,
  value: unknown,
  at: string,
): Credit | undefined {
  if (value === undefined || value === null) return undefined;

  const bag = check.object(value, at);
  return {
    text: check.text(bag.text, `${at}.text`, { max: 1500, required: true }).trim(),
    links: check.links(bag.links ?? [], `${at}.links`, 6),
  };
}

function validateProject(check: Checker, value: unknown, index: number): Project {
  const at = `projects[${index}]`;
  const bag = check.object(value, at);

  const slug = check
    .text(bag.slug, `${at}.slug`, { max: 60, required: true })
    .trim()
    .toLowerCase();
  if (slug.length > 0 && !SLUG_PATTERN.test(slug)) {
    check.fail(
      `${at}.slug`,
      "may only use lowercase letters, numbers and dashes",
    );
  }

  const project: Project = {
    slug,
    title: check.text(bag.title, `${at}.title`, { max: 120, required: true }).trim(),
    summary: check.text(bag.summary, `${at}.summary`, { max: 500 }).trim(),
    image: check.imageRef(bag.image, `${at}.image`),
    externalUrl: check.webUrl(bag.externalUrl, `${at}.externalUrl`),
    tags: check
      .array(bag.tags ?? [], `${at}.tags`, 12)
      .map((tag, i) =>
        check.text(tag, `${at}.tags[${i}]`, { max: 40, required: true }).trim(),
      )
      .filter((tag) => tag.length > 0),
    published: check.bool(bag.published ?? false, `${at}.published`),
    featured: check.bool(bag.featured ?? false, `${at}.featured`),
    body: check.paragraphs(bag.body, `${at}.body`),
    links: check.links(bag.links ?? [], `${at}.links`, 10),
  };

  // Attached only when present, so short projects keep a tidy site.json rather
  // than gaining three empty keys the first time the admin panel saves.
  const stats = validateStats(check, bag.stats, `${at}.stats`);
  if (stats.length > 0) project.stats = stats;

  const credit = validateCredit(check, bag.credit, `${at}.credit`);
  if (credit) project.credit = credit;

  const sections = validateSections(check, bag.sections, `${at}.sections`);
  if (sections.length > 0) project.sections = sections;

  return project;
}

/** Throws {@link ValidationError} listing every problem found. */
export function validateSiteContent(value: unknown): SiteContent {
  const check = new Checker();
  const bag = check.object(value, "content");

  const content: SiteContent = {
    profile: validateProfile(check, bag.profile),
    contact: validateContact(check, bag.contact),
    resume: validateResume(check, bag.resume),
    projects: check
      .array(bag.projects ?? [], "projects", 100)
      .map((project, index) => validateProject(check, project, index)),
  };

  const seen = new Set<string>();
  for (const project of content.projects) {
    if (project.slug.length === 0) continue;
    if (seen.has(project.slug)) {
      check.fail("projects", `duplicate slug "${project.slug}"`);
    }
    seen.add(project.slug);
  }

  if (check.issues.length > 0) throw new ValidationError(check.issues);
  return content;
}
