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

// interface ProductImage {
//     id: string
//     image: string
//     is_primary: boolean
//     order: number
// }
// interface ImagePreview {
//     file: File
//     preview: string
//     isPrimary: boolean
// }
// interface ProductProp {
//     id: string
//     name: string;
//     shop_id: string;
//     description: string;
//     price: number;
//     new_price: number;
//     discount_end_at: string;
//     currency_unit: string;
//     condition: string;
//     color: string;
//     dimension: string;
//     weight: string;
//     other: string;
//     category: string;
//     images: ProductImage[]
// }

// // ✅ Add helper functions for datetime conversion
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
    
//     const [imageFile, setImageFile] = useState<File | null>(null)
//     const [imagePreview, setImagePreview] = useState<ImagePreview[]>([])
//     const fileInputRef = useRef<HTMLInputElement>(null)

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
//         }
//     }, [accessToken, user])
    
//     // ✅ Updated handleEdit to convert datetime to local
//     const handleEdit = (productId: string, fieldName: keyof ProductProp, currentValue: string, isDatetime: boolean = false) => {
//         setEditingField({ productId, fieldName })
//         // Convert UTC to local if it's a datetime field
//         setTempValue(isDatetime ? convertUTCToLocal(currentValue) : currentValue)
//     }

//     const handleCancel = () => {
//         setEditingField(null)
//         setTempValue('')
//         setImageFile(null)
//         setImagePreview('')
//     }

//     const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//         const file = e.target.files?.[0]
//         if (file) {
//             if (!file.type.startsWith('image/')) {
//                 toaster.create({
//                     title: 'Invalid File',
//                     description: 'Please select an image file',
//                     type: 'error',
//                     duration: 3000,
//                 })
//                 return
//             }
            
//             if (file.size > 5 * 1024 * 1024) {
//                 toaster.create({
//                     title: 'File Too Large',
//                     description: 'Please select an image smaller than 5MB',
//                     type: 'error',
//                     duration: 3000,
//                 })
//                 return
//             }
            
//             setImageFile(file)
            
//             const reader = new FileReader()
//             reader.onloadend = () => {
//                 setImagePreview(reader.result as string)
//             }
//             reader.readAsDataURL(file)
//         }
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

//     // const handleDeleteProduct = async (productId: string) => {
//     //     if (!accessToken) {
//     //         navigate("/")
//     //         return
//     //     }
//     //     if (!window.confirm('Are you sure you want to delete this product? This will also delete all associated images.')) {
//     //         return
//     //     }
//     //     setIsUpdating(true)
//     //     try {
//     //         const url = `${import.meta.env.VITE_API_BASE_URL}/shops/product-editor/${productId}/`
//     //         const config = {
//     //             headers: {
//     //                 Authorization: `Bearer ${accessToken}`,
//     //             },
//     //         }
//     //         await api.delete(url, config)
            
//     //         setProducts(products.filter(product => product.id !== productId))
            
//     //         toaster.create({
//     //             title: 'Success',
//     //             description: 'Product deleted successfully',
//     //             type: 'success',
//     //             duration: 3000,
//     //         })
//     //     } catch (error: any) {
//     //         console.error("delete failed", error.response?.data || error.message)
//     //         toaster.create({
//     //             title: 'Delete Failed',
//     //             description: error.response?.data?.message || 'Failed to delete product',
//     //             type: 'error',
//     //             duration: 3000,
//     //         })
//     //     } finally {
//     //         setIsUpdating(false)
//     //     }
//     // }

//     // ✅ Updated handleUpdateField to convert datetime to UTC
//     const handleUpdateField = async (productId: string, fieldName: keyof ProductProp, isDatetime: boolean = false) => {
//         if (!accessToken) {
//             navigate("/")
//             return
//         }
        
//         setIsUpdating(true)
        
//         try {
//             const url = `${import.meta.env.VITE_API_BASE_URL}/shops/product-editor/${productId}/`
            
//             let config: any
            
//             if (fieldName === 'images' && imageFile) {
//                 const formData = new FormData()
//                 formData.append('image', imageFile)
//                 formData.append('product_id', productId)
//                 formData.append('is_primary', 'false')
//                 formData.append('order', '0')
                
//                 const uploadUrl = `${import.meta.env.VITE_API_BASE_URL}/shops/product-image-create/`
                
//                 config = {
//                     headers: {
//                         Authorization: `Bearer ${accessToken}`,
//                         "Content-Type": "multipart/form-data",
//                     },
//                 }
                
//                 const response = await api.post(uploadUrl, formData, config)
                
