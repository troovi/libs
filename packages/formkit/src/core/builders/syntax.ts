import { SchemeItems } from '../types'

interface ConditionProps {
  canActivate: (value: any) => boolean
}

type ConditionBuilder<Nullable extends boolean> = <T extends SchemeItems.All[]>(
  ...childs: T
) => SchemeItems.Condition<T, Nullable>

export const Context = <N extends string>(context: N) => {
  return <T extends SchemeItems.All[]>(...childs: T): SchemeItems.Context<N, T> => {
    return {
      type: 'context',
      context,
      childs
    }
  }
}

// источник условия: поле формы и проверка его значения либо значение вне формы — без поля и подписки
const sourceOf = (source: string | boolean, props?: ConditionProps) => {
  if (typeof source === 'boolean') {
    return { depended: null, canActivate: () => source }
  }

  return { depended: source, canActivate: props!.canActivate }
}

/**
 * Условие по значению вне формы — праву, режиму, входу окна: ветка показана, если `active` верно. Значение берётся при
 * создании схемы и за жизнь формы не меняется, как и вся схема. Скрытая ветка пропадает из значений — её имена
 * необязательны.
 */
export function OptionalCondition(active: boolean): ConditionBuilder<false>

/**
 * Условие: ветка показана, пока `canActivate` верно для значения поля `depended` (полный путь). Скрытая ветка
 * пропадает из значений — её имена необязательны.
 */
export function OptionalCondition(depended: string, props: ConditionProps): ConditionBuilder<false>

export function OptionalCondition(source: string | boolean, props?: ConditionProps) {
  const { depended, canActivate } = sourceOf(source, props)

  return <T extends SchemeItems.All[]>(...childs: T): SchemeItems.Condition<T, false> => {
    return {
      type: 'condition',
      depended,
      canActivate,
      nullable: false,
      childs
    }
  }
}

/**
 * Условие по значению вне формы, как `OptionalCondition(active)`, но скрытая ветка отдаёт `null` своим именам — полям
 * и контекстам уровня ветки: значение — «данные или `null`».
 */
export function NullableCondition(active: boolean): ConditionBuilder<true>

/**
 * Условие как `OptionalCondition`, но скрытая ветка не пропадает из значений, а отдаёт `null` своим именам — полям и
 * контекстам уровня ветки (раскладки и вложенные условия прозрачны): значение — «данные или `null`». `null` у такого
 * имени в `defaultValues` — отсутствие данных: поля ветки начнут с умолчаний своих компонентов.
 */
export function NullableCondition(depended: string, props: ConditionProps): ConditionBuilder<true>

export function NullableCondition(source: string | boolean, props?: ConditionProps) {
  const { depended, canActivate } = sourceOf(source, props)

  return <T extends SchemeItems.All[]>(...childs: T): SchemeItems.Condition<T, true> => {
    return {
      type: 'condition',
      depended,
      canActivate,
      nullable: true,
      childs
    }
  }
}

export const Visablility = ({ hidden }: { hidden?: boolean }) => {
  return <T extends SchemeItems.All[]>(...childs: T): SchemeItems.Visablility<T> => {
    return {
      type: 'visability',
      hidden: hidden ?? false,
      childs
    }
  }
}
