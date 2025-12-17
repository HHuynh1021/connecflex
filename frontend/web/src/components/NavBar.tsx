import React from 'react'
import { Link, NavLink } from 'react-router'
import { useColorMode } from './ui/color-mode'
import { LuMoon, LuSun } from "react-icons/lu"
import { Box, HStack, IconButton } from '@chakra-ui/react'

const NavBar = () => {
    const { toggleColorMode, colorMode } = useColorMode()
  return (
    <Box>
        <HStack justifyContent={"space-evenly"}>
            <NavLink to={"home"}>Home</NavLink>
            <NavLink to={"shopadmin"}>Shop Management</NavLink>
            <IconButton onClick={toggleColorMode} variant="outline" size="sm">
                {colorMode === "light" ? <LuSun /> : <LuMoon />}
            </IconButton>
        </HStack>
    </Box>
  )
}

export default NavBar