import Footer from "@/components/Footer"
import Header from "@/components/Header"
import Hero from "@/components/Hero"
import Course from "@/components/Course"
import About from "@/components/About"
import Contact from "@/components/Contact"
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'

export default async function HomePage() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data: todos } = await supabase.from('todos').select()

  return (
    <div className="min-h-screen bg-background">
      <Header/>
      <Hero/>
      <Course/>
      <About/>
      <Contact/>
      <Footer/>
    </div>
  )
}
