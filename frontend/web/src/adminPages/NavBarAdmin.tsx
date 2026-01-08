import {useEffect} from 'react'
import { NavLink, useNavigate } from 'react-router'
import { useColorMode } from '../components/ui/color-mode'
import { LuMoon, LuSun } from "react-icons/lu"
import { Box, HStack, IconButton, Text } from '@chakra-ui/react'
import { Button } from '@chakra-ui/react'

import { logout, clearAuth } from "../services/authSlice"
import { useSelector, useDispatch } from 'react-redux'
import type { AppDispatch } from '@/services/store'
import useAccessToken from '@/services/token'
import { getUserInfo } from '@/services/authSlice'

const NavBarAdmin = () => {
  const { toggleColorMode, colorMode } = useColorMode()
  const Navigate = useNavigate()

  const {user, userInfo} = useSelector((state: any) => state.auth)
  const dispatch = useDispatch<AppDispatch>();

  const handleLogout = async () => {
    await dispatch(logout());
    dispatch(clearAuth());
    Navigate('/shop-management/login');
  };
  useEffect(() => {
      if (!user || !user.access) {
        Navigate("/shop-management/login");
        return;
      }
  
      if (user.access && !userInfo) {
        // console.log('Fetching user info with token:', user.access.substring(0, 20) + '...');
        dispatch(getUserInfo());
      }
    }, [user, userInfo, Navigate, dispatch]);
  return (
    <Box>
        <HStack justifyContent={"space-between"} fontWeight={"bold"} fontSize={"20px"}>
            <NavLink to={"shop-info"}>Shop</NavLink>
            <NavLink to={"shop-product"}>Products</NavLink>
            <HStack gap={"20px"}>
            {userInfo && (
              <HStack>
                <Text>
                  {userInfo.first_name} {userInfo.last_name}
                </Text>
                <Button onClick={handleLogout} colorScheme="red" size="sm">
                  Logout
                </Button>
              </HStack>
            )}
              <IconButton onClick={toggleColorMode} variant="outline" size="sm">
                  {colorMode === "light" ? <LuSun /> : <LuMoon />}
              </IconButton>
            </HStack>
        </HStack>
    </Box>
  )
}

export default NavBarAdmin