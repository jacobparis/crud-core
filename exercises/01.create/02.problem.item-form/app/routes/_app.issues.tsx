import { type ActionFunctionArgs } from '@remix-run/node'
import { Form } from '@remix-run/react'
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
				{/* 🐨 This form needs a method attribute  */}
				<Form>
					{/* 🐨 add a <Field> component named `title` */}
					{/* 🐨 add a submit <Button> */}
				</Form>
			</div>
		</div>
	)
}
