import { Inject, Injectable, OnModuleInit } from '@nestjs/common'
import { ModuleRef, ModulesContainer } from '@nestjs/core'
import { InstanceWrapper } from '@nestjs/core/injector/instance-wrapper'
import { Module } from '@nestjs/core/injector/module'
import { MetadataScanner } from '@nestjs/core/metadata-scanner'
import { ExternalContextCreator } from '@nestjs/core/helpers/external-context-creator'
import { Bot, Composer, Context } from '@maxhub/max-bot-api'
import { BaseScene, Stage, WizardScene } from '../scenes'
import { MetadataAccessorService } from './metadata-accessor.service'
import { BaseExplorerService } from './base-explorer.service'
import { MaxParamsFactory } from '../params.factory'
import { MAX_BOT_NAME, MAX_MODULE_OPTIONS, MAX_STAGE, PARAM_ARGS_METADATA } from '../constants'
import { ListenerMetadata, MaxModuleOptions } from '../interfaces'

@Injectable()
export class ListenersExplorerService extends BaseExplorerService implements OnModuleInit {
  private readonly paramsFactory = new MaxParamsFactory()
  private bot!: Bot<Context>

  constructor(
    @Inject(MAX_STAGE) private readonly stage: Stage,
    @Inject(MAX_MODULE_OPTIONS) private readonly options: MaxModuleOptions,
    @Inject(MAX_BOT_NAME) private readonly botName: string,
    private readonly moduleRef: ModuleRef,
    private readonly metadataAccessor: MetadataAccessorService,
    private readonly metadataScanner: MetadataScanner,
    private readonly modulesContainer: ModulesContainer,
    private readonly externalContextCreator: ExternalContextCreator
  ) {
    super()
  }

  onModuleInit(): void {
    this.bot = this.moduleRef.get<Bot<Context>>(this.botName, { strict: false })

    // session middleware уже применён в фабрике бота. Порядок здесь:
    // attach(ctx.scene) → @Update-обработчики (команды) → execute(сцены).
    this.bot.use(this.stage.attachMiddleware())
    this.explore()
    this.exploreUpdates()
    this.bot.use(this.stage.executeMiddleware())
  }

  private explore(): void {
    const modules = this.getModules(this.modulesContainer, this.options.include || [])
    this.registerComposers(modules)
    this.registerScenes(modules)
  }

  private exploreUpdates(): void {
    const modules = this.getModules(this.modulesContainer, this.options.include || [])
    const updates = this.flatMap(modules, (wrapper) => this.filterUpdates(wrapper))
    updates.forEach((wrapper) => this.registerListeners(this.bot, wrapper))
  }

  private registerComposers(modules: Module[]): void {
    const composers = this.flatMap(modules, (wrapper) => this.filterComposers(wrapper))
    composers.forEach((wrapper) => {
      const composer = new Composer()
      this.registerListeners(composer, wrapper)
      this.stage.use(composer)
    })
  }

  private registerScenes(modules: Module[]): void {
    const scenes = this.flatMap(modules, (wrapper) => this.filterScenes(wrapper))
    const sceneIds = new Set<string>()

    scenes.forEach((wrapper) => {
      const metadata = this.metadataAccessor.getSceneMetadata(wrapper.instance.constructor)
      if (!metadata) return

      const { sceneId, type, options } = metadata
      if (sceneIds.has(sceneId)) {
        throw new Error(`max-bot-nestjs: two scenes with the same id "${sceneId}"`)
      }
      sceneIds.add(sceneId)

      if (type === 'base') {
        const scene = new BaseScene<Context>(sceneId, options)
        this.stage.register(scene)
        this.registerListeners(scene, wrapper)
      } else {
        // Wizard создаётся без шагов; шаги проставляются из @WizardStep ниже.
        const scene = options ? new WizardScene(sceneId, options) : new WizardScene(sceneId)
        this.stage.register(scene as unknown as BaseScene<Context>)
        this.registerWizardListeners(scene, wrapper)
      }
    })
  }

  private filterUpdates(wrapper: InstanceWrapper): InstanceWrapper | undefined {
    return wrapper.instance && this.metadataAccessor.isUpdate(wrapper.metatype as Function)
      ? wrapper
      : undefined
  }

  private filterComposers(wrapper: InstanceWrapper): InstanceWrapper | undefined {
    return wrapper.instance && this.metadataAccessor.isComposer(wrapper.metatype as Function)
      ? wrapper
      : undefined
  }

  private filterScenes(wrapper: InstanceWrapper): InstanceWrapper | undefined {
    return wrapper.instance && this.metadataAccessor.isScene(wrapper.metatype as Function)
      ? wrapper
      : undefined
  }

  private registerListeners(composer: Composer<any>, wrapper: InstanceWrapper): void {
    const { instance } = wrapper
    const prototype = Object.getPrototypeOf(instance)
    this.metadataScanner
      .getAllMethodNames(prototype)
      .forEach((name) => this.registerIfListener(composer, instance, prototype, name))
  }

  private registerWizardListeners(wizard: WizardScene, wrapper: InstanceWrapper): void {
    const { instance } = wrapper
    const prototype = Object.getPrototypeOf(instance)

    const wizardSteps: { step: number; methodName: string }[] = []
    const basicListeners: string[] = []

    this.metadataScanner.getAllMethodNames(prototype).forEach((methodName) => {
      const metadata = this.metadataAccessor.getWizardStepMetadata(prototype[methodName])
      if (!metadata) {
        basicListeners.push(methodName)
        return
      }
      wizardSteps.push({ step: metadata.step, methodName })
    })

    for (const methodName of basicListeners) {
      this.registerIfListener(wizard, instance, prototype, methodName)
    }

    const grouped = wizardSteps
      .sort((a, b) => a.step - b.step)
      .reduce<Record<number, { step: number; methodName: string }[]>>((acc, cur) => {
        ;(acc[cur.step] ??= []).push(cur)
        return acc
      }, {})

    wizard.steps = Object.values(grouped).map((stepsMetadata) => {
      const composer = new Composer()
      stepsMetadata.forEach((stepMethod) => {
        this.registerIfListener(composer, instance, prototype, stepMethod.methodName, [
          { method: 'use', args: [] }
        ])
      })
      return composer.middleware()
    })
  }

  private registerIfListener(
    composer: Composer<any>,
    instance: object,
    prototype: object,
    methodName: string,
    defaultMetadata?: ListenerMetadata[]
  ): void {
    const methodRef = (prototype as Record<string, unknown>)[methodName] as Function
    const metadata = this.metadataAccessor.getListenerMetadata(methodRef) || defaultMetadata
    if (!metadata || metadata.length < 1) {
      return
    }

    const handler = this.createContextCallback(instance, prototype, methodName)
    const target = composer as unknown as Record<string, (...a: unknown[]) => unknown>

    for (const { method, args } of metadata) {
      target[method](...args, async (ctx: Context, next: () => Promise<void>) => {
        const result = await handler(ctx, next)
        if (result) {
          await ctx.reply(String(result))
        }
      })
    }
  }

  private createContextCallback(instance: object, prototype: object, methodName: string) {
    return this.externalContextCreator.create(
      instance,
      (prototype as Record<string, (...a: unknown[]) => unknown>)[methodName],
      methodName,
      PARAM_ARGS_METADATA,
      this.paramsFactory,
      undefined,
      undefined,
      undefined,
      'max'
    )
  }
}
