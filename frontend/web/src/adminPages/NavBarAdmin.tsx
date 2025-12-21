import React from 'react'
import { Link, NavLink, useNavigate } from 'react-router'
import { useDispatch } from 'react-redux'
import { useColorMode } from '../components/ui/color-mode'
import { LuMoon, LuSun } from "react-icons/lu"
import { Box, HStack, IconButton } from '@chakra-ui/react'
import { logout, clearAuth } from "../services/authSlice"
import type { AppDispatch } from "../services/store"
import { Button } from '@chakra-ui/react'

const NavBarAdmin = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch<AppDispatch>();
  const { toggleColorMode, colorMode } = useColorMode()

  const handleLogout = async () => {
    await dispatch(logout());
    dispatch(clearAuth());
    navigate('/login');
  };
  
  return (
    <Box>
        <HStack justifyContent={"space-between"} fontWeight={"bold"} fontSize={"20px"}>
            <NavLink to={"shop-info"}>Shop</NavLink>
            <NavLink to={"shop-product"}>Products</NavLink>
            <HStack gap={"20px"}>
              <Button onClick={handleLogout}>Logout</Button>
              <IconButton onClick={toggleColorMode} variant="outline" size="sm">
                  {colorMode === "light" ? <LuSun /> : <LuMoon />}
              </IconButton>
            </HStack>
        </HStack>
    </Box>
  )
}

export default NavBarAdmin