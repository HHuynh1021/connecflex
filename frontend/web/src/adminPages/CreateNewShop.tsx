import {useEffect, useState, useRef} from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import useAccessToken from '../services/token'
import api from '../services/api'
import { Box, Text, Stack,Input, Textarea, Button, Spinner,Heading,Separator,Group,Image,} from '@chakra-ui/react'
import { Field } from '@chakra-ui/react/field'
import { toaster } from '../components/ui/toaster'

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
    phone: string
    description: string
    industry: string
    logo: string
    banner: string;
    template: string;
}

const CreateNewShop:React.FC = () => {
    const Navigate = useNavigate()
    const user = useSelector((state: any) => state.auth.user)
    const { accessToken} = useAccessToken(user)
    const [shops, setShops] = useState<ShopDataProps[]>([])
    const [isLoading, setLoading] = useState<boolean>(false)
    
    const [editingField, setEditingField] = useState<{shopId: string, fieldName: string} | null>(null)

    const [tempValue, setTempValue] = useState<string>('')

    const [isUpdating, setIsUpdating] = useState<boolean>(false)
    
    const [logoFile, setLogoFile] = useState<File | null>(null)
    const [logoPreview, setLogoPreview] = useState<string>('')
    const fileInputRef = useRef<HTMLInputElement>(null)
    
    const bannerFileInputRef =useRef<HTMLInputElement>(null)
    const [bannerFile, setBannerFile] = useState<File | null>(null)
    const [bannerPreview, setBannerPreview] = useState<string>('')

    const fetchShopData = async () => {
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
        // console.log("access token:", accessToken)
        try {
            const url = `${import.meta.env.VITE_API_BASE_URL}/shops/shop-list-create/`
            const config = {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    "Content-Type": "application/json",
                },
            }
            const response = await api.get(url, config)
            const shopdata = Array.isArray(response.data[0]) ? response.data[0] : response.data
            // console.log("shop data: ", shopdata)
            setShops(shopdata)
        } catch (error: any) {
            console.error("fetching error", error.response?.data || error.message)
            toaster.create({
                title: 'Error',
                description: 'Failed to fetch shop data',
                type: 'error',
                duration: 3000,
            })
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if(accessToken && user) {
            fetchShopData()
        }
    },[accessToken, user])

    // Start editing a field
    const handleEdit = (shopId: string, fieldName: keyof ShopDataProps, currentValue: string) => {
        setEditingField({ shopId, fieldName })
        setTempValue(currentValue)
    }

    // Cancel editing
    const handleCancel = () => {
        setEditingField(null)
        setTempValue('')
        setLogoFile(null)
        setLogoPreview('')
        setBannerFile(null)
        setBannerPreview('')
    }

    // Handle logo file selection
    const handleLogoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
            
            setLogoFile(file)
            
            // Create preview
            const reader = new FileReader()
            reader.onloadend = () => {
                setLogoPreview(reader.result as string)
            }
            reader.readAsDataURL(file)
        }
    }
    const handleBannerFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
                    type: 'error',
                    duration: 3000,
                })
                return
            }
            
            setBannerFile(file)
            
            // Create preview
            const reader = new FileReader()
            reader.onloadend = () => {
                setBannerPreview(reader.result as string)
            }
            reader.readAsDataURL(file)
        }
    }

    // Update a single field
    const handleUpdateField = async (shopId: string, fieldName: keyof ShopDataProps) => {
        if(!accessToken){
            Navigate("/")
            return
        }
        
        setIsUpdating(true)
        
        try {
            const url = `${import.meta.env.VITE_API_BASE_URL}/shops/shop-editor/${shopId}/`
            
            let updateData: any
            let config: any
            
            if (fieldName === 'logo' && logoFile) {
                // Use FormData for file upload
                const formData = new FormData()
                formData.append('logo', logoFile)
                
                config = {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        "Content-Type": "multipart/form-data",
                    },
                }
                
                await api.patch(url, formData, config)
                
                // Update local state with the preview URL (you might want to use the actual URL from response)
                setShops(shops.map(shop => 
                    shop.id === shopId 
                        ? { ...shop, [fieldName]: logoPreview }
                        : shop
                ))
            } 
            else if (fieldName === 'banner' && bannerFile) {
                // Use FormData for file upload
                const formData = new FormData()
                formData.append('banner', bannerFile)
                
                config = {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        "Content-Type": "multipart/form-data",
                    },
                }
                
                await api.patch(url, formData, config)
                
                // Update local state with the preview URL (you might want to use the actual URL from response)
                setShops(shops.map(shop => 
                    shop.id === shopId 
                        ? { ...shop, [fieldName]: bannerPreview }
                        : shop
                ))
            } 

            else {
                // Regular field update
                config = {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        "Content-Type": "application/json",
                    },
                }
                
                updateData = {
                    [fieldName]: tempValue
                }
                
                await api.patch(url, updateData, config)
                
                // Update local state
                setShops(shops.map(shop => 
                    shop.id === shopId 
                        ? { ...shop, [fieldName]: tempValue }
                        : shop
                ))
            }
            
            setEditingField(null)
            setTempValue('')
            setLogoFile(null)
            setLogoPreview('')
            setBannerFile(null)
            setBannerPreview('')
            
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
        shop: ShopDataProps, 
        fieldName: keyof ShopDataProps, 
        label: string, 
        isTextarea: boolean = false
    ) => {
        const isEditing = editingField?.shopId === shop.id && editingField?.fieldName === fieldName
        const currentValue = isEditing ? tempValue : shop[fieldName]
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
                                        value={currentValue as string}
                                        onChange={(e) => setTempValue(e.target.value)}
                                        size="sm"
                                        rows={4}
                                    />
                                ) : (
                                    <Input
                                        value={currentValue as string}
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
                                        onClick={() => handleUpdateField(shop.id, fieldName)}
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
                                    onClick={() => handleEdit(shop.id, fieldName, shop[fieldName] as string)}
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

    // Render logo field with image upload
    const renderLogoField = (shop: ShopDataProps) => {
        const isEditing = editingField?.shopId === shop.id && editingField?.fieldName === 'logo'
        const isFieldDisabled = editingField !== null && !isEditing
        const currentLogo = logoPreview || shop.logo

        return (
            <Box>
                <Field.Root>
                    <Field.Label fontWeight="semibold" color="gray.700" fontSize="sm">
                        Logo
                    </Field.Label>
                    <Group gap={3} align="flex-start" width="full">
                        <Box flex="1">
                            {isEditing ? (
                                <Stack gap={3}>
                                    <Input
                                        type="file"
                                        accept="image/*"
                                        ref={fileInputRef}
                                        onChange={handleLogoFileChange}
                                        size="sm"
                                    />
                                    {(logoPreview || shop.logo) && (
                                        <Box 
                                            borderWidth="1px" 
                                            borderRadius="md" 
                                            p={2}
                                            bg="gray.50"
                                        >
                                            <Image
                                                src={logoPreview || shop.logo}
                                                alt="Logo preview"
                                                maxH="50px"
                                                objectFit="contain"
                                            />
                                        </Box>
                                    )}
                                </Stack>
                            ) : (
                                <Box>
                                    {shop.logo ? (
                                        <Box 
                                            borderWidth="1px" 
                                            borderRadius="md" 
                                            p={2}
                                            bg="gray.50"
                                        >
                                            <Image
                                                src={shop.logo}
                                                alt="Shop logo"
                                                maxH="150px"
                                                objectFit="contain"
                                            />
                                        </Box>
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
                                            No logo uploaded
                                        </Text>
                                    )}
                                </Box>
                            )}
                        </Box>
                        
                        <Group gap={2}>
                            {isEditing ? (
                                <>
                                    <Button
                                        colorPalette="green"
                                        size="sm"
                                        onClick={() => handleUpdateField(shop.id, 'logo')}
                                        loading={isUpdating}
                                        disabled={!logoFile}
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
                                    onClick={() => {
                                        setEditingField({ shopId: shop.id, fieldName: 'logo' })
                                    }}
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
    const renderBannerField = (shop: ShopDataProps) => {
        const isEditing = editingField?.shopId === shop.id && editingField?.fieldName === 'banner'
        const isFieldDisabled = editingField !== null && !isEditing
        
        return (
            <Box>
                <Field.Root>
                    <Field.Label fontWeight="semibold" color="gray.700" fontSize="sm">
                        Banner
                    </Field.Label>
                    <Group gap={3} align="flex-start" width="full">
                        <Box flex="1">
                            {isEditing ? (
                                <Stack gap={3}>
                                    <Input
                                        type="file"
                                        accept="image/*"
                                        ref={bannerFileInputRef}
                                        onChange={handleBannerFileChange}
                                        size="sm"
                                    />
                                    {(bannerPreview || shop.banner) && (
                                        <Box borderWidth="1px" borderRadius="md" p={2} bg="gray.50">
                                            <Image
                                                src={bannerPreview || shop.banner}
                                                alt="banner preview"
                                            
                                                fit={"fill"}
                                            />
                                        </Box>
                                    )}
                                </Stack>
                            ) : (
                                <Box>
                                    {shop.banner ? (
                                        <Box borderWidth="1px" borderRadius="md" p={2}>
                                            <Image src={shop.banner} alt="Shop banner" maxH="300px" w={"100%"} fit={"fill"}/>
                                        </Box>
                                    ) : (
                                        <Text p={2} bg="gray.50" borderRadius="md" minH="32px" display="flex" alignItems="center" fontSize="sm" color="gray.400">
                                            No banner uploaded
                                        </Text>
                                    )}
                                </Box>
                            )}
                        </Box>
                        
                        <Group gap={2}>
                            {isEditing ? (
                                <>
                                    <Button
                                        colorPalette="green"
                                        size="sm"
                                        onClick={() => handleUpdateField(shop.id, 'banner')}  // ✅ FIXED
                                        loading={isUpdating}
                                        disabled={!bannerFile}  // ✅ FIXED
                                    >
                                        Save
                                    </Button>
                                    <Button variant="outline" size="sm" onClick={handleCancel} disabled={isUpdating}>
                                        Cancel
                                    </Button>
                                </>
                            ) : (
                                <Button
                                    colorPalette="blue"
                                    size="sm"
                                    onClick={() => setEditingField({ shopId: shop.id, fieldName: 'banner' })}  // ✅ FIXED
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
    const renderTemplateField = (shop: ShopDataProps) => {
        const isEditing = editingField?.shopId === shop.id && editingField?.fieldName === 'template'
        const isFieldDisabled = editingField !== null && !isEditing
        const currentValue = isEditing ? tempValue : shop.template
        
        return (
            <Box>
                <Field.Root>
                    <Field.Label fontWeight="semibold" color="gray.700" fontSize="sm">
                        Template
                    </Field.Label>
                    <Group gap={3} align="flex-start" width="full">
                        <Box flex="1">
                            {isEditing ? (
                                <Stack gap={3}>
                                    <select
                                        value={currentValue as string}
                                        onChange={(e) => setTempValue(e.target.value)}
                                    >
                                        <option value={""}>Choose A Template</option>
                                        <option value={"Template-1"}>Template-1</option>
                                        <option value={"Template-2"}>Template-2</option>
                                        <option value={"Template-3"}>Template-3</option>
                                        <option value={"Template-4"}>Template-4</option>
                                    </select>
                                </Stack>
                            ) : (
                                <Box>
                                    {shop.template && (
                                        <Box borderWidth="1px" borderRadius="md" p={2} bg="gray.50">
                                            <Text>{shop.template}</Text>
                                        </Box>
                                    )}
                                </Box>
                            )}
                        </Box>
                        
                        <Group gap={2}>
                            {isEditing ? (
                                <>
                                    <Button
                                        colorPalette="green"
                                        size="sm"
                                        onClick={() => handleUpdateField(shop.id, 'template')}  // ✅ FIXED
                                        loading={isUpdating}
                                        // disabled={!bannerFile}  // ✅ FIXED
                                    >
                                        Save
                                    </Button>
                                    <Button variant="outline" size="sm" onClick={handleCancel} disabled={isUpdating}>
                                        Cancel
                                    </Button>
                                </>
                            ) : (
                                <Button
                                    colorPalette="blue"
                                    size="sm"
                                    onClick={() => setEditingField({ shopId: shop.id, fieldName: 'template' })}  // ✅ FIXED
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

    if (isLoading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minH="400px">
                <Spinner size="xl" color="blue.500" />
            </Box>
        )
    }

    return (
        <Box maxW={"100%"}>
            <Box mt={"20px"}>
                {shops && shops.length === 0 ? (
                    <Box textAlign="center" py={10}>
                        <Text color="gray.500">No shops found</Text>
                    </Box>
                ) : (
                    <Stack gap={8}>
                        {shops.map((shop: ShopDataProps) => (
                            <Box 
                                key={shop.id} 
                                p={6} 
                                borderRadius="lg" 
                                shadow="md"
                                borderWidth="1px"
                                borderColor="gray.200"
                            >
                                <Heading size="md" mb={4} color="blue.600">
                                    {shop.name || 'Unnamed Shop'}
                                </Heading>
                                <Image w={"100px"} h={"100px"} src={shop.logo}/>
                                <Stack gap={4}>
                                    {/* Basic Information */}
                                    <Text fontWeight="bold" color="gray.600" fontSize="sm" mt={2}>
                                        Basic Information
                                    </Text>
                                    {renderField(shop, 'name', 'Shop Name')}
                                    <Separator />
                                    {renderTemplateField(shop)}
                                    <Separator />
                                    {renderLogoField(shop)}
                                    <Separator />
                                    {renderBannerField(shop)}
                                    <Separator />
                                    {renderField(shop, 'email', 'Email')}
                                    <Separator />
                                    {renderField(shop, 'phone', 'Phone')}
                                    <Separator />
                                    {renderField(shop, 'industry', 'Industry')}
                                    <Separator />
                                    {renderField(shop, 'description', 'Description', true)}
                                    
                                    {/* Address Information */}
                                    <Text fontWeight="bold" color="gray.600" fontSize="sm" mt={4}>
                                        Address
                                    </Text>
                                    {renderField(shop, 'street', 'Street')}
                                    <Separator />
                                    {renderField(shop, 'city', 'City')}
                                    <Separator />
                                    {renderField(shop, 'state', 'State')}
                                    <Separator />
                                    {renderField(shop, 'province', 'Province')}
                                    <Separator />
                                    {renderField(shop, 'zipcode', 'Zip Code')}
                                    <Separator />
                                    {renderField(shop, 'country', 'Country')}
                                </Stack>
                            </Box>
                        ))}
                    </Stack>
                )}
            </Box>
        </Box>
    )
}

export default CreateNewShop
