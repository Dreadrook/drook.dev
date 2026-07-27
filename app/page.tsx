import { Flex } from "@chakra-ui/react";
import { Navbar } from "@/components/site/navbar";
import { ProjectCarousel } from "@/components/site/project-carousel";
import { AboutPanel } from "@/components/site/about-panel";
import { featuredProjects } from "@/lib/content";

export default function Home() {
  return (
    <>
      <Navbar />
      <Flex
        as="main"
        direction={{ base: "column", md: "row" }}
        minH={{ md: "100dvh" }}
        w="full"
      >
        <ProjectCarousel projects={featuredProjects()} />
        <AboutPanel />
      </Flex>
    </>
  );
}
