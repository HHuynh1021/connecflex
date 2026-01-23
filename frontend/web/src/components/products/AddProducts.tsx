import {useEffect, useState, useRef} from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import type { AppDispatch } from '../../services/store'
import useAccessToken from '../../services/token'

import api from '../../services/api'
import { getUserInfo } from '../../services/authSlice'
import { VStack, HStack, Box, Input, Textarea, Button, Stack, Image, Text, Heading, Grid, IconButton, Badge} from '@chakra-ui/react'
import { Field } from '@chakra-ui/react/field'
import { toaster } from '../ui/toaster'
import useShopAdmin from '../shop/ShopHookAdmin'
import { X, Star } from 'lucide-react'

interface MediaPreview {
    file: File
    preview: string
    isPrimary: boolean
    type: 'image' | 'video'
}

interface Category {
    id: string
    name: string
    description: string
}

interface Property {
    id: string
    name: string
    values: string[]  // Array of possible values for this property
    description: string
    created_at: string
}

interface SelectedProperty {
    property_id: string
    property_name: string
    value: string  // Custom value entered by user
}

interface ProductFormData {
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
    category: string[];
    properties: SelectedProperty[];  // Changed from string[] to SelectedProperty[]
    delivery_term: string;
    refund_policy: string;
    refund: boolean;
}

