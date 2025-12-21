import {useEffect} from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import useAccessToken from '../services/token'
import { Box,} from '@chakra-ui/react'
import NavBarAdmin from './NavBarAdmin'

const ShopAdmin:React.FC = () => {
    const Navigate = useNavigate()
    const user = useSelector((state: any) => state.auth.user)
    const { accessToken} = useAccessToken(user)
    
    useEffect(()=>{
        if(!accessToken){
            Navigate("/login")
            return
        }
    })
    return (
        <Box p={6} maxW="1200px" mx="auto">
            <NavBarAdmin/>
            <Box>
                <Outlet/>
            </Box>
        </Box>
    )
}

export default ShopAdmin
