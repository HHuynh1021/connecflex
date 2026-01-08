// import { useState } from 'react'
import useShop from '../shop/ShopHook'
import { useNavigate, useParams } from 'react-router-dom'
import { GiShop } from "react-icons/gi"
import { MdEmail } from "react-icons/md"
import { BsFillTelephoneOutboundFill } from "react-icons/bs"
// import NavBarShop from '../shop/NavBarShop'
import ProductListShop from '@/components/products/ProductListShop'
import useProduct from '../products/ProductHook'
import ProductCard from '../products/ProductCard'
import { Avatar, Box, Container, Heading, HStack, Image, Stack, Text, Wrap, } from '@chakra-ui/react'

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
  address: string
  phone: string
  description: string
  industry: string
  logo: string
  banner: string
  template: string
}

interface ProductImage {
  id: string
  image: string
  is_primary: boolean
  order: number
}

interface Product {
  id: string
  name: string;
  shop_id: string;
  description: string;
  price: string;
  new_price: string;
  discount_end_at: string;
  currency_unit: string;
  condition: string
  guaranty: string
  color: string;
  dimension: string;
  weight: string;
  other: string;
  category: string;
  image: string;
}

const Templates: React.FC = () => {
  const { products } = useProduct()
  const { shopId } = useParams()
  const { shops } = useShop(shopId || "")
  const navigate = useNavigate() // Changed from Navigate to navigate (lowercase)
  
  const openGoogleMaps = (address: string) => {
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`
    window.open(url, '_blank')
  }
  
  const handleClickProduct = (productId: string) => {
    navigate(`/product-page/${shopId}/${productId}`) // Fixed: proper function call
  }
  
  return (
    <Container maxW="container.xl">
      <Box>
        {shops && shops.map((shop: ShopDataProps) => (
          <Stack key={shop.id} gap={4}>
            <HStack>
              <Avatar.Root>
                <Avatar.Image src={shop.logo}/>
              </Avatar.Root>
              <Heading>{shop.name}</Heading>
            </HStack>
            
            {shop.template === "Template-1" ? (
              <Box>
                <Box w="100%" justifyContent="space-between" gap={4} flexWrap={{ base: "wrap", md: "nowrap" }}>
                  <Image 
                    src={shop.banner} 
                    rounded="5px" 
                    height="200px" 
                    fit={"fill"} // Fixed: changed from fit to objectFit
                    w={{ base: "100%", md: "100%" }}                    
                  />
                </Box>
                <Heading my={"20px"}>Products</Heading>
                <Wrap h={"fit-content"} justify={{base: "center", md: "space-between"}} gap={"10px"} mt={"20px"} mb={"20px"}
                >
                  {products && products.map((p: Product) => (
                    <Box 
                      key={p.id} 
                      onClick={() => handleClickProduct(p.id)} 
                      cursor="pointer" 
                      _hover={{ shadow: "lg", transform: "scale(1.02)" }}
                      transition="all 0.2s"
                      rounded="md"
                    >
                      {/* Pass individual product to ProductListShop */}
                      <ProductCard product={p} />
                    </Box>
                  ))}
                </Wrap>
                <Box h={"100px"} borderTop={"2px solid"}>
                  <Stack               
                      p="10px" 
                      rounded="5px" 
                      w={{ base: "100%", md: "fit-content" }}
                      minW="250px"
                    >
                      <HStack>
                        <GiShop />
                        <Text 
                          onClick={() => openGoogleMaps(shop.address)} 
                          cursor="pointer"
                          fontSize="sm"
                          _hover={{ textDecoration: "underline", color: "blue.500" }}
                        >
                          {shop.address}
                        </Text>
                      </HStack>
                      <HStack>
                        <MdEmail />
                        {/* Fixed: Using 'a' tag instead of Link for mailto */}
                        <a 
                          href={`mailto:${shop.email}`}
                          style={{ fontSize: '14px', color: 'inherit' }}
                        >
                          {shop.email}
                        </a>
                      </HStack>
                      <HStack>
                        <BsFillTelephoneOutboundFill />
                        {/* Fixed: Using 'a' tag instead of Link for tel */}
                        <a 
                          href={`tel:${shop.phone}`}
                          style={{ fontSize: '14px', color: 'blue' }}
                        >
                          {shop.phone}
                        </a>
                      </HStack>
                  </Stack>
                </Box>
              </Box>
            ) : shop.template === "Template-2" ? (
              <Box>
                Template-2
              </Box>
            ) : shop.template === "Template-3" ? (
              <Box>
                <ProductListShop />
              </Box>
            ) : shop.template === "Template-4" ? (
              <Box>Template-4</Box>
            ) : (
              <Text textAlign="center" color="gray.500" py={8}>
                No Templates
              </Text>
            )}
          </Stack>
        ))}
      </Box>
      
    </Container>
  )
}

export default Templates