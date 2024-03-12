import { NavLink } from '@remix-run/react'
import clsx from 'clsx'
import { useState } from 'react'
import { Button } from '#app/components/ui/button.js'
import { Icon } from '#app/components/ui/icon.js'

export default function App() {
	const [isOpened, setIsOpened] = useState(false)

	return (
		<div>
			<div className="shadow-smooth flex border-b border-slate-200">
				<div className="flex min-w-[20ch] bg-white p-1">
					<Button
						onClick={() => setIsOpened(opened => !opened)}
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
					{/* 🐨 In `_app.tsx`, replace this with <Outlet /> */}
					{/* 🐨 In `_app.index.tsx` and `_app.issues.tsx`, delete everything except this */}
					<div className="grid h-full place-items-center py-20">
						<h1 className="text-5xl font-bold">
							{/* 🐨 In `_app.issues.tsx`, change this title to Issues */}
							Epic Issue Tracker
						</h1>
					</div>
				</div>
			</div>
		</div>
	)
}

function Sidebar({ className }: { className?: string }) {
	return (
		<div
			className={clsx([
				`shadow-smooth min-h-screen min-w-[20ch] flex-col gap-y-1 border-r border-slate-200  bg-white p-2`,
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
						: 'hover:bg-muted text-neutral-600 hover:text-neutral-900',
				)
			}
		>
			{children}
		</NavLink>
	)
}
