import { useSearchParams } from '@remix-run/react'
import {
	Pagination,
	PaginationContent,
	PaginationItem,
	PaginationLink,
	PaginationNext,
	PaginationPrevious,
} from '#app/components/ui/pagination.js'

export function PaginationBar({ total }: { total: number }) {
	const [searchParams] = useSearchParams()
	const skip = Number(searchParams.get('skip')) || 0
	const take = Number(searchParams.get('take')) || 10

	const totalPages = Math.ceil(total / take)
	const currentPage = Math.floor(skip / take) + 1

	const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1)

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
