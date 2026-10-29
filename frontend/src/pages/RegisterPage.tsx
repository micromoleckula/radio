import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { FormField } from "../shared/ui/FormField";
import { Notice } from "../shared/ui/Notice";
import { useRegister } from "../features/auth/hooks/useAuth";
import {
  registerSchema,
  type RegisterType,
} from "../features/auth/validation/auth.schema";

export const RegisterPage = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterType>({
    resolver: zodResolver(registerSchema),
  });

  const { mutate: registerAccount, isPending, error: apiError } = useRegister();

  const onSubmit = (data: RegisterType) => {
    registerAccount(data);
  };

  return (
    <form
      onSubmit={(event) => {
        void handleSubmit(onSubmit)(event);
      }}
      className="flex w-full flex-col gap-4"
    >
      <div className="mb-1">
        <p className="mb-2 text-xs font-semibold uppercase tracking-kicker text-emerald-400">
          Make it yours
        </p>
        <h1 className="text-2xl font-bold tracking-tight">
          Create your account
        </h1>
        <p className="mt-2 text-sm leading-6 text-zinc-400">
          Build a library around the music you want to hear.
        </p>
      </div>

      {apiError && <Notice tone="error">{apiError.message}</Notice>}

      <FormField error={errors.email?.message} label="Email">
        <input
          {...register("email")}
          type="email"
          autoComplete="email"
          aria-invalid={Boolean(errors.email)}
          placeholder="you@example.com"
          className="rounded-lg border border-white/10 bg-black/30 px-3.5 py-3 text-sm text-white outline-none transition focus:border-emerald-400/50 focus:ring-2 focus:ring-emerald-400/10"
        />
      </FormField>

      <FormField error={errors.password?.message} label="Password">
        <input
          type="password"
          {...register("password")}
          autoComplete="new-password"
          aria-invalid={Boolean(errors.password)}
          placeholder="Create a password"
          className="rounded-lg border border-white/10 bg-black/30 px-3.5 py-3 text-sm text-white outline-none transition focus:border-emerald-400/50 focus:ring-2 focus:ring-emerald-400/10"
        />
      </FormField>

      <button
        type="submit"
        disabled={isPending}
        className="mt-1 rounded-full bg-emerald-400 px-5 py-3 text-sm font-semibold text-zinc-950 transition-colors hover:bg-emerald-300 disabled:opacity-50"
      >
        {isPending ? "Creating account..." : "Create account"}
      </button>
      <p className="pt-1 text-center text-sm text-zinc-500">
        Already have an account?{" "}
        <Link
          className="font-medium text-emerald-300 hover:text-emerald-200"
          to="/login"
        >
          Log in
        </Link>
      </p>
    </form>
  );
};
