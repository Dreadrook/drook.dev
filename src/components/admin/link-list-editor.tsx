"use client";

import { Button, Flex, IconButton, Input, Stack, Text } from "@chakra-ui/react";
import { LuPlus, LuTrash2 } from "react-icons/lu";
import type { SiteLink } from "@/lib/content";

type Props = {
  label: string;
  links: SiteLink[];
  onChange: (links: SiteLink[]) => void;
};

export function LinkListEditor({ label, links, onChange }: Props) {
  const update = (index: number, patch: Partial<SiteLink>) => {
    onChange(links.map((link, i) => (i === index ? { ...link, ...patch } : link)));
  };

  return (
    <Stack gap={3}>
      <Text fontWeight="medium" fontSize="sm">
        {label}
      </Text>

      {links.length === 0 && (
        <Text fontSize="sm" color={{ base: "gray.500", _dark: "gray.500" }}>
          None yet.
        </Text>
      )}

      {links.map((link, index) => (
        <Flex key={index} gap={2} direction={{ base: "column", sm: "row" }}>
          <Input
            flex="0 0 auto"
            w={{ base: "full", sm: "9rem" }}
            placeholder="Label"
            value={link.label}
            onChange={(event) => update(index, { label: event.target.value })}
          />
          <Input
            flex="1"
            placeholder="https://example.com"
            value={link.url}
            onChange={(event) => update(index, { url: event.target.value })}
          />
          <IconButton
            aria-label={`Remove ${link.label || "link"}`}
            variant="outline"
            colorPalette="red"
            alignSelf={{ base: "end", sm: "auto" }}
            onClick={() => onChange(links.filter((_, i) => i !== index))}
          >
            <LuTrash2 />
          </IconButton>
        </Flex>
      ))}

      <Button
        variant="outline"
        size="sm"
        alignSelf="start"
        onClick={() => onChange([...links, { label: "", url: "" }])}
      >
        <LuPlus /> Add link
      </Button>
    </Stack>
  );
}
