"use client";

import React, { useState, useEffect } from "react";
import { Flex, Box, Heading, Text, VStack, Container, AbsoluteCenter } from "@chakra-ui/react";
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

export default function About() {
  const [index, setIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  // Auto-scroll logic: Only runs if the user isn't hovering over the project
  useEffect(() => {
    if (isHovered) return;

    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % projects.length);
    }, 3500);
    
    return () => clearInterval(timer);
  }, [isHovered]);

  return (
    <Flex direction={{ base: "column", md: "row" }} h="100vh" w="full">
      
     <Box flex="1.2" position="relative" bg="black" overflow="hidden">
        {projects.map((p, i) => (
          <Box
            key={i}
            as={NextLink}
            href={p.href}
            position="absolute"
            inset="0"
            opacity={index === i ? 1 : 0}
            zIndex={index === i ? 1 : 0}
            transition="opacity 0.8s ease-in-out"
            // Background Image Logic
            bgImage={`linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.7)), url(${p.image})`}
            bgSize="cover"
            bgPosition="center"
            textDecoration="none"
            _hover={{ 
               textDecoration: "none",
               "& .project-content": { transform: "scale(1.05)" } 
            }}
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
        ))}
      </Box>

      {/* RIGHT SIDE: ABOUT ME */}
      <Flex 
        flex="1" 
        // In Chakra v3, we use this syntax for light/dark colors:
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
  );
}