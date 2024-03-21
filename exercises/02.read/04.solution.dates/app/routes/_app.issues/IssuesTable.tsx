import { type Issue } from '@prisma/client'
import { type SerializeFrom } from '@remix-run/node'
import { useRequestInfo } from '#app/utils/request-info'

// 🧝‍♀️ I took the Issue type straight from the Prisma schema
// and used `Pick` to select the columns the table uses
type IssueRow = Pick<
	// If you return `Issue` from a loader, you get `SerializeFrom<Issue>` in useLoaderData
	// That's how typescript knows that a Date gets turned into a string when it's sent to the client
	SerializeFrom<Issue>,
	'id' | 'number' | 'title' | 'status' | 'createdAt'
>

export function IssuesTable({ issues }: { issues: Array<IssueRow> }) {
	const requestInfo = useRequestInfo()

	return (
		<div className="grid grid-cols-[min-content_1fr_min-content_min-content] text-sm">
			{issues.map(issue => (
				<div key={issue.id} className="col-span-4 grid grid-cols-subgrid">
					<div className="p-2 align-middle"> {issue.number} </div>
					<div className="p-2 align-middle font-medium">{issue.title}</div>
					<div className="p-2 align-middle">{issue.status}</div>
					<div className="whitespace-nowrap p-2 align-middle">
						{new Date(issue.createdAt).toLocaleDateString('en-US', {
							timeZone: requestInfo.hints.timeZone,
							month: 'short',
							day: 'numeric',
							hour: 'numeric',
						})}
					</div>
				</div>
			))}
		</div>
	)
}
