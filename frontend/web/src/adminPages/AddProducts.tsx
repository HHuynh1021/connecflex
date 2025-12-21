import {useEffect, useState, useRef} from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import type { AppDispatch } from '../services/store'
import useAccessToken from '../services/token'

import api from '../services/api'
import { getUserInfo } from '../services/authSlice'
import { Box, Input, Textarea, Button,Stack,Image,Text,Heading,Container,Grid,IconButton,Badge,} from '@chakra-ui/react'
import { Field } from '@chakra-ui/react/field'
import { toaster } from '../components/ui/toaster'
import useShopAdmin from '../adminPages/ShopHookAdmin'
import { X, Star } from 'lucide-react'

interface ImagePreview {
    file: File
    preview: string
    isPrimary: boolean
}

interface ProductFormData {
    name: string
    shop_id: string
    description: string
    price: string
    category: string
    image: string
}

const AddProducts: React.FC = () => {
    const Navigate = useNavigate()
    const user = useSelector((state: any) => state.auth.user)
    const dispatch = useDispatch<AppDispatch>()
    const { userInfo } = useSelector((state: any) => state.auth)
    const shopId = userInfo?.id.id


    const { shops } = useShopAdmin(shopId)
    const { accessToken } = useAccessToken(user)
    const [isLoading, setLoading] = useState<boolean>(false)

    useEffect(() => {
        if (user && (!userInfo || Object.keys(userInfo).length === 0)) {
            dispatch(getUserInfo(undefined))
        }
    }, [dispatch, user, userInfo])
    // console.log("userInfo: ", userInfo)

    // Form data
    const [formData, setFormData] = useState<ProductFormData>({
        name: "",
        shop_id: "",
        description: "",
        price: "",
        category: "",
        image:""
    })

    // Multiple images state
    const [images, setImages] = useState<ImagePreview[]>([])
    const fileInputRef = useRef<HTMLInputElement>(null)
    const MAX_IMAGES = 5
    const MAX_FILE_SIZE = 5 * 1024 * 1024 

    // Set shop_id when shops are loaded
    useEffect(() => {
        const shopId = shops?.[0]?.id
        console.log("Available shops:", shops)
        console.log("Selected shop ID:", shopId)
        
        if (shopId && !formData.shop_id) {
            setFormData(prev => ({
                ...prev,
                shop_id: shopId
            }))
        }
    }, [shops])

    // Handle form field changes
    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        })
    }

    // Handle multiple image selection
    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    
    // Clear the input immediately
    if (fileInputRef.current) {
        fileInputRef.current.value = ''
    }
    
    if (files.length === 0) return

    // Check if already at max
    if (images.length >= MAX_IMAGES) {
        toaster.create({
            title: 'Maximum Images Reached',
            description: 'You already have 5 images. Remove some before adding more.',
            type: 'warning',
            duration: 3000,
        })
        return
    }

    // Check if adding these files would exceed max
    const remainingSlots = MAX_IMAGES - images.length
    const filesToProcess = files.slice(0, remainingSlots)
    
    if (files.length > remainingSlots) {
        toaster.create({
            title: 'Too Many Images Selected',
            description: `Only adding first ${remainingSlots} image${remainingSlots > 1 ? 's' : ''}. Maximum is ${MAX_IMAGES} per product.`,
            type: 'warning',
            duration: 3000,
        })
    }

    // Process files
    const processFiles = async () => {
        const newImages: ImagePreview[] = []

        for (const file of filesToProcess) {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                toaster.create({
                    title: 'Invalid File',
                    description: `${file.name} is not an image file`,
                    type: 'error',
                    duration: 3000,
                })
                continue
            }

            // Validate file size
            if (file.size > MAX_FILE_SIZE) {
                toaster.create({
                    title: 'File Too Large',
                    description: `${file.name} must be smaller than 5MB`,
                    type: 'error',
                    duration: 3000,
                })
                continue
            }

            // Create preview
            try {
                const preview = await new Promise<string>((resolve, reject) => {
                    const reader = new FileReader()
                    reader.onloadend = () => resolve(reader.result as string)
                    reader.onerror = reject
                    reader.readAsDataURL(file)
                })

                newImages.push({
                    file,
                    preview,
                    isPrimary: images.length === 0 && newImages.length === 0
                })
            } catch (error) {
                console.error('Error reading file:', file.name, error)
                toaster.create({
                    title: 'Error',
                    description: `Failed to read ${file.name}`,
                    type: 'error',
                    duration: 3000,
                })
            }
        }

        if (newImages.length > 0) {
            setImages(prev => [...prev, ...newImages])
        }
    }

    processFiles()
}

    // Remove specific image
    const handleRemoveImage = (index: number) => {
        setImages(prev => {
            const newImages = prev.filter((_, i) => i !== index)
            // If removed image was primary and there are other images, make first one primary
            if (prev[index].isPrimary && newImages.length > 0) {
                newImages[0].isPrimary = true
            }
            return newImages
        })
    }

    // Set image as primary
    const handleSetPrimary = (index: number) => {
        setImages(prev => 
            prev.map((img, i) => ({
                ...img,
                isPrimary: i === index
            }))
        )
    }

    // Handle form submit
    const handleAddProduct = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!accessToken) {
            Navigate("/login")
            return
        }

        // Validate shop_id exists
        if (!formData.shop_id) {
            toaster.create({
                title: 'Error',
                description: 'Shop ID is missing. Please ensure you have a shop created.',
                type: 'error',
                duration: 3000,
            })
            return
        }

        // Validate required fields
        if (!formData.name || !formData.price) {
            toaster.create({
                title: 'Validation Error',
                description: 'Please fill in product name and price',
                type: 'error',
                duration: 3000,
            })
            return
        }

        // Validate at least one image
        if (images.length === 0) {
            toaster.create({
                title: 'Validation Error',
                description: 'Please add at least one product image',
                type: 'error',
                duration: 3000,
            })
            return
        }

        setLoading(true)

        try {
            // ============================================
            // STEP 1: Create Product First
            // ============================================
            const productUrl = `${import.meta.env.VITE_API_BASE_URL}/shops/product-list-create/`
            
            const productData = {
                name: formData.name,
                shop_id: formData.shop_id,
                description: formData.description,
                price: formData.price,
                category: formData.category,
            }

            console.log("Creating product with data:", productData)

            const productResponse = await api.post(productUrl, productData, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
            })

            // ============================================
            // GET THE PRODUCT ID
            // ============================================
            const productId = productResponse.data.id
            console.log("Product created successfully with ID:", productId)

            // ============================================
            // STEP 2: Upload Images with Product ID
            // ============================================
            const imageUrl = `${import.meta.env.VITE_API_BASE_URL}/shops/product-image-create/`

            const imageUploadPromises = images.map(async (img, index) => {
                const imageFormData = new FormData()
                
                // Link image to the product using product_id
                imageFormData.append('product_id', productId)
                imageFormData.append('image', img.file)
                imageFormData.append('is_primary', String(img.isPrimary))
                imageFormData.append('order', String(index))

                console.log(`Uploading image ${index + 1}/${images.length} for product ${productId}`)

                return api.post(imageUrl, imageFormData, {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        'Content-Type': 'multipart/form-data',
                    },
                })
            })

            // Wait for all images to upload
            await Promise.all(imageUploadPromises)
            console.log(`All ${images.length} images uploaded successfully`)

            toaster.create({
                title: 'Success',
                description: `Product and ${images.length} image${images.length > 1 ? 's' : ''} added successfully`,
                type: 'success',
                duration: 3000,
            })

            // Reset form but keep shop_id
            const currentShopId = formData.shop_id
            setFormData({
                name: "",
                shop_id: currentShopId,
                description: "",
                price: "",
                category: "",
                image:""
            })
            setImages([])

        } catch (error: any) {
            console.error("Failed to add product:", error.response?.data || error.message)
            toaster.create({
                title: 'Error',
                description: error.response?.data?.message || error.response?.data?.error || 'Failed to add product',
                type: 'error',
                duration: 5000,
            })
        } finally {
            setLoading(false)
        }
    }

    return (
        <Container maxW="800px" py={8}>
            <Box bg="white" p={8} borderRadius="lg" shadow="md">
                <Heading size="lg" mb={6}>Add New Product</Heading>

                <form onSubmit={handleAddProduct}>
                    <Stack gap={5}>
                        {/* Product Name */}
                        <Field.Root required>
                            <Field.Label>Product Name</Field.Label>
                            <Input
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="Enter product name"
                                size="lg"
                            />
                        </Field.Root>

                        {/* Shop ID - Display only */}
                        <Field.Root>
                            <Field.Label>Shop ID</Field.Label>
                            <Input
                                name="shop_id"
                                value={formData.shop_id}
                                readOnly
                                placeholder="Loading shop ID..."
                                size="lg"
                                bg="gray.100"
                            />
                            <Field.HelperText>
                                {shops && shops.length > 0 
                                    ? `Using shop: ${shops[0]?.name || 'Your Shop'}`
                                    : 'No shop found. Please create a shop first.'}
                            </Field.HelperText>
                        </Field.Root>

                        {/* Price */}
                        <Field.Root required>
                            <Field.Label>Price</Field.Label>
                            <Input
                                name="price"
                                type="number"
                                step="0.01"
                                value={formData.price}
                                onChange={handleChange}
                                placeholder="0.00"
                                size="lg"
                            />
                        </Field.Root>

                        {/* Category */}
                        <Field.Root>
                            <Field.Label>Category</Field.Label>
                            <Input
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                placeholder="Enter category"
                                size="lg"
                            />
                        </Field.Root>

                        {/* Description */}
                        <Field.Root>
                            <Field.Label>Description</Field.Label>
                            <Textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                placeholder="Enter product description"
                                rows={5}
                                size="lg"
                            />
                        </Field.Root>

                        {/* Product Images Upload */}
                        {/* Product Images Upload */}
                        <Field.Root required={images.length === 0}>
                            <Field.Label>Product Images {images.length > 0 && `(${images.length}/${MAX_IMAGES})`}</Field.Label>
                            <Input
                                type="file"
                                accept="image/*"
                                multiple
                                ref={fileInputRef}
                                onChange={handleImageSelect}
                                onClick={(e) => {
                                    if (images.length >= MAX_IMAGES) {
                                        e.preventDefault()
                                        toaster.create({
                                            title: 'Maximum Images Reached',
                                            description: 'Remove an image before adding more',
                                            type: 'warning',
                                            duration: 2000,
                                        })
                                    }
                                }}
                                size="lg"
                                disabled={images.length >= MAX_IMAGES}
                                cursor={images.length >= MAX_IMAGES ? "not-allowed" : "pointer"}
                                opacity={images.length >= MAX_IMAGES ? 0.6 : 1}
                            />
                            <Field.HelperText color={images.length >= MAX_IMAGES ? "red.500" : "gray.600"}>
                                {images.length < MAX_IMAGES 
                                    ? `Add up to ${MAX_IMAGES - images.length} more. Max 5MB each. Formats: JPG, PNG, GIF, WebP.`
                                    : 'Maximum reached. Remove an image to add more.'}
                            </Field.HelperText>
                        </Field.Root>

                        {/* Image Previews Grid */}
                        {images.length > 0 && (
                            <Box
                                borderWidth="1px"
                                borderRadius="md"
                                borderColor="gray.200"
                                p={4}
                                bg="gray.50"
                            >
                                <Text fontWeight="semibold" mb={3}>
                                    Product Images ({images.length}/5):
                                </Text>
                                <Grid 
                                    templateColumns="repeat(auto-fill, minmax(150px, 1fr))" 
                                    gap={4}
                                >
                                    {images.map((img, index) => (
                                        <Box
                                            key={index}
                                            position="relative"
                                            borderRadius="md"
                                            overflow="hidden"
                                            borderWidth="2px"
                                            borderColor={img.isPrimary ? "blue.500" : "gray.200"}
                                        >
                                            {/* Primary Badge */}
                                            {img.isPrimary && (
                                                <Badge
                                                    position="absolute"
                                                    top={2}
                                                    left={2}
                                                    colorPalette="blue"
                                                    zIndex={2}
                                                >
                                                    Primary
                                                </Badge>
                                            )}

                                            {/* Image */}
                                            <Image
                                                src={img.preview}
                                                alt={`Product ${index + 1}`}
                                                w="full"
                                                h="150px"
                                                objectFit="cover"
                                            />

                                            {/* Action Buttons */}
                                            <Box
                                                position="absolute"
                                                top={2}
                                                right={2}
                                                display="flex"
                                                gap={1}
                                            >
                                                {/* Set as Primary Button */}
                                                {!img.isPrimary && (
                                                    <IconButton
                                                        aria-label="Set as primary"
                                                        size="sm"
                                                        colorPalette="blue"
                                                        onClick={() => handleSetPrimary(index)}
                                                        title="Set as primary image"
                                                    >
                                                        <Star size={16} />
                                                    </IconButton>
                                                )}

                                                {/* Remove Button */}
                                                <IconButton
                                                    aria-label="Remove image"
                                                    size="sm"
                                                    colorPalette="red"
                                                    onClick={() => handleRemoveImage(index)}
                                                >
                                                    <X size={16} />
                                                </IconButton>
                                            </Box>

                                            {/* Image Number */}
                                            <Box
                                                position="absolute"
                                                bottom={2}
                                                left={2}
                                                bg="blackAlpha.700"
                                                color="white"
                                                px={2}
                                                py={1}
                                                borderRadius="md"
                                                fontSize="xs"
                                            >
                                                {index + 1}
                                            </Box>
                                        </Box>
                                    ))}
                                </Grid>
                                <Text fontSize="sm" color="gray.600" mt={3}>
                                    Click the star icon to set an image as primary. 
                                    The primary image will be displayed first on the product listing.
                                </Text>
                            </Box>
                        )}

                        {/* Submit Button */}
                        <Button
                            type="submit"
                            colorPalette="blue"
                            size="lg"
                            loading={isLoading}
                            width="full"
                            mt={4}
                            disabled={!formData.shop_id || images.length === 0}
                        >
                            {isLoading ? 'Adding Product...' : 'Add Product'}
                        </Button>

                        {/* Cancel Button */}
                        <Button
                            type="button"
                            variant="outline"
                            size="lg"
                            onClick={() => Navigate(-1)}
                            width="full"
                            disabled={isLoading}
                        >
                            Cancel
                        </Button>
                    </Stack>
                </form>
            </Box>
        </Container>
    )
}

export default AddProducts