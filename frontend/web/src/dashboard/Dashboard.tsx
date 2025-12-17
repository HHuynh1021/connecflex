import {useEffect, useState} from 'react'
import {Box, Text, Code, VStack} from "@chakra-ui/react"
import { useSelector} from "react-redux"
import useAccessToken from '../services/token'
import NavBar from '../components/NavBar'
import { Outlet } from 'react-router-dom'

const Dashboard:React.FC = () => {
    const user = useSelector((state: any) => state.auth.user)
    const tokenState = useAccessToken(user)
    
    
    return (
        <Box>
            <NavBar/>
            <Outlet/>
        </Box>
    )
}
export default Dashboard