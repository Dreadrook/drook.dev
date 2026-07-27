"use client";

import { useRef, useState } from "react";
import {
  Badge,
  Box,
  Button,
  Flex,
  HStack,
  Heading,
  IconButton,
  Input,
  Stack,
  Switch,
  Text,
} from "@chakra-ui/react";
import {
  LuChevronDown,
  LuChevronUp,
  LuTrash2,
  LuUpload,
} from "react-icons/lu";
import type { Project } from "@/lib/content";
import { TextAreaField, TextField } from "@/components/admin/fields";
import { LinkListEditor } from "@/components/admin/link-list-editor";
import { AdminApiError, uploadFile } from "@/components/admin/api";

type Props = {
  project: Project;
  index: number;
  total: number;
  onChange: (next: Project) => void;
  onMove: (direction: -1 | 1) => void;
  onRemove: () => void;
  onError: (message: string) => void;
};

export function ProjectEditor({
  project,
  index,
  total,
  onChange,
  onMove,
  onRemove,
  onError,
}: Props) {
  const [open, setOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  const patch = (changes: Partial<Project>) => onChange({ ...project, ...changes });

  async function handleImage(file: File | undefined) {
    if (!file) return;
    setUploading(true);
    try {
      const { url } = await uploadFile("image", file);
      patch({ image: url });
    } catch (cause) {
      onError(cause instanceof AdminApiError ? cause.message : "Upload failed");
    } finally {
      setUploading(false);
      if (fileInput.current) fileInput.current.value = "";
    }
  }

  return (
    <Box
      borderWidth="1px"
      borderColor={{ base: "gray.200", _dark: "whiteAlpha.200" }}
      borderRadius="lg"
      bg={{ base: "white", _dark: "gray.900" }}
      overflow="hidden"
    >
      <Flex
        align={{ base: "start", sm: "center" }}
        direction={{ base: "column", sm: "row" }}
        gap={3}
        p={4}
      >
        <Stack gap={1} flex="1" minW="0">
          <HStack gap={2} wrap="wrap">
            <Heading size="sm" truncate>
              {project.title || "Untitled project"}
            </Heading>
            {!project.published && <Badge colorPalette="gray">Draft</Badge>}
            {project.featured && <Badge colorPalette="blue">Featured</Badge>}
            {project.externalUrl && <Badge colorPalette="purple">External</Badge>}
          </HStack>
          <Text fontSize="xs" color={{ base: "gray.500", _dark: "gray.500" }}>
            /{project.slug || "no-slug"}
          </Text>
        </Stack>

        <HStack gap={1}>
          <IconButton
            aria-label="Move up"
            size="sm"
            variant="outline"
            disabled={index === 0}
            onClick={() => onMove(-1)}
          >
            <LuChevronUp />
          </IconButton>
          <IconButton
            aria-label="Move down"
            size="sm"
            variant="outline"
            disabled={index === total - 1}
            onClick={() => onMove(1)}
          >
            <LuChevronDown />
          </IconButton>
          <Button size="sm" variant="subtle" onClick={() => setOpen((prev) => !prev)}>
            {open ? "Close" : "Edit"}
          </Button>
          <IconButton
            aria-label={`Delete ${project.title || "project"}`}
            size="sm"
            variant="outline"
            colorPalette="red"
            onClick={() => {
              if (
                window.confirm(
                  `Remove "${project.title || project.slug}"? This is only saved when you press Save changes.`,
                )
              ) {
                onRemove();
              }
            }}
          >
            <LuTrash2 />
          </IconButton>
        </HStack>
      </Flex>

      {open && (
        <Stack
          gap={5}
          px={4}
          pb={5}
          borderTopWidth="1px"
          borderColor={{ base: "gray.100", _dark: "whiteAlpha.100" }}
          pt={5}
        >
          <TextField
            label="Title"
            value={project.title}
            onChange={(value) => patch({ title: value })}
            required
          />
          <TextField
            label="Slug"
            value={project.slug}
            onChange={(value) => patch({ slug: value })}
            helper="Used in the URL: /projects/<slug>/. Lowercase letters, numbers and dashes."
            required
          />
          <TextAreaField
            label="Summary"
            value={project.summary}
            onChange={(value) => patch({ summary: value })}
            rows={3}
            helper="Shown on cards and in the home page carousel."
          />
          <TextField
            label="Tags"
            value={project.tags.join(", ")}
            onChange={(value) =>
              patch({
                tags: value
                  .split(",")
                  .map((tag) => tag.trim())
                  .filter((tag) => tag.length > 0),
              })
            }
            helper="Comma separated."
          />

          <Stack gap={2}>
            <TextField
              label="Image"
              value={project.image}
              onChange={(value) => patch({ image: value })}
              placeholder="/uploads/my-photo.png or https://…"
              helper="Paste a URL, or upload a PNG / JPEG / GIF / WebP."
            />
            <HStack gap={3}>
              <Button
                size="sm"
                variant="outline"
                loading={uploading}
                onClick={() => fileInput.current?.click()}
              >
                <LuUpload /> Upload image
              </Button>
              {project.image && (
                <Box
                  w="64px"
                  h="40px"
                  borderRadius="md"
                  borderWidth="1px"
                  borderColor={{ base: "gray.200", _dark: "whiteAlpha.200" }}
                  bgImage={`url(${project.image})`}
                  bgSize="cover"
                  bgPos="center"
                />
              )}
            </HStack>
            <Input
              ref={fileInput}
              type="file"
              accept="image/png,image/jpeg,image/gif,image/webp"
              display="none"
              onChange={(event) => handleImage(event.target.files?.[0])}
            />
          </Stack>

          <TextField
            label="External URL"
            value={project.externalUrl}
            onChange={(value) => patch({ externalUrl: value })}
            placeholder="https://example.com/write-up"
            helper="Set this and the project links straight out to that site instead of getting its own page."
          />

          <TextAreaField
            label="Write-up"
            value={project.body.join("\n\n")}
            onChange={(value) =>
              patch({
                body: value
                  .split(/\n{2,}/)
                  .map((paragraph) => paragraph.trim())
                  .filter((paragraph) => paragraph.length > 0),
              })
            }
            rows={8}
            helper="One blank line between paragraphs. Only used when there is no external URL."
          />

          <LinkListEditor
            label="Extra links"
            links={project.links}
            onChange={(links) => patch({ links })}
          />

          <HStack gap={6} wrap="wrap">
            <Switch.Root
              checked={project.published}
              onCheckedChange={(event) => patch({ published: event.checked })}
            >
              <Switch.HiddenInput />
              <Switch.Control />
              <Switch.Label>Published</Switch.Label>
            </Switch.Root>
            <Switch.Root
              checked={project.featured}
              onCheckedChange={(event) => patch({ featured: event.checked })}
            >
              <Switch.HiddenInput />
              <Switch.Control />
              <Switch.Label>Show in carousel</Switch.Label>
            </Switch.Root>
          </HStack>
        </Stack>
      )}
    </Box>
  );
}
