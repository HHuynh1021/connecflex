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
    Badge,
} from "@chakra-ui/react"
import { useParams } from "react-router"
import { ChevronLeft, ChevronRight } from "lucide-react"
import api from "../../services/api"

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

const useProduct = () => {
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

    if (isLoading) {
        return (
            <Center h="400px">
                <Spinner size="xl" />
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

    return {products, isLoading}
}

export default useProduct