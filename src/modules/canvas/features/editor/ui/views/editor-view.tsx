'use client'
import { useRef } from 'react'
import { Provider } from 'react-redux'
import { Editor } from '../components'
import { AppStore, makeStore } from '@/modules/canvas/store'

export default function EditorView() {
  const storeRef = useRef<AppStore>(undefined)
  if (!storeRef.current) {
    // Create the store instance the first time this renders
    storeRef.current = makeStore()
  }

  return <Provider store={storeRef.current}>
    <Editor initialValues={{width: 500, height: 800}}/>
  </Provider>
}