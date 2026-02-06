'use client';
import React, { useState } from "react";
import { LoginSchema, Inputs } from '@/app/ui/components/LoginForm/schema/loginSchema';
import { signIn } from 'next-auth/react';
import { useForm, Controller, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {InputError} from '@/app/ui/components';
import { useRouter } from 'next/navigation';

const LoginForm = () => {

  const [isLoading, setIsLoading] = useState(false);
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
    if(loginData){
      const res = await signIn("credentials", {
        callbackUrl: "/suppliers/login",
        email: loginData.email,
        password: loginData.password,
        redirect: false
      });
      res.error ? console.log("Email o contraseña incorrectos") : router.push("/dashboard")
    }
  };

  return (
    <div className="w-full max-w-96">
      <form className="w-full" onSubmit={handleSubmit(processForm)}>
        <h3 className="text-3xl font-medium text-center mb-8  text-[#272727]">Seller Portal</h3>
        <div className="mb-4">
          <label className="text-sm font-medium text-gray-700 mb-2 block" htmlFor="">
            <span className="text-lime-400 mr-2">*</span>
            Usuario
          </label>
          <input
            {...register('email')}
            type="text"
            autoComplete="off"
            className={`w-full bg-white rounded-md py-2 px-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white transition-shadow border border-gray-300
                }`}
          />
          <InputError message={errors?.email?.message} />
        </div>
        <div className="mb-4">
          <label className="text-sm font-medium text-gray-700 mb-2 block" htmlFor="">
            <span className="text-lime-400 mr-2">*</span>
            Contraseña
          </label>
          <input
            {...register('password')}
            type="password"
            autoComplete="off"
            className={`w-full bg-white rounded-md py-2 px-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white transition-shadow border border-gray-300
                }`}
          />
          <InputError message={errors?.password?.message} />
        </div>
        <button className="w-full py-2 text-lg font-medium rounded-lg transition-colors bg-green-600 hover:bg-green-700 text-white cursor-pointer">
          Login
        </button>
      </form>
    </div>
  );
};

export default LoginForm;
