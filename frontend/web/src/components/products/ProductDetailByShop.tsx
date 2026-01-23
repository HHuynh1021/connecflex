import { useEffect, useState } from "react"
import { Box, Heading, Image, Text, HStack, VStack, Stack, Container, Wrap, Center, IconButton, Spinner, Badge, Grid, List, Strong, Collapsible, Avatar, useAvatar, Button, Input } from "@chakra-ui/react"
import { toaster } from "@/components/ui/toaster"
import { useNavigate, useParams } from "react-router"
import { useDispatch, useSelector } from 'react-redux'
import api from "../../services/api"
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
import axios from "axios"
import useCustomer from "../guestUsers/CustomerHook"

interface CountdownTimerProps {
  targetDate: string | null;
  onExpire?: () => void;
}
interface ProductImage {
    id: string
    media: string
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
    properties: string[]; // Array of property IDs
    shop_owner_id: string
    primary_image: string
    images: ProductImage[]
}
interface OtherProduct {
    id: string
    name: string
    shop_id: string
    images: ProductImage[]
    description: string
    price: number
    new_price: number;
    currency_unit: string;
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
    product_price: number

}
interface CustomerProp {
    id: string
    user: string
    ful_name: string
    birth_date: string
    email: string
    phone: string
    address: string
    contact: string
    avata: string
    created_at: string

}
const ProductDetailByShop: React.FC = () => {
    const Navigate = useNavigate()
    const { productId, shopId } = useParams()
    const { shops } = useShop(shopId || "")

    const {customers, loading} = useCustomer()

    // Helper function to construct full image URL
    const getImageUrl = (imagePath: string | null | undefined): string | null => {
        if (!imagePath) return null;
        if (imagePath.startsWith('http')) return imagePath;
        const baseUrl = import.meta.env.VITE_API_BASE_URL || '';
        return `${baseUrl}${imagePath}`;
    }

    const [otherProducts, setOtherProducts] = useState<OtherProduct[]>([])
    const [products, setProducts] = useState<Product[]>([])
    const [selectedImageId, setSelectedImageId] = useState<string>("")
    const [selectedProductId, setSelectedProductId] = useState<string>("")
    const [isMore, setIsMore] = useState<boolean>(false)
    const [isLess, setIsLess] = useState<boolean>(false)
    
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [error, setError] = useState<string>("")
    const [currentImageIndex, setCurrentImageIndex] = useState<{ [key: string]: number }>({})
    const [quantity, setQuantity] = useState<number>(1)
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

    useEffect(() => {
        setOrderNumber(`ORD-${Math.random().toString(36).substr(2,9)}`.toUpperCase())
    }, []);
    
    const openGoogleMaps = (address: string) => {
        const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`
        window.open(url, '_blank')
    }

    const fetchProductList = async () => {
        try {
            const url = `${import.meta.env.VITE_API_BASE_URL}/shops/product-list-view/`
            const res = await axios.get(url)
            const data = res.data
            const filter = data.filter((p: Product) => p.id === productId)
            // console.log("product detail data: ", filter)
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

    useEffect(() => {
        let isMounted = true
        const loadProducts = async () => {
            if (isMounted) {
                await fetchProductList()
            }
        }
        loadProducts()
        return () => {
            isMounted = false
        }
    }, [productId])


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
    
    const buyProducts = async (e: React.FormEvent, product: string, shop: string, customer: string, price: number,  quantity: number, order_number: string) => {
        e.preventDefault()
        if (customer === undefined || !userInfo || !user || !accessToken){
            alert("Please Login to buy products")
            // Navigate("/login")
        }
        if (quantity <= 0) {
            alert("Please enter a valid quantity")
            return
        }
        const url = `${import.meta.env.VITE_API_BASE_URL}/shops/order-create/`
            
        try {
            await api.post(url,
                {
                    product: product,
                    shop: shop,
                    customer: customer,
                    product_price: price,
                    quantity: quantity,
                    order_number: order_number,
                    order_status: "Pending",

                }, 
                {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
            })
            alert("Add the product successfully")
            setQuantity(1)
        }catch(error: any){
            console.error("buyProduct error", error.response.data || error.message)
        }
    }
    const customer = userInfo ? (customers.find((c:any) => c.user === userInfo.id) as CustomerProp | undefined) : undefined
    // console.log("customer: ", customer)

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
                                    <Avatar.Image src={getImageUrl(shop.logo)}/>
                                </Avatar.Root>
                                <Heading>{shop.name}</Heading>
                            </HStack>
                            <Image src={getImageUrl(shop.banner)} maxH={"200px"} w={"100%"} fit={"fill"} rounded={"5px"}/>
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
                                    {/* <HStack flexBasis={{base:"100%", md: "49%"}} p={"10px"} rounded={'7px'} h={{md: "520px", base:"420px"}}
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
                                        
                                    </HStack> */}
                                    <Box flexBasis={{base:"100%", md: "45%"}} maxH={{md: "520px", base:"720px"}}>
                                        {p.images && p.images.length > 0 ? (
                                            (() => {
                                                const currentImage = getCurrentImageOtherProduct(p.id, p.images)
                                                const hasMultipleImages = p.images.length > 1
                                                const currentIndex = currentImageIndex[p.id] || 0
                    
                                                return (
                                                    <Box 
                                                        border="1px solid"
                                                        rounded="5px"
                                                        overflow="hidden"
                                                        shadow="md"
                                                        w={"100%"}
                                                        h={"100%"}
                                                    >
                                                        {/* Image Gallery */}
                                                        <Box position="relative" w={{base:"100%", md: "100%"}} h={{md: "100%", base:"400px"}}>
                                                        
                                                            {currentImage ? (
                                                                <Image 
                                                                    w="100%" 
                                                                    h="100%" 
                                                                    src={getImageUrl(currentImage.media)} 
                                                                    alt={p.name}
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
                                                                        onClick={(e) => handlePrevImage(e, p.id, p.images)}
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
                                                                        onClick={(e) => handleNextImage(e, p.id, p.images)}
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
                                                                    {currentIndex + 1} / {p.images.length}
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
                                                                    {p.images.map((_, idx) => (
                                                                        <Box
                                                                            key={idx}
                                                                            w="8px"
                                                                            h="8px"
                                                                            borderRadius="full"
                                                                            bg={currentIndex === idx ? "white" : "whiteAlpha.500"}
                                                                            cursor="pointer"
                                                                            transition="all 0.2s"
                                                                            onClick={(e) => {
                                                                                e.stopPropagation()
                                                                                handleDotClick(p.id, idx)
                                                                            }}
                                                                            _hover={{ 
                                                                                bg: currentIndex === idx ? "white" : "whiteAlpha.700",
                                                                                transform: "scale(1.2)"
                                                                            }}
                                                                        />
                                                                    ))}
                                                                </HStack>
                                                            )}
                                                        </Box>
                                                    </Box>
                                                )
                                            })()
                                        ) : p.primary_image ? (
                                            <Box 
                                                border="1px solid"
                                                rounded="5px"
                                                overflow="hidden"
                                                shadow="md"
                                                w={"100%"}
                                                h={"100%"}
                                            >
                                                <Box position="relative" w={{base:"100%", md: "100%"}} h={{md: "100%", base:"400px"}}>
                                                    <Image 
                                                        w="100%" 
                                                        h="100%" 
                                                        src={getImageUrl(p.primary_image)}
                                                        alt={p.name}
                                                        fit={"fill"}
                                                    />
                                                </Box>
                                            </Box>
                                        ) : (
                                            <Center w="full" h="400px">
                                                <Box textAlign="center">
                                                    <Text fontSize="lg" color="gray.600" mb={2}>
                                                        No Image Available
                                                    </Text>
                                                </Box>
                                            </Center>
                                        )}
                                    </Box>
                                    {/* Right Side - Product Details */}
                                    <Stack gap={"5px"} flexBasis={{base:"100%", md: "50%"}} maxH={{md: "520px", base:"720px"}}
                                        shadow={"sm"} rounded={'5px'} p={"20px"}>
                                        <Heading fontSize={"24px"} fontWeight={"bold"}>
                                            {p.name}
                                        </Heading>
                                        
                                        {shops && shops.map((s: ShopDataProps) => (
                                            <Box key={s.id}>
                                                <form onSubmit={(e) => buyProducts(e, p.id, s.id, customer?.id || "", p.new_price > 0 ? p.new_price : p.price,  quantity, orderNumber)}>
                                                    <HStack gap={"10px"} justifyContent={"flex-start"}>
                                                        <label htmlFor="quantiy">Qty</label>
                                                        <Input
                                                            value={quantity}
                                                            type="number"
                                                            onChange={(e)=> setQuantity(Number(e.target.value))}
                                                            border={"1px solid"}
                                                            w={"70px"}
                                                            p={"5px"}
                                                            rounded={"5px"}
                                                            step={"1"}
                                                            id="quantity"
                                                        />
                                                        <Button type="submit">Buy this product</Button>
                                                    </HStack>
                                                </form>
                                            </Box>
                                        ))}
                                        <List.Root gap={2} variant={"plain"} align="center">
                                            <List.Item>
                                                <List.Indicator color={"red"}>
                                                    <FaShop/>
                                                </List.Indicator>
                                                <HStack>
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
                                        {p.new_price > 0 ? (
                                            <List.Root gap={2} variant={"plain"} align={"center"}>
                                                <List.Item>
                                                    <List.Indicator asChild color="red.500"><LuCircleCheck /></List.Indicator>
                                                    <Text color={"red.500"}>Sale Price: {p.new_price} {p.currency_unit}</Text>
                                                </List.Item>
                                                <List.Item>
                                                    <List.Indicator asChild color="green.500"><LuCircleCheck /></List.Indicator>
                                                    <Text textDecor={"line-through"} fontWeight={"bold"}>Normal Price: {p.price} €</Text>
                                                </List.Item>
                                                <List.Item>
                                                    <List.Indicator asChild color="green.500"><LuCircleCheck /></List.Indicator>
                                                    <Text fontWeight={"bold"} color={"red.700"}>Save: {(p.price - p.new_price).toFixed(2)} €</Text>   
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
                                            <List.Root variant="plain" align="center">
                                                <List.Item>
                                                    <List.Indicator asChild color="green.500"><LuCircleCheck /></List.Indicator>
                                                    <Text color={"blue"}>Price: {p.price} {p.currency_unit}</Text>
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
                                                {p.warranty && 
                                                    <List.Item>
                                                        <List.Indicator asChild color="green.500"><LuCircleCheck /></List.Indicator>
                                                        Warranty: <Strong px={"10px"}>{p.warranty}</Strong>
                                                    </List.Item>
                                                }
                                            </List.Root>
                                        </Box>
                                        <Text onClick={MoreDetail} cursor={"pointer"} fontStyle={"italic"} fontWeight={"bold"}>more details ...</Text>
                                    </Stack>
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
                <Box shadow={"sm"} rounded={"7px"} w={"100%"}> 
                    <Heading textAlign={{base: "center", md:"start"}} p={"20px"} fontWeight={"bold"}>
                        More Products from This Shop
                    </Heading>
                    <Wrap justify={"space-evenly"}>
                        {otherProducts.length > 0 ? (
                            otherProducts
                            .filter((p: OtherProduct) => p.shop_id === shopId)
                            .map((p: OtherProduct) => {
                                const primaryImage = getPrimaryImage(p.images)
                                return (
                                    <Box key={p.id} cursor={"pointer"} w={"130px"} h={"190px"} shadow={"sm"} position={"relative"}
                                        onClick={() => handleProductClick(p.id)}>
                                        <Box p={"5px"}>
                                            <Image src={getImageUrl(primaryImage?.media || "")} w={"100%"} h={"130px"}/>
                                        </Box>
                                        {p.new_price > 0 ? (<Avatar.Root position={"absolute"} top={0} right={0}>
                                            <Avatar.Image src="https://img.icons8.com/color/48/discount--v1.png"/>
                                        </Avatar.Root>):("")}
                                        <Box p={"5px"}>
                                            {p.new_price > 0 ? (
                                                <Box>
                                                    <Text color={"red"}>{p.new_price} {p.currency_unit}</Text>
                                                    <Text color={"blue"} textDecor={"line-through"}>{p.price} {p.currency_unit}</Text>
                                                </Box>
                                            ):(
                                                <Text color={"blue"}>{p.price} {p.currency_unit}</Text>
                                            )}
                                        </Box>  
                                    </Box>
                            )

                        })) : ( 
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