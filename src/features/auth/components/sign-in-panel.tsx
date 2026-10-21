"use client";

import { SignIn, SignUp } from '@clerk/nextjs';

/** Clerk's sign-in form on `/{language}/sign-in`, the fallback when the header modal isn't used. */
export function SignInPanel({ language }: { language: string }) {
  return <SignIn routing="path" path={`/${language}/sign-in`} signUpUrl={`/${language}/sign-up`} withSignUp />;
}

/** Clerk's sign-up form on `/{language}/sign-up`. With Google only, it is the same one-tap flow. */
export function SignUpPanel({ language }: { language: string }) {
  return <SignUp routing="path" path={`/${language}/sign-up`} signInUrl={`/${language}/sign-in`} />;
}
