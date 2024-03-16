import { parseWithZod } from '@conform-to/zod'
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
	// 🐨 Add params for "skip" and "take"
})

export async function loader({ request }: LoaderFunctionArgs) {
	const url = new URL(request.url)

	// 🐨 Similarly to the action above, use parseWithZod to validate url.searchParams

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
			priority: true,
			createdAt: true,
		},
		// 🐨 Use "skip" and "take" to grab a single page of data
	})

	// 🐨 Get the total number of issues and return it from the loader

	return json({
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
	const { issues } = useLoaderData<typeof loader>()

	return (
		<div className="mx-auto max-w-4xl p-4">
			<IssuesTable issues={issues} />
			🐨
			{/* <PaginationBar total={total} /> */}
			<div>
				<CreateIssueInlineForm />
			</div>
		</div>
	)
}
