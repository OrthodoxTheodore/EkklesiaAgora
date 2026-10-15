import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { SignInForm } from "./SignInForm";

export const metadata: Metadata = { title: "Sign In" };

export default function SignInPage() {
  return (
    <>
      <PageHeader eyebrow="Welcome Back" title="Sign In" />
      <section className="mx-auto max-w-md px-4 py-16">
        <SignInForm />
      </section>
    </>
  );
}
