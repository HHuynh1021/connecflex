// ProductCard.tsx
import { Box, Image, Text, VStack, Badge, HStack } from "@chakra-ui/react"

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

interface ProductCardProps {
    product: Product
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
    // Get the primary image or first image
    const primaryImage = product.images.find(img => img.is_primary) || product.images[0]
    const imageUrl = primaryImage?.image || '/placeholder-image.png'

    return (
        <Box
            borderWidth="1px"
            borderRadius="lg"
            overflow="hidden"
            shadow="md"
            _hover={{ shadow: "xl" }}
            transition="all 0.3s"
            w={'300px'}
            h={"500px"}
        >
            <Image
                src={imageUrl}
                alt={product.name}
                h="400px"
                w="300px"
                fit={"fill"}
            />

            <VStack align="stretch" p={4} gap={"10px"}>
                <Text fontSize="lg" fontWeight="bold">
                    {product.name}
                </Text>

                {/* <Text fontSize="16px">
                    {product.description}
                </Text> */}

                <HStack justify="space-between" align="center">
                    <Text fontSize="20px" fontWeight="bold" color="blue.600">
                        ${product.price}
                    </Text>
                    {/* {product.category && (
                        <Badge colorScheme="purple" fontSize="xs">
                            {product.category}
                        </Badge>
                    )} */}
                </HStack>
            </VStack>
        </Box>
    )
}

export default ProductCard