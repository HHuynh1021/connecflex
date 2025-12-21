// ProductListShop.tsx
import { useEffect, useState } from "react"
import { 
    Box, 
    Heading, 
    Text, 
    Wrap, 
    Center, 
    Spinner,
} from "@chakra-ui/react"
import { useParams } from "react-router"
import api from "../../services/api"
import ProductCard from "./ProductCard"


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

const ProductCards: React.FC = () => {
    const { shopId } = useParams()
    const [products, setProducts] = useState<Product[]>([])
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [error, setError] = useState<string>("")

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
            const data = Array.isArray(res.data) 
                ? res.data 
                : (Array.isArray(res.data[0]) ? res.data[0] : [res.data])
            
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
            
            <Wrap gap={4} justify="flex-start">
                {products.length > 0 ? (
                    products.map((product) => (
                        <ProductCard 
                            key={product.id} 
                            product={product}
                        />
                    ))
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

export default ProductCards