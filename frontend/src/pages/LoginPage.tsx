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
    >
      <h2>Log in</h2>

      {apiError && (
        <div
          role="alert"
        >
          {apiError.message}
        </div>
      )}

      <div>
        <input
          {...register("email")}
          type="email"
          autoComplete="email"
          aria-invalid={Boolean(errors.email)}
          placeholder="Email"
        />
        {errors.email && (
          <span role="alert">
            {errors.email.message}
          </span>
        )}
      </div>

      <div>
        <input
          type="password"
          {...register("password")}
          autoComplete="current-password"
          aria-invalid={Boolean(errors.password)}
          placeholder="Password"
        />
        {errors.password && (
          <span role="alert">
            {errors.password.message}
          </span>
        )}
      </div>

      <button
        type="submit"
        disabled={isPending}
      >
        {isPending ? "Loading..." : "Log in"}
      </button>
      <p>
        Don&apos;t have an account?{" "}
        <Link to="/signup">
          Sign up
        </Link>
      </p>
    </form>
  );
};