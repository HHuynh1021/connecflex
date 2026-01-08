import { useEffect, useState } from "react"
import { Box, Heading, Image, Text, HStack, VStack, Stack, Container, Wrap, Center, IconButton, Spinner, Badge, Grid, List, Strong, Collapsible, Avatar, useAvatar, Button } from "@chakra-ui/react"
import { toaster } from "@/components/ui/toaster"
import { useNavigate, useParams } from "react-router"
import { useDispatch, useSelector } from 'react-redux'
import api from "../../services/api"
import NavBarShop from "@/components/shop/NavBarShop"
import MultipleProductImages from "./MultipleProductImages"
import { GiShop } from "react-icons/gi"
import { MdEmail } from "react-icons/md"
import { BsFillTelephoneOutboundFill } from "react-icons/bs"
import useShop from "@/components/shop/ShopHook"
import useProduct from "./ProductListHook"
import { ChevronLeft, ChevronRight } from "lucide-react"
import formatDate from "../formatDate"
import { LuCircleCheck, LuCircleDashed } from "react-icons/lu"
import { FaShop } from "react-icons/fa6";
import Countdown from "../Countdown"
import useAccessToken from "@/services/token"
import { getUserInfo } from "@/services/authSlice"

interface CountdownTimerProps {
  targetDate: string | null;
  onExpire?: () => void;
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
    discount:number
    images: ProductImage[]
}
interface OtherProduct {
    id: string
    name: string
    shop_id: string
    images: ProductImage[]
    description: string
    price: string
    category: string
}

