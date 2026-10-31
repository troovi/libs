# @companix/formkit

Формы на React одной декларативной схемой. Поля, раскладка, условия и проверка описываются деревом из обычных вызовов
функций, а значения формы TypeScript выводит из самой схемы — без ручных интерфейсов, `useState` на каждое поле и
`register` в разметке.

```tsx
const scheme = [
  Label('Имя')(TextForm('name', { placeholder: 'Иван', $rules: { required: true } })),
  CheckboxForm('hasCompany', { title: 'Представляю компанию' }),
  OptionalCondition('hasCompany', { canActivate: (checked: boolean) => checked })(
    Context('company')(Label('Компания')(TextForm('name', { placeholder: 'ООО «Ромашка»' })))
  )
]

// onSubmit получит { name: string; hasCompany: boolean; company?: { name: string } }
```

`TextForm`, `CheckboxForm` и `Label` здесь — свои поле и раскладка проекта: как их завести, показано ниже.

## Почему formkit

- **Форма — данные, а не разметка.** Схема — массив, который собирают функциями: общий блок полей пишется один раз и
  вставляется в любую форму, вариант формы — другой набор элементов, а не ветвление в JSX.
- **Типы из схемы.** `onSubmit`, `onChange`, `defaultValues`, `setValue` и `useValue` знают имена и типы полей,
  вложенные контексты и необязательность полей под условием.
- **Поле пишется один раз.** `createForm` превращает любой компонент ввода в поле: умолчание, «что считать пустым» и
  отрисовка ошибки живут в нём, а не в каждой форме.
- **Условия и вложенность из коробки.** `OptionalCondition` показывает поля по значению другого поля, `Context`
  складывает их в объект; скрытое поле не попадает ни в значения, ни в проверку, а под `NullableCondition` приходит
  `null`.
- **Состояние вне React.** Значения держит менеджер формы: правка поля перерисовывает это поле и тех, кто на него
  подписан, а не всю форму и не экран вокруг неё.
- **Изменённость.** Форма знает, что её правили, сообщает об этом и при отправке без изменений вызывает `onEqual`
  вместо запроса.

## Установка

```sh
npm i @companix/formkit
```

Нужен React 18.

## Форма за минуту

```tsx
import { useMemo } from 'react'
import { createForm, createLayout, useForm, FormLayout } from '@companix/formkit'

// поле: умолчание, проверка обязательности и компонент
const TextForm = createForm<string, { placeholder: string }>({
  defaultValue: '',
  getRequireCheck: () => (value) => {
    if (value.trim() === '') {
      throw ''
    }
  },
  getForm: ({ placeholder }) => {
    return ({ field, error, disabled }) => {
      return (
        <div className="field">
          <input
            ref={field.ref}
            value={field.value}
            placeholder={placeholder}
            disabled={disabled}
            onChange={(e) => field.onChange(e.target.value)}
          />
          {error?.messages?.map((message) => (
            <p key={message}>{message}</p>
          ))}
        </div>
      )
    }
  }
})

// раскладка: подпись над полем
const Label = createLayout((text: string) => {
  return ({ children }) => {
    return (
      <label className="label">
        <span>{text}</span>
        {children}
      </label>
    )
  }
})

export const ProfileForm = () => {
  const scheme = useMemo(() => {
    return [
      Label('Имя')(TextForm('name', { placeholder: 'Иван', $rules: { required: true } })),
      Label('Город')(TextForm('city', { placeholder: 'Москва' }))
    ]
  }, [])

  const form = useForm(scheme, {
    defaultValues: { city: 'Москва' },
    onSubmit: async (values) => {
      await api.saveProfile(values) // values: { name: string; city: string }
    }
  })

  return (
    <>
      <FormLayout manager={form.manager} />
      <button onClick={form.handleSubmit}>Сохранить</button>
    </>
  )
}
```

Менеджер формы создаётся один раз: схему и `defaultValues` `useForm` читает при первом рендере, поэтому схему держат в
`useMemo`. `FormLayout` рисует схему и может стоять где угодно — в окне, на странице, в шаге мастера.

## Поле — `createForm`

Поле — это компонент ввода плюс три ответа: какое у него значение по умолчанию, что для него значит «пусто» и как его
нарисовать по параметрам из схемы.

```tsx
const SelectForm = <T,>(defaultValue: T | null) => {
  return createForm<T | null, { options: { value: T; title: string }[] }>({
    defaultValue,
    getRequireCheck: () => (value) => {
      if (value === null) {
        throw ''
      }
    },
    getForm: ({ options }) => {
      return ({ field, error }) => (
        <Select options={options} value={field.value} onChange={field.onChange} error={error} />
      )
    }
  })
}

SelectForm<'day' | 'night'>('day')('mode', { options: MODES })
```

Компонент получает `field` (`value`, `onChange`, `ref` для фокуса на ошибке), `error` и `disabled` формы. Умолчание,
которое зависит от места, задают фабрикой, как у `SelectForm` выше: `NumberInputForm(1)('count', …)`.

