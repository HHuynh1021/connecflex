import { Box, Container, Tabs } from '@chakra-ui/react'
import ProductListPage from './ProductListPage'
import ShopListPage from './ShopListPage'

const HomePage = () => {
  return (
    <Container>
        <Tabs.Root defaultValue="product">
            <Tabs.List>
                <Tabs.Trigger value='product'>Products</Tabs.Trigger>
                <Tabs.Trigger value='shop'>Shops</Tabs.Trigger>
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