const AddProducts: React.FC = () => {
    const Navigate = useNavigate()
    const user = useSelector((state: any) => state.auth.user)
    const dispatch = useDispatch<AppDispatch>()
    const { userInfo } = useSelector((state: any) => state.auth)
    const shopId = userInfo?.id.id

    const { shops } = useShopAdmin()
    const { accessToken } = useAccessToken(user)
    const [isLoading, setLoading] = useState<boolean>(false)
    
    // Categories and Properties state
    const [categories, setCategories] = useState<Category[]>([])
    const [properties, setProperties] = useState<Property[]>([])
    const [loadingCategories, setLoadingCategories] = useState<boolean>(false)
    const [loadingProperties, setLoadingProperties] = useState<boolean>(false)

    useEffect(() => {
        if (user && (!userInfo || Object.keys(userInfo).length === 0)) {
            dispatch(getUserInfo(undefined))
        }
    }, [dispatch, user, userInfo])
    console.log("userInfo: ", userInfo)

    // Fetch categories and properties on component mount
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                setLoadingCategories(true)
                const response = await api.get(`${import.meta.env.VITE_API_BASE_URL}/shops/category-list/`)
                setCategories(response.data || [])
            } catch (error: any) {
                console.error("Failed to fetch categories:", error)
                toaster.create({
                    title: 'Error',
                    description: 'Failed to load categories',
                    type: 'error',
                    duration: 3000,
                })
            } finally {
                setLoadingCategories(false)
            }
        }

        const fetchProperties = async () => {
            try {
                setLoadingProperties(true)
                const response = await api.get(`${import.meta.env.VITE_API_BASE_URL}/shops/properties-list/`)
                setProperties(response.data || [])
            } catch (error: any) {
                console.error("Failed to fetch properties:", error)
                toaster.create({
                    title: 'Error',
                    description: 'Failed to load properties',
                    type: 'error',
                    duration: 3000,
                })
            } finally {
                setLoadingProperties(false)
            }
        }

        fetchCategories()
        fetchProperties()
    }, [])

    // Form data
    const [formData, setFormData] = useState<ProductFormData>({
        name: "",
        shop_id: "",
        description: "",
        quantity: 0,
        price: 0,
        new_price: 0,
        discount_end_at: "",
        currency_unit: "",
        condition: "",
        warranty: "",
        category: [],
        properties: [],
        delivery_term: "",
        refund_policy: "",
        refund: false,
    })

    // Multiple images state
    const [images, setImages] = useState<MediaPreview[]>([])
    const fileInputRef = useRef<HTMLInputElement>(null)
    const MAX_IMAGES = 5
    const MAX_FILE_SIZE = 5 * 1024 * 1024 

    // Cleanup object URLs on unmount
    useEffect(() => {
        return () => {
            images.forEach(img => {
                if (img.type === 'video') {
                    URL.revokeObjectURL(img.preview)
                }
            })
        }
    }, [])

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

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        
        // Format datetime-local to ISO string for discount_end_at
        if (name === 'discount_end_at' && value) {
            const formattedValue = new Date(value).toISOString()
            setFormData({
                ...formData,
                [name]: formattedValue
            })
        } else if (name === 'quantity' || name === 'price' || name === 'new_price') {
            setFormData({
                ...formData,
                [name]: parseFloat(value) || 0
            })
        } else {
            setFormData({
                ...formData,
                [name]: value
            })
        }
    }

    const handleSelectChange = (
        e: React.ChangeEvent<HTMLSelectElement>
    ) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        })
    }

    const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.checked,
        })
    }

    const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        })
    }

    // Handle category selection (supports multiple)
    const handleCategoryChange = (categoryId: string) => {
        setFormData(prev => {
            const currentCategories = prev.category
            const isSelected = currentCategories.includes(categoryId)
            
            if (isSelected) {
                // Remove if already selected
                return {
                    ...prev,
                    category: currentCategories.filter(id => id !== categoryId)
                }
            } else {
                // Add if not selected
                return {
                    ...prev,
                    category: [...currentCategories, categoryId]
                }
            }
        })
    }

    // Handle property selection (supports multiple)
    const handlePropertyChange = (propertyId: string) => {
        const property = properties.find(p => p.id === propertyId)
        if (!property) return

        setFormData(prev => {
            const existingProperty = prev.properties.find(p => p.property_id === propertyId)
            
            if (existingProperty) {
                // Remove if already selected
                return {
                    ...prev,
                    properties: prev.properties.filter(p => p.property_id !== propertyId)
                }
            } else {
                // Add with empty value for user to fill in
                return {
                    ...prev,
                    properties: [...prev.properties, {
                        property_id: propertyId,
                        property_name: property.name,
                        value: ''  // Empty string for user input
                    }]
                }
            }
        })
    }

    // Handle property value selection/deselection
    const handlePropertyValueChange = (propertyId: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            properties: prev.properties.map(p =>
                p.property_id === propertyId
                    ? { ...p, value }
                    : p
            )
        }))
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

        // Check if adding these files would exceed 
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
            const newImages: MediaPreview[] = []

            for (const file of filesToProcess) {
                // Validate file type
                const isImage = file.type.startsWith('image/')
                const isVideo = file.type.startsWith('video/')
                if (!isImage && !isVideo) {
                    toaster.create({
                        title: 'Invalid File',
                        description: `${file.name} is not an image or video file`,
                        type: 'error',
                        duration: 3000,
                    })
                    continue
                }

                // Validate file size
                const maxSize = isVideo ? 50 * 1024 * 1024 : MAX_FILE_SIZE
                if (file.size > maxSize) {
                    toaster.create({
                        title: 'File Too Large',
                        description: `${file.name} must be smaller than ${maxSize / (1024 * 1024)}MB`,
                        type: 'error',
                        duration: 3000,
                    })
                    continue
                }

                // Create preview
                try {
                    let preview: string
                    if (isImage) {
                        // Image preview using FileReader
                        preview = await new Promise<string>((resolve, reject) => {
                            const reader = new FileReader()
                            reader.onloadend = () => resolve(reader.result as string)
                            reader.onerror = reject
                            reader.readAsDataURL(file)
                        })
                    } else {
                        // Video preview - create object URL
                        preview = URL.createObjectURL(file)
                    }
        
                    newImages.push({
                        file,
                        preview,
                        isPrimary: images.length === 0 && newImages.length === 0,
                        type: isImage ? 'image' : 'video'
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
            // Clean up object URL if it's a video
            if (prev[index].type === 'video') {
                URL.revokeObjectURL(prev[index].preview)
            }
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
            const productUrl = `${import.meta.env.VITE_API_BASE_URL}/shops/product-list-create/`
            
            // Prepare category - ensure it's an array of strings (IDs)
            const categoryArray: string[] = Array.isArray(formData.category) 
                ? formData.category.filter((c): c is string => typeof c === 'string' && c.length > 0)
                : []

            // Prepare properties_input with custom values
            const propertiesInput = formData.properties
                .filter(p => p.value.trim().length > 0)  // Only include properties with values
                .map(p => ({
                    property_id: p.property_id,
                    value: p.value
                }))

            const productData: any = {
                name: formData.name,
                shop_id: formData.shop_id,
                description: formData.description || "",
                quantity: formData.quantity || 0,
                price: parseFloat(formData.price.toString()),
                new_price: formData.new_price ? parseFloat(formData.new_price.toString()) : null,
                currency_unit: formData.currency_unit || "EUR",
                condition: formData.condition || "",
                warranty: formData.warranty || "",
                category: categoryArray,
                properties_input: propertiesInput,
                delivery_term: formData.delivery_term || "",
                refund_policy: formData.refund_policy || "",
                refund: formData.refund || false,
            }

            // Add discount_end_at only if both new_price and discount_end_at are provided
            if (formData.discount_end_at && formData.new_price) {
                productData.discount_end_at = formData.discount_end_at
            }

            const productResponse = await api.post(productUrl, productData, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
            })

            const productId = productResponse.data.id

            const imageUrl = `${import.meta.env.VITE_API_BASE_URL}/shops/product-image-create/`

            const imageUploadPromises = images.map(async (img, index) => {
                const imageFormData = new FormData()
                
                // Link image to the product using product_id
                imageFormData.append('product_id', productId)
                imageFormData.append('media', img.file)
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
                quantity: 0,
                price: 0,
                new_price: 0,
                discount_end_at: "",
                currency_unit: "",
                condition: "",
                warranty: "",
                category: [],
                properties: [],
                delivery_term: "",
                refund_policy: "",
                refund: false,
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

    const getDatetimeLocalValue = (isoString: string) => {
        if (!isoString) return ''
        try {
            const date = new Date(isoString)
            const year = date.getFullYear()
            const month = String(date.getMonth() + 1).padStart(2, '0')
            const day = String(date.getDate()).padStart(2, '0')
            const hours = String(date.getHours()).padStart(2, '0')
            const minutes = String(date.getMinutes()).padStart(2, '0')
            return `${year}-${month}-${day}T${hours}:${minutes}`
        } catch {
            return ''
        }
    }

    return (
        <Box maxW="100%" py={8}>
            <Box p={8} rounded={"5px"} shadow="md">
                <Heading size="lg" mb={6}>Add New Product</Heading>

                <form onSubmit={handleAddProduct}>
                    <Stack gap={5}>
                        {/* Product Name */}
                        <Field.Root required>
                            <Field.Label>
                                Product Name <Field.RequiredIndicator />
                            </Field.Label>
                            <Input
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="Enter product name"
                                size="lg"
                            />
                        </Field.Root>

                        {/* Quantity */}
                        <Field.Root required>
                            <Field.Label>
                                Quantity <Field.RequiredIndicator />
                            </Field.Label>
                            <Input
                                name="quantity"
                                type="number"
                                min="0"
                                value={formData.quantity}
                                onChange={handleChange}
                                placeholder="0"
                                size="lg"
                            />
                        </Field.Root>

                        {/* Price */}
                        <Field.Root required>
                            <Field.Label>
                                Price <Field.RequiredIndicator />
                            </Field.Label>
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
                        
                        {/* Discount Price */}
                        <Field.Root>
                            <Field.Label>Discount Price</Field.Label>
                            <Input
                                name="new_price"
                                type="number"
                                step="0.01"
                                value={formData.new_price}
                                onChange={handleChange}
                                placeholder="0.00"
                                size="lg"
                            />
                        </Field.Root>

                        {/* Discount End At */}
                        <Field.Root>
                            <Field.Label>Discount end at</Field.Label>
                            <Input
                                name="discount_end_at"
                                type="datetime-local"
                                value={getDatetimeLocalValue(formData.discount_end_at)}
                                onChange={handleChange}
                                placeholder="Select date and time"
                                disabled={!formData.new_price}
                                size="lg"
                            />
                        </Field.Root>

                        {/* Currency Unit */}
                        <Field.Root required>
                            <Field.Label htmlFor="currency_unit">
                                Currency Unit
                                <Field.RequiredIndicator />
                            </Field.Label>
                            <select
                                id='currency_unit'
                                name='currency_unit'
                                value={formData.currency_unit}
                                onChange={handleSelectChange}
                                style={{border:"1px solid", borderRadius:"5px", padding:"10px"}}
                            >
                                <option value={""}>Choose one</option>
                                <option value={"EUR"}>EUR</option>
                                <option value={"VND"}>VND</option>
                                <option value={"USD"}>USD</option>
                            </select>
                        </Field.Root>

                        {/* Condition */}
                        <Field.Root required>
                            <Field.Label htmlFor="condition">
                                Product Condition
                                <Field.RequiredIndicator />
                            </Field.Label>
                            <select
                                required
                                id='condition'
                                name='condition'
                                value={formData.condition}
                                onChange={handleSelectChange}
                                style={{border:"1px solid", borderRadius:"5px", padding:"10px"}}
                            >
                                <option value="">Choose one</option>
                                <option value="NEW">NEW</option>
                                <option value="USED - LIKE NEW">USED - LIKE NEW</option>
                                <option value="USED - GOOD">USED - GOOD</option>
                                <option value="NOT WORKING">NOT WORKING</option>
                                <option value="BROKEN">BROKEN</option>
                            </select>
                        </Field.Root>

                        {/* Warranty */}
                        <Field.Root>
                            <Field.Label>Warranty</Field.Label>
                            <Input
                                name="warranty"
                                value={formData.warranty || "2 years"}
                                onChange={handleChange}
                                placeholder="Enter warranty"
                                size="lg"
                            />
                        </Field.Root>

                        {/* Category - Multi-select */}
                        <Field.Root>
                            <Field.Label htmlFor="category">Category</Field.Label>
                            {loadingCategories ? (
                                <Text>Loading categories...</Text>
                            ) : (
                                <Box>
                                    <select
                                        id='category'
                                        name='category'
                                        value=""
                                        onChange={(e) => {
                                            if (e.target.value) {
                                                handleCategoryChange(e.target.value)
                                                e.target.value = "" // Reset select
                                            }
                                        }}
                                        style={{border:"1px solid", borderRadius:"5px", padding:"10px", width:"100%"}}
                                    >
                                        <option value="">Add a category...</option>
                                        {categories.map((cat) => (
                                            <option key={cat.id} value={cat.id}>
                                                {cat.name}
                                            </option>
                                        ))}
                                    </select>
                                    {formData.category.length > 0 && (
                                        <Box mt={2} display="flex" flexWrap="wrap" gap={2}>
                                            {formData.category.map((catId) => {
                                                const cat = categories.find(c => c.id === catId)
                                                return cat ? (
                                                    <Badge
                                                        key={catId}
                                                        colorPalette="blue"
                                                        px={3}
                                                        py={1}
                                                        borderRadius="md"
                                                        display="flex"
                                                        alignItems="center"
                                                        gap={2}
                                                    >
                                                        {cat.name}
                                                        <IconButton
                                                            size="xs"
                                                            variant="ghost"
                                                            onClick={() => handleCategoryChange(catId)}
                                                            aria-label="Remove category"
                                                        >
                                                            <X size={12} />
                                                        </IconButton>
                                                    </Badge>
                                                ) : null
                                            })}
                                        </Box>
                                    )}
                                </Box>
                            )}
                        </Field.Root>

                        {/* Properties - Multi-select with Values */}
                        <Field.Root>
                            <Field.Label htmlFor="properties">Product Properties</Field.Label>
                            {loadingProperties ? (
                                <Text>Loading properties...</Text>
                            ) : (
                                <Box>
                                    <select
                                        id='properties'
                                        name='properties'
                                        value=""
                                        onChange={(e) => {
                                            if (e.target.value) {
                                                handlePropertyChange(e.target.value)
                                                e.target.value = "" // Reset select
                                            }
                                        }}
                                        style={{border:"1px solid", borderRadius:"5px", padding:"10px", width:"100%"}}
                                    >
                                        <option value="">Add a property...</option>
                                        {properties.map((prop) => (
                                            <option key={prop.id} value={prop.id}>
                                                {prop.name} {prop.values && prop.values.length > 0 ? `(${prop.values.length} options)` : ''}
                                            </option>
                                        ))}
                                    </select>
                                    
                                    {/* Selected Properties with Value Checkboxes */}
                                    {formData.properties.length > 0 && (
                                        <VStack mt={4} gap={4} align="stretch">
                                            {formData.properties.map((selectedProp) => {
                                                const property = properties.find(p => p.id === selectedProp.property_id)
                                                return (
                                                    <Box
                                                        key={selectedProp.property_id}
                                                        borderWidth="1px"
                                                        borderRadius="md"
                                                        p={4}
                                                        bg="gray.50"
                                                    >
                                                        <HStack justify="space-between" mb={3}>
                                                            <Heading size="sm">{selectedProp.property_name}</Heading>
                                                            <IconButton
                                                                size="sm"
                                                                variant="ghost"
                                                                colorPalette="red"
                                                                onClick={() => handlePropertyChange(selectedProp.property_id)}
                                                                aria-label="Remove property"
                                                            >
                                                                <X size={16} />
                                                            </IconButton>
                                                        </HStack>
                                                        
                                                        <Field.Root>
                                                            <Field.Label fontSize="sm">Enter custom value</Field.Label>
                                                            <Input
                                                                value={selectedProp.value}
                                                                onChange={(e) => handlePropertyValueChange(selectedProp.property_id, e.target.value)}
                                                                placeholder={`Enter ${selectedProp.property_name.toLowerCase()} value (e.g., ${property?.values?.[0] || 'custom value'})`}
                                                                size="sm"
                                                            />
                                                            {property && property.values && property.values.length > 0 && (
                                                                <Field.HelperText fontSize="xs">
                                                                    Suggestions: {property.values.join(', ')}
                                                                </Field.HelperText>
                                                            )}
                                                        </Field.Root>
                                                    </Box>
                                                )
                                            })}
                                        </VStack>
                                    )}
                                </Box>
                            )}
                            <Field.HelperText>
                                Add properties and enter custom values for each (e.g., Dimension: 10x20x30cm)
                            </Field.HelperText>
                        </Field.Root>

                        {/* Delivery Term */}
                        <Field.Root>
                            <Field.Label>Delivery Terms</Field.Label>
                            <Textarea
                                name="delivery_term"
                                value={formData.delivery_term}
                                onChange={handleTextareaChange}
                                placeholder="Enter delivery terms (e.g., Standard delivery 3-5 business days)"
                                rows={3}
                                size="lg"
                            />
                        </Field.Root>

                        {/* Refund Policy */}
                        <Field.Root>
                            <Field.Label>Refund Policy</Field.Label>
                            <Textarea
                                name="refund_policy"
                                value={formData.refund_policy}
                                onChange={handleTextareaChange}
                                placeholder="Enter refund policy details"
                                rows={3}
                                size="lg"
                            />
                        </Field.Root>

                        {/* Refund Available */}
                        <Field.Root>
                            <Field.Label htmlFor="refund">Refund Available</Field.Label>
                            <Box display="flex" alignItems="center" gap={2}>
                                <input
                                    type="checkbox"
                                    id="refund"
                                    name="refund"
                                    checked={formData.refund}
                                    onChange={handleCheckboxChange}
                                    style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                                />
                                <Text fontSize="sm" color="gray.600">
                                    Check if refunds are available for this product
                                </Text>
                            </Box>
                        </Field.Root>

                        {/* Description */}
                        <Field.Root>
                            <Field.Label>Description</Field.Label>
                            <Textarea
                                name="description"
                                value={formData.description}
                                onChange={handleTextareaChange}
                                placeholder="Enter product description"
                                rows={5}
                                size="lg"
                            />
                        </Field.Root>

                        {/* Product Images */}
                        <Field.Root required={images.length === 0}>
                            <Field.Label>Product Images {images.length > 0 && `(${images.length}/${MAX_IMAGES})`}</Field.Label>
                            <Input
                                type="file"
                                accept="image/*,video/*"
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
                                    ? `Add up to ${MAX_IMAGES - images.length} more. Max 5MB for images, 50MB for videos. Formats: JPG, PNG, GIF, WebP, MP4, MOV.`
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

                                            {/* Media Preview - Conditional rendering */}
                                            {img.type === 'video' ? (
                                                <video
                                                    src={img.preview}
                                                    controls
                                                    style={{ width: '100%', height: '150px', objectFit: 'cover' }}
                                                />
                                            ) : (
                                                <Image
                                                    src={img.preview}
                                                    alt={`Product ${index + 1}`}
                                                    w="full"
                                                    h="150px"
                                                    objectFit="cover"
                                                />
                                            )}

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
        </Box>
    )
}

export default AddProducts