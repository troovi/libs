const icons = require('./icons.json')
const fs = require('fs')
const promises = require('fs/promises')

const capitalize = (str) => {
  return str[0].toUpperCase() + str.slice(1)
}

const getIconName = (str, prefix = 'fa') => {
  return prefix + str.split('-').map(capitalize).join('')
}

//
;(async () => {
  fs.writeFileSync('./src/index.ts', '')

  for (const name in icons) {
    const iconName = getIconName(name)
    const filepath = `./src/icons/${iconName}.ts`
    const content = `
import type { IconData } from '../types'
export const ${iconName}: IconData = ${JSON.stringify(icons[name])}`

    await promises.appendFile(
      './src/index.ts',
      `export { ${iconName} } from './icons/${iconName}.js'\n`
    )

    await new Promise((resolve) => {
      fs.writeFile(filepath, content, (err) => {
        if (err) {
          console.log(err)
          throw {}
        } else {
          resolve()
        }
      })
    })
  }
})()
