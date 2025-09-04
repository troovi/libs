// import { emailRegExp } from 'utilities'

// import { Button, ButtonGroup, Scrollable } from 'uikit'
// import { TextInput } from 'formkit/forms'
// import { Condition, Context, useForm } from 'chezit'
// import { Submit } from 'formkit/Submit'
// import { Label } from 'formkit/layouts'
// import { AddDataForm } from './test'
// import { createState, useLocalState } from 'transmit'
// import { useState } from 'react'
// import { all_scheme } from './all'

// export const SIDEBAR_WIDTH = 280
// export const HEADER_HEIGHT = 56

// const scheme = [
//   Label('Name')(
//     TextInput('name', {
//       placeholder: 'Enter name',
//       $rules: {
//         required: true
//       }
//     })
//   ),
//   Label('Surname')(
//     TextInput('surname', {
//       placeholder: 'Enter surname',
//       $rules: {
//         required: true
//       }
//     })
//   ),
//   Condition('name', {
//     canActivate: (value) => {
//       return value === 'audi'
//     }
//   })(
//     // Context('som')(
//     Label('Email')(
//       TextInput('email', {
//         placeholder: 'Enter email',
//         $rules: {
//           required: true,
//           validate(value) {
//             if (!emailRegExp.test(value)) {
//               throw 'Email not correct'
//             }
//           }
//         }
//       })
//     ),
//     Label('Extra email')(
//       TextInput('extra-email', {
//         placeholder: 'Enter email (not required)',
//         $rules: {
//           validate(value) {
//             if (!emailRegExp.test(value)) {
//               throw 'Email not correct'
//             }
//           }
//         }
//       })
//     ),
//     Context('soma')(
//       TextInput('name-a1', {
//         placeholder: 'Type name',
//         $rules: {
//           required: true
//         }
//       }),
//       TextInput('name-b1', {
//         placeholder: 'Type name',
//         $rules: {
//           required: true
//         }
//       })
//     )
//     // )
//   ),
//   AddDataForm
// ]

// const dirtyState = createState<any>({})
// const eventState = createState<any>({})

// const DirtyListener = () => {
//   const state = useLocalState(dirtyState)

//   return <div>{JSON.stringify(state)}</div>
// }

// const EventListener = () => {
//   const state = useLocalState(eventState)

//   return <div>{JSON.stringify(state)}</div>
// }

// const NodeForm = () => {
//   const [state, setState] = useState(true)

//   const { Form, handleSubmit, reset } = useForm(scheme, {
//     defaultValues: {
//       // surname: 'asdfasfd'
//       // requirements: 'requirements'
//       // som: {
//       //   'name-a': 'fr2',
//       //   soma: {
//       //     'name-b1': 'NIORI'
//       //   }
//       // }
//     },
//     // defaultValues: {
//     // name: 'audi',
//     // requirements: 'requirements'
//     // },
//     onChangeEvent(event) {
//       console.log('change:', event)
//       eventState.$.emit(() => event)
//     },
//     onDirty(event) {
//       console.log('onDirty:', event)
//       dirtyState.$.emit(() => event)
//     },
//     onFormDirty(isDirty) {
//       console.log('onFormDirty:', isDirty)
//     },
//     async onSubmit(data, { setError }) {
//       console.log(data)

//       setError('surname', {
//         message: 'surname not correct'
//       })
//     }
//   })

//   return (
//     <div>
//       <ButtonGroup>
//         <Button onClick={() => setState(true)} active={state}>
//           Visable
//         </Button>
//         <Button active={!state} onClick={() => setState(false)}>
//           Hide
//         </Button>
//       </ButtonGroup>
//       {state && (
//         <div className="flex flex-col gap-20 py-20">
//           {Form}
//           <div>
//             Dirty: <DirtyListener />
//           </div>
//           <div>
//             Event: <EventListener />
//           </div>
//           <div>
//             <Submit handleSubmit={handleSubmit} />
//             {/* <Button
//               onClick={() =>
//                 reset({
//                   name: 'noam',
//                   requirements: 'requirements'
//                   // som: { soma: { 'name-a1': 'OREP' } }
//                 })
//               }
//             >
//               Reset
//             </Button> */}
//           </div>
//         </div>
//       )}
//     </div>
//   )
// }

// export const TestForm = () => {
//   return (
//     <div
//       className="flex h-full justify-center overflow-hidden"
//       style={{ background: 'rgb(0 0 0 / 5%)' }}
//     >
//       <div className="h-full overflow-hidden pt-16" style={{ width: '500px', background: '#fff' }}>
//         <Scrollable implementation="inner" scrollY padding={16}>
//           <NodeForm />
//         </Scrollable>
//       </div>
//     </div>
//   )
// }
