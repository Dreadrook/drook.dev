"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import NextLink from "next/link";
import {
  Box,
  Flex,
  HStack,
  Heading,
  IconButton,
  Link,
  Text,
  VStack,
  chakra,
} from "@chakra-ui/react";
import { LuChevronLeft, LuChevronRight } from "react-icons/lu";
import { type Project, isExternal, projectHref } from "@/lib/content";
import { NAV_HEIGHT } from "@/components/site/navbar";

const SLIDE_MS = 6000;

/** Styled <button> so the slide indicators keep real button semantics. */
const DotButton = chakra("button");

type Props = {
  projects: Project[];
};

export function ProjectCarousel({ projects }: Props) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const touchStartX = useRef<number | null>(null);

  const count = projects.length;

  const go = useCallback(
    (delta: number) => {
      if (count === 0) return;
      setIndex((prev) => (prev + delta + count) % count);
    },
    [count],
  );

  // Users who ask for less motion get a static first slide they can page manually.
  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReducedMotion(query.matches);
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (paused || reducedMotion || count < 2) return;
    const timer = window.setInterval(() => go(1), SLIDE_MS);
    return () => window.clearInterval(timer);
  }, [paused, reducedMotion, count, go]);

  if (count === 0) {
    return (
      <Flex
        flex={{ md: "1.2" }}
        h={{ base: "40svh", md: "100dvh" }}
        bg="gray.900"
        align="center"
        justify="center"
        px={6}
      >
        <Text color="whiteAlpha.700">No published projects yet.</Text>
      </Flex>
    );
  }

  return (
    <Box
      as="section"
      aria-label="Featured projects"
      position="relative"
      flex={{ md: "1.2" }}
      w="full"
      h={{ base: "72svh", md: "100dvh" }}
      bg="black"
      overflow="hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      onTouchStart={(event) => {
        setPaused(true);
        touchStartX.current = event.touches[0]?.clientX ?? null;
      }}
      onTouchEnd={(event) => {
        const start = touchStartX.current;
        const end = event.changedTouches[0]?.clientX ?? null;
        touchStartX.current = null;
        if (start === null || end === null) return;
        const distance = end - start;
        if (Math.abs(distance) > 50) go(distance < 0 ? 1 : -1);
      }}
    >
      {projects.map((project, i) => {
        const active = i === index;
        const href = projectHref(project);
        const external = isExternal(project);

        return (
          <Box
            key={project.slug}
            position="absolute"
            inset="0"
            opacity={active ? 1 : 0}
            zIndex={active ? 1 : 0}
            pointerEvents={active ? "auto" : "none"}
            aria-hidden={!active}
            transition="opacity 0.8s ease-in-out"
            bgImage={
              project.image
                ? `linear-gradient(rgba(0,0,0,0.35), rgba(0,0,0,0.75)), url(${project.image})`
                : "linear-gradient(160deg, #0b1220, #1e293b)"
            }
            bgSize="cover"
            bgPos="center"
          >
            <Link
              asChild
              variant="plain"
              display="block"
              h="full"
              w="full"
              _hover={{ textDecoration: "none", "& .slide-body": { transform: "scale(1.04)" } }}
              _focusVisible={{ outline: "2px solid", outlineColor: "blue.300", outlineOffset: "-4px" }}
            >
              <NextLink
                href={href}
                {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                tabIndex={active ? 0 : -1}
              >
                <Flex
                  h="full"
                  w="full"
                  align="center"
                  justify="center"
                  pt={NAV_HEIGHT}
                  pb={{ base: 16, md: 20 }}
                  px={{ base: 6, md: 10 }}
                >
                  <VStack
                    className="slide-body"
                    gap={{ base: 3, md: 4 }}
                    maxW="2xl"
                    textAlign="center"
                    transition="transform 0.4s ease-out"
                  >
                    <Heading
                      size={{ base: "2xl", md: "4xl" }}
                      color="white"
                      fontWeight="bold"
                      textWrap="balance"
                    >
                      {project.title}
                    </Heading>
                    <Text
                      fontSize={{ base: "sm", md: "lg" }}
                      color="whiteAlpha.900"
                      maxW="lg"
                      textWrap="pretty"
                    >
                      {project.summary}
                    </Text>
                    {project.tags.length > 0 && (
                      <Flex
                        wrap="wrap"
                        justify="center"
                        gap={2}
                        display={{ base: "none", sm: "flex" }}
                      >
                        {project.tags.map((tag) => (
                          <Text
                            key={tag}
                            px={2}
                            py={0.5}
                            fontSize="xs"
                            color="whiteAlpha.800"
                            border="1px solid"
                            borderColor="whiteAlpha.300"
                            borderRadius="full"
                          >
                            {tag}
                          </Text>
                        ))}
                      </Flex>
                    )}
                    <Box
                      mt={2}
                      px={4}
                      py={1.5}
                      border="1px solid"
                      borderColor="whiteAlpha.500"
                      color="white"
                      fontSize="xs"
                      fontWeight="bold"
                      letterSpacing="wider"
                      borderRadius="sm"
                    >
                      {external ? "VISIT PROJECT ↗" : "VIEW PROJECT"}
                    </Box>
                  </VStack>
                </Flex>
              </NextLink>
            </Link>
          </Box>
        );
      })}

      {count > 1 && (
        <>
          <CarouselArrow side="left" onClick={() => go(-1)} />
          <CarouselArrow side="right" onClick={() => go(1)} />

          <HStack
            position="absolute"
            bottom={{ base: 4, md: 6 }}
            left="50%"
            transform="translateX(-50%)"
            zIndex={2}
            gap={2}
          >
            {projects.map((project, i) => (
              <DotButton
                key={project.slug}
                type="button"
                aria-label={`Show ${project.title}`}
                aria-current={i === index}
                onClick={() => setIndex(i)}
                w={i === index ? "24px" : "8px"}
                h="8px"
                borderRadius="full"
                bg={i === index ? "blue.300" : "whiteAlpha.500"}
                transition="width 0.3s ease, background 0.3s ease"
                _hover={{ bg: i === index ? "blue.200" : "whiteAlpha.700" }}
              />
            ))}
          </HStack>
        </>
      )}
    </Box>
  );
}

function CarouselArrow({
  side,
  onClick,
}: {
  side: "left" | "right";
  onClick: () => void;
}) {
  return (
    <IconButton
      aria-label={side === "left" ? "Previous project" : "Next project"}
      onClick={onClick}
      variant="ghost"
      size="sm"
      position="absolute"
      top="50%"
      transform="translateY(-50%)"
      {...(side === "left" ? { left: 2 } : { right: 2 })}
      zIndex={2}
      color="white"
      bg="blackAlpha.400"
      borderRadius="full"
      _hover={{ bg: "blackAlpha.700" }}
    >
      {side === "left" ? <LuChevronLeft /> : <LuChevronRight />}
    </IconButton>
  );
}
