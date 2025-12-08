// Need to use the React-specific entry point to import createApi
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { baseURL } from '../utils/config.js'

// Define a service using a base URL and expected endpoints
export const userDataApi = createApi({
  reducerPath: 'userDataApi',
  baseQuery: fetchBaseQuery({ baseUrl : baseURL , credentials: 'include' }),
  endpoints: (builder) => ({
    getSolvedProblemsByUser: builder.query({
      query: () => `/problem/getAllProblemsSolvedByUser`,
    }),
    getContestSolvedProblemsByUser: builder.query({
      query: (contestId) => `/contest/${contestId}/solved-problems`,
    }),
  }),
})

// Export hooks for usage in functional components, which are
// auto-generated based on the defined endpoints
export const { useGetSolvedProblemsByUserQuery , useGetContestSolvedProblemsByUserQuery } = userDataApi