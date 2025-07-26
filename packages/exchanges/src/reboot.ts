import { BaseStream } from 'src/connections'
import { ExtractA, Info, List, StreamsManager } from 'src/stream-manager'
import { nonNullable } from '@troovi/utils-js'

type ExtractT<S> = S extends BaseStream<infer T> ? T : never

export const reboot = async <
  T extends BaseStream<M>,
  M extends StreamsManager = ExtractT<T>,
  L extends List = ExtractA<M>
>(
  stream: T,
  channels: string[],
  check: (item: Info<L>) => void | false
) => {
  const streams = channels.map((channel) => {
    const info = stream.streams.getStreamInfo(channel)

    if (check(info) === false) {
      return null
    }

    return info
  })

  for await (const info of streams.filter(nonNullable)) {
    await stream.reboot(info)
  }
}
