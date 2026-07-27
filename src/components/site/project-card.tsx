import NextLink from "next/link";
import { Box, Flex, Heading, LinkBox, LinkOverlay, Stack, Text } from "@chakra-ui/react";
import { type Project, isExternal, projectHref } from "@/lib/content";

export function ProjectCard({ project }: { project: Project }) {
  const href = projectHref(project);
  const external = isExternal(project);

  return (
    <LinkBox
      as="article"
      borderWidth="1px"
      borderColor={{ base: "gray.200", _dark: "whiteAlpha.200" }}
      borderRadius="lg"
      overflow="hidden"
      bg={{ base: "white", _dark: "gray.900" }}
      transition="transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease"
      _hover={{
        transform: "translateY(-4px)",
        boxShadow: "lg",
        borderColor: "blue.400",
      }}
    >
      <Box
        h={{ base: "160px", md: "180px" }}
        bgImage={
          project.image
            ? `linear-gradient(rgba(0,0,0,0.25), rgba(0,0,0,0.55)), url(${project.image})`
            : "linear-gradient(160deg, #0b1220, #1e293b)"
        }
        bgSize="cover"
        bgPos="center"
      />
      <Stack gap={2} p={{ base: 4, md: 5 }}>
        <Heading size="md" color={{ base: "gray.900", _dark: "white" }}>
          <LinkOverlay
            asChild
            _hover={{ textDecoration: "none", color: "blue.500" }}
          >
            <NextLink
              href={href}
              {...(external
                ? { target: "_blank", rel: "noopener noreferrer" }
                : {})}
            >
              {project.title}
              {external && " ↗"}
            </NextLink>
          </LinkOverlay>
        </Heading>
        <Text
          fontSize="sm"
          color={{ base: "gray.600", _dark: "gray.400" }}
          textWrap="pretty"
        >
          {project.summary}
        </Text>
        {project.tags.length > 0 && (
          <Flex wrap="wrap" gap={2} pt={1}>
            {project.tags.map((tag) => (
              <Text
                key={tag}
                px={2}
                py={0.5}
                fontSize="xs"
                borderRadius="full"
                borderWidth="1px"
                borderColor={{ base: "gray.200", _dark: "whiteAlpha.300" }}
                color={{ base: "gray.600", _dark: "gray.400" }}
              >
                {tag}
              </Text>
            ))}
          </Flex>
        )}
      </Stack>
    </LinkBox>
  );
}
