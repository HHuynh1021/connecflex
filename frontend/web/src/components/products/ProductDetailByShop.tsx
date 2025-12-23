import { useEffect, useState } from "react"
import { Box, Heading, Image, Text, HStack, VStack, Stack, Container, Wrap, Center, IconButton, Spinner, Badge } from "@chakra-ui/react"
import { useNavigate, useParams } from "react-router"
import api from "../../services/api"
import NavBarShop from "@/components/shop/NavBarShop"
import MultipleProductImages from "./MultipleProductImages"
import { GiShop } from "react-icons/gi"
import { MdEmail } from "react-icons/md"
import { BsFillTelephoneOutboundFill } from "react-icons/bs"
import useShop from "@/components/shop/ShopHook"
import useProduct from "./ProductListHook"
import { ChevronLeft, ChevronRight } from "lucide-react"

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
interface OtherProduct {
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
    const Navigate = useNavigate()
    const { productId, shopId } = useParams()
    const { shops } = useShop(shopId || "")
    const [otherProducts, setOtherProducts] = useState<OtherProduct[]>([])
    const [products, setProducts] = useState<Product[]>([])
    const [selectedImageId, setSelectedImageId] = useState<string>("")
    const [selectedProductId, setSelectedProductId] = useState<string>("")

    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [error, setError] = useState<string>("")
    const [currentImageIndex, setCurrentImageIndex] = useState<{ [key: string]: number }>({})

