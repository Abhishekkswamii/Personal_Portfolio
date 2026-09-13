"use client";

import { useActionState } from "react";
import { signIn, type ActionResult } from "@/app/admin/actions";

const INPUT =
  "w-full rounded-lg border border-neutral-300 bg-white px-3 py-2.5 text-[0.9375rem] outline-none transition-colors focus:border-neutral-900 focus:ring-2 focus:ring-neutral-900/10";

export function LoginForm() {
  const [state, formAction, pending] = useActionState<ActionResult | null, FormData>(
    signIn,
    null,
  );

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div>
        <label htmlFor="email" className="block text-[0.8125rem] font-medium">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="username"
          required
          className={`${INPUT} mt-1.5`}
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-[0.8125rem] font-medium">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className={`${INPUT} mt-1.5`}
        />
      </div>

      {state && !state.ok ? (
        <p role="alert" className="text-[0.8125rem] text-red-600">
          {state.message}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="mt-1 rounded-lg bg-neutral-900 px-4 py-2.5 text-[0.875rem] font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
