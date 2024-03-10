import { NavLink, Outlet } from '@remix-run/react'
import clsx from 'clsx'

export default function App() {
	return (
		<div className="flex">
			<div className="flex min-h-screen min-w-[20ch] flex-col gap-y-1  border-r border-neutral-100 bg-white p-2">
				<NavItem to="/">Home</NavItem>
				<NavItem to="/issues">Issues</NavItem>
			</div>
			<div className="grow">
				<Outlet />
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
