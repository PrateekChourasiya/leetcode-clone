import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../authSlice';
import { userDataApi } from '../services/userDataService';
import { contestDataApi } from '../services/contestDataService';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    [userDataApi.reducerPath]: userDataApi.reducer,
    [contestDataApi.reducerPath]: contestDataApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // <- disables the check globally (not recommended)
    }).concat(userDataApi.middleware).concat(contestDataApi.middleware),
});

