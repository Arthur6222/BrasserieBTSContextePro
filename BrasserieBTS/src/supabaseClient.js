import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://hzfzqkjlnarsplbvubli.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh6Znpxa2psbmFyc3BsYnZ1YmxpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU5ODA3MDQsImV4cCI6MjA5MTU1NjcwNH0.EMu_587TKPWP7QqbO13xTfwGOrtepixdh6gVOuL4LjQ'

export const supabase = createClient(supabaseUrl, supabaseKey)
