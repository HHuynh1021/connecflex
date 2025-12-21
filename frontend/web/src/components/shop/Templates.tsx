// import {useState} from 'react'
// import useShop from './ShopHook'
// import { Avatar, Box, Button, Center, Container, Grid, GridItem, Heading, HStack, Icon, Image, List, Stack, Text, VStack, Wrap, WrapItem } from '@chakra-ui/react'
// import { Link, useNavigate, useParams } from 'react-router-dom'
// import { GiShop } from "react-icons/gi";
// import { MdEmail } from "react-icons/md";
// import { BsFillTelephoneOutboundFill } from "react-icons/bs"
// import NavBarShop from './NavBarShop'
// import ProductListShop from '@/publicPages/ProductListShop';
// import useProduct from './ProductHook';

// interface ShopDataProps {
//     id: string
//     name: string
//     email: string
//     street: string
//     province: string
//     city: string
//     state: string
//     zipcode: string
//     country: string
//     address: string;
//     phone: string
//     description: string
//     industry: string
//     logo: string
//     banner: string;
//     template: string;
// }
// interface ProductImage {
//     id: string
//     image: string
//     is_primary: boolean
//     order: number
// }

// interface Product {
//     id: string
//     name: string
//     shop_id: string
//     images: ProductImage[]  // ← Include images in the Product interface
//     description: string
//     price: string
//     category: string
// }
// const Templates: React.FC = () => {
//   const {products} = useProduct()
//   const {shopId} = useParams()
//   const {shops} = useShop(shopId || "")
//   const Navigate = useNavigate()

//   const openGoogleMaps = (address: string) => {
//     const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
//     window.open(url, '_blank');
//   };
//   const handleClickProduct = (productId: string) => {
//     Navigate(`/product-page/${shopId}/${productId}`) 
//   }
//   return (
//     <Container w={"100vw"}>
//       {shops && shops.map((shop: ShopDataProps) => (
//         <Stack key={shop.id}>
//           <NavBarShop logo={shop.logo} name={shop.name}/>
//             {shop.template === "Template-1" ? 
//               (
//                 <Box>
//                   <HStack w={"100%"} justifyContent={"space-between"}>
//                     <Image src={shop.banner} rounded={"5px"} height={"200px"} fit={"fill"} w={'70%'} shadow="3px 3px 15px 5px rgb(75, 75, 79)"/>
//                     <Stack shadow="3px 3px 15px 5px rgb(75, 75, 79)" p={"10px"} rounded={"5px"} w={"fit-content"}>
//                       <HStack>
//                         <GiShop/>
//                         <Text onClick={() => openGoogleMaps(shop.address)} cursor={"pointer"}>{shop.address}</Text>
//                       </HStack>
//                       <HStack>
//                         <MdEmail/>
//                         <Link to={`mailto:${shop.email}`}>{shop.email}</Link>
//                       </HStack>
//                       <HStack>
//                         <BsFillTelephoneOutboundFill/>
//                         <Link to={`tel:${shop.phone}`} color='blue'>{shop.phone}</Link>
//                       </HStack>
//                     </Stack>
//                   </HStack>
//                   {products && products.map((p: Product) => (
//                       <Box key={p.id} onClick={() => handleClickProduct(p.id)} cursor="pointer" _hover={{ shadow: "md", borderColor: "blue.500" }} rounded={"3px"}>
//                         <ProductListShop/>
//                       </Box>
//                   ))}

//                 </Box>
//               ) 
//               : shop.template === "Template-2" ? 
//               (
//                 <Box>

//                   Template-2
//                 </Box>
//               )
//               : shop.template === "Template-3" ?
//               (
//                 <Box>
//                   <ProductListShop/>
//                 </Box>
//               )
//               : shop.template === "Template-4" ?
//               (
//                 <Box>Template-4</Box>
//               )
//               :
//               (
//                 "No Templates"
//               )
//             }
//         </Stack>
//       ))}
//     </Container>
//   )
// }

// export default Templates

import { useState } from 'react'
import useShop from './ShopHook'
import { 
  Avatar, 
  Box, 
  Button, 
  Center, 
  Container, 
  Grid, 
  GridItem, 
  Heading, 
  HStack, 
  Icon, 
  Image, 
  List, 
  Stack, 
  Text, 
  VStack, 
  Wrap, 
  WrapItem 
} from '@chakra-ui/react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { GiShop } from "react-icons/gi"
import { MdEmail } from "react-icons/md"
import { BsFillTelephoneOutboundFill } from "react-icons/bs"
import NavBarShop from './NavBarShop'
import ProductListShop from '@/publicPages/ProductListShop'
import useProduct from './ProductHook'
import ProductCard from './ProductCard'

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
  name: string
  shop_id: string
  images: ProductImage[]
  description: string
  price: string
  category: string
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
      {shops && shops.map((shop: ShopDataProps) => (
        <Stack key={shop.id} gap={4}>
          <NavBarShop logo={shop.logo} name={shop.name} />
          
          {shop.template === "Template-1" ? (
            <Box>
              <HStack w="100%" justifyContent="space-between" gap={4} flexWrap={{ base: "wrap", md: "nowrap" }}>
                <Image 
                  src={shop.banner} 
                  rounded="5px" 
                  height="200px" 
                  fit={"fill"} // Fixed: changed from fit to objectFit
                  w={{ base: "100%", md: "70%" }}
                  
                />
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
              </HStack>
              
              <Heading my={"20px"}>Products</Heading>
              <Wrap justify={{base: "center", md: "space-between"}}
                // templateColumns="repeat(auto-fill, minmax(280px, 1fr))" 
                gap={"10px"} 
                mt={6}
                mb={"20px"}
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
    </Container>
  )
}

export default Templates

// // Create a separate ProductCard component to display individual products
// interface ProductCardProps {
//   product: Product
// }

// const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
//   const [currentImageIndex, setCurrentImageIndex] = useState(0)
//   const sortedImages = product.images ? [...product.images].sort((a, b) => a.order - b.order) : []
//   const currentImage = sortedImages[currentImageIndex]

//   return (
//     <Box 
//       borderWidth="1px" 
//       borderRadius="lg" 
//       overflow="hidden"
//       bg="white"
//       shadow="md"
//       h="100%"
//     >
//       {/* Image */}
//       <Box position="relative" h="250px" bg="gray.100">
//         {currentImage ? (
//           <Image 
//             src={currentImage.image} 
//             alt={product.name}
//             w="100%" 
//             h="100%" 
//             objectFit="cover"
//           />
//         ) : (
//           <Center h="100%">
//             <Text color="gray.500">No Image</Text>
//           </Center>
//         )}
        
//         {/* Image counter */}
//         {sortedImages.length > 1 && (
//           <Box
//             position="absolute"
//             top={2}
//             right={2}
//             bg="blackAlpha.700"
//             color="white"
//             px={2}
//             py={1}
//             borderRadius="md"
//             fontSize="xs"
//           >
//             {currentImageIndex + 1} / {sortedImages.length}
//           </Box>
//         )}
//       </Box>
      
//       {/* Product Details */}
//       <Box p={4}>
//         <Heading size="md" mb={2} noOfLines={2}>
//           {product.name}
//         </Heading>
        
//         {product.description && (
//           <Text fontSize="sm" color="gray.600" mb={3} noOfLines={2}>
//             {product.description}
//           </Text>
//         )}
        
//         <Text fontSize="2xl" fontWeight="bold" color="green.600">
//           ${parseFloat(product.price).toFixed(2)}
//         </Text>
//       </Box>
//     </Box>
//   )
// }