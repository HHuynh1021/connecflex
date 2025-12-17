import { useEffect, useState} from "react";
import type { FormEvent, ChangeEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from 'react-redux';
import { login, reset, getUserInfo } from '../services/authSlice';
import { Center, Button, Container, Box, Heading, Input, Text, VStack, HStack } from "@chakra-ui/react";
import { PasswordInput } from "../components/ui/password-input";

interface FormData {
  email: string;
  password: string;
}

interface RootState {
  auth: {
    user: any; // Replace 'any' with your actual user type
    isError: boolean;
    isSuccess: boolean;
  };
}

const Login = () => {
  const { user, isError, isSuccess } = useSelector((state: RootState) => state.auth);
  
  const [formData, setFormData] = useState<FormData>({
    email: "hiep24000@gmail.com",
    password: "kingzarckier",
  });
  
  const [error, setError] = useState<string>('');
  const { email, password } = formData;
  
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = (e: FormEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const userData = {
      email,
      password,
    };
    dispatch(login(userData) as any); // Add proper typing for your dispatch
  };

  useEffect(() => {
    if (isError) {
      setError('Invalid email or password');
    }
    if (isSuccess) {
      dispatch(getUserInfo() as any); // Add proper typing for your dispatch
      navigate("/dashboard");
    }
    dispatch(reset() as any); // Add proper typing for your dispatch
  }, [isError, isSuccess, user, email, navigate, dispatch]);

  return (
    <Container maxW="1140px">
      <Center flexBasis="50%">
        <VStack maxW="500px" mt={100} rounded={8} p={8} border="1px solid" shadow="3px 3px 15px 5px rgb(75, 75, 79)">
          <Heading fontSize={24}>Login</Heading>
          
          {error && (
            <Box
              border="1px solid"
              borderColor="red.500"
              bg="red.100"
              color="red.800"
              p={3}
              rounded={8}
              mb={4}
              w="100%"
            >
              {error}
            </Box>
          )}
      
          <VStack p={4} rounded={8} w="100%">
            <Input
              border="1px solid"
              type="email"
              placeholder="Email"
              name="email"
              onChange={handleChange}
              value={email}
              required
            />
            <PasswordInput
              border="1px solid"
              my={2}
              placeholder="Password"
              size="lg"
              onChange={handleChange}
              value={password}
              name="password"
              required
            />
            <Button type="submit" onClick={handleSubmit} w="100%">
              Login
            </Button>
          </VStack>
          
          <Text>
            Forgot your password? <Link to="/reset-password">Reset Password</Link>
          </Text>
          
          <Text>
            Don't have an account? <Link to="/register">Sign Up</Link>
          </Text>
        </VStack>
      </Center>
    </Container>
  );
};

export default Login;