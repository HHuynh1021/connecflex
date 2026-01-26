import { useState, useEffect, useRef } from 'react'
import { apiPublic } from '@/services/api'
import useProductList from '../components/products/ProductListHook'
import { Heading, Image, Wrap, Box, Text, Center, Badge, Container, Avatar, HStack, Button, Spinner, Input, CloseButton, InputGroup, Stack, VStack } from '@chakra-ui/react'
import { CarTaxiFront, ChevronLeft, ChevronRight } from "lucide-react"
import { useNavigate } from 'react-router'
import { LuSearch } from 'react-icons/lu';

interface ProductImage {
    id: string
    media: string
    is_primary: boolean
    order: number
}

interface PropertyItem {
    property_name: string
    value: string
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
    category_names: string[]; // Array of category names
    properties: PropertyItem[]; // Array of property objects
    shop_owner_id: string
    primary_image: string
    images: ProductImage[]
    shop_address: string;
    shop_city: string;
}
const ProductListPage = () => {
    const Navigate = useNavigate()
    const inputRef = useRef(null);

    const { products, isLoading, error } = useProductList() as { products: ProductListProps[], isLoading: boolean, error: string | null }

    const [showProduct, setShowProduct] = useState<ProductListProps[]>([])
    const [category, setCategory] = useState<string[]>([])
    const [properties, setProperties] = useState<string[]>([])
    const [condition, setCondition] = useState<string>('')
    const [sortby, setSortBy] = useState<string>("")
    const [keyword, setKeyWord] = useState<string>("")

     const handleSort = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSortBy(e.target.value)
    }
    
    useEffect (() => {
        if (!products) return

        let filtered = [...products]

        if (category.length > 0) {
            filtered = filtered.filter(p => 
                Array.isArray(p.category_names) && 
                p.category_names.some(cat => category.includes(cat))
            )
        }
        if (properties.length > 0) {
            filtered = filtered.filter(p => 
                Array.isArray(p.properties) && 
                p.properties.some(prop => {
                    // Split comma-separated values in the product
                    const values = prop.value.split(',').map(v => v.trim())
                    // Check if any of the split values match selected properties
                    return values.some(val => 
                        properties.includes(`${prop.property_name}: ${val}`)
                    )
                })
            )
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

    }, [products, category, properties, condition, sortby, keyword])
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
        setCategory([])
        setProperties([])
        setCondition("")
        setSortBy("")
    }
    const handlePropertyToggle = (propNameValue: string) => {
        setProperties(prev => 
            prev.includes(propNameValue)
                ? prev.filter(p => p !== propNameValue)
                : [...prev, propNameValue]
        )
    }

    const handleCategoryToggle = (categoryName: string) => {
        setCategory(prev => 
            prev.includes(categoryName)
                ? prev.filter(c => c !== categoryName)
                : [...prev, categoryName]
        )
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
        <Wrap flexDirection={"row"} gap={"10px"} mb={"20px"} w={"100%"}>
            <Stack justify={{base:"space-between", md: "flex-start"}} gap={{base:"5px", md:"20px"}} w={{"base":"100%", md:"25%"}}>
                <Box
                    border="1px solid"
                    borderRadius="5px"
                    p="10px"
                    minW="200px"
                    maxW="300px"
                    position="relative"
                >
                    <Text fontWeight="semibold" mb={2}>Categories {category.length > 0 && `(${category.length})`}</Text>
                    <Box maxH="200px" overflowY="auto">
                        {[... new Set(products.flatMap((p: any) => p.category_names || []))].sort().map((cat, idx) => (
                            <Box key={idx} display="flex" alignItems="center" gap={2} mb={1}>
                                <input
                                    type="checkbox"
                                    id={`cat-${idx}`}
                                    checked={category.includes(cat as string)}
                                    onChange={() => handleCategoryToggle(cat as string)}
                                    style={{ cursor: 'pointer' }}
                                />
                                <label 
                                    htmlFor={`cat-${idx}`}
                                    style={{ cursor: 'pointer', fontSize: '14px' }}
                                >
                                    {cat}
                                </label>
                            </Box>
                        ))}
                    </Box>
                </Box>
                <Box
                    border="1px solid"
                    borderRadius="5px"
                    p="10px"
                    minW="200px"
                    maxW="300px"
                    position="relative"
                >
                    <Text fontWeight="semibold" mb={2}>Properties {properties.length > 0 && `(${properties.length})`}</Text>
                    <Box maxH="300px" overflowY="auto">
                        {(() => {
                            // Group properties by property_name and split comma-separated values
                            const propertyGroups = products.reduce((acc: any, p: any) => {
                                if (Array.isArray(p.properties)) {
                                    p.properties.forEach((prop: PropertyItem) => {
                                        if (!acc[prop.property_name]) {
                                            acc[prop.property_name] = new Set()
                                        }
                                        // Split comma-separated values and trim whitespace
                                        const values = prop.value.split(',').map(v => v.trim()).filter(v => v.length > 0)
                                        values.forEach(val => acc[prop.property_name].add(val))
                                    })
                                }
                                return acc
                            }, {})

                            return Object.entries(propertyGroups).map(([propName, values]: [string, any], groupIdx) => (
                                <Box key={groupIdx} mb={3}>
                                    <Text fontWeight="bold" fontSize="sm" mb={1} color="blue.600">
                                        {propName}
                                    </Text>
                                    <Box pl={2}>
                                        {Array.from(values).sort().map((value: any, idx: number) => {
                                            const propNameValue = `${propName}: ${value}`
                                            return (
                                                <Box key={idx} display="flex" alignItems="center" gap={2} mb={1}>
                                                    <input
                                                        type="checkbox"
                                                        id={`prop-${groupIdx}-${idx}`}
                                                        checked={properties.includes(propNameValue)}
                                                        onChange={() => handlePropertyToggle(propNameValue)}
                                                        style={{ cursor: 'pointer' }}
                                                    />
                                                    <label 
                                                        htmlFor={`prop-${groupIdx}-${idx}`}
                                                        style={{ cursor: 'pointer', fontSize: '13px' }}
                                                    >
                                                        {value}
                                                    </label>
                                                </Box>
                                            )
                                        })}
                                    </Box>
                                </Box>
                            ))
                        })()}
                    </Box>
                </Box>
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
                
                <Button variant={"outline"} border={"1px solid"} onClick={handleClear}>Clear</Button>
            </Stack>

            <Box w={{base:'100%', md:'70%'}} shadow={"lg"} p={"10px"} rounded={"5px"}>
                <Wrap justifyContent={"space-between"} mb={"20px"} shadow={"sm"} p={"10px"} rounded={"5px"}>
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
                    <select 
                        value={sortby}
                        onChange={handleSort}
                        style={{border:"1px solid", borderRadius:"5px", padding:"10px"}}
                    >
                        <option value={""}>Sort by</option>
                        <option value={"lowestPrice"}>Lowest Price</option>
                        <option value={"highestPrice"}>Highest Price</option>
            
                    </select>
                </Wrap>
                <Wrap justify={"space-between"}>
                    { showProduct && showProduct.length > 0 ? showProduct.map((p: ProductListProps) => {
                        const getImageUrl = (imagePath: string | null | undefined): string | null => {
                            if (!imagePath) return null;
                            if (imagePath.startsWith('http')) return imagePath;
                            const baseUrl = import.meta.env.VITE_API_BASE_URL || '';
                            return `${baseUrl}${imagePath}`;
                        }
                        
                        // Helper function to check if URL is a video
                        const isVideoUrl = (url: string | null | undefined): boolean => {
                            if (!url) return false;
                            return url.match(/\.(mp4|webm|ogg|mov)$/i) !== null;
                        }
                        
                        let primaryMediaUrl: string | null = null;
                        let isVideo = false;
                        
                        // Check if images array exists and has items
                        if (p.images && p.images.length > 0) {
                            // Sort images so videos always appear first, then images
                            const sortedImages = [...p.images].sort((a, b) => {
                                const aIsVideo = isVideoUrl(a.media);
                                const bIsVideo = isVideoUrl(b.media);
                                
                                // Videos come before images
                                if (aIsVideo && !bIsVideo) return -1;
                                if (!aIsVideo && bIsVideo) return 1;
                                
                                // If both are same type, sort by is_primary, then by order
                                if (a.is_primary && !b.is_primary) return -1;
                                if (!a.is_primary && b.is_primary) return 1;
                                return a.order - b.order;
                            });
                            
                            // Get the first media (will be video if available, otherwise first image)
                            const primaryMedia = sortedImages[0];
                            primaryMediaUrl = getImageUrl(primaryMedia.media);
                            isVideo = isVideoUrl(primaryMedia.media);
                        } else {
                            // Fallback to primary_image
                            primaryMediaUrl = getImageUrl(p.primary_image);
                            isVideo = isVideoUrl(p.primary_image);
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
                    }) : (
                        <Box p={8} textAlign="center" w="100%">
                            <Text fontSize="lg" color="gray.500">No products match the selected filters</Text>
                        </Box>
                    )}
                </Wrap>
            </Box>
        </Wrap>
    </Box>
  )
}

export default ProductListPage