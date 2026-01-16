import { logout } from '@/app/auth/actions'

export default function LogoutButton() {
  return (
    <form action={logout}>
      <button 
        type="submit" 
        className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-semibold transition shadow"
      >
        Sign Out
      </button>
    </form>
  )
}