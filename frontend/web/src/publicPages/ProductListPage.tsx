import { useState, useEffect, useRef } from 'react'
import { apiPublic } from '@/services/api'
import useProductList from '../components/products/ProductListHook'
import { Heading, Image, Wrap, Box, Text, Center, Badge, Container, Avatar, HStack, Button, Spinner, Input, CloseButton, InputGroup } from '@chakra-ui/react'
import { CarTaxiFront, ChevronLeft, ChevronRight } from "lucide-react"
import { useNavigate } from 'react-router'
import { LuSearch } from 'react-icons/lu';

interface ProductImage {
    id: string
    media: string
    is_primary: boolean
    order: number
}

interface ProductListProps {
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
    shop_address: string;
    shop_city: string;
}
const ProductListPage = () => {
    const Navigate = useNavigate()
    const inputRef = useRef(null);

    const { products, isLoading, error } = useProductList()

    const [showProduct, setShowProduct] = useState<ProductListProps[]>([])
    const [category, setCategory] = useState<string>('')
    const [condition, setCondition] = useState<string>('')
    const [sortby, setSortBy] = useState<string>("")
    const [keyword, setKeyWord] = useState<string>("")

     const handleSort = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSortBy(e.target.value)
    }
    
    useEffect (() => {
        if (!products) return

        let filtered = [...products]

        if (category) {
            filtered = filtered.filter(p => p.category === category)
        }

        if (condition) {
            filtered = filtered.filter(p => p.condition === condition)
        }
        if (keyword.trim()) {
            filtered = filtered.filter(p =>
                p.name.toLowerCase().includes(keyword.toLowerCase())
            )
        }
        if (sortby === "lowestPrice") {
            filtered.sort((a, b) => {
                const priceA = a.new_price > 0 ? a.new_price : a.price
                const priceB = b.new_price > 0 ? b.new_price : b.price
                return priceA - priceB
            })
        }

        if (sortby === "highestPrice") {
            filtered.sort((a, b) => {
                const priceA = a.new_price > 0 ? a.new_price : a.price
                const priceB = b.new_price > 0 ? b.new_price : b.price
                return priceB - priceA
            })
        }

        setShowProduct(filtered)

    }, [products, category, condition, sortby, keyword])
