import { Skeleton } from '@/Skeleton'

export const SkeletonExample = () => {
  return (
    <div className="col-group">
      <div className="flex gap-24">
        <div
          className="p-12 rounded-lg bg-white"
          style={{ boxShadow: 'inset 0 0 0 0.5px rgba(0,0,0,0.12)' }}
        >
          <div className="flex items-center gap-12">
            <Skeleton width={36} height={36} borderRadius="50%" />
            <div className="flex flex-col gap-8">
              <Skeleton width={90} />
              <Skeleton width={120} />
            </div>
          </div>
          <div className="pt-12">
            <Skeleton width="100%" />
            <Skeleton width="100%" />
            <Skeleton width="75%" />
          </div>
        </div>
      </div>
    </div>
  )
}
