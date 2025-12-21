import {useState} from 'react'
import useProductList from './ProductListHook'
import { IconButton, HStack, Heading, Image, Wrap, Box, Text, Center, Badge, Container } from '@chakra-ui/react'
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useNavigate } from 'react-router'
import useShop from '@/components/shop/ShopHook'

interface ProductImage {
    id: string
    image: string
    is_primary: boolean
    order: number
}

interface ProductListProps {
    id: string
    name: string
    shop_id: string
    shop_name: string
    images: ProductImage[]
    description: string
    price: string
    category: string
}
const ProductListPage = () => {
    const { products, isLoading, error } = useProductList()
    const [currentImageIndex, setCurrentImageIndex] = useState<{ [key: string]: number }>({})
    const [selectedProduct, setSelectedProduct] = useState<string>("")
    const Navigate = useNavigate()


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
  return (
    <Container>
        <Heading>Product List</Heading>
        {/* { products.map((p: ProductListProps) => {
            const primaryImage = p.images.find(img => img.is_primary) || p.images[0].image
            return (
                <Box key={p.id} cursor="pointer" _hover={{ shadow: 'lg' }}>
                    {primaryImage && (
                        <Image 
                            src={primaryImage} 
                            alt={p.name} height={"200px"}
                            h={"200px"}
                            w={"200px"}
                            fit={"fill"}
                        />
                    )

                    }
                </Box>
            )
        })} */}
        <Wrap gap="20px" justify="space-between">
                {products.length > 0 ? (
                    products.map((product: ProductListProps) => {
                        const currentImage = getCurrentImage(product.id, product.images)
                        const hasMultipleImages = product.images && product.images.length > 1
                        const currentIndex = currentImageIndex[product.id] || 0

                        return (
                            <Box 
                                key={product.id}
                                onClick={() => handleClickProduct(product.id, product.shop_id)}
                                cursor={"pointer"}
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
                                            borderBottom={"1px solid"}
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
                                        {product.shop_name}
                                    </Heading>
                                    <Heading size="md" mb={2}>
                                        {product.name}
                                    </Heading>
                                    
                                    {/* {product.category && (
                                        <Text 
                                            fontSize="sm" 
                                            color="gray.600" 
                                            mb={2}
                                            fontWeight="medium"
                                        >
                                            {product.category}
                                        </Text>
                                    )} */}
                                    
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
                        </Box>
                    </Center>
                )}
            </Wrap>
    </Container>
  )
}

export default ProductListPage