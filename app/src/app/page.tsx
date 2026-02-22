import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  CheckCircle2,
  Zap,
  Shield,
  TrendingDown,
  Clock,
  Users,
  ArrowRight,
  Sparkles
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Navigation */}
      <nav className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-indigo-600" />
              <span className="text-2xl font-bold text-slate-900">Reqflow</span>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="ghost">Sign In</Button>
              <Button>Get Started</Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-20 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <Badge className="mb-4" variant="secondary">
              For companies with 50-500 employees
            </Badge>
            <h1 className="text-5xl font-bold tracking-tight text-slate-900 sm:text-6xl mb-6">
              Every purchase.
              <br />
              <span className="text-indigo-600">One front door.</span>
            </h1>
            <p className="text-xl text-slate-600 mb-8 leading-relaxed">
              The AI-native procurement platform for companies that don't have (and don't want) a procurement team.
              Turn chaotic buying into a governed, fast, trackable process.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <div className="flex gap-2 w-full sm:w-auto">
                <Input
                  type="email"
                  placeholder="your@company.com"
                  className="w-full sm:w-64"
                />
                <Button size="lg" className="whitespace-nowrap">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
            <p className="text-sm text-slate-500 mt-4">
              14-day free trial • No credit card required • 5-minute setup
            </p>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="py-12 bg-indigo-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center text-white">
            <div>
              <div className="text-4xl font-bold">90%+</div>
              <div className="text-indigo-200 mt-1">Request adoption</div>
            </div>
            <div>
              <div className="text-4xl font-bold">&lt;4hr</div>
              <div className="text-indigo-200 mt-1">Median approval time</div>
            </div>
            <div>
              <div className="text-4xl font-bold">80%</div>
              <div className="text-indigo-200 mt-1">Time saved on procurement</div>
            </div>
            <div>
              <div className="text-4xl font-bold">€0</div>
              <div className="text-indigo-200 mt-1">Infrastructure cost (MVP)</div>
            </div>
          </div>
        </div>
      </section>

      {/* The Problem */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              You're spending 30% of your time on procurement tasks
              <br />
              you were never hired to do
            </h2>
            <p className="text-lg text-slate-600">
              Scattered Slack messages. Email chains. The CFO finding out about subscriptions on the credit card statement.
              There's no front door for purchase requests.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-6">
              <div className="text-red-600 mb-4">
                <TrendingDown className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold mb-2">40-60% Maverick Spend</h3>
              <p className="text-slate-600">
                Purchases happening off-policy because there is no policy engine to enforce rules.
              </p>
            </Card>
            <Card className="p-6">
              <div className="text-red-600 mb-4">
                <Clock className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold mb-2">11.4 Days Average</h3>
              <p className="text-slate-600">
                From "I need this" to "I have this" for a simple $500/month SaaS tool.
              </p>
            </Card>
            <Card className="p-6">
              <div className="text-red-600 mb-4">
                <Users className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold mb-2">8.3 Hours/Week Lost</h3>
              <p className="text-slate-600">
                Finance team members waste on manual procurement tasks instead of strategic work.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              From request to approval in minutes, not days
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Reqflow becomes your single front door for every purchase request. AI handles the busywork. You stay in control.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="bg-indigo-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-indigo-600">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Submit via Slack</h3>
              <p className="text-slate-600">
                Type <code className="bg-slate-100 px-2 py-1 rounded">/reqflow buy</code> and fill a 2-minute adaptive form. AI categorizes and checks for duplicates automatically.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-indigo-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-indigo-600">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Smart Routing</h3>
              <p className="text-slate-600">
                Request routes to the right approvers based on amount, category, and department. Budget checked in real-time.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-indigo-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-indigo-600">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Approve & Track</h3>
              <p className="text-slate-600">
                Approvers get push notifications with full context. One-click approve from mobile. Full audit trail automatically.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Key Features */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              Everything you need. Nothing you don't.
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">Smart Intake</h3>
                <p className="text-slate-600">
                  Adaptive forms that change based on what's being requested. AI categorizes and detects duplicates.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">Approval Workflows</h3>
                <p className="text-slate-600">
                  Configurable routing with smart delegation and auto-escalation when approvals stall.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">Budget Guardrails</h3>
                <p className="text-slate-600">
                  Real-time budget tracking with soft warnings (80%) and hard stops (100%). Prevent overspending before it happens.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">Accounting Sync</h3>
                <p className="text-slate-600">
                  Push POs, invoices, and payments to QuickBooks/Xero. CSV export fallback for any system.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">Audit Trail</h3>
                <p className="text-slate-600">
                  Every action logged automatically. SOC 2 ready from day one. Append-only tables prevent tampering.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">Mobile Approvals</h3>
                <p className="text-slate-600">
                  Push notifications with full context. Approve from your phone in 30 seconds. Never block a purchase again.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Preview */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              Simple pricing. Unlimited users.
            </h2>
            <p className="text-lg text-slate-600">
              Charge based on company size, not seat count. Everyone should be able to submit requests.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card className="p-8 border-2">
              <div className="mb-4">
                <h3 className="text-xl font-semibold">Starter</h3>
                <p className="text-slate-600 text-sm">20-75 employees</p>
              </div>
              <div className="mb-6">
                <span className="text-4xl font-bold">€399</span>
                <span className="text-slate-600">/month</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm">100 requests/month</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm">3 approval workflows</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm">Slack + 1 accounting integration</span>
                </li>
              </ul>
              <Button className="w-full" variant="outline">Start Trial</Button>
            </Card>

            <Card className="p-8 border-2 border-indigo-600 relative">
              <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
                Most Popular
              </Badge>
              <div className="mb-4">
                <h3 className="text-xl font-semibold">Growth</h3>
                <p className="text-slate-600 text-sm">75-250 employees</p>
              </div>
              <div className="mb-6">
                <span className="text-4xl font-bold">€899</span>
                <span className="text-slate-600">/month</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm">500 requests/month</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm">Unlimited workflows</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm">All integrations + AI copilot</span>
                </li>
              </ul>
              <Button className="w-full">Start Trial</Button>
            </Card>

            <Card className="p-8 border-2">
              <div className="mb-4">
                <h3 className="text-xl font-semibold">Scale</h3>
                <p className="text-slate-600 text-sm">250-500 employees</p>
              </div>
              <div className="mb-6">
                <span className="text-4xl font-bold">€1,799</span>
                <span className="text-slate-600">/month</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm">Unlimited requests</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm">Dedicated CSM</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm">SSO/SAML + custom models</span>
                </li>
              </ul>
              <Button className="w-full" variant="outline">Contact Sales</Button>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-indigo-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-6">
            Ready to turn chaos into control?
          </h2>
          <p className="text-xl text-indigo-100 mb-8">
            Join companies that have reclaimed 8+ hours per week with Reqflow.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Input
              type="email"
              placeholder="your@company.com"
              className="w-full sm:w-80 bg-white text-slate-900"
            />
            <Button size="lg" variant="secondary" className="whitespace-nowrap">
              Start Free Trial
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
          <p className="text-sm text-indigo-200 mt-4">
            14-day trial • No credit card • Live in 5 minutes
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="h-5 w-5 text-indigo-400" />
                <span className="text-lg font-bold text-white">Reqflow</span>
              </div>
              <p className="text-sm">
                The procurement front door for companies that don't have procurement.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white">Features</a></li>
                <li><a href="#" className="hover:text-white">Pricing</a></li>
                <li><a href="#" className="hover:text-white">Integrations</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white">About</a></li>
                <li><a href="#" className="hover:text-white">Blog</a></li>
                <li><a href="#" className="hover:text-white">Careers</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white">Privacy</a></li>
                <li><a href="#" className="hover:text-white">Terms</a></li>
                <li><a href="#" className="hover:text-white">Security</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 mt-12 pt-8 text-sm text-center">
            © 2026 Reqflow. Built with €0 infrastructure cost.
          </div>
        </div>
      </footer>
    </div>
  );
}
