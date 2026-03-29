import { describe, expect, test } from 'vitest'
import { cases, MockKit, createMockKit, AppScheme, dataScheme } from '@companix/xeo-devkit'
import { DataSource, createBaseDriver } from '../lib'
import { BaseParams } from '@companix/xeo-devkit'

type CommitChanges = (kit: MockKit, dataSource: DataSource<AppScheme>) => Promise<void>

const runTest = async (params: BaseParams, commitChanges: CommitChanges) => {
  const { expectations } = params

  const dataSource = new DataSource(dataScheme, {
    createDriver: createBaseDriver
  })

  await commitChanges(createMockKit(dataSource), dataSource).catch((error) => {
    expect(expectations.error).toEqual(error)
  })

  for (const collection in dataSource.collections) {
    const collectionName = collection as keyof AppScheme

    await dataSource.collections[collectionName].getAll().then((result) => {
      // если схема не передана, значит, мы считаем, что она должна быть пустой
      expect(expectations.scheme[collectionName] ?? []).toEqual(result)
    })
  }

  const tables = dataSource.driver.tables.getTables()

  for (const name in tables) {
    const { m1, m2 } = tables[name]
    try {
      // если таблица не была указана, значит, мы считаем, что она должна быть пустой
      expect(expectations.tables[name] ?? { m1: {}, m2: {} }).toEqual({ m1, m2 })
    } catch (e) {
      console.log('expected:', tables[name])
      console.log('recieved:', expectations.tables)
      throw e
    }
  }
}

describe('DataSource', async () => {
  for await (const item of cases) {
    if (item.type === 'unit') {
      test(item.name, async () => {
        await runTest(item.params, (kit, dataSource) => item.params.execute(kit, dataSource))
      })
    }

    if (item.type === 'dual') {
      for await (const marker of item.markers) {
        test(`${item.name} / ${marker}`, async () => {
          await runTest(item.params, (kit, dataSource) => item.params.execute(kit, dataSource, marker))
        })
      }
    }
  }
})
