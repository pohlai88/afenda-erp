import { getPostSignInDestination, getSession } from "@afenda/auth/server";
import { redirect } from "next/navigation";
import { Suspense } from "react";

export default function HomePage() {
  return (
    <Suspense fallback={null}>
      <HomeRedirect />
    </Suspense>
  );
}

async function HomeRedirect(): Promise<null> {
  const session = await getSession();

  redirect(session ? getPostSignInDestination(session) : "/sign-in");
  return null;
}
