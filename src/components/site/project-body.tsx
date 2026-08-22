import {
  Box,
  Heading,
  Image,
  Link,
  SimpleGrid,
  Stack,
  Text,
} from "@chakra-ui/react";
import type { Credit, Figure, Project, Stat } from "@/lib/content";

/**
 * The long-form half of a project page: headline numbers, an attribution note,
 * intro paragraphs, then headed sections with captioned figures.
 *
 * Everything past `body` is optional. A project that only sets `body` renders
 * exactly what it did before these fields existed.
 */
export function ProjectBody({ project }: { project: Project }) {
  const { body, stats = [], credit, sections = [] } = project;

  return (
    <Stack gap={{ base: 8, md: 10 }}>
      {stats.length > 0 && <StatRow stats={stats} />}
      {credit && <CreditNote credit={credit} />}

      {body.length > 0 && <Paragraphs paragraphs={body} lead />}

      {sections.map((section) => (
        <Stack as="section" key={section.heading} gap={4}>
          <Heading as="h2" size={{ base: "lg", md: "xl" }} textWrap="balance">
            {section.heading}
          </Heading>
          {section.body.length > 0 && <Paragraphs paragraphs={section.body} />}
          {section.figures.map((figure) => (
            <FigureBlock key={figure.src} figure={figure} />
          ))}
        </Stack>
      ))}
    </Stack>
  );
}

/** Body copy is capped at a readable measure; figures are allowed to be wider. */
const PROSE_WIDTH = "3xl";

function Paragraphs({
  paragraphs,
  lead = false,
}: {
  paragraphs: string[];
  lead?: boolean;
}) {
  return (
    <Stack gap={4} maxW={PROSE_WIDTH}>
      {paragraphs.map((paragraph, i) => (
        <Text
          key={i}
          fontSize={{ base: "md", md: lead ? "lg" : "md" }}
          lineHeight="tall"
          color={{ base: "gray.700", _dark: "gray.300" }}
          textWrap="pretty"
        >
          {paragraph}
        </Text>
      ))}
    </Stack>
  );
}

function StatRow({ stats }: { stats: Stat[] }) {
  return (
    <SimpleGrid columns={{ base: 2, md: 4 }} gap={{ base: 4, md: 6 }}>
      {stats.map((stat) => (
        <Stack
          key={stat.label}
          gap={0.5}
          borderLeftWidth="2px"
          borderColor="blue.400"
          pl={3}
        >
          <Text
            fontSize={{ base: "xl", md: "2xl" }}
            fontWeight="semibold"
            fontVariantNumeric="tabular-nums"
            color={{ base: "gray.900", _dark: "white" }}
          >
            {stat.value}
          </Text>
          <Text
            fontSize="xs"
            textTransform="uppercase"
            letterSpacing="wide"
            color={{ base: "gray.600", _dark: "gray.400" }}
          >
            {stat.label}
          </Text>
        </Stack>
      ))}
    </SimpleGrid>
  );
}

function CreditNote({ credit }: { credit: Credit }) {
  return (
    <Box
      as="aside"
      maxW={PROSE_WIDTH}
      borderWidth="1px"
      borderColor={{ base: "gray.200", _dark: "whiteAlpha.200" }}
      borderLeftWidth="3px"
      borderLeftColor="blue.400"
      borderRadius="md"
      bg={{ base: "white", _dark: "whiteAlpha.50" }}
      px={{ base: 4, md: 5 }}
      py={4}
    >
      <Text
        fontSize="sm"
        lineHeight="tall"
        color={{ base: "gray.700", _dark: "gray.300" }}
        textWrap="pretty"
      >
        {credit.text}
      </Text>
      {credit.links.length > 0 && (
        <Text fontSize="sm" mt={2}>
          {credit.links.map((link, i) => (
            <span key={link.url}>
              {i > 0 && " · "}
              <Link
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                color="blue.500"
              >
                {link.label}
              </Link>
            </span>
          ))}
        </Text>
      )}
    </Box>
  );
}

function FigureBlock({ figure }: { figure: Figure }) {
  return (
    <Stack as="figure" gap={2} maxW="4xl" pt={2}>
      <Image
        src={figure.src}
        alt={figure.alt}
        loading="lazy"
        w="full"
        h="auto"
        borderRadius="md"
        borderWidth="1px"
        borderColor={{ base: "gray.200", _dark: "whiteAlpha.200" }}
      />
      {figure.caption && (
        <Text
          as="figcaption"
          fontSize="sm"
          lineHeight="tall"
          color={{ base: "gray.600", _dark: "gray.400" }}
          textWrap="pretty"
        >
          {figure.caption}
        </Text>
      )}
    </Stack>
  );
}
