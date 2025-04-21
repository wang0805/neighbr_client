"use client";

import React, { useEffect } from "react";
import { Amplify } from "aws-amplify";
import "@aws-amplify/ui-react/styles.css";
import { Authenticator } from "@aws-amplify/ui-react";
import "@aws-amplify/ui-react/styles.css";
import {
  useAuthenticator,
  View,
  Heading,
  RadioGroupField,
  Radio,
  Label,
} from "@aws-amplify/ui-react";
import { useRouter, usePathname } from "next/navigation";
import Loading from "@/components/Loading";
// boiler copied from https://ui.docs.amplify.aws/react/connected-components/authenticator
// https://www.youtube.com/redirect?event=video_description&redir_token=QUFFLUhqbTNkQ29WaDNOR1FUdzBER29NRFhadzFmeHNWUXxBQ3Jtc0ttdXBUcEg3NUJSUXFvb21rcURuSlQ4LUJ2c3lWZlRtUG1sTEY4WEt2VGFlaW1wZDBLTnBYZThKNmd0WGgtbU1pQUdleDNuSGg1OU9HYmpvamg3WUdmODFvM1h0LUpoUTM1ZTNVbXZKQUFVaGVjeGVIWQ&q=https%3A%2F%2Fdocs.amplify.aws%2Fjavascript%2Ftools%2Flibraries%2Fconfigure-categories%2F&v=X1zCAPLvMtw

Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: process.env.NEXT_PUBLIC_AWS_COGNITO_USER_POOL_ID!,
      userPoolClientId:
        process.env.NEXT_PUBLIC_AWS_COGNITO_USER_POOL_CLIENT_ID!,
    },
  },
});

//using the ui-react because we are using their Authenticator so better to use this than Tailwinds
const components = {
  Header() {
    return (
      <View className="mt-4 mb-4">
        <Heading level={3} className="!text-2xl !font-bold">
          RENT
          <span className="text-secondary-500 font-light hover:!text-primary-300">
            IFUL
          </span>
        </Heading>
        <p className="text-muted-foreground mt-2">
          <span className="font-bold">Welcome!</span> to Rentiful
        </p>
      </View>
    );
  },
  SignIn: {
    Footer() {
      const { toSignUp, toForgotPassword } = useAuthenticator();
      return (
        <View className="text-center mt-4">
          <p className="text-muted-foreground">
            Don&apos;t have an account?{" "}
            <button
              onClick={toSignUp}
              className="text-primary hover:underline bg-transparent border-none p-0"
            >
              Sign up here
            </button>
          </p>
          <p className="text-muted-foreground mt-2">
            <button
              onClick={toForgotPassword}
              className="text-primary hover:underline bg-transparent border-none p-0"
            >
              Forgot your password?
            </button>
          </p>
        </View>
      );
    },
  },
  ForgotPassword: {
    Header() {
      return (
        <View className="mt-2 mb-2">
          <Heading level={3} className="!text-2xl !font-bold">
            Reset Password
          </Heading>
          <p className="text-muted-foreground mt-2">
            Enter your email to receive a reset code
          </p>
        </View>
      );
    },
    // Footer() {
    //   const { toSignIn } = useAuthenticator();
    //   return (
    //     <View className="text-center mt-4">
    //       <p className="text-muted-foreground">
    //         Remember your password?{" "}
    //         <button
    //           onClick={toSignIn}
    //           className="text-primary hover:underline bg-transparent border-none p-0"
    //         >
    //           Sign in
    //         </button>
    //       </p>
    //     </View>
    //   );
    // },
  },
  SignUp: {
    FormFields() {
      const { validationErrors } = useAuthenticator();
      return (
        <>
          <Authenticator.SignUp.FormFields />
          <RadioGroupField
            legend={<Label htmlFor="custom:role">Role</Label>}
            name="custom:role"
            errorMessage={validationErrors?.["custom:role"]}
            hasError={!!validationErrors?.["custom:role"]}
            isRequired
          >
            <Radio value="tenant">Tenant</Radio>
            <Radio value="manager">Manager</Radio>
          </RadioGroupField>
        </>
      );
    },
    Footer() {
      const { toSignIn } = useAuthenticator();
      return (
        <View className="text-center mt-4">
          <p className="text-muted-foreground">
            Already have an account?{" "}
            <button
              onClick={toSignIn}
              className="text-primary hover:underline bg-transparent border-none p-0"
            >
              Sign in
            </button>
          </p>
        </View>
      );
    },
  },
};

const formFields = {
  signIn: {
    username: {
      placeholder: "Enter your email",
      label: "Email",
      isRequired: true,
    },
    password: {
      placeholder: "Enter your password",
      label: "Password",
      isRequired: true,
    },
  },
  signUp: {
    username: {
      order: 1,
      placeholder: "Choose a username",
      label: "Username",
      isRequired: true,
    },
    email: {
      order: 2,
      placeholder: "Enter your email address",
      label: "Email",
      isRequired: true,
    },
    password: {
      order: 3,
      placeholder: "Create a password",
      label: "Password",
      isRequired: true,
    },
    confirm_password: {
      order: 4,
      placeholder: "Confirm your password",
      label: "Confirm Password",
      isRequired: true,
    },
  },
  forgotPassword: {
    username: {
      placeholder: "Enter your email",
      label: "Email",
      isRequired: true,
    },
  },
};

const Auth = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuthenticator((context) => [context.user]);
  const router = useRouter();
  const pathname = usePathname();

  const isAuthPage = pathname.match(/^\/(signin|signup)$/);
  const isDashboardPage =
    pathname.startsWith("/manager") || pathname.startsWith("/tenants");

  // Redirect authenticated users away from auth pages
  useEffect(() => {
    if (user && isAuthPage) {
      router.replace("/");
    }
  }, [user, isAuthPage, router]);

  // don’t render anything while redirect is in progress otherwise will 404 first
  // if (isAuthPage && user) {
  //   return null;
  // }
  // instead of returning null, add a spinning wheel instead
  if (isAuthPage && user) {
    return <Loading />;
  }

  // Allow access to public pages without authentication
  if (!isAuthPage && !isDashboardPage) {
    return <>{children}</>;
  }

  return (
    <div className="h-full">
      <Authenticator
        // socialProviders={["facebook", "google"]}
        initialState={pathname.includes("signup") ? "signUp" : "signIn"}
        components={components}
        formFields={formFields}
      >
        {() => <>{children}</>}
      </Authenticator>
    </div>
  );
};
export default Auth;
