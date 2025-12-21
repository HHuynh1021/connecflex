import { useEffect, useState } from "react"
import { Box, Heading, Image, Text, HStack, VStack, Stack, Container, Wrap } from "@chakra-ui/react"
import { useParams } from "react-router-dom"
import api from "../services/api"
import NavBarShop from "@/components/shop/NavBarShop"
import useShop from "@/components/shop/ShopHook"

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

const ProductPage: React.FC = () => {
    const { productId, shopId } = useParams()
    const { shops } = useShop(shopId || "")
    const [products, setProducts] = useState<Product[]>([])
    const [selectedImageId, setSelectedImageId] = useState<string>("")

    const fetchProductList = async () => {
        try {
            const url = `${import.meta.env.VITE_API_BASE_URL}/shops/product-list-view/`
            const res = await api.get(url)
            const data = res.data
            const filter = data.filter((p: Product) => p.id === productId)
            console.log("productpage: ", filter)
            setProducts(filter)
            
            // Set initial selected image to primary or first image
            if (filter.length > 0 && filter[0].images.length > 0) {
                const primaryImage = filter[0].images.find(img => img.is_primary)
                setSelectedImageId(primaryImage?.id || filter[0].images[0].id)
            }
        } catch (error) {
            console.error("Failed to fetch product:", error)
        }
    }

    useEffect(() => {
        fetchProductList()
    }, [productId]) // Added productId as dependency

    const handleImageClick = (imageId: string) => {
        setSelectedImageId(imageId)
    }

    return (
        <Container p={"10px"}>
            {shops && shops.map((shop: ShopDataProps) => (
                <NavBarShop key={shop.id} logo={shop.logo} name={shop.name} />
            ))}
            
            {products.length > 0 ? (
                products.map((p: Product) => {
                    // Sort images by order
                    const sortedImages = [...p.images].sort((a, b) => a.order - b.order)
                    const selectedImage = sortedImages.find(img => img.id === selectedImageId)

                    return (
                        <Wrap key={p.id} gap={'20px'}>
                            {/* Left Side - Images */}
                            <HStack align="start" gap={"10px"} >
                                {sortedImages.length > 1 && (
                                    <VStack gap={2} flexWrap="wrap" h={"500px"} justify={"space-between"}>
                                        {sortedImages.map((image: ProductImage) => (
                                            <Box 
                                                key={image.id}
                                                onClick={() => handleImageClick(image.id)}
                                                cursor="pointer"
                                                borderWidth="2px"
                                                borderColor={selectedImageId === image.id ? "blue.500" : "gray.300"}
                                                borderRadius="md"
                                                overflow="hidden"
                                                transition="all 0.2s"
                                                _hover={{ borderColor: "blue.400", transform: "scale(1.05)" }}
                                            >
                                                <Image 
                                                    src={image.image} 
                                                    w="80px" 
                                                    h="80px" 
                                                    fit={"fill"}
                                                />
                                            </Box>
                                        ))}
                                    </VStack>
                                )}
                                {selectedImage && (
                                    <Box 
                                        borderWidth="1px" 
                                        borderRadius="lg" 
                                        overflow="hidden"
                                        
                                    >
                                        <Image 
                                            src={selectedImage.image} 
                                            w="450px" 
                                            h="500px" 
                                            fit="fill"
                                        />
                                    </Box>
                                )}
                            </HStack>

                            {/* Right Side - Product Details */}
                            <VStack align="start" gap={4}>
                                <Heading size="xl">{p.name}</Heading>
                                
                                {p.category && (
                                    <Box 
                                        bg="blue.100" 
                                        color="blue.800" 
                                        px={3} 
                                        py={1} 
                                        borderRadius="md"
                                        fontSize="sm"
                                        fontWeight="medium"
                                    >
                                        {p.category}
                                    </Box>
                                )}
                                
                                <Text 
                                    fontSize="3xl" 
                                    fontWeight="bold" 
                                    color="green.500"
                                >
                                    ${p.price}
                                </Text>
                                
                                <Box>
                                    <Heading size="md" mb={2}>Description</Heading>
                                    <Text color="gray.700" lineHeight="1.8">
                                        {p.description}
                                    </Text>
                                </Box>
                            </VStack>
                        </Wrap>
                    )
                })
            ) : (
                <Box p={8} textAlign="center">
                    <Text fontSize="lg" color="gray.500">No Products Found</Text>
                </Box>
            )}
        </Container>
    )
}

export default ProductPage