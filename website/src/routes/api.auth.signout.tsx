import { redirect, type ActionFunctionArgs } from 'react-router'
import { getSupabaseWithHeaders } from '../lib/supabase.server'

export async function action({ request }: ActionFunctionArgs) {
    const { supabase, headers } = getSupabaseWithHeaders({ request })
    
    const { error } = await supabase.auth.signOut()
    
    if (error) {
        console.error('Sign out error:', error)
    }
    
    return redirect('/login', { headers })
}