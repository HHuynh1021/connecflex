import {useEffect, useState, useRef} from 'react'
import { Outlet, useNavigate, NavLink, useParams, useLocation } from 'react-router'
import { useSelector, useDispatch } from 'react-redux'
import useAccessToken from '../services/token'
import { getUserInfo } from '@/services/authSlice'
import { logout, clearAuth } from "../services/authSlice"
import type { AppDispatch } from '@/services/store'
import { Box, HStack, Button, Text, IconButton, Menu, Avatar, Portal, Heading} from '@chakra-ui/react'
import { LuMoon, LuSun } from "react-icons/lu"
import { useColorMode } from '../components/ui/color-mode'
import { GiHamburgerMenu } from "react-icons/gi";
// import useShopAdmin from './ShopHookAdmin'
import useShop from '@/components/shop/ShopHook'

interface ShopDataProps {
    id: string
    name: string
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
const Dashboard:React.FC = () => {
    const { toggleColorMode, colorMode } = useColorMode()
    const Navigate = useNavigate()
    const Location = useLocation()
    const {user, userInfo} = useSelector((state: any) => state.auth)
    const dispatch = useDispatch<AppDispatch>();

    const [isDesktop, setIsDesktop] = useState<boolean>(false)
    const {shopId} = useParams()
    const {shops} = useShop(shopId || "")
    
    const handleLogout = async () => {
        await dispatch(logout());
        dispatch(clearAuth());
        Navigate('/', {state: {from: Location}});
    };
    useEffect(() => {
          if (!user || !user.access) {
            // Navigate("/");
            return;
          }
      
          if (user.access && !userInfo) {
            // console.log('Fetching user info with token:', user.access.substring(0, 20) + '...');
            dispatch(getUserInfo());
          }
        }, [user, userInfo, Navigate, dispatch]);

        // console.log("userInfo: ", userInfo)
    
    useEffect(() => {
        const mediaQuery = window.matchMedia('(min-width: 450px)');
        const handleResize = (e) => setIsDesktop(e.matches);
        mediaQuery.addEventListener('change', handleResize);
        // Set initial state through the listener
        handleResize(mediaQuery);
        return () => mediaQuery.removeEventListener('change', handleResize);
    }, []);

    const getCurrentLocation = () => {
        Navigate("/login", {state: {from: Location}})
    }
    return (
        <Box p={6} maxW="1200px" mx="auto">
               <Box>
                 <Box>
                    {isDesktop ? (
                     <HStack justifyContent={"space-between"} fontWeight={"bold"} fontSize={"20px"} my={"20px"} p={"10px"} shadow={'2xl'} rounded={"7px"}>
                         <NavLink to={"/"}>Home</NavLink>
                         <NavLink to={"community"}>Community</NavLink>
                         <HStack gap={"20px"}>
                         {userInfo && userInfo.role === "guest_user" ? (
                         <HStack>
                             <Text>
                             {userInfo.first_name} {userInfo.last_name}
                             </Text>
                             <Button onClick={handleLogout} size="sm" variant={"outline"} fontWeight={"bold"}>
                                Logout
                             </Button>
                         </HStack>
                         ):(
                            <Button onClick={getCurrentLocation} variant={"outline"} size="sm" fontWeight={"bold"}>Login</Button>
                         )}
                         <IconButton onClick={toggleColorMode} variant="outline" size="sm">
                             {colorMode === "light" ? <LuSun /> : <LuMoon />}
                         </IconButton>
                         </HStack>
                     </HStack>
                    ):(
                     <HStack justifyContent={"space-between"}>
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
                                            <NavLink to={"/"}>Home</NavLink>
                                        </Menu.Item>
                                        <Menu.Item value='product'>
                                            <NavLink to={"community"}>Community</NavLink>   
                                        </Menu.Item>
                                        {userInfo && userInfo.role === "guest_user" ? 
                                        (
                                            <Menu.Item value='logout'>
                                                <Button onClick={handleLogout} colorScheme="red" size="sm" variant={"outline"}>Logout</Button>                         
                                            </Menu.Item>
                                        ):(
                                            <Menu.Item value='login'>
                                                <Button onClick={getCurrentLocation} variant={"plain"}>Login</Button>
                                            </Menu.Item>
                                        )}
                                    </Menu.Content>
                                </Menu.Positioner>
                            </Portal>
                        </Menu.Root>
                        <HStack>
                            {userInfo && userInfo.role === "guest_user" && (
                            <HStack>
                                <Text>
                                    Hello
                                </Text>
                                <Text>
                                    {userInfo.first_name} {userInfo.last_name}
                                </Text>
                            </HStack>
                         )}
                        </HStack>
                        <IconButton onClick={toggleColorMode} variant="outline" size="sm">
                             {colorMode === "light" ? <LuSun /> : <LuMoon />}
                         </IconButton>
                     </HStack>
                    )}
                 </Box>
                 <Box>
                     <Outlet/>
                 </Box>
               </Box>
        </Box>
    )
}

export default Dashboard


// import {Box, Container} from "@chakra-ui/react"
// import { Outlet } from "react-router-dom"
// import NavBarDashboard from "./NavBar-Dashboard"

// const Dashboard:React.FC = () => {
//     return (
//         <Container maxW={'1100px'} p={"10px"}>
//             <NavBarDashboard/>
//             <Box p={"10px"}>
//                 <Outlet/>
//             </Box>
//         </Container>
//     )
// }
// export default Dashboard