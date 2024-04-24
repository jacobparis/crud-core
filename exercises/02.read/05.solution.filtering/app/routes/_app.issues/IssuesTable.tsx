import { type Issue } from '@prisma/client'
import { type SerializeFrom } from '@remix-run/node'
import { useRequestInfo } from '#app/utils/request-info'

type IssueRow = Pick<
	SerializeFrom<Issue>,
	'id' | 'number' | 'title' | 'status' | 'priority' | 'createdAt'
>

export function IssuesTable({ issues }: { issues: Array<IssueRow> }) {
	const requestInfo = useRequestInfo()

	return (
		<div className="grid grid-cols-[min-content_1fr_min-content_min-content_min-content] text-sm">
			{issues.map(issue => (
				<div key={issue.id} className="col-span-5 grid grid-cols-subgrid">
					<div className="p-2 align-middle"> {issue.number} </div>
					<div className="p-2 align-middle font-medium">{issue.title}</div>
					<div className="p-2 align-middle">
						<span className="rounded-full border border-neutral-200/40 bg-neutral-100 px-2 py-1 text-xs text-neutral-600">
							{issue.status}
						</span>
					</div>
					<div className="p-2 align-middle">
						<span className="rounded-full border border-neutral-200/40 bg-neutral-100 px-2 py-1 text-xs text-neutral-600">
							{issue.priority}
						</span>
					</div>
					<div className="whitespace-nowrap p-2 text-right align-middle tabular-nums">
						{new Date(issue.createdAt).toLocaleDateString('en-US', {
							timeZone: requestInfo.hints.timeZone,
							year: 'numeric',
							month: 'short',
							day: '2-digit',
						})}
					</div>
				</div>
			))}
		</div>
	)
}