## Раскладка — `createLayout`

Раскладка оборачивает поля разметкой. Параметр раскладки — один аргумент; раскладку без параметров вызывают сразу.

```tsx
const Card = createLayout(({ title, hint }: { title: string; hint?: string }) => {
  return ({ children }) => (
    <section className="card">
      <h3>{title}</h3>
      {hint && <p>{hint}</p>}
      {children}
    </section>
  )
})

const Double = createLayout(() => {
  return ({ children }) => <div className="double">{children}</div>
})()

Card({ title: 'Контакты', hint: 'Видят только менеджеры' })(
  Double(TextForm('phone', { placeholder: '+7' }), TextForm('email', { placeholder: 'mail@site.ru' }))
)
```

## Схема

| Элемент                                          | Что делает                                                                | В значениях        |
| ------------------------------------------------ | ------------------------------------------------------------------------- | ------------------ |
| `XForm('name', params)`                          | поле                                                                      | `name: V`          |
| `Layout(params)(…)`                              | разметка вокруг полей                                                     | поля как есть      |
| `Context('name')(…)`                             | вложенный объект: имена полей внутри — `name.field`                       | `name: { … }`      |
| `OptionalCondition('field', { canActivate })(…)` | поля показаны, пока `canActivate(значение поля)` верно; имя — полный путь | поля необязательны |
| `NullableCondition('field', { canActivate })(…)` | как `OptionalCondition`, но скрытая ветка отдаёт `null` своим именам      | `name: V \| null`  |
| `Visablility({ hidden })(…)`                     | поля не рисуются, но несут значение из `defaultValues`                    | поля необязательны |
| `createExtraForm(…)`                             | поля, которые пользователь добавляет и убирает сам                        | поля необязательны |

Значения `onSubmit` и `onChange` выводятся из схемы сами, тип `defaultValues` схемы — `GetDefaultValues<typeof scheme>`.

## Проверка

```tsx
TextForm('inn', {
  placeholder: '12 цифр',
  $rules: {
    required: true,
    validate: (value) => {
      if (!/^\d{12}$/.test(value)) {
        throw 'ИНН — 12 цифр'
      }
    }
  }
})
```

- `required` проверяет поле его же `getRequireCheck`; `validate` — после него. Без `required` `validate` работает,
  только если поле не пустое.
- Проверка бросает строку: `throw ''` подсвечивает поле, `throw 'текст'` — с сообщением, массив строк — несколько
  сообщений. Ошибку рисует компонент поля из `error.messages`.
- `handleSubmit` проверяет поля, которые форма показывает, и ставит фокус на первое ошибочное. Поле скрытого условия
  отправку не держит. После первой попытки поля проверяются на каждой правке.
- Ошибку от сервера ставит `setError` из второго аргумента `onSubmit`: `setError('inn', { message: 'ИНН занят' })`.

## Значения, умолчания и условия

У поля два источника начального значения: умолчание компонента (`defaultValue` из `createForm`) и `defaultValues`
формы. Стартовое значение — `defaultValues`, а без них — умолчание компонента. От стартового значения считается
изменённость, и с него поле начинает:

- при первом показе;
- когда условие снова показывает поле: скрытое поле теряет значение и ошибку, вернувшееся — начинает заново со
  стартового, а не с того, что ввели до скрытия.

Значения формы — `onChange`, `getValues()` и отправка — это то, что форма показывает. Поля скрытых условий в них не
входят, а поле, которое изменение только что открыло, входит сразу, ещё до монтирования, со стартовым значением.

Отсюда простое правило: `defaultValues` — только данные. Где данных нет, передавайте `undefined`, и поле возьмёт своё
умолчание; повторять умолчание поля в `defaultValues` не нужно.

```tsx
defaultValues: {
  hasEscorts: escorts !== null,
  escorts: escorts ?? undefined // нет данных — поля начнут со своих умолчаний
}
```

### Данные или `null` — `NullableCondition`

Часто включаемый блок в данных — объект или `null`: выключенное условие хранится как `null`, а не отдельным флажком.
`OptionalCondition` даёт такому блоку `undefined` — скрытая ветка пропадает из значений. `NullableCondition` ведёт себя
так же, но скрытая ветка отдаёт `null` своим именам — полям и контекстам уровня ветки; раскладки и вложенные условия
внутри неё прозрачны. Имена — как `.optional()` и `.nullable()` в zod: `name?: V` против `name: V | null`.

```tsx
const scheme = [
  CheckboxForm('hasCompany', { title: 'Представляю компанию' }),
  NullableCondition('hasCompany', { canActivate: (checked: boolean) => checked })(
    Context('company')(Label('Компания')(TextForm('name', { placeholder: 'ООО «Ромашка»' })))
  )
]

// onSubmit получит { hasCompany: boolean; company: { name: string } | null }
```

`null` у такого имени в `defaultValues` — отсутствие данных, как `undefined`: поля ветки начнут с умолчаний своих
компонентов. Блок из данных передаётся как есть, флажок выводится из него:

