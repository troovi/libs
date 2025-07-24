import { readFileSync, readdirSync } from 'fs'
import { exec } from 'child_process'

export const getFilesList = (path: string) => {
  return readdirSync(path).filter((s) => {
    return !s.startsWith('.')
  })
}

export const getFileData = <T = any>(path: string) => {
  return JSON.parse(readFileSync(path, { encoding: 'utf-8' })) as T
}

export const getFolderSize = (path: string) => {
  return new Promise<string>((resolve, reject) => {
    exec(`du -sk "${path}"`, (error, stdout, stderr) => {
      if (error) {
        return reject(`error: ${error.message}`)
      }

      if (stderr) {
        return reject(`stderr: ${stderr}`)
      }

      resolve(stdout.split('\t')[0])
    })
  })
}
