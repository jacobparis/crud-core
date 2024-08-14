import { NavLink, Outlet } from '@remix-run/react'
import clsx from 'clsx'
import { useState } from 'react'
import { Button } from '#app/components/ui/button.js'
import { Icon } from '#app/components/ui/icon.js'

export default function App() {
	const [isOpened, setIsOpened] = useState(false)

	return (
		<div>
			<div className="flex border-b border-slate-200 shadow-smooth">
				<div className="flex min-w-[20ch] bg-white p-1">
					<Button
						onClick={() => setIsOpened((opened) => !opened)}
						variant="ghost"
						size="icon"
						className="h-8 w-8"
					>
						<Icon name="hamburger-menu" size="sm" />
					</Button>
				</div>
				<div className="flex-grow bg-white p-1"></div>
			</div>
			<div className="flex">
				<Sidebar className="hidden xl:flex" />
				{isOpened ? <Sidebar className="flex xl:hidden" /> : null}
				<div className="grow">
					<Outlet />
				</div>
			</div>
		</div>
	)
}

function Sidebar({ className }: { className?: string }) {
	return (
		<div
			className={clsx([
				`min-h-screen min-w-[20ch] flex-col gap-y-1 border-r border-slate-200 bg-white p-2 shadow-smooth`,
				className,
			])}
		>
			<NavItem to="/">Home</NavItem>
			<NavItem to="/issues">Issues</NavItem>
		</div>
	)
}

function NavItem({ to, children }: { to: string; children: React.ReactNode }) {
	return (
		<NavLink
			to={to}
			className={({ isActive }) =>
				clsx(
					'block rounded-sm px-4 py-1 text-sm font-medium',
					isActive
						? 'bg-muted text-neutral-900'
						: 'text-neutral-600 hover:bg-muted hover:text-neutral-900',
				)
			}
		>
			{children}
		</NavLink>
	)
}
