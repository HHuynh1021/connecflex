

import {useEffect, useState} from 'react'
import { useSelector, useDispatch } from 'react-redux'
import type { AppDispatch } from '@/services/store'
import { Box, Button, Heading, Image, Menu, Portal, Table, Text } from '@chakra-ui/react'
import { getUserInfo } from '@/services/authSlice'
import useProductList from '@/components/products/ProductListHook'
import useShopAdmin from '@/components/shop/ShopHookAdmin'
import formatDate from '@/components/formatDate'
import { Link, useNavigate } from 'react-router'
import useAccessToken from '@/services/token'
import { Toaster, toaster } from '@/components/ui/toaster'
import api from '@/services/api'

interface Category {
    id: string
    name: string
    description: string
}

interface Property {
    name: string
    values: string[]
    description: string
}

interface SelectedProperty {
    property_name: string, 
    value: string
}

interface ProductProp {
    id: string
    name: string;
    quantity: number
    shop_id: string;
    description: string;
    price: number;
    new_price: number;
    discount_end_at: string;
    currency_unit: string;
    condition: string
    warranty: string
    category: string[];  // Array of category IDs
    properties: SelectedProperty[];  // Array of property objects with custom values
    images?: string[];
    primary_image: string
    shop_owner_id: string
}

const ProductPage = () => {
    const navigate = useNavigate()
    const {user, userInfo} = useSelector((state: any) => state.auth)
    const dispatch = useDispatch<AppDispatch>()
    const accessToken = useAccessToken(user)
    const { products, isLoading, refetch } = useProductList() // Add refetch if available
    const {shops} = useShopAdmin()
    const [categories, setCategories] = useState<Category[]>([])
    
    const fetchCategories = async () => {
        try {
            const response = await api.get(`${import.meta.env.VITE_API_BASE_URL}/shops/category-list/`)
            setCategories(response.data || [])
        } catch (error: any) {
            console.error("Failed to fetch categories:", error)
        }
    }
    
    const getCategoryNames = (categoryIds: string[]) => {
        if (!categoryIds || categoryIds.length === 0) return 'No categories'
        return categoryIds
            .map(id => {
                const cat = categories.find(c => c.id === id)
                return cat?.name || id
            })
            .join(', ')
    }
    
    const getPropertyNames = (productProperties: SelectedProperty[]) => {
        if (!productProperties || productProperties.length === 0) return 'No properties'
        return productProperties
            .map(prop => {
                const value = prop.value || 'no value'
                return `${prop.property_name}: ${value}`
            })
            .join(' | ')
    }
    
    useEffect(() => {
        if (user && (!userInfo || Object.keys(userInfo).length === 0)) {
            dispatch(getUserInfo(undefined))
        }
    }, [dispatch, user, userInfo])
    
    useEffect(() => {
        const fetchData = async () => {
            await fetchCategories()
        }
        fetchData()
    }, [])
    
    const shopId = shops.find((shop: any) => shop.shop_account === userInfo?.id)?.id
    
    const handleUpdate = (shopId: string, productId: string) => {
        navigate(`/management/products/update/${shopId}/${productId}`) // Fixed syntax
    }
    
    const handleDeleteProduct = async (productId: string) => {
        if (!accessToken) {
            navigate("/login")
            return
        }
        if (!window.confirm('Are you sure you want to delete this product? This will also delete all associated images.')) {
            return
        }
        try {
            const url = `${import.meta.env.VITE_API_BASE_URL}/shops/product-editor/${productId}/`
            const config = {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            }
            await api.delete(url, config)
            
            toaster.create({
                title: 'Success',
                description: 'Product deleted successfully',
                type: 'success',
                duration: 3000,
            })
            
            // Refresh the product list after deletion
            if (refetch) {
                refetch()
            } else {
                // Alternative: reload the page if refetch is not available
                window.location.reload()
            }
        } catch (error: any) {
            console.error("delete failed", error.response?.data || error.message)
            toaster.create({
                title: 'Delete Failed',
                description: error.response?.data?.message || 'Failed to delete product',
                type: 'error',
                duration: 3000,
            })
        } 
    }
    
    const handleDuplicate = async (product: ProductProp) => {
        if (!accessToken) {
            navigate("/login")
            return
        }       
        try {
            // Create a copy of the product without the id and with modified name
            const duplicatedProduct = {
                name: `${product.name} (Copy)`,
                // quantity: product.quantity,
                shop_id: product.shop_id,
                description: product.description,
                price: product.price,
                new_price: product.new_price,
                discount_end_at: product.discount_end_at,
                currency_unit: product.currency_unit,
                condition: product.condition,
                warranty: product.warranty,
                category: product.category,                         
                properties: product.properties,
                images: product.images,
                // primary_image: product.primary_image,
                // Note: You may need to handle image duplication separately
                // depending on your backend API
            }
            
            const url = `${import.meta.env.VITE_API_BASE_URL}/shops/product-list-create/`
            const config = {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
            }
            
            await api.post(url, duplicatedProduct, config)
            
            toaster.create({
                title: 'Success',
                description: 'Product duplicated successfully',
                type: 'success',
                duration: 3000,
            })
            
            // Refresh the product list
            if (refetch) {
                refetch()
            } else {
                window.location.reload()
            }
        } catch (error: any) {
            console.error("duplication failed", error.response?.data || error.message)
            toaster.create({
                title: 'Duplication Failed',
                description: error.response?.data?.message || 'Failed to duplicate product',
                type: 'error',
                duration: 3000,
            })
        }
    }
    
    return (
        <Box mt={"20px"} mx={"auto"}>
            <Button>
                <Link to={"/management/products/add-new-products"}><strong>Add New Products</strong></Link>
            </Button>
            <Table.Root size={"sm"} striped showColumnBorder>
                <Table.Header>
                    <Table.Row>
                        <Table.ColumnHeader textAlign={"center"} fontSize={{base:'12px', md:"16px"}}>Name</Table.ColumnHeader>
                        <Table.ColumnHeader textAlign={"center"} fontSize={{base:'12px', md:"16px"}}>Quantity</Table.ColumnHeader>
                        <Table.ColumnHeader textAlign={"center"} fontSize={{base:'12px', md:"16px"}}>Price</Table.ColumnHeader>
                        <Table.ColumnHeader textAlign={"center"} fontSize={{base:'12px', md:"16px"}}>Sale Price</Table.ColumnHeader>
                        <Table.ColumnHeader textAlign={"center"} fontSize={{base:'12px', md:"16px"}}>Discount End At</Table.ColumnHeader>
                        <Table.ColumnHeader textAlign={"center"} fontSize={{base:'12px', md:"16px"}}>Category</Table.ColumnHeader>
                        <Table.ColumnHeader textAlign={"center"} fontSize={{base:'12px', md:"16px"}}>Properties</Table.ColumnHeader>
                        <Table.ColumnHeader textAlign={"center"} fontSize={{base:'12px', md:"16px"}}>Images</Table.ColumnHeader>
                        <Table.ColumnHeader textAlign={"center"} fontSize={{base:'12px', md:"16px"}}>Action</Table.ColumnHeader>
                    </Table.Row>
                </Table.Header>
                <Table.Body>   
                {products && products
                .filter((product: any) => product.shop_id === shopId)
                .map((p: any) => (
                    <Table.Row key={p.id}>
                        <Table.Cell fontSize={{base:'12px', md:"14px"}}>{p.name}</Table.Cell>
                        <Table.Cell fontSize={{base:'12px', md:"14px"}}>{p.quantity}</Table.Cell>
                        <Table.Cell fontSize={{base:'12px', md:"14px"}}>{p.price}</Table.Cell>
                        <Table.Cell fontSize={{base:'12px', md:"14px"}}>{p.new_price}</Table.Cell>
                        <Table.Cell fontSize={{base:'12px', md:"14px"}}>{formatDate(p.discount_end_at)}</Table.Cell>
                        <Table.Cell fontSize={{base:'12px', md:"14px"}}>{getCategoryNames(p.category)}</Table.Cell>
                        <Table.Cell fontSize={{base:'12px', md:"14px"}}>{getPropertyNames(p.properties)}</Table.Cell>
                        <Table.Cell fontSize={{base:'12px', md:"14px"}}>
                            {p.primary_image ? (
                            <Image 
                                src={`${import.meta.env.VITE_API_BASE_URL}${p.primary_image}`} 
                                w={{base:"40px", md:"60px"}}
                                h={{base:"40px", md:"60px"}}
                                fit={"fill"}
                                objectFit="cover"
                            />
                        ) : (
                            ""
                        )}
                        </Table.Cell>
                        <Table.Cell>
                            <Menu.Root>
                                <Menu.Trigger asChild>
                                    <Button variant="plain" size="sm">
                                        Edit
                                    </Button>
                                </Menu.Trigger>
                                <Portal>
                                    <Menu.Positioner>
                                    <Menu.Content>
                                        <Menu.Item value="new-win" onClick={() => handleDuplicate(p)}>Duplicate</Menu.Item>
                                        <Menu.Item value="new-txt" onClick={() => handleUpdate(p.shop_id, p.id)}>Update</Menu.Item>
                                        <Menu.Item value="new-file" onClick={() => handleDeleteProduct(p.id)}>Delete</Menu.Item>
                                    </Menu.Content>
                                    </Menu.Positioner>
                                </Portal>
                            </Menu.Root> 
                        </Table.Cell>
                    </Table.Row>
                ))}
                </Table.Body>
            </Table.Root>
        </Box>
    )
}

export default ProductPage