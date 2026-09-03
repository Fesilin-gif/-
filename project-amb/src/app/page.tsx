import { About } from '@/components/About'
import { Contacts } from '@/components/Contacts'
import { Header } from '@/components/Header'
import { Hero } from '@/components/Hero'
import { Projects } from '@/components/Projects'
import { Services } from '@/components/Services'

export default function Page() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <Projects />
        <About />
        <Services />
        <Contacts />
      </main>
    </>
  )
}
