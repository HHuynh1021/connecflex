import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { activate, reset } from '../services/authSlice'
import { VStack, Button, Center, Container, Heading, Spinner, Text } from '@chakra-ui/react'

interface ActivationData {
    uid: string;
    token: string;
}

interface AuthState {
    isLoading: boolean;
    isError: boolean;
    isSuccess: boolean;
    message: string;
}

interface RootState {
    auth: AuthState;
}

const Activate: React.FC = () => {
    const { uid, token } = useParams<{ uid: string; token: string }>()
    const dispatch = useDispatch<any>()
    const navigate = useNavigate()
    const { isLoading, isError, isSuccess, message } = useSelector((state: RootState) => state.auth)

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        
        if (!uid || !token) {
            alert("Invalid activation link")
            return
        }
        
        const userData: ActivationData = {
            uid,
            token
        }
        
        dispatch(activate(userData as any))
    }

    useEffect(() => {
        if (isError) {
            alert(message || "Activation failed. Please try again.")
        }
        
        if (isSuccess) {
            alert("Your account has been activated! You can login now")
            navigate("/login")
        }
        
        dispatch(reset())
    }, [isError, isSuccess, message, navigate, dispatch])

    return (
        <Container maxW="600px">
            <Center minH="100vh">
                <VStack 
                    mt={100} 
                    p={8} 
                    rounded={8} 
                    shadow="lg"
                    bg="white"
                    gap={4}
                    minW="400px"
                >
                    <Heading size="lg">Activate Account</Heading>
                    
                    <Text textAlign="center" color="gray.600">
                        Click the button below to activate your account
                    </Text>
                    
                    {isLoading ? (
                        <Spinner size="lg" color="blue.500" />
                    ) : (
                        <Button 
                            type="submit" 
                            onClick={handleSubmit}
                            colorPalette="blue"
                            width="full"
                            size="lg"
                            loading={isLoading}
                        >
                            Activate Account
                        </Button>
                    )}
                    
                    {isError && (
                        <Text color="red.500" fontSize="sm">
                            {message || "Activation failed"}
                        </Text>
                    )}
                </VStack>
            </Center>
        </Container>
    )
}

export default Activate