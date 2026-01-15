import {useEffect, useState, useRef} from 'react'
import axios from 'axios'
import { apiPublic } from '@/services/api'

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
const useShop = (shopId: string) => {
    const [shops, setShops] = useState<ShopDataProps[]>([])
    const [isLoading, setLoading] = useState<boolean>(false)

    const fetchShopData = async () => {
        if(!shopId){
            console.log("No shopId provided")
        }
        setLoading(true)
        try {
            const url = '/shops/shop-list-view/'
            const response = await apiPublic.get(url)
            let shopdata: ShopDataProps[] = []
            if (Array.isArray(response.data)) {
                shopdata = response.data
            } else if (response.data.results && Array.isArray(response.data.results)) {
                // Django REST Framework pagination
                shopdata = response.data.results
            } else if (response.data.data && Array.isArray(response.data.data)) {
                // Wrapped in { data: [...] }
                shopdata = response.data.data
            } else if (response.data.shops && Array.isArray(response.data.shops)) {
                // Wrapped in { shops: [...] }
                shopdata = response.data.shops
            } else if (typeof response.data === 'object') {
                // Single shop object
                shopdata = [response.data]
            }

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
    },[shopId])
  return { shops, isLoading }
}

export default useShop