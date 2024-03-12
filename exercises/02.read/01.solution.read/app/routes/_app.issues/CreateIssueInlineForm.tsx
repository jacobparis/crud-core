import { Form } from '@remix-run/react'
import { z } from 'zod'
import { Field } from '#app/components/forms.js'
import { Button } from '#app/components/ui/button.js'

export const CreateIssueInlineSchema = z.object({
	title: z.string().min(1),
})

export function CreateIssueInlineForm() {
	return (
		<Form method="POST" className="flex items-end gap-x-2">
			<Field
				labelProps={{ children: 'New issue' }}
				inputProps={{
					type: 'text',
					name: 'title',
					required: true,
				}}
				className="grow"
			/>

			<Button type="submit" className="mb-8">
				Create
			</Button>
		</Form>
	)
}
