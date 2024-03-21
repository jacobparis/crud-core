import { type Issue } from '@prisma/client'
import { type SerializeFrom } from '@remix-run/node'

type IssueRow = Pick<
	// If you return `Issue` from a loader, you get `SerializeFrom<Issue>` in useLoaderData
	// That's how typescript knows that a Date gets turned into a string when it's sent to the client
	SerializeFrom<Issue>,
	'id' | 'number' | 'title' | 'status' | 'priority'
>

export function IssuesTable({ issues }: { issues: Array<IssueRow> }) {
	return (
		<div className="grid grid-cols-[min-content_1fr_min-content_min-content] text-sm">
			{issues.map(issue => (
				<div key={issue.id} className="col-span-4 grid grid-cols-subgrid">
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
				</div>
			))}
		</div>
	)
}
