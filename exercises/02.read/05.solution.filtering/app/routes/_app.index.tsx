import {
	type ActionFunctionArgs,
	json,
	type LoaderFunctionArgs,
	type MetaFunction,
} from '@remix-run/node'

export default function App() {
	return (
		<div className="grid h-full place-items-center py-20">
			<h1 className="text-5xl font-bold">Epic Issue Tracker</h1>
		</div>
	)
}

export async function action({ request }: ActionFunctionArgs) {
	return json({})
}

export async function loader({ request }: LoaderFunctionArgs) {
	return json({})
}

export const meta: MetaFunction<typeof loader> = ({ data }) => [
	{
		title: 'Title',
	},
]
