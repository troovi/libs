## Create form primitives

```tsx
const SelectForm = (name: string, x: any) => {}
const InputForm = (name: string, x: any) => {}
```

## Create layouts

```tsx
const Label = ({ name }) => {
  return ({ children }) => <div></div>
}

const Double = () => {
  return () => {
    return <>{children}</>
  }
}

const Splitter = () => {}
```

## Define a scheme

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
