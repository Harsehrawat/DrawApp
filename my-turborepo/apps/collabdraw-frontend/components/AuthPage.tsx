"use client";

import React from "react";

function verifySignin(){

}
function verifySignup(){

}

export function AuthPage({ isSignin }: { isSignin: boolean }) {
  return (
    <div className="w-screen h-screen flex justify-center items-center bg-gray-100">
      <div className="p-6 bg-white flex flex-col border border-black rounded shadow-md min-w-[300px]">
        <div className="space-y-4 mb-6">
          <div className="border border-black rounded px-3 py-2">
            <input
              type="text"
              placeholder="Email"
              className="w-full outline-none"
            />
          </div>
            {!isSignin && <div className="border border-black rounded px-3 py-2"> 
                <input
                type="text"
                placeholder="Name"
                className="w-full outline-none"
                />
            </div>}
          <div className="border border-black rounded px-3 py-2">
            <input
              type="password"
              placeholder="Password"
              className="w-full outline-none"
            />
          </div>
        </div>
        <button
          onClick={() => { isSignin? verifySignin : verifySignup }}
          className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 rounded border border-black transition-colors"
        >
          {isSignin ? "Sign In" : "Sign Up"}
        </button>
      </div>
    </div>
  );
}
