import React,{useState} from 'react'
import { useQuery,useMutation } from '@tanstack/react-query'
import axios from 'axios'
import { useQueryClient } from '@tanstack/react-query'


function TanStack() {

    const queryClient=useQueryClient()

    const [formdata,setformdata]=useState({username:'',subject:'',data:'',})

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setformdata({...formdata,[name]:value})
    };

    const submitdata=(e)=>{
        e.preventDefault()
        mutate()
    }

    const getinfo=async()=>{
    const response=await axios.get('http://localhost:8000/community/Getdata',{withCredentials:true})
    console.log(response.data.data)
    return response.data.data
    }

    const {data:listdata,isLoading,isError,error,refetch:reacall}=useQuery({
        queryKey:['listdata'],
        queryFn:getinfo,
        staleTime:5000 * 100,
    })

    const addpost=()=>{
        return axios.post(`http://localhost:8000/community/Postdata`,{
            heading:formdata.subject,
            data:formdata.data,
            username:formdata.username
        },{withCredentials:true})
    }

    const {mutate,isLoading:koadhai,isError:errorHo,error:bug1}=useMutation({
        mutationFn:addpost,
        onSuccess:()=>{
            queryClient.invalidateQueries(['listdata'])
            setformdata({username:'',subject:'',data:''})
        }
    })

    if (isLoading) {
        return (
          <>
           {[...Array(10)].map((_,index)=>(
            <div className="bg-white p-6 rounded-lg shadow-lg animate-pulse" key={index}>
            <div className="flex flex-col gap-4">
              <div className="w-48 h-6 bg-gray-200 rounded-md"></div>
              
              <div className="w-32 h-5 bg-gray-200 rounded-md"></div>

              <div className="w-full h-4 bg-gray-200 rounded-md"></div>
              <div className="w-full h-4 bg-gray-200 rounded-md"></div>
            </div>
          </div>
           ))
           }
          </>
        );
      }
      

  return (
    <>
   <div className="mt-16">

  <div className="max-w-2xl mx-auto p-3 bg-white rounded-lg shadow-lg">
    <form className="space-y-6" onSubmit={(e)=>submitdata(e)}>

      <div>
        <label htmlFor="username" className="block text-lg font-semibold text-gray-700">Username</label>
        <input
          value={formdata.username}
          onChange={handleInputChange}
          name="username"
          type="text"
          placeholder="Enter username"
          className="w-full p-2 mt-2 bg-gray-100 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div>
        <label htmlFor="subject" className="block text-lg font-semibold text-gray-700">Subject</label>
        <input
            value={formdata.subject}
            onChange={handleInputChange}
          name="subject"
          type="text"
          placeholder="Enter subject"
          className="w-full p-2 mt-2 bg-gray-100 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div>
        <label htmlFor="data" className="block text-lg font-semibold text-gray-700">Data</label>
        <textarea
            value={formdata.data}
            onChange={handleInputChange}
          name="data"
          rows="2"
          placeholder="Enter additional information"
          className="w-full p-4 mt-2 bg-gray-100 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
        ></textarea>
      </div>

      <div className="flex justify-center">
        <button
          type="submit"
          className="w-48 py-1.5 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition"
        >
          Add User
        </button>
      </div>
    </form>
  </div>

  
  {
    !isError ? <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 px-4 mt-4">
    {listdata.map((item, index) => (
      <div className="bg-white p-6 rounded-lg shadow-lg transition transform hover:scale-105 hover:shadow-xl" key={index}>
        <div className="flex flex-col gap-4">
          <div className="text-xl font-semibold text-gray-800">{item.username}</div>
          <div className="text-sm text-gray-600 font-medium">{item.subject}</div>
          <div className="text-gray-500">{item.data}</div>
        </div>
      </div>
    ))}
  </div>:null
  }
</div>


    </>
  )
}

export default TanStack