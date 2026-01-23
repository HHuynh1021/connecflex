import {useEffect, useState, useRef} from 'react'
import { Outlet, useNavigate, NavLink, Link } from 'react-router'
import { useSelector, useDispatch } from 'react-redux'
import useAccessToken from '../services/token'
import { getUserInfo } from '@/services/authSlice'
import { logout, clearAuth } from "../services/authSlice"
import type { AppDispatch } from '@/services/store'
import { Box, HStack, Button, Text, IconButton, Menu, Avatar, Portal, Container} from '@chakra-ui/react'
import { LuMoon, LuSun } from "react-icons/lu"
import { useColorMode } from '../components/ui/color-mode'
import { GiHamburgerMenu } from "react-icons/gi";
import useShopAdmin from '@/components/shop/ShopHookAdmin'
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
        const handleResize = (e: any) => setIsDesktop(e.matches);
        mediaQuery.addEventListener('change', handleResize);
        // Set initial state through the listener
        handleResize(mediaQuery);
        return () => mediaQuery.removeEventListener('change', handleResize);
    }, []);
    return (
        <Container px={{base:"5px", md:"20px"}} maxW={{base:"100%", md: "80vw"}} mt={'20px'} mx={{base: "auto", md: "auto"}}>
            
            {userInfo && userInfo.role === "shop_admin" ? (
            <Box w={"100%"}>
                <Box w={"100%"}>
                {isDesktop ? (
                    <HStack w={"100%"} justifyContent={"space-between"} fontWeight={"bold"} fontSize={"20px"} 
                        shadow={"sm"} px={'20px'} py={"10px"} rounded={"7px"}>

                        <NavLink to={"admin-home"}>Home</NavLink>
                        <NavLink to={"shop/orders"}>Orders</NavLink>
                        <NavLink to={"shop-product"}>Products</NavLink>
                        <HStack gap={"20px"}>
                        <Menu.Root>
                            {shops && shops.length > 0 && (
                                <Menu.Trigger asChild>
                                    <HStack>
                                        <Avatar.Root>
                                            <Avatar.Image src={shops[0].logo || null}/>
                                        </Avatar.Root>
                                    </HStack>
                                </Menu.Trigger>
                            )}
                            <Portal>
                                <Menu.Positioner shadow={"2xl"} rounded={"5px"} justifyContent={"flex-start"}>
                                    <Menu.Item value='info'>
                                        <NavLink to={"shop-info"}>Shop Info</NavLink>
                                    </Menu.Item>
                                    <Menu.Item value='logout' cursor={"pointer"} _hover={{shadow:"sm", color:"red.700"}}>
                                        <Text color="fg.error" onClick={handleLogout} colorScheme="red">
                                            Logout
                                        </Text>
                                    </Menu.Item>
                                </Menu.Positioner>
                            </Portal>
                        </Menu.Root>
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
                                    <Menu.Item value='home'>
                                        <NavLink to={"admin-home"}>Home</NavLink>
                                    </Menu.Item>
                                    <Menu.Item value='order'>
                                        <NavLink to={"shop/orders"}>Orders</NavLink>
                                    </Menu.Item>
                                    <Menu.Item value='product'>
                                        <NavLink to={"shop-product"}>Products</NavLink>   
                                    </Menu.Item>
                                    <Menu.Item value='shop'>
                                        <NavLink to={"shop-info"}>Shop Update</NavLink>
                                        
                                    </Menu.Item>
                                </Menu.Content>
                            </Menu.Positioner>
                        </Portal>
                    </Menu.Root>
                    {shops && (
                        shops.map((s: ShopDataProps) => (
                            <HStack key={s.id}>
                                <Avatar.Root>
                                    <Avatar.Image src={s.logo || null}/>
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
        </Container>
    )
}

export default ShopAdmin
