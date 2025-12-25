// ProductCard.tsx
import { Box, Image, Text, VStack, Badge, HStack, List, Stack, Avatar, Heading } from "@chakra-ui/react"

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
    new_price: string
    discount_end_at: string
    currency_unit: string
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
            
            w={'200px'}
            h={"300px"}
            p={"10px"}
        >
            <Box position={"relative"}>
                <Image
                    src={imageUrl}
                    alt={product.name}
                    h="200px"
                    w="180px"
                    fit={"fill"}
                />
                <Heading fontSize={"22px"}>{product.name}</Heading>
                {(parseFloat(product.new_price) > 0) ? (
                    <Box>
                        <Avatar.Root position={"absolute"} top={0} right={0}>
                            <Avatar.Image src="https://img.icons8.com/color/48/discount--v1.png"/>
                        </Avatar.Root>
                        <HStack fontWeight={"bold"} color={"red"}>
                            <Text>Price: {product.new_price}</Text>
                            <Text>{product.currency_unit}</Text>
                        </HStack>
                        <Text fontSize={"14px"} fontWeight={"bold"} textDecor={"line-through"}>Normal Price: {product.price} €</Text>
                    </Box>
                ):(
                    <HStack fontWeight={"bold"}>
                        <Text>Price: {product.price}</Text>
                        <Text>{product.currency_unit}</Text>
                    </HStack>
                )}
            </Box>
        </Box>
    )
}

export default ProductCard