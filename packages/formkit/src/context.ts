import { createContext } from 'react'
import { FormManager } from './manager/manager'

export const FormContext = createContext({} as FormManager<any, any, any>)
