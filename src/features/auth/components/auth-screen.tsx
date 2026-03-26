"use client";
import React, { useState } from 'react'
import { SignInFlow } from './types';
import { SignInCard } from './sign-in-card';
import { SignUpCard } from './sign-up-card';

export const AuthScreen = () => {

    const [state, setState] = useState<SignInFlow>("signIn");

  return (
    <div className='min-h-screen flex items-center justify-center bg-muted/40 px-4 py-10'>
        <div className='w-full md:w-105'>
          {state === 'signIn' ? <SignInCard setState={setState} /> : <SignUpCard setState={setState} />}
        </div>
    </div>
  )
}
