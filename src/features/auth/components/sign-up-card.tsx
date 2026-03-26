
import { useState } from 'react';
import { FcGoogle } from "react-icons/fc";

import { FaGithub } from "react-icons/fa";

import { Card, CardHeader, CardDescription, CardContent, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { SignInFlow } from './types';

interface SignUpCardProps {
    setState: React.Dispatch<React.SetStateAction<SignInFlow>>;
}


export const SignUpCard = ({ setState }: SignUpCardProps) => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");


    return (
        <Card className='w-full p-8'>
            <CardHeader>
                <div className='text-sm font-semibold tracking-tight text-muted-foreground'>Slack Lite</div>
                <CardTitle className='text-2xl'>Create your account</CardTitle>
                <CardDescription>Sign up with email, or continue with a provider.</CardDescription>

            </CardHeader>


            <CardContent className='space-y-5 px-0 pb-0'>
                <form className='space-y-4' onSubmit={(e) => e.preventDefault()}>

                    <div className='space-y-2'>
                        <label className='text-sm font-medium' htmlFor='email'>Email</label>
                        <Input
                            id='email'
                            autoComplete='email'
                            disabled={false}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder='name@company.com'
                            type='email'
                            required
                        />
                    </div>

                    <div className='space-y-2'>
                        <label className='text-sm font-medium' htmlFor='password'>Password</label>
                        <Input
                            id='password'
                            autoComplete='new-password'
                            disabled={false}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder='Create a password'
                            type='password'
                            required
                        />
                    </div>

                    <div className='space-y-2'>
                        <label className='text-sm font-medium' htmlFor='confirmPassword'>Confirm password</label>
                        <Input
                            id='confirmPassword'
                            autoComplete='new-password'
                            disabled={false}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder='Re-enter your password'
                            type='password'
                            required
                        />
                    </div>

                    <Button type="submit" className='w-full' size='lg' disabled={false}>
                        Create account
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

                        disabled={false}
                        onClick={() => { }}
                        variant="outline"
                        size="lg"
                        className='w-full relative bg-card'
                    >
                        <FcGoogle className='size-5 absolute top-2.5 left-2.5' />
                        Continue with Google
                    </Button>

                    <Button

                        disabled={false}
                        onClick={() => { }}
                        variant="outline"
                        size="lg"
                        className='w-full relative bg-card'
                    >
                        <FaGithub className='size-5 absolute top-2.5 left-2.5' />
                        Continue with GitHub
                    </Button>

                </div>

                <p className='text-xs text-muted-foreground'>
                    Already have an account?
                    <span onClick={() => setState("signIn")} className='text-primary hover:underline cursor-pointer'>  Sign in</span>
                </p>
            </CardContent>

        </Card>
    )
}
