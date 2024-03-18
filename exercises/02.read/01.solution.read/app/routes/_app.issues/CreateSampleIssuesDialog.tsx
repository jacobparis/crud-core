import { z } from 'zod'

export const CreateSampleIssueSchema = z.object({
	intent: z.literal('create-sample-issues'),
})

export function getRandomStoryName() {
	const prefix = 'As'
	const agents = [
		'a user',
		'the idea guy',
		'a developer',
		'an admin',
		'a manager',
		'a customer',
		'a tester',
		'a designer',
		'a product owner',
		'an intern',
		'a barista',
	]
	const actions = [
		'I want to',
		'I need to',
		'I would like to',
		'I should',
		'I must',
		'I would love to',
	]
	const verbs = [
		'create',
		'read',
		'update',
		'delete',
		'edit',
		'view',
		'delete',
		'add',
		'remove',
		'change',
		'modify',
		'assign',
		'unassign',
		'filter',
		'sort',
		'search',
	]
	const nouns = [
		'the issues',
		'the projects',
		'the users',
		'the comments',
		'the tasks',
		'the labels',
		'the milestones',
		'the epics',
		'the groups',
		'the boards',
		'the sprints',
		'the releases',
		'the candidates',
		'the content',
	]
	const reasons = [
		'so that I can save time',
		'so that I can save money',
		"so that it's better for the environment",
		'so that we make more sales',
		'to make sure everything is correct',
		'so that someone will finally love me',
		'so that I know what to do',
		'so that I can be more organized',
		'so that I can see the state of the project',
		'so that I can find what I want',
		'in order to download them',
		'in order to delete them',
		'in order to test them',
	]

	return [
		prefix,
		getRandomValue(agents),
		getRandomValue(actions),
		getRandomValue(verbs),
		getRandomValue(nouns),
		getRandomValue(reasons),
	].join(' ')
}
export function getRandomValue<T>(array: ReadonlyArray<T>) {
	return array[Math.floor(Math.random() * array.length)]
}
export function getRandomDate(start: Date = new Date(2020, 0, 1)) {
	const end = new Date()

	return new Date(
		start.getTime() + Math.random() * (end.getTime() - start.getTime()),
	).toISOString()
}
