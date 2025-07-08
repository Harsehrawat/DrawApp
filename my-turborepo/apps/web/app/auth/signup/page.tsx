"use client";

import { useState } from "react";
import axios from "axios";

import { BACKEND_URL, WEBSOCKET_URL } from "../../config";

async function handleSignIn(username: string, password: string, name: string) {
    try {
        const response = await axios.post(`${BACKEND_URL}/api/signup`, {
            username,
            password,
            name
        });

        if (response.data.success) {
            alert("Signup successful! User ID: " + response.data.userId);
            // You can redirect the user or reset form here
        } else {
            alert("Signup failed: " + response.data.message);
        }
    } catch (error: any) {
        if (error.response && error.response.data) {
            alert("Error: " + (error.response.data.message || "Unknown error"));
        } else {
            alert("Something went wrong");
        }
    }
}


export default function SignUpPage(){

    const [username, setUserName] = useState("");
    const [name, setName] = useState("");
    const [password, setPassword] = useState("");

    return (
        <div className="flex flex-center ">
            <div className="flex items-center justify-center">
                <div className="flex flex-col m-5">
                <p>Register to Continue</p>
                <div className=" m-3">
                    <input type="text" placeholder="username" value={username} onChange={ (e) => setUserName(e.target.value) } />
                    <input type="text" placeholder="password" value={password} onChange={ (e) => setPassword(e.target.value)}/>
                    <input type="text" placeholder="name" value={name} onChange={ (e) => setName(e.target.value) }/>
                </div>
                <button onClick={()=> handleSignIn(username,password,name)}> Register </button>
                </div>
            </div>
        </div>
    )
}