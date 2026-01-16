import {useEffect, useState} from 'react'
import { useSelector, useDispatch } from 'react-redux'
import type { AppDispatch } from '@/services/store'
import { Box, Image, Table, Text } from '@chakra-ui/react'
import { getUserInfo } from '@/services/authSlice'
import useProductList from '@/components/products/ProductListHook'
import useProduct from '@/components/products/ProductHook'
import useShopAdmin from '@/components/shop/ShopHookAdmin'
import formatDate from '@/components/formatDate'

interface ProductProp {
    id: string
    name: string;
    quantity: number
    shop_id: string;
    description: string;
    price: string;
    new_price: string;
    discount_end_at: string;
    currency_unit: string;
    condition: string
    guaranty: string
    color: string;
    dimension: string;
    weight: string;
    other: string;
    category: string;
    image: string;
    primary_image: string
    shop_owner_id: string
}

const ProductPage = () => {
    const {user, userInfo} = useSelector((state: any) => state.auth)
    const dispatch = useDispatch<AppDispatch>()
    const { products, isLoading } = useProductList()
    const {shops} = useShopAdmin()

    console.log("products: ", products)

    useEffect(() => {
        if (user && (!userInfo || Object.keys(userInfo).length === 0)) {
            dispatch(getUserInfo(undefined))
        }
    }, [dispatch, user, userInfo])
    
    const shopId = shops.find((shop: any) => shop.shop_account === userInfo?.id)?.id
    console.log("shopId:", shopId)
    console.log("shops:", shops)
    console.log("userInfo:", userInfo)
  return (
    <Box mt={"20px"}>
        <Table.Root>
            <Table.Header>
                <Table.Row>
                    <Table.ColumnHeader>Name</Table.ColumnHeader>
                    <Table.ColumnHeader>Quantiy</Table.ColumnHeader>
                    <Table.ColumnHeader>Price</Table.ColumnHeader>
                    <Table.ColumnHeader>Sale Price</Table.ColumnHeader>
                    <Table.ColumnHeader>Discount End At</Table.ColumnHeader>
                    <Table.ColumnHeader>Category</Table.ColumnHeader>
                    <Table.ColumnHeader>Images</Table.ColumnHeader>
                </Table.Row>
            </Table.Header>
            <Table.Body>   
            {products && products
            .filter((product: ProductProp) => product.shop_id === shopId)
            .map((p: ProductProp) => (
                <Table.Row key={p.id}>
                    <Table.Cell>{p.name}</Table.Cell>
                    <Table.Cell>{p.quantity}</Table.Cell>
                    <Table.Cell>{p.price}</Table.Cell>
                    <Table.Cell>{p.new_price}</Table.Cell>
                    <Table.Cell>{formatDate(p.discount_end_at)}</Table.Cell>
                    <Table.Cell>{p.category}</Table.Cell>
                    <Table.Cell>
                        {p.primary_image ? (
                        <Image 
                            src={`${import.meta.env.VITE_API_BASE_URL}${p.primary_image}`} 
                            w="40px" 
                            h="40px"
                            objectFit="cover"
                        />
                    ) : (
                        <Box w="40px" h="40px" bg="gray.200" />
                    )}
                    </Table.Cell>
                </Table.Row>
            ))}
            </Table.Body>
        </Table.Root>
    </Box>
  )
}

export default ProductPage