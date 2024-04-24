import { useForm, getInputProps } from '@conform-to/react'
import { getZodConstraint, parseWithZod } from '@conform-to/zod'
import { invariant } from '@epic-web/invariant'
import {
	json,
	type ActionFunctionArgs,
	type LoaderFunctionArgs,
} from '@remix-run/node'
import { Form, useLoaderData, useSearchParams } from '@remix-run/react'
import { z } from 'zod'
import { Field } from '#app/components/forms.js'
import { Button } from '#app/components/ui/button.js'
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '#app/components/ui/select.js'
import { prisma } from '#app/utils/db.server.js'
import { redirectWithToast } from '#app/utils/toast.server.js'
import {
	CreateIssueInlineForm,
	CreateIssueInlineSchema,
} from './CreateIssueInlineForm'
import { IssuesTable } from './IssuesTable'
import { PaginationBar, IssuePaginationSchema } from './PaginationBar'

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

const IssueFilterSchema = z.object({
	title: z.string().optional(),
	status: z.string().optional(),
	priority: z.string().optional(),
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
			priority: true,
			createdAt: true,
		},
		skip,
		take,
	})

	return json({
		total: await whenTotalIssues,
		issues,
	})
}

export default function Issues() {
	const { total, issues } = useLoaderData<typeof loader>()

	return (
		<div className="mx-auto max-w-4xl p-4">
			<IssueFilterBar />
			<IssuesTable issues={issues} />
			<PaginationBar total={total} />

			<div>
				<CreateIssueInlineForm />
			</div>
		</div>
	)
}

function IssueFilterBar() {
	const [searchParams] = useSearchParams()

	return (
		<div className="flex gap-x-2 px-0 py-2">
			<Form>
				<div className="flex items-end gap-x-2">
					<Field
						className="-mb-8"
						labelProps={{ children: 'Search by title' }}
						inputProps={{
							defaultValue: searchParams.get('title') || undefined,
						}}
					/>

					<Select defaultValue={searchParams.get('status') || undefined}>
						<SelectTrigger className="w-full">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							<SelectGroup>
								<SelectItem value="any">Any</SelectItem>
								{['todo', 'wip', 'done'].map(value => (
									<SelectItem key={value} value={value}>
										{value}
									</SelectItem>
								))}
							</SelectGroup>
						</SelectContent>
					</Select>

					<Select defaultValue={searchParams.get('priority') || undefined}>
						<SelectTrigger className="w-full">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							<SelectGroup>
								<SelectItem value="any">Any</SelectItem>
								{['low', 'medium', 'high'].map(value => (
									<SelectItem key={value} value={value}>
										{value}
									</SelectItem>
								))}
							</SelectGroup>
						</SelectContent>
					</Select>

					<Button type="submit">Filter</Button>
				</div>
			</Form>
		</div>
	)
}