    const openGoogleMaps = (address: string) => {
        const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`
        window.open(url, '_blank')
    }

    const fetchProductList = async () => {
        try {
            const url = `${import.meta.env.VITE_API_BASE_URL}/shops/product-list-view/`
            const res = await api.get(url)
            const data = res.data
            const filter = data.filter((p: Product) => p.id === productId)
            setProducts(filter)
            const otherProducts = data.filter((o: Product) => o.id !== productId)
            setOtherProducts(otherProducts)
            // Set initial selected image to primary or first image
            if (filter.length > 0 && filter[0].images.length > 0) {
                const primaryImage = filter[0].images.find((img: ProductImage) => img.is_primary)
                setSelectedImageId(primaryImage?.id || filter[0].images[0].id)
            }
        } catch (error) {
            console.error("Failed to fetch product:", error)
        }
    }

    useEffect(() => {
        fetchProductList()
    }, [productId])

    const getCurrentImageOtherProduct = (product: string, images: ProductImage[]) => {
        if (!images || images.length === 0) return null
        const index = currentImageIndex[product] || 0
        return images[index] || images[0]
    }

    // Navigate to previous image
    const handlePrevImage = (e: React.MouseEvent, product: string, images: ProductImage[]) => {
        e.stopPropagation()
        const currentIndex = currentImageIndex[product] || 0
        const prevIndex = currentIndex === 0 ? images.length - 1 : currentIndex - 1
        setCurrentImageIndex(prev => ({ ...prev, [product]: prevIndex }))
    }

    // Navigate to next image
    const handleNextImage = (e: React.MouseEvent, product: string, images: ProductImage[]) => {
        e.stopPropagation()
        const currentIndex = currentImageIndex[product] || 0
        const nextIndex = (currentIndex + 1) % images.length
        setCurrentImageIndex(prev => ({ ...prev, [product]: nextIndex }))
    }

    // Navigate to specific image
    const handleDotClick = (product: string, index: number) => {
        setCurrentImageIndex(prev => ({ ...prev, [product]: index }))
    }

    // Get primary image or first image
    const getPrimaryImage = (images: ProductImage[]) => {
        if (!images || images.length === 0) return null
        return images.find(img => img.is_primary) || images[0]
    }

    if (isLoading) {
        return (
            <Center h="400px">
                <Spinner size="xl" />
            </Center>
        )
    }

    if (error) {
        return (
            <Center h="400px">
                <Box textAlign="center">
                    <Text color="red.500" fontSize="lg" mb={2}>
                        {error}
                    </Text>
                    <Text color="gray.600" fontSize="sm">
                        Please try refreshing the page
                    </Text>
                </Box>
            </Center>
        )
    }

    if (!shopId) {
        return (
            <Center h="400px">
                <Box textAlign="center">
                    <Text fontSize="lg" color="gray.600" mb={2}>
                        No shop ID provided
                    </Text>
                </Box>
            </Center>
        )
    }

    const handleImageClick = (imageId: string) => {
        setSelectedImageId(imageId)
    }
    const handleProductClick = (productId: string) => {
        Navigate(`/product-page/${shopId}/${productId}`)
        setSelectedProductId(productId)
    }

    return (
        <Container p={"10px"}>
            {/* nav and banner */}
            <Box mb={"30px"}>
                {shops && shops.map((shop: ShopDataProps) => (
                    <Box key={shop.id}>
                        <NavBarShop logo={shop.logo} name={shop.name} />
                        <Image src={shop.banner} maxH={"200px"} w={"100%"} fit={"fill"} rounded={"5px"}/>
                    </Box>
                ))}
            </Box>

            <Box shadow={"2px 2px 25px 2px rgb(75, 75, 79) "} rounded={'7px'} p={"20px"}>
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
            </Box>
            {/* other products */}
            <Box shadow={"2px 2px 25px 2px rgb(75, 75, 79) "} rounded={"7px"} mt={"20px"}>
                <Heading textAlign={{base: "center", md:"start"}} p={"20px"} fontWeight={"bold"}>
                    More Products from This Shop
                </Heading>
                <Wrap gap="20px" justify={{md: "space-between", base:"center"}} cursor={"pointer"}>
                    {otherProducts.length > 0 ? (
                        otherProducts.map((product: OtherProduct) => {
                            const currentImage = getCurrentImageOtherProduct(product.id, product.images)
                            const hasMultipleImages = product.images && product.images.length > 1
                            const currentIndex = currentImageIndex[product.id] || 0

                            return (
                                <Box 
                                    key={product.id}
                                    onClick={() => handleProductClick(product.id)}
                                    borderWidth="1px"
                                    borderRadius="lg"
                                    overflow="hidden"
                                    bg="white"
                                    shadow="md"
                                    transition="all 0.2s"
                                    _hover={{ shadow: "lg", transform: "translateY(-2px)" }}
                                    w="300px"
                                >
                                    {/* Image Gallery */}
                                    <Box position="relative" h="300px" bg="gray.100">
                                        {currentImage ? (
                                            <Image 
                                                w="100%" 
                                                h="100%" 
                                                src={currentImage.image}
                                                alt={product.name}
                                                fit={"fill"}
                                            />
                                        ) : (
                                            <Center h="100%">
                                                <Text color="gray.500">No Image</Text>
                                            </Center>
                                        )}

                                        {/* Navigation Arrows - Only show if multiple images */}
                                        {hasMultipleImages && (
                                            <>
                                                <IconButton
                                                    aria-label="Previous image"
                                                    position="absolute"
                                                    left={2}
                                                    top="50%"
                                                    transform="translateY(-50%)"
                                                    onClick={(e) => handlePrevImage(e, product.id, product.images)}
                                                    size="sm"
                                                    colorPalette="blackAlpha"
                                                    variant="solid"
                                                    bg="blackAlpha.600"
                                                    color="white"
                                                    _hover={{ bg: "blackAlpha.800" }}
                                                >
                                                    <ChevronLeft size={20} />
                                                </IconButton>

                                                <IconButton
                                                    aria-label="Next image"
                                                    position="absolute"
                                                    right={2}
                                                    top="50%"
                                                    transform="translateY(-50%)"
                                                    onClick={(e) => handleNextImage(e, product.id, product.images)}
                                                    size="sm"
                                                    colorPalette="blackAlpha"
                                                    variant="solid"
                                                    bg="blackAlpha.600"
                                                    color="white"
                                                    _hover={{ bg: "blackAlpha.800" }}
                                                >
                                                    <ChevronRight size={20} />
                                                </IconButton>
                                            </>
                                        )}

                                        {/* Image Counter */}
                                        {hasMultipleImages && (
                                            <Box
                                                position="absolute"
                                                top={2}
                                                right={2}
                                                bg="blackAlpha.700"
                                                color="white"
                                                px={2}
                                                py={1}
                                                borderRadius="md"
                                                fontSize="sm"
                                            >
                                                {currentIndex + 1} / {product.images.length}
                                            </Box>
                                        )}

                                        {/* Primary Badge */}
                                        {currentImage?.is_primary && (
                                            <Badge
                                                position="absolute"
                                                top={2}
                                                left={2}
                                                colorPalette="blue"
                                            >
                                                Primary
                                            </Badge>
                                        )}

                                        {/* Dot Indicators */}
                                        {hasMultipleImages && (
                                            <HStack
                                                position="absolute"
                                                bottom={2}
                                                left="50%"
                                                transform="translateX(-50%)"
                                                gap={2}
                                            >
                                                {product.images.map((_, idx) => (
                                                    <Box
                                                        key={idx}
                                                        w="8px"
                                                        h="8px"
                                                        borderRadius="full"
                                                        bg={currentIndex === idx ? "white" : "whiteAlpha.500"}
                                                        cursor="pointer"
                                                        transition="all 0.2s"
                                                        onClick={() => handleDotClick(product.id, idx)}
                                                        _hover={{ 
                                                            bg: currentIndex === idx ? "white" : "whiteAlpha.700",
                                                            transform: "scale(1.2)"
                                                        }}
                                                    />
                                                ))}
                                            </HStack>
                                        )}
                                    </Box>
                                    
                                    {/* Product Details */}
                                    <Box p={4}>
                                        <Heading size="md" mb={2}>
                                            {product.name}
                                        </Heading>
                                        
                                        {product.category && (
                                            <Text 
                                                fontSize="sm" 
                                                color="gray.600" 
                                                mb={2}
                                                fontWeight="medium"
                                            >
                                                {product.category}
                                            </Text>
                                        )}
                                        
                                        {product.description && (
                                            <Text 
                                                fontSize="sm" 
                                                color="gray.700" 
                                                mb={3}
                                            
                                            >
                                                {product.description}
                                            </Text>
                                        )}
                                        
                                        <Text 
                                            fontSize="xl" 
                                            fontWeight="bold" 
                                            color="blue.600"
                                        >
                                            ${parseFloat(product.price).toFixed(2)}
                                        </Text>
                                    </Box>
                                </Box>
                            )
                        })
                    ) : (
                        <Center w="full" h="400px">
                            <Box textAlign="center">
                                <Text fontSize="lg" color="gray.600" mb={2}>
                                    No Products Yet
                                </Text>
                                <Text fontSize="sm" color="gray.500">
                                    Add your first product to get started
                                </Text>
                            </Box>
                        </Center>
                    )}
                </Wrap>
            </Box>
            {/* Footer */}
            <Box h={"100px"} borderTop={"2px solid"} mt={"20px"}>
                {shops && shops.map((shop: ShopDataProps) => (
                    <Box key={shop.id}>
                        <Stack p="10px" rounded="5px" w={{ base: "100%", md: "fit-content" }}minW="250px">
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
                                <a 
                                    href={`mailto:${shop.email}`}
                                    style={{ fontSize: '14px', color: 'inherit' }}
                                >
                                    {shop.email}
                                </a>
                                </HStack>
                                <HStack>
                                <BsFillTelephoneOutboundFill />
                                <a 
                                    href={`tel:${shop.phone}`}
                                    style={{ fontSize: '14px', color: 'blue' }}
                                >
                                    {shop.phone}
                                </a>
                            </HStack>
                        </Stack>
                    </Box>
                ))}
                
            </Box>
        </Container>
    )
}

export default ProductPage