//                 setProducts(products.map(product => 
//                     product.id === productId 
//                         ? { ...product, images: [...product.images, response.data] }
//                         : product
//                 ))
//             } else {
//                 config = {
//                     headers: {
//                         Authorization: `Bearer ${accessToken}`,
//                         "Content-Type": "application/json",
//                     },
//                 }
                
//                 // ✅ Convert local datetime to UTC before sending
//                 const valueToSend = isDatetime ? convertLocalToUTC(tempValue) : tempValue;
                
//                 const updateData = {
//                     [fieldName]: valueToSend
//                 }
                
//                 await api.patch(url, updateData, config)
                
//                 // ✅ Update local state with UTC value
//                 setProducts(products.map(product => 
//                     product.id === productId 
//                         ? { ...product, [fieldName]: valueToSend }
//                         : product
//                 ))
//             }
            
//             setEditingField(null)
//             setTempValue('')
//             setImageFile(null)
//             setImagePreview('')
            
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

//     // ✅ Fixed renderField function
//     const renderField = (
//         product: ProductProp, 
//         fieldName: keyof ProductProp, 
//         label: string, 
//         isTextarea: boolean = false,
//         isDatetime: boolean = false,
//         isSelection: boolean = false
//     ) => {
//         const isEditing = editingField?.productId === product.id && editingField?.fieldName === fieldName;
        
//         // Get the raw value from product
//         const rawValue = String(product[fieldName] || '');
        
//         // For editing: use tempValue (already in local format from handleEdit)
//         // For display: show formatted datetime or raw value
//         const displayValue = isDatetime && rawValue
//             ? formatDate(rawValue)  // Format UTC to human-readable local time
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
//                                         value={tempValue} // ✅ tempValue is already in local format
//                                         onChange={(e) => setTempValue(e.target.value)}
//                                         size="sm"
//                                     />
//                                 ) : isSelection ? (
//                                     <select
//                                         value={tempValue}
//                                         onChange={(e) => setTempValue(e.target.value)}
//                                         style={{border:"1px solid", padding:"10px", borderRadius:"5px"}}
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
//                                     {displayValue} {/* ✅ Show formatted value */}
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
//                             <Wrap justify="center">
//                                 {product.images
//                                     .sort((a, b) => a.order - b.order)
//                                     .map((img) => (
//                                         <Box
//                                             key={img.id}
//                                             position="relative"
//                                             borderWidth="1px"
//                                             rounded="md"
//                                             p={2}
//                                         >
//                                             <Image
//                                                 src={img.image}
//                                                 alt={`Product image ${img.order}`}
//                                                 height="150px"
//                                                 width="180px"
//                                                 fit="fill"
//                                                 rounded="md"
//                                             />
                                            
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
                                            
//                                             <Group gap="10px" mt={2} grow>
//                                                 <HStack justifyContent="space-evenly">
//                                                     <Button
//                                                         size="xs"
//                                                         colorPalette="red"
//                                                         variant="outline"
//                                                         onClick={() => handleDeleteImage(product.id, img.id)}
//                                                         disabled={isFieldDisabled}
//                                                     >
//                                                         Remove
//                                                     </Button>
//                                                     {!img.is_primary && (
//                                                         <Button
//                                                             size="xs"
//                                                             colorPalette="blue"
//                                                             variant="outline"
//                                                             onClick={() => handleSetPrimaryImage(product.id, img.id)}
//                                                             disabled={isFieldDisabled}
//                                                         >
//                                                             Set Primary
//                                                         </Button>
//                                                     )}
//                                                 </HStack>
//                                             </Group>
//                                         </Box>
//                                     ))}
//                             </Wrap>
//                         </Box>
//                     )}
                    
//                     <Box>
//                         <Text fontSize="sm" fontWeight="semibold" mb={2}>
//                             Add New Image
//                         </Text>
//                         <Group gap={3} align="flex-start" width="full">
//                             <Box flex="1">
//                                 {isEditing ? (
//                                     <Stack gap={3}>
//                                         {/* <Input
//                                             type="file"
//                                             accept="image/*"
//                                             ref={fileInputRef}
//                                             onChange={handleImageChange}
//                                             size="sm"
//                                         /> */}
//                                         <Box>
//                                             <Input
//                                                 type="file"
//                                                 accept="image/*"
//                                                 multiple
//                                                 ref={fileInputRef}
//                                                 onChange={handleImageChange}
//                                                 size="lg"
//                                             />
//                                         </Box>
//                                         {/* {imagePreview && (
//                                             <Box 
//                                                 borderWidth="1px" 
//                                                 borderRadius="md" 
//                                                 p={2}
//                                                 bg="gray.50"
//                                             >
//                                                 <Image
//                                                     src={imagePreview}
//                                                     alt="New image preview"
//                                                     maxH="150px"
//                                                     fit="fill"
//                                                 />
//                                             </Box>
//                                         )} */}
//                                         {imagePreview.map((img, index) => (
//                                         <Box
//                                             key={index}
//                                             position="relative"
//                                             borderRadius="md"
//                                             overflow="hidden"
//                                             borderWidth="2px"
//                                             borderColor={img.isPrimary ? "blue.500" : "gray.200"}
//                                         >
//                                             {/* Primary Badge */}
//                                             {img.isPrimary && (
//                                                 <Badge
//                                                     position="absolute"
//                                                     top={2}
//                                                     left={2}
//                                                     colorPalette="blue"
//                                                     zIndex={2}
//                                                 >
//                                                     Primary
//                                                 </Badge>
//                                             )}