```tsx
const form = useForm(scheme, {
  defaultValues: {
    hasCompany: profile.company !== null,
    company: profile.company // { name: string } | null
  },
  onSubmit: async (values) => {
    await api.saveProfile(values) // company — как в данных: объект или null
  }
})
```

Ветка из одного поля, у которого `null` — своё значение (стёртое число, дата без выбора), отдаёт `null` и скрытой, и
пустой: различает их флажок.

## Живая форма и изменённость

```tsx
const form = useForm(scheme, {
  defaultValues,
  // значения после каждой правки — расчёт и подсказки поверх полей, без кнопки отправки
  onChange: (values) => setDraft(toDraft(values)),
  // форма изменена или снова стартовая
  onFormDirty: (isDirty) => setDirty(isDirty),
  // отправили без изменений
  onEqual: () => close()
})
```

- `onDirty` сообщает о каждом поле, `onFormDirty` — о форме целиком: первое изменение и снятие последнего.
- `setAsDefault()` делает текущие значения стартовыми — после успешного сохранения.
- `reset(values)` ставит новые значения и делает их стартовыми; поле, которого нет в `values`, получает умолчание
  компонента. `reset(values, { asDirty: true })` оставляет новые значения изменением.
- `setAsDefault()` и `reset(values)` сообщают «чисто» через `onDirty` и `onFormDirty`.

## Управление формой

`useForm` возвращает:

| Метод                         | Что делает                                                             |
| ----------------------------- | ---------------------------------------------------------------------- |
| `manager`                     | менеджер для `FormLayout`                                              |
| `handleSubmit()`              | проверка показанных полей и `onSubmit` (или `onEqual`)                 |
| `getValues()`                 | значения формы — то, что она показывает                                |
| `getValue(name)`              | значение поля по полному пути (`company.name`)                         |
| `setValue(name, value)`       | запись поля, как ввод пользователя                                     |
| `reset(values, options?)`     | новые значения, по умолчанию — стартовые                               |
| `setAsDefault()`              | текущие значения — стартовые                                           |
| `setError(name, { message })` | ошибка поля                                                            |
| `setFocus(name)`              | фокус на поле                                                          |
| `subscribe(name, callback)`   | подписка на поле; возвращает отписку                                   |
| `subscribeAny(callback)`      | подписка на любую правку; возвращает отписку                           |
| `getNames()`                  | полные пути всех полей схемы                                           |
| `useValue(name)`              | хук внутри `FormLayout`: значение поля с перерисовкой и типом из схемы |

## Внутри схемы: `useValue` и `useSetValue`

Компоненты раскладок и поля читают и пишут соседние поля по полному пути. Хуки берут форму из контекста, поэтому
работают внутри `FormLayout`:

```tsx
// подсказка, которая зависит от выбранной причины
const ReasonHint = createLayout(() => {
  return () => {
    const reason = useValue<Reason | null>('reason')

    return (
      <p className="hint">
        {reason === 'scan' ? 'Переснимут только отмеченные' : 'Анкета вернётся на шаг'}
      </p>
    )
  }
})()

// подстановка из списка в поле контакта
const ManagerPick = ({ managers }: { managers: Manager[] }) => {
  const setName = useSetValue<string>('contact.name')

  return <Menu items={managers} onSelect={(manager) => setName(manager.name)} />
}
```

Типизированный `useValue` для схемы — `createUseValue<typeof scheme>()`.

## Поля, которые добавляет пользователь

```tsx
// Removable — своя раскладка с кнопкой удаления, AddMenu — меню ещё не добавленных полей
const Optional = createExtraForm({
  getItems: (registry) => [
    registry('phone')((name, remove) => Removable(remove)(TextForm(name, { placeholder: 'Телефон' }))),
    registry('email')((name, remove) => Removable(remove)(TextForm(name, { placeholder: 'Почта' })))
  ],
  getController: (append, visible) => <AddMenu hidden={visible} onSelect={append} />
})
```

Поле добавлено, пока у него есть значение: в `defaultValues` — показано сразу, убранное — изменение формы.

## 0.0.31

- `Condition` переименован в `OptionalCondition`: имя говорит, что скрытая ветка пропадает из значений.
- `NullableCondition`: скрытая ветка отдаёт `null` своим полям и контекстам, а не пропадает из значений; `null` у них
  в `defaultValues` — отсутствие данных.

## 0.0.30

- Поле, снова показанное условием, начинает со стартового значения (`defaultValues`), а не с умолчания компонента.
- `onChange`, `getValues()` и отправка включают поля, которые изменение только что показало, — со стартовым значением,
  до монтирования.
- `handleSubmit` проверяет только показанные поля: скрытое поле отправку не держит. Ошибка скрытого поля сбрасывается.
- Скрытое условием поле не считается изменённым — изменение несёт поле условия.
- `setAsDefault()` и `reset()` сообщают «чисто» через `onDirty` и `onFormDirty`.
