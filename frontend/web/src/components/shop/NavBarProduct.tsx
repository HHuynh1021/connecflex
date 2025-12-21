import { NavLink } from 'react-router'
import { useColorMode } from '../ui/color-mode'
import { LuMoon, LuSun } from "react-icons/lu"
import { Avatar, Box, HStack, IconButton, Image, Text } from '@chakra-ui/react'

interface NavBarShopProps {
  logo: string
  name: string
}

const NavBarProduct: React.FC<NavBarShopProps> = ({logo, name}) => {
  const { toggleColorMode, colorMode } = useColorMode()
  
  return (
    <Box>
        <HStack w={"100%"} justifyContent={"space-between"} fontSize={"18px"} fontWeight={"bold"} p={"10px"}>
            <HStack gap={"10px"}>
              <Avatar.Root size={"2xl"}>
                <Avatar.Image src={logo}/>
              </Avatar.Root>
              <Text>{name}</Text>
            </HStack>
            <NavLink to={"/"}>Shops</NavLink>
            <NavLink to={"community"}>Community</NavLink>
            <IconButton onClick={toggleColorMode} variant="outline" size="sm">
                {colorMode === "light" ? <LuSun /> : <LuMoon />}
            </IconButton>
        </HStack>
    </Box>
  )
}

export default NavBarProduct