import {useEffect, useState} from 'react'
import api from '../services/api'
import { useSelector, useDispatch } from 'react-redux'
import type { AppDispatch } from '../services/store'
import useAccessToken from '../services/token'

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
const useShopAdmin = () => {
    const user = useSelector((state: any) => state.auth.user)
    const { accessToken } = useAccessToken(user)
    
    const [shops, setShops] = useState<ShopDataProps[]>([])
    const [isLoading, setLoading] = useState<boolean>(false)

    const fetchShopData = async () => {
        setLoading(true)
        try {
            const url = `${import.meta.env.VITE_API_BASE_URL}/shops/shop-list-create/`
            const config = {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    "Content-Type": "application/json",
                },
            }
            const response = await api.get(url, config)
            const shopdata = Array.isArray(response.data[0]) ? response.data[0] : response.data
            // const filter = shopdata.filter((s: ShopDataProps) => s.shop_account === shop_account)
            setShops(shopdata)
        } catch (error: any) {
            console.error("fetching error", error.response?.data || error.message)
        } finally {
            setLoading(false)
        }
    }
    useEffect(() => {
        fetchShopData()
    },[])
  return { shops, isLoading }
}

export default useShopAdmin