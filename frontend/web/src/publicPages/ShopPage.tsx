import {useEffect, useState} from 'react'
import {  useNavigate, useParams } from 'react-router'
import { useSelector } from 'react-redux'
import api from '../services/api'
import { Box, VStack, Container,} from '@chakra-ui/react'
import { toaster } from '../components/ui/toaster'
import Template from '../components/shop/Templates'
import Templates from '../components/shop/Templates'

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
}
interface TemplateProp {
  shopId: string;
}
const ShopPage:React.FC = () => {
  const Navigate = useNavigate()
  const {shopId} = useParams()
  const user = useSelector((state: any) => state.auth.user)
  const [shops, setShops] = useState<ShopDataProps[]>([])
  const [isLoading, setLoading] = useState<boolean>(false)

  const fetchShopData = async () => {
      setLoading(true)
      try {
          const url = `${import.meta.env.VITE_API_BASE_URL}/shops/shop-list-view/`
          const response = await api.get(url)
          const shopdata = Array.isArray(response.data[0]) ? response.data[0] : response.data
          setShops(shopdata)
      } catch (error: any) {
          console.error("fetching error", error.response?.data || error.message)
          toaster.create({
              title: 'Error',
              description: 'Failed to fetch shop data',
              type: 'error',
              duration: 3000,
          })
      } finally {
          setLoading(false)
      }
  }
  useEffect(() => {
    fetchShopData()
  },[])
  return (
    <Container w={"100%"}>
      <Templates/>
    </Container>
  )
}

export default ShopPage