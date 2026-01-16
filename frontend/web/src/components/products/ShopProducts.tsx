import {useEffect, useState, useRef} from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import useAccessToken from '../../services/token'
import api from '../../services/api'
import { Box, Text, Stack, Input, Textarea, Button, Spinner, Heading, Separator,
    Group, Image, HStack, Wrap } from '@chakra-ui/react'
import { Field } from '@chakra-ui/react/field'
import { toaster } from '../ui/toaster'
import formatDate from '@/components/formatDate'

interface ProductImage {
    id: string
    image: string
    is_primary: boolean
    order: number
}

interface ProductProp {
    id: string
    name: string;
    shop_id: string;
    description: string;
    price: number;
    new_price: number;
    discount_end_at: string;
    currency_unit: string;
    condition: string;
    color: string;
    dimension: string;
    weight: string;
    other: string;
    category: string;
    images: ProductImage[]
}

// ✅ Add helper functions for datetime conversion
const convertUTCToLocal = (utcDatetime: string): string => {
    if (!utcDatetime) return '';
    try {
        const date = new Date(utcDatetime);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${year}-${month}-${day}T${hours}:${minutes}`;
    } catch (error) {
        console.error('Error converting UTC to local:', error);
        return '';
    }
};

const convertLocalToUTC = (localDatetime: string): string => {
    if (!localDatetime) return '';
    try {
        return new Date(localDatetime).toISOString();
    } catch (error) {
        console.error('Error converting local to UTC:', error);
        return '';
    }
};

const ShopProducts: React.FC = () => {
    const navigate = useNavigate()
    const user = useSelector((state: any) => state.auth.user)
    const { accessToken } = useAccessToken(user)
    const [products, setProducts] = useState<ProductProp[]>([])
    const [isLoading, setLoading] = useState<boolean>(false)
    
    const [editingField, setEditingField] = useState<{productId: string, fieldName: string} | null>(null)
    const [tempValue, setTempValue] = useState<string>('')
    const [isUpdating, setIsUpdating] = useState<boolean>(false)
    
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
    
    // ✅ Updated handleEdit to convert datetime to local
    const handleEdit = (productId: string, fieldName: keyof ProductProp, currentValue: string, isDatetime: boolean = false) => {
        setEditingField({ productId, fieldName })
        // Convert UTC to local if it's a datetime field
        setTempValue(isDatetime ? convertUTCToLocal(currentValue) : currentValue)
    }

    const handleCancel = () => {
        setEditingField(null)
        setTempValue('')
        setImageFile(null)
        setImagePreview('')
    }

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            if (!file.type.startsWith('image/')) {
                toaster.create({
                    title: 'Invalid File',
                    description: 'Please select an image file',
                    type: 'error',
                    duration: 3000,
                })
                return
            }
            
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
            
            const reader = new FileReader()
            reader.onloadend = () => {
                setImagePreview(reader.result as string)
            }
            reader.readAsDataURL(file)
        }
    }

    const handleDeleteImage = async (productId: string, imageId: string) => {
        if (!accessToken) {
            navigate("/")
            return
        }

        if (!window.confirm('Are you sure you want to delete this image?')) {
            return
        }

        setIsUpdating(true)
        try {
            const url = `${import.meta.env.VITE_API_BASE_URL}/shops/product-image-editor/${imageId}/`
            const config = {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            }
            await api.delete(url, config)
            
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

    // ✅ Updated handleUpdateField to convert datetime to UTC
    const handleUpdateField = async (productId: string, fieldName: keyof ProductProp, isDatetime: boolean = false) => {
        if (!accessToken) {
            navigate("/")
            return
        }
        
        setIsUpdating(true)
        
        try {
            const url = `${import.meta.env.VITE_API_BASE_URL}/shops/product-editor/${productId}/`
            
            let config: any
            
            if (fieldName === 'images' && imageFile) {
                const formData = new FormData()
                formData.append('image', imageFile)
                formData.append('product_id', productId)
                formData.append('is_primary', 'false')
                formData.append('order', '0')
                
                const uploadUrl = `${import.meta.env.VITE_API_BASE_URL}/shops/product-image-create/`
                
                config = {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        "Content-Type": "multipart/form-data",
                    },
                }
                
                const response = await api.post(uploadUrl, formData, config)
                
                setProducts(products.map(product => 
                    product.id === productId 
                        ? { ...product, images: [...product.images, response.data] }
                        : product
                ))
            } else {
                config = {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        "Content-Type": "application/json",
                    },
                }
                
                // ✅ Convert local datetime to UTC before sending
                const valueToSend = isDatetime ? convertLocalToUTC(tempValue) : tempValue;
                
                const updateData = {
                    [fieldName]: valueToSend
                }
                
                await api.patch(url, updateData, config)
                
                // ✅ Update local state with UTC value
                setProducts(products.map(product => 
                    product.id === productId 
                        ? { ...product, [fieldName]: valueToSend }
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

    // ✅ Fixed renderField function
    const renderField = (
        product: ProductProp, 
        fieldName: keyof ProductProp, 
        label: string, 
        isTextarea: boolean = false,
        isDatetime: boolean = false,
        isSelection: boolean = false
    ) => {
        const isEditing = editingField?.productId === product.id && editingField?.fieldName === fieldName;
        
        // Get the raw value from product
        const rawValue = String(product[fieldName] || '');
        
        // For editing: use tempValue (already in local format from handleEdit)
        // For display: show formatted datetime or raw value
        const displayValue = isDatetime && rawValue
            ? formatDate(rawValue)  // Format UTC to human-readable local time
            : rawValue || 'Not set';
        
        const isFieldDisabled = editingField !== null && !isEditing;
        
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
                                        value={tempValue}
                                        onChange={(e) => setTempValue(e.target.value)}
                                        size="sm"
                                        rows={4}
                                    />
                                ) : isDatetime ? (
                                    <Input
                                        type='datetime-local'
                                        value={tempValue} // ✅ tempValue is already in local format
                                        onChange={(e) => setTempValue(e.target.value)}
                                        size="sm"
                                    />
                                ) : isSelection ? (
                                    <select
                                        value={tempValue}
                                        onChange={(e) => setTempValue(e.target.value)}
                                        style={{border:"1px solid", padding:"10px", borderRadius:"5px"}}
                                    >
                                        <option value="">Choose one</option>
                                        <option value="NEW">NEW</option>
                                        <option value="USED - LIKE NEW">USED - LIKE NEW</option>
                                        <option value="USED - GOOD">USED - GOOD</option>
                                        <option value="NOT WORKING">NOT WORKING</option>
                                        <option value="BROKEN">BROKEN</option>
                                    </select>
                                ):(
                                    <Input
                                        value={tempValue}
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
                                    color={rawValue ? "gray.800" : "gray.400"}
                                >
                                    {displayValue} {/* ✅ Show formatted value */}
                                </Text>
                            )}
                        </Box>
                        
                        <Group gap={2}>
                            {isEditing ? (
                                <>
                                    <Button
                                        colorPalette="green"
                                        size="sm"
                                        onClick={() => handleUpdateField(product.id, fieldName, isDatetime)}
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
                                    onClick={() => handleEdit(product.id, fieldName, rawValue, isDatetime)}
                                    disabled={isFieldDisabled}
                                >
                                    Update
                                </Button>
                            )}
                        </Group>
                    </Group>
                </Field.Root>
            </Box>
        );
    };

    const renderImageField = (product: ProductProp) => {
        const isEditing = editingField?.productId === product.id && editingField?.fieldName === 'images'
        const isFieldDisabled = editingField !== null && !isEditing

        return (
            <Box>
                <Field.Root>
                    <Field.Label fontWeight="semibold" color="gray.700" fontSize="sm">
                        Product Images
                    </Field.Label>
                    
                    {product.images && product.images.length > 0 && (
                        <Box mb={4}>
                            <Text fontSize="sm" mb={2}>
                                Current Images ({product.images.length})
                            </Text>
                            <Wrap justify="center">
                                {product.images
                                    .sort((a, b) => a.order - b.order)
                                    .map((img) => (
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
                                                fit="fill"
                                                rounded="md"
                                            />
                                            
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
                                            
                                            <Group gap="10px" mt={2} grow>
                                                <HStack justifyContent="space-evenly">
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
                                    ))}
                            </Wrap>
                        </Box>
                    )}
                    
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
                                                    fit="fill"
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
            <Button>
                <Link to="/management/shop-product/add-product">Add A New Product</Link>
            </Button>
            <Heading size="lg" mb={6}>
                Products
            </Heading>
            <Box mt="20px">
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
                                    <Text fontWeight="bold" color="gray.600" fontSize="sm" mt={2}>
                                        Basic Information
                                    </Text>
                                    {renderField(product, 'name', 'Product Name')}
                                    <Separator />
                                    {renderField(product, 'price', 'Price')}
                                    <Separator />
                                    {renderField(product, 'new_price', 'Sale Price')}
                                    <Separator />
                                    {renderField(product, 'discount_end_at', 'Discount End Date', false, true)}
                                    <Separator />
                                    {renderField(product, 'currency_unit', 'Currency Unit')}
                                    <Separator />
                                    {renderField(product, 'condition', 'Condition', false, false, true)}
                                    <Separator />
                                    {renderField(product, 'color', 'Color')}
                                    <Separator />
                                    {renderField(product, 'dimension', 'Dimension')}
                                    <Separator />
                                    {renderField(product, 'weight', 'Weight')}
                                    <Separator />
                                    {renderField(product, 'other', 'Other')}
                                    <Separator />
                                    {renderField(product, 'category', 'Category')}
                                    <Separator />
                                    {renderField(product, 'description', 'Description', true)}
                                    
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