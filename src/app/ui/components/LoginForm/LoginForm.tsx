'use client';
import React, { useState } from 'react';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { zodResolver } from '@hookform/resolvers/zod';
import { signIn } from 'next-auth/react';
import { useForm, SubmitHandler } from 'react-hook-form';

import { ButtonSpinner, InputError, Snackbar } from '@/app/ui/components';
import { LoginSchema, Inputs } from '@/app/ui/components/LoginForm/schema/loginSchema';
import { EnvelopeIcon, LockIcon, ArrowLeftIcon, EyeIcon, EyeOffIcon } from '@/app/ui/icons';

import { mrGomaLogo } from '#public/assets/images/Logo';

const LoginForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(false);
  const [passwordVisibility, setPasswordVisibility] = useState(true);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Inputs>({
    resolver: zodResolver(LoginSchema),
    mode: 'onSubmit',
  });

  const processForm: SubmitHandler<Inputs> = async loginData => {
    setIsLoading(true);
    setError(false);

    try {
      const res = await signIn('credentials', {
        callbackUrl: '/suppliers/login',
        email: loginData.email,
        password: loginData.password,
        redirect: false,
      });

      if (res?.error) {
        setError(true);
      } else {
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full sm:max-w-lg px-8">
      <div className="flex justify-center mb-16 lg:hidden">
        <Link href="/">
          <Image
            alt="MrGoma Tires logo"
            title="Go to the home page"
            aria-label="Go to the home page"
            src={mrGomaLogo || '/placeholder.svg'}
            className="h-8 w-auto"
            priority
          />
        </Link>
      </div>
      <form className="w-full" onSubmit={handleSubmit(processForm)}>
        <div className="flex justify-between items-start">
          <div className="mb-0">
            <h3 className="text-2xl font-medium text-white mb-1.5">Seller Portal</h3>
            <h5 className="text-slate-400 font-light text-xs mb-8">
              Sign in with your employee account
            </h5>
          </div>
          <div>
            <Link
              className="text-slate-400 flex text-[11px] items-center border border-slate-400 hover:border-[#9dfb40] rounded-xl px-2 py-0.5 hover:text-[#9dfb40]"
              href="/"
            >
              <ArrowLeftIcon className="mr-2" size={14} />
              Home
            </Link>
          </div>
        </div>

        <div className="mb-4 relative">
          <label className="text-sm mb-2 block text-slate-400" htmlFor="email">
            <span className="text-lime-400 mr-2">*</span>
            User
          </label>
          <div className="relative">
            <input
              id="email"
              {...register('email')}
              type="text"
              autoComplete="off"
              className="w-full pl-10 text-white bg-slate-800 rounded-md py-2 px-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2 transition-shadow placeholder:text-sm font-light"
            />
            <EnvelopeIcon className="text-slate-400 absolute top-1/2 left-3 transform -translate-y-1/2 h-4 w-4" />
          </div>
          <InputError message={errors?.email?.message} />
        </div>
        <div className="mb-4">
          <label className="text-sm mb-2 block text-slate-400" htmlFor="password">
            <span className="text-lime-400 mr-2">*</span>
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              {...register('password')}
              type={passwordVisibility ? 'password' : 'text'}
              autoComplete="off"
              className="w-full bg-slate-800 pl-10 pr-10 text-white rounded-md py-2 px-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2 transition-shadow border border-transparent placeholder:text-sm font-light"
            />
            <LockIcon
              className="text-slate-400 absolute top-1/2 left-3 transform -translate-y-1/2"
              size={20}
            />
            {passwordVisibility ? (
              <span
                onClick={() => setPasswordVisibility(false)}
                className="text-slate-400 absolute top-1/2 right-3 transform -translate-y-1/2 "
              >
                <EyeOffIcon size={20} />
              </span>
            ) : (
              <span
                onClick={() => setPasswordVisibility(true)}
                className="text-slate-400 absolute top-1/2 right-3 transform -translate-y-1/2 "
              >
                <EyeIcon size={20} />
              </span>
            )}
          </div>
        </div>
        <div className="mt-6">
          {isLoading ? (
            <ButtonSpinner text={'Logging in…'} />
          ) : (
            <button className="w-full py-2 text-base font-medium rounded-lg transition-colors bg-[#9dfb40] text-black cursor-pointer">
              Login
            </button>
          )}
        </div>
      </form>
      {error && <Snackbar type={'warning'} message={'Invalid email or password.'} />}
    </div>
  );
};

export default LoginForm;
