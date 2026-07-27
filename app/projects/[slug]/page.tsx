import type { Metadata } from "next";
import NextLink from "next/link";
import { notFound } from "next/navigation";
import {
  Box,
  Button,
  Flex,
  Heading,
  Link,
  Stack,
  Text,
} from "@chakra-ui/react";
import { LuArrowLeft, LuArrowUpRight } from "react-icons/lu";
import { PageShell } from "@/components/site/page-shell";
import { findProject, internalProjects } from "@/lib/content";

type Params = { slug: string };

export function generateStaticParams(): Params[] {
  return internalProjects().map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = findProject(slug);
  if (!project) return { title: "Project not found" };

  return {
    title: project.title,
    description: project.summary,
    openGraph: {
      title: project.title,
      description: project.summary,
      images: project.image ? [project.image] : undefined,
    },
  };
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const project = findProject(slug);
  if (!project) notFound();

  return (
    <PageShell>
      <Stack gap={{ base: 6, md: 8 }}>
        <Link
          asChild
          alignSelf="start"
          fontSize="sm"
          color="blue.500"
          _hover={{ textDecoration: "none", color: "blue.400" }}
        >
          <NextLink href="/projects/">
            <LuArrowLeft aria-hidden />
            All projects
          </NextLink>
        </Link>

        {project.image && (
          <Box
            h={{ base: "180px", md: "300px" }}
            borderRadius="lg"
            bgImage={`linear-gradient(rgba(0,0,0,0.2), rgba(0,0,0,0.55)), url(${project.image})`}
            bgSize="cover"
            bgPos="center"
          />
        )}

        <Stack gap={3}>
          <Heading size={{ base: "2xl", md: "3xl" }} textWrap="balance">
            {project.title}
          </Heading>
          <Text
            fontSize={{ base: "md", md: "lg" }}
            color={{ base: "gray.600", _dark: "gray.400" }}
            textWrap="pretty"
          >
            {project.summary}
          </Text>
          {project.tags.length > 0 && (
            <Flex wrap="wrap" gap={2}>
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

        {project.body.length > 0 && (
          <Stack gap={4} maxW="3xl">
            {project.body.map((paragraph, i) => (
              <Text
                key={i}
                fontSize={{ base: "md", md: "lg" }}
                lineHeight="tall"
                color={{ base: "gray.700", _dark: "gray.300" }}
                textWrap="pretty"
              >
                {paragraph}
              </Text>
            ))}
          </Stack>
        )}

        {project.links.length > 0 && (
          <Flex wrap="wrap" gap={3}>
            {project.links.map((link) => (
              <Button
                key={link.url}
                asChild
                variant="outline"
                size={{ base: "sm", md: "md" }}
              >
                <a href={link.url} target="_blank" rel="noopener noreferrer">
                  {link.label}
                  <LuArrowUpRight aria-hidden />
                </a>
              </Button>
            ))}
          </Flex>
        )}
      </Stack>
    </PageShell>
  );
}
