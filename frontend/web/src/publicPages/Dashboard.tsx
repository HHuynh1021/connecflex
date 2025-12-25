import {Box, Container} from "@chakra-ui/react"
import { Outlet } from "react-router-dom"
import NavBarDashboard from "./NavBar-Dashboard"

const Dashboard:React.FC = () => {
    return (
        <Container maxW={'1100px'} p={"10px"}>
            <NavBarDashboard/>
            <Box p={"10px"}>
                <Outlet/>
            </Box>
        </Container>
    )
}
export default Dashboard