import { useEffect, useState } from "react";
import type { FormEvent, ChangeEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from 'react-redux';
import { login, getUserInfo, reset } from '../services/authSlice';
import type { AppDispatch } from '../services/store';
import { Center, Button, Container, Box, Heading, Input, Text, VStack } from "@chakra-ui/react";
import { PasswordInput } from "../components/ui/password-input";

interface FormData {
  email: string;
  password: string;
}

interface RootState {
  auth: {
    user: any;
    userInfo: any;
    isError: boolean;
    isSuccess: boolean;
    isLoading: boolean;
    message: string;
    token: string;
  };
}

const ShopLogin = () => {
  const { user, userInfo, isError, isSuccess, isLoading, message, token } = useSelector((state: RootState) => state.auth);
  
  const [formData, setFormData] = useState<FormData>({
    email: "",
    password: "",
  });
  
  const [error, setError] = useState<string>('');
  const { email, password } = formData;
  
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    
    const userData = {
      email,
      password,
    };
    
    console.log('🔐 Submitting login...');
    dispatch(login(userData));
  };

  // Effect to fetch user info after successful login
  useEffect(() => {
    if (isSuccess && user && user.access && !userInfo && !isLoading) {
      console.log('✅ Login successful, fetching user info...');
      dispatch(getUserInfo());
    }
  }, [isSuccess, user, userInfo, isLoading, dispatch]);

  // Effect to navigate after user info is loaded
  useEffect(() => {
    if (userInfo) {
      // console.log('👤 User info loaded:', userInfo);
      
      if (userInfo.role === 'shop_admin') {
        navigate("/management");
      } 
      else if (userInfo.role === 'guest_user'){
        navigate("/");
      }
      else {
        setError('Access denied. Cannot find the account');
      }
      
      dispatch(reset());
    }
  }, [userInfo, navigate, dispatch]);

  // Effect to handle errors
  useEffect(() => {
    if (isError) {
      console.error('❌ Login error:', message);
      setError(message || 'Invalid email or password');
      dispatch(reset());
    }
  }, [isError, message, dispatch]);

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
      
          <form onSubmit={handleSubmit} style={{ width: '100%' }}>
            <VStack p={4} rounded={8} w="100%">
              <Input
                border="1px solid"
                type="email"
                placeholder="Email"
                name="email"
                id="email"
                autoComplete="email"
                onChange={handleChange}
                value={email}
                required
              />
              <PasswordInput
                border="1px solid"
                my={2}
                placeholder="Password"
                type="password"
                size="lg"
                onChange={handleChange}
                value={password}
                name="password"
                id="password"
                autoComplete="current-password"
                required
              />
              <Button 
                type="submit"
                w="100%"
                loading={isLoading}
                disabled={isLoading}
              >
                {isLoading ? 'Logging in...' : 'Login'}
              </Button>
            </VStack>
          </form>
          
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

export default ShopLogin;


// import { useEffect, useState } from "react";
// import type { FormEvent, ChangeEvent } from "react";
// import { Link, useNavigate } from "react-router-dom";
// import { useDispatch, useSelector } from 'react-redux';
// import { login, reset } from '../services/authSlice';
// import type { AppDispatch } from '../services/store';
// import { Center, Button, Container, Box, Heading, Input, Text, VStack } from "@chakra-ui/react";
// import { PasswordInput } from "../components/ui/password-input";

// interface FormData {
//   email: string;
//   password: string;
// }

// interface RootState {
//   auth: {
//     user: any;
//     isError: boolean;
//     isSuccess: boolean;
//     isLoading: boolean;
//     message: string;
//     accessToken: string
//   };
// }

// const ShopLogin = () => {
//   const { user, isError, isSuccess, isLoading, message, accessToken } = useSelector((state: RootState) => state.auth);
  
//   const [formData, setFormData] = useState<FormData>({
//     email: "",
//     password: "",
//   });
  
//   const [error, setError] = useState<string>('');
//   const { email, password } = formData;
  
//   const dispatch = useDispatch<AppDispatch>();
//   const navigate = useNavigate();

//   const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
//     setFormData((prev) => ({
//       ...prev,
//       [e.target.name]: e.target.value
//     }));
//   };

//   // Change to handle form submit instead of button click
//   const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
//     e.preventDefault();
    
//     setError('');
    
//     const userData = {
//       email,
//       password,
//     };
    
//     dispatch(login(userData));
//   };

//   useEffect(() => {
//     if (accessToken) {
//       navigate("/management");
//     }
//   }, [accessToken, navigate]);

//   useEffect(() => {
//     if (isError) {
//       setError(message || 'Invalid email or password');
//       dispatch(reset());
//     }
    
//     if (isSuccess && user) {
//       // Skip getUserInfo if not needed
//       navigate("/management");
//       dispatch(reset());
//     }
//   }, [isError, isSuccess, user, message, navigate, dispatch]);

//   return (
//     <Container maxW="1140px">
//       <Center flexBasis="50%">
//         <VStack maxW="500px" mt={100} rounded={8} p={8} border="1px solid" shadow="3px 3px 15px 5px rgb(75, 75, 79)">
//           <Heading fontSize={24}>Login</Heading>
          
//           {error && (
//             <Box
//               border="1px solid"
//               borderColor="red.500"
//               bg="red.100"
//               color="red.800"
//               p={3}
//               rounded={8}
//               mb={4}
//               w="100%"
//             >
//               {error}
//             </Box>
//           )}
      
//           {/* KEY CHANGE: Use actual <form> element */}
//           <form onSubmit={handleSubmit} style={{ width: '100%' }}>
//             <VStack p={4} rounded={8} w="100%">
//               <Input
//                 border="1px solid"
//                 type="email"
//                 placeholder="Email"
//                 name="email"
//                 id="email"
//                 autoComplete="email"
//                 onChange={handleChange}
//                 value={email}
//                 required
//               />
//               <PasswordInput
//                 border="1px solid"
//                 my={2}
//                 placeholder="Password"
//                 type="password"
//                 size="lg"
//                 onChange={handleChange}
//                 value={password}
//                 name="password"
//                 id="password"
//                 autoComplete="current-password"
//                 required
//               />
//               <Button 
//                 type="submit"
//                 w="100%"
//                 isLoading={isLoading}
//                 loadingText="Logging in..."
//               >
//                 Login
//               </Button>
//             </VStack>
//           </form>
          
//           <Text>
//             Forgot your password? <Link to="/reset-password">Reset Password</Link>
//           </Text>
          
//           <Text>
//             Don't have an account? <Link to="/register">Sign Up</Link>
//           </Text>
//         </VStack>
//       </Center>
//     </Container>
//   );
// };

// export default ShopLogin;
