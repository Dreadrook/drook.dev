"use client";

import React, { useState, useEffect } from "react";
import { Flex, Box, Heading, Text, VStack, Container, AbsoluteCenter, Link, HStack, Spacer, MenuRoot, MenuContent, MenuItem, Button, MenuTrigger } from "@chakra-ui/react";
import NextLink from "next/link";

const projects = [
  { 
    title: "Team 17097 Protostars", 
    desc: "Team Captain heading the FIRST Robotics team 17097", 
    href: "/projects/pstars",
    //color: "blue.600"
    image: "https://res.cloudinary.com/df4r30cga/image/upload/v1767670164/pebble.jpg"
  },
  { 
    title: "Stratospore", 
    desc: "Helped send some algae to the edge of space with a weather balloon. Huge credit to radi8 who basically did the whole thing :)", 
    href: "https://radi8.dev/blog/stratospore/",
    image: "https://radi8.dev/static/media/earth.webp"
  },
  { 
    title: "Hamilton-Dashboard", 
    desc: "EnviroDIY Mayfly stream monitoring dashboard using the Python Shiny Framework", 
    href: "https://kf2consulting.shinyapps.io/hamilton-dashboard/",
    image: "https://res.cloudinary.com/df4r30cga/image/upload/v1767670605/hamilton-dash_urklwf.png"
  },
  /*
  { 
    title: "Homelab", 
    desc: "Many hours tinkering with old enterprise hardware has left me with more than a few network appliances...", 
    href: "/projects/homelab",
    image: "https://res.cloudinary.com/df4r30cga/image/upload/v1767670605/hamilton-dash_urklwf.png"
  },
  */
];

const Navbar = () => (
  <Box 
    as="nav" 
    position="fixed" 
    top="0" 
    w="full" 
    zIndex="overlay" 
    px={8} 
    py={4} 
    backdropFilter="blur(10px)" 
    bg="blackAlpha.600"
    borderBottom="1px solid"
    borderColor="whiteAlpha.200"
  >
    <Flex align="center" maxW="full">
      <Heading size="md" color="white" letterSpacing="widest">
        SF
      </Heading>
      <Spacer />
      <HStack gap={8}>
        {
          <><><Link href="/" color="white">
            Home
          </Link><MenuRoot>
              <MenuTrigger asChild>
                <Button
                  variant="ghost"
                  color="whiteAlpha.900"
                  fontSize="sm"
                  fontWeight="medium"
                  h="auto"
                  p={0}
                  _hover={{ color: "blue.400", bg: "transparent" }}
                >
                  Projects
                </Button>
              </MenuTrigger>
              <MenuContent bg="gray.900" borderColor="whiteAlpha.200">
                {projects.map((project) => (
                  <MenuItem
                    key={project.title}
                    value={project.title}
                    _hover={{ bg: "blue.600", color: "white" }}
                    p={0}
                  >
                    <Link
                      asChild
                      w="full"
                      px={4}
                      py={2}
                      _hover={{ textDecoration: "none" }}
                    >
                      <NextLink href={project.href}>
                        {project.title}
                      </NextLink>
                    </Link>
                  </MenuItem>
                ))}
              </MenuContent>
            </MenuRoot></>
            <Link
              href="/resume.pdf"
              target="_blank"
              rel="noopener noreferrer"
              color="whiteAlpha.900"
              fontSize="sm"
              fontWeight="medium"
              _hover={{ color: "blue.400", textDecoration: "none" }}
            >
              Resume
            </Link></>
        }
      </HStack>
    </Flex>
  </Box>
);

export default function About() {
  const [index, setIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (isHovered) return;

    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % projects.length);
    }, 3500);
    
    return () => clearInterval(timer);
  }, [isHovered]);

  return (
    <Box>
      <Navbar />
    
    <Flex direction={{ base: "column", md: "row" }} h="100vh" w="full">
      
     <Box flex="1.2" position="relative" bg="black" overflow="hidden">
  {projects.map((p, i) => (
    <Box
      key={i}
      position="absolute"
      inset="0"
      opacity={index === i ? 1 : 0}
      zIndex={index === i ? 1 : 0}
      transition="opacity 0.8s ease-in-out"
      bgImage={`linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.7)), url(${p.image})`}
      bgSize="cover"
    >
      {
      }
      <Link asChild variant="plain" display="block" h="full" w="full" _hover={{ textDecoration: "none" }}>
        <NextLink href={p.href}>
          <Box 
            h="full" 
            w="full" 
            display="flex" 
            alignItems="center" 
            justifyContent="center"
            _hover={{ "& .project-content": { transform: "scale(1.05)" } }}
          >
            <AbsoluteCenter axis="both" w="full">
              <VStack 
                className="project-content" 
                gap={3} 
                px={10} 
                textAlign="center" 
                transition="transform 0.4s ease-out"
              >
                <Heading size="4xl" color="white" fontWeight="bold">
                  {p.title}
                </Heading>
                <Text fontSize="xl" color="whiteAlpha.800" maxW="md">
                  {p.desc}
                </Text>
                <Box 
                  mt={4} 
                  px={4} 
                  py={1} 
                  border="1px solid" 
                  borderColor="whiteAlpha.400" 
                  color="white" 
                  fontSize="xs" 
                  fontWeight="bold"
                  borderRadius="sm"
                >
                  VIEW PROJECT
                </Box>
              </VStack>
            </AbsoluteCenter>
          </Box>
        </NextLink>
      </Link>
    </Box>
  ))}
</Box>
      {/* RIGHT SIDE: ABOUT ME */}
      <Flex 
        flex="1" 
        bg={{ base: "white", _dark: "gray.950" }} 
        align="center" 
        justify="center" 
        p={12}
      >
        <VStack align="start" gap={6} maxW="md">
          <Heading size="3xl" color={{ base: "gray.900", _dark: "white" }}>
            About Me -- Sam Flynn
          </Heading>
          
          <Text fontSize="lg" color={{ base: "gray.600", _dark: "gray.400" }}>
            I'm a curious, creative, and passionate contributer to projects ranging from open source to homelab development and competitive robotics.
          </Text>

          <Box>
            <Text fontWeight="bold" color="blue.500">
              LOCATION
            </Text>
            <Text color={{ base: "gray.600", _dark: "gray.400" }}>
              Montana, USA
            </Text>
          </Box>
           <Box>
            <Text fontWeight="bold" color="blue.500">
              GET IN TOUCH
            </Text>
            <Text color={{ base: "gray.600", _dark: "gray.400" }}>
              sammichaelflynn@gmail.com <br/>
              (406) 410-0101
            </Text>
          </Box>
        </VStack>
      </Flex>

    </Flex>
    </Box>
  );
}