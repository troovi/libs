## Create form primitives

```tsx
const SelectForm = (name: string) => {
  // select form code
}
const InputForm = (name: string) => {
  // input form code
}
```

## Create layouts

```tsx
export const Label = createLayout((label: React.ReactNode) => {
  return ({ children }) => {
    return <FormGroup label={label}>{children}</FormGroup>
  }
})

export const Double = createLayout(() => {
  return ({ children }) => {
    return <div className="form-double-primitive">{children}</div>
  }
})

export const Splitter = createLayout(() => {
  return () => {
    return <div className="form-splitter" />
  }
})
```

## Create a scheme

```ts
const scheme = [
  Label('Имя')(
    SelectForm('name', {
      placeholder: 'Введите имя',
      options: []
    })
  ),
  Splitter(),
  Double()(
    Label('Фамилия')(
      InputForm('surname', {
        placeholder: 'Введите фамилию'
      })
    ),
    Label('Отчество')(
      InputForm('patronymic', {
        placeholder: 'Введите отчество'
      })
    )
  )
]
```
