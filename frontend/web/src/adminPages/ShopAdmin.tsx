import {useEffect, useState, useRef} from 'react'
import { Outlet, useNavigate, NavLink, Link } from 'react-router'
import { useSelector, useDispatch } from 'react-redux'
import useAccessToken from '../services/token'
import { getUserInfo } from '@/services/authSlice'
import { logout, clearAuth } from "../services/authSlice"
import type { AppDispatch } from '@/services/store'
import { Box, HStack, Button, Text, IconButton, Menu, Avatar, Portal} from '@chakra-ui/react'
import { LuMoon, LuSun } from "react-icons/lu"
import { useColorMode } from '../components/ui/color-mode'
import { GiHamburgerMenu } from "react-icons/gi";
import useShopAdmin from './ShopHookAdmin'
import LoginPage from '@/auths/LoginPage'

interface ShopDataProps {
    id: string
    name: string
    shop_account: string;
    email: string
    street: string
    province: string
    city: string
    state: string
    zipcode: string
    country: string
    phone: string
    description: string
    industry: string
    logo: string
    banner: string;
    template: string;
    address: string;
}
const ShopAdmin:React.FC = () => {
    const { toggleColorMode, colorMode } = useColorMode()
    const Navigate = useNavigate()
    const {user, userInfo} = useSelector((state: any) => state.auth)
    const dispatch = useDispatch<AppDispatch>();

    const [isDesktop, setIsDesktop] = useState<boolean>(false)
    const {shops} = useShopAdmin()
    
    const handleLogout = async () => {
        await dispatch(logout());
        dispatch(clearAuth());
        Navigate('/login');
    };
    useEffect(() => {
          if (!user || !user.access) {
            Navigate("/login");
          }
      
          if (user.access && !userInfo) {
            dispatch(getUserInfo());
          }
        }, [user, userInfo, Navigate, dispatch]);

    
    useEffect(() => {
        const mediaQuery = window.matchMedia('(min-width: 450px)');
        const handleResize = (e) => setIsDesktop(e.matches);
        mediaQuery.addEventListener('change', handleResize);
        // Set initial state through the listener
        handleResize(mediaQuery);
        return () => mediaQuery.removeEventListener('change', handleResize);
    }, []);
    return (
        <Box px={"20px"} w="100%" maxW={"90vw"} mx={"auto"}>
            
            {userInfo && userInfo.role === "shop_admin" ? (
            <Box w={"100%"}>
                <Box w={"100%"}>
                {isDesktop ? (
                    <HStack w={"100%"} justifyContent={"space-between"} fontWeight={"bold"} fontSize={"20px"} 
                        shadow={"2xl"} px={'20px'} py={"10px"} rounded={"7px"}>

                        <NavLink to={"admin-home"}>Home</NavLink>
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
                    
                ):(
                    <HStack>
                    <Menu.Root>
                        <Menu.Trigger asChild>
                            <Button variant={"outline"}>
                                <GiHamburgerMenu/>
                            </Button>
                        </Menu.Trigger>
                        <Portal>
                            <Menu.Positioner>
                                <Menu.Content>
                                    <Menu.Item value='shop'>
                                        <NavLink to={"shop-info"}>Shop</NavLink>
                                    </Menu.Item>
                                    <Menu.Item value='product'>
                                        <NavLink to={"shop-product"}>Products</NavLink>   
                                    </Menu.Item>
                                </Menu.Content>
                            </Menu.Positioner>
                        </Portal>
                    </Menu.Root>
                    {shops && (
                        shops.map((s: ShopDataProps) => (
                            <HStack key={s.id}>
                                <Avatar.Root>
                                    <Avatar.Image src={s.logo}/>
                                </Avatar.Root>
                                <Text>{s.name}</Text>
                            </HStack>
                        ))
                    )}
                    </HStack>
                )}
                </Box>
                <Box>
                    <Outlet/>
                </Box>
            </Box>
             ):(
                <Box>
                    <LoginPage/>
                </Box>
             )}
        </Box>
    )
}

export default ShopAdmin
