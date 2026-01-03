import { Avatar } from '@/Avatar'
import { getFallbackIconSizeByImageBaseSize } from '@/Avatar/helpers'
import { Icon } from '@/Icon'
import { avatarSizes } from '@/index'
import { box } from '@companix/utils-browser'
import { faCircleUser, faImage } from '@companix/icons-solid'

export const AvatarExample = () => {
  return (
    <div className="col-group">
      <div className="row-group">
        <Avatar size={64} src="https://avatars.githubusercontent.com/u/95082945?s=100" />
        <Avatar size={64} initials="PV" />
        <Avatar
          size={64}
          fallbackIcon={<Icon icon={faImage} style={box(getFallbackIconSizeByImageBaseSize(64))} />}
        />
      </div>
      <div style={{ height: '1px', background: '#eeeeee', margin: '12px 0px' }} />
      <div className="row-group"></div>
      <div className="flex flex-wrap items-center gap-8">
        {avatarSizes.map((size) => (
          <Avatar key={size} src="https://avatars.githubusercontent.com/u/95082945?s=100" size={size} />
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-8">
        {avatarSizes.map((size) => (
          <Avatar key={size} size={size} initials="PV" />
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-8">
        {avatarSizes.map((size) => (
          <Avatar
            key={size}
            size={size}
            fallbackIcon={
              <Icon icon={faCircleUser} style={box(getFallbackIconSizeByImageBaseSize(size))} />
            }
          />
        ))}
      </div>
    </div>
  )
}
