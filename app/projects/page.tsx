import type { Metadata } from "next";
import { Heading, SimpleGrid, Stack, Text } from "@chakra-ui/react";
import { PageShell } from "@/components/site/page-shell";
import { ProjectCard } from "@/components/site/project-card";
import { publishedProjects, site } from "@/lib/content";

export const metadata: Metadata = {
  title: "Projects",
  description: `Projects by ${site.profile.name} — robotics, homelab, and open source work.`,
};

export default function ProjectsPage() {
  const projects = publishedProjects();

  return (
    <PageShell>
      <Stack gap={{ base: 8, md: 10 }}>
        <Stack gap={2}>
          <Heading size={{ base: "2xl", md: "3xl" }}>Projects</Heading>
          <Text color={{ base: "gray.600", _dark: "gray.400" }} maxW="2xl">
            Things I have built, led, or helped with. Links marked ↗ open on
            another site.
          </Text>
        </Stack>

        {projects.length === 0 ? (
          <Text color={{ base: "gray.600", _dark: "gray.400" }}>
            Nothing published yet — check back soon.
          </Text>
        ) : (
          <SimpleGrid columns={{ base: 1, sm: 2, lg: 3 }} gap={{ base: 5, md: 6 }}>
            {projects.map((project) => (
              <ProjectCard key={project.slug} project={project} />
            ))}
          </SimpleGrid>
        )}
      </Stack>
    </PageShell>
  );
}
