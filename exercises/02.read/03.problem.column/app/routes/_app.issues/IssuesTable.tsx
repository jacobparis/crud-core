import { type Issue } from '@prisma/client'
import { type SerializeFrom } from '@remix-run/node'

type IssueRow = Pick<SerializeFrom<Issue>, 'id' | 'number' | 'title' | 'status'>

export function IssuesTable({ issues }: { issues: Array<IssueRow> }) {
	return (
		// 🐨 Add a new column to the layout by extending `grid-cols-[]` with another `min-content`
		<div className="grid grid-cols-[min-content_1fr_min-content] text-sm">
			{issues.map(issue => (
				// 🐨 Update col-span-3 to make this row span the new number of columns
				<div key={issue.id} className="col-span-3 grid grid-cols-subgrid">
					<div className="p-2 align-middle"> {issue.number} </div>
					<div className="p-2 align-middle font-medium">{issue.title}</div>
					<div className="p-2 align-middle">
						<span className="rounded-full border border-neutral-200/40 bg-neutral-100 px-2 py-1 text-xs text-neutral-600">
							{issue.status}
						</span>
					</div>
				</div>
			))}
		</div>
	)
}
