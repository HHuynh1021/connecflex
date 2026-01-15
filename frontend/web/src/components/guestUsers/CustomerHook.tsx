import { apiPublic } from '@/services/api'
import { Box } from '@chakra-ui/react'
import {useEffect, useState}from 'react'

interface CustomerProp {
    ful_name: string
    birth_date: string
    email: string
    phone: string
    address: string
    contact: string
    avata: string
    created_at: string

}

const useCustomer = () => {
    const [customers, setCustomers] = useState<CustomerProp[]>([])
    const [loading, setLoading] = useState<boolean>(false)

    const fetchCustomerInfo = async () => {
        setLoading(true)
        try {
            const url = `${import.meta.env.VITE_API_BASE_URL}/customer/guest-user-list/`
            const response = await apiPublic.get(url)
            console.log("customer data: ", response.data)
            const data = Array.isArray(response.data) ? response.data : []
            setCustomers(data)
        }catch(error: any){
            console.log("list user info error", error.respone.data || error.message)
        }finally{
            setLoading(false)
        }
        
    }
    useEffect(()=> {
        fetchCustomerInfo()
    },[])
  return ({customers, loading}
  )
}

export default useCustomer