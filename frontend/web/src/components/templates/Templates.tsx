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
import { Avatar, Box, Container, Heading, HStack, Image, Stack, Tabs, Text, Wrap, } from '@chakra-ui/react'

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
  price: number;
  new_price: number;
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
  images: ProductImage[]
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
                <Tabs.Root defaultValue={"product"}>
                  <Tabs.List>
                    <Tabs.Trigger value='product'>Products</Tabs.Trigger>
                    <Tabs.Trigger value='service'>Services</Tabs.Trigger>
                    <Tabs.Trigger value='policy'>Policies</Tabs.Trigger>
                    <Tabs.Trigger value='contact'>Contact</Tabs.Trigger>
                  </Tabs.List>
                  <Tabs.Content value='product'>
                    <Box>
                      <Wrap h={"fit-content"} justify={{base: "center", md: "space-between"}} gap={"10px"} mt={"20px"} mb={"20px"}>
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

                    </Box>
                  </Tabs.Content>
                  <Tabs.Content value='service'>
                    <Heading>Shop's serivices</Heading>
                    <Text>
                      Lorem ipsum dolor sit amet consectetur adipisicing elit. 
                      Consequatur amet temporibus adipisci natus quam ipsam eum dolor officia accusamus! 
                      Fuga id libero repellendus voluptatum tempore sapiente iure quos adipisci ullam!
                    </Text>
                  </Tabs.Content>
                  <Tabs.Content value='policy'>
                    <Heading>Shop's Policies</Heading>
                    <Text>
                      Lorem ipsum dolor sit amet consectetur adipisicing elit. 
                      Magnam nam quisquam consequuntur quas unde blanditiis doloribus id cumque tenetur possimus, 
                      autem modi reiciendis veritatis exercitationem ducimus vero odio, corporis asperiores!
                    </Text>
                  </Tabs.Content>
                  <Tabs.Content value='contact'>
                    {shops && shops.map((s: ShopDataProps) => (
                      <Box key={s.id}>
                         
                         <Text>Email: {s.email}</Text>
                         <Text>Phone: {s.phone? s.phone : "no phone"}</Text>
                         <Text>Address: {s.address ? s.address : "no address"}</Text>
                      </Box>
                    ))}
                  </Tabs.Content>
                </Tabs.Root>
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