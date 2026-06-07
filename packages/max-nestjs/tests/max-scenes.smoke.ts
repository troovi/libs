/**
 * Автономный smoke-тест движка сцен/wizard (без сети и Nest).
 * Запуск: npx ts-node scripts/max-scenes.smoke.ts
 *
 * Проверяет: session → Stage(attach/execute) → WizardScene с продвижением
 * курсора между апдейтами и выходом из сцены на последнем шаге.
 */
import { Composer } from '@maxhub/max-bot-api'
import { session, Stage, WizardScene } from '../src/scenes'

const log: string[] = []
const noop = () => Promise.resolve()

const scene = new WizardScene<any>(
  'demo',
  async (ctx) => {
    ctx.wizard.next()
    log.push('prompt-name')
  },
  async (ctx) => {
    log.push('name:' + ctx.message.body.text)
    ctx.wizard.next()
  },
  async (ctx) => {
    log.push('city:' + ctx.message.body.text)
    await ctx.scene.leave()
  }
)

const stage = new Stage<any>([scene])

const store = new Map<string, any>()
const sess = session<any>({
  store: {
    get: (key) => store.get(key),
    set: (key, value) => void store.set(key, value),
    delete: (key) => void store.delete(key)
  }
})

const enterTrigger = (ctx: any, next: any) =>
  ctx.__enter ? ctx.scene.enter('demo', { foo: 1 }) : next()

const full = Composer.compose<any>([
  sess,
  stage.attachMiddleware(),
  enterTrigger,
  stage.executeMiddleware()
])

const makeCtx = (update: { text?: string; __enter?: boolean }) =>
  ({
    user: { user_id: 1 },
    message: { sender: { user_id: 1 }, body: { text: update.text } },
    __enter: update.__enter
  } as any)

async function main() {
  await full(makeCtx({ __enter: true }), noop) // enter → step0 (prompt, cursor→1)
  const cursorAfterEnter = store.get('1')?.__scenes?.cursor

  await full(makeCtx({ text: 'Alice' }), noop) // step1 (cursor→2)
  await full(makeCtx({ text: 'Moscow' }), noop) // step2 → leave

  const finalScenes = store.get('1')?.__scenes

  const ok =
    cursorAfterEnter === 1 &&
    log.join(',') === 'prompt-name,name:Alice,city:Moscow' &&
    finalScenes?.current === undefined

  console.log('log:', log.join(' | '))
  console.log('cursor after enter:', cursorAfterEnter)
  console.log('final __scenes:', JSON.stringify(finalScenes))
  console.log(ok ? 'SMOKE PASS ✅' : 'SMOKE FAIL ❌')
  process.exit(ok ? 0 : 1)
}

void main()
