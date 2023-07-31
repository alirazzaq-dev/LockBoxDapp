import { Box } from '@chakra-ui/react'
import Header from '../Components/Header'
import Create from '../Components/Create'
import LockBoxs from '../Components/LockBoxs'

export default function Home() {

    return (
    <Box>
        <Header />
        <Create />
        <LockBoxs />
    </Box>
  )
}
