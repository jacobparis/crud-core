import { type Issue } from '@prisma/client'
import { type SerializeFrom } from '@remix-run/node'

// 🧝‍♀️ I took the Issue type straight from the Prisma schema
// and used `Pick` to select the columns the table uses
type IssueRow = Pick<
	// If you return `Issue` from a loader, you get `SerializeFrom<Issue>` in useLoaderData
	// That's how typescript knows that a Date gets turned into a string when it's sent to the client
	SerializeFrom<Issue>,
	'id' | 'number' | 'title' | 'status' | 'priority'
>

export function IssuesTable({ issues }: { issues: Array<IssueRow> }) {
	return (
		// 🐨 Add a new column to the layout by extending `grid-cols-[]` with another `min-content`
		<div className="grid grid-cols-[min-content_1fr_min-content_min-content] text-sm">
			{issues.map(issue => (
				// 🐨 Update col-span-4 to make this row span the new number of columns
				<div key={issue.id} className="col-span-4 grid grid-cols-subgrid">
					<div className="p-2 align-middle"> {issue.number} </div>
					<div className="p-2 align-middle font-medium">{issue.title}</div>
					<div className="p-2 align-middle">{issue.status}</div>
					<div className="p-2 align-middle">{issue.priority}</div>
				</div>
			))}
		</div>
	)
}
