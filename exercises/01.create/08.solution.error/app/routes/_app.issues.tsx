import { getFormProps, getInputProps, useForm } from '@conform-to/react'
import { getZodConstraint, parseWithZod } from '@conform-to/zod'
import {
	json,
	type LoaderFunctionArgs,
	type ActionFunctionArgs,
} from '@remix-run/node'
import { Form, useActionData, useLoaderData, useSubmit } from '@remix-run/react'
import { z } from 'zod'
import { Field } from '#app/components/forms.js'
import { Button } from '#app/components/ui/button.js'
import { prisma } from '#app/utils/db.server.js'
import { createToastHeaders } from '#app/utils/toast.server.js'

const CreateIssueInlineSchema = z.object({
	title: z.string().min(3, 'Your title must be at least 3 characters'),
})

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

	return json(
		{ result: submission.reply({ resetForm: true }) },
		{
			status: 201,
			headers: await createToastHeaders({
				description: `Created issue ${project}-${number}`,
				type: 'success',
			}),
		},
	)
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
		},
	})

	return json({
		issues,
	})
}

export default function Issues() {
	const actionData = useActionData<typeof action>()
	const { issues } = useLoaderData<typeof loader>()
	const submit = useSubmit()

	const [form, fields] = useForm({
		id: 'create-issue-inline',
		// Adds required, min, etc props to the fields based on the schema
		constraint: getZodConstraint(CreateIssueInlineSchema),
		// Tells conform about any errors we've had
		lastResult: actionData?.result,
		onValidate({ formData }) {
			return parseWithZod(formData, { schema: CreateIssueInlineSchema })
		},

		onSubmit(event) {
			event.preventDefault()
			const form = event.currentTarget as HTMLFormElement

			submit(form, {
				navigate: false,
				unstable_flushSync: true,
			})

			// scroll to bottom of page
			window.scrollTo(0, document.body.scrollHeight)

			// reset title input
			const titleInput = form['title'] as unknown as HTMLInputElement
			titleInput.value = ''
		},
	})

	return (
		<div className="mx-auto max-w-4xl p-4">
			<div className="grid grid-cols-[min-content_1fr_min-content] text-sm">
				{issues.map(issue => (
					<div key={issue.id} className="col-span-3 grid grid-cols-subgrid">
						<div className="p-2 align-middle"> {issue.number} </div>
						<div className="p-2 align-middle font-medium">{issue.title}</div>
						<div className="p-2 align-middle">{issue.status}</div>
					</div>
				))}
			</div>

			<div>
				<Form method="POST" {...getFormProps(form)}>
					<Field
						labelProps={{ children: 'New issue' }}
						inputProps={getInputProps(fields.title, { type: 'text' })}
						errors={fields.title.errors}
					/>

					<Button type="submit">Submit</Button>
				</Form>
			</div>
		</div>
	)
}
