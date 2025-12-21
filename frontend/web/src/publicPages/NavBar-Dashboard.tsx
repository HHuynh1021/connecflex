import { NavLink } from 'react-router'
import { useColorMode } from '../components/ui/color-mode'
import { LuMoon, LuSun } from "react-icons/lu"
import { Box, HStack, IconButton } from '@chakra-ui/react'

const NavBarDashboard = () => {
  const { toggleColorMode, colorMode } = useColorMode()
  
  return (
    <Box>
        <HStack w={"100%"} justifyContent={"space-evenly"} p={"10px"}>
            <NavLink to={"home"}>Home</NavLink>
            <NavLink to={"community"}>Community</NavLink>
            <IconButton onClick={toggleColorMode} variant="outline" size="sm">
                {colorMode === "light" ? <LuSun /> : <LuMoon />}
            </IconButton>
        </HStack>
    </Box>
  )
}

export default NavBarDashboard