
import { useMemo, useState } from 'react';
import { FcGoogle } from "react-icons/fc";

import { FaGithub } from "react-icons/fa";

import { Card, CardHeader, CardDescription, CardContent, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { SignInFlow } from './types';
import { Check, Eye, EyeOff, TriangleAlert, X } from 'lucide-react';
import { useAuthActions } from "@convex-dev/auth/react";
import { getAuthErrorMessage, getProviderErrorMessage } from '../auth-error';
import { SlackLiteMark } from "@/components/brand";


interface SignUpCardProps {
    setState: React.Dispatch<React.SetStateAction<SignInFlow>>;
}


export const SignUpCard = ({ setState }: SignUpCardProps) => {
    const { signIn } = useAuthActions();

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [pending, setPending] = useState(false);

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const passwordRequirements = useMemo(() => {
        const trimmed = password.trim();
        const noOuterSpaces = password === trimmed;
        const minLength = trimmed.length >= 8;
        const hasUpper = /[A-Z]/.test(trimmed);
        const hasLower = /[a-z]/.test(trimmed);
        const hasNumber = /\d/.test(trimmed);
        const hasSymbol = /[^A-Za-z0-9]/.test(trimmed);
        const hasNumberOrSymbol = hasNumber || hasSymbol;
        return {
            noOuterSpaces,
            minLength,
            hasUpper,
            hasLower,
            hasNumberOrSymbol,
            isValid: noOuterSpaces && minLength && hasUpper && hasLower && hasNumberOrSymbol,
        };
    }, [password]);

    const passwordsMatch = password === confirmPassword;
    const shouldShowMismatch = confirmPassword.length > 0 && !passwordsMatch;
    const canSubmit =
        !pending &&
        name.trim().length > 0 &&
        email.trim().length > 0 &&
        passwordRequirements.isValid &&
        confirmPassword.length > 0 &&
        passwordsMatch;


    const onPasswordSignUp = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        setError("");

        if (name.trim().length === 0) {
            setError("Please enter your name.");
            return;
        }

        if (!passwordRequirements.isValid) {
            setError(
                "Password must be at least 8 characters, include uppercase + lowercase, include a number or symbol, and not start/end with spaces.",
            );
            return;
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        setPending(true);
        signIn("password", { name,email, password, flow: "signUp" })
            .catch((err) => {
                setError(getAuthErrorMessage(err, { flow: "signUp" }));
            })
            .finally(() => {
                setPending(false);
            })

    }

    const onProviderSignUp = (value: "github" | "google") => {
        setError("");
        setPending(true);
        signIn(value)
            .catch((err) => {
                setError(getProviderErrorMessage(value));
                void err;
            })
            .finally(() => {
                setPending(false);
            })

    };


    return (
        <Card className='w-full p-8'>
            <CardHeader>
                <div className='text-sm font-semibold tracking-tight text-muted-foreground flex items-center gap-2'>
                    <SlackLiteMark className="size-6" />
                    Slack-Lite
                </div>
                <CardTitle className='text-2xl'>Create your account</CardTitle>
                <CardDescription className='text-sm'>Sign up with email, or continue with a provider.</CardDescription>

            </CardHeader>

            {!!error && (
                <div role='alert' aria-live='polite' className='bg-destructive/15 p-3 rounded-md flex items-center gap-x-2 text-sm text-destructive mb-6'>
                    <TriangleAlert className='size-4' />
                    <p>{error}</p>
                </div>
            )}


            <CardContent className='space-y-5 px-0 pb-0'>
                <form onSubmit={onPasswordSignUp} className='space-y-4' >


                    <div className='space-y-2'>
                        <label className='text-sm font-medium' htmlFor='name'>Name</label>
                        <Input
                            id='name'
                            autoComplete='name'
                            disabled={pending}
                            value={name}
                            onChange={(e) => {
                                setName(e.target.value);
                                if (error) setError("");
                            }}
                            placeholder='Your name'
                            type='text'
                            required
                        />
                    </div>


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
                                autoComplete='new-password'
                                disabled={pending}
                                value={password}
                                onChange={(e) => {
                                    setPassword(e.target.value);
                                    if (error) setError("");
                                }}
                                placeholder='Create a password'
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

                        <div className='rounded-md border bg-muted/30 p-3'>
                            <p className='text-xs font-medium'>Password requirements</p>
                            <div className='mt-2 space-y-1'>
                                <PasswordRequirementRow
                                    label='No leading or trailing spaces'
                                    met={passwordRequirements.noOuterSpaces}
                                />
                                <PasswordRequirementRow
                                    label='At least 8 characters'
                                    met={passwordRequirements.minLength}
                                />
                                <PasswordRequirementRow
                                    label='One uppercase letter (A–Z)'
                                    met={passwordRequirements.hasUpper}
                                />
                                <PasswordRequirementRow
                                    label='One lowercase letter (a–z)'
                                    met={passwordRequirements.hasLower}
                                />
                                <PasswordRequirementRow
                                    label='One number or symbol'
                                    met={passwordRequirements.hasNumberOrSymbol}
                                />
                            </div>
                        </div>
                    </div>

                    <div className='space-y-2'>
                        <label className='text-sm font-medium' htmlFor='confirmPassword'>Confirm password</label>
                        <div className='relative'>
                            <Input
                                key={showConfirmPassword ? 'confirm:text' : 'confirm:password'}
                                id='confirmPassword'
                                autoComplete='new-password'
                                disabled={pending}
                                value={confirmPassword}
                                onChange={(e) => {
                                    setConfirmPassword(e.target.value);
                                    if (error) setError("");
                                }}
                                placeholder='Re-enter your password'
                                type={showConfirmPassword ? 'text' : 'password'}
                                className='pr-10'
                                required
                            />

                            <Button
                                type='button'
                                variant='ghost'
                                size='icon'
                                disabled={pending}
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={() => setShowConfirmPassword((v) => !v)}
                                aria-pressed={showConfirmPassword}
                                aria-label={showConfirmPassword ? 'Hide password confirmation' : 'Show password confirmation'}
                                className='absolute right-1 top-1/2 z-10 -translate-y-1/2 text-muted-foreground hover:text-foreground'
                            >
                                {showConfirmPassword ? <EyeOff /> : <Eye />}
                            </Button>
                        </div>

                        {shouldShowMismatch && (
                            <p className='text-xs text-destructive'>Passwords do not match.</p>
                        )}
                    </div>

                    <Button type="submit" className='w-full' size='lg' disabled={!canSubmit}>
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

                        disabled={pending}
                        onClick={() => onProviderSignUp('google')}
                        variant="outline"
                        size="lg"
                        className='w-full relative bg-card'
                    >
                        <FcGoogle className='size-5 absolute top-2.5 left-2.5' />
                        Continue with Google
                    </Button>

                    <Button

                        disabled={pending}
                        onClick={() => onProviderSignUp('github')}
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

function PasswordRequirementRow({ label, met }: { label: string; met: boolean }) {
    const Icon = met ? Check : X;
    return (
        <div className='flex items-center gap-x-2'>
            <Icon className={met ? 'size-4 text-primary' : 'size-4 text-muted-foreground'} />
            <p className={met ? 'text-xs text-foreground' : 'text-xs text-muted-foreground'}>
                {label}
            </p>
        </div>
    );
}
