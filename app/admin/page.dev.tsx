"use client";

/**
 * Dev-only admin panel.
 *
 * This file is named `page.dev.tsx` on purpose: `pageExtensions` in
 * next.config.ts only registers `*.dev.tsx` as routes when NODE_ENV is not
 * production, so `next build` (the static export deployed to Azure) contains
 * no /admin route and no write API at all.
 *
 * Run `npm run admin:password` once, then `npm run dev` and open /admin.
 */

import { useCallback, useEffect, useState } from "react";
import NextLink from "next/link";
import {
  Alert,
  Box,
  Center,
  Code,
  Container,
  Flex,
  Heading,
  Link,
  List,
  Spinner,
  Stack,
  Text,
} from "@chakra-ui/react";
import type { SiteContent } from "@/lib/content";
import {
  AdminApiError,
  getContent,
  getSession,
  type SessionState,
} from "@/components/admin/api";
import { LoginForm } from "@/components/admin/login-form";
import { ContentEditor } from "@/components/admin/content-editor";

type Status = "loading" | "ready" | "error";

export default function AdminPage() {
  const [status, setStatus] = useState<Status>("loading");
  const [session, setSession] = useState<SessionState | null>(null);
  const [content, setContent] = useState<SiteContent | null>(null);
  const [error, setError] = useState("");
  const [issues, setIssues] = useState<string[]>([]);

  const [reloadKey, setReloadKey] = useState(0);

  /** Re-fetch session + content. Safe to call from event handlers. */
  const reload = useCallback(() => {
    setStatus("loading");
    setError("");
    setIssues([]);
    setReloadKey((key) => key + 1);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const nextSession = await getSession();
        if (cancelled) return;
        setSession(nextSession);

        if (nextSession.authenticated) {
          const { content: loaded } = await getContent();
          if (cancelled) return;
          setContent(loaded);
        } else {
          setContent(null);
        }
        setStatus("ready");
      } catch (cause) {
        if (cancelled) return;
        if (cause instanceof AdminApiError) {
          setError(cause.message);
          setIssues(cause.issues);
        } else {
          setError("Could not reach the admin API. Is the dev server running?");
        }
        setStatus("error");
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  return (
    <Box minH="100dvh" bg={{ base: "gray.50", _dark: "gray.950" }} py={{ base: 6, md: 10 }}>
      <Container maxW="4xl" px={{ base: 4, md: 6 }}>
        <Flex justify="space-between" align="center" gap={4} mb={6} wrap="wrap">
          <Heading size="md" letterSpacing="wide">
            drook.dev admin
          </Heading>
          <Link asChild fontSize="sm" color="blue.500">
            <NextLink href="/">View site →</NextLink>
          </Link>
        </Flex>

        {status === "loading" && (
          <Center py={20}>
            <Spinner size="lg" />
          </Center>
        )}

        {status === "error" && (
          <Alert.Root status="error">
            <Alert.Indicator />
            <Alert.Content>
              <Alert.Title>{error}</Alert.Title>
              {issues.length > 0 && (
                <Alert.Description>
                  <Stack gap={1} pt={1}>
                    {issues.map((issue) => (
                      <Text key={issue} fontSize="sm">
                        • {issue}
                      </Text>
                    ))}
                  </Stack>
                </Alert.Description>
              )}
            </Alert.Content>
          </Alert.Root>
        )}

        {status === "ready" && session && !session.configured && <SetupInstructions />}

        {status === "ready" && session?.configured && !session.authenticated && (
          <Center py={{ base: 4, md: 10 }}>
            <LoginForm onSignedIn={reload} />
          </Center>
        )}

        {status === "ready" && session?.authenticated && content && (
          <ContentEditor
            initial={content}
            username={session.username ?? null}
            onSignedOut={reload}
          />
        )}
      </Container>
    </Box>
  );
}

function SetupInstructions() {
  return (
    <Stack
      gap={4}
      p={{ base: 5, md: 6 }}
      borderWidth="1px"
      borderColor={{ base: "gray.200", _dark: "whiteAlpha.200" }}
      borderRadius="lg"
      bg={{ base: "white", _dark: "gray.900" }}
    >
      <Heading size="lg">Set an admin password first</Heading>
      <Text color={{ base: "gray.600", _dark: "gray.400" }}>
        No credentials are configured yet, so sign-in is disabled. Run this once:
      </Text>
      <Code p={3} borderRadius="md" display="block" whiteSpace="pre">
        npm run admin:password
      </Code>
      <List.Root gap={1} ps={5} color={{ base: "gray.600", _dark: "gray.400" }}>
        <List.Item>
          It writes <Code>ADMIN_PASSWORD_HASH</Code> and{" "}
          <Code>ADMIN_SESSION_SECRET</Code> to <Code>.env.local</Code>, which is
          git-ignored.
        </List.Item>
        <List.Item>Restart the dev server so the new values are picked up.</List.Item>
        <List.Item>
          Nothing here is deployed — <Code>next build</Code> excludes the admin
          routes entirely.
        </List.Item>
      </List.Root>
    </Stack>
  );
}