//                                             {/* Image */}
//                                             <Image
//                                                 src={img.preview}
//                                                 alt={`Product ${index + 1}`}
//                                                 w="full"
//                                                 h="150px"
//                                                 objectFit="cover"
//                                             />

//                                             {/* Action Buttons */}
//                                             <Box
//                                                 position="absolute"
//                                                 top={2}
//                                                 right={2}
//                                                 display="flex"
//                                                 gap={1}
//                                             >
//                                                 {/* Set as Primary Button */}
//                                                 {!img.isPrimary && (
//                                                     <IconButton
//                                                         aria-label="Set as primary"
//                                                         size="sm"
//                                                         colorPalette="blue"
//                                                         onClick={() => handleSetPrimary(index)}
//                                                         title="Set as primary image"
//                                                     >
//                                                         <Star size={16} />
//                                                     </IconButton>
//                                                 )}

//                                                 {/* Remove Button */}
//                                                 <IconButton
//                                                     aria-label="Remove image"
//                                                     size="sm"
//                                                     colorPalette="red"
//                                                     onClick={() => handleRemoveImage(index)}
//                                                 >
//                                                     <X size={16} />
//                                                 </IconButton>
//                                             </Box>

//                                             {/* Image Number */}
//                                             <Box
//                                                 position="absolute"
//                                                 bottom={2}
//                                                 left={2}
//                                                 bg="blackAlpha.700"
//                                                 color="white"
//                                                 px={2}
//                                                 py={1}
//                                                 borderRadius="md"
//                                                 fontSize="xs"
//                                             >
//                                                 {index + 1}
//                                             </Box>
//                                         </Box>
//                                     ))}
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
//                                         Click "Add Image" to upload a new image
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
//                                             disabled={!imageFile}
//                                         >
//                                             Upload
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
//                                         Add Image
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
//                 Products
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
//                                 {/* <HStack justifyContent="space-between" mb={4}>
//                                     <Heading size="md" color="blue.600">
//                                         {product.name || 'Unnamed Product'}
//                                     </Heading>
//                                     <Button
//                                         size="sm"
//                                         colorPalette="red"
//                                         variant="outline"
//                                         onClick={() => handleDeleteProduct(product.id)}
//                                         loading={isUpdating}
//                                     >
//                                         Delete Product
//                                     </Button>
//                                 </HStack> */}
                                
//                                 <Stack gap={4}>
//                                     <Text fontWeight="bold" color="gray.600" fontSize="sm" mt={2}>
//                                         Basic Information
//                                     </Text>
//                                     {renderField(product, 'name', 'Product Name')}
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
//                                     {renderField(product, 'color', 'Color')}
//                                     <Separator />
//                                     {renderField(product, 'dimension', 'Dimension')}
//                                     <Separator />
//                                     {renderField(product, 'weight', 'Weight')}
//                                     <Separator />
//                                     {renderField(product, 'other', 'Other')}
//                                     <Separator />
//                                     {renderField(product, 'category', 'Category')}
//                                     <Separator />
//                                     {renderField(product, 'description', 'Description', true)}
                                    
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

import {useEffect, useState, useRef} from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useSelector } from 'react-redux'
import useAccessToken from '../../services/token'
import api from '../../services/api'
import { Box, Text, Stack, Input, Textarea, Button, Spinner, Heading, Separator,
    Group, Image, HStack, Wrap, Badge, 
    IconButton} from '@chakra-ui/react'
import { Field } from '@chakra-ui/react/field'
import { toaster } from '../ui/toaster'
import formatDate from '@/components/formatDate'
import { X } from 'lucide-react'

interface ProductImage {
    id: string
    media: string
    is_primary: boolean
    order: number
}

