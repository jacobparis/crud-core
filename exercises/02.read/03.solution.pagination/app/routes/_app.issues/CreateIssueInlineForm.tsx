import { Form, useSubmit } from '@remix-run/react'
import { z } from 'zod'
import { Field } from '#app/components/forms.js'
import { Button } from '#app/components/ui/button.js'

export const CreateIssueInlineSchema = z.object({
	title: z.string().min(1),
})

export function CreateIssueInlineForm() {
	const submit = useSubmit()

	return (
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
			<div className="flex items-end gap-x-2">
				<Field
					labelProps={{ children: 'Title' }}
					inputProps={{
						type: 'text',
						name: 'title',
						required: true,
					}}
					className="grow"
				/>

				<Button type="submit" className="mb-8">
					Submit
				</Button>
			</div>
		</Form>
	)
}
