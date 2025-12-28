// import { forwardRef, useRef } from 'react'
// import { mergeRefs } from 'react-merge-refs'
// import { InputElement } from './InputElement'
// import { InputContainer } from './InputContainer'
// import { InputProps } from './Input'

// export const InlineInput = forwardRef<HTMLDivElement, InputProps>(
//   (
//     {
//       onChange,
//       onValueChange,
//       readOnly,
//       value,
//       placeholder,
//       mask,
//       maskChar,
//       inputRef: clientInputRef,
//       ...containerProps
//     },
//     ref
//   ) => {
//     const inputRef = useRef<HTMLInputElement>(null)

//     return (
//       <InputContainer ref={ref} inputRef={inputRef} {...containerProps}>
//         <div className="inline-input-container">
//           <div className="inline-input-title">{value === '' ? placeholder : value}</div>
//           <InputElement
//             type="text"
//             ref={mergeRefs([inputRef, clientInputRef])}
//             className="form-input form-input-base inline-input"
//             aria-disabled={containerProps.disabled}
//             onChange={onChange}
//             onValueChange={onValueChange}
//             value={value}
//             placeholder={placeholder}
//             disabled={containerProps.disabled}
//             readOnly={readOnly}
//             maskChar={maskChar}
//             mask={mask}
//           />
//         </div>
//       </InputContainer>
//     )
//   }
// )
