import {useEffect, useState} from 'react'
import { useSelector } from 'react-redux'
import useAccessToken from '../../services/token'
import { Box, Text } from '@chakra-ui/react'
import axios from 'axios'

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
}
const ShopAdmin:React.FC = () => {
    const user = useSelector((state: any) => state.auth.user)
    const { accessToken} = useAccessToken(user)
    const [shops, setShops] = useState<ShopDataProps[]>([])
    const [isLoading, setLoading] = useState<boolean>(false)

    const fetchShopData = async () => {
        setLoading(true)
        if (!accessToken) {
            alert("cannot get accesstoken")
            return
        }
        // console.log("access token:", accessToken)
        try {
            const url = `${import.meta.env.VITE_API_BASE_URL}/shops/shop-list-create/`
            const config = {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    "Content-Type": "application/json",
                    },
            }
            const response = await axios.get(url, config)
            const shopdata = Array.isArray(response.data[0]) ? response.data[0] : response.data
            setShops(shopdata)

        } catch (error: any) {
            console.error("fetching error", error.response.data || error.message)
        }finally {
            setLoading(false)
        }
    }
    useEffect(() => {
        if(accessToken && user) {
            fetchShopData()
        }
    },[accessToken, user])
  return (
    <Box>
        <Box>
            {shops && shops.map((shop: ShopDataProps) => (
                <Box key={shop.id}>
                    <Text>{shop.name}</Text>
                </Box>
            ))}
        </Box>
    </Box>
  )
}

export default ShopAdmin