interface ShopDataProps {
    id: string
    name: string
    email: string
    street: string
    province: string
    city: string
    state: string
    zipcode: string
    country: string
    address: string
    phone: string
    description: string
    industry: string
    logo: string
    banner: string
    template: string
}
interface OrderProp {
    product: string;
    shop: string
    customer: string
    shop_name: string
    product_name: string
    customer_name: string
    order_number: string
    order_status: string
    order_data: string
    order_updated_at: string

}
const ProductDetailByShop: React.FC = () => {
    const Navigate = useNavigate()
    const { productId, shopId } = useParams()
    const { shops } = useShop(shopId || "")
    const [otherProducts, setOtherProducts] = useState<OtherProduct[]>([])
    const [products, setProducts] = useState<Product[]>([])
    const [selectedImageId, setSelectedImageId] = useState<string>("")
    const [selectedProductId, setSelectedProductId] = useState<string>("")
    const [isMore, setIsMore] = useState<boolean>(false)
    const [isLess, setIsLess] = useState<boolean>(false)
    
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [error, setError] = useState<string>("")
    const [currentImageIndex, setCurrentImageIndex] = useState<{ [key: string]: number }>({})
    const [orderNumber, setOrderNumber] = useState<string>("")
    
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const { user, userInfo } = useSelector((state: any) => state.auth)
    const accessToken = useAccessToken(user)
    const [orders, setOrders] = useState<OrderProp>([])

    useEffect(() => {
        if (!user || !user.access) {
        return;
        }

        if (user.access && !userInfo) {
        dispatch(getUserInfo() as any);
        }
    }, [user, userInfo, navigate, dispatch]);
    
    const openGoogleMaps = (address: string) => {
        const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`
        window.open(url, '_blank')
    }

    const fetchProductList = async () => {
        try {
            const url = `${import.meta.env.VITE_API_BASE_URL}/shops/product-list-view/`
            const res = await api.get(url)
            const data = res.data
            const filter = data.filter((p: Product) => p.id === productId)
            setProducts(filter)
            const otherProducts = data.filter((o: Product) => o.id !== productId)
            setOtherProducts(otherProducts)
            // Set initial selected image to primary or first image
            if (filter.length > 0 && filter[0].images.length > 0) {
                const primaryImage = filter[0].images.find((img: ProductImage) => img.is_primary)
                setSelectedImageId(primaryImage?.id || filter[0].images[0].id)
            }
        } catch (error) {
            console.error("Failed to fetch product:", error)
        }
    }

    // useEffect(() => {
    //     let isMounted = true
    //     const loadProducts = async () => {
    //         if (isMounted) {
    //             await fetchProductList()
    //         }
    //     }
    //     loadProducts()
    //     return () => {
    //         isMounted = false
    //     }
    // }, [productId])
    useEffect(()=>{
        fetchProductList()
    },[])

    const getCurrentImageOtherProduct = (product: string, images: ProductImage[]) => {
        if (!images || images.length === 0) return null
        const index = currentImageIndex[product] || 0
        return images[index] || images[0]
    }

    // Navigate to previous image
    const handlePrevImage = (e: React.MouseEvent, product: string, images: ProductImage[]) => {
        e.stopPropagation()
        const currentIndex = currentImageIndex[product] || 0
        const prevIndex = currentIndex === 0 ? images.length - 1 : currentIndex - 1
        setCurrentImageIndex(prev => ({ ...prev, [product]: prevIndex }))
    }

    // Navigate to next image
    const handleNextImage = (e: React.MouseEvent, product: string, images: ProductImage[]) => {
        e.stopPropagation()
        const currentIndex = currentImageIndex[product] || 0
        const nextIndex = (currentIndex + 1) % images.length
        setCurrentImageIndex(prev => ({ ...prev, [product]: nextIndex }))
    }

    // Navigate to specific image
    const handleDotClick = (product: string, index: number) => {
        setCurrentImageIndex(prev => ({ ...prev, [product]: index }))
    }

    // Get primary image or first image
    const getPrimaryImage = (images: ProductImage[]) => {
        if (!images || images.length === 0) return null
        return images.find(img => img.is_primary) || images[0]
    }

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

    const handleImageClick = (imageId: string) => {
        setSelectedImageId(imageId)
    }
    const handleProductClick = (productId: string) => {
        Navigate(`/product-page/${shopId}/${productId}`)
        setSelectedProductId(productId)
    }
    const MoreDetail = () => {
        setIsMore(true)
    }
    const LessDetail = () => {
        setIsMore(false)
    }

    const ReturnShopHomePage = (shopId: string)=> {
        Navigate(`/shop-page/templates/${shopId}`)
    }

    console.log("order_number: ", orderNumber)
    

    const buyProducts = async (product: string, shop: string, customer: string, order_number: string) => {
        if (!userInfo){
            alert("Please Login to buy products")
        }
        const url = `${import.meta.env.VITE_API_BASE_URL}/shops/order-create/`
            
        try {
            await api.post(url,
                {
                    product: product,
                    shop: shop,
                    customer: customer,
                    order_number: order_number,
                    order_status: "Pending",

                }, 
                {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
            })
            toaster.create({
                title: 'Success',
                description: `Product ${orders.product_name} added successfully`,
                type: 'success',
                duration: 3000,
            })
            // setFormData({
            //     product: "",
            //     shop: "",
            //     customer: "",
            //     shop_name: "",
            //     product_name: "",
            //     customer_name: "",
            //     order_number: "",
            //     order_status: "",
            //     order_data: "",
            //     order_updated_at: "",
            // })
        }catch(error: any){
            console.error("buyProduct error", error.response.data || error.message)
        }
    }
    const [isClick, setIsClick] = useState<boolean>(false)
    const handleClick = ()=>{
        setIsClick(true)
    }
    return (
        <Container maxW={'1100px'} p={"10px"}>
            <Stack>
                {/* nav and banner */}
                <Box mb={"30px"}>
                    {shops && shops.map((shop: ShopDataProps) => (
                        <Box key={shop.id} onClick={() => ReturnShopHomePage(shop.id)} cursor={"pointer"}>
                            {/* <NavBarShop logo={shop.logo} name={shop.name} /> */}
                            <HStack justifyContent={"center"}>
                                <Avatar.Root>
                                    <Avatar.Image src={shop.logo}/>
                                </Avatar.Root>
                                <Heading>{shop.name}</Heading>
                            </HStack>
                            <Image src={shop.banner} maxH={"200px"} w={"100%"} fit={"fill"} rounded={"5px"}/>
                        </Box>
                    ))}
                </Box>
    
                <Box>
                    {products.length > 0 ? (
                        products.map((p: Product) => {
                            // Sort images by order
                            const sortedImages = [...p.images].sort((a, b) => a.order - b.order)
                            const selectedImage = sortedImages.find(img => img.id === selectedImageId)
        
                            return (
                                <Wrap key={p.id} justify={{md: "space-between", base: "center"}} maxW={"100%"}>
                                    {/* Left Side - Images */}
                                    <HStack flexBasis={{base:"100%", md: "49%"}} p={"10px"} rounded={'7px'} h={{md: "520px", base:"420px"}}
                                        shadow={"2px 2px 25px 2px rgb(75, 75, 79)"}>
                                            {sortedImages.length > 1 && (
                                                <VStack h={"inherit"} py={"10px"} 
                                                    justifyContent={"space-between"} overflow="auto">
                                                    {sortedImages.map((image: ProductImage) => (
                                                        <Box justifyContent={"space-between"}
                                                            key={image.id}
                                                            onClick={() => handleImageClick(image.id)}
                                                            cursor="pointer"
                                                            border={"1px solid"}
                                                            rounded={"5px"}
                                                            transition="all 0.2s"
                                                            _hover={{ borderColor: "blue.400", transform: "scale(1.05)" }}
                                                        >
                                                            <Image 
                                                                src={image.image} 
                                                                w="80px" 
                                                                h="100px" 
                                                                fit={"fill"}
                                                            />
                                                        </Box>
                                                    ))}
                                                </VStack>
                                            )}
                                            {selectedImage && (
                                                <Box 
                                                    borderWidth="1px" 
                                                    borderRadius="lg" 
                                                    overflow="hidden"
                                                    py={"10px"}
                                                    // w={"80%"}
                                                    h={"inherit"}
                                                >
                                                    <Image 
                                                        src={selectedImage.image} 
                                                        w={{md:"400px", base:"300px"}}
                                                        h={{md:"500px", base: "400px"}}
                                                        fit="fill"
                                                    />
                                                </Box>
                                            )}
                                        
                                    </HStack>
                                    {/* Right Side - Product Details */}
                                    <VStack align="start" gap={"10px"} flexBasis={{base:"100%", md: "50%"}} maxH={{md: "520px", base:"720px"}}
                                        shadow={"2px 2px 25px 2px rgb(75, 75, 79) "} rounded={'7px'} p={"10px"}>
                                        <Heading fontSize={"24px"} fontWeight={"bold"}>
                                            {p.name}
                                        </Heading>
                                        
                                        {shops && shops.map((s: ShopDataProps) => (
                                            <Box key={s.id} border={"1px solid"} rounded={"5px"}>
                                                <Button onClick={() => buyProducts(p.name, s.name, userInfo?.id, orderNumber)}>Buy this product</Button>
                                            </Box>
                                        ))}
                                        <List.Root gap={2} variant={"plain"}>
                                            <List.Item>
                                                <HStack>
                                                    <Box color={"red"}>
                                                        <FaShop/>
                                                    </Box>
                                                    <Collapsible.Root>
                                                        <Collapsible.Trigger
                                                            fontSize={"16px"}
                                                            cursor={"pointer"} 
                                                            transition="all 0.2s"
                                                            _hover={{ borderColor: "blue.400", transform: "scale(1.05)", color:"red" }}  
                                                            color={"black.200"}
                                                            textDecorationLine={"underline"}
                                                            textDecorationColor={"blue.600"}
                                                            
                                                        >
                                                            Shop's contact details
                                                        </Collapsible.Trigger>
                                                        <Collapsible.Content>
                                                            <Box>
                                                                {shops && shops.map((shop: ShopDataProps) => (
                                                                    <Box key={shop.id} border={"1px solid"} rounded={"5px"}>
                                                                        <Stack p="10px" rounded="5px" w={{ base: "100%", md: "fit-content" }}minW="250px">
                                                                            <HStack>
                                                                                <GiShop />
                                                                                <Text 
                                                                                    onClick={() => openGoogleMaps(shop.address)} 
                                                                                    cursor="pointer"
                                                                                    fontSize="sm"
                                                                                    _hover={{ textDecoration: "underline", color: "blue.500" }}
                                                                                >
                                                                                    {shop.address}
                                                                                </Text>
                                                                                </HStack>
                                                                                <HStack>
                                                                                <MdEmail />
                                                                                <a 
                                                                                    href={`mailto:${shop.email}`}
                                                                                    style={{ fontSize: '14px', color: 'inherit' }}
                                                                                >
                                                                                    {shop.email}
                                                                                </a>
                                                                                </HStack>
                                                                                <HStack>
                                                                                <BsFillTelephoneOutboundFill />
                                                                                <a 
                                                                                    href={`tel:${shop.phone}`}
                                                                                    style={{ fontSize: '14px', color: 'blue' }}
                                                                                >
                                                                                    {shop.phone}
                                                                                </a>
                                                                            </HStack>
                                                                        </Stack>
                                                                        
                                                                    </Box>
                                                                ))}
                                                            </Box>                            
                                                        </Collapsible.Content>
                                                    </Collapsible.Root>
                                                </HStack>
                                            </List.Item>
                                        </List.Root> 
                                        {parseFloat(p.new_price) > 0 ? (
                                            <List.Root gap={2} variant={"plain"} align={"center"}>
                                                <List.Item>
                                                    <HStack fontSize="18px" fontWeight="bold" color="blue.500">
                                                        <List.Indicator asChild color="green.500"><LuCircleCheck /></List.Indicator>
                                                        <Text>
                                                            Price: {p.new_price}
                                                        </Text>
                                                        <Text>{p.currency_unit}</Text>
                                                    </HStack>
                                                </List.Item>
                                                <List.Item>
                                                    <List.Indicator asChild color="green.500"><LuCircleCheck /></List.Indicator>
                                                    <Text textDecor={"line-through"} fontWeight={"bold"}>Normal Price: {p.price} €</Text>
                                                </List.Item>
                                                <List.Item>
                                                    <List.Indicator asChild color="green.500"><LuCircleCheck /></List.Indicator>
                                                    <Text fontWeight={"bold"} color={"red.700"}>Save: {p.discount} €</Text>   
                                                </List.Item>                            
                                                <List.Item>
                                                    <List.Indicator asChild color="green.500"><LuCircleCheck /></List.Indicator>
                                                    <Text fontStyle={"italic"}>Valid to: {formatDate(p.discount_end_at)}</Text>   
                                                </List.Item>
                                                <List.Item>
                                                    <List.Indicator asChild color="green.500"><LuCircleCheck /></List.Indicator> 
                                                    <HStack gap={"20px"}>
                                                        <Text>Remain Time: </Text>
                                                        <Countdown targetDate={p.discount_end_at} onExpire={fetchProductList}/>
                                                    </HStack>
                                                       
                                                </List.Item>
                                            </List.Root>                       
                                        ):(
                                            <List.Root>
                                                <List.Item>
                                                    <HStack fontSize="18px" fontWeight="bold" color="blue.500">
                                                        <List.Indicator asChild color="green.500"><LuCircleCheck /></List.Indicator>
                                                        <Text>Price: {p.price}</Text>
                                                        <Text>{p.currency_unit}</Text>
                                                    </HStack>
                                                </List.Item>
                                            </List.Root>
                                        )}  
                                                                    
                                        <Box w={"100%"} >
                                            <Heading fontSize="18px" mb={"10px"} textDecor={"underline"}>Description: </Heading>
                                            <List.Root h={"fit-content"} w={"100%"} pl={"20px"} variant={"plain"}>
                                                {p.condition && 
                                                    <List.Item>
                                                        <List.Indicator asChild color="green.500"><LuCircleCheck /></List.Indicator>
                                                        Condition: <Strong px={"10px"}>{p.condition}</Strong>
                                                    </List.Item>
                                                }
                                                {p.guaranty && 
                                                    <List.Item>
                                                        <List.Indicator asChild color="green.500"><LuCircleCheck /></List.Indicator>
                                                        Guaranty: <Strong px={"10px"}>{p.guaranty}</Strong>
                                                    </List.Item>
                                                }
                                                {p.color && 
                                                    <List.Item>
                                                        <List.Indicator asChild color="green.500"><LuCircleCheck /></List.Indicator>
                                                        Color: <Strong px={"10px"}>{p.color}</Strong>
                                                    </List.Item>
                                                }
                                                {p.weight && 
                                                    <List.Item>
                                                        <List.Indicator asChild color="green.500"><LuCircleCheck /></List.Indicator>
                                                        Weight: <Strong px={"10px"}>{p.weight}</Strong>
                                                    </List.Item>
                                                }
                                                {p.dimension && 
                                                    <List.Item>
                                                        <List.Indicator asChild color="green.500"><LuCircleCheck /></List.Indicator>
                                                        Dimensions: <Strong px={"10px"}>{p.dimension}</Strong>
                                                    </List.Item>
                                                }
                                                {p.other && 
                                                    <List.Item>
                                                        <List.Indicator asChild color="green.500"><LuCircleCheck /></List.Indicator>
                                                        Others: <Strong px={"10px"}>{p.other}</Strong>
                                                    </List.Item>
                                                }
                                                {/* {p.description && 
                                                    <List.Item overflow={"hidden"} h={"50px"}>
                                                        <List.Indicator asChild color="green.500"><LuCircleCheck/></List.Indicator>
                                                        {p.description}
                                                    </List.Item>
                                                } */}
                                            </List.Root>
                                        </Box>
                                        <Text onClick={MoreDetail} cursor={"pointer"} fontStyle={"italic"} fontWeight={"bold"}>more details ...</Text>
                                    </VStack>
                                    {isMore && (
                                        <Box p={"20px"} shadow={"2px 2px 25px 2px rgb(75, 75, 79) "} rounded={"7px"} w={"100%"}>
                                            <Text textAlign={"justify"} w={'100%'}>{p.description}</Text>
                                            <Text onClick={LessDetail} cursor={"pointer"} fontWeight={"bold"}>less details</Text>    
                                        </Box>
                                    )}
                                </Wrap>
                                
                            )
                        })
                    ) : (
                        <Box p={8} textAlign="center">
                            <Text fontSize="lg" color="gray.500">No Products Found</Text>
                        </Box>
                    )}
                </Box>
                {/* other products */}
                <Box shadow={"2px 2px 25px 2px rgb(75, 75, 79) "} rounded={"7px"} p={"10px"}> 
                    <Heading textAlign={{base: "center", md:"start"}} p={"20px"} fontWeight={"bold"}>
                        More Products from This Shop
                    </Heading>
                    <Wrap gap={"20px"} 
                        justify={{md: "space-between", base:"center"}} cursor={"pointer"}>
                        {otherProducts.length > 0 ? (
                            otherProducts.map((product: OtherProduct) => {
                                const currentImage = getCurrentImageOtherProduct(product.id, product.images)
                                const hasMultipleImages = product.images && product.images.length > 1
                                const currentIndex = currentImageIndex[product.id] || 0
    
                                return (
                                    <Box 
                                        key={product.id}
                                        onClick={() => handleProductClick(product.id)}
                                        border="1px solid"
                                        rounded="5px"
                                        overflow="hidden"
                                        shadow="md"
                                        transition="all 0.2s"
                                        _hover={{ shadow: "lg", transform: "translateY(-2px)" }}
                                        w={{base:"100%", md: "250px"}}
                                    >
                                        {/* Image Gallery */}
                                        <Box position="relative">
                                            {currentImage ? (
                                                <Image 
                                                    w="100%" 
                                                    h="100%" 
                                                    src={currentImage.image}
                                                    alt={product.name}
                                                    fit={"fill"}
                                                />
                                            ) : (
                                                <Center h="100%">
                                                    <Text color="gray.500">No Image</Text>
                                                </Center>
                                            )}
    
                                            {/* Navigation Arrows - Only show if multiple images */}
                                            {hasMultipleImages && (
                                                <>
                                                    <IconButton
                                                        aria-label="Previous image"
                                                        position="absolute"
                                                        left={2}
                                                        top="50%"
                                                        transform="translateY(-50%)"
                                                        onClick={(e) => handlePrevImage(e, product.id, product.images)}
                                                        size="sm"
                                                        colorPalette="blackAlpha"
                                                        variant="solid"
                                                        bg="blackAlpha.600"
                                                        color="white"
                                                        _hover={{ bg: "blackAlpha.800" }}
                                                    >
                                                        <ChevronLeft size={20} />
                                                    </IconButton>
    
                                                    <IconButton
                                                        aria-label="Next image"
                                                        position="absolute"
                                                        right={2}
                                                        top="50%"
                                                        transform="translateY(-50%)"
                                                        onClick={(e) => handleNextImage(e, product.id, product.images)}
                                                        size="sm"
                                                        colorPalette="blackAlpha"
                                                        variant="solid"
                                                        bg="blackAlpha.600"
                                                        color="white"
                                                        _hover={{ bg: "blackAlpha.800" }}
                                                    >
                                                        <ChevronRight size={20} />
                                                    </IconButton>
                                                </>
                                            )}
    
                                            {/* Image Counter */}
                                            {hasMultipleImages && (
                                                <Box
                                                    position="absolute"
                                                    top={2}
                                                    right={2}
                                                    bg="blackAlpha.700"
                                                    color="white"
                                                    px={2}
                                                    py={1}
                                                    borderRadius="md"
                                                    fontSize="sm"
                                                >
                                                    {currentIndex + 1} / {product.images.length}
                                                </Box>
                                            )}
    
                                            {/* Primary Badge */}
                                            {currentImage?.is_primary && (
                                                <Badge
                                                    position="absolute"
                                                    top={2}
                                                    left={2}
                                                    colorPalette="blue"
                                                >
                                                    Primary
                                                </Badge>
                                            )}
    
                                            {/* Dot Indicators */}
                                            {hasMultipleImages && (
                                                <HStack
                                                    position="absolute"
                                                    bottom={2}
                                                    left="50%"
                                                    transform="translateX(-50%)"
                                                    gap={2}
                                                >
                                                    {product.images.map((_, idx) => (
                                                        <Box
                                                            key={idx}
                                                            w="8px"
                                                            h="8px"
                                                            borderRadius="full"
                                                            bg={currentIndex === idx ? "white" : "whiteAlpha.500"}
                                                            cursor="pointer"
                                                            transition="all 0.2s"
                                                            onClick={() => handleDotClick(product.id, idx)}
                                                            _hover={{ 
                                                                bg: currentIndex === idx ? "white" : "whiteAlpha.700",
                                                                transform: "scale(1.2)"
                                                            }}
                                                        />
                                                    ))}
                                                </HStack>
                                            )}
                                        </Box>
                                        
                                        {/* Product Details */}
                                        <Box p={4}>
                                            <Heading size="md" mb={2}>
                                                {product.name}
                                            </Heading>
                                            
                                            {product.category && (
                                                <Text 
                                                    fontSize="sm" 
                                                    color="gray.600" 
                                                    mb={2}
                                                    fontWeight="medium"
                                                >
                                                    {product.category}
                                                </Text>
                                            )}
                                            
                                            {product.description && (
                                                <Text 
                                                    fontSize="sm" 
                                                    color="gray.700" 
                                                    mb={3}
                                                
                                                >
                                                    {product.description}
                                                </Text>
                                            )}
                                            
                                            <Text 
                                                fontSize="xl" 
                                                fontWeight="bold" 
                                                color="blue.600"
                                            >
                                                ${parseFloat(product.price).toFixed(2)}
                                            </Text>
                                        </Box>
                                    </Box>
                                )
                            })
                        ) : (
                            <Center w="full" h="400px">
                                <Box textAlign="center">
                                    <Text fontSize="lg" color="gray.600" mb={2}>
                                        No More Products Yet
                                    </Text>
                                </Box>
                            </Center>
                        )}
                    </Wrap>
                </Box>
                {/* Footer */}
                <Box h={"100px"} borderTop={"2px solid"} mt={"20px"}>
                    {shops && shops.map((shop: ShopDataProps) => (
                        <Box key={shop.id}>
                            <Stack p="10px" rounded="5px" w={{ base: "100%", md: "fit-content" }}minW="250px">
                                <HStack>
                                    <GiShop />
                                    <Text 
                                        onClick={() => openGoogleMaps(shop.address)} 
                                        cursor="pointer"
                                        fontSize="sm"
                                        _hover={{ textDecoration: "underline", color: "blue.500" }}
                                    >
                                        {shop.address}
                                    </Text>
                                    </HStack>
                                    <HStack>
                                    <MdEmail />
                                    <a 
                                        href={`mailto:${shop.email}`}
                                        style={{ fontSize: '14px', color: 'inherit' }}
                                    >
                                        {shop.email}
                                    </a>
                                    </HStack>
                                    <HStack>
                                    <BsFillTelephoneOutboundFill />
                                    <a 
                                        href={`tel:${shop.phone}`}
                                        style={{ fontSize: '14px', color: 'blue' }}
                                    >
                                        {shop.phone}
                                    </a>
                                </HStack>
                            </Stack>
                        </Box>
                    ))}
                    
                </Box>
            </Stack>
        </Container>
    )
}

export default ProductDetailByShop