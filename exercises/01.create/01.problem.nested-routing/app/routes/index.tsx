import { NavLink } from '@remix-run/react'
import clsx from 'clsx'

export default function App() {
	return (
		<div className="flex">
			<div className="flex min-h-screen min-w-[20ch] flex-col gap-y-1  border-r border-neutral-100 bg-white p-2">
				<NavItem to="/">Home</NavItem>
				<NavItem to="/issues">Issues</NavItem>
			</div>
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