// console.log("filterProduct: ", filterProduct)
    const ProductSearch = async (e: any) => {
        if(e) e.preventDefault()
        const searchKeyWord = keyword.trim()
        if(!searchKeyWord){
            return
        }
        const url = `${import.meta.env.VITE_API_BASE_URL}/shops/products/search-products/`
        try {
            const res = await apiPublic.get(url, {
                params: { keyword: searchKeyWord }
            })
            setShowProduct(res.data)

        }catch(error: any) {
            console.error("search error", error.response.data || error.message)
        }
    }
    const handleKeywordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setKeyWord(value);
    };

    const endElement = keyword ? (
        <CloseButton
        size="xs"
        onClick={() => {
            setKeyWord('');
            inputRef.current?.focus();
        }}
        me="-2"
        />
    ) : undefined;
    const handleClear = () => {
        setCategory("")
        setCondition("")
        setSortBy("")
    }

    if(isLoading) {
        return <Box p={"10px"}>Loaing Products...</Box>
    }
    if (error) {
        return <Box p={"10px"} color={"red.500"}>Error loading products</Box>
    }
    if (!products || products.length === 0){
        return <Box p={"10px"}>No products found</Box>
    }

    const handleClickProduct = (productId: string, shopId: string) => {
        Navigate(`/product-page/${shopId}/${productId}`)
    }

    // const openGoogleMaps = (address: string) => {
    //     const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`
    //     window.open(url, '_blank')
    // }
   
  return (
    <Box>
        <Wrap justifyContent={"space-between"} shadow={"sm"} p={"10px"} rounded={"5px"} mb={"20px"}>
            <Wrap justify={{base:"space-between", md: "flex-start"}} gap={{base:"5px", md:"20px"}}>
                <select 
                    value={category} 
                    onChange={(e)=> setCategory(e.target.value)}
                    style={{border:"1px solid", borderRadius:"5px", padding:"10px"}}
                >
                    <option value={""}>Categories</option>
                    {[... new Set(products.map((p: ProductListProps) => p.category))].map((category, idx) => (
                        <option key={idx} value={category}>{category}</option>
                    ))}
                </select>
                <select 
                    value={condition} 
                    onChange={(e)=> setCondition(e.target.value)}
                    style={{border:"1px solid", borderRadius:"5px", padding:"10px"}}
                >
                    <option value={""}>Conditions</option>
                    {[... new Set(products.map((p: ProductListProps) => p.condition))].map((condition, idx) => (
                        <option key={idx} value={condition}>{condition}</option>
                    ))}
                </select>
                <select 
                    value={sortby}
                    onChange={handleSort}
                    style={{border:"1px solid", borderRadius:"5px", padding:"10px"}}
                >
                    <option value={""}>Sort by</option>
                    <option value={"lowestPrice"}>Lowest Price</option>
                    <option value={"highestPrice"}>Highest Price</option>
    
                </select>
                <Button variant={"outline"} border={"1px solid"} onClick={handleClear}>Clear</Button>
            </Wrap>
            <form onSubmit={ProductSearch}>
                <InputGroup flex="1" startElement={<LuSearch />} endElement={endElement} border={"1px solid"} rounded={'5px'}>
                    <Input
                        ref={inputRef}
                        value={keyword}
                        onChange={handleKeywordChange}
                        placeholder='Search Products'
                        w={"300px"}
                    />
                </InputGroup>
            </form>
        </Wrap>

        <Wrap justify={"space-between"}>
            { showProduct && showProduct.map((p: ProductListProps) => {
                const getImageUrl = (imagePath: string | null | undefined): string | null => {
                    if (!imagePath) return null;
                    if (imagePath.startsWith('http')) return imagePath;
                    const baseUrl = import.meta.env.VITE_API_BASE_URL || '';
                    return `${baseUrl}${imagePath}`;
                }
                
                // Helper function to check if URL is a video
                const isVideoUrl = (url: string): boolean => {
                    return url.match(/\.(mp4|webm|ogg|mov)$/i) !== null;
                }
                
                // Prioritize videos: find primary video, or any video, or fallback to primary_image
                let primaryMediaUrl: string | null = null;
                let isVideo = false;
                
                // First, try to find a primary video
                const primaryVideo = p.images.find(img => img.is_primary && isVideoUrl(img.media));
                if (primaryVideo) {
                    primaryMediaUrl = getImageUrl(primaryVideo.media);
                    isVideo = true;
                } else {
                    // Second, try to find any video (prioritize videos over images)
                    const anyVideo = p.images.find(img => isVideoUrl(img.media));
                    if (anyVideo) {
                        primaryMediaUrl = getImageUrl(anyVideo.media);
                        isVideo = true;
                    } else {
                        // Finally, fallback to primary_image
                        primaryMediaUrl = getImageUrl(p.primary_image);
                        isVideo = p.primary_image ? isVideoUrl(p.primary_image) : false;
                    }
                }
                
                return (
                    <Box key={p.id} cursor="pointer" _hover={{ shadow: 'lg' }} 
                        onClick={() => handleClickProduct(p.id, p.shop_id)} 
                        w={"150px"} h={"270px"} position={"relative"} p={"5px"}
                        border={"1px solid"} rounded={"5px"}>
                        <Box>
                            {isLoading && (
                                <Spinner size={"xl"}/>
                            )}
                            {error && (
                                <Text>{error}</Text>
                            )}
                        </Box>
                        {primaryMediaUrl && (
                            <Box shadow={"sm"} mb={"10px"}>
                                {isVideo ? (
                                    <video
                                        src={primaryMediaUrl}
                                        style={{
                                            width: '100%',
                                            height: '140px',
                                            objectFit: 'cover',
                                            borderRadius: '5px'
                                        }}
                                        muted
                                        loop
                                        playsInline
                                    />
                                ) : (
                                    <Image 
                                        src={primaryMediaUrl} 
                                        alt={p.name}
                                        w={"100%"}
                                        h={"140px"}
                                        fit={"fill"}
                                        rounded={'5px'}
                                    />
                                )}
                            </Box>  
                        )}
                        {p.new_price > 0 ? (
                            <Avatar.Root position={"absolute"} top={0} right={0}>
                                <Avatar.Image src="https://img.icons8.com/color/48/discount--v1.png"/>
                            </Avatar.Root>):("")
                        }
                        
                        <Text lineClamp={1}>{p.name}</Text>
                        <Box>
                            {p.condition && <Text>{p.condition}</Text>}
                            {p.new_price > 0 ? 
                                (
                                    <Box>
                                        <Text fontSize={"14px"} fontWeight={"bold"} color={"red"}>Price: {p.new_price} {p.currency_unit}</Text>
                                        
                                    </Box>
                                ):(
                                    <Text fontSize={"14px"} fontWeight={"bold"} color={"red.500"}>Price: {p.price} {p.currency_unit}</Text>
                                )
                            }
                        </Box>
                        <Text w={"100%"} textJustify={"auto"}>
                            {p.shop_city}
                        </Text>
                    </Box>
                )
            })}
        </Wrap>

    </Box>
  )
}

export default ProductListPage