"use client";

import { useState } from "react";
import NextLink from "next/link";
import { usePathname } from "next/navigation";
import {
  Box,
  Button,
  Flex,
  HStack,
  Heading,
  IconButton,
  Link,
  Menu,
  Portal,
  Separator,
  Spacer,
  Stack,
  Text,
} from "@chakra-ui/react";
import { LuChevronDown, LuMenu, LuX } from "react-icons/lu";
import { ColorModeButton } from "@/components/ui/color-mode";
import { isExternal, projectHref, publishedProjects, site } from "@/lib/content";

/** Height of the fixed navbar. Pages that aren't the hero offset by this. */
export const NAV_HEIGHT = "64px";

const projects = publishedProjects();

/** Applied to any link that leaves the site (or opens the resume PDF). */
const EXTERNAL_LINK_PROPS = { target: "_blank", rel: "noopener noreferrer" };

export function Navbar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <Box
      as="nav"
      position="fixed"
      top="0"
      left="0"
      right="0"
      zIndex="banner"
      backdropFilter="blur(12px)"
      bg="blackAlpha.700"
      borderBottom="1px solid"
      borderColor="whiteAlpha.200"
    >
      <Flex
        align="center"
        h={NAV_HEIGHT}
        px={{ base: 4, md: 8 }}
        mx="auto"
        maxW="7xl"
      >
        <Link
          asChild
          color="white"
          _hover={{ textDecoration: "none", color: "blue.300" }}
        >
          <NextLink href="/" aria-label={`${site.profile.name} — home`}>
            <Heading size="md" letterSpacing="widest">
              {site.profile.initials}
            </Heading>
          </NextLink>
        </Link>

        <Spacer />

        {/* Desktop navigation */}
        <HStack gap={7} display={{ base: "none", md: "flex" }}>
          <NavLink href="/" active={isActive("/")}>
            Home
          </NavLink>

          <Menu.Root positioning={{ placement: "bottom-end" }}>
            <Menu.Trigger asChild>
              <Button
                variant="plain"
                h="auto"
                p={0}
                gap={1}
                color={isActive("/projects") ? "blue.300" : "whiteAlpha.900"}
                fontSize="sm"
                fontWeight="medium"
                _hover={{ color: "blue.300" }}
              >
                Projects
                <LuChevronDown aria-hidden />
              </Button>
            </Menu.Trigger>
            <Portal>
              <Menu.Positioner>
                <Menu.Content
                  bg="gray.900"
                  borderColor="whiteAlpha.300"
                  borderWidth="1px"
                  minW="15rem"
                  py={1}
                >
                  <Menu.Item value="all-projects" asChild>
                    <NextLink href="/projects/">All projects</NextLink>
                  </Menu.Item>
                  <Menu.Separator borderColor="whiteAlpha.200" />
                  {projects.map((project) => (
                    <Menu.Item key={project.slug} value={project.slug} asChild>
                      <NextLink
                        href={projectHref(project)}
                        {...(isExternal(project) ? EXTERNAL_LINK_PROPS : {})}
                      >
                        {project.title}
                        {isExternal(project) && (
                          <Text as="span" ms="auto" fontSize="xs" opacity={0.6}>
                            ↗
                          </Text>
                        )}
                      </NextLink>
                    </Menu.Item>
                  ))}
                </Menu.Content>
              </Menu.Positioner>
            </Portal>
          </Menu.Root>

          <NavLink href={site.resume.file} external>
            {site.resume.label}
          </NavLink>
          <NavLink href="/#contact">Contact</NavLink>
          <ColorModeButton color="white" _hover={{ bg: "whiteAlpha.200" }} />
        </HStack>

        {/* Mobile controls */}
        <HStack gap={1} display={{ base: "flex", md: "none" }}>
          <ColorModeButton color="white" _hover={{ bg: "whiteAlpha.200" }} />
          <IconButton
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="mobile-nav"
            variant="ghost"
            color="white"
            _hover={{ bg: "whiteAlpha.200" }}
            onClick={() => setOpen((prev) => !prev)}
          >
            {open ? <LuX /> : <LuMenu />}
          </IconButton>
        </HStack>
      </Flex>

      {/* Mobile menu panel */}
      <Box
        id="mobile-nav"
        display={{ base: open ? "block" : "none", md: "none" }}
        bg="gray.950"
        borderTop="1px solid"
        borderColor="whiteAlpha.200"
        px={4}
        pb={4}
        maxH="calc(100dvh - 64px)"
        overflowY="auto"
      >
        <Stack gap={0} py={2} onClick={() => setOpen(false)}>
          <MobileLink href="/">Home</MobileLink>
          <MobileLink href="/projects/">All projects</MobileLink>
          <Separator borderColor="whiteAlpha.200" my={2} />
          <Text px={2} pb={1} fontSize="xs" color="whiteAlpha.600" letterSpacing="wider">
            PROJECTS
          </Text>
          {projects.map((project) => (
            <MobileLink
              key={project.slug}
              href={projectHref(project)}
              external={isExternal(project)}
            >
              {project.title}
            </MobileLink>
          ))}
          <Separator borderColor="whiteAlpha.200" my={2} />
          <MobileLink href={site.resume.file} external>
            {site.resume.label}
          </MobileLink>
          <MobileLink href="/#contact">Contact</MobileLink>
        </Stack>
      </Box>
    </Box>
  );
}

function NavLink({
  href,
  children,
  active = false,
  external = false,
}: {
  href: string;
  children: React.ReactNode;
  active?: boolean;
  external?: boolean;
}) {
  return (
    <Link
      asChild
      color={active ? "blue.300" : "whiteAlpha.900"}
      fontSize="sm"
      fontWeight="medium"
      _hover={{ color: "blue.300", textDecoration: "none" }}
    >
      <NextLink href={href} {...(external ? EXTERNAL_LINK_PROPS : {})}>
        {children}
      </NextLink>
    </Link>
  );
}

function MobileLink({
  href,
  children,
  external = false,
}: {
  href: string;
  children: React.ReactNode;
  external?: boolean;
}) {
  return (
    <Link
      asChild
      color="whiteAlpha.900"
      px={2}
      py={3}
      fontSize="md"
      fontWeight="medium"
      borderRadius="md"
      _hover={{ bg: "whiteAlpha.200", textDecoration: "none" }}
    >
      <NextLink href={href} {...(external ? EXTERNAL_LINK_PROPS : {})}>
        {children}
      </NextLink>
    </Link>
  );
}
