import {useState} from 'react'
import useProductList from '../components/products/ProductListHook'
import { IconButton, HStack, Heading, Image, Wrap, Box, Text, Center, Badge, Container, Avatar } from '@chakra-ui/react'
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useNavigate } from 'react-router'
import useShopList from '@/components/shop/ShopHookList'

interface ProductImage {
    id: string
    image: string
    is_primary: boolean
    order: number
}

interface ProductListProps {
    id: string
    name: string;
    shop_id: string;
    description: string;
    price: string;
    new_price: string;
    discount_end_at: string;
    currency_unit: string;
    condition: string;
    color: string;
    dimension: string;
    weight: string;
    other: string;
    category: string;
    discount:number
    images: ProductImage[]
    shop_address: string;
    shop_city: string;
}
const ProductListPage = () => {
    const { products, isLoading, error } = useProductList()
    const Navigate = useNavigate()
console.log("product list page data: ", products)
    if(isLoading) {
        return <Box p={"10px"}>Loaing Products...</Box>
    }
    if (error) {
        return <Box p={"10px"} color={"red.500"}>Error loading products</Box>
    }
    if (!products || products.length === 0){
        return <Box p={"10px"}>No products found</Box>
    }

    const handleClickProduct = (productId: string, shopId: string) => {
        Navigate(`/product-page/${shopId}/${productId}`)
    }
    const openGoogleMaps = (address: string) => {
        const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`
        window.open(url, '_blank')
    }
  return (
    <Container maxW={'1100px'} p={"10px"}>
        <Heading>Product List</Heading>
        <Wrap gap={"20px"} justify={{base: "center", md: "space-between"}}>
            { products.map((p: ProductListProps) => {
                const primaryImage = p.images.find(img => img.is_primary) || p.images[0]
                const primaryImageUrl = primaryImage?.image
                return (
                    <Box key={p.id} cursor="pointer" _hover={{ shadow: 'lg' }} 
                        onClick={() => handleClickProduct(p.id, p.shop_id)} w={"200px"} 
                        p={'10px'} border={"1px solid"} rounded={"5px"}>
                        {primaryImageUrl && (
                            <Box position={"relative"}>
                                <Image 
                                    src={primaryImageUrl} 
                                    alt={p.name} height={"200px"}
                                    h={"200px"}
                                    w={"200px"}
                                    fit={"fill"}
                                    rounded={'5px'}
                                    
                                />
                                {(parseFloat(p.new_price) > 0) ? (
                                    <Avatar.Root position={"absolute"} top={0} right={0}>
                                        <Avatar.Image src="https://img.icons8.com/color/48/discount--v1.png"/>
                                    </Avatar.Root>):("")
                                }
                            </Box>
                            
                        )}
                        
                        <Heading fontSize={"24px"}>{p.name}</Heading>
                        {p.condition && <Text fontWeight={"bold"}>{p.condition}</Text>}
                        {parseFloat(p.new_price) > 0 ? 
                            (
                                <Box>
                                    <Text fontWeight={"bold"} color={"red"}>Price: {p.new_price} €</Text>
                                    <Text fontSize={"14px"} fontWeight={"bold"} textDecor={"line-through"}>Normal Price: {p.price} €</Text>
                                </Box>
                            ):(
                                <Text fontWeight={"bold"} color={"red.500"}>Price: {p.price} €</Text>
                            )
                        }
                        <Text w={"100%"} textJustify={"auto"}>
                            {p.shop_city}
                        </Text>
                    </Box>
                )
            })}
        </Wrap>

    </Container>
  )
}

export default ProductListPage