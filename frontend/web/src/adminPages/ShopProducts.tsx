import {useEffect, useState, useRef} from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import useAccessToken from '../services/token'
import api from '../services/api'
import { 
    Box, 
    Text, 
    Stack,
    Input, 
    Textarea, 
    Button, 
    Spinner,
    Heading,
    Separator,
    Group,
    Image,
    Grid,
    HStack,
    Wrap,
} from '@chakra-ui/react'
import { Field } from '@chakra-ui/react/field'
import { toaster } from '../components/ui/toaster'

interface ProductImage {
    id: string
    image: string
    is_primary: boolean
    order: number
}

interface ProductProp {
    id: string
    name: string
    shop_id: string
    images: ProductImage[]
    description: string
    price: string
    category: string
}

const ShopProducts: React.FC = () => {
    const navigate = useNavigate()
    const user = useSelector((state: any) => state.auth.user)
    const { accessToken } = useAccessToken(user)
    const [products, setProducts] = useState<ProductProp[]>([])
    const [isLoading, setLoading] = useState<boolean>(false)
    
    // Track which field is being edited for which product
    const [editingField, setEditingField] = useState<{productId: string, fieldName: string} | null>(null)
    
    // Temporary values while editing
    const [tempValue, setTempValue] = useState<string>('')
    
    // Track updating state
    const [isUpdating, setIsUpdating] = useState<boolean>(false)
    
    // For image file upload
    const [imageFile, setImageFile] = useState<File | null>(null)
    const [imagePreview, setImagePreview] = useState<string>('')
    const fileInputRef = useRef<HTMLInputElement>(null)

    const fetchProductData = async () => {
        setLoading(true)
        if (!accessToken) {
            toaster.create({
                title: 'Authentication Error',
                description: 'Cannot get access token',
                type: 'error',
                duration: 3000,
            })
            return
        }

        try {
            const url = `${import.meta.env.VITE_API_BASE_URL}/shops/product-list-create/`
            const config = {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    "Content-Type": "application/json",
                },
            }
            const response = await api.get(url, config)
            const data = Array.isArray(response.data[0]) ? response.data[0] : response.data
            console.log("product data: ", data)
            console.log("first product images: ", data[0]?.images)
            setProducts(data)
        } catch (error: any) {
            console.error("fetching error", error.response?.data || error.message)
            toaster.create({
                title: 'Error',
                description: 'Failed to fetch product data',
                type: 'error',
                duration: 3000,
            })
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (accessToken && user) {
            fetchProductData()
        }
    }, [accessToken, user])
    
    // Start editing a field
    const handleEdit = (productId: string, fieldName: keyof ProductProp, currentValue: string) => {
        setEditingField({ productId, fieldName })
        setTempValue(currentValue)
    }

    // Cancel editing
    const handleCancel = () => {
        setEditingField(null)
        setTempValue('')
        setImageFile(null)
        setImagePreview('')
    }

    // Handle image file selection
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                toaster.create({
                    title: 'Invalid File',
                    description: 'Please select an image file',
                    type: 'error',
                    duration: 3000,
                })
                return
            }
            
            // Validate file size (e.g., max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                toaster.create({
                    title: 'File Too Large',
                    description: 'Please select an image smaller than 5MB',
                    type: 'error',
                    duration: 3000,
                })
                return
            }
            
            setImageFile(file)
            
            // Create preview
            const reader = new FileReader()
            reader.onloadend = () => {
                setImagePreview(reader.result as string)
            }
            reader.readAsDataURL(file)
        }
    }

    // Handle image deletion
    const handleDeleteImage = async (productId: string, imageId: string) => {
        if (!accessToken) {
            navigate("/")
            return
        }

        console.log("Deleting image:", { productId, imageId })

        if (!window.confirm('Are you sure you want to delete this image?')) {
            return
        }

        setIsUpdating(true)

        try {
            const url = `${import.meta.env.VITE_API_BASE_URL}/shops/product-image-editor/${imageId}/`
            console.log("Delete URL:", url)
            const config = {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            }

            await api.delete(url, config)

            // Update local state by removing the deleted image
            setProducts(products.map(product => 
                product.id === productId 
                    ? { ...product, images: product.images.filter(img => img.id !== imageId) }
                    : product
            ))

            toaster.create({
                title: 'Success',
                description: 'Image deleted successfully',
                type: 'success',
                duration: 3000,
            })
        } catch (error: any) {
            console.error("delete failed", error.response?.data || error.message)
            toaster.create({
                title: 'Delete Failed',
                description: error.response?.data?.message || 'Failed to delete image',
                type: 'error',
                duration: 3000,
            })
        } finally {
            setIsUpdating(false)
        }
    }

    // Handle setting primary image
    const handleSetPrimaryImage = async (productId: string, imageId: string) => {
        if (!accessToken) {
            navigate("/")
            return
        }

        setIsUpdating(true)

        try {
            const url = `${import.meta.env.VITE_API_BASE_URL}/shops/product-image-editor/${imageId}/`
            const config = {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    "Content-Type": "application/json",
                },
            }

            await api.patch(url, { is_primary: true }, config)

            // Update local state - set this image as primary and others as non-primary
            setProducts(products.map(product => 
                product.id === productId 
                    ? { 
                        ...product, 
                        images: product.images.map(img => ({
                            ...img,
                            is_primary: img.id === imageId
                        }))
                      }
                    : product
            ))

            toaster.create({
                title: 'Success',
                description: 'Primary image updated successfully',
                type: 'success',
                duration: 3000,
            })
        } catch (error: any) {
            console.error("update failed", error.response?.data || error.message)
            toaster.create({
                title: 'Update Failed',
                description: error.response?.data?.message || 'Failed to update primary image',
                type: 'error',
                duration: 3000,
            })
        } finally {
            setIsUpdating(false)
        }
    }

    // Handle product deletion
    const handleDeleteProduct = async (productId: string) => {
        if (!accessToken) {
            navigate("/")
            return
        }

        if (!window.confirm('Are you sure you want to delete this product? This will also delete all associated images.')) {
            return
        }

        setIsUpdating(true)

        try {
            const url = `${import.meta.env.VITE_API_BASE_URL}/shops/product-editor/${productId}/`
            const config = {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            }

            await api.delete(url, config)

            // Update local state by removing the deleted product
            setProducts(products.filter(product => product.id !== productId))

            toaster.create({
                title: 'Success',
                description: 'Product deleted successfully',
                type: 'success',
                duration: 3000,
            })
        } catch (error: any) {
            console.error("delete failed", error.response?.data || error.message)
            toaster.create({
                title: 'Delete Failed',
                description: error.response?.data?.message || 'Failed to delete product',
                type: 'error',
                duration: 3000,
            })
        } finally {
            setIsUpdating(false)
        }
    }

    // Update a single field
    const handleUpdateField = async (productId: string, fieldName: keyof ProductProp) => {
        if (!accessToken) {
            navigate("/")
            return
        }
        
        setIsUpdating(true)
        
        try {
            const url = `${import.meta.env.VITE_API_BASE_URL}/shops/product-editor/${productId}/`
            
            let config: any
            
            // Handle image upload differently
            if (fieldName === 'images' && imageFile) {
                // Use FormData for file upload
                const formData = new FormData()
                formData.append('image', imageFile)
                formData.append('product_id', productId)  // ✅ Use product_id (field name in serializer)
                formData.append('is_primary', 'false')
                formData.append('order', '0')
                
                console.log('Uploading image with product_id:', productId)
                
                // Upload to product-image-create endpoint
                const uploadUrl = `${import.meta.env.VITE_API_BASE_URL}/shops/product-image-create/`
                
                config = {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        "Content-Type": "multipart/form-data",
                    },
                }
                
                const response = await api.post(uploadUrl, formData, config)
                
                // Update local state with the new image from response
                setProducts(products.map(product => 
                    product.id === productId 
                        ? { ...product, images: [...product.images, response.data] }
                        : product
                ))
            } else {
                // Regular field update
                config = {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        "Content-Type": "application/json",
                    },
                }
                
                const updateData = {
                    [fieldName]: tempValue
                }
                
                await api.patch(url, updateData, config)
                
                // Update local state
                setProducts(products.map(product => 
                    product.id === productId 
                        ? { ...product, [fieldName]: tempValue }
                        : product
                ))
            }
            
            setEditingField(null)
            setTempValue('')
            setImageFile(null)
            setImagePreview('')
            
            toaster.create({
                title: 'Success',
                description: `${fieldName} updated successfully`,
                type: 'success',
                duration: 3000,
            })
        } catch (error: any) {
            console.error("update is not successful", error.response?.data || error.message)
            toaster.create({
                title: 'Update Failed',
                description: error.response?.data?.message || 'Failed to update field',
                type: 'error',
                duration: 3000,
            })
        } finally {
            setIsUpdating(false)
        }
    }

    // Render a single field with edit functionality
    const renderField = (
        product: ProductProp, 
        fieldName: keyof ProductProp, 
        label: string, 
        isTextarea: boolean = false
    ) => {
        const isEditing = editingField?.productId === product.id && editingField?.fieldName === fieldName
        const currentValue = isEditing ? tempValue : String(product[fieldName] || '')
        const isFieldDisabled = editingField !== null && !isEditing

        return (
            <Box key={fieldName}>
                <Field.Root>
                    <Field.Label fontWeight="semibold" color="gray.700" fontSize="sm">
                        {label}
                    </Field.Label>
                    <Group gap={3} align="flex-start" width="full">
                        <Box flex="1">
                            {isEditing ? (
                                isTextarea ? (
                                    <Textarea
                                        value={currentValue}
                                        onChange={(e) => setTempValue(e.target.value)}
                                        size="sm"
                                        rows={4}
                                    />
                                ) : (
                                    <Input
                                        value={currentValue}
                                        onChange={(e) => setTempValue(e.target.value)}
                                        size="sm"
                                    />
                                )
                            ) : (
                                <Text
                                    p={2}
                                    bg="gray.50"
                                    borderRadius="md"
                                    minH="32px"
                                    display="flex"
                                    alignItems="center"
                                    fontSize="sm"
                                    color={currentValue ? "gray.800" : "gray.400"}
                                >
                                    {currentValue || 'Not set'}
                                </Text>
                            )}
                        </Box>
                        
                        <Group gap={2}>
                            {isEditing ? (
                                <>
                                    <Button
                                        colorPalette="green"
                                        size="sm"
                                        onClick={() => handleUpdateField(product.id, fieldName)}
                                        loading={isUpdating}
                                    >
                                        Save
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleCancel}
                                        disabled={isUpdating}
                                    >
                                        Cancel
                                    </Button>
                                </>
                            ) : (
                                <Button
                                    colorPalette="blue"
                                    size="sm"
                                    onClick={() => handleEdit(product.id, fieldName, String(product[fieldName] || ''))}
                                    disabled={isFieldDisabled}
                                >
                                    Update
                                </Button>
                            )}
                        </Group>
                    </Group>
                </Field.Root>
            </Box>
        )
    }

    // Render images field with multiple image management
    const renderImageField = (product: ProductProp) => {
        const isEditing = editingField?.productId === product.id && editingField?.fieldName === 'images'
        const isFieldDisabled = editingField !== null && !isEditing

        return (
            <Box>
                <Field.Root>
                    <Field.Label fontWeight="semibold" color="gray.700" fontSize="sm">
                        Product Images
                    </Field.Label>
                    
                    {/* Display all existing images */}
                    {product.images && product.images.length > 0 && (
                        <Box mb={4}>
                            <Text fontSize="sm" mb={2}>
                                Current Images ({product.images.length})
                            </Text>
                            <Wrap justify={"center"}>
                                {product.images
                                    .sort((a, b) => a.order - b.order)
                                    .map((img) => {
                                        // console.log("Image object:", img)
                                        return (
                                        <Box
                                            key={img.id}
                                            position="relative"
                                            borderWidth="1px"
                                            rounded="md"
                                            p={2}
                                            
                                            
                                        >
                                            <Image
                                                src={img.image}
                                                alt={`Product image ${img.order}`}
                                                height="150px"
                                                width="180px"
                                                fit={"fill"}
                                                rounded="md"
                                            />
                                            
                                            {/* Primary badge */}
                                            {img.is_primary && (
                                                <Box
                                                    position="absolute"
                                                    top={3}
                                                    left={3}
                                                    bg="blue.500"
                                                    color="white"
                                                    px={2}
                                                    py={1}
                                                    fontSize="xs"
                                                    borderRadius="md"
                                                    fontWeight="bold"
                                                >
                                                    Primary
                                                </Box>
                                            )}
                                            
                                            {/* Action buttons */}
                                            <Group gap={"10px"} mt={2} grow>
                                                <HStack justifyContent={"space-evenly"}>
                                                    <Button
                                                        size="xs"
                                                        colorPalette="red"
                                                        variant="outline"
                                                        onClick={() => handleDeleteImage(product.id, img.id)}
                                                        disabled={isFieldDisabled}
                                                    >
                                                        Remove
                                                    </Button>
                                                    {!img.is_primary && (
                                                        <Button
                                                            size="xs"
                                                            colorPalette="blue"
                                                            variant="outline"
                                                            onClick={() => handleSetPrimaryImage(product.id, img.id)}
                                                            disabled={isFieldDisabled}
                                                        >
                                                            Set Primary
                                                        </Button>
                                                    )}
                                                </HStack>
                                            </Group>
                                        </Box>
                                    )
                                    })}
                            </Wrap>
                        </Box>
                    )}
                    
                    {/* Add new image section */}
                    <Box>
                        <Text fontSize="sm" fontWeight="semibold" mb={2}>
                            Add New Image
                        </Text>
                        <Group gap={3} align="flex-start" width="full">
                            <Box flex="1">
                                {isEditing ? (
                                    <Stack gap={3}>
                                        <Input
                                            type="file"
                                            accept="image/*"
                                            ref={fileInputRef}
                                            onChange={handleImageChange}
                                            size="sm"
                                        />
                                        {imagePreview && (
                                            <Box 
                                                borderWidth="1px" 
                                                borderRadius="md" 
                                                p={2}
                                                bg="gray.50"
                                            >
                                                <Image
                                                    src={imagePreview}
                                                    alt="New image preview"
                                                    maxH="150px"
                                                    fit={"fill"}
                                                />
                                            </Box>
                                        )}
                                    </Stack>
                                ) : (
                                    <Text
                                        p={2}
                                        bg="gray.50"
                                        borderRadius="md"
                                        minH="32px"
                                        display="flex"
                                        alignItems="center"
                                        fontSize="sm"
                                        color="gray.400"
                                    >
                                        Click "Add Image" to upload a new image
                                    </Text>
                                )}
                            </Box>
                            
                            <Group gap={2}>
                                {isEditing ? (
                                    <>
                                        <Button
                                            colorPalette="green"
                                            size="sm"
                                            onClick={() => handleUpdateField(product.id, 'images')}
                                            loading={isUpdating}
                                            disabled={!imageFile}
                                        >
                                            Upload
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={handleCancel}
                                            disabled={isUpdating}
                                        >
                                            Cancel
                                        </Button>
                                    </>
                                ) : (
                                    <Button
                                        colorPalette="blue"
                                        size="sm"
                                        onClick={() => {
                                            setEditingField({ productId: product.id, fieldName: 'images' })
                                        }}
                                        disabled={isFieldDisabled}
                                    >
                                        Add Image
                                    </Button>
                                )}
                            </Group>
                        </Group>
                    </Box>
                </Field.Root>
            </Box>
        )
    }

    if (isLoading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minH="400px">
                <Spinner size="xl" color="blue.500" />
            </Box>
        )
    }

    return (
        <Box p={6} maxW="1200px" mx="auto">
            <Heading size="lg" mb={6}>
                Products
            </Heading>
            <Box mt={"20px"}>
                {products && products.length === 0 ? (
                    <Box textAlign="center" py={10}>
                        <Text color="gray.500">No products found</Text>
                    </Box>
                ) : (
                    <Stack gap={8}>
                        {products.map((product: ProductProp) => (
                            <Box 
                                key={product.id} 
                                bg="white" 
                                p={6} 
                                borderRadius="lg" 
                                shadow="md"
                                borderWidth="1px"
                                borderColor="gray.200"
                            >
                                <HStack justifyContent="space-between" mb={4}>
                                    <Heading size="md" color="blue.600">
                                        {product.name || 'Unnamed Product'}
                                    </Heading>
                                    <Button
                                        size="sm"
                                        colorPalette="red"
                                        variant="outline"
                                        onClick={() => handleDeleteProduct(product.id)}
                                        loading={isUpdating}
                                    >
                                        Delete Product
                                    </Button>
                                </HStack>
                                
                                <Stack gap={4}>
                                    {/* Basic Information */}
                                    <Text fontWeight="bold" color="gray.600" fontSize="sm" mt={2}>
                                        Basic Information
                                    </Text>
                                    {renderField(product, 'name', 'Product Name')}
                                    <Separator />
                                    {renderField(product, 'price', 'Price')}
                                    <Separator />
                                    {renderField(product, 'category', 'Category')}
                                    <Separator />
                                    {renderField(product, 'description', 'Description', true)}
                                    
                                    {/* Images */}
                                    <Text fontWeight="bold" color="gray.600" fontSize="sm" mt={4}>
                                        Images
                                    </Text>
                                    {renderImageField(product)}
                                </Stack>
                            </Box>
                        ))}
                    </Stack>
                )}
            </Box>
        </Box>
    )
}

export default ShopProducts