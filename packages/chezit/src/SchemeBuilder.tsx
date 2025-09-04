import { Condition } from './Condition'
import { Form } from './Form'
import { SchemeItems } from './core/types'
import { ExtraScheme } from './Extra'

export interface SchemeBuilderProps {
  scheme: SchemeItems.All[]
  path: string[]
}

const SchemeBuilder = ({ scheme, path }: SchemeBuilderProps) => {
  return (
    <>
      {scheme.map((Item, k) => {
        if (Item.type === 'layout') {
          return (
            <Item.Layout key={`layout-form--${k}-${path.length}`}>
              <SchemeBuilder path={path} scheme={Item.childs} />
            </Item.Layout>
          )
        }

        if (Item.type === 'context') {
          return (
            <SchemeBuilder
              key={`context-form--${k}-${Item.context}-${path.length}`}
              path={[...path, Item.context]}
              scheme={Item.childs}
            />
          )
        }

        if (Item.type === 'condition') {
          return (
            <Condition
              key={`condition--${k}-${Item.depended}-${path.length}`}
              name={Item.depended}
              canActivate={Item.canActivate}
            >
              <SchemeBuilder path={path} scheme={Item.childs} />
            </Condition>
          )
        }

        if (Item.type === 'extra') {
          return <ExtraScheme key={`partial-item--${k}-${path.length}`} path={path} item={Item} />
        }

        return (
          <Form
            key={`form-item--${k}-${Item.name}-${path.length}`}
            name={[...path, Item.name].join('.')}
            item={Item}
          />
        )
      })}
    </>
  )
}

export { SchemeBuilder }
