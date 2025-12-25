import { NavLink } from 'react-router'
import { useColorMode } from '../components/ui/color-mode'
import { LuMoon, LuSun } from "react-icons/lu"
import { Box, Container, HStack, IconButton } from '@chakra-ui/react'

const NavBarDashboard = () => {
  const { toggleColorMode, colorMode } = useColorMode()
  
  return (
    <Container maxW={'1100px'} p={"10px"}>
        <HStack w={"100%"} justifyContent={"space-between"} p={"10px"} fontWeight={"bold"} fontSize={"18px"}>
            <NavLink to={"home"}>Home</NavLink>
            <NavLink to={"community"}>Community</NavLink>
            <IconButton onClick={toggleColorMode} variant="outline" size="sm">
                {colorMode === "light" ? <LuSun /> : <LuMoon />}
            </IconButton>
        </HStack>
    </Container>
  )
}

export default NavBarDashboard