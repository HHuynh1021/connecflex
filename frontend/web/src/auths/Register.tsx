import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { register, reset } from '../services/authSlice';
import { useNavigate, Link } from 'react-router-dom';
import { HStack, Text, Center, VStack, Container, Input, Button, Heading } from '@chakra-ui/react';
import { PasswordInput } from '../components/ui/password-input';

interface FormData {
  name: string;
  email: string;
  password: string;
  re_password: string;
}

interface AuthState {
  user: any;
  isError: boolean;
  isSuccess: boolean;
}

interface RootState {
  auth: AuthState;
}

const Register: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    password: "",
    re_password: "",
  });

  const { name, email, password, re_password } = formData;
  
  const dispatch = useDispatch<any>();
  const navigate = useNavigate();
  const { user, isError, isSuccess } = useSelector((state: RootState) => state.auth);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== re_password) {
      alert('Passwords do not match');
      return;
    }
    
    const userData: FormData = {
      name,
      email,
      password,
      re_password
    };
    
    dispatch(register(userData));
  };

  useEffect(() => {
    if (isError) {
      alert('Registration error. Please try again.');
    }
    
    if (isSuccess) {
      alert('Registration successful! Please check your email to activate your account.');
      navigate('/login');
    }
    
    dispatch(reset());
  }, [isError, isSuccess, user, navigate, dispatch]);

  return (
    <Container maxW="1140px">
      <Center flexBasis="50%">
        <VStack maxW="500px" mt={100} p={4} rounded={8} shadow="3px 3px 15px 5px rgb(75, 75, 79)">
          <HStack gap="20px">
            <Heading fontSize={24}>Register</Heading>
          </HStack>
          
          <VStack p={2} rounded={8} width="full" gap={3}>
            <Input 
              border="1px solid"
              type="text"
              placeholder="Shop's Name"
              name="name"
              onChange={handleChange}
              value={name}
              required
            />
            
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
              placeholder="Password"
              name="password"
              onChange={handleChange}
              value={password}
              required
            />
            
            <PasswordInput 
              border="1px solid"
              placeholder="Confirm Password"
              name="re_password"
              onChange={handleChange}
              value={re_password}
              required
            />
          </VStack>
          
          <Button type="submit" onClick={handleSubmit} width="full" colorPalette="blue">
            Register
          </Button>
          
          <HStack>
            <Text fontSize="14px" fontStyle="italic">
              Already have an account?
            </Text>
            <Link to="/login" style={{ color: '#3182ce', textDecoration: 'underline' }}>
              Login
            </Link>
          </HStack>
        </VStack>
      </Center>
    </Container>
  );
};

export default Register;