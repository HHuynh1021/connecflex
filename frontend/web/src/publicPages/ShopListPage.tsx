import {useEffect, useState} from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import { Box, Text, Heading, Avatar, HStack, Wrap, Container, Stack, VStack, Spinner,} from '@chakra-ui/react'
import { toaster } from '../components/ui/toaster'

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
    template: string;
    address: string
}

const ShopListPage:React.FC = () => {
  const Navigate = useNavigate()

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
  const handleClickDetail = (shopId: string) => {
    Navigate(`/shop-page/templates/${shopId}`)
  }
  return (
    <Container>
        {isLoading ? (
            <Spinner size={"xl"}/>
        ):(

            <Wrap justify={"space-evenly"}>
              {shops && shops.map((shop:ShopDataProps) => (
                <Box key={shop.id}
                    w={"150px"} 
                    h={"150px"}
                    p={"5px"} 
                    border={"1px solid"} 
                    rounded={"7px"}
                    cursor="pointer"
                    _hover={{ shadow: "md", borderColor: "blue.500" }} 
                    onClick={() => handleClickDetail(shop.id) }
                    shadow="3px 3px 15px 5px rgb(75, 75, 79)"
                    >
                    <VStack>
                        <Avatar.Root>
                            <Avatar.Image src={shop.logo}/>
                        </Avatar.Root>
                        <Text fontSize={"14px"} fontWeight={"bold"} color={"blue"}>{shop.name}</Text>
                        <Text fontSize={"12px"} fontWeight={"bold"} color={"blue.700"}>{shop.zipcode} - {shop.city}</Text>
                        <Text fontSize={"12px"} fontWeight={"bold"} color={"black.700"}>{shop.industry}</Text>
                    </VStack>
                </Box>
              ))}
            </Wrap>
        )}
    </Container>
  )
}

export default ShopListPage