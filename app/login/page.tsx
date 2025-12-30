import LoginClient from "./login-client";

type LoginPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const resolved = searchParams ? await searchParams : undefined;
  const next = resolved?.next;
  const nextPath = Array.isArray(next) ? next[0] : next;
  return <LoginClient nextPath={nextPath ?? "/"} />;
}
