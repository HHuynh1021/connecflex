import {useEffect, useState, useRef} from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import type { AppDispatch } from '../../services/store'
import useAccessToken from '../../services/token'
import useProductList from './ProductListHook'

import api from '../../services/api'
import { getUserInfo } from '../../services/authSlice'
import { VStack, HStack, Box, Input, Textarea, Button, Stack, Image, Text, Heading, Grid, IconButton, Badge, Toast, Table, Wrap} from '@chakra-ui/react'
import { Field } from '@chakra-ui/react/field'
import { Toaster, toaster } from '../ui/toaster'
import useShopAdmin from '../shop/ShopHookAdmin'
import { X, Star } from 'lucide-react'

interface MediaPreview {
    file: File
    preview: string
    isPrimary: boolean
    type: 'image' | 'video'
}

interface ExistingMedia {
    id: string
    media: string
    is_primary: boolean
    order: number
}

interface CategoryProps {
    id: string
    name: string
    description: string
}

interface SelectedProperty {
    property_name: string, 
    value: string
}

interface ProductProps{
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
    category: string[];  // Array of category IDs
    properties: SelectedProperty[];
    delivery_term: string;
    refund_policy: string;
    refund: boolean;
    images?: ExistingMedia[];  // Add images property
}

const ProductUpdate: React.FC = () => {
    const Navigate = useNavigate()
    const user = useSelector((state: any) => state.auth.user)
    const dispatch = useDispatch<AppDispatch>()
    const { userInfo } = useSelector((state: any) => state.auth)

    const { products, categories, isLoading, error } = useProductList()
    const [showPropertyForm, setShowPropertyForm] = useState<boolean>(false)
    const [newProperty, setNewProperty] = useState<{name: string, value: string}>({
        name: '',
        value: ''
    })
    const [customPropertyName, setCustomPropertyName] = useState<string>('')
    const { shopId, productId } = useParams()
    const { accessToken } = useAccessToken(user)
    


    useEffect(() => {
        if (user && (!userInfo || Object.keys(userInfo).length === 0)) {
            dispatch(getUserInfo(undefined))
        }
    }, [dispatch, user, userInfo])

    const productToUpdate = products?.find((p) => p.id === productId) as ProductProps | undefined

    console.log("categories:", categories)
    console.log("productToUpdate:", productToUpdate)

    const [formData, setFormData] = useState<ProductProps>({
        id: "",
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
    
    // Update formData when productToUpdate is found
    useEffect(() => {
        if (productToUpdate) {
            // Transform properties - they come as SelectedProperty[] from backend
            const transformedProperties: any = Array.isArray(productToUpdate.properties)
                ? productToUpdate.properties.map((prop: any) => ({
                    property_name: prop.property_name || "",
                    value: prop.value || ""
                  }))
                : []

            setFormData({
                id: productToUpdate.id || "",
                name: productToUpdate.name || "",
                shop_id: shopId || "",
                description: productToUpdate.description || "",
                quantity: productToUpdate.quantity || 0,
                price: productToUpdate.price || 0,
                new_price: productToUpdate.new_price || 0,
                discount_end_at: productToUpdate.discount_end_at || "",
                currency_unit: productToUpdate.currency_unit || "",
                condition: productToUpdate.condition || "",
                warranty: productToUpdate.warranty || "",
                category: productToUpdate.category || [],
                properties: transformedProperties,
                delivery_term: productToUpdate.delivery_term || "",
                refund_policy: productToUpdate.refund_policy || "",
                refund: productToUpdate.refund || false,
            })
        }
    }, [productToUpdate, shopId])

    // Multiple images state
    const [images, setImages] = useState<MediaPreview[]>([])
    const [existingMedia, setExistingMedia] = useState<ExistingMedia[]>([])
    const [loading, setLoading] = useState<boolean>(false)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const MAX_IMAGES = 5
    const MAX_FILE_SIZE = 5 * 1024 * 1024 
    
    // Load existing media when product is found
    useEffect(() => {
        if (productToUpdate && productToUpdate.images && Array.isArray(productToUpdate.images)) {
            // Sort existing media: videos first, then by is_primary, then by order
            const sortedMedia = [...productToUpdate.images].sort((a: any, b: any) => {
                const isVideoA = a.media && a.media.match(/\.(mp4|webm|ogg|mov)$/i)
                const isVideoB = b.media && b.media.match(/\.(mp4|webm|ogg|mov)$/i)
                
                // Videos come first
                if (isVideoA && !isVideoB) return -1
                if (!isVideoA && isVideoB) return 1
                
                // If both same type, sort by is_primary then order
                if (a.is_primary && !b.is_primary) return -1
                if (!a.is_primary && b.is_primary) return 1
                return a.order - b.order
            })
            setExistingMedia(sortedMedia)
        }
    }, [productToUpdate])

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
        if (shopId && !formData.shop_id) {
            setFormData(prev => ({
                ...prev,
                shop_id: shopId
            }))
        }
    }, [shopId])

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

    // Remove a property
    const handleRemoveProperty = (property_name: string) => {
        setFormData(prev => ({
            ...prev,
            properties: prev.properties.filter(p => p.property_name !== property_name)
        }))
    }

    // Handle property value selection/deselection
    const handlePropertyValueChange = (property_name: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            properties: prev.properties.map(p =>
                p.property_name === property_name
                    ? { ...p, value }
                    : p
            )
        }))
    }
    
    // Add a property directly to the product
    const handleAddProperty = () => {
        // Determine the actual property name to use
        const propertyName = newProperty.name === 'Custom' ? customPropertyName.trim() : newProperty.name.trim()
        
        if (!propertyName) {
            toaster.create({
                title: 'Validation Error',
                description: newProperty.name === 'Custom' ? 'Custom property name is required' : 'Property name is required',
                type: 'error',
                duration: 3000,
            })
            return
        }
        
        // Check if property name already exists
        if (formData.properties.some(p => p.property_name === propertyName)) {
            toaster.create({
                title: 'Validation Error',
                description: 'A property with this name already exists',
                type: 'error',
                duration: 3000,
            })
            return
        }
        
        setFormData(prev => ({
            ...prev,
            properties: [...prev.properties, {
                property_name: propertyName,
                value: newProperty.value.trim()
            }]
        }))
        
        // Reset form and hide it
        setNewProperty({ name: '', value: '' })
        setCustomPropertyName('')
        setShowPropertyForm(false)
        
        toaster.create({
            title: 'Success',
            description: 'Property added',
            type: 'success',
            duration: 2000,
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
        if (existingMedia.length + images.length >= MAX_IMAGES) {
            toaster.create({
                title: 'Maximum Media Reached',
                description: 'You already have 5 media files. Remove some before adding more.',
                type: 'warning',
                duration: 3000,
            })
            return
        }

        // Check if adding these files would exceed 
        const remainingSlots = MAX_IMAGES - existingMedia.length - images.length
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
    
    // Handle deleting existing media
    const handleDeleteExistingMedia = async (mediaId: string) => {
        if (!accessToken) {
            Navigate("/login")
            return
        }
        
        if (!window.confirm('Are you sure you want to delete this media?')) {
            return
        }
        
        try {
            const url = `${import.meta.env.VITE_API_BASE_URL}/shops/product-image-editor/${mediaId}/`
            const config = {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            }
            
            await api.delete(url, config)
            
            // Remove from state
            setExistingMedia(prev => {
                const newMedia = prev.filter(m => m.id !== mediaId)
                // If deleted media was primary and there are others, make first one primary
                const deletedMedia = prev.find(m => m.id === mediaId)
                if (deletedMedia?.is_primary && newMedia.length > 0) {
                    // Update the first item to be primary on backend
                    handleSetExistingPrimary(newMedia[0].id)
                }
                return newMedia
            })
            
            toaster.create({
                title: 'Success',
                description: 'Media deleted successfully',
                type: 'success',
                duration: 3000,
            })
        } catch (error: any) {
            console.error("Delete media error:", error)
            toaster.create({
                title: 'Error',
                description: error.response?.data?.message || 'Failed to delete media',
                type: 'error',
                duration: 3000,
            })
        }
    }
    
    // Handle setting existing media as primary
    const handleSetExistingPrimary = async (mediaId: string) => {
        if (!accessToken) {
            Navigate("/login")
            return
        }
        
        try {
            const url = `${import.meta.env.VITE_API_BASE_URL}/shops/product-image-editor/${mediaId}/`
            const config = {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            }
            
            // First, unset all existing primary flags
            for (const media of existingMedia) {
                if (media.is_primary && media.id !== mediaId) {
                    const updateUrl = `${import.meta.env.VITE_API_BASE_URL}/shops/product-image-editor/${media.id}/`
                    const formData = new FormData()
                    formData.append('is_primary', 'false')
                    await api.patch(updateUrl, formData, config)
                }
            }
            
            // Then set the selected one as primary
            const formData = new FormData()
            formData.append('is_primary', 'true')
            await api.patch(url, formData, config)
            
            // Update state
            setExistingMedia(prev => 
                prev.map(m => ({
                    ...m,
                    is_primary: m.id === mediaId
                }))
            )
            
            toaster.create({
                title: 'Success',
                description: 'Primary media updated successfully',
                type: 'success',
                duration: 3000,
            })
        } catch (error: any) {
            console.error("Set primary error:", error)
            toaster.create({
                title: 'Error',
                description: error.response?.data?.message || 'Failed to set primary media',
                type: 'error',
                duration: 3000,
            })
        }
    }

    // Handle form submit
    const handleUpdateProduct = async (e: React.FormEvent) => {
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

        // Validate at least one media file (existing or new)
        if (images.length === 0 && existingMedia.length === 0) {
            toaster.create({
                title: 'Validation Error',
                description: 'Please add at least one product image or video',
                type: 'error',
                duration: 3000,
            })
            return
        }

        setLoading(true)

        try {
            // Determine if this is an update or create
            const isUpdate = productId && formData.id
            const productUrl = isUpdate 
                ? `${import.meta.env.VITE_API_BASE_URL}/shops/product-editor/${formData.id}/`
                : `${import.meta.env.VITE_API_BASE_URL}/shops/product-list-create/`
            
            // Prepare category - ensure it's an array of strings (IDs)
            const categoryArray: string[] = Array.isArray(formData.category) 
                ? formData.category.filter((c): c is string => typeof c === 'string' && c.length > 0)
                : []

            // Prepare properties with custom values
            const propertiesData = formData.properties
                .filter(p => p.value.trim().length > 0)  // Only include properties with values
                .map(p => ({
                    property_name: p.property_name,
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
                properties: propertiesData,
                delivery_term: formData.delivery_term || "",
                refund_policy: formData.refund_policy || "",
                refund: formData.refund || false,
            }

            // Add discount_end_at only if both new_price and discount_end_at are provided
            if (formData.discount_end_at && formData.new_price) {
                productData.discount_end_at = formData.discount_end_at
            }

            // Use PATCH for update, POST for create
            const productResponse = isUpdate
                ? await api.patch(productUrl, productData, {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        'Content-Type': 'application/json',
                    },
                })
                : await api.post(productUrl, productData, {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        'Content-Type': 'application/json',
                    },
                })

            const currentProductId = productResponse.data.id

            // Upload new images if any
            if (images.length > 0) {
                const imageUrl = `${import.meta.env.VITE_API_BASE_URL}/shops/product-image-create/`

                const imageUploadPromises = images.map(async (img, index) => {
                    const imageFormData = new FormData()
                    
                    // Link image to the product using product_id
                    imageFormData.append('product_id', currentProductId)
                    imageFormData.append('media', img.file)
                    imageFormData.append('is_primary', String(img.isPrimary))
                    imageFormData.append('order', String(existingMedia.length + index))

                    console.log(`Uploading image ${index + 1}/${images.length} for product ${currentProductId}`)

                    return api.post(imageUrl, imageFormData, {
                        headers: {
                            Authorization: `Bearer ${accessToken}`,
                            'Content-Type': 'multipart/form-data',
                        },
                    })
                })

                // Wait for all images to upload
                await Promise.all(imageUploadPromises)
            }

            toaster.create({
                title: 'Success',
                description: isUpdate 
                    ? `Product updated successfully${images.length > 0 ? ` with ${images.length} new image${images.length > 1 ? 's' : ''}` : ''}`
                    : `Product and ${images.length} image${images.length > 1 ? 's' : ''} added successfully`,
                type: 'success',
                duration: 3000,
            })

            // Navigate back or reset form
            if (isUpdate) {
                Navigate(-1) // Go back to previous page after update
            } else {
                // Reset form but keep shop_id for new products
                const currentShopId = formData.shop_id
                setFormData({
                    id: "",
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
            }

        } catch (error: any) {
            console.error("Failed to save product:", error.response?.data || error.message)
            toaster.create({
                title: 'Error',
                description: error.response?.data?.message || error.response?.data?.error || 'Failed to save product',
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
                <Heading size="lg" mb={6}>Update Product</Heading>
                <Toaster/>
                <form onSubmit={handleUpdateProduct}>
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
                        <Field.Root required>
                            <Field.Label>
                                ShopId <Field.RequiredIndicator />
                            </Field.Label>
                            <Input
                                name="shop_id"
                                value={formData.shop_id}
                                onChange={handleChange}
                                // placeholder="Enter shop ID"
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
                                value={formData.warranty}
                                onChange={handleChange}
                                placeholder="Enter warranty"
                                size="lg"
                            />
                        </Field.Root>

                        {/* Category - Multi-select */}
                        <Field.Root>
                            <Field.Label htmlFor="category">Category</Field.Label>
                            {categories && categories.length === 0 ? (
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

                        {/* Properties - Unified Table */}
                        <Field.Root>
                            <HStack justify="space-between" align="center" mb={2}>
                                <Field.Label htmlFor="properties">
                                    Product Properties ({formData.properties.length})
                                </Field.Label>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    colorPalette="blue"
                                    onClick={() => setShowPropertyForm(!showPropertyForm)}
                                >
                                    {showPropertyForm ? 'Cancel' : '+ Add Property'}
                                </Button>
                            </HStack>
                            
                            <Box overflowX="auto" border={"1px solid"} borderRadius="md">
                                <Table.Root showColumnBorder>
                                    <Table.Header>
                                        <Table.Row>
                                            <Table.ColumnHeader textAlign={"center"}>Name</Table.ColumnHeader>
                                            <Table.ColumnHeader textAlign={"center"}>Value</Table.ColumnHeader>
                                            <Table.ColumnHeader textAlign={"center"}>Action</Table.ColumnHeader>
                                        </Table.Row>
                                    </Table.Header>
                                    <Table.Body>
                                        {/* Add Property Row */}
                                        {showPropertyForm && (
                                            <Table.Row bg="blue.50">
                                                <Table.Cell>
                                                    <select
                                                        value={newProperty.name}
                                                        onChange={(e) => {
                                                            setNewProperty(prev => ({...prev, name: e.target.value}))
                                                            if (e.target.value !== 'Custom') {
                                                                setCustomPropertyName('')
                                                            }
                                                        }}
                                                        style={{border:"1px solid", borderRadius:"5px", padding:"8px", width:"100%"}}
                                                    >
                                                        <option value={""}>Choose one</option>
                                                        <option value={"Color"}>Color</option>
                                                        <option value={"Dimensions"}>Dimensions</option>
                                                        <option value={"Weight"}>Weight</option>
                                                        <option value={"Material"}>Material</option>
                                                        <option value={"Custom"}>Others</option>
                                                    </select>
                                                    {newProperty.name === 'Custom' && (
                                                        <Input
                                                            value={customPropertyName}
                                                            onChange={(e) => setCustomPropertyName(e.target.value)}
                                                            placeholder="Enter custom property name"
                                                            size="sm"
                                                            mt={2}
                                                        />
                                                    )}
                                                </Table.Cell>
                                                <Table.Cell>
                                                    <Input
                                                        value={newProperty.value}
                                                        onChange={(e) => setNewProperty(prev => ({...prev, value: e.target.value}))}
                                                        placeholder="e.g., Red, XL, Cotton"
                                                        size="sm"
                                                    />
                                                </Table.Cell>
                                                <Table.Cell textAlign="center">
                                                    <Button size="sm" colorPalette="blue" onClick={handleAddProperty}>
                                                        Add
                                                    </Button>
                                                </Table.Cell>
                                            </Table.Row>
                                        )}
                                        
                                        {/* Existing Properties Rows */}
                                        {formData.properties.map((selectedProp) => (
                                            <Table.Row key={selectedProp.property_name}>
                                                <Table.Cell>{selectedProp.property_name}</Table.Cell>
                                                <Table.Cell>
                                                    <Input
                                                        value={selectedProp.value}
                                                        onChange={(e) => handlePropertyValueChange(selectedProp.property_name, e.target.value)}
                                                        placeholder={`Enter ${selectedProp.property_name?.toLowerCase() || 'property'} value`}
                                                        size="sm"
                                                    />
                                                </Table.Cell>
                                                <Table.Cell textAlign="center">
                                                    <IconButton
                                                        size="sm"
                                                        variant="ghost"
                                                        colorPalette="red"
                                                        onClick={() => handleRemoveProperty(selectedProp.property_name)}
                                                        aria-label="Remove property"
                                                    >
                                                        <X size={16} />
                                                    </IconButton>
                                                </Table.Cell>
                                            </Table.Row>
                                        ))}
                                        
                                        {/* Empty State */}
                                        {formData.properties.length === 0 && !showPropertyForm && (
                                            <Table.Row>
                                                <Table.Cell colSpan={3} textAlign="center" color="gray.500" py={4}>
                                                    No properties added yet. Click "+ Add Property" to add one.
                                                </Table.Cell>
                                            </Table.Row>
                                        )}
                                    </Table.Body>
                                </Table.Root>
                            </Box>
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
                        <Field.Root required={images.length === 0 && existingMedia.length === 0}>
                            <Field.Label>Product Media {existingMedia.length + images.length > 0 && `(${existingMedia.length + images.length}/${MAX_IMAGES})`}</Field.Label>
                            
                            {/* Existing Media Section */}
                            {existingMedia.length > 0 && (
                                <Box mb={4} w={'100%'}>
                                    <Text fontSize="sm" fontWeight="semibold" mb={2}>Current Media ({existingMedia.length})</Text>
                                    <Wrap gap={"10px"} justify={"space-between"}>
                                        {existingMedia.map((media) => {
                                            const isVideo = media.media && media.media.match(/\.(mp4|webm|ogg|mov)$/i)
                                            const mediaUrl = media.media.startsWith('http') ? media.media : `${import.meta.env.VITE_API_BASE_URL}${media.media}`
                                            
                                            return (
                                                <Box
                                                    key={media.id}
                                                    position="relative"
                                                    borderWidth="2px"
                                                    borderColor={media.is_primary ? "blue.500" : "gray.200"}
                                                    borderRadius="md"
                                                    overflow="hidden"
                                                    p={2}
                                                    w={"130px"}
                                                >
                                                    {media.is_primary && (
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
                                                    
                                                    {isVideo ? (
                                                        <video
                                                            src={mediaUrl}
                                                            style={{
                                                                width: '100%',
                                                                height: '150px',
                                                                objectFit: 'cover',
                                                                borderRadius: '6px'
                                                            }}
                                                            controls
                                                        />
                                                    ) : (
                                                        <Image
                                                            src={mediaUrl}
                                                            alt="Product media"
                                                            width="100%"
                                                            height="150px"
                                                            fit={"fill"}
                                                            borderRadius="6px"
                                                        />
                                                    )}
                                                    
                                                    <HStack mt={2} gap={1}>
                                                        {!media.is_primary && (
                                                            <Button
                                                                size="xs"
                                                                colorPalette="blue"
                                                                variant="outline"
                                                                onClick={() => handleSetExistingPrimary(media.id)}
                                                                flex={1}
                                                            >
                                                                Set Primary
                                                            </Button>
                                                        )}
                                                        <IconButton
                                                            size="xs"
                                                            colorPalette="red"
                                                            variant="outline"
                                                            onClick={() => handleDeleteExistingMedia(media.id)}
                                                            aria-label="Delete media"
                                                        >
                                                            <X size={16} />
                                                        </IconButton>
                                                    </HStack>
                                                </Box>
                                            )
                                        })}
                                    </Wrap>
                                </Box>
                            )}
                            
                            {/* Add New Media Section */}
                            <Box>
                                <Text fontSize="sm" fontWeight="semibold" mb={2}>Add New Media</Text>
                                <Input
                                    type="file"
                                    accept="image/*,video/*"
                                    multiple
                                    ref={fileInputRef}
                                    onChange={handleImageSelect}
                                    onClick={(e) => {
                                        if (existingMedia.length + images.length >= MAX_IMAGES) {
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
                                disabled={existingMedia.length + images.length >= MAX_IMAGES}
                                cursor={existingMedia.length + images.length >= MAX_IMAGES ? "not-allowed" : "pointer"}
                                opacity={existingMedia.length + images.length >= MAX_IMAGES ? 0.6 : 1}
                            />
                            <Field.HelperText color={existingMedia.length + images.length >= MAX_IMAGES ? "red.500" : "gray.600"}>
                                {existingMedia.length + images.length < MAX_IMAGES 
                                    ? `Add up to ${MAX_IMAGES - images.length} more. Max 5MB for images, 50MB for videos. Formats: JPG, PNG, GIF, WebP, MP4, MOV.`
                                    : 'Maximum reached. Remove an image to add more.'}
                            </Field.HelperText>
                            </Box>
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
                            disabled={!formData.shop_id || (images.length === 0 && existingMedia.length === 0)}
                        >
                            {isLoading ? 'Adding Product...' : 'Update'}
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

export default ProductUpdate


// import {useEffect, useState, useRef} from 'react'
// import { Link, useNavigate, useParams } from 'react-router-dom'
// import { useSelector } from 'react-redux'
// import useAccessToken from '../../services/token'
// import api from '../../services/api'
// import { Box, Text, Stack, Input, Textarea, Button, Spinner, Heading, Separator,
//     Group, Image, HStack, Wrap, Badge, 
//     IconButton} from '@chakra-ui/react'
// import { Field } from '@chakra-ui/react/field'
// import { toaster } from '../ui/toaster'
// import formatDate from '@/components/formatDate'
// import { X } from 'lucide-react'

// interface ProductImage {
//     id: string
//     media: string
//     is_primary: boolean
//     order: number
// }

// interface ImagePreview {
//     file: File
//     preview: string
//     isPrimary: boolean
// }

// interface Property {
//     id: string
//     name: string
//     values: string[]
//     description: string
//     created_at: string
// }

// interface Category {
//     id: string
//     name: string
//     description: string
// }

// interface ProductProp {
//     id: string
//     name: string;
//     shop_id: string;
//     description: string;
//     quantity: number;
//     price: number;
//     new_price: number;
//     discount_end_at: string;
//     currency_unit: string;
//     condition: string;
//     warranty: string;
//     category: string[];  // Array of category IDs
//     properties: Property[];  // Array of full property objects with values
//     delivery_term: string;
//     refund_policy: string;
//     refund: boolean;
//     images: ProductImage[]
// }

// // ✅ Helper functions for datetime conversion
// const convertUTCToLocal = (utcDatetime: string): string => {
//     if (!utcDatetime) return '';
//     try {
//         const date = new Date(utcDatetime);
//         const year = date.getFullYear();
//         const month = String(date.getMonth() + 1).padStart(2, '0');
//         const day = String(date.getDate()).padStart(2, '0');
//         const hours = String(date.getHours()).padStart(2, '0');
//         const minutes = String(date.getMinutes()).padStart(2, '0');
//         return `${year}-${month}-${day}T${hours}:${minutes}`;
//     } catch (error) {
//         console.error('Error converting UTC to local:', error);
//         return '';
//     }
// };

// const convertLocalToUTC = (localDatetime: string): string => {
//     if (!localDatetime) return '';
//     try {
//         return new Date(localDatetime).toISOString();
//     } catch (error) {
//         console.error('Error converting local to UTC:', error);
//         return '';
//     }
// };

// const ProductUpdate: React.FC = () => {
//     const navigate = useNavigate()
//     const { productId } = useParams()
//     const user = useSelector((state: any) => state.auth.user)
//     const { accessToken } = useAccessToken(user)
//     const [products, setProducts] = useState<ProductProp[]>([])
//     const [isLoading, setLoading] = useState<boolean>(false)
    
//     const [editingField, setEditingField] = useState<{productId: string, fieldName: string} | null>(null)
//     const [tempValue, setTempValue] = useState<string>('')
//     const [isUpdating, setIsUpdating] = useState<boolean>(false)
    
//     const [imagePreviews, setImagePreviews] = useState<ImagePreview[]>([])
//     const fileInputRef = useRef<HTMLInputElement>(null)
    
//     // Categories and Properties state
//     const [categories, setCategories] = useState<Category[]>([])
//     const [allProperties, setAllProperties] = useState<Property[]>([])
//     const [selectedCategories, setSelectedCategories] = useState<string[]>([])
//     const [selectedPropertiesWithValues, setSelectedPropertiesWithValues] = useState<{
//         property_id: string;
//         selected_values: string[];
//     }[]>([])

//     const fetchProductData = async () => {
//         setLoading(true)
//         if (!accessToken) {
//             toaster.create({
//                 title: 'Authentication Error',
//                 description: 'Cannot get access token',
//                 type: 'error',
//                 duration: 3000,
//             })
//             return
//         }
//         try {
//             const url = `${import.meta.env.VITE_API_BASE_URL}/shops/product-list-create/`
//             const config = {
//                 headers: {
//                     Authorization: `Bearer ${accessToken}`,
//                     "Content-Type": "application/json",
//                 },
//             }
//             const response = await api.get(url, config)
//             const data = Array.isArray(response.data[0]) ? response.data[0] : response.data
//             const filter = data.filter((p: ProductProp) => p.id === productId)
//             console.log('Product data:', filter)
//             console.log('Product categories:', filter[0]?.category)
//             setProducts(filter)
//         } catch (error: any) {
//             console.error("fetching error", error.response?.data || error.message)
//             toaster.create({
//                 title: 'Error',
//                 description: 'Failed to fetch product data',
//                 type: 'error',
//                 duration: 3000,
//             })
//         } finally {
//             setLoading(false)
//         }
//     }

//     useEffect(() => {
//         if (accessToken && user) {
//             fetchProductData()
//             fetchCategories()
//             fetchProperties()
//         }
//     }, [accessToken, user])
    
//     const fetchCategories = async () => {
//         try {
//             const config = accessToken ? {
//                 headers: {
//                     Authorization: `Bearer ${accessToken}`,
//                 },
//             } : {}
//             const response = await api.get(`${import.meta.env.VITE_API_BASE_URL}/shops/category-list/`, config)
//             console.log('Categories fetched:', response.data)
//             setCategories(response.data || [])
//         } catch (error: any) {
//             console.error("Failed to fetch categories:", error)
//         }
//     }

//     const fetchProperties = async () => {
//         try {
//             const config = accessToken ? {
//                 headers: {
//                     Authorization: `Bearer ${accessToken}`,
//                 },
//             } : {}
//             const response = await api.get(`${import.meta.env.VITE_API_BASE_URL}/shops/properties-list/`, config)
//             console.log('Properties fetched:', response.data)
//             setAllProperties(response.data || [])
//         } catch (error: any) {
//             console.error("Failed to fetch properties:", error)
//         }
//     }
    
//     const handleEdit = (productId: string, fieldName: keyof ProductProp, currentValue: any, isDatetime: boolean = false) => {
//         setEditingField({ productId, fieldName })
        
//         // Handle different field types
//         if (fieldName === 'category') {
//             setSelectedCategories(Array.isArray(currentValue) ? currentValue : [])
//         } else if (fieldName === 'properties') {
//             // Initialize with all properties and all their values selected
//             const propsWithValues = Array.isArray(currentValue) 
//                 ? currentValue.map((p: Property) => ({
//                     property_id: p.id,
//                     selected_values: p.values || [] // Start with all values selected
//                   }))
//                 : []
//             setSelectedPropertiesWithValues(propsWithValues)
//         } else {
//             setTempValue(isDatetime ? convertUTCToLocal(currentValue) : currentValue)
//         }
//     }

//     const handleCancel = () => {
//         setEditingField(null)
//         setTempValue('')
//         setSelectedCategories([])
//         setSelectedPropertiesWithValues([])
//         setImagePreviews([])
//         if (fileInputRef.current) {
//             fileInputRef.current.value = ''
//         }
//     }
    
//     // Handle category selection
//     const handleCategoryToggle = (categoryId: string) => {
//         setSelectedCategories(prev => {
//             if (prev.includes(categoryId)) {
//                 return prev.filter(id => id !== categoryId)
//             } else {
//                 return [...prev, categoryId]
//             }
//         })
//     }
    
//     // Add a property (with all values selected by default)
//     const handleAddProperty = (propertyId: string) => {
//         const property = allProperties.find(p => p.id === propertyId)
//         if (!property) return
        
//         // Check if already added
//         if (selectedPropertiesWithValues.some(p => p.property_id === propertyId)) return
        
//         setSelectedPropertiesWithValues(prev => [
//             ...prev,
//             {
//                 property_id: propertyId,
//                 selected_values: property.values || [] // All values selected by default
//             }
//         ])
//     }
    
//     // Remove a property
//     const handleRemoveProperty = (propertyId: string) => {
//         setSelectedPropertiesWithValues(prev => 
//             prev.filter(p => p.property_id !== propertyId)
//         )
//     }
    
//     // Toggle individual property value
//     const handlePropertyValueToggle = (propertyId: string, value: string) => {
//         setSelectedPropertiesWithValues(prev => 
//             prev.map(p => {
//                 if (p.property_id === propertyId) {
//                     const isSelected = p.selected_values.includes(value)
//                     return {
//                         ...p,
//                         selected_values: isSelected
//                             ? p.selected_values.filter(v => v !== value)
//                             : [...p.selected_values, value]
//                     }
//                 }
//                 return p
//             })
//         )
//     }

//     // ✅ Fixed: Handle multiple image selection
//     const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//         const files = e.target.files
//         if (!files || files.length === 0) return

//         const newPreviews: ImagePreview[] = []
//         let validFiles = 0
//         let hasVideo = false

//         Array.from(files).forEach((file, index) => {
//             // Allow both images and videos
//             if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
//                 toaster.create({
//                     title: 'Invalid File',
//                     description: `${file.name} is not an image or video file`,
//                     type: 'error',
//                     duration: 3000,
//                 })
//                 return
//             }
            
//             // Increase size limit for videos (50MB)
//             const maxSize = file.type.startsWith('video/') ? 50 * 1024 * 1024 : 5 * 1024 * 1024
//             if (file.size > maxSize) {
//                 const sizeLimit = file.type.startsWith('video/') ? '50MB' : '5MB'
//                 toaster.create({
//                     title: 'File Too Large',
//                     description: `${file.name} is larger than ${sizeLimit}`,
//                     type: 'error',
//                     duration: 3000,
//                 })
//                 return
//             }

//             // Check if this file is a video
//             if (file.type.startsWith('video/')) {
//                 hasVideo = true
//             }

//             validFiles++
//             const reader = new FileReader()
//             reader.onloadend = () => {
//                 newPreviews.push({
//                     file,
//                     preview: reader.result as string,
//                     isPrimary: false // Will be set after sorting
//                 })

//                 if (newPreviews.length === validFiles) {
//                     // Sort new previews so videos come first
//                     const sortedPreviews = newPreviews.sort((a, b) => {
//                         const aIsVideo = a.file.type.startsWith('video/')
//                         const bIsVideo = b.file.type.startsWith('video/')
//                         if (aIsVideo && !bIsVideo) return -1
//                         if (!aIsVideo && bIsVideo) return 1
//                         return 0
//                     })
                    
//                     // Clear isPrimary from all existing previews before combining
//                     const existingWithoutPrimary = imagePreviews.map(item => ({
//                         ...item,
//                         isPrimary: false
//                     }))
                    
//                     // Combine with existing previews and re-sort everything
//                     const allPreviews = [...sortedPreviews, ...existingWithoutPrimary]
                    
//                     // Sort all items: videos first, then images
//                     const finalSorted = allPreviews.sort((a, b) => {
//                         const aIsVideo = a.file.type.startsWith('video/')
//                         const bIsVideo = b.file.type.startsWith('video/')
//                         if (aIsVideo && !bIsVideo) return -1
//                         if (!aIsVideo && bIsVideo) return 1
//                         return 0
//                     })
                    
//                     // Set only the first item as primary (which will be a video if any video exists)
//                     const withPrimary = finalSorted.map((item, index) => ({
//                         ...item,
//                         isPrimary: index === 0
//                     }))
                    
//                     setImagePreviews(withPrimary)
//                 }
//             }
//             reader.readAsDataURL(file)
//         })
//     }

//     // ✅ New: Handle setting primary image in preview
//     const handleSetPrimary = (index: number) => {
//         setImagePreviews(prev => {
//             // First, update which one is primary
//             const updated = prev.map((img, i) => ({
//                 ...img,
//                 isPrimary: i === index
//             }))
            
//             // Then re-sort to keep videos first
//             return updated.sort((a, b) => {
//                 const aIsVideo = a.file.type.startsWith('video/')
//                 const bIsVideo = b.file.type.startsWith('video/')
//                 if (aIsVideo && !bIsVideo) return -1
//                 if (!aIsVideo && bIsVideo) return 1
//                 // Keep primary first within same type
//                 if (a.isPrimary && !b.isPrimary) return -1
//                 if (!a.isPrimary && b.isPrimary) return 1
//                 return 0
//             })
//         })
//     }

//     // ✅ New: Handle removing image from preview
//     const handleRemoveImage = (index: number) => {
//         setImagePreviews(prev => {
//             const newPreviews = prev.filter((_, i) => i !== index)
            
//             if (newPreviews.length === 0) return newPreviews
            
//             // Re-sort to keep videos first
//             const sorted = newPreviews.sort((a, b) => {
//                 const aIsVideo = a.file.type.startsWith('video/')
//                 const bIsVideo = b.file.type.startsWith('video/')
//                 if (aIsVideo && !bIsVideo) return -1
//                 if (!aIsVideo && bIsVideo) return 1
//                 return 0
//             })
            
//             // Ensure only the first item is primary
//             return sorted.map((item, i) => ({
//                 ...item,
//                 isPrimary: i === 0
//             }))
//         })
//     }

//     const handleDeleteImage = async (productId: string, imageId: string) => {
//         if (!accessToken) {
//             navigate("/")
//             return
//         }
//         if (!window.confirm('Are you sure you want to delete this image?')) {
//             return
//         }
//         setIsUpdating(true)
//         try {
//             const url = `${import.meta.env.VITE_API_BASE_URL}/shops/product-image-editor/${imageId}/`
//             const config = {
//                 headers: {
//                     Authorization: `Bearer ${accessToken}`,
//                 },
//             }
//             await api.delete(url, config)
            
//             setProducts(products.map(product => 
//                 product.id === productId 
//                     ? { ...product, images: product.images.filter(img => img.id !== imageId) }
//                     : product
//             ))
            
//             toaster.create({
//                 title: 'Success',
//                 description: 'Image deleted successfully',
//                 type: 'success',
//                 duration: 3000,
//             })
//         } catch (error: any) {
//             console.error("delete failed", error.response?.data || error.message)
//             toaster.create({
//                 title: 'Delete Failed',
//                 description: error.response?.data?.message || 'Failed to delete image',
//                 type: 'error',
//                 duration: 3000,
//             })
//         } finally {
//             setIsUpdating(false)
//         }
//     }

//     const handleSetPrimaryImage = async (productId: string, imageId: string) => {
//         if (!accessToken) {
//             navigate("/")
//             return
//         }
//         setIsUpdating(true)
//         try {
//             const url = `${import.meta.env.VITE_API_BASE_URL}/shops/product-image-editor/${imageId}/`
//             const config = {
//                 headers: {
//                     Authorization: `Bearer ${accessToken}`,
//                     "Content-Type": "application/json",
//                 },
//             }
//             await api.patch(url, { is_primary: true }, config)
            
//             setProducts(products.map(product => 
//                 product.id === productId 
//                     ? { 
//                         ...product, 
//                         images: product.images.map(img => ({
//                             ...img,
//                             is_primary: img.id === imageId
//                         }))
//                       }
//                     : product
//             ))
            
//             toaster.create({
//                 title: 'Success',
//                 description: 'Primary image updated successfully',
//                 type: 'success',
//                 duration: 3000,
//             })
//         } catch (error: any) {
//             console.error("update failed", error.response?.data || error.message)
//             toaster.create({
//                 title: 'Update Failed',
//                 description: error.response?.data?.message || 'Failed to update primary image',
//                 type: 'error',
//                 duration: 3000,
//             })
//         } finally {
//             setIsUpdating(false)
//         }
//     }

//     // ✅ Updated: Handle uploading multiple images
//     const handleUpdateField = async (productId: string, fieldName: keyof ProductProp, isDatetime: boolean = false) => {
//         if (!accessToken) {
//             navigate("/")
//             return
//         }
        
//         setIsUpdating(true)
        
//         try {
//             const url = `${import.meta.env.VITE_API_BASE_URL}/shops/product-editor/${productId}/`
            
//             if (fieldName === 'images' && imagePreviews.length > 0) {
//                 const uploadUrl = `${import.meta.env.VITE_API_BASE_URL}/shops/product-image-create/`
//                 const config = {
//                     headers: {
//                         Authorization: `Bearer ${accessToken}`,
//                         "Content-Type": "multipart/form-data",
//                     },
//                 }

//                 // Check if any new upload is marked as primary
//                 const hasNewPrimary = imagePreviews.some(img => img.isPrimary)
                
//                 // If uploading a new primary, first unset existing primary images
//                 if (hasNewPrimary) {
//                     const product = products.find(p => p.id === productId)
//                     if (product && product.images) {
//                         for (const existingImg of product.images) {
//                             if (existingImg.is_primary) {
//                                 const updateUrl = `${import.meta.env.VITE_API_BASE_URL}/shops/product-image-editor/${existingImg.id}/`
//                                 const updateData = new FormData()
//                                 updateData.append('is_primary', 'false')
//                                 await api.patch(updateUrl, updateData, config)
//                             }
//                         }
//                     }
//                 }

//                 // Upload each image
//                 const uploadedImages: ProductImage[] = []
//                 for (let i = 0; i < imagePreviews.length; i++) {
//                     const img = imagePreviews[i]
//                     const formData = new FormData()
//                     formData.append('media', img.file)
//                     formData.append('product_id', productId)
//                     formData.append('is_primary', String(img.isPrimary))
//                     formData.append('order', String(i))
                    
//                     const response = await api.post(uploadUrl, formData, config)
//                     uploadedImages.push(response.data)
//                 }
                
//                 // Refresh product data to get updated images
//                 await fetchProductData()
                
//                 // Clear previews after successful upload
//                 setImagePreviews([])
                
//                 toaster.create({
//                     title: 'Success',
//                     description: 'Media files uploaded successfully',
//                     type: 'success',
//                     duration: 3000,
//                 })
//             } else if (fieldName === 'category') {
//                 // Handle category update
//                 const config = {
//                     headers: {
//                         Authorization: `Bearer ${accessToken}`,
//                         "Content-Type": "application/json",
//                     },
//                 }
                
//                 const updateData = { category: selectedCategories }
//                 await api.patch(url, updateData, config)
                
//                 // Refresh product data to get updated categories
//                 await fetchProductData()
//             } else if (fieldName === 'properties') {
//                 // Handle properties update - only send property IDs that have selected values
//                 const config = {
//                     headers: {
//                         Authorization: `Bearer ${accessToken}`,
//                         "Content-Type": "application/json",
//                     },
//                 }
                
//                 // Filter out properties with no selected values and extract IDs
//                 const propertyIds = selectedPropertiesWithValues
//                     .filter(p => p.selected_values.length > 0)
//                     .map(p => p.property_id)
                
//                 const updateData = { properties: propertyIds }
//                 await api.patch(url, updateData, config)
                
//                 // Refresh product data to get updated properties with full details
//                 await fetchProductData()
//             } else {
//                 const config = {
//                     headers: {
//                         Authorization: `Bearer ${accessToken}`,
//                         "Content-Type": "application/json",
//                     },
//                 }
                
//                 const valueToSend = isDatetime ? convertLocalToUTC(tempValue) : tempValue;
//                 const updateData = { [fieldName]: valueToSend }
                
//                 await api.patch(url, updateData, config)
                
//                 setProducts(products.map(product => 
//                     product.id === productId 
//                         ? { ...product, [fieldName]: valueToSend }
//                         : product
//                 ))
//             }
            
//             setEditingField(null)
//             setTempValue('')
//             setSelectedCategories([])
//             setSelectedPropertiesWithValues([])
//             setImagePreviews([])
//             if (fileInputRef.current) {
//                 fileInputRef.current.value = ''
//             }
            
//             toaster.create({
//                 title: 'Success',
//                 description: `${fieldName} updated successfully`,
//                 type: 'success',
//                 duration: 3000,
//             })
//         } catch (error: any) {
//             console.error("update is not successful", error.response?.data || error.message)
//             toaster.create({
//                 title: 'Update Failed',
//                 description: error.response?.data?.message || 'Failed to update field',
//                 type: 'error',
//                 duration: 3000,
//             })
//         } finally {
//             setIsUpdating(false)
//         }
//     }

//     const renderField = (
//         product: ProductProp, 
//         fieldName: keyof ProductProp, 
//         label: string, 
//         isTextarea: boolean = false,
//         isDatetime: boolean = false,
//         isSelection: boolean = false
//     ) => {
//         const isEditing = editingField?.productId === product.id && editingField?.fieldName === fieldName;
//         const rawValue = String(product[fieldName] || '');
//         const displayValue = isDatetime && rawValue
//             ? formatDate(rawValue)
//             : rawValue || 'Not set';
//         const isFieldDisabled = editingField !== null && !isEditing;
        
//         return (
//             <Box key={fieldName}>
//                 <Field.Root>
//                     <Field.Label fontWeight="semibold" color="gray.700" fontSize="sm">
//                         {label}
//                     </Field.Label>
//                     <Group gap={3} align="flex-start" width="full">
//                         <Box flex="1">
//                             {isEditing ? (
//                                 isTextarea ? (
//                                     <Textarea
//                                         value={tempValue}
//                                         onChange={(e) => setTempValue(e.target.value)}
//                                         size="sm"
//                                         rows={4}
//                                     />
//                                 ) : isDatetime ? (
//                                     <Input
//                                         type='datetime-local'
//                                         value={tempValue}
//                                         onChange={(e) => setTempValue(e.target.value)}
//                                         size="sm"
//                                     />
//                                 ) : isSelection ? (
//                                     <select
//                                         value={tempValue}
//                                         onChange={(e) => setTempValue(e.target.value)}
//                                         style={{border:"1px solid", padding:"10px", borderRadius:"5px", width:"100%"}}
//                                     >
//                                         <option value="">Choose one</option>
//                                         <option value="NEW">NEW</option>
//                                         <option value="USED - LIKE NEW">USED - LIKE NEW</option>
//                                         <option value="USED - GOOD">USED - GOOD</option>
//                                         <option value="NOT WORKING">NOT WORKING</option>
//                                         <option value="BROKEN">BROKEN</option>
//                                     </select>
//                                 ):(
//                                     <Input
//                                         value={tempValue}
//                                         onChange={(e) => setTempValue(e.target.value)}
//                                         size="sm"
//                                     />
//                                 )
//                             ) : (
//                                 <Text
//                                     p={2}
//                                     bg="gray.50"
//                                     borderRadius="md"
//                                     minH="32px"
//                                     display="flex"
//                                     alignItems="center"
//                                     fontSize="sm"
//                                     color={rawValue ? "gray.800" : "gray.400"}
//                                 >
//                                     {displayValue}
//                                 </Text>
//                             )}
//                         </Box>
                        
//                         <Group gap={2}>
//                             {isEditing ? (
//                                 <>
//                                     <Button
//                                         colorPalette="green"
//                                         size="sm"
//                                         onClick={() => handleUpdateField(product.id, fieldName, isDatetime)}
//                                         loading={isUpdating}
//                                     >
//                                         Save
//                                     </Button>
//                                     <Button
//                                         variant="outline"
//                                         size="sm"
//                                         onClick={handleCancel}
//                                         disabled={isUpdating}
//                                     >
//                                         Cancel
//                                     </Button>
//                                 </>
//                             ) : (
//                                 <Button
//                                     colorPalette="blue"
//                                     size="sm"
//                                     onClick={() => handleEdit(product.id, fieldName, rawValue, isDatetime)}
//                                     disabled={isFieldDisabled}
//                                 >
//                                     Update
//                                 </Button>
//                             )}
//                         </Group>
//                     </Group>
//                 </Field.Root>
//             </Box>
//         );
//     };

//     const renderImageField = (product: ProductProp) => {
//         const isEditing = editingField?.productId === product.id && editingField?.fieldName === 'images'
//         const isFieldDisabled = editingField !== null && !isEditing

//         return (
//             <Box>
//                 <Field.Root>
//                     <Field.Label fontWeight="semibold" color="gray.700" fontSize="sm">
//                         Product Images
//                     </Field.Label>
                    
//                     {product.images && product.images.length > 0 && (
//                         <Box mb={4}>
//                             <Text fontSize="sm" mb={2}>
//                                 Current Images ({product.images.length})
//                             </Text>
//                             <Wrap gap={4}>
//                                 {product.images
//                                     .sort((a, b) => {
//                                         // Helper to check if media is video
//                                         const isVideoA = a.media && a.media.match(/\.(mp4|webm|ogg|mov)$/i)
//                                         const isVideoB = b.media && b.media.match(/\.(mp4|webm|ogg|mov)$/i)
                                        
//                                         // Videos come first
//                                         if (isVideoA && !isVideoB) return -1
//                                         if (!isVideoA && isVideoB) return 1
                                        
//                                         // If both same type, sort by is_primary then order
//                                         if (a.is_primary && !b.is_primary) return -1
//                                         if (!a.is_primary && b.is_primary) return 1
//                                         return a.order - b.order
//                                     })
//                                     .map((img) => (
//                                         <Box
//                                             key={img.id}
//                                             position="relative"
//                                             borderWidth="1px"
//                                             rounded="md"
//                                             p={2}
//                                         >
//                                             {img.media && (img.media.match(/\.(mp4|webm|ogg|mov)$/i)) ? (
//                                                 <video
//                                                     src={img.media}
//                                                     style={{
//                                                         height: '150px',
//                                                         width: '180px',
//                                                         objectFit: 'cover',
//                                                         borderRadius: 'var(--chakra-radii-md)'
//                                                     }}
//                                                     controls
//                                                 />
//                                             ) : (
//                                                 <Image
//                                                     src={img.media}
//                                                     alt={`Product image ${img.order}`}
//                                                     height="150px"
//                                                     width="180px"
//                                                     objectFit="cover"
//                                                     rounded="md"
//                                                 />
//                                             )}
                                            
//                                             {img.is_primary && (
//                                                 <Box
//                                                     position="absolute"
//                                                     top={3}
//                                                     left={3}
//                                                     bg="blue.500"
//                                                     color="white"
//                                                     px={2}
//                                                     py={1}
//                                                     fontSize="xs"
//                                                     borderRadius="md"
//                                                     fontWeight="bold"
//                                                 >
//                                                     Primary
//                                                 </Box>
//                                             )}
                                            
//                                             <HStack mt={2} gap={2}>
//                                                 <Button
//                                                     size="xs"
//                                                     colorPalette="red"
//                                                     variant="outline"
//                                                     onClick={() => handleDeleteImage(product.id, img.id)}
//                                                     disabled={isFieldDisabled}
//                                                 >
//                                                     Remove
//                                                 </Button>
//                                                 {!img.is_primary && (
//                                                     <Button
//                                                         size="xs"
//                                                         colorPalette="blue"
//                                                         variant="outline"
//                                                         onClick={() => handleSetPrimaryImage(product.id, img.id)}
//                                                         disabled={isFieldDisabled}
//                                                     >
//                                                         Set Primary
//                                                     </Button>
//                                                 )}
//                                             </HStack>
//                                         </Box>
//                                     ))}
//                             </Wrap>
//                         </Box>
//                     )}
                    
//                     <Box>
//                         <Text fontSize="sm" fontWeight="semibold" mb={2}>
//                             Add New Media Files
//                         </Text>
//                         <Group gap={3} align="flex-start" width="full">
//                             <Box flex="1">
//                                 {isEditing ? (
//                                     <Stack gap={3}>
//                                         <Input
//                                             type="file"
//                                             accept="image/*,video/*"
//                                             multiple
//                                             ref={fileInputRef}
//                                             onChange={handleImageChange}
//                                             size="sm"
//                                         />
                                        
//                                         {imagePreviews.length > 0 && (
//                                             <Wrap gap={4}>
//                                                 {imagePreviews.map((img, index) => (
//                                                     <Box
//                                                         key={index}
//                                                         position="relative"
//                                                         borderRadius="md"
//                                                         overflow="hidden"
//                                                         borderWidth="2px"
//                                                         borderColor={img.isPrimary ? "blue.500" : "gray.200"}
//                                                     >
//                                                         {img.isPrimary && (
//                                                             <Badge
//                                                                 position="absolute"
//                                                                 top={2}
//                                                                 left={2}
//                                                                 colorPalette="blue"
//                                                                 zIndex={2}
//                                                             >
//                                                                 Primary
//                                                             </Badge>
//                                                         )}
                                                        
//                                                         {img.file.type.startsWith('video/') ? (
//                                                             <video
//                                                                 src={img.preview}
//                                                                 style={{
//                                                                     width: '150px',
//                                                                     height: '150px',
//                                                                     objectFit: 'cover'
//                                                                 }}
//                                                                 controls
//                                                             />
//                                                         ) : (
//                                                             <Image
//                                                                 src={img.preview}
//                                                                 alt={`Product ${index + 1}`}
//                                                                 w="150px"
//                                                                 h="150px"
//                                                                 objectFit="cover"
//                                                             />
//                                                         )}
                                                        
//                                                         <Box
//                                                             position="absolute"
//                                                             top={2}
//                                                             right={2}
//                                                             display="flex"
//                                                             gap={1}
//                                                         >
//                                                             {!img.isPrimary && (
//                                                                 <Button
//                                                                     size="xs"
//                                                                     colorPalette="blue"
//                                                                     onClick={() => handleSetPrimary(index)}
//                                                                 >
//                                                                     Set Primary
//                                                                 </Button>
//                                                             )}
                                                            
//                                                             <IconButton
//                                                                 aria-label="Remove image"
//                                                                 size="xs"
//                                                                 colorPalette="red"
//                                                                 onClick={() => handleRemoveImage(index)}
//                                                             >
//                                                                 <X size={16} />
//                                                             </IconButton>
//                                                         </Box>
                                                        
//                                                         <Box
//                                                             position="absolute"
//                                                             bottom={2}
//                                                             left={2}
//                                                             bg="blackAlpha.700"
//                                                             color="white"
//                                                             px={2}
//                                                             py={1}
//                                                             borderRadius="md"
//                                                             fontSize="xs"
//                                                         >
//                                                             {index + 1}
//                                                         </Box>
//                                                     </Box>
//                                                 ))}
//                                             </Wrap>
//                                         )}
//                                     </Stack>
//                                 ) : (
//                                     <Text
//                                         p={2}
//                                         bg="gray.50"
//                                         borderRadius="md"
//                                         minH="32px"
//                                         display="flex"
//                                         alignItems="center"
//                                         fontSize="sm"
//                                         color="gray.400"
//                                     >
//                                         Click "Add Media Files" to upload new media files
//                                     </Text>
//                                 )}
//                             </Box>
                            
//                             <Group gap={2}>
//                                 {isEditing ? (
//                                     <>
//                                         <Button
//                                             colorPalette="green"
//                                             size="sm"
//                                             onClick={() => handleUpdateField(product.id, 'images')}
//                                             loading={isUpdating}
//                                             disabled={imagePreviews.length === 0}
//                                         >
//                                             Upload ({imagePreviews.length})
//                                         </Button>
//                                         <Button
//                                             variant="outline"
//                                             size="sm"
//                                             onClick={handleCancel}
//                                             disabled={isUpdating}
//                                         >
//                                             Cancel
//                                         </Button>
//                                     </>
//                                 ) : (
//                                     <Button
//                                         colorPalette="blue"
//                                         size="sm"
//                                         onClick={() => {
//                                             setEditingField({ productId: product.id, fieldName: 'images' })
//                                         }}
//                                         disabled={isFieldDisabled}
//                                     >
//                                         Add Media Files
//                                     </Button>
//                                 )}
//                             </Group>
//                         </Group>
//                     </Box>
//                 </Field.Root>
//             </Box>
//         )
//     }

//     if (isLoading) {
//         return (
//             <Box display="flex" justifyContent="center" alignItems="center" minH="400px">
//                 <Spinner size="xl" color="blue.500" />
//             </Box>
//         )
//     }

//     return (
//         <Box p={6} maxW="1200px" mx="auto">
//             <Heading size="lg" mb={6}>
//                 Product Details
//             </Heading>
//             <Box mt="20px">
//                 {products && products.length === 0 ? (
//                     <Box textAlign="center" py={10}>
//                         <Text color="gray.500">No products found</Text>
//                     </Box>
//                 ) : (
//                     <Stack gap={8}>
//                         {products.map((product: ProductProp) => (
//                             <Box 
//                                 key={product.id} 
//                                 bg="white" 
//                                 p={6} 
//                                 borderRadius="lg" 
//                                 shadow="md"
//                                 borderWidth="1px"
//                                 borderColor="gray.200"
//                             >
//                                 <Stack gap={4}>
//                                     <Text fontWeight="bold" color="gray.600" fontSize="sm" mt={2}>
//                                         Basic Information
//                                     </Text>
//                                     {renderField(product, 'name', 'Product Name')}
//                                     <Separator />
//                                     {renderField(product, 'quantity', 'Quantity')}
//                                     <Separator />
//                                     {renderField(product, 'price', 'Price')}
//                                     <Separator />
//                                     {renderField(product, 'new_price', 'Sale Price')}
//                                     <Separator />
//                                     {renderField(product, 'discount_end_at', 'Discount End Date', false, true)}
//                                     <Separator />
//                                     {renderField(product, 'currency_unit', 'Currency Unit')}
//                                     <Separator />
//                                     {renderField(product, 'condition', 'Condition', false, false, true)}
//                                     <Separator />
//                                     {renderField(product, 'warranty', 'Warranty')}
//                                     <Separator />
//                                     {renderField(product, 'delivery_term', 'Delivery Terms', true)}
//                                     <Separator />
//                                     {renderField(product, 'refund_policy', 'Refund Policy', true)}
//                                     <Separator />
//                                     {renderField(product, 'refund', 'Refund Available')}
//                                     <Separator />
//                                     {renderField(product, 'description', 'Description', true)}
                                    
//                                     <Text fontWeight="bold" color="gray.600" fontSize="sm" mt={4}>
//                                         Categories & Properties
//                                     </Text>
//                                     <Box>
//                                         <Field.Root>
//                                             <Field.Label fontWeight="semibold" color="gray.700" fontSize="sm">
//                                                 Categories
//                                             </Field.Label>
//                                             {editingField?.productId === product.id && editingField?.fieldName === 'category' ? (
//                                                 <Box>
//                                                     <Box p={3} borderWidth="1px" borderRadius="md" mb={3}>
//                                                         <Text fontSize="sm" mb={2} fontWeight="bold">Select Categories:</Text>
//                                                         <Wrap gap={2}>
//                                                             {categories.map((cat) => (
//                                                                 <Badge
//                                                                     key={cat.id}
//                                                                     colorPalette={selectedCategories.includes(cat.id) ? "blue" : "gray"}
//                                                                     cursor="pointer"
//                                                                     onClick={() => handleCategoryToggle(cat.id)}
//                                                                     px={3}
//                                                                     py={2}
//                                                                 >
//                                                                     {selectedCategories.includes(cat.id) ? "✓ " : ""}{cat.name}
//                                                                 </Badge>
//                                                             ))}
//                                                         </Wrap>
//                                                         <Text fontSize="xs" color="gray.600" mt={2}>
//                                                             {selectedCategories.length} selected
//                                                         </Text>
//                                                     </Box>
//                                                     <Group gap={2}>
//                                                         <Button
//                                                             colorPalette="green"
//                                                             size="sm"
//                                                             onClick={() => handleUpdateField(product.id, 'category')}
//                                                             loading={isUpdating}
//                                                         >
//                                                             Save
//                                                         </Button>
//                                                         <Button
//                                                             variant="outline"
//                                                             size="sm"
//                                                             onClick={handleCancel}
//                                                             disabled={isUpdating}
//                                                         >
//                                                             Cancel
//                                                         </Button>
//                                                     </Group>
//                                                 </Box>
//                                             ) : (
//                                                 <Box>
//                                                     <Box p={2} bg="gray.50" borderRadius="md" mb={2}>
//                                                         {product.category && product.category.length > 0 ? (
//                                                             <Wrap gap={2}>
//                                                                 {product.category.map((catId) => {
//                                                                     const cat = categories.find(c => c.id === catId)
//                                                                     return (
//                                                                         <Badge key={catId} colorPalette="blue">
//                                                                             {cat?.name || catId}
//                                                                         </Badge>
//                                                                     )
//                                                                 })}
//                                                             </Wrap>
//                                                         ) : (
//                                                             <Text color="gray.400" fontSize="sm">No categories</Text>
//                                                         )}
//                                                     </Box>
//                                                     <Button
//                                                         colorPalette="blue"
//                                                         size="sm"
//                                                         onClick={() => handleEdit(product.id, 'category', product.category)}
//                                                         disabled={editingField !== null}
//                                                     >
//                                                         Update Categories
//                                                     </Button>
//                                                 </Box>
//                                             )}
//                                         </Field.Root>
//                                     </Box>
//                                     <Separator />
//                                     <Box>
//                                         <Field.Root>
//                                             <Field.Label fontWeight="semibold" color="gray.700" fontSize="sm">
//                                                 Product Properties
//                                             </Field.Label>
//                                             {editingField?.productId === product.id && editingField?.fieldName === 'properties' ? (
//                                                 <Box>
//                                                     <Box p={3} borderWidth="1px" borderRadius="md" mb={3}>
//                                                         {/* Property Selection */}
//                                                         <Text fontSize="sm" mb={2} fontWeight="bold">Add Properties:</Text>
//                                                         <Box mb={3}>
//                                                             <select
//                                                                 style={{
//                                                                     width: '100%',
//                                                                     padding: '8px',
//                                                                     borderRadius: '6px',
//                                                                     border: '1px solid #e2e8f0',
//                                                                     fontSize: '14px'
//                                                                 }}
//                                                                 onChange={(e) => {
//                                                                     if (e.target.value) {
//                                                                         handleAddProperty(e.target.value)
//                                                                         e.target.value = '' // Reset selection
//                                                                     }
//                                                                 }}
//                                                                 defaultValue=""
//                                                             >
//                                                                 <option value="" disabled>Select a property to add</option>
//                                                                 {allProperties
//                                                                     .filter(prop => !selectedPropertiesWithValues.some(p => p.property_id === prop.id))
//                                                                     .map((prop) => (
//                                                                         <option key={prop.id} value={prop.id}>
//                                                                             {prop.name}
//                                                                         </option>
//                                                                     ))
//                                                                 }
//                                                             </select>
//                                                         </Box>
                                                        
//                                                         {/* Selected Properties with Value Checkboxes */}
//                                                         {selectedPropertiesWithValues.length > 0 && (
//                                                             <Stack gap={3} mt={4}>
//                                                                 <Text fontSize="sm" fontWeight="bold">Selected Properties:</Text>
//                                                                 {selectedPropertiesWithValues.map((selectedProp) => {
//                                                                     const property = allProperties.find(p => p.id === selectedProp.property_id)
//                                                                     if (!property) return null
                                                                    
//                                                                     return (
//                                                                         <Box
//                                                                             key={selectedProp.property_id}
//                                                                             p={3}
//                                                                             borderWidth="1px"
//                                                                             borderRadius="md"
//                                                                             bg="blue.50"
//                                                                         >
//                                                                             <HStack justify="space-between" mb={2}>
//                                                                                 <Text fontWeight="bold" fontSize="sm">
//                                                                                     {property.name}
//                                                                                 </Text>
//                                                                                 <Button
//                                                                                     size="xs"
//                                                                                     colorPalette="red"
//                                                                                     variant="ghost"
//                                                                                     onClick={() => handleRemoveProperty(selectedProp.property_id)}
//                                                                                 >
//                                                                                     Remove
//                                                                                 </Button>
//                                                                             </HStack>
//                                                                             {property.values && property.values.length > 0 && (
//                                                                                 <Box>
//                                                                                     <Text fontSize="xs" mb={2} color="gray.600">Select values:</Text>
//                                                                                     <Wrap gap={2}>
//                                                                                         {property.values.map((value) => (
//                                                                                             <Badge
//                                                                                                 key={value}
//                                                                                                 colorPalette={selectedProp.selected_values.includes(value) ? "green" : "gray"}
//                                                                                                 cursor="pointer"
//                                                                                                 onClick={() => handlePropertyValueToggle(selectedProp.property_id, value)}
//                                                                                                 px={2}
//                                                                                                 py={1}
//                                                                                             >
//                                                                                                 {selectedProp.selected_values.includes(value) ? "✓ " : ""}{value}
//                                                                                             </Badge>
//                                                                                         ))}
//                                                                                     </Wrap>
//                                                                                 </Box>
//                                                                             )}
//                                                                         </Box>
//                                                                     )
//                                                                 })}
//                                                             </Stack>
//                                                         )}
                                                        
//                                                         <Text fontSize="xs" color="gray.600" mt={2}>
//                                                             {selectedPropertiesWithValues.length} properties selected
//                                                         </Text>
//                                                     </Box>
//                                                     <Group gap={2}>
//                                                         <Button
//                                                             colorPalette="green"
//                                                             size="sm"
//                                                             onClick={() => handleUpdateField(product.id, 'properties')}
//                                                             loading={isUpdating}
//                                                         >
//                                                             Save
//                                                         </Button>
//                                                         <Button
//                                                             variant="outline"
//                                                             size="sm"
//                                                             onClick={handleCancel}
//                                                             disabled={isUpdating}
//                                                         >
//                                                             Cancel
//                                                         </Button>
//                                                     </Group>
//                                                 </Box>
//                                             ) : (
//                                                 <Box>
//                                                     <Box p={2} bg="gray.50" borderRadius="md" mb={2}>
//                                                         {product.properties && product.properties.length > 0 ? (
//                                                             <Stack gap={3}>
//                                                                 {product.properties.map((prop) => (
//                                                                     <Box key={prop.id} borderWidth="1px" p={3} borderRadius="md" bg="white">
//                                                                         <Text fontWeight="bold" fontSize="sm" mb={2}>
//                                                                             {prop.name}
//                                                                         </Text>
//                                                                         {prop.values && prop.values.length > 0 ? (
//                                                                             <Wrap gap={2}>
//                                                                                 {prop.values.map((value) => (
//                                                                                     <Badge key={value} colorPalette="green">
//                                                                                         {value}
//                                                                                     </Badge>
//                                                                                 ))}
//                                                                             </Wrap>
//                                                                         ) : (
//                                                                             <Text color="gray.400" fontSize="xs">No values defined</Text>
//                                                                         )}
//                                                                     </Box>
//                                                                 ))}
//                                                             </Stack>
//                                                         ) : (
//                                                             <Text color="gray.400" fontSize="sm">No properties</Text>
//                                                         )}
//                                                     </Box>
//                                                     <Button
//                                                         colorPalette="blue"
//                                                         size="sm"
//                                                         onClick={() => handleEdit(product.id, 'properties', product.properties)}
//                                                         disabled={editingField !== null}
//                                                     >
//                                                         Update Properties
//                                                     </Button>
//                                                 </Box>
//                                             )}
//                                         </Field.Root>
//                                     </Box>
                                    
//                                     <Text fontWeight="bold" color="gray.600" fontSize="sm" mt={4}>
//                                         Images
//                                     </Text>
//                                     {renderImageField(product)}
//                                 </Stack>
//                             </Box>
//                         ))}
//                     </Stack>
//                 )}
//             </Box>
//         </Box>
//     )
// }

// export default ProductUpdate
