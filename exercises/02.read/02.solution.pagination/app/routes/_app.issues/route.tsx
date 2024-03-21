import { parseWithZod } from '@conform-to/zod'
import { invariant } from '@epic-web/invariant'
import {
	json,
	type ActionFunctionArgs,
	type LoaderFunctionArgs,
} from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import { z } from 'zod'
import { prisma } from '#app/utils/db.server.js'
import { redirectWithToast } from '#app/utils/toast.server.js'
import {
	CreateIssueInlineForm,
	CreateIssueInlineSchema,
} from './CreateIssueInlineForm'
import { IssuesTable } from './IssuesTable'
import { PaginationBar } from './PaginationBar'

export async function action({ request }: ActionFunctionArgs) {
	const formData = await request.formData()
	const submission = parseWithZod(formData, {
		schema: CreateIssueInlineSchema,
	})

	if (submission.status !== 'success') {
		throw new Error('Title is required')
	}

	const project = 'EIT'
	const number = await prisma.issue.count()
	await prisma.issue.create({
		data: {
			project,
			number,
			title: submission.value.title,
			description: '',
			status: 'todo',
			priority: 'medium',
		},
	})

	return redirectWithToast('/issues', {
		description: `Created issue ${project}-${number}`,
		type: 'success',
	})
}

const IssuePaginationSchema = z.object({
	take: z.number().optional(),
	skip: z.number().optional(),
})

export async function loader({ request }: LoaderFunctionArgs) {
	const url = new URL(request.url)

	const submission = parseWithZod(url.searchParams, {
		schema: IssuePaginationSchema,
	})
	invariant(submission.status === 'success', 'Invalid query parameters')

	const { skip = 0, take = 10 } = submission.value

	const whenTotalIssues = prisma.issue.count()
	const issues = await prisma.issue.findMany({
		orderBy: {
			createdAt: 'desc',
		},
		select: {
			id: true,
			project: true,
			number: true,
			title: true,
			status: true,
			createdAt: true,
		},
		skip,
		take,
	})

	return json({
		total: await whenTotalIssues,
		issues: issues.map(issue => ({
			...issue,
			createdAt: issue.createdAt.toLocaleDateString('en-US', {
				month: 'short',
				day: 'numeric',
				hour: 'numeric',
			}),
		})),
	})
}

export default function Issues() {
	const { total, issues } = useLoaderData<typeof loader>()

	return (
		<div className="mx-auto max-w-4xl p-4">
			<IssuesTable issues={issues} />
			<PaginationBar total={total} />

			<div>
				<CreateIssueInlineForm />
			</div>
		</div>
	)
}
