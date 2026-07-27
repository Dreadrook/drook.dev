"use client";

import { useMemo, useRef, useState } from "react";
import {
  Alert,
  Badge,
  Box,
  Button,
  Code,
  Flex,
  HStack,
  Heading,
  Input,
  Link,
  Stack,
  Tabs,
  Text,
} from "@chakra-ui/react";
import { LuPlus, LuRotateCcw, LuSave, LuUpload } from "react-icons/lu";
import type { Project, SiteContent } from "@/lib/content";
import {
  AdminApiError,
  getContent,
  logout,
  saveContent,
  uploadFile,
} from "@/components/admin/api";
import { TextAreaField, TextField } from "@/components/admin/fields";
import { LinkListEditor } from "@/components/admin/link-list-editor";
import { ProjectEditor } from "@/components/admin/project-editor";

type Props = {
  initial: SiteContent;
  username: string | null;
  onSignedOut: () => void;
};

const blankProject = (existing: Project[]): Project => {
  const base = "new-project";
  let slug = base;
  let suffix = 2;
  while (existing.some((project) => project.slug === slug)) {
    slug = `${base}-${suffix++}`;
  }
  return {
    slug,
    title: "New project",
    summary: "",
    image: "",
    externalUrl: "",
    tags: [],
    published: false,
    featured: false,
    body: [],
    links: [],
  };
};

