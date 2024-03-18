import { parseWithZod } from '@conform-to/zod'
import {
	json,
	type ActionFunctionArgs,
	type LoaderFunctionArgs,
} from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import { prisma } from '#app/utils/db.server'
import { redirectWithToast } from '#app/utils/toast.server.js'
import {
	CreateIssueInlineForm,
	CreateIssueInlineSchema,
} from './CreateIssueInlineForm'
import {
	getRandomDate,
	getRandomStoryName,
	getRandomValue,
} from './CreateSampleIssuesDialog'

export async function action({ request }: ActionFunctionArgs) {
	const formData = await request.formData()
	const submission = parseWithZod(formData, {
		schema: CreateIssueInlineSchema,
	})

	const count = 1000
	const issues = Array.from({ length: count }, (_, i) => {
		const createdAt = getRandomDate()
		const updatedAt = getRandomDate(new Date(createdAt))

		return {
			project: 'EIT',
			number: null,
			title: getRandomStoryName(),
			description: 'This is a sample issue for development purposes',
			status: getRandomValue(['todo', 'in-progress', 'done']),
			priority: getRandomValue(['low', 'medium', 'high']),
			createdAt,
			updatedAt,
		}
	}).sort(
		(a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
	)

	await prisma.$transaction(async tx => {
		const highestId = await tx.issue.findFirst({
			where: {
				project: 'EIT',
			},
			orderBy: {
				number: 'desc',
			},
			select: {
				number: true,
			},
		})

		const baseNumber = highestId ? highestId.number + 1 : 1

		return Promise.all(
			issues.map((issue, i) => {
				return tx.issue.create({
					data: {
						...issue,
						number: baseNumber + i,
					},
				})
			}),
		)
	})

	return
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

export async function loader({ request }: LoaderFunctionArgs) {
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
		},
	})

	return json({
		issues,
	})
}

export default function Issues() {
	const { issues } = useLoaderData<typeof loader>()

	return (
		<div className="mx-auto max-w-4xl p-4">
			<div className="grid grid-cols-[min-content_1fr_min-content_min-content] text-sm">
				{issues.map(issue => (
					<div key={issue.id} className="col-span-4 grid grid-cols-subgrid">
						<div className="p-2 align-middle"> {issue.number} </div>
						<div className="p-2 align-middle font-medium">{issue.title}</div>
						<div className="p-2 align-middle">{issue.status}</div>
						<div className="p-2 align-middle">{issue.priority}</div>
					</div>
				))}
			</div>

			<div>
				{/*
				🧝‍♀️ Hi, I'm Kellie, your coworker!
				I put this form into its own component file along with the Zod schema
				You can option+click the <CreateIssueInlineForm> to open it in VS Code
				
				I also turned this file into a "Route Folder" (https://remix.run/docs/en/main/file-conventions/routes#folders-for-organization)
				so we can keep extra files, like the CreateIssueInlineForm, next to this one
				*/}
				<CreateIssueInlineForm />
			</div>
		</div>
	)
}
