const fs = require('fs')

const packageJsonPath = './package.json'
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'))

console.log('Setup GitHub Packages...')

packageJson.dependencies['@troovi/utils'] = '*'

fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2))
