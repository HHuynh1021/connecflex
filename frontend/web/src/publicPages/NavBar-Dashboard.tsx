import { useEffect } from 'react'
import { NavLink, useNavigate } from 'react-router'
import { useColorMode } from '../components/ui/color-mode'
import { LuMoon, LuSun } from "react-icons/lu"
import { Box, Button, Container, HStack, IconButton, Text } from '@chakra-ui/react'

import { logout, clearAuth } from "../services/authSlice"
import { useSelector, useDispatch } from 'react-redux'
import type { AppDispatch } from '@/services/store'
import useAccessToken from '@/services/token'
import { getUserInfo } from '@/services/authSlice'

const NavBarDashboard = () => {
  const {user, userInfo} = useSelector((state: any) => state.auth)
  const dispatch = useDispatch<AppDispatch>()
  const accessToken = useAccessToken(user)

  const { toggleColorMode, colorMode } = useColorMode()

  const Navigate = useNavigate()

  const handleLogin = () => {
    Navigate("/customer/login")
  }
  const handleLogout = async () => {
      await dispatch(logout());
      dispatch(clearAuth());
      Navigate('/');
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
    <Container maxW={'1100px'} p={"10px"}>
      <HStack w={"100%"} justifyContent={"space-between"} p={"10px"} fontWeight={"bold"} fontSize={"18px"}>
        <NavLink to={"home"}>Home</NavLink>
        <NavLink to={"community"}>Community</NavLink>
        <IconButton onClick={toggleColorMode} variant="outline" size="sm">
          {colorMode === "light" ? <LuSun /> : <LuMoon />}
        </IconButton>
        
        {userInfo ? (
          <HStack>
            <Text>
              Welcome back {userInfo.first_name} {userInfo.last_name}
            </Text>
            <Button onClick={handleLogout} colorScheme="red" size="sm">
              Logout
            </Button>
          </HStack>
        ) : (
          <Button onClick={handleLogin} colorScheme="blue" size="sm">
            Login
          </Button>
        )}
      </HStack>
    </Container>
  )
}

export default NavBarDashboard