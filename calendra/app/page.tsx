import { currentUser } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"

export default async function HomePage() {

    const user = await currentUser()
    // If no user is logged in , render the public landing page 

    if(!user) return <LandingPage/>

    return redirect('/events')

}
