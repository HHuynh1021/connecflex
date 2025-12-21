import { useEffect, useState } from "react"
import { 
    Box, 
    Heading, 
    Image, 
    Text, 
    Wrap, 
    Center, 
    Spinner,
    IconButton,
    HStack,
    Badge
} from "@chakra-ui/react"
import { useParams } from "react-router"
import { ChevronLeft, ChevronRight } from "lucide-react"
import api from "../services/api"

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
    images: ProductImage[]  // ← Include images in the Product interface
    description: string
    price: string
    category: string
}

const ProductListShop: React.FC = () => {
    const { shopId } = useParams()
    const [products, setProducts] = useState<Product[]>([])
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [error, setError] = useState<string>("")
    const [currentImageIndex, setCurrentImageIndex] = useState<{ [key: string]: number }>({})

    const fetchProductList = async () => {
        if (!shopId) {
            console.log("No shopId available")
            return
        }

        setIsLoading(true)
        setError("")

        try {
            const url = `${import.meta.env.VITE_API_BASE_URL}/shops/product-list-view/`
            const res = await api.get(url)
            
            console.log("API Response:", res.data)
            
            // Handle response structure
            const data = Array.isArray(res.data) ? res.data : (Array.isArray(res.data[0]) ? res.data[0] : [res.data])
            
            // Filter products by shop_id
            const filteredProducts = data.filter((product: Product) => 
                product.shop_id === shopId
            )
            
            console.log("Filtered products:", filteredProducts)
            setProducts(filteredProducts)
        } catch (err: any) {
            console.error("Failed to fetch products:", err)
            setError(err.response?.data?.message || "Failed to load products")
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        if (shopId) {
            fetchProductList()
        }
    }, [shopId])

    // Get current image to display
    const getCurrentImage = (productId: string, images: ProductImage[]) => {
        if (!images || images.length === 0) return null
        const index = currentImageIndex[productId] || 0
        return images[index] || images[0]
    }

    // Navigate to previous image
    const handlePrevImage = (e: React.MouseEvent, productId: string, images: ProductImage[]) => {
        e.stopPropagation()
        const currentIndex = currentImageIndex[productId] || 0
        const prevIndex = currentIndex === 0 ? images.length - 1 : currentIndex - 1
        setCurrentImageIndex(prev => ({ ...prev, [productId]: prevIndex }))
    }

    // Navigate to next image
    const handleNextImage = (e: React.MouseEvent, productId: string, images: ProductImage[]) => {
        e.stopPropagation()
        const currentIndex = currentImageIndex[productId] || 0
        const nextIndex = (currentIndex + 1) % images.length
        setCurrentImageIndex(prev => ({ ...prev, [productId]: nextIndex }))
    }

    // Navigate to specific image
    const handleDotClick = (productId: string, index: number) => {
        setCurrentImageIndex(prev => ({ ...prev, [productId]: index }))
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

    return (
        <Box p={5}>
            <Heading size="lg" mb={6}>
                Products
            </Heading>
            
            <Wrap gap="20px" justify="flex-start">
                {products.length > 0 ? (
                    products.map((product) => {
                        const currentImage = getCurrentImage(product.id, product.images)
                        const hasMultipleImages = product.images && product.images.length > 1
                        const currentIndex = currentImageIndex[product.id] || 0

                        return (
                            <Box 
                                key={product.id}
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
                                            objectFit="cover"
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
                                    <Heading size="md" mb={2} noOfLines={2}>
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
                                            noOfLines={3}
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
    )
}

export default ProductListShop