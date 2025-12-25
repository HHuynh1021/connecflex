import { Box, Container, Tabs } from '@chakra-ui/react'
import ProductListPage from './ProductListPage'
import ShopListPage from './ShopListPage'

const HomePage = () => {
  return (
    <Container maxW={'1100px'} p={"10px"}>
        <Tabs.Root defaultValue="product">
            <Tabs.List>
                <Tabs.Trigger value='product' fontSize={"18px"}>Products</Tabs.Trigger>
                <Tabs.Trigger value='shop' fontSize={"18px"}>Shops</Tabs.Trigger>
            </Tabs.List>
            <Tabs.Content value='product'>
                <ProductListPage/>
            </Tabs.Content>
            <Tabs.Content value='shop'>
                <ShopListPage/>
            </Tabs.Content>
        </Tabs.Root>
    </Container>
  )
}

export default HomePage