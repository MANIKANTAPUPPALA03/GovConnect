export function Footer() {
  return (
    <footer className="border-t border-border bg-card mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4">About GovConnect</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              GovConnect provides AI-based guidance and is not affiliated with or a replacement for official government systems.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4">Disclaimer</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              This platform acts as a guidance layer only. Always verify information on official government portals before submitting applications.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4">Official Resources</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a
                  href="https://india.gov.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-primary transition-colors"
                >
                  India.gov.in
                </a>
              </li>
              <li>
                <a
                  href="https://services.india.gov.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-primary transition-colors"
                >
                  Government Services Portal
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-8 text-center">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} GovConnect. Not an official government portal.
          </p>
        </div>
      </div>
    </footer>
  )
}
