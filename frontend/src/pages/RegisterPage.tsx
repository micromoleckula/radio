import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { useRegister } from "../hooks/useAuth";
import {
  registerSchema,
  type RegisterType,
} from "../shared/validation/auth.schema";

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
    >
      <h2>
        Create your account
      </h2>

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
          autoComplete="new-password"
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
        {isPending ? "Loading..." : "Create account"}
      </button>
      <p>
        Already have an account?{" "}
        <Link to="/login">
          Log in
        </Link>
      </p>
    </form>
  );
};