interface ImagePreview {
    file: File
    preview: string
    isPrimary: boolean
}

interface Property {
    id: string
    name: string
    values: string[]
    description: string
    created_at: string
}

interface Category {
    id: string
    name: string
    description: string
}

interface ProductProp {
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
    properties: Property[];  // Array of full property objects with values
    delivery_term: string;
    refund_policy: string;
    refund: boolean;
    images: ProductImage[]
}

// ✅ Helper functions for datetime conversion
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

const ProductUpdate: React.FC = () => {
    const navigate = useNavigate()
    const { productId } = useParams()
    const user = useSelector((state: any) => state.auth.user)
    const { accessToken } = useAccessToken(user)
    const [products, setProducts] = useState<ProductProp[]>([])
    const [isLoading, setLoading] = useState<boolean>(false)
    
    const [editingField, setEditingField] = useState<{productId: string, fieldName: string} | null>(null)
    const [tempValue, setTempValue] = useState<string>('')
    const [isUpdating, setIsUpdating] = useState<boolean>(false)
    
    const [imagePreviews, setImagePreviews] = useState<ImagePreview[]>([])
    const fileInputRef = useRef<HTMLInputElement>(null)
    
    // Categories and Properties state
    const [categories, setCategories] = useState<Category[]>([])
    const [allProperties, setAllProperties] = useState<Property[]>([])
    const [selectedCategories, setSelectedCategories] = useState<string[]>([])
    const [selectedPropertiesWithValues, setSelectedPropertiesWithValues] = useState<{
        property_id: string;
        selected_values: string[];
    }[]>([])

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
            const filter = data.filter((p: ProductProp) => p.id === productId)
            console.log('Product data:', filter)
            console.log('Product categories:', filter[0]?.category)
            setProducts(filter)
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
            fetchCategories()
            fetchProperties()
        }
    }, [accessToken, user])
    
    const fetchCategories = async () => {
        try {
            const config = accessToken ? {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            } : {}
            const response = await api.get(`${import.meta.env.VITE_API_BASE_URL}/shops/category-list/`, config)
            console.log('Categories fetched:', response.data)
            setCategories(response.data || [])
        } catch (error: any) {
            console.error("Failed to fetch categories:", error)
        }
    }

    const fetchProperties = async () => {
        try {
            const config = accessToken ? {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            } : {}
            const response = await api.get(`${import.meta.env.VITE_API_BASE_URL}/shops/properties-list/`, config)
            console.log('Properties fetched:', response.data)
            setAllProperties(response.data || [])
        } catch (error: any) {
            console.error("Failed to fetch properties:", error)
        }
    }
    
    const handleEdit = (productId: string, fieldName: keyof ProductProp, currentValue: any, isDatetime: boolean = false) => {
        setEditingField({ productId, fieldName })
        
        // Handle different field types
        if (fieldName === 'category') {
            setSelectedCategories(Array.isArray(currentValue) ? currentValue : [])
        } else if (fieldName === 'properties') {
            // Initialize with all properties and all their values selected
            const propsWithValues = Array.isArray(currentValue) 
                ? currentValue.map((p: Property) => ({
                    property_id: p.id,
                    selected_values: p.values || [] // Start with all values selected
                  }))
                : []
            setSelectedPropertiesWithValues(propsWithValues)
        } else {
            setTempValue(isDatetime ? convertUTCToLocal(currentValue) : currentValue)
        }
    }

    const handleCancel = () => {
        setEditingField(null)
        setTempValue('')
        setSelectedCategories([])
        setSelectedPropertiesWithValues([])
        setImagePreviews([])
        if (fileInputRef.current) {
            fileInputRef.current.value = ''
        }
    }
    
    // Handle category selection
    const handleCategoryToggle = (categoryId: string) => {
        setSelectedCategories(prev => {
            if (prev.includes(categoryId)) {
                return prev.filter(id => id !== categoryId)
            } else {
                return [...prev, categoryId]
            }
        })
    }
    
    // Add a property (with all values selected by default)
    const handleAddProperty = (propertyId: string) => {
        const property = allProperties.find(p => p.id === propertyId)
        if (!property) return
        
        // Check if already added
        if (selectedPropertiesWithValues.some(p => p.property_id === propertyId)) return
        
        setSelectedPropertiesWithValues(prev => [
            ...prev,
            {
                property_id: propertyId,
                selected_values: property.values || [] // All values selected by default
            }
        ])
    }
    
    // Remove a property
    const handleRemoveProperty = (propertyId: string) => {
        setSelectedPropertiesWithValues(prev => 
            prev.filter(p => p.property_id !== propertyId)
        )
    }
    
    // Toggle individual property value
    const handlePropertyValueToggle = (propertyId: string, value: string) => {
        setSelectedPropertiesWithValues(prev => 
            prev.map(p => {
                if (p.property_id === propertyId) {
                    const isSelected = p.selected_values.includes(value)
                    return {
                        ...p,
                        selected_values: isSelected
                            ? p.selected_values.filter(v => v !== value)
                            : [...p.selected_values, value]
                    }
                }
                return p
            })
        )
    }

    // ✅ Fixed: Handle multiple image selection
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files
        if (!files || files.length === 0) return

        const newPreviews: ImagePreview[] = []
        let validFiles = 0

        Array.from(files).forEach((file, index) => {
            // Allow both images and videos
            if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
                toaster.create({
                    title: 'Invalid File',
                    description: `${file.name} is not an image or video file`,
                    type: 'error',
                    duration: 3000,
                })
                return
            }
            
            // Increase size limit for videos (50MB)
            const maxSize = file.type.startsWith('video/') ? 50 * 1024 * 1024 : 5 * 1024 * 1024
            if (file.size > maxSize) {
                const sizeLimit = file.type.startsWith('video/') ? '50MB' : '5MB'
                toaster.create({
                    title: 'File Too Large',
                    description: `${file.name} is larger than ${sizeLimit}`,
                    type: 'error',
                    duration: 3000,
                })
                return
            }

            validFiles++
            const reader = new FileReader()
            reader.onloadend = () => {
                newPreviews.push({
                    file,
                    preview: reader.result as string,
                    isPrimary: index === 0 && imagePreviews.length === 0 // First image is primary if no previews exist
                })

                if (newPreviews.length === validFiles) {
                    setImagePreviews(prev => [...prev, ...newPreviews])
                }
            }
            reader.readAsDataURL(file)
        })
    }

    // ✅ New: Handle setting primary image in preview
    const handleSetPrimary = (index: number) => {
        setImagePreviews(prev => 
            prev.map((img, i) => ({
                ...img,
                isPrimary: i === index
            }))
        )
    }

    // ✅ New: Handle removing image from preview
    const handleRemoveImage = (index: number) => {
        setImagePreviews(prev => {
            const newPreviews = prev.filter((_, i) => i !== index)
            // If we removed the primary image, make the first one primary
            if (prev[index].isPrimary && newPreviews.length > 0) {
                newPreviews[0].isPrimary = true
            }
            return newPreviews
        })
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

    // ✅ Updated: Handle uploading multiple images
    const handleUpdateField = async (productId: string, fieldName: keyof ProductProp, isDatetime: boolean = false) => {
        if (!accessToken) {
            navigate("/")
            return
        }
        
        setIsUpdating(true)
        
        try {
            const url = `${import.meta.env.VITE_API_BASE_URL}/shops/product-editor/${productId}/`
            
            if (fieldName === 'images' && imagePreviews.length > 0) {
                const uploadUrl = `${import.meta.env.VITE_API_BASE_URL}/shops/product-image-create/`
                const config = {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        "Content-Type": "multipart/form-data",
                    },
                }

                // Upload each image
                const uploadedImages: ProductImage[] = []
                for (let i = 0; i < imagePreviews.length; i++) {
                    const img = imagePreviews[i]
                    const formData = new FormData()
                    formData.append('media', img.file)
                    formData.append('product_id', productId)
                    formData.append('is_primary', String(img.isPrimary))
                    formData.append('order', String(i))
                    
                    const response = await api.post(uploadUrl, formData, config)
                    uploadedImages.push(response.data)
                }
                
                setProducts(products.map(product => 
                    product.id === productId 
                        ? { ...product, images: [...product.images, ...uploadedImages] }
                        : product
                ))
            } else if (fieldName === 'category') {
                // Handle category update
                const config = {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        "Content-Type": "application/json",
                    },
                }
                
                const updateData = { category: selectedCategories }
                await api.patch(url, updateData, config)
                
                // Refresh product data to get updated categories
                await fetchProductData()
            } else if (fieldName === 'properties') {
                // Handle properties update - only send property IDs that have selected values
                const config = {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        "Content-Type": "application/json",
                    },
                }
                
                // Filter out properties with no selected values and extract IDs
                const propertyIds = selectedPropertiesWithValues
                    .filter(p => p.selected_values.length > 0)
                    .map(p => p.property_id)
                
                const updateData = { properties: propertyIds }
                await api.patch(url, updateData, config)
                
                // Refresh product data to get updated properties with full details
                await fetchProductData()
            } else {
                const config = {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        "Content-Type": "application/json",
                    },
                }
                
                const valueToSend = isDatetime ? convertLocalToUTC(tempValue) : tempValue;
                const updateData = { [fieldName]: valueToSend }
                
                await api.patch(url, updateData, config)
                
                setProducts(products.map(product => 
                    product.id === productId 
                        ? { ...product, [fieldName]: valueToSend }
                        : product
                ))
            }
            
            setEditingField(null)
            setTempValue('')
            setSelectedCategories([])
            setSelectedPropertiesWithValues([])
            setImagePreviews([])
            if (fileInputRef.current) {
                fileInputRef.current.value = ''
            }
            
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

    const renderField = (
        product: ProductProp, 
        fieldName: keyof ProductProp, 
        label: string, 
        isTextarea: boolean = false,
        isDatetime: boolean = false,
        isSelection: boolean = false
    ) => {
        const isEditing = editingField?.productId === product.id && editingField?.fieldName === fieldName;
        const rawValue = String(product[fieldName] || '');
        const displayValue = isDatetime && rawValue
            ? formatDate(rawValue)
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
                                        value={tempValue}
                                        onChange={(e) => setTempValue(e.target.value)}
                                        size="sm"
                                    />
                                ) : isSelection ? (
                                    <select
                                        value={tempValue}
                                        onChange={(e) => setTempValue(e.target.value)}
                                        style={{border:"1px solid", padding:"10px", borderRadius:"5px", width:"100%"}}
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
                                    {displayValue}
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
                            <Wrap gap={4}>
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
                                            {img.media && (img.media.match(/\.(mp4|webm|ogg|mov)$/i)) ? (
                                                <video
                                                    src={img.media}
                                                    style={{
                                                        height: '150px',
                                                        width: '180px',
                                                        objectFit: 'cover',
                                                        borderRadius: 'var(--chakra-radii-md)'
                                                    }}
                                                    controls
                                                />
                                            ) : (
                                                <Image
                                                    src={img.media}
                                                    alt={`Product image ${img.order}`}
                                                    height="150px"
                                                    width="180px"
                                                    objectFit="cover"
                                                    rounded="md"
                                                />
                                            )}
                                            
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
                                            
                                            <HStack mt={2} gap={2}>
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
                                        </Box>
                                    ))}
                            </Wrap>
                        </Box>
                    )}
                    
                    <Box>
                        <Text fontSize="sm" fontWeight="semibold" mb={2}>
                            Add New Media Files
                        </Text>
                        <Group gap={3} align="flex-start" width="full">
                            <Box flex="1">
                                {isEditing ? (
                                    <Stack gap={3}>
                                        <Input
                                            type="file"
                                            accept="image/*,video/*"
                                            multiple
                                            ref={fileInputRef}
                                            onChange={handleImageChange}
                                            size="sm"
                                        />
                                        
                                        {imagePreviews.length > 0 && (
                                            <Wrap gap={4}>
                                                {imagePreviews.map((img, index) => (
                                                    <Box
                                                        key={index}
                                                        position="relative"
                                                        borderRadius="md"
                                                        overflow="hidden"
                                                        borderWidth="2px"
                                                        borderColor={img.isPrimary ? "blue.500" : "gray.200"}
                                                    >
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
                                                        
                                                        {img.file.type.startsWith('video/') ? (
                                                            <video
                                                                src={img.preview}
                                                                style={{
                                                                    width: '150px',
                                                                    height: '150px',
                                                                    objectFit: 'cover'
                                                                }}
                                                                controls
                                                            />
                                                        ) : (
                                                            <Image
                                                                src={img.preview}
                                                                alt={`Product ${index + 1}`}
                                                                w="150px"
                                                                h="150px"
                                                                objectFit="cover"
                                                            />
                                                        )}
                                                        
                                                        <Box
                                                            position="absolute"
                                                            top={2}
                                                            right={2}
                                                            display="flex"
                                                            gap={1}
                                                        >
                                                            {!img.isPrimary && (
                                                                <Button
                                                                    size="xs"
                                                                    colorPalette="blue"
                                                                    onClick={() => handleSetPrimary(index)}
                                                                >
                                                                    Set Primary
                                                                </Button>
                                                            )}
                                                            
                                                            <IconButton
                                                                aria-label="Remove image"
                                                                size="xs"
                                                                colorPalette="red"
                                                                onClick={() => handleRemoveImage(index)}
                                                            >
                                                                <X size={16} />
                                                            </IconButton>
                                                        </Box>
                                                        
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
                                            </Wrap>
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
                                        Click "Add Media Files" to upload new media files
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
                                            disabled={imagePreviews.length === 0}
                                        >
                                            Upload ({imagePreviews.length})
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
                                        Add Media Files
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
                Product Details
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
                                <Stack gap={4}>
                                    <Text fontWeight="bold" color="gray.600" fontSize="sm" mt={2}>
                                        Basic Information
                                    </Text>
                                    {renderField(product, 'name', 'Product Name')}
                                    <Separator />
                                    {renderField(product, 'quantity', 'Quantity')}
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
                                    {renderField(product, 'warranty', 'Warranty')}
                                    <Separator />
                                    {renderField(product, 'delivery_term', 'Delivery Terms', true)}
                                    <Separator />
                                    {renderField(product, 'refund_policy', 'Refund Policy', true)}
                                    <Separator />
                                    {renderField(product, 'refund', 'Refund Available')}
                                    <Separator />
                                    {renderField(product, 'description', 'Description', true)}
                                    
                                    <Text fontWeight="bold" color="gray.600" fontSize="sm" mt={4}>
                                        Categories & Properties
                                    </Text>
                                    <Box>
                                        <Field.Root>
                                            <Field.Label fontWeight="semibold" color="gray.700" fontSize="sm">
                                                Categories
                                            </Field.Label>
                                            {editingField?.productId === product.id && editingField?.fieldName === 'category' ? (
                                                <Box>
                                                    <Box p={3} borderWidth="1px" borderRadius="md" mb={3}>
                                                        <Text fontSize="sm" mb={2} fontWeight="bold">Select Categories:</Text>
                                                        <Wrap gap={2}>
                                                            {categories.map((cat) => (
                                                                <Badge
                                                                    key={cat.id}
                                                                    colorPalette={selectedCategories.includes(cat.id) ? "blue" : "gray"}
                                                                    cursor="pointer"
                                                                    onClick={() => handleCategoryToggle(cat.id)}
                                                                    px={3}
                                                                    py={2}
                                                                >
                                                                    {selectedCategories.includes(cat.id) ? "✓ " : ""}{cat.name}
                                                                </Badge>
                                                            ))}
                                                        </Wrap>
                                                        <Text fontSize="xs" color="gray.600" mt={2}>
                                                            {selectedCategories.length} selected
                                                        </Text>
                                                    </Box>
                                                    <Group gap={2}>
                                                        <Button
                                                            colorPalette="green"
                                                            size="sm"
                                                            onClick={() => handleUpdateField(product.id, 'category')}
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
                                                    </Group>
                                                </Box>
                                            ) : (
                                                <Box>
                                                    <Box p={2} bg="gray.50" borderRadius="md" mb={2}>
                                                        {product.category && product.category.length > 0 ? (
                                                            <Wrap gap={2}>
                                                                {product.category.map((catId) => {
                                                                    const cat = categories.find(c => c.id === catId)
                                                                    return (
                                                                        <Badge key={catId} colorPalette="blue">
                                                                            {cat?.name || catId}
                                                                        </Badge>
                                                                    )
                                                                })}
                                                            </Wrap>
                                                        ) : (
                                                            <Text color="gray.400" fontSize="sm">No categories</Text>
                                                        )}
                                                    </Box>
                                                    <Button
                                                        colorPalette="blue"
                                                        size="sm"
                                                        onClick={() => handleEdit(product.id, 'category', product.category)}
                                                        disabled={editingField !== null}
                                                    >
                                                        Update Categories
                                                    </Button>
                                                </Box>
                                            )}
                                        </Field.Root>
                                    </Box>
                                    <Separator />
                                    <Box>
                                        <Field.Root>
                                            <Field.Label fontWeight="semibold" color="gray.700" fontSize="sm">
                                                Product Properties
                                            </Field.Label>
                                            {editingField?.productId === product.id && editingField?.fieldName === 'properties' ? (
                                                <Box>
                                                    <Box p={3} borderWidth="1px" borderRadius="md" mb={3}>
                                                        {/* Property Selection */}
                                                        <Text fontSize="sm" mb={2} fontWeight="bold">Add Properties:</Text>
                                                        <Box mb={3}>
                                                            <select
                                                                style={{
                                                                    width: '100%',
                                                                    padding: '8px',
                                                                    borderRadius: '6px',
                                                                    border: '1px solid #e2e8f0',
                                                                    fontSize: '14px'
                                                                }}
                                                                onChange={(e) => {
                                                                    if (e.target.value) {
                                                                        handleAddProperty(e.target.value)
                                                                        e.target.value = '' // Reset selection
                                                                    }
                                                                }}
                                                                defaultValue=""
                                                            >
                                                                <option value="" disabled>Select a property to add</option>
                                                                {allProperties
                                                                    .filter(prop => !selectedPropertiesWithValues.some(p => p.property_id === prop.id))
                                                                    .map((prop) => (
                                                                        <option key={prop.id} value={prop.id}>
                                                                            {prop.name}
                                                                        </option>
                                                                    ))
                                                                }
                                                            </select>
                                                        </Box>
                                                        
                                                        {/* Selected Properties with Value Checkboxes */}
                                                        {selectedPropertiesWithValues.length > 0 && (
                                                            <Stack gap={3} mt={4}>
                                                                <Text fontSize="sm" fontWeight="bold">Selected Properties:</Text>
                                                                {selectedPropertiesWithValues.map((selectedProp) => {
                                                                    const property = allProperties.find(p => p.id === selectedProp.property_id)
                                                                    if (!property) return null
                                                                    
                                                                    return (
                                                                        <Box
                                                                            key={selectedProp.property_id}
                                                                            p={3}
                                                                            borderWidth="1px"
                                                                            borderRadius="md"
                                                                            bg="blue.50"
                                                                        >
                                                                            <HStack justify="space-between" mb={2}>
                                                                                <Text fontWeight="bold" fontSize="sm">
                                                                                    {property.name}
                                                                                </Text>
                                                                                <Button
                                                                                    size="xs"
                                                                                    colorPalette="red"
                                                                                    variant="ghost"
                                                                                    onClick={() => handleRemoveProperty(selectedProp.property_id)}
                                                                                >
                                                                                    Remove
                                                                                </Button>
                                                                            </HStack>
                                                                            {property.values && property.values.length > 0 && (
                                                                                <Box>
                                                                                    <Text fontSize="xs" mb={2} color="gray.600">Select values:</Text>
                                                                                    <Wrap gap={2}>
                                                                                        {property.values.map((value) => (
                                                                                            <Badge
                                                                                                key={value}
                                                                                                colorPalette={selectedProp.selected_values.includes(value) ? "green" : "gray"}
                                                                                                cursor="pointer"
                                                                                                onClick={() => handlePropertyValueToggle(selectedProp.property_id, value)}
                                                                                                px={2}
                                                                                                py={1}
                                                                                            >
                                                                                                {selectedProp.selected_values.includes(value) ? "✓ " : ""}{value}
                                                                                            </Badge>
                                                                                        ))}
                                                                                    </Wrap>
                                                                                </Box>
                                                                            )}
                                                                        </Box>
                                                                    )
                                                                })}
                                                            </Stack>
                                                        )}
                                                        
                                                        <Text fontSize="xs" color="gray.600" mt={2}>
                                                            {selectedPropertiesWithValues.length} properties selected
                                                        </Text>
                                                    </Box>
                                                    <Group gap={2}>
                                                        <Button
                                                            colorPalette="green"
                                                            size="sm"
                                                            onClick={() => handleUpdateField(product.id, 'properties')}
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
                                                    </Group>
                                                </Box>
                                            ) : (
                                                <Box>
                                                    <Box p={2} bg="gray.50" borderRadius="md" mb={2}>
                                                        {product.properties && product.properties.length > 0 ? (
                                                            <Stack gap={3}>
                                                                {product.properties.map((prop) => (
                                                                    <Box key={prop.id} borderWidth="1px" p={3} borderRadius="md" bg="white">
                                                                        <Text fontWeight="bold" fontSize="sm" mb={2}>
                                                                            {prop.name}
                                                                        </Text>
                                                                        {prop.values && prop.values.length > 0 ? (
                                                                            <Wrap gap={2}>
                                                                                {prop.values.map((value) => (
                                                                                    <Badge key={value} colorPalette="green">
                                                                                        {value}
                                                                                    </Badge>
                                                                                ))}
                                                                            </Wrap>
                                                                        ) : (
                                                                            <Text color="gray.400" fontSize="xs">No values defined</Text>
                                                                        )}
                                                                    </Box>
                                                                ))}
                                                            </Stack>
                                                        ) : (
                                                            <Text color="gray.400" fontSize="sm">No properties</Text>
                                                        )}
                                                    </Box>
                                                    <Button
                                                        colorPalette="blue"
                                                        size="sm"
                                                        onClick={() => handleEdit(product.id, 'properties', product.properties)}
                                                        disabled={editingField !== null}
                                                    >
                                                        Update Properties
                                                    </Button>
                                                </Box>
                                            )}
                                        </Field.Root>
                                    </Box>
                                    
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

export default ProductUpdate