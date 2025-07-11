import { configureStore } from '@reduxjs/toolkit'
import { counterSlice } from '../features/editor/editor-slice'

export const makeStore = () => {
  return configureStore({
    reducer: {
      someReducer: counterSlice.reducer
    },
  })
}

// Infer the type of makeStore
export type AppStore = ReturnType<typeof makeStore>
// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<AppStore['getState']>
export type AppDispatch = AppStore['dispatch']