import {useAuth} from "../hooks/useAuth";
import { Navigate } from "react-router";
import React from 'react'

const Pro = ({children}) => {
    const {loading,user}=useAuth()

    if(loading){
        return(<main>Loading...</main>)
    }
    if(user){
        return <Navigate to={'/'}/>
    }
    return children
}

export default Pro
