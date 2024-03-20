import { ArrowRightIcon } from 'lucide-react';
import { type NextPage } from 'next';
import { signIn } from 'next-auth/react';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import { AvatarDrop } from '~/components/avatar-dropdown';
import { Layout } from '~/components/layout';
import { useUser } from '~/hooks/use-user';

const AuthShowcase: React.FC = () => {
  const user = useUser();

  if (!user)
    return (
      <button
        className=" w-3/4 rounded-full bg-white/10 px-10 py-3 font-semibold text-white no-underline transition hover:bg-white/20"
        onClick={() => void signIn(undefined)}
      >
        {'Sign in'}
      </button>
    );

  return (
    <Link
      href={user.route}
      className="w-3/4 text-center rounded-full bg-slate-300 bg-opacity-10 px-10 py-3 font-semibold text-slate-300 no-underline transition hover:bg-white/20"
    >
      <span>My Workspaces</span>
      <ArrowRightIcon className="ml-2 inline-block h-5 w-5 text-white" />
    </Link>
  );
};

const Home: NextPage = () => {
  return (
    <Layout>
      <Head>
        <title>DeepSirius UI</title>
        <meta
          name="DeepSirius"
          content="Interface for using the deepsirius package on the web."
        />
        <link rel="icon" href="/icon.svg" />
      </Head>
      <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-[#9994D7] via-[#6012E4] to-[#0B0C1B] dark:bg-gradient-to-br dark:from-[#0B0C1B] dark:via-[#6012E4] dark:to-[#9994D7]">
        <div className="absolute top-0 right-0 m-5 z-10">
          <AvatarDrop />
        </div>
        <div className="container flex lg:flex-row flex-col items-center justify-center lg:gap-12 px-4 py-16 ">
          <Image
            src="/full-transp.svg"
            alt="DeepSirius Logo"
            width={500}
            height={500}
          />
          <div className="flex flex-col items-center gap-12">
            <h1 className="text-5xl font-extrabold tracking-tight sm:text-[5rem] text-center">
              <span className="text-slate-900 dark:text-slate-300">Deep</span>
              <span className="text-slate-300 dark:text-slate-900">Sirius</span>
            </h1>
            <AuthShowcase />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Home;
