import { parseWithZod } from '@conform-to/zod'
import { type ActionFunctionArgs } from '@remix-run/node'
import { Form, useSubmit } from '@remix-run/react'
import { z } from 'zod'
import { Field } from '#app/components/forms.js'
import { Button } from '#app/components/ui/button.js'
import { prisma } from '#app/utils/db.server.js'
import { redirectWithToast } from '#app/utils/toast.server.js'

const CreateIssueInlineSchema = z.object({
	title: z.string().min(1),
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

	return redirectWithToast('/issues', {
		description: `Created issue ${project}-${number}`,
		type: 'success',
	})
}

export default function Issues() {
	const submit = useSubmit()

	return (
		<div className="mx-auto max-w-4xl p-4">
			<div>
				<Form
					method="POST"
					onSubmit={event => {
						event.preventDefault()
						const form = event.currentTarget

						submit(event.currentTarget, {
							method: 'POST',
							navigate: false,
						})

						// Typescript thinks form.title is the <form title=""> attribute
						// but it's overridden by the input element with the name "title"
						const titleElement = form.title as unknown as HTMLInputElement
						titleElement.value = ''
					}}
				>
					<Field
						labelProps={{ children: 'Title' }}
						inputProps={{
							type: 'text',
							name: 'title',
							required: true,
						}}
					/>

					<Button type="submit">Submit</Button>
				</Form>
			</div>
		</div>
	)
}
