"use client";

import StoreProvider from "@/state/redux";
import { Authenticator } from "@aws-amplify/ui-react";
import Auth from "./(auth)/authProvider";

const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <StoreProvider>
      <Authenticator.Provider>
        {/* you need to wrap the auth provider if you want to retrieve user in Auth component */}
        <Auth>{children}</Auth>
      </Authenticator.Provider>
    </StoreProvider>
  );
};

export default Providers;
