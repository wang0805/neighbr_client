import { createNewUserInDatabase } from "@/lib/utils";
import { Manager, Tenant } from "@/types/prismaTypes";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { fetchAuthSession, getCurrentUser } from "aws-amplify/auth";

export const api = createApi({
  //prepareHeaders for users autenticate any api calls that they make
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL,
    prepareHeaders: async (headers) => {
      const session = await fetchAuthSession();
      const { idToken } = session.tokens ?? {};
      if (idToken) {
        headers.set("Authorization", `Bearer ${idToken}`);
      }
      return headers;
    },
  }),
  reducerPath: "api",
  // state that you are saving in the store for redux, saving to backend
  tagTypes: ["Managers", "Tenants"],
  endpoints: (build) => ({
    getAuthUser: build.query<User, void>({
      queryFn: async (_, _queryApi, _extraoptions, fetchWithBQ) => {
        try {
          const session = await fetchAuthSession();
          const { idToken } = session.tokens ?? {};
          const user = await getCurrentUser();
          const userRole = idToken?.payload["custom:role"] as string;

          const endpoint =
            userRole === "manager"
              ? `/managers/${user.userId}`
              : `/tenants/${user.userId}`;
          // if the user signs in and have a cognitoId, request to check if that user exists in the database
          let userDetailsResponse = await fetchWithBQ(endpoint);

          //if checked and user doesnt exist, create new user into database
          if (
            userDetailsResponse.error &&
            userDetailsResponse.error.status === 404
          ) {
            userDetailsResponse = await createNewUserInDatabase(
              user,
              idToken,
              userRole,
              fetchWithBQ
            );
          }

          return {
            data: {
              cognitoInfo: { ...user },
              userInfo: userDetailsResponse.data as Tenant | Manager,
              userRole,
            },
          };
        } catch (error: any) {
          return {
            error:
              error.message || "An error occurred while fetching user data",
          };
        }
      },
    }),
    //receive Tenant data from the database (backend) and sending cognitoId and a partial Tenant object
    updateTenantSettings: build.mutation<
      Tenant,
      { cognitoId: string } & Partial<Tenant>
    >({
      query: ({ cognitoId, ...updatedTenant }) => ({
        url: `/tenants/${cognitoId}`,
        method: "PUT",
        body: updatedTenant,
      }),
      //if we already have a fetched list of tenants in redux state on frontend, means we want to update everytime we make this query to get the most updated data
      invalidatesTags: (result) => [{ type: "Tenants", id: result?.id }], //we set tagtypes earlier
    }),
    updateManagerSettings: build.mutation<
      Manager,
      { cognitoId: string } & Partial<Manager>
    >({
      query: ({ cognitoId, ...updatedManager }) => ({
        url: `/managers/${cognitoId}`,
        method: "PUT",
        body: updatedManager,
      }),
      //if we already have a fetched list of managers in redux state on frontend, means we want to update everytime we make this query to get the most updated data
      invalidatesTags: (result) => [{ type: "Managers", id: result?.id }], //we set tagtypes earlier
    }),
  }),
});

export const {
  useGetAuthUserQuery,
  useUpdateTenantSettingsMutation,
  useUpdateManagerSettingsMutation,
} = api;
