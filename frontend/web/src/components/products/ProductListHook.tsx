import { useEffect, useState } from "react"
import { Box, Text, Center, Spinner} from "@chakra-ui/react"
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
    address: string
}
const useProductList = () => {
    const [products, setProducts] = useState<Product[]>([])
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [error, setError] = useState<string>("")

    const fetchProductList = async () => {
        setIsLoading(true)
        setError("")

        try {
            const url = `${import.meta.env.VITE_API_BASE_URL}/shops/product-list-view/`
            const res = await api.get(url)
            
            // Handle response structure
            const data = Array.isArray(res.data) ? res.data : (Array.isArray(res.data[0]) ? res.data[0] : [res.data])
            
            console.log("Filtered products:", data)
            setProducts(data)
        } catch (err: any) {
            console.error("Failed to fetch products:", err)
            setError(err.response?.data?.message || "Failed to load products")
        } finally {
            setIsLoading(false)
        }
    }
    useEffect(() => {
        fetchProductList()
    }, [])

    if (isLoading) {
        return (
            <Center h="400px">
                <Spinner size="xl" />
            </Center>
        )
    }
    if (products.length === 0) {
        return (
            <Center h="400px">
                <Box textAlign="center">
                    <Text fontSize="lg" color="gray.600" mb={2}>
                        No Product
                    </Text>
                </Box>
            </Center>
        )
    }
    return {products, isLoading, error}
}
export default useProductList