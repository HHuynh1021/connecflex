import {useEffect, useState, useRef} from 'react'
import api from '../../services/api'

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
const useShopList = () => {
    const [shopList, setShops] = useState<ShopDataProps[]>([])
    const [isLoading, setLoading] = useState<boolean>(false)

    const fetchShopData = async () => {
        setLoading(true)
        try {
            const url = `${import.meta.env.VITE_API_BASE_URL}/shops/shop-list-view/`
            const response = await api.get(url)
            const shopdata = Array.isArray(response.data[0]) ? response.data[0] : response.data
            const filter = shopdata.filter((s: ShopDataProps) => s.id === shopId)
            setShops(filter)
        } catch (error: any) {
            console.error("fetching error", error.response?.data || error.message)
        } finally {
            setLoading(false)
        }
    }
    useEffect(() => {
        fetchShopData()
    },[])
  return { shopList, isLoading }
}

export default useShopList