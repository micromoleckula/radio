import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { useLogin } from "../hooks/useAuth";
import { loginSchema, type LoginType } from "../shared/validation/auth.schema";

export const LoginPage = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginType>({
    resolver: zodResolver(loginSchema),
  });

  const { mutate: login, isPending, error: apiError } = useLogin();

  const onSubmit = (data: LoginType) => {
    login(data);
  };

  return (
    <form
      onSubmit={(event) => {
        void handleSubmit(onSubmit)(event);
      }}
      className="mx-auto flex w-full max-w-sm flex-col gap-4"
    >
      <h2 className="text-2xl font-bold text-white mb-4">Log in</h2>

      {apiError && (
        <div
          role="alert"
          className="rounded border border-red-500/50 bg-red-500/20 p-3 text-sm text-red-500"
        >
          {apiError.message}
        </div>
      )}

      <div className="flex flex-col gap-1">
        <input
          {...register("email")}
          type="email"
          autoComplete="email"
          aria-invalid={Boolean(errors.email)}
          placeholder="Email"
          className="p-3 rounded bg-zinc-800 text-white border border-zinc-700"
        />
        {errors.email && (
          <span role="alert" className="text-red-500 text-sm">
            {errors.email.message}
          </span>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <input
          type="password"
          {...register("password")}
          autoComplete="current-password"
          aria-invalid={Boolean(errors.password)}
          placeholder="Password"
          className="p-3 rounded bg-zinc-800 text-white border border-zinc-700"
        />
        {errors.password && (
          <span role="alert" className="text-red-500 text-sm">
            {errors.password.message}
          </span>
        )}
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="bg-green-500 text-black font-bold p-3 rounded mt-2 hover:bg-green-400 disabled:opacity-50"
      >
        {isPending ? "Loading..." : "Log in"}
      </button>
      <p className="text-center text-sm text-zinc-400">
        Don&apos;t have an account?{" "}
        <Link className="text-white underline" to="/signup">
          Sign up
        </Link>
      </p>
    </form>
  );
};
