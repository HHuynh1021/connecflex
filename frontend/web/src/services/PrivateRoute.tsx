import { Navigate } from 'react-router';
import { useSelector } from 'react-redux';
import type { ReactElement } from 'react';


const PrivateRoute = ({ element }: { element: ReactElement }) => {
  const { user } = useSelector((state: any) => state.auth);
  const _persist = useSelector((state: any) => state._persist);
  
  // Show loading while redux-persist is rehydrating
//   if (!_persist?.rehydrated) {
//     return (
//       <Center h="100vh">
//         <Spinner size="xl" />
//       </Center>
//     );
//   }
  
  if (!user) {
    return <Navigate to="/" replace />;
  }
  
  return element;
};

export default PrivateRoute;