import Link from "next/link";
import { Printer, Github, Twitter, Linkedin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-slate-50 border-t border-slate-200 pt-16 pb-8">
      <div className="max-w-6xl mx-auto px-6">
        
        {/* Top Section: Grid Layout */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          
          {/* Column 1: Brand & Mission */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="bg-blue-600 p-1.5 rounded-lg">
                <Printer className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl text-slate-900">Printfy</span>
            </Link>
            <p className="text-slate-500 text-sm leading-relaxed mb-6">
              Saving engineering students from long queues and loose change. The smart way to print.
            </p>
            <div className="flex gap-4">
              <SocialLink href="#" icon={<Github className="w-4 h-4" />} />
              <SocialLink href="#" icon={<Twitter className="w-4 h-4" />} />
              <SocialLink href="#" icon={<Linkedin className="w-4 h-4" />} />
            </div>
          </div>

          {/* Column 2: Product */}
          <div>
            <h4 className="font-bold text-slate-900 mb-4">Product</h4>
            <ul className="space-y-3 text-sm text-slate-600">
              <FooterLink href="/upload">Upload Document</FooterLink>
              <FooterLink href="/shops">Find Shops</FooterLink>
              <FooterLink href="/pricing">Student Pricing</FooterLink>
              <FooterLink href="/track">Track Order</FooterLink>
            </ul>
          </div>

          {/* Column 3: Resources */}
          <div>
            <h4 className="font-bold text-slate-900 mb-4">Resources</h4>
            <ul className="space-y-3 text-sm text-slate-600">
              <FooterLink href="/help">Help Center</FooterLink>
              <FooterLink href="/shops/register">Shop Partner Login</FooterLink>
              <FooterLink href="/status">System Status</FooterLink>
              <FooterLink href="/blog">Engineering Blog</FooterLink>
            </ul>
          </div>

          {/* Column 4: Legal */}
          <div>
            <h4 className="font-bold text-slate-900 mb-4">Legal</h4>
            <ul className="space-y-3 text-sm text-slate-600">
              <FooterLink href="/privacy">Privacy Policy</FooterLink>
              <FooterLink href="/terms">Terms of Service</FooterLink>
              <FooterLink href="/refund">Refund Policy</FooterLink>
              <FooterLink href="/contact">Contact Support</FooterLink>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px w-full bg-slate-200 mb-8" />

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-500">
          <p>&copy; {new Date().getFullYear()} Printify Technologies. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

// Helper Components for clean code
function FooterLink({ href, children }: { href: string, children: React.ReactNode }) {
  return (
    <li>
      <Link href={href} className="hover:text-blue-600 transition-colors">
        {children}
      </Link>
    </li>
  );
}

function SocialLink({ href, icon }: { href: string, icon: React.ReactNode }) {
  return (
    <Link 
      href={href} 
      className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-200 text-slate-600 hover:bg-blue-600 hover:text-white transition-all"
    >
      {icon}
    </Link>
  );
}