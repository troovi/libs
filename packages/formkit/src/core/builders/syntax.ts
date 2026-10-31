import { SchemeItems } from '../types'

interface ConditionProps {
  canActivate: (value: any) => boolean
}

export const Context = <N extends string>(context: N) => {
  return <T extends SchemeItems.All[]>(...childs: T): SchemeItems.Context<N, T> => {
    return {
      type: 'context',
      context,
      childs
    }
  }
}

/**
 * Условие: ветка показана, пока `canActivate` верно для значения поля `depended` (полный путь). Скрытая ветка
 * пропадает из значений — её имена необязательны.
 */
export const OptionalCondition = (depended: string, props: ConditionProps) => {
  return <T extends SchemeItems.All[]>(...childs: T): SchemeItems.Condition<T, false> => {
    return {
      type: 'condition',
      depended,
      canActivate: props.canActivate,
      nullable: false,
      childs
    }
  }
}

/**
 * Условие как `OptionalCondition`, но скрытая ветка не пропадает из значений, а отдаёт `null` своим именам — полям и
 * контекстам уровня ветки (раскладки и вложенные условия прозрачны): значение — «данные или `null`». `null` у такого
 * имени в `defaultValues` — отсутствие данных: поля ветки начнут с умолчаний своих компонентов.
 */
export const NullableCondition = (depended: string, props: ConditionProps) => {
  return <T extends SchemeItems.All[]>(...childs: T): SchemeItems.Condition<T, true> => {
    return {
      type: 'condition',
      depended,
      canActivate: props.canActivate,
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
