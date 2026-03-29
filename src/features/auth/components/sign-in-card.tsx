
import React, { useState } from 'react'

import { FcGoogle } from "react-icons/fc";

import { FaGithub } from "react-icons/fa";
import { Card, CardHeader, CardDescription, CardContent, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { SignInFlow } from './types';

import { useAuthActions } from "@convex-dev/auth/react";
import { Eye, EyeOff, TriangleAlert } from 'lucide-react';
import { getAuthErrorMessage, getProviderErrorMessage } from '../auth-error';

interface SignInCardProps {
    setState: React.Dispatch<React.SetStateAction<SignInFlow>>;
}


export const SignInCard = ({ setState }: SignInCardProps) => {
    

     const { signIn } = useAuthActions();

    const [email,setEmail]=useState("");
    const [password,setPassword]=useState("");
    const [error,setError]=useState("");

    const [showPassword, setShowPassword] = useState(false);

    const [pending,setPending]=useState(false);

    const onPasswordSignIn=(e:React.FormEvent<HTMLFormElement>)=>{
        e.preventDefault();

        setError("");
        setPending(true);
        signIn("password",{email,password,flow:"signIn"})
        .catch((err)=>{
            setError(getAuthErrorMessage(err, { flow: "signIn" }));

        })  
        .finally(()=>{
            setPending(false);
        })

    }

    const onProviderSignIn=(value:"github" | "google")=>
    {
        setError("");
        setPending(true);
        signIn(value)
        .catch((err)=>{
            setError(getProviderErrorMessage(value));
            void err;
        })
        .finally(()=>{
            setPending(false);
        })

    };

    return (
        <Card className='w-full p-8'>
            <CardHeader>
                <div className='text-sm font-semibold tracking-tight text-muted-foreground'>Slack Lite</div>
                <CardTitle className='text-2xl'>Sign in to your workspace</CardTitle>
                <CardDescription>Use your email address and password, or continue with a provider.</CardDescription>

            </CardHeader>

            {!!error && (
                <div role='alert' aria-live='polite' className='bg-destructive/15 p-3 rounded-md flex items-center gap-x-2 text-sm text-destructive mb-6'>
                    <TriangleAlert className='size-4'/>
                    <p>{error}</p>
                </div>
            )}


            <CardContent className='space-y-5 px-0 pb-0'>
                <form onSubmit={onPasswordSignIn} className='space-y-4' >

                    <div className='space-y-2'>
                        <label className='text-sm font-medium' htmlFor='email'>Email</label>
                        <Input
                            id='email'
                            autoComplete='email'
                            disabled={pending}
                            value={email}
                            onChange={(e) => {
                                setEmail(e.target.value);
                                if (error) setError("");
                            }}
                            placeholder='name@company.com'
                            type='email'
                            required
                        />
                    </div>

                    <div className='space-y-2'>
                        <label className='text-sm font-medium' htmlFor='password'>Password</label>
                        <div className='relative'>
                            <Input
                                key={showPassword ? 'password:text' : 'password:password'}
                                id='password'
                                autoComplete='current-password'
                                disabled={pending}
                                value={password}
                                onChange={(e) => {
                                    setPassword(e.target.value);
                                    if (error) setError("");
                                }}
                                placeholder='Enter your password'
                                type={showPassword ? 'text' : 'password'}
                                className='pr-10'
                                required
                            />

                            <Button
                                type='button'
                                variant='ghost'
                                size='icon'
                                disabled={pending}
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={() => setShowPassword((v) => !v)}
                                aria-pressed={showPassword}
                                aria-label={showPassword ? 'Hide password' : 'Show password'}
                                className='absolute right-1 top-1/2 z-10 -translate-y-1/2 text-muted-foreground hover:text-foreground'
                            >
                                {showPassword ? <EyeOff /> : <Eye />}
                            </Button>
                        </div>
                    </div>

                    <Button type="submit" className='w-full' size='lg' disabled={pending}>
                        Sign in
                    </Button>
                </form>

                <div className='relative'>
                    <div className='absolute inset-0 flex items-center'>
                        <Separator />
                    </div>
                    <div className='relative flex justify-center text-xs uppercase'>
                        <span className='bg-card px-2 text-muted-foreground'>or</span>
                    </div>
                </div>
                <div className='flex flex-col gap-y-2.5'>
                    <Button

                        disabled={pending}
                        onClick={() => onProviderSignIn("google")}
                        variant="outline"
                        size="lg"
                        className='w-full relative bg-card cursor-pointer'
                    >
                        <FcGoogle className='size-5 absolute top-2.5 left-2.5' />
                        Continue with Google
                    </Button>

                    <Button

                        disabled={pending}
                        onClick={() => onProviderSignIn("github")}
                        variant="outline"
                        size="lg"
                        className='w-full relative bg-card cursor-pointer'
                    >
                        <FaGithub className='size-5 absolute top-2.5 left-2.5' />
                        Continue with GitHub
                    </Button>

                </div>

                <p className='text-xs text-muted-foreground'>
                    Don&apos;t have an account?
                    <span onClick={() => setState("signUp")} className='text-primary hover:underline cursor-pointer'>  Sign up</span>
                </p>
            </CardContent>

        </Card>
    )
}
