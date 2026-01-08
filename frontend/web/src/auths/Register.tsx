import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { register, reset } from '../services/authSlice';
import { useNavigate, Link } from 'react-router-dom';
import { HStack, Text, VStack, Container, Input, Button, Heading, Box } from '@chakra-ui/react';
import { PasswordInput } from '../components/ui/password-input';

interface FormData {
  shop_name: string;
  role: string;
  first_name: string;
  last_name: string;
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
    shop_name: "",
    role: "",
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    re_password: "",
  });

  const { shop_name, role, first_name, last_name, email, password, re_password } = formData;
  
  const dispatch = useDispatch<any>();
  const navigate = useNavigate();
  const { user, isError, isSuccess } = useSelector((state: RootState) => state.auth);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  // const handleSubmit = (e: React.FormEvent) => {
  //   e.preventDefault();
    
  //   // Validation
  //   if (!role) {
  //     alert('Please select a role');
  //     return;
  //   }
    
  //   if (password !== re_password) {
  //     alert('Passwords do not match');
  //     return;
  //   }
    
  //   if (role === 'shop_admin' && !shop_name) {
  //     alert('Shop name is required for Shop Admin');
  //     return;
  //   }
    
  //   const userData: any = {
  //     role,
  //     first_name,
  //     last_name,
  //     email,
  //     password,
  //     re_password
  //   };
  //   if (role === 'shop_admin') {
  //     userData.shop_name = shop_name
  //   }
  //   console.log('Submitting user data:', userData);
  //   try {
  //     dispatch(register(userData));
  //   } catch (error: any) {
  //     console.error("register error", error.response?.data || error.message);
  //   }
  // };
  const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault();
  
  // Validation
  if (!role) {
    alert('Please select a role');
    return;
  }
  
  if (password !== re_password) {
    alert('Passwords do not match');
    return;
  }
  
  
  // Build userData - only include shop_name for shop_admin
  const userData: any = {
    role,
    first_name,
    last_name,
    email,
    password,
    re_password
  };
  
  
  try {
    dispatch(register(userData));
  } catch (error: any) {
    console.error("❌ Registration error:", error.response?.data || error.message);
  }
};
  useEffect(() => {
    if (isError) {
      alert('Registration error. Please try again.');
    }
    
    if (isSuccess) {
      alert('Registration successful! Please check your email to activate your account.');
      if (role == "shop_admin") {
        navigate('/login');
      }else {
        navigate('/');
      }
    }
    
    dispatch(reset());
  }, [isError, isSuccess, user, navigate, dispatch]);

  return (
    <Container maxW="1140px">
      <HStack>
        <Box flexBasis={{ base: "100%", md: "50%" }}>
          <VStack maxW="500px" mt={100} p={4} rounded={8} shadow="3px 3px 15px 5px rgb(75, 75, 79)">
            <Heading>Do you want to register as:</Heading>
            
            <select
              name='role'
              onChange={handleChange}
              value={role}
              required
              id='role'
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid',
                borderRadius: '4px'
              }}
            >
              <option value="">Choose A Role</option>
              <option value="shop_admin">Shop Admin</option>
              <option value="guest_user">Guest User</option>
            </select>

            {role && (
              <Box width="full">
                <VStack gap={4}>
                
                  <Input 
                    border="1px solid"
                    type="text"
                    placeholder="First Name"
                    name="first_name"
                    onChange={handleChange}
                    value={first_name}
                    required
                  />
                  
                  <Input 
                    border="1px solid"
                    type="text"
                    placeholder="Last Name"
                    name="last_name"
                    onChange={handleChange}
                    value={last_name}
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
                  
                  <Button 
                    type="submit" 
                    onClick={handleSubmit} 
                    width="full" 
                    colorPalette="blue"
                  >
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
              </Box>
            )}
          </VStack>
        </Box>
      </HStack>
    </Container>
  );
};

export default Register;

