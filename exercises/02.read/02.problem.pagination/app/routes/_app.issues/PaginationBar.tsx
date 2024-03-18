import { useSearchParams } from '@remix-run/react'
import { z } from 'zod'
import {
	Pagination,
	PaginationContent,
	PaginationItem,
	PaginationLink,
	PaginationNext,
	PaginationPrevious,
} from '#app/components/ui/pagination.js'

export const IssuePaginationSchema = z.object({
	take: z.number().optional(),
	skip: z.number().optional(),
})

export function PaginationBar({ total }: { total: number }) {
	const [searchParams] = useSearchParams()
	const skip = Number(searchParams.get('skip')) || 0
	const take = Number(searchParams.get('take')) || 10

	const totalPages = Math.ceil(total / take)
	const currentPage = Math.floor(skip / take) + 1

	const maxPages = 7
	const halfMaxPages = Math.floor(maxPages / 2)

	const pageNumbers = [] as Array<number>
	if (totalPages <= maxPages) {
		for (let i = 1; i <= totalPages; i++) {
			pageNumbers.push(i)
		}
	} else {
		let startPage = currentPage - halfMaxPages
		let endPage = currentPage + halfMaxPages
		if (startPage < 1) {
			endPage += Math.abs(startPage) + 1
			startPage = 1
		}
		if (endPage > totalPages) {
			startPage -= endPage - totalPages
			endPage = totalPages
		}
		for (let i = startPage; i <= endPage; i++) {
			pageNumbers.push(i)
		}
	}

	return (
		<Pagination>
			<PaginationContent>
				<PaginationItem>
					<PaginationPrevious
						href={`?skip=${Math.max(skip - take, 0)}&take=${take}`}
					/>
				</PaginationItem>

				{pageNumbers.map(pageNumber => (
					<PaginationItem key={pageNumber}>
						<PaginationLink
							isActive={pageNumber === currentPage}
							href={`?skip=${(pageNumber - 1) * take}&take=${take}`}
						>
							{pageNumber}
						</PaginationLink>
					</PaginationItem>
				))}

				<PaginationItem>
					<PaginationNext href={`?skip=${skip + take}&take=${take}`} />
				</PaginationItem>
			</PaginationContent>
		</Pagination>
	)
}
