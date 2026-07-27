import NextLink from "next/link";
import { Box, Button, Flex, HStack, Heading, Link, Stack, Text } from "@chakra-ui/react";
import { LuArrowUpRight, LuFileText } from "react-icons/lu";
import { site } from "@/lib/content";
import { NAV_HEIGHT } from "@/components/site/navbar";

export function AboutPanel() {
  const { profile, contact, resume } = site;

  return (
    <Flex
      as="section"
      aria-label="About and contact"
      id="contact"
      flex={{ md: "1" }}
      bg={{ base: "white", _dark: "gray.950" }}
      align="center"
      justify="center"
      px={{ base: 6, md: 10, lg: 12 }}
      py={{ base: 12, md: 16 }}
      // Anchor links from the fixed navbar shouldn't land under it.
      scrollMarginTop={NAV_HEIGHT}
    >
      <Stack align="start" gap={{ base: 5, md: 6 }} maxW="lg" w="full">
        <Box>
          <Heading
            size={{ base: "2xl", md: "3xl" }}
            color={{ base: "gray.900", _dark: "white" }}
            textWrap="balance"
          >
            About Me — {profile.name}
          </Heading>
          {profile.tagline && (
            <Text mt={2} fontSize="sm" color="blue.500" fontWeight="medium">
              {profile.tagline}
            </Text>
          )}
        </Box>

        <Text
          fontSize={{ base: "md", md: "lg" }}
          color={{ base: "gray.600", _dark: "gray.400" }}
          textWrap="pretty"
        >
          {profile.bio}
        </Text>

        <Box>
          <Label>Location</Label>
          <Text color={{ base: "gray.600", _dark: "gray.400" }}>
            {profile.location}
          </Text>
        </Box>

        <Box>
          <Label>Get in touch</Label>
          <Stack gap={1} align="start">
            {contact.email && (
              <Link
                href={`mailto:${contact.email}`}
                color={{ base: "gray.700", _dark: "gray.300" }}
                _hover={{ color: "blue.500" }}
                wordBreak="break-all"
              >
                {contact.email}
              </Link>
            )}
            {contact.phone && (
              <Link
                href={`tel:${contact.phone.replace(/[^\d+]/g, "")}`}
                color={{ base: "gray.700", _dark: "gray.300" }}
                _hover={{ color: "blue.500" }}
              >
                {contact.phone}
              </Link>
            )}
          </Stack>
        </Box>

        {contact.links.length > 0 && (
          <HStack gap={4} wrap="wrap">
            {contact.links.map((link) => (
              <Link
                key={link.url}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                color={{ base: "gray.700", _dark: "gray.300" }}
                fontWeight="medium"
                _hover={{ color: "blue.500" }}
              >
                {link.label}
                <LuArrowUpRight aria-hidden />
              </Link>
            ))}
          </HStack>
        )}

        <HStack gap={3} wrap="wrap" w="full">
          <Button asChild colorPalette="blue" size={{ base: "sm", md: "md" }}>
            <a href={resume.file} target="_blank" rel="noopener noreferrer">
              <LuFileText aria-hidden />
              {resume.label}
            </a>
          </Button>
          <Button asChild variant="outline" size={{ base: "sm", md: "md" }}>
            <NextLink href="/projects/">All projects</NextLink>
          </Button>
        </HStack>
      </Stack>
    </Flex>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <Text
      fontWeight="bold"
      fontSize="xs"
      letterSpacing="wider"
      textTransform="uppercase"
      color="blue.500"
      mb={1}
    >
      {children}
    </Text>
  );
}
