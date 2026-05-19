const fs = require('fs')

const updatePackage = (path, mutate) => {
  const packageContent = JSON.parse(fs.readFileSync(path, 'utf8'))
  mutate(packageContent)
  fs.writeFileSync(path, JSON.stringify(packageContent, null, 2))
}

console.log('Github node script')
;[`packages`, `icons`, `xeo`].forEach((directory) => {
  fs.readdirSync(directory).forEach((packageName) => {
    const packagePath = `${directory}/${packageName}/package.json`

    if (fs.existsSync(packagePath)) {
      updatePackage(packagePath, (packageContent) => {
        // Set declaration path...
        packageContent.types = './dist/index.d.ts'
        // reset local dependecy
        for (const source of ['devDependencies', 'dependencies']) {
          const dependencies = packageContent[source]

          for (const package in dependencies) {
            if (package === '@companix/xeo-devkit') {
              delete dependencies[package]
              continue
            }

            if (
              package.startsWith('@companix') ||
              package === 'max-bridge' ||
              package === 'max-nestjs'
            ) {
              dependencies[package] = '*'
            }
          }
        }
      })
    }
  })
})
