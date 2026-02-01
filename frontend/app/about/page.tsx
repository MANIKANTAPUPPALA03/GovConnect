import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { useLanguage } from '@/contexts/language-context'

export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background selection:bg-primary/20">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-20 md:py-32">
          {/* Background Decorative Elements */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-primary/80 to-teal-700 opacity-10" />
          <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-primary/20 blur-3xl" />
          <div className="absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-blue-600/20 blur-3xl" />

          <div className="container relative mx-auto px-4">
            <div className="mx-auto max-w-4xl text-center">
              <h1 className="mb-6 bg-gradient-to-r from-blue-700 to-teal-600 bg-clip-text text-4xl font-extrabold text-transparent md:text-5xl lg:text-6xl animate-in slide-in-from-bottom-4 duration-700">
                About GovConnect
              </h1>
              <p className="mx-auto max-w-2xl text-lg text-muted-foreground/90 md:text-xl animate-in slide-in-from-bottom-5 duration-700 delay-100">
                Revolutionizing how citizens interact with government services through intelligent, accessible, and inclusive AI guidance.
              </p>
            </div>
          </div>
        </section>

        {/* Mission Section */}
        <section className="relative py-20">
          <div className="container mx-auto px-4">
            <div className="relative mx-auto max-w-5xl rounded-3xl border border-white/20 bg-white/40 p-1 backdrop-blur-xl dark:bg-black/40 shadow-xl ring-1 ring-gray-900/5">
              <div className="rounded-[20px] bg-gradient-to-b from-white/50 to-white/20 p-8 dark:from-white/10 dark:to-white/5 md:p-12">
                <div className="text-center">
                  <h2 className="mb-6 text-3xl font-bold tracking-tight text-foreground md:text-4xl">Our Mission</h2>
                  <p className="mx-auto max-w-3xl text-lg leading-relaxed text-muted-foreground">
                    GovConnect is designed to simplify how citizens understand and interact with government services.
                    We provide intelligent guidance on schemes, forms, and complaints, helping you avoid common mistakes
                    and navigate complex processes with ease.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* What We Do */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="mb-16 text-center">
              <h2 className="mb-4 text-3xl font-bold text-foreground md:text-4xl">What We Do</h2>
              <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
                GovConnect acts as a guidance, preparation, and assistance layer for government services
              </p>
            </div>

            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 max-w-7xl mx-auto">
              {[
                {
                  title: "Discover Schemes",
                  desc: "Find relevant government schemes based on your situation using AI-powered search.",
                  color: "bg-blue-600",
                  icon: <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                },
                {
                  title: "Check Eligibility",
                  desc: "Understand eligibility criteria clearly and get instant feedback on your qualification status.",
                  color: "bg-teal-600",
                  icon: <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
                },
                {
                  title: "Form Assistance",
                  desc: "Get guidance on filling government forms correctly and avoid common rejection mistakes.",
                  color: "bg-amber-500",
                  icon: <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                },
                {
                  title: "Mistake Prevention",
                  desc: "Learn about common rejection reasons and how to avoid them before submitting applications.",
                  color: "bg-green-600",
                  icon: <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                },
                {
                  title: "Generate Complaints",
                  desc: "Create properly formatted complaints and grievances with AI-powered assistance.",
                  color: "bg-red-600",
                  icon: <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
                },
                {
                  title: "24/7 AI Assistance",
                  desc: "Get instant answers to your questions anytime with our intelligent AI chatbot.",
                  color: "bg-blue-600",
                  icon: <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 22l-.394-1.433a2.25 2.25 0 00-1.423-1.423L13.25 19l1.433-.394a2.25 2.25 0 001.423-1.423L16.5 16l.394 1.433a2.25 2.25 0 001.423 1.423L19.75 19l-1.433.394a2.25 2.25 0 00-1.423 1.423z" />
                }

              ].map((item, idx) => (
                <Card key={idx} className="group relative overflow-hidden border border-border/50 bg-background/50 backdrop-blur-sm transition-all hover:shadow-lg hover:-translate-y-1">
                  <div className={`absolute inset-0 opacity-0 transition-opacity group-hover:opacity-5 ${item.color.replace('bg-', 'bg-')}`} />
                  <CardHeader>
                    <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${item.color} text-white shadow-md mb-4`}>
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-6 w-6">
                        {item.icon}
                      </svg>
                    </div>
                    <CardTitle className="text-xl">{item.title}</CardTitle>
                    <CardDescription className="text-base leading-relaxed mt-2">
                      {item.desc}
                    </CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Important Notice */}
        <section className="py-20 bg-amber-50/50 dark:bg-amber-950/10">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-4xl">
              <Card className="border-l-4 border-l-amber-500 bg-background/80 shadow-lg backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center justify-center gap-3 text-2xl text-amber-600 dark:text-amber-500">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="currentColor"
                      className="h-7 w-7"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                      />
                    </svg>
                    Important Disclaimer
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="rounded-xl bg-amber-100/50 p-8 dark:bg-amber-900/20">
                    <p className="mb-6 text-center text-xl font-semibold text-foreground">
                      GovConnect is NOT an official government portal
                    </p>
                    <ul className="grid gap-4 text-muted-foreground sm:grid-cols-2">
                      <li className="flex items-start gap-3">
                        <span className="mt-1.5 h-2 w-2 rounded-full bg-amber-500 shrink-0" />
                        <span>AI-based guidance and assistance only</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="mt-1.5 h-2 w-2 rounded-full bg-amber-500 shrink-0" />
                        <span>Not affiliated with government agencies</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="mt-1.5 h-2 w-2 rounded-full bg-amber-500 shrink-0" />
                        <span>Submit applications on official portals</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="mt-1.5 h-2 w-2 rounded-full bg-amber-500 shrink-0" />
                        <span>Verify info on official sources</span>
                      </li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Core Values */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="mb-16 text-center">
              <h2 className="mb-4 text-3xl font-bold text-foreground md:text-4xl">Our Core Values</h2>
              <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
                The principles that guide everything we do
              </p>
            </div>

            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4 max-w-6xl mx-auto">
              {[
                { title: "Trustworthy", icon: "🤝", desc: "We provide accurate, reliable information you can depend on.", color: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400" },
                { title: "Simple", icon: "✨", desc: "Complex processes made easy through clear guidance.", color: "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400" },
                { title: "Accessible", icon: "♿", desc: "Designed for everyone, including first-time users.", color: "bg-teal-100 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400" },
                { title: "Empowering", icon: "💪", desc: "Helping citizens navigate services with confidence.", color: "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400" }
              ].map((item, idx) => (
                <Card key={idx} className="border-none bg-background shadow-none">
                  <CardHeader className="text-center">
                    <div className={`mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl text-3xl ${item.color}`}>
                      {item.icon}
                    </div>
                    <CardTitle className="mb-2">{item.title}</CardTitle>
                    <CardDescription className="text-base leading-relaxed">
                      {item.desc}
                    </CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
