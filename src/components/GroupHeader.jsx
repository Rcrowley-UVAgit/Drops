import { Flame, Users } from 'lucide-react'

export default function GroupHeader({ group, members = [] }) {
  return (
    <div className="bg-zinc-900 rounded-2xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-zinc-100">{group.name}</h2>
          <div className="flex items-center gap-3 mt-1">
            <span className="flex items-center gap-1 text-xs text-zinc-500">
              <Users size={12} />
              {members.length} members
            </span>
            {group.streak_count > 0 && (
              <span className="flex items-center gap-1 text-xs font-semibold text-amber-500">
                <Flame size={12} />
                {group.streak_count} day streak
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Cycle progress */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs text-zinc-500">
          <span>Cycle progress</span>
          <span>{group.cycle_index}/{group.cycle_order?.length || members.length}</span>
        </div>
        <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-amber-500 rounded-full transition-all duration-500"
            style={{ width: `${((group.cycle_index) / (group.cycle_order?.length || members.length || 1)) * 100}%` }}
          />
        </div>
      </div>

      {/* Member avatars */}
      <div className="flex -space-x-2">
        {members.map((member, i) => {
          const hasGone = i < (group.cycle_index || 0)
          const isCurrent = i === (group.cycle_index || 0)
          return (
            <div
              key={member.id}
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 border-zinc-900 ${
                isCurrent
                  ? 'bg-amber-500 text-zinc-900 ring-2 ring-amber-500/50'
                  : hasGone
                    ? 'bg-zinc-700 text-zinc-500'
                    : 'bg-zinc-800 text-zinc-300'
              }`}
              title={`${member.display_name}${isCurrent ? ' (today)' : hasGone ? ' (done)' : ''}`}
            >
              {member.display_name?.[0]?.toUpperCase()}
            </div>
          )
        })}
      </div>
    </div>
  )
}
