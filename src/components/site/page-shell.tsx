import { Box, Container } from "@chakra-ui/react";
import { Navbar } from "@/components/site/navbar";
import { NAV_HEIGHT } from "@/lib/layout";

/**
 * Standard chrome for every page except the home hero: fixed navbar plus a
 * centred column that clears it.
 */
export function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <Box
        as="main"
        minH="100dvh"
        pt={`calc(${NAV_HEIGHT} + 2rem)`}
        pb={{ base: 12, md: 20 }}
        bg={{ base: "gray.50", _dark: "gray.950" }}
      >
        <Container maxW="6xl" px={{ base: 4, md: 8 }}>
          {children}
        </Container>
      </Box>
    </>
  );
}
