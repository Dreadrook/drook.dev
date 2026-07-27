"use client";

import { useState } from "react";
import {
  Alert,
  Box,
  Button,
  Heading,
  Stack,
  Text,
} from "@chakra-ui/react";
import { AdminApiError, login } from "@/components/admin/api";
import { TextField } from "@/components/admin/fields";

export function LoginForm({ onSignedIn }: { onSignedIn: () => void }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      await login(username, password);
      setPassword("");
      onSignedIn();
    } catch (cause) {
      setError(
        cause instanceof AdminApiError ? cause.message : "Could not sign in",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <Box
      as="form"
      onSubmit={submit}
      maxW="sm"
      w="full"
      p={{ base: 6, md: 8 }}
      borderWidth="1px"
      borderColor={{ base: "gray.200", _dark: "whiteAlpha.200" }}
      borderRadius="lg"
      bg={{ base: "white", _dark: "gray.900" }}
    >
      <Stack gap={5}>
        <Stack gap={1}>
          <Heading size="lg">Admin sign in</Heading>
          <Text fontSize="sm" color={{ base: "gray.600", _dark: "gray.400" }}>
            Local editor for site content. Changes are written to
            src/content/site.json — commit them to publish.
          </Text>
        </Stack>

        {error && (
          <Alert.Root status="error" size="sm">
            <Alert.Indicator />
            <Alert.Content>
              <Alert.Description>{error}</Alert.Description>
            </Alert.Content>
          </Alert.Root>
        )}

        <TextField
          label="Username"
          value={username}
          onChange={setUsername}
          placeholder="admin"
          autoComplete="username"
          helper="Leave blank to use the default."
        />
        <TextField
          label="Password"
          type="password"
          value={password}
          onChange={setPassword}
          autoComplete="current-password"
          required
        />

        <Button type="submit" colorPalette="blue" loading={busy} w="full">
          Sign in
        </Button>
      </Stack>
    </Box>
  );
}