export function ContentEditor({ initial, username, onSignedOut }: Props) {
  const [saved, setSaved] = useState<SiteContent>(initial);
  const [draft, setDraft] = useState<SiteContent>(initial);
  const [busy, setBusy] = useState(false);
  const [issues, setIssues] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const resumeInput = useRef<HTMLInputElement>(null);

  const dirty = useMemo(
    () => JSON.stringify(draft) !== JSON.stringify(saved),
    [draft, saved],
  );

  const patchProfile = (changes: Partial<SiteContent["profile"]>) =>
    setDraft((prev) => ({ ...prev, profile: { ...prev.profile, ...changes } }));
  const patchContact = (changes: Partial<SiteContent["contact"]>) =>
    setDraft((prev) => ({ ...prev, contact: { ...prev.contact, ...changes } }));
  const patchResume = (changes: Partial<SiteContent["resume"]>) =>
    setDraft((prev) => ({ ...prev, resume: { ...prev.resume, ...changes } }));
  const patchProjects = (projects: Project[]) =>
    setDraft((prev) => ({ ...prev, projects }));

  function reportFailure(cause: unknown, fallback: string) {
    if (cause instanceof AdminApiError) {
      setError(cause.message);
      setIssues(cause.issues);
    } else {
      setError(fallback);
      setIssues([]);
    }
  }

  async function save() {
    setBusy(true);
    setError("");
    setIssues([]);
    setNotice("");
    try {
      const result = await saveContent(draft);
      setSaved(result.content);
      setDraft(result.content);
      setNotice("Saved to src/content/site.json. Commit and push to publish.");
    } catch (cause) {
      reportFailure(cause, "Could not save changes");
    } finally {
      setBusy(false);
    }
  }

  async function reloadFromDisk() {
    setBusy(true);
    setError("");
    setIssues([]);
    try {
      const { content } = await getContent();
      setSaved(content);
      setDraft(content);
      setNotice("Reloaded from disk.");
    } catch (cause) {
      reportFailure(cause, "Could not reload content");
    } finally {
      setBusy(false);
    }
  }

  async function signOut() {
    try {
      await logout();
    } finally {
      onSignedOut();
    }
  }

  async function handleResume(file: File | undefined) {
    if (!file) return;
    setBusy(true);
    setError("");
    try {
      const { url } = await uploadFile("resume", file);
      patchResume({
        file: url,
        updated: new Date().toISOString().slice(0, 10),
      });
      setNotice(
        `Replaced public${url}. Press Save changes to record the new date, then commit both.`,
      );
    } catch (cause) {
      reportFailure(cause, "Upload failed");
    } finally {
      setBusy(false);
      if (resumeInput.current) resumeInput.current.value = "";
    }
  }

  return (
    <Stack gap={6}>
      <Flex
        position="sticky"
        top="0"
        zIndex="docked"
        gap={3}
        align={{ base: "stretch", md: "center" }}
        direction={{ base: "column", md: "row" }}
        py={3}
        bg={{ base: "gray.50", _dark: "gray.950" }}
      >
        <HStack gap={3} flex="1">
          <Heading size="lg">Site content</Heading>
          {dirty ? (
            <Badge colorPalette="orange">Unsaved changes</Badge>
          ) : (
            <Badge colorPalette="green">Saved</Badge>
          )}
        </HStack>

        <HStack gap={2} wrap="wrap">
          <Text fontSize="sm" color={{ base: "gray.600", _dark: "gray.400" }}>
            {username ? `Signed in as ${username}` : "Signed in"}
          </Text>
          <Button size="sm" variant="ghost" onClick={signOut}>
            Sign out
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={reloadFromDisk}
            loading={busy}
          >
            <LuRotateCcw /> Reload
          </Button>
          <Button
            size="sm"
            colorPalette="blue"
            onClick={save}
            loading={busy}
            disabled={!dirty}
          >
            <LuSave /> Save changes
          </Button>
        </HStack>
      </Flex>

      {error && (
        <Alert.Root status="error">
          <Alert.Indicator />
          <Alert.Content>
            <Alert.Title>{error}</Alert.Title>
            {issues.length > 0 && (
              <Alert.Description>
                <Stack gap={1} pt={1}>
                  {issues.map((issue) => (
                    <Text key={issue} fontSize="sm">
                      • {issue}
                    </Text>
                  ))}
                </Stack>
              </Alert.Description>
            )}
          </Alert.Content>
        </Alert.Root>
      )}

      {notice && (
        <Alert.Root status="success">
          <Alert.Indicator />
          <Alert.Content>
            <Alert.Description>{notice}</Alert.Description>
          </Alert.Content>
        </Alert.Root>
      )}

      <Tabs.Root defaultValue="profile" variant="enclosed" lazyMount>
        <Tabs.List overflowX="auto" flexWrap="nowrap">
          <Tabs.Trigger value="profile">Profile</Tabs.Trigger>
          <Tabs.Trigger value="contact">Contact</Tabs.Trigger>
          <Tabs.Trigger value="resume">Resume</Tabs.Trigger>
          <Tabs.Trigger value="projects">
            Projects
            <Badge ms={2} colorPalette="gray">
              {draft.projects.length}
            </Badge>
          </Tabs.Trigger>
        </Tabs.List>

        <Tabs.Content value="profile">
          <Stack gap={5} maxW="2xl">
            <TextField
              label="Name"
              value={draft.profile.name}
              onChange={(value) => patchProfile({ name: value })}
              required
            />
            <TextField
              label="Initials"
              value={draft.profile.initials}
              onChange={(value) => patchProfile({ initials: value })}
              helper="Shown as the logo in the navbar."
              required
            />
            <TextField
              label="Tagline"
              value={draft.profile.tagline}
              onChange={(value) => patchProfile({ tagline: value })}
              helper="One short line under the About heading."
            />
            <TextAreaField
              label="Bio"
              value={draft.profile.bio}
              onChange={(value) => patchProfile({ bio: value })}
              rows={6}
            />
            <TextField
              label="Location"
              value={draft.profile.location}
              onChange={(value) => patchProfile({ location: value })}
            />
          </Stack>
        </Tabs.Content>

        <Tabs.Content value="contact">
          <Stack gap={5} maxW="2xl">
            <TextField
              label="Email"
              type="email"
              value={draft.contact.email}
              onChange={(value) => patchContact({ email: value })}
            />
            <TextField
              label="Phone"
              value={draft.contact.phone}
              onChange={(value) => patchContact({ phone: value })}
              helper="Displayed as written; the tap-to-call link strips formatting."
            />
            <LinkListEditor
              label="Profile links (GitHub, LinkedIn, …)"
              links={draft.contact.links}
              onChange={(links) => patchContact({ links })}
            />
          </Stack>
        </Tabs.Content>

        <Tabs.Content value="resume">
          <Stack gap={5} maxW="2xl">
            <Alert.Root status="info" size="sm">
              <Alert.Indicator />
              <Alert.Content>
                <Alert.Description>
                  Uploading replaces <Code>public/Resume.pdf</Code> immediately.
                  The old file stays recoverable through git until you commit.
                </Alert.Description>
              </Alert.Content>
            </Alert.Root>

            <Box>
              <Text fontSize="sm" mb={2}>
                Current file:{" "}
                <Link
                  href={draft.resume.file}
                  target="_blank"
                  rel="noopener noreferrer"
                  color="blue.500"
                >
                  {draft.resume.file}
                </Link>
              </Text>
              <Button
                size="sm"
                variant="outline"
                loading={busy}
                onClick={() => resumeInput.current?.click()}
              >
                <LuUpload /> Upload new PDF
              </Button>
              <Input
                ref={resumeInput}
                type="file"
                accept="application/pdf"
                display="none"
                onChange={(event) => handleResume(event.target.files?.[0])}
              />
            </Box>

            <TextField
              label="Link label"
              value={draft.resume.label}
              onChange={(value) => patchResume({ label: value })}
              required
            />
            <TextField
              label="Last updated"
              value={draft.resume.updated}
              onChange={(value) => patchResume({ updated: value })}
              placeholder="2026-07-26"
              helper="Format: YYYY-MM-DD."
            />
          </Stack>
        </Tabs.Content>

        <Tabs.Content value="projects">
          <Stack gap={4}>
            <Button
              alignSelf="start"
              variant="outline"
              onClick={() =>
                patchProjects([...draft.projects, blankProject(draft.projects)])
              }
            >
              <LuPlus /> Add project
            </Button>

            {draft.projects.length === 0 && (
              <Text color={{ base: "gray.600", _dark: "gray.400" }}>
                No projects yet.
              </Text>
            )}

            {draft.projects.map((project, index) => (
              <ProjectEditor
                // Keyed by position, not slug: keying on content would remount
                // the row on every keystroke in the slug field and steal focus.
                key={index}
                project={project}
                index={index}
                total={draft.projects.length}
                onError={(message) => setError(message)}
                onChange={(next) =>
                  patchProjects(
                    draft.projects.map((item, i) => (i === index ? next : item)),
                  )
                }
                onMove={(direction) => {
                  const target = index + direction;
                  if (target < 0 || target >= draft.projects.length) return;
                  const next = [...draft.projects];
                  [next[index], next[target]] = [next[target], next[index]];
                  patchProjects(next);
                }}
                onRemove={() =>
                  patchProjects(draft.projects.filter((_, i) => i !== index))
                }
              />
            ))}
          </Stack>
        </Tabs.Content>
      </Tabs.Root>

      <Alert.Root status="info" variant="surface">
        <Alert.Indicator />
        <Alert.Content>
          <Alert.Title>Publishing</Alert.Title>
          <Alert.Description>
            Saving writes to your working tree only. To put changes live:{" "}
            <Code>git add -A && git commit -m &quot;Update content&quot; && git push</Code>
          </Alert.Description>
        </Alert.Content>
      </Alert.Root>
    </Stack>
  );
}
