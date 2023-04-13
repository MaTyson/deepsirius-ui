import type { GetServerSidePropsContext } from "next";
import { getServerSession } from "next-auth";
import { signIn } from "next-auth/react";
import { useRouter } from "next/router";
import { useState } from "react";
import { type SubmitHandler, useForm } from "react-hook-form";
import { Layout } from "~/components/layout";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { authOptions } from "~/server/auth";
import { Icons } from "~/components/icons";

type FormData = {
  email: string;
  password: string;
};

export function Form() {
  const router = useRouter();
  // const { callbackUrl } = router.query || "/foo";
  const callbackUrl = "/foo";
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>();
  const onSubmit: SubmitHandler<FormData> = async (data) => {
    try {
      const res = await signIn("credentials", {
        email: data.email,
        password: data.password,
        callbackUrl: callbackUrl,
        redirect: false,
      });
      if (!res?.error) {
        await router.push(callbackUrl);
      } else {
        setError("Invalid email or password!");
      }
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <form
      className="w-full space-y-12 sm:w-[400px]"
      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      onSubmit={handleSubmit(onSubmit)}
    >
      <div className="grid items-center justify-center">
        <Icons.logo />
      </div>
      <h1 className="mb-2 flex justify-center text-xl font-semibold">
        <span className="text-fuchsia-600 dark:text-fuchsia-500">Deep</span>
        Sirius
      </h1>
      {error && (
        <div className="flex w-full items-center justify-center rounded-sm bg-red-700 font-semibold text-white">
          <p role="alert">{error}</p>
        </div>
      )}
      <div className="grid w-full items-center gap-1.5">
        <Label htmlFor="email">Email</Label>
        {errors.email && (
          <p role="alert" className="text-red-600">
            {errors.email?.message}
          </p>
        )}
        <Input
          placeholder="user.name@example.com"
          {...register("email", { required: "Email is required!" })}
        />
      </div>
      <div className="grid w-full items-center gap-1.5">
        <Label htmlFor="password">Password</Label>
        {errors.password && (
          <p role="alert" className="text-red-600">
            {errors.password?.message}
          </p>
        )}
        <Input
          type="password"
          placeholder="Password"
          {...register("password", { required: "Password is required!" })}
        />
        </div>
        <Button className="w-full" type="submit">
          Sign in
        </Button>
      
      <h5 className="flex justify-center text-slate-400 text-sm">Developed by DAP</h5>
    </form>
  );
}

export default function SignIn() {
  return (
    <Layout>
      <div className="flex h-screen w-screen items-center justify-center">
        <div className="space-y-12 rounded-xl px-8 pb-8 pt-12 dark:bg-slate-900 sm:shadow-xl dark:sm:shadow-xl dark:sm:shadow-slate-700">
          <Form />
        </div>
      </div>
    </Layout>
  );
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const session = await getServerSession(context.req, context.res, authOptions);

  // If the user is already logged in, redirect.
  // Note: Make sure not to redirect to the same page
  // To avoid an infinite loop!
  if (session) {
    return { redirect: { destination: "/foo" } };
  }

  return {
    props: {
      session,
    },
  };
}
