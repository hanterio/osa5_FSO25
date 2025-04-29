import axios from 'axios'
const baseUrl = '/api/login'

const login = async credentials => {
  console.log('Sending login request with credentials:', credentials)
  const response = await axios.post(baseUrl, credentials)
  console.log('Response from login:', response.data)
  return response.data
}

export default { login }
