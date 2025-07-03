import { Channel } from "../../../api/use-get-channel"
import { iconMap } from "../../../types"

interface Props {
  channel: Channel,
}

export const Header = ({channel}:Props) => {
  const Icon = iconMap[channel.type];

  return (
    <div className="bg-white border-b h-[49px] flex items-center px-4 overflow-hidden">
      <h1 className="flex gap-2 items-center text-2xl font-bold"><Icon className="flex-shrink-0 size-5 text-zinc-500 dark:text-zinc-400"/> {channel.name}</h1>
    </div>
  )
}