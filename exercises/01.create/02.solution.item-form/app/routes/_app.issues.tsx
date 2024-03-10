import { type ActionFunctionArgs } from '@remix-run/node'
import { Form } from '@remix-run/react'
import { Field } from '#app/components/forms.js'
import { Button } from '#app/components/ui/button.js'
import { redirectWithToast } from '#app/utils/toast.server.js'

export async function action({ request }: ActionFunctionArgs) {
	const formData = await request.formData()
	if (!formData.get('title')) {
		throw new Error('Title is required')
	}

	return redirectWithToast('/issues', {
		description: `Created issue ${formData.get('title')}`,
		type: 'success',
	})
}

export default function Issues() {
	return (
		<div className="mx-auto max-w-4xl p-4">
			<div>
				<Form method="POST">
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
