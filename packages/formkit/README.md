// generics

// implements form

const SelectForm = (name: string, x: any) => {}
const InputForm = (name: string, x: any) => {}

// implements layout

const Label = (v: any) => {
  return (x: any) => {}
}

const Double = () => {
  return (...x: void[]) => {
    // x.
  }
}

const Splitter = () => {}

// scheme

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
