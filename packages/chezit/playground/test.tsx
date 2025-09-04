// import { Remove, Plus } from 'icons/blueprint'

// import { createLayout, createExtraForm } from 'chezit'
// import { TextInput } from 'formkit/forms'
// import { Label } from 'formkit/layouts'
// import { Button } from 'uikit'

// import { PopoverKit, PopoverOverlay } from 'uikit/technics/PopoversAgent'

// const Removable = createLayout((handleClick: () => void) => {
//   return ({ children }) => {
//     return (
//       <div className="flex w-full gap-6">
//         {children}
//         <Button className="quieter-style" intent="danger" onClick={handleClick} icon={<Remove />} />
//       </div>
//     )
//   }
// })

// export const AddDataForm = createExtraForm({
//   getItems(registry) {
//     return [
//       registry('description')((name, remove) => {
//         return Label('Описание деятельности')(
//           Removable(remove)(
//             TextInput(name, {
//               placeholder: 'Описание',
//               $rules: { required: true }
//             })
//           )
//         )
//       }),
//       registry('requirements')((name, remove) => {
//         return Label('Обязанности')(
//           Removable(remove)(
//             TextInput(name, {
//               placeholder: 'Напишите обязанности',
//               $rules: { required: true }
//             })
//           )
//         )
//       }),
//       registry('conditions')((name, remove) => {
//         return Label('Условия работы')(
//           Removable(remove)(
//             TextInput(name, {
//               placeholder: 'Напишите условия',
//               $rules: { required: true }
//             })
//           )
//         )
//       })
//     ]
//   },
//   getController(append, visable) {
//     return <AddDataButton onClick={(name) => append(name)} visable={visable}></AddDataButton>
//   }
// })

// interface Props {
//   onClick: (name: string) => void
//   visable: string[]
// }

// const AddDataButton = ({ onClick, visable }: Props) => {
//   const items = ['description', 'requirements', 'conditions'].filter((name) => !visable.includes(name))

//   if (items.length === 0) {
//     return null
//   }

//   return (
//     <PopoverOverlay
//       minimal
//       matchTargetWidth
//       placement="bottom"
//       content={
//         <PopoverKit.Layout>
//           <PopoverKit.Options>
//             {items.map((item) => ({
//               type: 'option',
//               title: item,
//               onClick: () => {
//                 onClick(item)
//               }
//             }))}
//           </PopoverKit.Options>
//         </PopoverKit.Layout>
//       }
//     >
//       {({ isOpen, ...props }) => (
//         <Button
//           {...props}
//           style={{ border: '1px dashed' }}
//           icon={<Plus />}
//           minimal
//           intent="primary"
//           fill
//         >
//           Добавить данные
//         </Button>
//       )}
//     </PopoverOverlay>
//   )
// }
