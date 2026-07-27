import NextLink from "next/link";
import { Button, Flex, Heading, Stack, Text } from "@chakra-ui/react";
import { PageShell } from "@/components/site/page-shell";

export default function NotFound() {
  return (
    <PageShell>
      <Stack gap={5} py={{ base: 8, md: 16 }} align="start" maxW="xl">
        <Text fontSize="sm" fontWeight="bold" color="blue.500" letterSpacing="wider">
          404
        </Text>
        <Heading size={{ base: "2xl", md: "3xl" }}>Page not found</Heading>
        <Text color={{ base: "gray.600", _dark: "gray.400" }}>
          That page either moved or never existed. Try the project list instead.
        </Text>
        <Flex gap={3} wrap="wrap">
          <Button asChild colorPalette="blue">
            <NextLink href="/">Go home</NextLink>
          </Button>
          <Button asChild variant="outline">
            <NextLink href="/projects/">All projects</NextLink>
          </Button>
        </Flex>
      </Stack>
    </PageShell>
  );
}
