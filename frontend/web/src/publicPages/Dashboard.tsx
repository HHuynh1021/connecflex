import {Box} from "@chakra-ui/react"
import { Outlet } from "react-router-dom"
import NavBarDashboard from "./NavBar-Dashboard"

const Dashboard:React.FC = () => {
    return (
        <Box w={'100%'} maxW={"100vw"}>
            <NavBarDashboard/>
            <Box p={"10px"}>
                <Outlet/>
            </Box>
        </Box>
    )
}
export default Dashboard