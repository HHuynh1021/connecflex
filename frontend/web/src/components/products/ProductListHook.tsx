import { useEffect, useState } from "react"
import { Box, Text, Center, Spinner} from "@chakra-ui/react"
import axios from "axios"
import { apiPublic } from "@/services/api"

interface ProductCategory {
    id: string
    name: string
}

interface ProductImage {
    id: string
    image: string
    is_primary: boolean
    order: number
}

interface Product {
    id: string
    name: string;
    shop_id: string;
    description: string;
    quantity: number;
    price: number;
    new_price: number;
    discount_end_at: string;
    currency_unit: string;
    condition: string;
    warranty: string;
    category: string[]; // Array of category IDs
    properties: Array<{property_name: string, value: string}>; // Array of property objects with values
    shop_owner_id: string
    primary_image: string
    delivery_term: string;
    refund_policy: string;
    refund: boolean;
}
const useProductList = () => {
    const [products, setProducts] = useState<Product[]>([])
    const [categories, setCategories] = useState<ProductCategory[]>([])

    const [isLoading, setIsLoading] = useState<boolean>(true)
    const [error, setError] = useState<string>("")

    useEffect(() => {
        const fetchAllData = async () => {
            setIsLoading(true)
            setError("")

            try {
                // Fetch products and categories in parallel
                const [productsRes, categoriesRes] = await Promise.all([
                    apiPublic.get(`${import.meta.env.VITE_API_BASE_URL}/shops/product-list-view/`),
                    apiPublic.get(`${import.meta.env.VITE_API_BASE_URL}/shops/category-list/`)
                ])

                // Process products
                const productsData = Array.isArray(productsRes.data) ? productsRes.data : (Array.isArray(productsRes.data[0]) ? productsRes.data[0] : [productsRes.data])
                console.log("Fetched products:", productsData)
                setProducts(productsData)

                // Process categories
                const categoriesData = Array.isArray(categoriesRes.data) ? categoriesRes.data : []
                console.log("Fetched categories:", categoriesData)
                setCategories(categoriesData)

            } catch (err: any) {
                console.error("Failed to fetch data:", err)
                setError(err.response?.data?.message || "Failed to load data")
            } finally {
                setIsLoading(false)
            }
        }

        fetchAllData()
    }, [])

    return {products, categories, isLoading, error}
}
export default useProductList